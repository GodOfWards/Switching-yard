# Design: the game's rules, area by area

The rules the game follows, in plain words, one file per area. Each rule
links the reference that grounds it; the rule itself carries no history.

## Three layers

| Layer | Where | Holds |
|---|---|---|
| Historical reality | [../reference/](../reference/README.md) | Sourced real practice, documented more widely than the game simulates: paperwork, inspection, personnel, bureaucracy |
| Game design rules | here | What the game does, and the operational consequences that matter to the player |
| Minimum simulation | GitHub Issues, then CONFIG / STATE in `index.html` | Only the state and checks a build needs. Code points here, never to history |

Tom's calls are logged, dated, in [../decisions.md](../decisions.md); a rule
here is the current form of those calls.

## Rules

- **A file per area.** A rule lives in one file; others link it.
- **Decided and open are kept apart.** Each file has **Rules** (Tom's
  calls, current) and **Open** (each with its issue).
- **Issues hold the build, not the rules.** An issue's body says what a
  pull request builds and links the rules here instead of restating them.
- **History stays in reference/.** A rule that rests on real practice
  links the reference file; if none exists yet, it links the research
  issue.

## Files

| File | Covers |
|---|---|
| [traffic.md](traffic.md) | Cars and trains as traffic that exists on its own; waybills; the traffic plan |
| [disposition.md](disposition.md) | What happens next to a car or block, and who decides |
| [jobs.md](jobs.md) | Work derived from dispositions: tasks, requirements, ordering levels, the job sheet and board |
| [results.md](results.md) | How finished work is assessed, and rough handling as a consequence |
| [time.md](time.md) | The clock, shifts and skipping |
| [living-railway.md](living-railway.md) | Other trains, the main line, authority to move |
