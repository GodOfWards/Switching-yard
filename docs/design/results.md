# Results

Finished work is judged by operational requirements, not by whether it
reproduces a predetermined solution. It's an operational assessment, not
an economy or reward system.

## Rules

- **Four dimensions:**
  1. **Correctness:** the required cars and blocks, and their ordering
     levels and restrictions, are satisfied.
  2. **Efficiency:** no unnecessary switching or movement.
  3. **Timeliness:** done when required.
  4. **Operational validity:** the resulting formation is usable.
- **Outcomes read as:** Operationally valid; Valid but inefficient;
  Partially complete; Incomplete; Invalid formation.
- **Nothing fails.** Late is recorded, and the train leaves late; delays
  can carry on down the line (#47).
- **Rough handling is a consequence, not a score:** a coupling closing
  faster than the hard-hit speed (`COUPLE_MAX_SPEED`, 5 km/h) damages the
  car, which becomes bad order and needs the repair track. Retunable.
- **Efficiency** is measured against a simple par, not the best possible
  solution: a job is "inefficient" when its moves exceed 1.5 × (cars
  handled + blocks). Retunable.

## Open

- What counts as one move for the par. Stage 1 counts each start of the
  loco from a stand (an implementation choice, retunable, until decided).
