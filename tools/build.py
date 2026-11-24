#!/usr/bin/env python3
"""Builds index.html from src/ (#113). Standard library only.

    python tools/build.py           write index.html
    python tools/build.py --check   exit 1 if index.html isn't what src/ builds

The page is src/shell.html with two marker lines replaced: STYLE_MARK by
src/style.css, and SCRIPT_MARK by the sections in SECTIONS order, joined as
they are. Every section runs inside the one "use strict" IIFE the shell
opens, so they share one scope and nothing is imported or exported.

index.html is committed: it is what the game is, opened as it always was,
and what the Performance check times. Never edit it by hand; a conflict in
it is resolved by rebuilding.
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "index.html"
STYLE_MARK = "/* build: style.css */\n"
SCRIPT_MARK = "  // build: sections\n"

# The ARCHITECTURE sections, in the order they run, and the file each lives in.
SECTIONS = [
    ("ARCHITECTURE", "00-architecture.js"),
    ("CONFIG", "01-config.js"),
    ("WORLD DATA", "02-world-data.js"),
    ("STATE", "03-state.js"),
    ("UTILITIES", "04-utilities.js"),
    ("SIMULATION", "05-simulation.js"),
    ("OPERATIONS", "06-operations.js"),
    ("ACTIONS", "07-actions.js"),
    ("PERSISTENCE", "08-persistence.js"),
    ("RENDERING", "09-rendering.js"),
    ("INPUT / LOOP", "10-input-loop.js"),
    ("CHECKS", "11-checks.js"),
]


def read(name):
    return (SRC / name).read_text(encoding="utf-8")


def build():
    shell = read("shell.html")
    for mark in (STYLE_MARK, SCRIPT_MARK):
        if shell.count(mark) != 1:
            sys.exit(f"build: shell.html must hold {mark.strip()!r} once")
    sections = "".join(read(f) for _, f in SECTIONS)
    return shell.replace(STYLE_MARK, read("style.css")).replace(SCRIPT_MARK, sections)


def main():
    page = build()
    if "--check" in sys.argv[1:]:
        if OUT.read_text(encoding="utf-8") != page:
            sys.exit("build: index.html is not what src/ builds. "
                     "Edit src/, then run: python tools/build.py")
        print("build: index.html matches src/")
        return
    OUT.write_text(page, encoding="utf-8", newline="")
    print(f"build: wrote {OUT.name}, {len(page.encode())} bytes")


if __name__ == "__main__":
    main()
