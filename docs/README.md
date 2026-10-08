# Docs

Reference material for the game: what was researched, and what was decided
because of it. The game's own values live in `index.html` (CONFIG and WORLD
DATA); these files hold the real-world numbers and the reasons behind them.

## Research

Real-world facts, with sources. Dated, because sources change.

| File | Covers |
|---|---|
| [locomotives.md](research/locomotives.md) | Switcher candidates (Class 08, SW1500, GM G12, GAIA) and why the G12 |
| [train-physics.md](research/train-physics.md) | Rolling and starting resistance, brake rates, real switching practice |
| [argentine-rolling-stock-naming.md](research/argentine-rolling-stock-naming.md) | Line initials, FA loco numbers, Spanish car type names, operators |

## Decisions

| File | Covers |
|---|---|
| [decisions.md](decisions.md) | Tom's design calls, newest first, and the questions still open |

## Adding to these docs

- New research gets its own file in `research/`, named for its subject, and
  a row in the table above.
- Each research file opens with what it's for and the date it was
  researched, and ends with its sources. Estimates and unchecked claims are
  marked as such.
- A design call Tom makes goes in `decisions.md`, with a link to where it
  was made.
- A number the game uses still gets its named constant in CONFIG. The docs
  explain where it came from; they don't replace it.
