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
  carry on down the line (below).
- **Knock-on delays** (#47; Tom, 2026-11-24). A held arrival opens its
  break-up late, which squeezes the builds it feeds; a build not ready
  makes its departure late, or the departure leaves without some of its
  cars. Only what the game times carries a delay: the yard, the main on
  the map, and a late departure's own cars, whose trips start when it
  actually leaves. Nothing makes up time but the yard's own slack between
  an arrival and its departures: no train leaves early, and nothing is
  made up off the map.
  - **A missed car** (one of its build's cars, still for its block, not
    on its train when it leaves) waits for the next train to its block.
    The train isn't held for it. Its history says why ("Missed 1102, not
    on Track 1; waits for 1104") and the register's line counts them
    ("2 cars left for 1104").
  - **A late departure's cause names its root**: the latest arrival that
    day the yard made late and that brought cars on its build, "Build not
    ready, after 1101 held outside 40 min". With none, it is plain "Build
    not ready". Its wait counts in the shift's yard total.
  - **On the board**, while an arrival is held, each build it feeds says
    so: "1203 held outside: its cars aren't in yet".
  - Implementation choices, retunable: a build's cars are those listed
    when its job opened; a departure "would have gone ahead" of a through
    train when none is booked on the main during its run out from its
    booked time; a Retiro arrival refused by the yard reads "held at La
    Oriental", one only slowed on its way in reads "late in".
- **Rough handling is a consequence, not a score:** a coupling closing
  faster than the hard-hit speed (`HARD_HIT_SPEED`, 5 km/h) damages the
  car, which becomes bad order and needs the repair track. Retunable.
  Overheating the traction motors until they trip also counts as rough
  handling on the jobs being worked (Tom, 2026-11-24;
  [traction.md](traction.md)).
- **Efficiency** is measured against a simple par, not the best possible
  solution: a job is "inefficient" when its moves exceed 1.5 × (cars
  handled + blocks). Retunable.
- **A move is a change of direction** of the player's loco, so stopping to
  throw a switch, uncouple or set a brake isn't one (Tom, 2026-11-24, #62).
- **Timeliness sits beside the outcome, not in it.** The headline reads
  "Operationally valid · 25 min late"; late never lowers the outcome
  (#62).
- **The train register** (#62), after RITO art. 41 and 219
  ([fa-yard-operations.md](../reference/fa-yard-operations.md#paperwork)):
  Junín's register, reached from the board, has a line for every train
  that arrives, leaves or passes through the map, with its number, booked
  and actual times, minutes late or "on time", and the cause when the yard
  caused it. Grouped by shift, each with the minutes of delay the yard
  caused, freight and passenger apart. No weights, no points. Jobs taken
  at the time still note a held train.

## Open

- Whether the par of 1.5 still fits now that a move is a change of
  direction (#62): to be checked in play.
