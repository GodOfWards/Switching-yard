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
- **Road trains run to a timetable** (#49): one arrival and one departure
  a shift, directions alternating (07:00 from Retiro, 12:30 to Mendoza;
  15:00 from Mendoza, 20:30 to Retiro; 23:00 from Retiro, 04:30 to
  Mendoza; retunable). An arrival brings 8–12 cars; a departure takes at
  most 16, so a whole train fits the head-shunt behind the loco.
- **Road trains appear and leave at the yard tracks' cut-off west end**:
  an arrival stands on the arrival track at the buffer, its road loco
  gone; a departure vanishes from its track. Road locos stay off the map.
  Main-line traffic (#56) and authority to move (#57) may later bring
  them in over the lead.
- **An arrival is held outside** while the arrival track has anything on
  it, and comes in late when it clears; the delay is recorded.
- **Cars off the map** (placeholder until #50): a car that leaves is away;
  arrivals bring away cars back, loaded if they left empty and empty if
  they left loaded, with new waybills, never for the block they came from
  nor for storage. At Junín, a load left on the local track is unloaded,
  and an empty left on the empties track loaded, at the next shift change,
  then rebilled.

## Open

- Traffic rates: #50.
- How a car's return from off the map is timed: #50.
