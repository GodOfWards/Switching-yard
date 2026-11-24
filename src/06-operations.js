  // ==================================================
  // OPERATIONS
  // ==================================================
  // Traffic, dispositions, jobs and results (docs/design/, #48, #49, #50).
  // Each car is loaded or empty, serves a flow of the traffic plan and has
  // a waybill from it, is sound or bad order, and keeps a history; it is on
  // the map or away on a trip, or out in the pool. Its disposition, the
  // next step the game decides for it, sends it to a block's yard track, or
  // leaves it where it is. Road trains run to TIMETABLE: an arrival brings
  // cars back from their trips onto the arrival track, and opens a job to
  // break it up and one to build the next departure; a departure takes its
  // block's cars away on their trips. A job's lines are
  // checked against the yard as it stands, so a car damaged mid-job
  // changes its line. A job not taken is done off-screen when due, by
  // another crew.

  // The game's own choices (which cars get new waybills, and where to)
  // come from `state.seed`, so a saved yard goes on the same way.
  function random() {
    let t = state.seed = (state.seed + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const carName = id => { const c = state.cars[id] || state.pool[id]; return `${c.line || "FA"} ${c.number}`; };
  function logCar(id, text, at = state.clock) {
    const h = state.cars[id].history;
    h.push({ at: Math.round(at), text });
    carsChanged();
    if (h.length > HISTORY_KEPT) h.shift();
  }
  const jobById = id => state.jobs.find(j => j.id === id);
  // When a job must be done: when due, or a Retiro build when its road
  // loco comes off shed (#78). Another crew does one not taken then.
  const readyBy = j => j.ready || j.due;
  const openJobs = () => state.jobs.filter(j => !j.result);

  // The block a car goes to next, or null when it stays where it is (or is
  // away). Placeholder rule until #45: a bad-order car goes to repair; one
  // set out at an industry, to that industry's track; otherwise its
  // waybill's destination decides.
  function dispositionOf(id) {
    const c = state.cars[id];
    if (c.away !== null) return null;
    if (c.badOrder) return "repair";
    if (c.spot) return YARD_TRACKS[INDUSTRIES[c.spot.industry].track].block;
    return c.waybill ? DESTINATIONS[c.waybill].block : null;
  }
  const blockTracks = block => Object.keys(YARD_TRACKS).filter(t => YARD_TRACKS[t].block === block);
  const inPlayerTrain = v => v.train === playerLoco().train;
  // The yard track a vehicle's middle is on, or null.
  const trackAt = v => TRACK_OF[v.seg] || null;
  // Whether a vehicle stands wholly on yard track `trackId`, clear of its
  // fouling point.
  function clearOn(v, trackId) {
    const e = vehicleEnds(v);
    return [e.head, e.tail].every(end => {
      const d = trackOffset(trackId, end.seg, end.s);
      return d !== null && d >= TRACK_GEOM[trackId].fouling;
    });
  }
  // A car's disposition is met when it is left (not in the loco's train)
  // clear on one of its block's tracks, or when it has none; one set out at
  // an industry, when its middle is on its spot (any of them, where any
  // does).
  function dispositionMet(id) {
    const block = dispositionOf(id), v = state.vehicles[id], sp = state.cars[id].spot;
    if (!block) return true;
    if (inPlayerTrain(v)) return false;
    if (sp && block !== "repair") return onSpot(v, sp.industry, sp.n);
    return blockTracks(block).some(t => clearOn(v, t));
  }
  function onSpot(v, ind, n) {
    const d = trackOffset(INDUSTRIES[ind].track, v.seg, v.s), span = spotSpan(ind, n);
    return d !== null && d >= span.near && d <= span.far;
  }
  // Whether a block in `block` order stands in it on each of its tracks:
  // from the ladder end, its cars' destinations come in its groups' order.
  // Cars on the track with another disposition don't count.
  function blockInOrder(block) {
    const groups = BLOCKS[block].groups;
    for (const t of blockTracks(block)) {
      const order = Object.keys(state.cars)
        .filter(id => dispositionOf(id) === block && trackAt(state.vehicles[id]) === t)
        .map(id => { const v = state.vehicles[id]; return { g: groups.indexOf(state.cars[id].waybill), d: trackOffset(t, v.seg, v.s) }; })
        .sort((a, b) => a.d - b.d);
      if (order.some((o, i) => i && o.g < order[i - 1].g)) return false;
    }
    return true;
  }
  // A job checked against the yard: a line per car (its block, and whether
  // it's met), how many are met, and whether each block in block order the
  // job touches stands in it (null when it touches none). A job gone away
  // on its train is met. For a build job, `cut` too: whether its train's
  // cars that are on the map stand coupled as one cut (`one`), with
  // nothing else coupled in (`clean`).
  function jobStatus(job) {
    const lines = job.cars.map(id => ({ id, block: dispositionOf(id), met: dispositionMet(id), away: state.cars[id].away !== null }));
    const ordered = [...new Set(lines.map(l => l.block))].filter(b => b && BLOCKS[b].ordering === "block");
    const st = { lines, met: lines.filter(l => l.met).length,
                 inOrder: ordered.length ? ordered.every(blockInOrder) : null, cut: null };
    if (job.kind === "build") {
      const ids = lines.filter(l => l.block === job.block).map(l => l.id);
      const trains = new Set(ids.map(id => state.vehicles[id].train));
      const t = trains.size === 1 && state.trains[[...trains][0]];
      st.cut = !ids.length ? { one: true, clean: true }
        : { one: !!t && !t.vehicles.some(id => state.vehicles[id].controls), clean: !!t && t.vehicles.every(id => ids.includes(id)) };
    }
    return st;
  }
  // Whether a job's formation is usable: its blocks in order and, for a
  // build, its train one cut with nothing else in it.
  const formationValid = st => st.inOrder !== false && (!st.cut || (st.cut.one && st.cut.clean));

  // Each change of direction of the player's loco is a move (#62): the
  // way it moves, cab end first or not, unlike the last way it moved.
  function countMoves() {
    const v = playerLoco(), sense = Math.sign(v.speed * v.flip);
    if (sense && sense !== state.locoSense) { state.moves++; state.locoSense = sense; }
  }

  // Rough handling: a car hit harder than DAMAGE_SPEED goes bad order.
  // Returns whether it was damaged now. Jobs being worked note it.
  function damageCar(id, speed) {
    if (!state.cars[id] || state.cars[id].badOrder) return false;
    state.cars[id].badOrder = `Damaged in a hit at ${(speed * 3.6).toFixed(0)} km/h`;
    logCar(id, `Bad order: ${state.cars[id].badOrder}`);
    for (const j of openJobs()) if (j.taken) j.damaged.push(id);
    return true;
  }

  // Acts, in time order, on every industry's work done, shift change,
  // road train and Retiro road train's start the clock has reached, then
  // lets in any arrival held outside whose track is clear, moves Retiro's
  // road trains on (#78), and the main's through trains. `instant` while
  // the clock skips: nothing moves then, so a Retiro road train's moves
  // are done at once, each at its time, and it is checked again after
  // every event in the skip.
  function runEvents(instant = false) {
    const woke = new Set();
    for (;;) {
      const now = state.clock, next = [];
      const ind = industryDue(), run = runsBetween(state.timetableAt, now)[0], road = nextRoadRun();
      if (ind) next.push({ at: ind.at, go: () => industryReady(ind.ind, ind.at) });
      if (state.nextShiftAt <= now) next.push({ at: state.nextShiftAt, go: () => {
        shiftChange(state.nextShiftAt);
        state.nextShiftAt += SHIFT_HOURS * HOUR;
      } });
      if (run) next.push({ at: run.at, go: () => {
        state.timetableAt = run.at + 1;
        const tt = timetableEntry(run.tt);
        if (tt.east) return;                // Retiro's start ahead of their time: startRoad()
        if (tt.arrives) state.held.push(run);
        else departureDue(run);
        letInArrivals(run.at);
      } });
      if (road && road.start <= now) next.push({ at: road.start, go: () => startRoad(road, road.start) });
      if (instant) for (const r of state.road) {
        const at = roadWake(r);
        if (at !== null && at <= now && !woke.has(r.id + "@" + at)) next.push({ at, go: () => woke.add(r.id + "@" + at) });
      }
      if (!next.length) break;
      // The soonest; on a tie, in the order above.
      const e = next.reduce((a, b) => b.at < a.at ? b : a);
      e.go();
      if (instant) for (const r of [...state.road]) advanceRoad(r, e.at, true);
    }
    letInArrivals(state.clock);
    for (const r of [...state.road]) advanceRoad(r, state.clock, instant);
    mainEvents();
  }
  // The road trains (or the through trains of `table`) that run from
  // `from` to `to`, soonest first: each a timetable entry's id, the time it
  // runs, and an id for that day's run.
  function runsBetween(from, to, table = TIMETABLE) {
    const out = [];
    for (let day = Math.floor(from / DAY); day * DAY <= to; day++)
      for (const tt of table) {
        const at = day * DAY + tt.at;
        if (at >= from && at <= to) out.push({ id: `${tt.id}.${day}`, tt: tt.id, at });
      }
    return out.sort((a, b) => a.at - b.at);
  }
  const timetableEntry = id => TIMETABLE.find(t => t.id === id);
  const trainName = tt => `${tt.number} ${tt.arrives ? "from " + tt.from : "to " + tt.to}`;

  // At a shift change: jobs not taken that fall due are done off-screen;
  // cars staying out in the pool whose trips are over go there, and the
  // pool forgets those out POOL_KEEP_DAYS; cars left on the repair track
  // are repaired, and loads for Junín left on the local track unloaded and
  // empties for loading left on the empties track loaded (placeholders for
  // the traffic no industry takes), each with a new waybill; stored cars
  // go to flows short of cars; cars for a station reached through the west
  // end go out (toWestEnd()); set-outs open at the industries free for
  // them; and a job opens to sort the cars still not where they belong. A
  // car in an open job is left alone.
  function shiftChange(at) {
    carsChanged();
    for (const j of openJobs()) if (!j.taken && j.kind !== "build" && j.due <= at) doOffScreen(j, at);
    toWestEnd(at);
    for (const id of Object.keys(state.cars)) {
      const t = state.cars[id].trip;
      if (t && t.pool && t.back <= at) { resolveTrip(id); toPool(id, at); state.poolCount.left++; }
    }
    for (const id in state.pool) if (at - state.pool[id].away >= POOL_KEEP_DAYS * DAY) delete state.pool[id];
    const busy = new Set(openJobs().flatMap(j => j.cars));
    for (const id in state.cars) {
      const c = state.cars[id], v = state.vehicles[id], block = dispositionOf(id);
      if (c.away !== null || busy.has(id) || v.speed !== 0 || v.run || !block || !dispositionMet(id)) continue;
      if (c.badOrder) {
        c.badOrder = null;
        logCar(id, `Repaired on ${YARD_TRACKS[trackAt(v)].name}`, at);
        rebill(id, at);
      } else if (c.waybill === "junin" && c.loaded) {
        c.loaded = false;
        logCar(id, "Unloaded at Junín", at);
        rebill(id, at);
      } else if (c.waybill === "forLoading" && !c.loaded) {
        c.loaded = true;
        logCar(id, "Loaded at Junín", at);
        rebill(id, at);
      } else if (block === "storage" && !c.flow && !c.loaded && (c.flow = pickFlow(c.type, { shortOnly: true }))) {
        rebill(id, at);
      }
    }
    openSetOuts(at);
    openSortJob(at);
    const done = state.jobs.filter(j => j.result && (j.kind !== "build" || j.departed));
    if (done.length > JOBS_KEPT) state.jobs = state.jobs.filter(j => !done.includes(j) || done.indexOf(j) >= done.length - JOBS_KEPT);
  }
  // Opens a job, due at the next shift change, for the cars on the map
  // whose dispositions aren't met and that no open job holds.
  function openSortJob(at) {
    const busy = new Set(openJobs().flatMap(j => j.cars));
    const cars = Object.keys(state.cars).filter(id => state.cars[id].away === null && !busy.has(id) && !dispositionMet(id));
    if (!cars.length) return;
    const due = at + SHIFT_HOURS * HOUR;
    addJob({ kind: "sort", title: `Sort the yard for the ${clockText(due)} shift`, short: "Sort the yard", opens: at, due, cars });
  }
  // The industries (#84). A set-out opens at a shift change for an
  // industry with no set-out or pull job open: up to INDUSTRY_SPOTS of the
  // cars billed to it, standing where they belong in the yard, each given
  // its spot (at the shed, a door each, 1 up, in no particular order). Once
  // the set-out is done, its work takes the industry's time; then the cars
  // on their spots are loaded or unloaded and billed on, and a pull job
  // opens to bring them to the yard. Cars not on their spots by then go
  // back to waiting.
  const jobOpen = id => { const j = id && jobById(id); return !!j && !j.result; };
  function openSetOuts(at) {
    carsChanged();
    const busy = new Set(openJobs().flatMap(j => j.cars));
    for (const ind in INDUSTRIES) {
      const st = state.industries[ind];
      if (st.setOut || jobOpen(st.pull)) continue;
      const cars = Object.keys(state.cars).filter(id => {
        const c = state.cars[id];
        return c.away === null && c.waybill === ind && !c.badOrder && !busy.has(id) && state.vehicles[id].speed === 0 && dispositionMet(id);
      }).slice(0, INDUSTRY_SPOTS);
      if (!cars.length) continue;
      const doors = cars.map((_, i) => i + 1);
      for (let i = doors.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [doors[i], doors[j]] = [doors[j], doors[i]]; }
      cars.forEach((id, i) => { state.cars[id].spot = { industry: ind, n: BLOCKS[YARD_TRACKS[INDUSTRIES[ind].track].block].ordering === "exact" ? doors[i] : null }; });
      const name = INDUSTRIES[ind].name;
      st.setOut = addJob({ kind: "setout", industry: ind, title: `Set out ${cars.length} car${cars.length === 1 ? "" : "s"} at ${name}`,
                           short: `Set out at ${name}`, opens: at, due: at + SHIFT_HOURS * HOUR, cars }).id;
    }
  }
  // A job just finished at `at`: a set-out starts its industry's work, and
  // its work is done by the next shift change or after its `workTime`.
  function jobFinished(job, at) {
    if (job.kind !== "setout") return;
    const wt = INDUSTRIES[job.industry].workTime;
    state.industries[job.industry].readyAt = wt === null ? shiftAt(at).end : at + wt;
  }
  // The industry whose work is done soonest by the clock, or null.
  function industryDue() {
    let due = null;
    for (const ind in INDUSTRIES) {
      const r = state.industries[ind].readyAt;
      if (r !== null && r <= state.clock && (!due || r < due.at)) due = { ind, at: r };
    }
    return due;
  }
  // Industry `ind`'s work is done at `at`.
  function industryReady(ind, at) {
    carsChanged();
    const st = state.industries[ind], spec = INDUSTRIES[ind], worked = [];
    for (const id in state.cars) {
      const c = state.cars[id];
      if (!c.spot || c.spot.industry !== ind) continue;
      const v = state.vehicles[id], n = c.spot.n;
      if (!c.badOrder && v.speed === 0 && dispositionMet(id)) {
        const f = FLOWS[c.flow], where = `at ${spec.name}${n ? `, ${spec.spot} ${n}` : ""}`;
        if (f && c.loaded && f.to === "junin") { c.loaded = false; logCar(id, `Unloaded ${where}`, at); }
        else if (f && !c.loaded && f.from === "junin") { c.loaded = true; logCar(id, `Loaded ${where}`, at); }
        c.spot = null;
        rebill(id, at);
        worked.push(id);
      } else c.spot = null;
    }
    Object.assign(st, { setOut: null, readyAt: null });
    if (!worked.length) return;
    const due = shiftAt(at + HOUR).end;
    st.pull = addJob({ kind: "pull", industry: ind, title: `Pull ${worked.length} car${worked.length === 1 ? "" : "s"} from ${spec.name}`,
                       short: `Pull from ${spec.name}`, opens: at, due, cars: worked }).id;
  }
  // Adds a job, its cars listed by block, not yet taken.
  function addJob(job) {
    const blockOrder = Object.keys(BLOCKS);
    job.cars.sort((a, b) => blockOrder.indexOf(dispositionOf(a)) - blockOrder.indexOf(dispositionOf(b)));
    const j = { id: "job" + state.nextJob++, blocks: new Set(job.cars.map(dispositionOf)).size,
                taken: false, movesAtTake: 0, damaged: [], trainsHeld: [], overruns: [], result: null, ...job };
    state.jobs.push(j);
    return j;
  }
  // Issues car `id` its waybill from the plan: by its flow, to where its
  // load goes or, empty, back to where its flow loads. A car with no flow
  // is billed to Junín to unload if loaded; empty, it joins a flow short of
  // cars, or goes to storage.
  function rebill(id, at) {
    const c = state.cars[id];
    if (!c.flow && !c.loaded) c.flow = pickFlow(c.type, { shortOnly: true });
    c.waybill = c.flow ? flowWaybill(id) : c.loaded ? "junin" : "stored";
    logCar(id, `Waybill: ${DESTINATIONS[c.waybill].name}`, at);
  }

  // The traffic plan (#50). A station of a flow is a DESTINATIONS id off
  // the map, or "junin", which waybills name by what the car is there for.
  // At Junín, a flow's industry, or else the placeholder's tracks.
  const juninAs = (station, loaded, f) => station !== "junin" ? station : f.atJunin || (loaded ? "junin" : "forLoading");
  function flowWaybill(id) {
    const c = state.cars[id], f = FLOWS[c.flow];
    return c.loaded ? juninAs(f.to, true, f) : juninAs(f.from, false, f);
  }
  const offMapEnds = f => [FLOWS[f].from, FLOWS[f].to].filter(s => s !== "junin");
  // The cars a flow keeps: its loaded cars a day times its cycle, the
  // round trip to each station off the map and a pass through Junín each.
  function flowShare(f) {
    const ends = offMapEnds(f);
    const days = ends.reduce((t, e) => t + DESTINATIONS[e].away / DAY, 0) + YARD_DAYS_PER_PASS * ends.length;
    return Math.round(FLOWS[f].perWeek / 7 * days);
  }
  // The cars serving flow `f`, not counting those staying out in the pool.
  const flowCars = f => Object.values(state.cars).filter(c => c.flow === f && !(c.trip && c.trip.pool)).length;
  // A flow for a car of kind `type` (any kind if null), with a station on
  // `side` if given: one short of cars if any, else (unless `shortOnly`)
  // any; picked by rate. Null when none fits.
  function pickFlow(type, { side = null, shortOnly = false } = {}) {
    const fits = Object.keys(FLOWS).filter(f => (!type || FLOWS[f].type === type)
      && (!side || offMapEnds(f).some(e => DESTINATIONS[e].block === side)));
    const short = fits.filter(f => flowCars(f) < flowShare(f));
    const from = short.length ? short : shortOnly ? [] : fits;
    let r = random() * from.reduce((t, f) => t + FLOWS[f].perWeek, 0);
    for (const f of from) { if (r < FLOWS[f].perWeek) return f; r -= FLOWS[f].perWeek; }
    return from.length ? from[from.length - 1] : null;
  }
  // A car new to the game, of kind `type`, away: an unused number in its
  // kind's band, and now and then the San Martín's own initials.
  function newCar(type) {
    carsChanged();
    const id = "p" + state.nextCar++, [lo, hi] = CAR_NUMBERS[type];
    const used = new Set([...Object.values(state.cars), ...Object.values(state.pool)].map(c => c.number));
    let number;
    do number = String(lo + Math.floor(random() * (hi - lo + 1))); while (used.has(number));
    state.cars[id] = { type, number, line: random() < POOL_LINE_SHARE ? POOL_LINE : null, loaded: false, flow: null,
                       waybill: null, spot: null, badOrder: null, away: state.clock, trip: null, history: [] };
    return id;
  }
  // Puts car `id`, away at the start, on a trip of `flow` (or its own, or
  // one that fits it), part way through: at one of the flow's stations
  // off the map, picked by time spent there, due back within its round
  // trip. A car no flow fits goes to the pool.
  function startTrip(id, flow) {
    carsChanged();
    const c = state.cars[id];
    c.flow = flow || c.flow || pickFlow(c.type);
    if (!c.flow) return toPool(id, state.clock);
    const ends = offMapEnds(c.flow);
    let r = random() * ends.reduce((t, e) => t + DESTINATIONS[e].away, 0), x = ends[ends.length - 1];
    for (const e of ends) { if (r < DESTINATIONS[e].away) { x = e; break; } r -= DESTINATIONS[e].away; }
    const back = state.clock + random() * DESTINATIONS[x].away;
    Object.assign(c, { loaded: x === FLOWS[c.flow].to, waybill: x, away: back - DESTINATIONS[x].away,
                       trip: { at: x, back, pool: false } });
  }
  // Car `id`'s trip is over: at its station it was unloaded, if its load
  // was for there, or loaded, if it came empty to load there. Its history
  // has it halfway through the trip.
  function resolveTrip(id) {
    carsChanged();
    const c = state.cars[id], f = FLOWS[c.flow], x = c.trip.at, when = (c.away + c.trip.back) / 2;
    const name = DESTINATIONS[x].name;
    if (f && c.loaded && x === f.to) { c.loaded = false; logCar(id, `Unloaded at ${name}`, when); }
    else if (f && !c.loaded && x === f.from) { c.loaded = true; logCar(id, `Loaded at ${name}`, when); }
    else logCar(id, `At ${name}`, when);
    c.away = null; c.trip = null;
  }
  // Car `id` stays out on the San Martín, elsewhere on the line: it moves
  // to the pool, with when, and leaves the jobs that list it.
  function toPool(id, at) {
    carsChanged();
    const c = state.cars[id];
    Object.assign(c, { flow: null, waybill: null, spot: null, away: at, trip: null });
    logCar(id, "Stays out on the San Martín, elsewhere on the line", at);
    state.pool[id] = c;
    delete state.cars[id];
    for (const j of state.jobs) {
      j.cars = j.cars.filter(x => x !== id);
      j.damaged = j.damaged.filter(x => x !== id);
      if (j.result && j.result.left) j.result.left = j.result.left.filter(x => x !== id);
    }
  }
  // A car joins an arrival from `side` out of the pool: a flow short of
  // cars with a station on that side gets a car of its kind, one in the
  // pool or a new one, coming from that station by the plan. Returns its
  // id, or null when no flow there is short. Only short flows, so that
  // the arrivals from Retiro, at least 8 cars each twice a day, don't fill
  // the one departure to Retiro (16 cars) past what it can take.
  function joinFromPool(side, at) {
    carsChanged();
    const f = pickFlow(null, { side, shortOnly: true });
    if (!f) return null;
    const type = FLOWS[f].type;
    let id = Object.keys(state.pool).find(p => state.pool[p].type === type);
    if (id) { state.cars[id] = state.pool[id]; delete state.pool[id]; }
    else id = newCar(type);
    const c = state.cars[id], x = offMapEnds(f).find(e => DESTINATIONS[e].block === side);
    Object.assign(c, { flow: f, loaded: x === FLOWS[f].to, waybill: x, away: at, trip: { at: x, back: at, pool: false } });
    logCar(id, "Joined from the San Martín's cars elsewhere on the line", at);
    state.poolCount.joined++;
    return id;
  }

  // Lets in the arrivals held outside, first come first, while the arrival
  // track stands clear and no Retiro arrival has its route set for it.
  function letInArrivals(at) {
    while (state.held.length && trackClear(ARRIVAL_TRACK) && !state.road.some(r => r.kind === "arrival" && r.status !== "refused"))
      arrive(state.held.shift(), at);
  }
  // Whether nothing stands on yard track `trackId`, not even an end.
  function trackClear(trackId) {
    const g = TRACK_GEOM[trackId];
    for (const id in state.vehicles) {
      const v = state.vehicles[id], e = vehicleEnds(v);
      if ([v, e.head, e.tail].some(p => g.segs[p.seg])) return false;
    }
    return true;
  }
  // The cars a road train from `tt`'s side brings at `at`: those due back
  // by then from the stations on its side, soonest due first, up to
  // ARRIVAL_CARS_MAX, topped up from the pool toward ARRIVAL_CARS_MIN; none
  // already on a Retiro road train coming in.
  function arrivalCars(tt, at) {
    const coming = new Set(state.road.flatMap(r => r.cars));
    const ids = Object.keys(state.cars).filter(id => {
      const t = state.cars[id].trip;
      return t && !t.pool && t.back <= at && !coming.has(id) && (DESTINATIONS[t.at].westEnd || DESTINATIONS[t.at].block === tt.side);
    }).sort((a, b) => state.cars[a].trip.back - state.cars[b].trip.back).slice(0, ARRIVAL_CARS_MAX);
    for (let id; ids.length < ARRIVAL_CARS_MIN && (id = joinFromPool(tt.side, at));) ids.push(id);
    return ids;
  }
  // A road train arrives at `at`, onto the arrival track, with its cars
  // (arrivalCars()). Each is loaded or unloaded at its station by the plan,
  // and billed on. A job opens to break it up, due at the shift change, and
  // one to build each departure that follows it, up to the next arrival.
  // A Retiro road train, `road` (#78), brings the cars it ran in with,
  // already standing on the track; or, done at once in a skip, its cars
  // are laid there as any arrival's. Its lateness and cause are its own.
  function arrive(run, at, road = null) {
    const tt = timetableEntry(run.tt), late = Math.max(0, at - run.at), onMap = !!road && road.vehicles.length > 0;
    const ids = onMap ? road.cars : arrivalCars(tt, at);
    const note = late < ON_TIME_SECONDS ? "" : road ? `, ${lateText(late)} late` : `, held outside ${lateText(late)}`;
    const delay = road ? roadDelay(road, late) : { cause: `Track ${YARD_TRACKS[ARRIVAL_TRACK].number} not clear`, yardLate: late };
    registerTrain({ number: tt.number, name: trainName(tt), passenger: false, kind: "arrival", booked: run.at, late, ...delay });
    for (const id of ids) {
      resolveTrip(id);
      if (!onMap) addVehicle(id, state.cars[id].type);
      logCar(id, `Arrived on ${trainName(tt)}${note}`, at);
      rebill(id, at);
    }
    if (ids.length) {
      if (!onMap) layOnTrack(ARRIVAL_TRACK, ids);
      addJob({ kind: "breakup", title: `Break up ${trainName(tt)}`, short: `Break up ${tt.number}`, opens: at,
               due: shiftAt(at).end, cars: ids, run: run.id, arrivedLate: late, ...(tt.east ? { east: true } : {}) });
    }
    for (const next of runsBetween(run.at + 1, run.at + DAY)) {
      if (timetableEntry(next.tt).arrives) break;
      if (next.at >= state.timetableAt && !state.jobs.some(j => j.run === next.id)) openBuild(next, at);
    }
  }
  // Opens the job to build departure `run`: every car on the map whose
  // disposition is its block, up to DEPARTURE_MAX_CARS, those already on
  // its track first.
  function openBuild(run, at) {
    const tt = timetableEntry(run.tt), track = blockTracks(tt.block)[0];
    const onTrack = id => trackAt(state.vehicles[id]) === track ? 0 : 1;
    const cars = Object.keys(state.cars).filter(id => state.cars[id].away === null && dispositionOf(id) === tt.block)
      .sort((a, b) => onTrack(a) - onTrack(b)).slice(0, DEPARTURE_MAX_CARS);
    // A Retiro departure's build must be ready for its road loco off shed.
    return addJob({ kind: "build", title: `Build ${trainName(tt)}`, short: `Build ${tt.number}`, opens: at, due: run.at,
                    cars, run: run.id, block: tt.block, departed: null, ...(tt.east ? { ready: run.at - LOCO_OFF_SHED } : {}) });
  }
  // A departure's time has come. Built, or not taken (and so built now by
  // another crew), it leaves; taken and not reported done, it waits for
  // the player. With no job (its arrival still held), one opens and
  // another crew does it.
  function departureDue(run) {
    const j = state.jobs.find(j => j.run === run.id) || openBuild(run, run.at);
    if (j.taken && !j.result) return;
    if (!j.result) doOffScreen(j, run.at);
    depart(j, run.at);
  }
  // Build job `job`'s train leaves at `at`, taking its cars that stand
  // where they belong: on its track, left by the loco, sound. They go away,
  // off the map, on a trip to their waybills' stations; the rest wait for
  // the next train. A car whose flow has more than FLOW_SLACK cars over
  // its share will stay out in the pool once its trip is over.
  // A Retiro departure (#78) gives the cars its road loco took, `taken`,
  // which leave on the map, and its own delay.
  function depart(job, at, taken = null, delay = null) {
    const tt = timetableEntry(job.run.split(".")[0]), late = Math.max(0, at - job.due);
    const going = taken || job.cars.filter(id => state.cars[id].away === null && dispositionOf(id) === job.block && dispositionMet(id));
    for (const id of going) sendAway(id, at, `Left on ${trainName(tt)}${late >= ON_TIME_SECONDS ? `, ${lateText(late)} late` : ""}`, !!taken);
    job.departed = { at, cars: going.length, late };
    registerTrain({ number: tt.number, name: trainName(tt), passenger: false, kind: "departure", booked: job.due, late,
                    ...(delay || { cause: "Build not ready", yardLate: late }) });
  }
  // Car `id` leaves at `at` on a trip to its waybill's station: off the
  // map now, or, `onTrain`, as its train runs off it.
  function sendAway(id, at, text, onTrain = false) {
    if (!onTrain) {
      detach(id);
      delete state.vehicles[id];
    }
    const c = state.cars[id], x = c.waybill;
    const pool = !c.flow || flowCars(c.flow) > flowShare(c.flow) + FLOW_SLACK;
    const back = at + DESTINATIONS[x].away * (1 + TRIP_SPREAD * (2 * random() - 1));
    Object.assign(c, { away: at, trip: { at: x, back, pool } });
    logCar(id, text, at);
  }
  // At a shift change, the cars billed to a station reached through the
  // west end (#105) go out to it, off-screen: those standing where they
  // belong on its block's track, sound, and in no open job or the loco's
  // train.
  function toWestEnd(at) {
    const busy = new Set(openJobs().flatMap(j => j.cars));
    for (const id of Object.keys(state.cars)) {
      const c = state.cars[id], d = c.waybill && DESTINATIONS[c.waybill];
      if (!d || !d.westEnd || c.away !== null || c.badOrder || c.spot || busy.has(id)) continue;
      if (state.vehicles[id].speed !== 0 || !dispositionMet(id)) continue;
      sendAway(id, at, `Left at the west end for ${d.name}`);
    }
  }

  // Another crew does a job off-screen at `at`: each car not yet where it
  // belongs, standing and not in the loco's train, is set on a track of its
  // block. Cars it can't set (the track blocked or full) stay put.
  function doOffScreen(job, at) {
    const left = [];
    for (const id of job.cars) {
      if (dispositionMet(id)) continue;
      const v = state.vehicles[id];
      const track = v.speed === 0 && !inPlayerTrain(v) && !v.run && blockTracks(dispositionOf(id)).find(t => setOnTrack(t, id));
      if (track) logCar(id, `Set on ${YARD_TRACKS[track].name} by another crew`, at);
      else left.push(id);
    }
    job.result = { by: "crew", at, left };
    jobFinished(job, at);
  }
  // Takes vehicle `id` out of its train, splitting the train around it.
  function detach(id) {
    const v = state.vehicles[id], t = trainOf(v), i = t.vehicles.indexOf(id);
    for (const j of [i - 1, i + 1]) if (t.vehicles[j]) {
      const k = pairKey(id, t.vehicles[j]);
      delete state.air[k]; delete state.gaps[k];
    }
    delete state.trains[t.id];
    for (const part of [t.vehicles.slice(0, i), t.vehicles.slice(i + 1)]) {
      if (!part.length) continue;
      const nt = { id: "t" + state.nextTrain++, vehicles: part };
      for (const p of part) state.vehicles[p].train = nt.id;
      state.trains[nt.id] = nt;
    }
    v.train = null;
  }
  // Sets car `id` on yard track `trackId`, off-screen: the cars already
  // there and it are laid out again as one cut from the buffer, it at the
  // ladder end, or in its group's place for a block in block order, or by
  // its spot from the buffer for one in exact order. Not done, and false,
  // when a vehicle on the track is moving, is the loco or reaches off it,
  // or when the cut wouldn't stand clear.
  function setOnTrack(trackId, id) {
    const g = TRACK_GEOM[trackId], trains = new Set();
    for (const vid in state.vehicles) {
      const v = state.vehicles[vid], e = vehicleEnds(v);
      if ([v, e.head, e.tail].some(p => g.segs[p.seg])) trains.add(v.train);
    }
    const there = [];
    for (const tid of trains) for (const vid of state.trains[tid].vehicles) {
      const v = state.vehicles[vid], e = vehicleEnds(v);
      if (v.controls || v.speed !== 0 || !g.segs[e.head.seg] || !g.segs[e.tail.seg]) return false;
      if (vid !== id) there.push({ vid, d: trackOffset(trackId, v.seg, v.s) });
    }
    const cut = there.sort((a, b) => b.d - a.d).map(o => o.vid).concat(id);   // from the buffer
    const block = BLOCKS[YARD_TRACKS[trackId].block];
    if (block.ordering === "block") {
      const rank = vid => { const g = block.groups.indexOf(state.cars[vid].waybill); return dispositionOf(vid) === YARD_TRACKS[trackId].block && g >= 0 ? g : -1; };
      cut.sort((a, b) => rank(b) - rank(a));
    } else if (block.ordering === "exact") {
      const rank = vid => { const sp = state.cars[vid] && state.cars[vid].spot; return sp && sp.n ? sp.n : Infinity; };
      cut.sort((a, b) => rank(a) - rank(b));
    }
    const length = cut.reduce((sum, vid) => sum + vehicleType(state.vehicles[vid]).length, 0);
    if (length + SET_BACK > g.length - g.fouling) return false;
    for (const vid of cut) detach(vid);
    layOnTrack(trackId, cut);
    return true;
  }
  // Lays vehicles `ids`, in no train, out on yard track `trackId` as one
  // cut, listed from the buffer, SET_BACK off it, secured by the crew that
  // left it: the car at the buffer end has its hand brake set (#109), the
  // rest keep theirs as they were.
  function layOnTrack(trackId, ids) {
    const segs = YARD_TRACKS[trackId].segments, last = segs[segs.length - 1], dir = SEGMENTS[last].b === TRACK_GEOM[trackId].end ? 1 : -1;
    layTrain(last, dir > 0 ? segmentLength(last) - SET_BACK : SET_BACK, dir, ids);
    if (ids.length) state.vehicles[ids[0]].handBrake = true;
  }

  // Assesses a job the player reports done at `at` (docs/design/results.md):
  // correctness, ordering, moves against par, timeliness, and the cars
  // damaged while it was worked.
  function assess(job, at) {
    const st = jobStatus(job), moves = state.moves - job.movesAtTake;
    const par = PAR_PER_CAR_AND_BLOCK * (job.cars.length + job.blocks);
    let outcome;
    if (st.met === st.lines.length) outcome = !formationValid(st) ? "Invalid formation" : moves > par ? "Valid but inefficient" : "Operationally valid";
    else outcome = st.met ? "Partially complete" : "Incomplete";
    for (const l of st.lines) if (l.met && l.block && !l.away) logCar(l.id, `Left on ${YARD_TRACKS[trackAt(state.vehicles[l.id])].name}, ${BLOCKS[l.block].name}`, at);
    job.result = { by: "player", at, outcome, met: st.met, total: st.lines.length, inOrder: st.inOrder, cut: st.cut,
                   moves, par, late: Math.max(0, at - readyBy(job)) };
    jobFinished(job, at);
  }

  // The main line (#56, #57; docs/design/living-railway.md). Through
  // trains are offered OFFER_LEAD_SECONDS before they reach the map's edge.
  // With the main clear (no one holding it), the station gives line clear
  // and the train runs through, driven by the game; otherwise it is held,
  // standing at the east home signal or off the map at the station side,
  // until the player reports clear, and the wait is the player's delay. The
  // player holds the main by asking for it for a time, when no train is due
  // in it; a train offered while they hold it calls them off. A passenger
  // train offered at night with the main not clear is refused line clear
  // (#104): it waits at the station behind, and is offered again once the
  // main is clear, reaching the map OFFER_LEAD_SECONDS after that.
  // A run's `at` is its booked time at the map's edge; `enters`, when it
  // will actually get there once it has line clear.
  const throughEntry = id => THROUGH_TIMETABLE.find(t => t.id === id);
  const throughName = tt => tt.name ? `${tt.number} ${tt.name}` : `${tt.number} from ${tt.from}`;
  const byDay = at => { const t = at % DAY; return t >= DAYLIGHT_FROM && t < DAYLIGHT_TO; };
  const waitsAt = tt => THROUGH_EDGES[tt.enters].station;
  const throughRun = id => state.through.find(r => r.id === id);
  // The through train or Retiro road train a train belongs to, if it is
  // one: the game drives it.
  function drivenBy(t) {
    const v = t && state.vehicles[t.vehicles[0]];
    return v && v.run ? throughRun(v.run) || roadRun(v.run) : null;
  }
  // Where a train coming in at map edge `edge` stands `d` metres in from
  // it, facing in: the segment, how far along it, and the sense it faces.
  function inFromEdge(edge, d) {
    const node = THROUGH_EDGES[edge].node, seg = SEGMENTS_AT[node][0];
    const atA = SEGMENTS[seg].a === node;
    const w = walk(seg, atA ? 0 : segmentLength(seg), atA ? 1 : -1, d);
    return { seg: w.seg, s: w.s, dir: w.travel };
  }
  const homeSignal = () => inFromEdge("east", HOME_SIGNAL_IN);
  // A through train's vehicle kinds, head first, and its vehicles' ids: the
  // run's id and the place in the make-up.
  const throughKinds = tt => { const c = THROUGH_CONSISTS[tt.consist]; return [c.loco, ...c.cars]; };
  const throughIds = r => throughKinds(throughEntry(r.tt)).map((_, i) => `${r.id}/${i}`);
  const throughType = id => { const [run, i] = id.split("/"); return throughKinds(throughEntry(run.split(".")[0]))[Number(i)]; };
  const throughLength = tt => throughKinds(tt).reduce((sum, type) => sum + VEHICLE_TYPES[type].length, 0);
  // The main is clear for a train when no one holds it: the player gives it
  // back only with the crossover lying for the main and nothing of theirs on
  // the running tracks (reportClear); a Retiro road train, once it is in
  // clear on the yard's track or gone off the map.
  const mainClear = () => !state.main.held && !roadOnMain();

  // Offers each through train whose time has come, gives line clear or holds
  // each one reaching the map, and lets go those held once the main is
  // clear.
  function mainEvents() {
    for (const run of runsBetween(state.throughAt + OFFER_LEAD_SECONDS, state.clock + OFFER_LEAD_SECONDS, THROUGH_TIMETABLE)) {
      state.throughAt = run.at - OFFER_LEAD_SECONDS + 1;
      const tt = throughEntry(run.tt), r = { id: run.id, tt: run.tt, at: run.at, enters: run.at, status: "offered", speed: 0, vehicles: [] };
      state.through.push(r);
      if (mainClear()) continue;
      if (tt.passenger && !byDay(run.at - OFFER_LEAD_SECONDS)) {
        r.status = "refused";
        r.cause = `Held at ${waitsAt(tt)} by night`;
        setNotice(`${tt.number} held at ${waitsAt(tt)}: night`);
      } else setNotice(state.main.held ? `Clear the main for ${throughName(tt)}` : `${throughName(tt)} held for ${roadName(roadOnMain())}`);
    }
    for (const r of state.through) {
      const tt = throughEntry(r.tt);
      if (r.status === "refused" && mainClear()) {
        // Line clear at last: it sets off, OFFER_LEAD_SECONDS out. Its
        // delay is its lateness at the map's edge.
        r.status = "offered";
        r.enters = Math.max(r.at, state.clock + OFFER_LEAD_SECONDS);
        const delay = r.late = r.enters - r.at;
        if (delay > 0) for (const j of openJobs()) if (j.taken) j.trainsHeld.push({ number: tt.number, delay });
        setNotice(`${tt.number} leaves ${waitsAt(tt)}${delay >= ON_TIME_SECONDS ? `, ${lateText(delay)} late` : ""}`);
      }
      if (r.status === "offered" && r.enters <= state.clock) {
        if (!mainClear()) holdThrough(r);
        else if (state.clock - r.enters < (MAIN_LENGTH + throughLength(tt)) / THROUGH_SPEED) runThrough(r, THROUGH_SPEED);
        else { r.status = "gone"; registerThrough(r); }  // passed while the clock skipped
      }
      if (r.status === "held" && mainClear()) {
        const delay = state.clock - r.at;
        // Late by its wait, and from the home signal by its restart too.
        r.late = delay + (r.vehicles.length ? THROUGH_SPEED / (2 * THROUGH_ACCEL) : 0);
        for (const j of openJobs()) if (j.taken) j.trainsHeld.push({ number: tt.number, delay });
        setNotice(`${throughName(tt)} held ${lateText(delay)} for the main`);
        if (r.vehicles.length) { r.status = "running"; r.speed = 0; } else runThrough(r, THROUGH_SPEED);
      }
    }
    state.through = state.through.filter(r => r.status !== "gone");
  }
  // A through train reaches the map with the main not clear: from the east
  // it stands at the home signal, if nothing is in the way there; otherwise
  // it waits off the map.
  function holdThrough(r) {
    r.status = "held";
    const road = roadOnMain();
    r.cause = road ? `Held for ${roadName(road)}` : state.clock > state.main.until ? "Main kept past its time" : "Held for the main";
    const tt = throughEntry(r.tt), sig = homeSignal(), sx = pointOn(sig.seg, sig.s).x;
    const inTheWay = Object.values(state.vehicles).some(v => RUNNING.has(v.seg) && pointOn(v.seg, v.s).x > sx - 20);
    if (tt.enters === "east" && !inTheWay) layThrough(r, sig);
  }
  // A through train comes in at its edge of the map at `speed`.
  function runThrough(r, speed) {
    r.status = "running"; r.speed = speed;
    const tt = throughEntry(r.tt);
    layThrough(r, inFromEdge(tt.enters, throughLength(tt)));
  }
  function layThrough(r, at) {
    const ids = throughIds(r);
    for (const id of ids) { addVehicle(id, throughType(id)); state.vehicles[id].run = r.id; }
    layTrain(at.seg, at.s, at.dir, ids);
    r.vehicles = ids;
  }
  // Each step: a train starting away gathers speed, and a running train's
  // vehicles leave the map one by one at its far edge; gone, it's done.
  function stepThrough(dt) {
    for (const r of state.through) {
      if (r.status !== "running") continue;
      r.speed = Math.min(THROUGH_SPEED, r.speed + THROUGH_ACCEL * dt);
      for (;;) {
        const v = state.vehicles[r.vehicles[0]];
        if (!v) break;
        const e = vehicleEnds(v).head;
        if (walk(e.seg, e.s, e.travel, 1).short <= 0) break;
        detach(v.id);
        delete state.vehicles[v.id];
        r.vehicles.shift();
      }
      if (!r.vehicles.length) { r.status = "gone"; registerThrough(r); }
    }
    state.through = state.through.filter(r => r.status !== "gone");
  }
  // Junín's train register (#62; RITO art. 41, 219): a line for each train
  // that runs, road trains as they arrive or leave and through trains as
  // they pass, with its booked time, the time it actually ran (booked plus
  // how late), and, when the yard made it late, the cause. A line's
  // `yardLate` is the part of its lateness the yard caused, when not all of
  // it (#78). Lines older than REGISTER_DAYS days are dropped.
  function registerTrain(line) {
    const from = (Math.floor(state.clock / DAY) - (REGISTER_DAYS - 1)) * DAY;
    state.register = state.register.filter(l => l.actual >= from);
    const yardLate = line.yardLate === undefined ? line.late : line.yardLate;
    state.register.push({ ...line, actual: line.booked + line.late, cause: yardLate >= ON_TIME_SECONDS ? line.cause || null : null });
  }
  // A through train has passed. Its lateness is when it leaves the map
  // against when it would have left running through unhindered: the time
  // it waited, and from a stand at the home signal its restart too.
  function registerThrough(r) {
    const tt = throughEntry(r.tt);
    registerTrain({ number: tt.number, name: throughName(tt), passenger: !!tt.passenger, kind: "through",
                    booked: r.at, late: r.late || 0, cause: r.cause || null });
  }

  // When the next through train not yet offered will be.
  function nextOfferAt() {
    const run = runsBetween(state.throughAt + OFFER_LEAD_SECONDS, state.clock + DAY + OFFER_LEAD_SECONDS, THROUGH_TIMETABLE)[0];
    return run ? { at: run.at - OFFER_LEAD_SECONDS, tt: throughEntry(run.tt) } : null;
  }

  // Retiro's road trains (#78; docs/design/living-railway.md). An arrival
  // is offered OFFER_LEAD_SECONDS before it reaches the map's east edge,
  // ROAD_IN_TIME before it is due on Track 3. The station accepts it only
  // with Track 3 and its route clear of vehicles and fouling, the main not
  // held, and no through train due on the main during its run in; otherwise
  // it is refused, waits at La Oriental, and is offered again once all of
  // that holds, still OFFER_LEAD_SECONDS out. A player holding the main is
  // called off. Accepted, its route is set and locked, and it runs in,
  // driven by the game, on sight, to Track 3's buffer; there the route is
  // unlocked, the crossover padlocked for the main, and its loco cuts off
  // and goes on west, off the map. A departure's road loco comes off the
  // fan LOCO_OFF_SHED before it leaves, once the build is ready (another
  // crew builds it then if it isn't taken) and the loco's route is clear;
  // it couples to the east end of the block's cut, the station checks the
  // train for DEPARTURE_CHECK, and at its time, accepted as an arrival is,
  // it pulls out over the crossover. Each run keeps how long it waited, by
  // cause: a wait on a through train or another road train isn't the
  // yard's.
  const roadRun = id => state.road.find(r => r.id === id);
  const roadName = r => trainName(timetableEntry(r.tt));
  const ROAD_LOCO_LENGTH = VEHICLE_TYPES[ROAD_LOCO].length;
  const trainLength = t => t.vehicles.reduce((sum, id) => sum + vehicleType(state.vehicles[id]).length, 0);
  // Each route's legs, built once from WORLD DATA: the path from the leg's
  // `from`, segment by segment (`pieces`, each with how far along it
  // starts and the sense it is run in), with switches lying as it sets
  // them, to the end of track or a facing switch it doesn't set; how far
  // along it each node is; the stretches of it on the main; and, by
  // segment off it, each metre within FOULING_CLEARANCE of it, with how
  // far along the path it fouls. A leg after the first starts where its
  // loco, reversed, stood at the last one's stop (`checkFrom`).
  function buildLeg(spec) {
    const leg = { ...spec, pieces: [], index: {}, nodes: { [spec.from]: 0 }, main: [], zone: {}, length: 0, checkFrom: 0 };
    let node = spec.from, seg = SEGMENTS_AT[node] && SEGMENTS_AT[node].length === 1 ? SEGMENTS_AT[node][0] : null;
    while (seg && !leg.index[seg]) {
      const sense = SEGMENTS[seg].a === node ? 1 : -1, len = segmentLength(seg), piece = { seg, from: leg.length, sense };
      leg.pieces.push(piece);
      leg.index[seg] = piece;
      if (ofTrack(seg, "main")) {
        const last = leg.main[leg.main.length - 1];
        if (last && last[1] === leg.length) last[1] += len; else leg.main.push([leg.length, leg.length + len]);
      }
      leg.length += len;
      node = sense > 0 ? SEGMENTS[seg].b : SEGMENTS[seg].a;
      leg.nodes[node] = leg.length;
      const sw = SWITCHES[node];
      seg = sw ? (seg === sw.trunk ? spec.set[node] || null : sw.trunk) : SEGMENTS_AT[node].find(id => id !== seg) || null;
    }
    leg.end = node;
    const CELL = 8, grid = {};
    for (const p of leg.pieces) for (let d = 0, len = segmentLength(p.seg); d <= len; d += 1) {
      const q = pointOn(p.seg, p.sense > 0 ? d : len - d), k = `${Math.floor(q.x / CELL)},${Math.floor(q.y / CELL)}`;
      (grid[k] = grid[k] || []).push({ x: q.x, y: q.y, along: p.from + d });
    }
    for (const seg in SEGMENTS) {
      if (leg.index[seg]) continue;
      for (let s = 0, len = segmentLength(seg); s <= len; s += 1) {
        const q = pointOn(seg, s), cx = Math.floor(q.x / CELL), cy = Math.floor(q.y / CELL);
        let best = null;
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of grid[`${cx + i},${cy + j}`] || [])
          if (Math.hypot(o.x - q.x, o.y - q.y) < FOULING_CLEARANCE && (best === null || o.along < best)) best = o.along;
        if (best !== null) (leg.zone[seg] = leg.zone[seg] || {})[Math.round(s)] = best;
      }
    }
    return leg;
  }
  // How far along `leg` the point `s` on `seg` is (the segment on it), and
  // the point `along` metres along it, with the sense it is run in there.
  function alongOf(leg, seg, s) {
    const p = leg.index[seg];
    return p.from + (p.sense > 0 ? s : segmentLength(seg) - s);
  }
  function pointAt(leg, along) {
    for (const p of leg.pieces) {
      const len = segmentLength(p.seg);
      if (along <= p.from + len + EPS) {
        const d = Math.max(0, Math.min(len, along - p.from));
        return { seg: p.seg, s: p.sense > 0 ? d : len - d, travel: p.sense };
      }
    }
    return null;
  }
  // Where a road train `len` long stops on `leg`, as how far along it its
  // head stands: SET_BACK off the buffer, or ROAD_STAND_CLEAR past the
  // switch or the yard track's fouling point it clears. Off the map's edge,
  // or against a cut, it has no fixed stop.
  function legStop(leg, len) {
    if (leg.stop === "buffer") return leg.length - SET_BACK;
    if (leg.stop === "edge" || leg.stop === "cut") return Infinity;
    const c = leg.stop.clearOf, track = YARD_TRACKS[c];
    return leg.nodes[track ? track.switch : c] + (track ? TRACK_GEOM[c].fouling : 0) + len + ROAD_STAND_CLEAR;
  }
  const ROAD_LEGS = {};
  for (const id in ROAD_ROUTES) ROAD_LEGS[id] = ROAD_ROUTES[id].map(buildLeg);
  for (const id in ROAD_LEGS) ROAD_LEGS[id].forEach((leg, i, legs) => {
    if (!i) return;
    const prev = legs[i - 1], tail = pointAt(prev, legStop(prev, ROAD_LOCO_LENGTH) - ROAD_LOCO_LENGTH);
    if (tail && leg.index[tail.seg]) leg.checkFrom = alongOf(leg, tail.seg, tail.s);
  });
  // The switches each route sets, and which a run has locked as each lies
  // for the leg it is on (or the next that sets it).
  const ROUTE_SWITCHES = {};
  for (const id in ROAD_ROUTES) ROUTE_SWITCHES[id] = [...new Set(ROAD_ROUTES[id].flatMap(l => Object.keys(l.set)))];
  function lockedFor(r, swId) {
    const legs = ROAD_ROUTES[r.route];
    for (let k = r.leg; k < legs.length; k++) if (legs[k].set[swId]) return legs[k].set[swId];
    for (let k = r.leg - 1; k >= 0; k--) if (legs[k].set[swId]) return legs[k].set[swId];
    return null;
  }
  // The Retiro road train holding switch `swId` locked, if one does.
  const roadLock = swId => state.road.find(r => r.locks.includes(swId)) || null;

  // The fastest a road train `len` long, its head `pos` along `leg`, may
  // go to stop by `stopAt`: THROUGH_SPEED with all of it on the main,
  // braking at ROAD_DECEL to YARD_SPEED where the main ends ahead (unless
  // at the map's edge), and to a stand at `stopAt`.
  function roadCap(leg, pos, len, stopAt) {
    let cap = YARD_SPEED;
    for (const [a, b] of leg.main) {
      if (pos - len >= a - EPS && pos <= b + EPS) cap = THROUGH_SPEED;
      if (pos >= a && pos < b && b < leg.length) cap = Math.min(cap, Math.sqrt(YARD_SPEED ** 2 + 2 * ROAD_DECEL * (b - pos)));
    }
    return Math.min(cap, Math.sqrt(2 * ROAD_DECEL * Math.max(0, stopAt - pos)));
  }
  // How long a road train `len` long takes over `legs` with nothing in its
  // way, its head starting `from` along the first; a leg against a cut
  // stops `cutAt` along it, and one off the map's edge runs until all of
  // it is off. Worked out once, a step of a quarter second at a time.
  function nominalTime(legs, len, from, cutAt = 0) {
    const dt = 0.25;
    let t = 0;
    legs.forEach((leg, i) => {
      const edge = leg.stop === "edge", stop = leg.stop === "cut" ? cutAt : legStop(leg, len), done = edge ? leg.length + len : stop - 0.02;
      let pos = i ? leg.checkFrom : from, v = 0;
      for (let n = 0; pos < done && n < 1e5; n++) {
        const cap = roadCap(leg, Math.min(pos, leg.length), len, edge ? Infinity : stop);
        v = v < cap ? Math.min(cap, v + THROUGH_ACCEL * dt) : cap;
        pos += v * dt;
        t += dt;
      }
    });
    return t;
  }
  // The yard track a leg ends on (or, leaving the map, starts from), and how
  // far along the leg its switch is.
  const legTrack = leg => Object.keys(YARD_TRACKS).find(t => TRACK_GEOM[t].end === (MAP_EDGES.includes(leg.end) ? leg.from : leg.end));
  const trackFrom = leg => leg.nodes[YARD_TRACKS[legTrack(leg)].switch];
  // An arrival's run in, from the edge to Track 3's buffer; a departure's
  // run out, the longest train from Track 1's switch until off the map; its
  // loco's run off shed, to a cut halfway down Track 1. A skip does them at
  // once, taking these times.
  const ROAD_IN_TIME = nominalTime(ROAD_LEGS.in, 0, 0);
  const LONGEST_DEPARTURE = ROAD_LOCO_LENGTH + DEPARTURE_MAX_CARS
    * Math.max(...Object.values(VEHICLE_TYPES).filter(t => !t.loco && !t.coach).map(t => t.length));
  const ROAD_OUT_TIME = nominalTime(ROAD_LEGS.out, LONGEST_DEPARTURE, trackFrom(ROAD_LEGS.out[0]));
  const shedLast = ROAD_LEGS.shed[ROAD_LEGS.shed.length - 1];
  const LOCO_RUN_TIME = nominalTime(ROAD_LEGS.shed, ROAD_LOCO_LENGTH, SET_BACK + ROAD_LOCO_LENGTH,
                                    trackFrom(shedLast) + TRACK_GEOM[legTrack(shedLast)].length / 2);
  // How far ahead of its time a Retiro road train starts: an arrival is
  // offered, a departure's loco is due off shed.
  const roadStartAt = (tt, at) => tt.arrives ? at - ROAD_IN_TIME - OFFER_LEAD_SECONDS : at - LOCO_OFF_SHED;
  const ROAD_LEAD = Math.max(ROAD_IN_TIME + OFFER_LEAD_SECONDS, LOCO_OFF_SHED);
  // The next Retiro road train still to start, with when it starts.
  function nextRoadRun() {
    const run = runsBetween(state.roadAt, state.clock + ROAD_LEAD).find(r => timetableEntry(r.tt).east);
    return run ? { ...run, start: roadStartAt(timetableEntry(run.tt), run.at) } : null;
  }
  // Why a run waits, by cause: the yard's, and the rest (a through train or
  // another road train due, which aren't). The register's cause for each.
  const ROAD_CAUSES = { track: `Refused: Track ${YARD_TRACKS[ARRIVAL_TRACK].number} not clear`, route: "Route not clear",
                        build: "Build not ready", main: "Main held" };
  const WAIT_TEXT = { track: `Track ${YARD_TRACKS[ARRIVAL_TRACK].number} not clear`, route: "route not clear",
                      build: "build not ready", main: "main held", through: "a through train is due", train: "another road train" };
  // Whether a run holds the main: an arrival from acceptance until it
  // stands in clear, a departure from pulling out until it is gone. The
  // run that does, if one does.
  const holdsMain = r => r.kind === "arrival" ? r.status === "accepted" || r.status === "running" : r.status === "running";
  const roadOnMain = () => state.road.find(holdsMain) || null;

  // A Retiro road train's time `run` has come, at `at`: an arrival is
  // offered; a departure's build job, opened now if its arrival hasn't
  // come, waits for its loco. advanceRoad() decides the rest.
  function startRoad(run, at) {
    state.roadAt = run.at + 1;
    const tt = timetableEntry(run.tt);
    const r = { id: run.id, tt: run.tt, at: run.at, kind: tt.arrives ? "arrival" : "departure", status: tt.arrives ? "refused" : "waiting",
                route: tt.arrives ? "in" : "shed", leg: 0, legSet: false, locks: [], speed: 0, vehicles: [], cars: [], blocked: false,
                enters: null, until: null, job: null, notional: false, light: false, why: null, wait: {}, checkedAt: at };
    if (!tt.arrives) r.job = (state.jobs.find(j => j.run === run.id) || openBuild(run, at)).id;
    state.road.push(r);
    if (tt.arrives) setNotice(`${trainName(tt)} offered, for Track ${YARD_TRACKS[ARRIVAL_TRACK].number}`);
  }
  // The time a run moves on by itself, if it does, for a skip: an
  // arrival accepted is in, a departure's check is done or its time comes.
  function roadWake(r) {
    if (r.kind === "arrival") return r.status === "accepted" ? r.enters + ROAD_IN_TIME : null;
    return r.status === "check" ? r.until : r.status === "ready" ? r.at : null;
  }
  // Notes why run `r` is waiting at `now` (null: it isn't), adding the time
  // since it was last checked to its last cause, and tells the player
  // when the cause changes.
  function noteWait(r, now, why) {
    if (r.why) r.wait[r.why] = (r.wait[r.why] || 0) + Math.max(0, now - r.checkedAt);
    if (why && why !== r.why) setNotice(why === "main" ? `Clear the main for ${roadName(r)}`
      : `${roadName(r)}${r.kind === "arrival" ? " refused" : ""}: ${WAIT_TEXT[why]}`);
    r.why = why;
    r.checkedAt = now;
  }
  const checkDue = (r, now, instant) => instant || r.why === null || now - r.checkedAt >= ROAD_CHECK_SECONDS;
  // Whether an earlier run the same way is still waiting, or a departure
  // still standing: road trains go first come, first served.
  const queued = r => state.road.some(o => o !== r && o.kind === r.kind && state.road.indexOf(o) < state.road.indexOf(r)
    && (o.kind === "arrival" ? o.status === "refused" : o.status !== "running"));
  // A run's lateness by cause: what it waited on that isn't the yard's
  // (through trains, other road trains) is taken off; any lateness its
  // waits don't account for was lost stopped on sight. The cause is the
  // yard's longest wait.
  function roadDelay(r, late) {
    const wait = { ...r.wait }, waited = Object.values(wait).reduce((t, w) => t + w, 0);
    if (late > waited) wait.route = (wait.route || 0) + late - waited;
    const yardLate = Math.max(0, late - (wait.through || 0) - (wait.train || 0));
    const worst = Object.keys(ROAD_CAUSES).filter(c => wait[c] > 0).sort((a, b) => wait[b] - wait[a])[0];
    return { cause: worst ? ROAD_CAUSES[worst] : null, yardLate };
  }

  // Whether a through train is due on the main between `now` and
  // `seconds` later: one offered whose run over the map falls in that time,
  // or not yet offered and due in it, or one held, refused or running.
  function throughDue(now, seconds) {
    const runFor = tt => (MAIN_LENGTH + throughLength(tt)) / THROUGH_SPEED;
    for (const r of state.through) {
      if (r.status !== "offered") return true;
      if (r.enters + runFor(throughEntry(r.tt)) > now && r.enters < now + seconds) return true;
    }
    return runsBetween(state.throughAt + OFFER_LEAD_SECONDS, now + seconds, THROUGH_TIMETABLE)
      .some(x => x.at + runFor(throughEntry(x.tt)) > now);
  }
  // Whether another run has locked a switch that route `route` sets.
  const roadBusy = (r, route) => state.road.some(o => o !== r && o.locks.some(id => ROUTE_SWITCHES[route].includes(id)));
  // What stands in the way on `leg` from `from` to `to` metres along it:
  // each point of a vehicle (not one of run `r`'s) on it, or fouling it,
  // with how far along, nearest first. Points every 2 m or so along each
  // vehicle are looked at.
  function legHits(leg, from, to, r) {
    const own = new Set(r ? r.vehicles : []), hits = [];
    for (const id in state.vehicles) {
      if (own.has(id)) continue;
      const v = state.vehicles[id], half = vehicleType(v).length / 2, n = Math.ceil(half);
      for (let i = 0; i <= n; i++) {
        const d = -half + i * 2 * half / n, p = walk(v.seg, v.s, d >= 0 ? v.dir : -v.dir, Math.abs(d));
        const on = !!leg.index[p.seg], z = leg.zone[p.seg];
        const along = on ? alongOf(leg, p.seg, p.s) : z ? z[Math.round(p.s)] : undefined;
        if (along !== undefined && along >= from && along <= to) hits.push({ along, id, foul: !on });
      }
    }
    return hits.sort((a, b) => a.along - b.along);
  }
  // Whether car `id` is for departure `r`'s train: in its build, for its
  // block (so sound), and on the map.
  function forTrain(r, id) {
    const j = jobById(r.job), c = state.cars[id];
    return !!j && !!c && j.cars.includes(id) && c.away === null && dispositionOf(id) === j.block;
  }
  // Whether a train is a cut departure `r`'s loco takes from: a car for
  // its train at the end the loco meets, no loco in it, and not driven.
  function takesFrom(r, t, endId) {
    return forTrain(r, endId) && !drivenBy(t) && !t.vehicles.some(id => state.vehicles[id].controls);
  }
  // On a leg against a cut, from `from`: how far along the cut's end is,
  // null when nothing stands there (no cut to take), false when what is
  // met first isn't one, or something fouls the way first.
  function cutAhead(leg, from, r) {
    const hit = legHits(leg, from, Infinity, r)[0];
    if (!hit) return null;
    const v = state.vehicles[hit.id];
    return !hit.foul && takesFrom(r, trainOf(v), hit.id) ? hit.along : false;
  }
  // Why an arrival can't be accepted, or null: the main held, a through
  // train due before it is in clear, another road train's route, Track 3
  // not clear, its route not clear.
  function arrivalBlock(r, now) {
    if (state.main.held) return "main";
    if (throughDue(now, OFFER_LEAD_SECONDS + ROAD_IN_TIME)) return "through";
    if (roadBusy(r, "in")) return "train";
    if (!trackClear(ARRIVAL_TRACK)) return "track";
    if (legHits(ROAD_LEGS.in[0], 0, Infinity, r).length) return "route";
    return null;
  }
  // Why a departure's loco can't come off shed, or null. With nothing on
  // Track 1 for it to take, it doesn't come: the departure is `light`.
  function shedBlock(r) {
    if (roadBusy(r, "shed")) return "train";
    const legs = ROAD_LEGS.shed, last = legs.length - 1;
    for (let k = 0; k < last; k++)
      if (legHits(legs[k], legs[k].checkFrom, legStop(legs[k], ROAD_LOCO_LENGTH) + ROAD_SIGHT_MARGIN, r).length) return "route";
    const cut = cutAhead(legs[last], legs[last].checkFrom, r);
    if (cut === false) return "route";
    r.light = cut === null;
    return null;
  }
  // Why a departure can't pull out at `now`, or null: as an arrival, with
  // its route from its head (or Track 1's switch, before its loco is on).
  function outBlock(r, now) {
    if (state.main.held) return "main";
    if (throughDue(now, ROAD_OUT_TIME)) return "through";
    if (roadBusy(r, "out")) return "train";
    const leg = ROAD_LEGS.out[0], head = r.vehicles.length && roadHead(r);
    const from = head && leg.index[head.seg] ? alongOf(leg, head.seg, head.s) : trackFrom(leg);
    return legHits(leg, from, Infinity, r).length ? "route" : null;
  }
  // The front end of a run's train, the way it is going.
  function roadHead(r) {
    const t = trainOf(state.vehicles[r.vehicles[0]]);
    return vehicleEnds(state.vehicles[t.vehicles[0]]).head;
  }

  // Sets and locks route `route` for run `r`, from its first leg.
  function lockRoute(r, route) {
    Object.assign(r, { route, leg: 0, locks: [...ROUTE_SWITCHES[route]] });
    r.legSet = setLeg(r);
  }
  // Sets the switches of the leg run `r` is on; false while one that must
  // move has a vehicle on it.
  function setLeg(r) {
    const set = ROAD_ROUTES[r.route][r.leg].set;
    for (const id in set) if (state.switches[id].set !== set[id]) {
      if (nodeOccupied(id)) return false;
      state.switches[id].set = set[id];
    }
    return true;
  }
  // The station unlocks a run's route and padlocks the crossover lying for
  // the main again.
  function unlockRoute(r) {
    r.locks = [];
    for (const id of MAIN_SWITCHES) if (!nodeOccupied(id)) state.switches[id].set = SWITCHES[id].normal;
  }

  // Moves run `r` on at `now`, as far as it can go without moving a
  // vehicle (stepRoad() drives those); `instant` in a skip, which does its
  // moves at once.
  function advanceRoad(r, now, instant) {
    if (r.kind === "arrival") {
      if (r.status === "refused" && checkDue(r, now, instant)) {
        const why = queued(r) ? "train" : arrivalBlock(r, now);
        noteWait(r, now, why);
        if (!why) acceptArrival(r, now);
      }
      if (r.status === "accepted") {
        if (!instant) { if (now >= r.enters) enterArrival(r, now); }
        else if (now >= r.enters + ROAD_IN_TIME && trackClear(ARRIVAL_TRACK)) {
          unlockRoute(r);
          arrive(r, r.enters + ROAD_IN_TIME, r);
          r.status = "gone";
        }
      }
      if (r.status === "cutting" && (instant || now >= r.until)) cutOff(r);
    } else {
      const job = jobById(r.job);
      if (r.status === "waiting" && checkDue(r, now, instant)) {
        if (job && !job.result && !job.taken) doOffScreen(job, now);
        const why = !job || !job.result ? "build" : queued(r) ? "train" : shedBlock(r);
        noteWait(r, now, why);
        if (!why) offShed(r, now, instant);
      }
      if (r.status === "hooking" && (instant || now >= r.until)) hookOn(r, now);
      if (r.notional && !instant) placeLoco(r, now);
      if (r.status === "check" && now >= r.until) r.status = "ready";
      if (r.status === "ready" && now >= r.at && checkDue(r, now, instant)) {
        const why = r.light ? null : outBlock(r, now);
        noteWait(r, now, why);
        if (!why) pullOut(r, now, instant);
      }
    }
    if (r.status === "gone") state.road = state.road.filter(o => o !== r);
  }
  // An arrival accepted at `now`: its route set and locked, it reaches the
  // map OFFER_LEAD_SECONDS later.
  function acceptArrival(r, now) {
    lockRoute(r, "in");
    Object.assign(r, { status: "accepted", enters: now + OFFER_LEAD_SECONDS });
    if (r.wait.track || r.wait.route || r.wait.main || r.wait.through || r.wait.train)
      setNotice(`${roadName(r)} leaves La Oriental, for Track ${YARD_TRACKS[ARRIVAL_TRACK].number}`);
  }
  // An arrival reaches the map's east edge at `now`, at line speed, loco
  // first, with the cars due back by when it will stand on Track 3; with
  // none, it is only registered. It waits off the map while anything is
  // in the way at the edge.
  function enterArrival(r, now) {
    const tt = timetableEntry(r.tt), leg = ROAD_LEGS.in[0];
    const ids = arrivalCars(tt, now + ROAD_IN_TIME);
    if (!ids.length) {
      unlockRoute(r);
      arrive(r, now + ROAD_IN_TIME, r);
      r.status = "gone";
      return;
    }
    const len = ROAD_LOCO_LENGTH + ids.reduce((sum, id) => sum + VEHICLE_TYPES[state.cars[id].type].length, 0);
    if (legHits(leg, 0, len + ROAD_SIGHT_MARGIN, r).length) return;
    const loco = `${r.id}/loco`, head = pointAt(leg, len);
    addVehicle(loco, ROAD_LOCO);
    for (const id of ids) addVehicle(id, state.cars[id].type);
    layTrain(head.seg, head.s, head.travel, [loco, ...ids]);
    for (const id of [loco, ...ids]) state.vehicles[id].run = r.id;
    Object.assign(r, { status: "running", vehicles: [loco, ...ids], cars: ids, speed: roadCap(leg, len, len, Infinity) });
  }
  // An arrival stands at Track 3's buffer at `now`: it has arrived; the
  // route is unlocked, the crossover padlocked, and its loco cuts off.
  function arrivedRoad(r, now) {
    unlockRoute(r);
    arrive(r, now, r);
    Object.assign(r, { status: "cutting", until: now + HOOK_UP_SECONDS, speed: 0 });
  }
  // Its loco cut off, it goes on west, off the map toward the station; the
  // cars stand secured, the hand brake set on the car at the buffer end.
  function cutOff(r) {
    const loco = `${r.id}/loco`;
    if (state.vehicles[loco]) { detach(loco); delete state.vehicles[loco]; }
    for (const id of r.cars) if (state.vehicles[id]) delete state.vehicles[id].run;
    if (r.cars.length && state.vehicles[r.cars[0]]) state.vehicles[r.cars[0]].handBrake = true;
    r.status = "gone";
  }
  // A departure's loco comes off shed at `now`, its route set and locked:
  // onto fan track 8's end, light. In a skip it is coupled and checked by
  // the time it would have been (`notional` until it is laid on). With
  // nothing to take, none comes.
  function offShed(r, now, instant) {
    if (r.light) { r.status = "ready"; return; }
    if (instant) { Object.assign(r, { status: "check", notional: true, until: now + LOCO_RUN_TIME + HOOK_UP_SECONDS + DEPARTURE_CHECK }); return; }
    lockRoute(r, "shed");
    const id = `${r.id}/loco`, head = pointAt(ROAD_LEGS.shed[0], SET_BACK + ROAD_LOCO_LENGTH);
    addVehicle(id, ROAD_LOCO);
    layTrain(head.seg, head.s, head.travel, [id]);
    state.vehicles[id].run = r.id;
    Object.assign(r, { status: "shed", vehicles: [id], speed: 0 });
    setNotice(`Road loco off shed for ${roadName(r)}`);
  }
  // The road crew hooks the loco on (#33): to the cut it met, taking the
  // cars for the train from that end and leaving the rest. The station
  // checks the train for DEPARTURE_CHECK. If the cut has moved off, the
  // loco goes on to it.
  function hookOn(r, now) {
    const loco = state.vehicles[`${r.id}/loco`], lt = trainOf(loco);
    const hit = findObstacle(vehicleEnds(loco).head, HOOK_REACH, lt.id);
    const cut = hit && hit.kind === "train" && state.trains[hit.train];
    if (!cut || !takesFrom(r, cut, endVehicle(cut, hit.which).id)) { r.status = "shed"; return; }
    coupleCut(r, lt, cut, hit.which, hit.gap);
    unlockRoute(r);
    Object.assign(r, { status: "check", until: now + DEPARTURE_CHECK });
  }
  function coupleCut(r, lt, cut, which, gap) {
    const order = which === "head" ? cut.vehicles.slice() : cut.vehicles.slice().reverse();
    let n = 1;
    while (n < order.length && forTrain(r, order[n])) n++;
    if (n < order.length) splitBehind(order[n - 1], order[n]);
    const taken = trainOf(state.vehicles[order[0]]);
    const end = taken.vehicles.length === 1 ? which : taken.vehicles[0] === order[0] ? "head" : "tail";
    for (const id of taken.vehicles) moveVehicle(state.vehicles[id], (end === "head" ? 1 : -1) * gap);
    couple(lt, "head", taken, end);      // the loco leads, away from the cut
    for (const id of lt.vehicles) state.vehicles[id].run = r.id;
    r.vehicles = lt.vehicles.slice();
  }
  // After a skip, a loco coupled and checked meanwhile is laid on against
  // its cut on Track 1. Without its cut there, the train leaves as before
  // #78, its cars going off the map at once.
  function placeLoco(r) {
    const leg = ROAD_LEGS.shed[ROAD_LEGS.shed.length - 1], start = pointAt(leg, trackFrom(leg));
    const hit = findObstacle(start, TRACK_GEOM[legTrack(leg)].length, null);
    r.notional = false;
    const cut = hit && hit.kind === "train" && state.trains[hit.train];
    if (!cut || !takesFrom(r, cut, endVehicle(cut, hit.which).id)) { r.light = true; return; }
    const end = walk(start.seg, start.s, start.travel, hit.gap), head = walk(end.seg, end.s, -end.travel, ROAD_LOCO_LENGTH);
    const id = `${r.id}/loco`;
    addVehicle(id, ROAD_LOCO);
    layTrain(head.seg, head.s, -head.travel, [id]);
    state.vehicles[id].run = r.id;
    reverseTrain(trainOf(state.vehicles[id]));
    coupleCut(r, trainOf(state.vehicles[id]), cut, hit.which, 0);
  }
  // A departure pulls out at `now`, its route set and locked: its cars
  // leave on it (depart()). In a skip, or with no loco on, they go off the
  // map at once.
  function pullOut(r, now, instant) {
    const job = jobById(r.job), late = Math.max(0, now - r.at), delay = roadDelay(r, late);
    const cars = r.vehicles.filter(id => state.cars[id]);
    if (instant || !r.vehicles.length) {
      if (r.vehicles.length) {
        depart(job, now, cars, delay);
        for (const id of r.vehicles) if (state.vehicles[id]) { detach(id); delete state.vehicles[id]; }
      } else depart(job, now, null, delay);
      unlockRoute(r);
      r.status = "gone";
      return;
    }
    lockRoute(r, "out");
    depart(job, now, cars, delay);
    Object.assign(r, { status: "running", speed: 0 });
    setNotice(`${roadName(r)} leaves`);
  }

  // Each step: the station keeps each locked switch lying for its run (a
  // spring switch trailed through lies back once clear), and each road
  // train moving is driven on sight; a departure's vehicles leave the map
  // one by one at the east edge, and gone, its route is unlocked.
  function stepRoad(dt) {
    for (const r of state.road) {
      for (const id of r.locks) {
        const want = lockedFor(r, id);
        if (want && state.switches[id].set !== want && !nodeOccupied(id)) state.switches[id].set = want;
      }
      if (r.status !== "running" && r.status !== "shed") continue;
      if (r.route === "out") {
        for (;;) {
          const t = r.vehicles.length && trainOf(state.vehicles[r.vehicles[0]]), v = t && state.vehicles[t.vehicles[0]];
          if (!v) break;
          const e = vehicleEnds(v).head;
          if (walk(e.seg, e.s, e.travel, 1).short <= 0) break;
          detach(v.id);
          delete state.vehicles[v.id];
          r.vehicles = r.vehicles.filter(id => id !== v.id);
        }
        if (!r.vehicles.length) { unlockRoute(r); r.status = "gone"; continue; }
      }
      if (!r.legSet && !(r.legSet = setLeg(r))) { r.speed = 0; continue; }
      driveRoad(r, dt);
    }
    state.road = state.road.filter(r => r.status !== "gone");
  }
  // Drives run `r` one step on its leg: on sight, braking to stop
  // ROAD_SIGHT_MARGIN short of anything in its way, or right up to the
  // cut it takes, or at its stop; there the leg is done.
  function driveRoad(r, dt) {
    const leg = ROAD_LEGS[r.route][r.leg], t = trainOf(state.vehicles[r.vehicles[0]]), end = roadHead(r);
    if (!leg.index[end.seg]) { r.speed = 0; r.blocked = true; return; }   // off its route: it stands
    const pos = alongOf(leg, end.seg, end.s), len = trainLength(t);
    let stopAt = legStop(leg, len), cut = false;
    r.blocked = false;
    const hit = findObstacle(end, r.speed ** 2 / (2 * ROAD_DECEL) + ROAD_SIGHT_MARGIN + 5, t.id);
    if (hit && hit.kind === "train") {
      const other = state.trains[hit.train];
      if (leg.stop === "cut" && takesFrom(r, other, endVehicle(other, hit.which).id)) { stopAt = pos + hit.gap; cut = true; }
      else if (pos + hit.gap - ROAD_SIGHT_MARGIN < stopAt) { stopAt = pos + hit.gap - ROAD_SIGHT_MARGIN; r.blocked = true; }
    }
    if (!r.blocked && stopAt - pos <= 0.02) { r.speed = 0; legDone(r, cut); return; }
    const cap = roadCap(leg, leg.stop === "edge" ? Math.min(pos, leg.length) : pos, len, stopAt);
    r.speed = r.speed < cap ? Math.min(cap, r.speed + THROUGH_ACCEL * dt) : cap;
  }
  // A leg done: an arrival stands at the buffer; a loco reaching its cut is
  // hooked on; one clear of a switch or fouling point reverses for the
  // next leg.
  function legDone(r, cut) {
    const now = state.clock;
    if (r.kind === "arrival") return arrivedRoad(r, now);
    if (cut) return Object.assign(r, { status: "hooking", until: now + HOOK_UP_SECONDS });
    if (r.leg + 1 >= ROAD_ROUTES[r.route].length) return;
    reverseTrain(trainOf(state.vehicles[r.vehicles[0]]));
    r.leg++;
    r.legSet = setLeg(r);
  }

  // WORLD DATA is checked first (CHECKS), so a broken id is named in the
  // console even when it stops the yard being built.
  const WORLD_PROBLEMS = worldProblems();
  for (const p of WORLD_PROBLEMS) console.error(`World data: ${p}`);
  state = makeState();

