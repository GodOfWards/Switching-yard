  // ==================================================
  // CHECKS
  // ==================================================
  // What WORLD DATA names that doesn't exist, as a list of problems: every
  // id a table names must be in the table it names. Run at every start,
  // before the yard is built (end of OPERATIONS); a problem shows in the
  // console and as a notice.
  function worldProblems() {
    const out = [], has = (table, id) => Object.prototype.hasOwnProperty.call(table, id);
    const need = (ok, text) => { if (!ok) out.push(text); };
    const trackHas = name => has(SEGMENTS, name) || has(SEGMENTS, name + "_1");
    for (const id in SEGMENTS) for (const end of ["a", "b"]) need(has(NODES, SEGMENTS[id][end]), `segment ${id}: node ${SEGMENTS[id][end]} doesn't exist`);
    for (const id in SWITCHES) {
      const sw = SWITCHES[id];
      need(has(NODES, id), `switch ${id}: no node of that name`);
      for (const seg of [sw.trunk, ...sw.legs]) {
        if (!has(SEGMENTS, seg)) { out.push(`switch ${id}: segment ${seg} doesn't exist`); continue; }
        need(SEGMENTS[seg].a === id || SEGMENTS[seg].b === id, `switch ${id}: segment ${seg} doesn't end at it`);
      }
      need(sw.legs.length === 2 && sw.legs.includes(sw.normal), `switch ${id}: normal ${sw.normal} isn't one of its two legs`);
    }
    for (const id of MAP_EDGES) need(has(NODES, id), `map edge ${id}: node doesn't exist`);
    const numbers = new Set();
    for (const id in CARS) {
      const c = CARS[id];
      need(has(VEHICLE_TYPES, c.type) && !VEHICLE_TYPES[c.type].loco, `car ${id}: kind ${c.type} isn't a car kind`);
      need(!numbers.has(c.number), `car ${id}: number ${c.number} is used twice`);
      numbers.add(c.number);
    }
    for (const type in CAR_NUMBERS) need(has(VEHICLE_TYPES, type), `car numbers: kind ${type} doesn't exist`);
    const laid = new Set();
    for (const t of START_TRAINS) {
      need(has(SEGMENTS, t.segment), `starting train: segment ${t.segment} doesn't exist`);
      for (const v of t.vehicles) {
        need(!laid.has(v.id), `starting train: ${v.id} is laid out twice`);
        laid.add(v.id);
        need(has(CARS, v.id) || has(VEHICLE_TYPES, v.type), `starting train: ${v.id} is neither a car nor of a known kind`);
      }
    }
    need(laid.has(PLAYER_LOCO), `player loco ${PLAYER_LOCO} isn't laid out`);
    const playerType = START_TRAINS.flatMap(t => t.vehicles).find(v => v.id === PLAYER_LOCO);
    need(!playerType || (has(VEHICLE_TYPES, playerType.type) && !!VEHICLE_TYPES[playerType.type].traction), `player loco ${PLAYER_LOCO}: its kind has no traction figures`);
    need(has(SEGMENTS, FUEL_POINT.segment) && FUEL_POINT.s >= 0 && FUEL_POINT.s <= segmentLength(FUEL_POINT.segment),
      `fuel point: ${FUEL_POINT.s} m along ${FUEL_POINT.segment} isn't on track`);
    for (const id in YARD_TRACKS) {
      const t = YARD_TRACKS[id];
      need(has(SWITCHES, t.switch), `${t.name}: switch ${t.switch} doesn't exist`);
      for (const seg of t.segments) need(has(SEGMENTS, seg), `${t.name}: segment ${seg} doesn't exist`);
      need(t.block === null || has(BLOCKS, t.block), `${t.name}: block ${t.block} doesn't exist`);
    }
    need(has(YARD_TRACKS, ARRIVAL_TRACK), `arrival track ${ARRIVAL_TRACK} doesn't exist`);
    for (const p of PLACES) for (const name of p.tracks) need(trackHas(name), `${p.name}: track ${name} has no segments`);
    for (const name of RUNNING_TRACKS) need(trackHas(name), `running track ${name} has no segments`);
    for (const id in BLOCKS) for (const g of BLOCKS[id].groups || []) need(has(DESTINATIONS, g), `block ${id}: group ${g} isn't a destination`);
    for (const id in INDUSTRIES) need(has(YARD_TRACKS, INDUSTRIES[id].track), `industry ${id}: track ${INDUSTRIES[id].track} doesn't exist`);
    for (const id in DESTINATIONS) need(has(BLOCKS, DESTINATIONS[id].block), `destination ${id}: block ${DESTINATIONS[id].block} doesn't exist`);
    for (const id in FLOWS) {
      const f = FLOWS[id];
      for (const end of [f.from, f.to]) need(end === "junin" || (has(DESTINATIONS, end) && DESTINATIONS[end].away), `flow ${id}: ${end} isn't Junín or a station away`);
      need(has(VEHICLE_TYPES, f.type), `flow ${id}: kind ${f.type} doesn't exist`);
      need(!f.atJunin || has(INDUSTRIES, f.atJunin), `flow ${id}: industry ${f.atJunin} doesn't exist`);
    }
    for (const id in START_TRAFFIC) {
      const t = START_TRAFFIC[id];
      if (!has(CARS, id)) { out.push(`starting traffic: car ${id} doesn't exist`); continue; }
      need(!t.flow || (has(FLOWS, t.flow) && FLOWS[t.flow].type === CARS[id].type), `starting traffic: ${id}'s flow ${t.flow} doesn't exist or carries another kind`);
      need(!t.waybill || has(DESTINATIONS, t.waybill), `starting traffic: ${id}'s waybill ${t.waybill} isn't a destination`);
    }
    for (const tt of TIMETABLE) need(has(BLOCKS, tt.arrives ? tt.side : tt.block), `train ${tt.number}: block ${tt.side || tt.block} doesn't exist`);
    for (const tt of THROUGH_TIMETABLE) {
      need(has(THROUGH_EDGES, tt.enters), `through train ${tt.number}: edge ${tt.enters} doesn't exist`);
      need(has(THROUGH_CONSISTS, tt.consist), `through train ${tt.number}: make-up ${tt.consist} doesn't exist`);
    }
    for (const c in THROUGH_CONSISTS) {
      need(has(VEHICLE_TYPES, THROUGH_CONSISTS[c].loco) && VEHICLE_TYPES[THROUGH_CONSISTS[c].loco].loco, `through make-up ${c}: loco ${THROUGH_CONSISTS[c].loco} isn't a loco`);
      for (const type of THROUGH_CONSISTS[c].cars) need(has(VEHICLE_TYPES, type), `through make-up ${c}: kind ${type} doesn't exist`);
    }
    // Retiro's road trains (#78): each leg's path (ROAD_LEGS, built from
    // these) passes every switch it sets, set to one of its own legs, and
    // ends where its stop says.
    need(has(VEHICLE_TYPES, ROAD_LOCO) && VEHICLE_TYPES[ROAD_LOCO].loco, `road loco ${ROAD_LOCO} isn't a loco`);
    for (const id in ROAD_ROUTES) ROAD_ROUTES[id].forEach((spec, i) => {
      const leg = ROAD_LEGS[id][i], name = `road route ${id}, leg ${i + 1}`;
      need(has(NODES, spec.from) && SEGMENTS_AT[spec.from].length === 1, `${name}: ${spec.from} isn't an end of track`);
      for (const sw in spec.set) {
        if (!has(SWITCHES, sw)) { out.push(`${name}: switch ${sw} doesn't exist`); continue; }
        need(SWITCHES[sw].legs.includes(spec.set[sw]), `${name}: ${spec.set[sw]} isn't a leg of ${sw}`);
        need(has(leg.nodes, sw), `${name}: its path doesn't pass ${sw}`);
      }
      const ends = leg.end && SEGMENTS_AT[leg.end].length === 1;
      if (spec.stop === "edge") need(MAP_EDGES.includes(leg.end), `${name}: its path doesn't reach the map's edge`);
      else if (spec.stop === "buffer" || spec.stop === "cut") need(ends && !MAP_EDGES.includes(leg.end) && (spec.stop === "buffer" || legTrack(leg)),
        `${name}: its path doesn't end at a ${spec.stop === "cut" ? "yard track's " : ""}buffer`);
      else {
        const c = spec.stop && spec.stop.clearOf, at = has(YARD_TRACKS, c) ? YARD_TRACKS[c].switch : c;
        need(has(leg.nodes, at), `${name}: its stop, clear of ${c}, isn't on its path`);
      }
    });
    for (const e in THROUGH_EDGES) need(MAP_EDGES.includes(THROUGH_EDGES[e].node), `through edge ${e}: ${THROUGH_EDGES[e].node} isn't a map edge`);
    return out;
  }

  // What is wrong with STATE as it stands, as a list of problems: the
  // checks a saved yard must pass (fitsYard()), and every vehicle in
  // exactly the one train it names.
  function stateProblems() {
    const out = [], seen = {};
    if (!fitsYard(state)) out.push("the yard doesn't pass fitsYard()");
    for (const tid in state.trains) for (const id of state.trains[tid].vehicles) {
      if (seen[id]) out.push(`vehicle ${id} is in trains ${seen[id]} and ${tid}`);
      seen[id] = tid;
      if (!state.vehicles[id] || state.vehicles[id].train !== tid) out.push(`train ${tid} lists ${id}, which isn't in it`);
    }
    for (const id in state.vehicles) if (!seen[id]) out.push(`vehicle ${id} is in no train`);
    return out;
  }

  if (WORLD_PROBLEMS.length) setNotice(`World data has ${WORLD_PROBLEMS.length} problem${WORLD_PROBLEMS.length > 1 ? "s" : ""}: see the console`);

  // The benchmark (index.html?bench): fixed scenarios, timed, on a yard of
  // its own. It plays a fresh yard standing and with the loco under power,
  // then ages a fresh yard BENCH_DAYS by skipping from event to event,
  // checking after each skip that the saved cars match STATE (a change
  // that forgot carsChanged() shows here) and every BENCH_CHECK_EVERY
  // skips that STATE has no problems, and times the aged yard. Its
  // result is left on window.switchingBenchResults for
  // .github/scripts/perf_check.py, which holds the budgets and tolerances.
  // Each timing is a list of runs in ms; a step's is per step.
  const BENCH_DAYS = 30;                // about when the cars' histories are full
  const BENCH_CHECK_EVERY = 20;
  function runBench() {
    const out = { version: GAME_CONFIG.VERSION, problems: worldProblems(), timings: {}, scenario: {} };
    const gc = () => { if (window.gc) window.gc(); };
    const timed = (f, runs, per = 1) => {
      const out = [];
      gc();
      for (let i = 0; i < runs; i++) { const t = performance.now(); f(); out.push((performance.now() - t) / per); }
      return out;
    };
    const steps = n => () => { for (let i = 0; i < n; i++) step(STEP_SECONDS); };
    // A yard with a fixed seed, so every load plays the same traffic.
    const freshYard = () => { const r = Math.random; Math.random = () => 0.5; try { newYard(); } finally { Math.random = r; } };
    try {
      paused = true;
      freshYard();
      out.problems.push(...stateProblems().map(p => `fresh yard: ${p}`));
      out.timings.step = timed(steps(60), 20, 60);
      out.timings.render = timed(render, 30);
      release(); moveReverser(1); moveThrottle(THROTTLE_NOTCHES);
      out.timings.stepMoving = timed(steps(60), 10, 60);
      out.scenario.locoSpeed = +playerLoco().speed.toFixed(2);
      if (!playerLoco().speed) out.problems.push("the loco didn't move under power");

      freshYard();
      // The loco parked on a short track, clear of Retiro's road trains'
      // routes (#78), so they run as the yard ages.
      layTrain("stub2_7", 20, -1, (detach(PLAYER_LOCO), [PLAYER_LOCO]));
      const start = state.clock;
      let skips = 0, skipMs = 0;
      while (state.clock < start + BENCH_DAYS * DAY) {
        const e = eventsAhead()[0], t = performance.now();
        if (!e || !skipTo(e.at)) { out.problems.push(`aging: the skip at day ${(state.clock / DAY).toFixed(2)} was refused`); break; }
        skipMs += performance.now() - t;
        skips++;
        saveYard();
        if (localStorage.getItem(CARS_KEY) !== JSON.stringify({ saved: saves, cars: state.cars, pool: state.pool }))
          out.problems.push(`aging: the saved cars don't match the yard after the skip to ${dayClock(state.clock)}`);
        if (skips % BENCH_CHECK_EVERY === 0) out.problems.push(...stateProblems().map(p => `aging, ${dayClock(state.clock)}: ${p}`));
      }
      out.problems.push(...stateProblems().map(p => `aged yard: ${p}`));
      out.timings.skip = [skipMs / skips];
      out.timings.save = timed(saveYard, 30);
      out.timings.saveAll = timed(() => saveYard(true), 10);
      out.timings.renderAged = timed(render, 30);
      out.scenario.skips = skips;
      out.scenario.cars = Object.keys(state.cars).length + Object.keys(state.pool).length;
      out.scenario.savedKB = Math.round(((localStorage.getItem(SAVE_KEY) || "").length + (localStorage.getItem(CARS_KEY) || "").length) / 1024);
    } catch (e) {
      out.error = String(e && e.stack || e);
    } finally {
      try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(CARS_KEY); } catch (e) { /* blocked */ }
    }
    window.switchingBenchResults = out;
    const med = a => [...a].sort((x, y) => x - y)[a.length >> 1];
    const pre = document.createElement("pre");
    pre.style.cssText = "position:fixed;inset:0;margin:0;padding:16px;overflow:auto;white-space:pre-wrap;background:#000d;color:#ecebe7;font:12px/1.4 monospace;z-index:9";
    pre.textContent = [`Benchmark, v${out.version}`, out.error ? `Failed: ${out.error}` : "",
      ...Object.entries(out.timings).map(([k, v]) => `${k.padEnd(12)} ${med(v).toFixed(3)} ms (median of ${v.length})`),
      `scenario     ${JSON.stringify(out.scenario)}`, `problems     ${out.problems.length}`, ...out.problems].join("\n");
    document.body.appendChild(pre);
  }
  if (BENCH) setTimeout(runBench, 0);

  // Exposed for testing in a browser console or headless check.
  // The traffic plan as it stands, for checking by hand (#50): each
  // flow's cars against its share, and the cars that joined from the pool
  // and left for it, a week, since `poolSince`.
  function traffic() {
    const flows = {};
    for (const f in FLOWS) flows[f] = { cars: flowCars(f), share: flowShare(f) };
    const weeks = Math.max(1, state.clock - state.poolSince) / (7 * DAY);
    return { flows, cars: Object.keys(state.cars).length, pool: Object.keys(state.pool).length,
             joinedAWeek: +(state.poolCount.joined / weeks).toFixed(1), leftAWeek: +(state.poolCount.left / weeks).toFixed(1) };
  }
  window.switching = { get state() { return state; }, step, traffic, throwSwitch, uncouple, hookUp, meetings, moveReverser, moveThrottle,
    moveLocoBrake, moveTrainBrake, emergency, release, trainEnds, toggleAir, toggleHandBrake, brakeReach, skipTo, eventsAhead,
    takeJob, handBack, reportDone, ROAD_LEGS, ROAD_IN_TIME, ROAD_OUT_TIME, LOCO_RUN_TIME, jobStatus, dispositionOf, dispositionMet, blockInOrder, damageCar, TRACK_GEOM,
    get paused() { return paused; }, togglePause, askForMain, reportClear, homeSignal, NODES, get view() { return view; }, saveYard, loadYard, newYard, fitsYard, SAVE_KEY, worldProblems, stateProblems,
    setSand, atFuelPoint, restLocos, FUEL_POINT, ADHESION };
