#!/usr/bin/env python3
"""The Performance check, ported from Ashfall's (docs/performance.md). Run
from the repository root by .github/workflows/performance.yml, which runs it
only when index.html changed. Exits 1 on a failure.

It opens the game's benchmark page (index.html?bench, CHECKS in the game) in
headless Chromium at a phone's size, PAGE_LOADS times for the pull request's
head and as many for its base, interleaved, so a runner that slows part-way
through slows both sides. Each load plays the benchmark's fixed scenarios
and leaves its result on window.switchingBenchResults. Each timing's runs
are pooled across a side's loads, and the two medians compared:

- A regression fails the job: head slower than base by more than
  REGRESSION_TOLERANCE and by more than REGRESSION_FLOOR_MS. The
  `perf-accepted` label (PERF_ACCEPTED) turns it into a warning.
- A head median over its BUDGET_MS warns, and never fails.
- Any problem the head's checks found fails the job: WORLD DATA naming what
  doesn't exist, a STATE with problems while the yard ages, saved cars that
  don't match the yard. So does a console error on the head's page, and a
  benchmark that fails or never finishes. The `perf-accepted` label doesn't
  turn these into warnings.

A base with no benchmark page (one without the switchingBenchResults string)
is not timed: the head is reported and checked against the budgets alone.

Chromium is launched with gc() exposed (GC_FLAGS); the page collects before
each timing, so a timing measures its own work, not garbage left before it.

The report is a Markdown table in the job's summary ($GITHUB_STEP_SUMMARY),
and on stdout.

Environment:
  BASE_SHA, HEAD_SHA  the commits compared; the head is the checkout
  PERF_ACCEPTED       "true" when the pull request carries `perf-accepted`
  PERF_CHROMIUM       optional: a Chromium to launch instead of Playwright's
                      own, for a run outside CI
"""
import os
import pathlib
import statistics
import subprocess
import sys
import tempfile

from playwright.sync_api import sync_playwright

GAME = "index.html"
# The string a page with a benchmark carries.
BENCH_MARKER = "switchingBenchResults"

# Every figure below is a judgment call, retunable, and this is its one home.
# The budgets are on the reference runner (ubuntu-latest), in milliseconds:
# what a timing should cost there, leaving room for a phone several times
# slower inside a 16.7 ms frame. Over one warns.
BUDGET_MS = {"step": 1, "stepMoving": 1, "render": 4, "renderAged": 4, "save": 4}
# A regression is a head median above the base's by both of these: the
# fraction, and the floor that keeps a fraction of a millisecond of noise on
# a fast timing from tripping it.
REGRESSION_TOLERANCE = 0.25
REGRESSION_FLOOR_MS = 0.5
# Page loads per side, and how long one may take before the job fails.
PAGE_LOADS = 3
PAGE_TIMEOUT_S = 300
# A phone held upright: the size the game is built for.
VIEWPORT = {"width": 390, "height": 844}
SCALE = 3
# Exposes gc() to the page, which the benchmark calls before each timing.
GC_FLAGS = ["--js-flags=--expose-gc"]

# The compared timings, in report order, with what each times.
TIMINGS = {
    "step": "step(), a fresh yard standing (per step)",
    "stepMoving": "step(), the loco under power (per step)",
    "render": "render(), a fresh yard",
    "renderAged": "render(), aged 30 days",
    "save": "autosave, aged 30 days",
    "saveAll": "full save, aged 30 days",
    "skip": "a skip to the next event (mean of 30 days')",
}

errors = []


def fail(msg):
    errors.append(msg)
    print(f"::error::{msg}")


def base_page(base_sha, tmp):
    """The base's index.html, written to `tmp`, or None when the base has no
    benchmark page."""
    text = subprocess.run(["git", "show", f"{base_sha}:{GAME}"], check=True,
                          capture_output=True, text=True).stdout
    if BENCH_MARKER not in text:
        return None
    path = pathlib.Path(tmp) / GAME
    path.write_text(text, encoding="utf-8")
    return path


