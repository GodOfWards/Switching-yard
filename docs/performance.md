# Performance and code health

How the game is kept fast and sound as it grows, taken from Ashfall's.

## What is measured

The game has a benchmark page: open `index.html?bench`. It plays fixed
scenarios on a yard of its own, never the player's save, and shows the
timings and any problems over the game. These are the scenarios:

- a fresh yard standing, and with the loco under power: `step()` and
  `render()`;
- a fresh yard aged 30 game days by skipping from event to event, which
  is about when every car's history is full. The aged yard is the one
  that costs most, so autosave and a full save are timed on it.

While aging, it checks after every skip that the saved cars match the yard,
which catches a change to the cars that doesn't call `carsChanged()` and so
never gets saved. Every few skips it also checks that the state passes
`stateProblems()`.

At every start, the game checks that WORLD DATA names nothing that doesn't
exist (`worldProblems()`) and puts any problem in the console and a notice.

## The Performance check

On every pull request that changes `index.html`, the Performance job
(`.github/workflows/performance.yml`) runs the benchmark page three times
each on the base and the head, at a phone's size. It fails when:

- a timing is slower than the base by more than the tolerance (the
  `perf-accepted` label turns this into a warning, for a slowdown that is
  worth what it buys);
- the checks find any problem, or the page logs an error.

A timing over its budget only warns. The budgets and tolerances are
judgment calls, retunable, and live only in `.github/scripts/perf_check.py`.

## Principles

1. **Nothing runs per frame that can run per event.** Traffic, jobs and
   histories change at events (an arrival, a shift change, a skip), never
   per step. Only movement steps.
2. **Write only what changed.** The save keeps the cars apart from the rest
   and writes them only when they changed, so a long-played yard autosaves
   as cheaply as a fresh one (#90).
3. **Costs are measured, not assumed.** A pull request that adds per-step
   or per-save work reads the Performance job's summary before it is ready.

## Code health

Structure, stale comments and performance problems that aren't something
the player sees go wrong are filed as `code-health` issues ([issues.md](issues.md)).
A cleanup that claims no behaviour change proves it with
`git diff origin/main...HEAD -- index.html` and an unchanged benchmark.
