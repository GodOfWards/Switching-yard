# Traffic

The railway has traffic; jobs are the work needed to process it. Traffic
exists independently of the player's jobs.

## Rules

- **Traffic is cars and trains with a state** (where they are, loaded or
  empty, sound or bad order) and somewhere to go. A train arriving is a
  traffic event, not a job.
- **The flow:** traffic exists → arrives or moves → its
  [disposition](disposition.md) is determined → the work needed is
  identified ([jobs](jobs.md)) → the work is done → the traffic reaches
  its next state.
- **Cars live on across days**, so a player can follow one car through its
  cycle (loaded, moved, sorted, sent out, back). Each car keeps a history
  of what happened to it, off-screen work included.
- **Each car carries a waybill** naming where it is ultimately going. When
  it gets there, a new one is issued (load at the elevator, out to Buenos
  Aires, back empty). The waybill is the goal; the disposition is the next
  step.
- **Traffic comes from a plan in WORLD DATA:** each industry ships and
  receives set car types at set rates, and road trains run to a timetable.
- **Cars are grouped into blocks**, operational units that can travel,
  wait and be handled together.

## Open

- Traffic rates and the timetable: #49, #50.
- How a car's return from off the map is timed: #50.
