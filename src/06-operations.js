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
  // nothing else coupled in (`clean`), their air hoses joined between
  // every two of them (`air`), and every hand brake off (`brakes`), as a
  // departure needs (#61; RITO art. 367, 450).
  function jobStatus(job) {
    const lines = job.cars.map(id => ({ id, block: dispositionOf(id), met: dispositionMet(id), away: state.cars[id].away !== null }));
    const ordered = [...new Set(lines.map(l => l.block))].filter(b => b && BLOCKS[b].ordering === "block");
    const st = { lines, met: lines.filter(l => l.met).length,
                 inOrder: ordered.length ? ordered.every(blockInOrder) : null, cut: null };
    if (job.kind === "build") {
      const ids = lines.filter(l => l.block === job.block).map(l => l.id);
      const trains = new Set(ids.map(id => state.vehicles[id].train));
      const t = trains.size === 1 && state.trains[[...trains][0]];
      st.cut = !ids.length ? { one: true, clean: true, air: true, brakes: true }
        : { one: !!t && !t.vehicles.some(id => state.vehicles[id].controls), clean: !!t && t.vehicles.every(id => ids.includes(id)),
            air: !!t && t.vehicles.every((id, i) => !i || pairKey(t.vehicles[i - 1], id) in state.air),
            brakes: ids.every(id => !state.vehicles[id].handBrake) };
    }
    return st;
  }
  // Whether a job's formation is usable: its blocks in order and, for a
  // build, its train one cut with nothing else in it, the air joined
  // through it and no hand brake on.
  const formationValid = st => st.inOrder !== false && (!st.cut || (st.cut.one && st.cut.clean && st.cut.air && st.cut.brakes));

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

  // Acts, in time order, on every industry's work done, shift change and
  // road train the clock has reached, then lets in any arrival held
  // outside whose track is clear.
  function runEvents() {
    for (;;) {
      const run = runsBetween(state.timetableAt, state.clock)[0], ind = industryDue();
      if (ind && (state.nextShiftAt > state.clock || ind.at <= state.nextShiftAt) && (!run || ind.at <= run.at)) {
        industryReady(ind.ind, ind.at);
        continue;
      }
      if (state.nextShiftAt <= state.clock && (!run || state.nextShiftAt <= run.at)) {
        shiftChange(state.nextShiftAt);
        state.nextShiftAt += SHIFT_HOURS * HOUR;
        continue;
      }
      if (!run) break;
      state.timetableAt = run.at + 1;
      if (timetableEntry(run.tt).arrives) state.held.push(run);
      else departureDue(run);
      letInArrivals(run.at);
    }
    letInArrivals(state.clock);
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
      if (c.away !== null || busy.has(id) || v.speed !== 0 || !block || !dispositionMet(id)) continue;
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
                taken: false, movesAtTake: 0, damaged: [], trainsHeld: [], overruns: [], overheats: [], result: null, ...job };
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
  // track stands clear.
  function letInArrivals(at) {
    while (state.held.length && trackClear(ARRIVAL_TRACK)) arrive(state.held.shift(), at);
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
  // A road train arrives at `at`, onto the arrival track: the cars due
  // back by then from the stations on its side, soonest due first, up to
  // ARRIVAL_CARS_MAX, topped up from the pool toward ARRIVAL_CARS_MIN. Each is
  // loaded or unloaded at its station by the plan, and billed on. A job
  // opens to break it up, due at the shift change, and one to build each
  // departure that follows it, up to the next arrival.
  function arrive(run, at) {
    const tt = timetableEntry(run.tt), late = at - run.at;
    const ids = Object.keys(state.cars).filter(id => {
      const t = state.cars[id].trip;
      return t && !t.pool && t.back <= at && (DESTINATIONS[t.at].westEnd || DESTINATIONS[t.at].block === tt.side);
    }).sort((a, b) => state.cars[a].trip.back - state.cars[b].trip.back).slice(0, ARRIVAL_CARS_MAX);
    for (let id; ids.length < ARRIVAL_CARS_MIN && (id = joinFromPool(tt.side, at));) ids.push(id);
    const note = late >= ON_TIME_SECONDS ? `, held outside ${lateText(late)}` : "";
    registerTrain({ number: tt.number, name: trainName(tt), passenger: false, kind: "arrival", booked: run.at, late,
                    cause: `Track ${YARD_TRACKS[ARRIVAL_TRACK].number} not clear` });
    for (const id of ids) {
      resolveTrip(id);
      addVehicle(id, state.cars[id].type);
      logCar(id, `Arrived on ${trainName(tt)}${note}`, at);
      rebill(id, at);
    }
    if (ids.length) {
      layOnTrack(ARRIVAL_TRACK, ids);
      addJob({ kind: "breakup", title: `Break up ${trainName(tt)}`, short: `Break up ${tt.number}`, opens: at,
               due: shiftAt(at).end, cars: ids, run: run.id, arrivedLate: late });
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
    return addJob({ kind: "build", title: `Build ${trainName(tt)}`, short: `Build ${tt.number}`, opens: at, due: run.at,
                    cars, run: run.id, block: tt.block, departed: null });
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
  function depart(job, at) {
    const tt = timetableEntry(job.run.split(".")[0]), late = Math.max(0, at - job.due);
    const going = job.cars.filter(id => state.cars[id].away === null && dispositionOf(id) === job.block && dispositionMet(id));
    for (const id of going) sendAway(id, at, `Left on ${trainName(tt)}${late >= ON_TIME_SECONDS ? `, ${lateText(late)} late` : ""}`);
    job.departed = { at, cars: going.length, late };
    registerTrain({ number: tt.number, name: trainName(tt), passenger: false, kind: "departure", booked: job.due, late,
                    cause: "Build not ready" });
  }
  // Car `id` leaves the map at `at` on a trip to its waybill's station.
  function sendAway(id, at, text) {
    detach(id);
    delete state.vehicles[id];
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
      const track = v.speed === 0 && !inPlayerTrain(v) && blockTracks(dispositionOf(id)).find(t => setOnTrack(t, id));
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
                   moves, par, late: Math.max(0, at - job.due) };
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
  // The through train a train belongs to, if it is one: the game drives it.
  function drivenBy(t) {
    const v = t && state.vehicles[t.vehicles[0]];
    return v && v.run ? throughRun(v.run) : null;
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
  // the running tracks (reportClear).
  const mainClear = () => !state.main.held;

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
      } else setNotice(`Clear the main for ${throughName(tt)}`);
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
    r.cause = state.clock > state.main.until ? "Main kept past its time" : "Held for the main";
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
  // how late), and, when late, the yard's cause. Lines older than
  // REGISTER_DAYS days are dropped.
  function registerTrain(line) {
    const from = (Math.floor(state.clock / DAY) - (REGISTER_DAYS - 1)) * DAY;
    state.register = state.register.filter(l => l.actual >= from);
    state.register.push({ ...line, actual: line.booked + line.late, cause: line.late >= ON_TIME_SECONDS ? line.cause : null });
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

  // WORLD DATA is checked first (CHECKS), so a broken id is named in the
  // console even when it stops the yard being built.
  const WORLD_PROBLEMS = worldProblems();
  for (const p of WORLD_PROBLEMS) console.error(`World data: ${p}`);
  state = makeState();