def load(browser, path, side):
    """One page load's result, or None after reporting why there is none.
    The head's console errors and checks' problems fail the job."""
    context = browser.new_context(viewport=VIEWPORT, device_scale_factor=SCALE)
    console = []
    try:
        page = context.new_page()
        page.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console.append(str(e)))
        page.goto(path.resolve().as_uri() + "?bench", wait_until="commit", timeout=PAGE_TIMEOUT_S * 1000)
        page.wait_for_function(f"window.{BENCH_MARKER} !== undefined", polling=1000,
                               timeout=PAGE_TIMEOUT_S * 1000)
        result = page.evaluate(f"window.{BENCH_MARKER}")
    except Exception as e:  # a timeout or a page that died
        for line in console:
            print(f"  console: {line}")
        fail(f"{side}: no benchmark result within {PAGE_TIMEOUT_S} s ({e.__class__.__name__}: {e})")
        return None
    finally:
        context.close()
    if "error" in result:
        fail(f"{side}: the benchmark failed: {result['error']}")
        return None
    if side == "head":
        for line in console:
            fail(f"head: console error: {line}")
        for p in result.get("problems", []):
            fail(f"head: {p}")
    return result


def pooled(results):
    """A side's loads, pooled: each timing's runs across every load and
    their median, and the scenario."""
    out = {"runs": {}, "median": {}}
    for key in TIMINGS:
        runs = [t for r in results for t in r["timings"].get(key, [])]
        out["runs"][key] = runs
        out["median"][key] = statistics.median(runs) if runs else None
    out["scenario"] = results[0]["scenario"]
    out["version"] = results[0]["version"]
    if any(r["scenario"] != out["scenario"] for r in results):
        fail(f"v{out['version']}: the scenario differs between page loads")
    return out


def ms(v):
    return "—" if v is None else f"{v:.2f} ms"


def main():
    base_sha = os.environ["BASE_SHA"]
    accepted = os.environ.get("PERF_ACCEPTED", "").lower() == "true"
    head_path = pathlib.Path(GAME)
    rows, notes = [], []
    with tempfile.TemporaryDirectory() as tmp:
        base_path = base_page(base_sha, tmp)
        sides = {"head": head_path} if base_path is None else {"head": head_path, "base": base_path}
        results = {side: [] for side in sides}
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=os.environ.get("PERF_CHROMIUM") or None,
                                        args=GC_FLAGS)
            try:
                for n in range(PAGE_LOADS):
                    for side, path in sides.items():
                        print(f"Load {n + 1} of {PAGE_LOADS}: {side}", flush=True)
                        r = load(browser, path, side)
                        if r is not None:
                            results[side].append(r)
            finally:
                browser.close()
    if not results["head"]:
        return 1
    head = pooled(results["head"])
    base = pooled(results["base"]) if results.get("base") else None
    if base is None:
        notes.append(f"The base ({base_sha[:7]}) has no benchmark page, so only the head is timed.")

    for key, label in TIMINGS.items():
        h = head["median"][key]
        b = base["median"][key] if base else None
        if h is None:
            continue
        change = f"{(h - b) / b * 100:+.1f}%" if b else "—"
        budget = BUDGET_MS.get(key)
        verdicts = []
        if b is not None and h > b * (1 + REGRESSION_TOLERANCE) and h - b > REGRESSION_FLOOR_MS:
            if accepted:
                verdicts.append("accepted")
                print(f"::warning::{label}: {ms(h)} against {ms(b)} on the base ({change}), "
                      "a regression accepted by the perf-accepted label.")
            else:
                verdicts.append("regression")
                fail(f"{label}: {ms(h)} against {ms(b)} on the base ({change}), "
                     f"slower by more than {REGRESSION_TOLERANCE:.0%} and {REGRESSION_FLOOR_MS} ms.")
        if budget is not None and h > budget:
            verdicts.append("over budget")
            print(f"::warning::{label}: {ms(h)}, over its {budget} ms budget.")
        rows.append(f"| {label} | {ms(b)} | {ms(h)} | {change} | "
                    f"{'—' if budget is None else f'{budget} ms'} | {', '.join(verdicts) or 'ok'} |")

    lines = [
        "## Performance",
        "",
        f"Medians of each timing's runs, pooled over {PAGE_LOADS} page loads per side.",
        "",
        "| Timing | Base | Head | Change | Budget | Verdict |",
        "|---|---|---|---|---|---|",
        *rows,
        "",
    ]
    shas = {"Base": base_sha, "Head": os.environ.get("HEAD_SHA", "")}
    for side, r in (("Base", base), ("Head", head)):
        if r is None:
            continue
        s = r["scenario"]
        lines.append(f"- **{side}** (v{r['version']}, {shas[side][:7] or 'working tree'}): "
                     + ", ".join(f"{k} {v}" for k, v in s.items()) + ".")
    problems = [e for e in errors if e.startswith("head: ")]
    lines += ["", f"Checks: {len(problems)} problem{'s' if len(problems) != 1 else ''} on the head."]
    lines += [f"- {p[6:]}" for p in problems]
    lines += [""] + notes
    report = "\n".join(lines) + "\n"
    print(report)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(report)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
