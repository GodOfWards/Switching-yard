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
  Mendoza; retunable). An arrival brings up to 12 cars, by the traffic
  plan; a departure takes at most 16, so a whole train fits the head-shunt behind the loco.
- **Road trains appear and leave at the yard tracks' cut-off west end**:
  an arrival stands on the arrival track at the buffer, its road loco
  gone; a departure vanishes from its track. Road locos stay off the map.
  Main-line traffic (#56) and authority to move (#57) may later bring
  them in over the lead.
- **An arrival is held outside** while the arrival track has anything on
  it, and comes in late when it clears; the delay is recorded.
- **The traffic plan (#50)** decides where cars go:
  - flows between Junín and the stations off the map, each a car type, a
    load and a rate in cars a week, sized to what the timetable can carry
    (each side balances in and out);
  - each car serves one flow: loaded, it is billed to where its load goes;
    empty, back to where its flow loads. A car with no flow is billed to
    Junín to unload if loaded, and otherwise joins a flow short of cars
    or goes to storage; stored cars join flows short of cars at shift
    changes;
  - a car that leaves goes on a trip to its waybill's station: its round
    trip (about 8 days for the near stations, 12 for Retiro, 16 for
    Mendoza), give or take a quarter. It is unloaded or loaded there by
    the plan, and comes back on an arrival from that station's side,
    soonest due first, up to the train's cap of 12;
  - each flow keeps a share of cars: its loaded cars a day times its
    cycle, the round trips plus a day and a half at Junín each time
    through (about 370 cars in all);
  - the **pool** is San Martín cars elsewhere on the line. An arrival with
    fewer than 8 cars due takes cars from it for flows short of cars, up
    to 8; a car leaving when its flow has more than 2 over its share stays
    out in the pool once its trip is over, and the pool forgets a car
    after 60 days.
  - At Junín, two industries do the loading and unloading (#84, both
    invented): the **grain elevator** loads Junín's grain, and the
    **goods shed** unloads merchandise and wine in casks and loads small
    lots. A car for one waits in the yard (elevator empties on the
    empties track, shed cars on the local track) until a set-out takes it
    there, and is billed on once worked ([jobs.md](jobs.md)). The rest
    (fuel, materials) stays a placeholder: a load left on the local track
    is unloaded, and an empty left on the empties track loaded, at the
    next shift change, then rebilled.
- **Bulk moves in through trains** (#56), not the road trains: the road
  trains carry wagonload traffic ([fa-freight-traffic.md](../reference/fa-freight-traffic.md)).

## Open

- Places for Junín's fuel and materials traffic, now on the placeholder.
