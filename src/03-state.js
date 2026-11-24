  // ==================================================
  // STATE
  // ==================================================
  function makeState() {
    // `clock` is the time of day, in seconds since midnight before day 1.
    // `air` holds each coupling whose air is connected, by its pair key, with
    // how far its charge has come (0 to 1).
    // `gaps` holds each coupling's opening past touching, by its pair key: 0
    // buffers touching, its free play (freePlay()) fully stretched before the
    // draft gear. `work` holds the shunter's work under way at a coupling or
    // a meeting of buffers, by its pair key: hooking up or uncoupling, and
    // when it is done (#33).
    // `cars` holds each car in the game's traffic, by id: its kind, number
    // and line initials (or null), whether it is loaded, its flow (a FLOWS
    // id, or null), its waybill (a DESTINATIONS id, or null), its `spot` at
    // an industry while it is set out there (null, or the industry and the
    // spot's number, null where any spot does), why it is bad order (or
    // null), whether it is away off the map (null, or since when) and its
    // history. A car away has no vehicle; its `trip` says which
    // station it is at, when it is due back, and whether it stays out in
    // the pool instead. `pool` holds the cars out in the pool, by id, each
    // with when it went there; `nextCar` numbers the cars that join, and
    // `poolCount` counts those that joined and left since `poolSince`.
    // `industries` holds, by industry, its set-out job open or being
    // worked, when that work is done (`readyAt`), and its pull job. `jobs`
    // holds the jobs open and the last JOBS_KEPT finished. `moves` counts the loco's changes of direction,
    // `locoSense` the way it last moved (+1 cab first, −1 back, 0 not yet);
    // `register` is Junín's train register (#62): a line for each road or
    // through train run in REGISTER_DAYS, with its booked and actual times,
    // how late, and the yard's cause;
    // `nextShiftAt` is the next shift change to act on, and `timetableAt`
    // the time from which road trains are still to run; `held` lists the
    // arrivals held outside, waiting for the arrival track; `roadAt` the
    // time from which Retiro's road trains (#78) are still to start, and
    // `road` those started: offered, refused, coming in, a road loco off
    // shed, standing for the station's check, or leaving, each with its
    // vehicles on the map, its speed and its waits by cause. `throughAt` is
    // the time from which through trains are still to be offered;
    // `through` lists those offered, held or running, each with its
    // vehicles on the map and its speed. `main` says whether the player
    // holds the main, and until when. `seed` drives the game's choices of
    // traffic.
    const st = { clock: START_CLOCK, switches: {}, vehicles: {}, trains: {}, air: {}, gaps: {}, work: {}, nextTrain: 1,
                 cars: {}, jobs: [], nextJob: 1, moves: 0, locoSense: 0, register: [], nextShiftAt: START_CLOCK,
                 timetableAt: START_CLOCK, held: [], roadAt: START_CLOCK, road: [], throughAt: START_CLOCK, through: [], main: { held: false, until: null },
                 pool: {}, nextCar: 1, poolCount: { joined: 0, left: 0 }, poolSince: START_CLOCK, industries: {},
                 seed: Math.floor(Math.random() * 2 ** 31), notice: null };
    for (const id in SWITCHES) st.switches[id] = { set: SWITCHES[id].normal };
    for (const id in INDUSTRIES) st.industries[id] = { setOut: null, readyAt: null, pull: null };
    state = st;                           // walk() reads the switches as it lays trains out
    for (const t of START_TRAINS) {
      for (const v of t.vehicles) addVehicle(v.id, startType(v), v.flip);
      layTrain(t.segment, t.s, t.dir, t.vehicles.map(v => v.id));
      // A cut on a yard track stands secured, its car nearest the buffer
      // with the hand brake set (#109).
      const track = TRACK_OF[t.segment], cars = t.vehicles.filter(v => !VEHICLE_TYPES[startType(v)].loco).map(v => st.vehicles[v.id]);
      if (track && cars.length === t.vehicles.length)
        cars.reduce((a, b) => trackOffset(track, b.seg, b.s) > trackOffset(track, a.seg, a.s) ? b : a).handBrake = true;
    }
    for (const id in CARS) {
      const t = START_TRAFFIC[id] || {}, car = CARS[id];
      st.cars[id] = { type: car.type, number: car.number, line: car.line || null, loaded: car.loaded,
                      flow: t.flow || null, waybill: t.waybill || null, spot: null, badOrder: t.badOrder || null,
                      away: st.vehicles[id] ? null : START_CLOCK, trip: null, history: [] };
      if (st.vehicles[id]) {
        if (t.flow) st.cars[id].waybill = flowWaybill(id);
        if (st.cars[id].waybill) logCar(id, `Waybill: ${DESTINATIONS[st.cars[id].waybill].name}`);
        if (t.badOrder) logCar(id, `Bad order: ${t.badOrder}`);
      } else startTrip(id);
    }
    // Each flow's share of cars that the starting ones don't fill join
    // now, already on their trips.
    for (const f in FLOWS) while (flowCars(f) < flowShare(f)) startTrip(newCar(FLOWS[f].type), f);
    runEvents();                          // the first shift's jobs open
    return st;
  }
  // Puts vehicle `id` of kind `type` into STATE, standing and in no train.
  function addVehicle(id, type, flip = 1) {
    state.vehicles[id] = { id, type, flip, speed: 0, handBrake: false };
    if (VEHICLE_TYPES[type].loco) state.vehicles[id].controls = { reverser: 0, throttle: 0, locoBrake: 0, trainBrake: 0,
      locoApplied: 0, trainApplied: 0, emergency: false };
  }
  // Lays vehicles `ids` out as one train, coupled and bunched, back from
  // its head end, which stands `s` metres along `segment` facing `dir` (+1
  // toward the segment's `b`). Each vehicle must already be in no train.
  function layTrain(segment, s, dir, ids) {
    const train = { id: "t" + state.nextTrain++, vehicles: [] };
    let end = { seg: segment, s, travel: -dir };              // walking back from the head
    for (const id of ids) {
      const v = state.vehicles[id], half = vehicleType(v).length / 2;
      const c = walk(end.seg, end.s, end.travel, half);
      Object.assign(v, { train: train.id, seg: c.seg, s: c.s, dir: -c.travel, speed: 0 });
      if (train.vehicles.length) state.gaps[pairKey(train.vehicles[train.vehicles.length - 1], id)] = 0;
      train.vehicles.push(id);
      end = walk(c.seg, c.s, c.travel, half);
    }
    state.trains[train.id] = train;
    for (const id of ids) trailSwitches(state.vehicles[id]);
    return train;
  }
  let state = null;                     // made once every helper exists, at the end of OPERATIONS
  // Whether the cars or the pool changed since they were last saved. Whatever
  // changes either calls carsChanged(); PERSISTENCE writes them only then.
  let carsDirty = true;
  const carsChanged = () => { carsDirty = true; };

