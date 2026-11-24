#!/usr/bin/env python3
"""Cuts a one-file index.html into src/ at its section banners (#113).

Used once to make src/. Run from the repository root:

    python tools/split.py [PAGE] [--out DIR]     (defaults: index.html, src)

It also ports a branch whose index.html was edited before the split, by
splitting that branch's base and head and applying the difference to src/:

    base=$(git merge-base HEAD origin/main)    # before merging main
    git show $base:index.html > /tmp/base.html && git show HEAD:index.html > /tmp/head.html
    python tools/split.py /tmp/base.html --out /tmp/base
    python tools/split.py /tmp/head.html --out /tmp/head
    git merge origin/main                      # take main's index.html on conflict
    (cd /tmp && diff -ruN base head) | patch -p1 -d src
    python tools/build.py

It writes src/shell.html (the page, with build markers where the style and
the script's sections go), src/style.css, and one src/NN-<section>.js per
ARCHITECTURE section, in order. A section is the banner line before its
name ("  // ====") up to the next section's banner. It stops without
writing anything if a section is missing, so a renamed banner is noticed.
"""
import pathlib
import sys

from build import SECTIONS, SRC, STYLE_MARK, SCRIPT_MARK

BANNER = "  // " + "=" * 50 + "\n"


def split(text):
    lines = text.splitlines(keepends=True)
    s0 = lines.index("<style>\n")
    s1 = lines.index("</style>\n")
    style = "".join(lines[s0 + 1:s1])

    # Where each section starts: its banner, the line before its name.
    starts = []
    for name, _ in SECTIONS:
        hits = [i - 1 for i in range(1, len(lines))
                if lines[i] == f"  // {name}\n" and lines[i - 1] == BANNER]
        if len(hits) != 1:
            sys.exit(f"split: section {name!r} found {len(hits)} times, not once")
        starts.append(hits[0])
    if starts != sorted(starts):
        sys.exit("split: sections are not in ARCHITECTURE order")
    # The script ends at the IIFE's close.
    end = len(lines) - 1 - lines[::-1].index("})();\n")

    files = {}
    for k, (_, fname) in enumerate(SECTIONS):
        stop = starts[k + 1] if k + 1 < len(SECTIONS) else end
        files[fname] = "".join(lines[starts[k]:stop])
    shell = ("".join(lines[:s0 + 1]) + STYLE_MARK + "".join(lines[s1:starts[0]])
             + SCRIPT_MARK + "".join(lines[end:]))
    files["style.css"] = style
    files["shell.html"] = shell
    return files


def main():
    args = sys.argv[1:]
    out = SRC
    if "--out" in args:
        i = args.index("--out")
        out = pathlib.Path(args[i + 1])
        del args[i:i + 2]
    source = pathlib.Path(args[0] if args else "index.html")
    files = split(source.read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    for name, body in files.items():
        (out / name).write_text(body, encoding="utf-8", newline="")
    print(f"split: {source} -> {len(files)} files in {out}/")


if __name__ == "__main__":
    main()
