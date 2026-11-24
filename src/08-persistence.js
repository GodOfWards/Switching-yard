  // ==================================================
  // PERSISTENCE
  // ==================================================
  // The yard is saved as it stands, mid-move included: every vehicle with
  // its speed, the trains, couplings' slack and air, switches, hand brakes,
  // the loco's controls and its traction (load, slip, sand, motor heat and
  // fuel; sand held on is let go), the clock, the cars' traffic, the jobs and the
  // road trains. That is all of STATE but the notice. A yard saved before
  // road trains isn't carried over: its cars stand where they didn't
  // expect them, and none are away. A save
  // that doesn't fit the yard (WORLD DATA changed since) is set aside for a
  // fresh yard. SAVE_KEY changes with every change to the saved shape.
  //
  // The save is in two parts. The cars and the pool, with their histories,
  // are most of it and change only when something happens to a car, so
  // they are written under CARS_KEY only when carsChanged() was called since
  // (or `all`, on leaving the page); the rest is small and written every
  // time. Both carry the same `saved` count, so a load never joins a rest
  // to cars from another save.
  // The benchmark page (index.html?bench, CHECKS) saves under keys of its
  // own, never over the player's yard.
  const BENCH = new URLSearchParams(location.search).has("bench");
  const SAVE_KEY = "switching-game.yard.13" + (BENCH ? ".bench" : "");
  const CARS_KEY = SAVE_KEY + ".cars";
  let saves = 0;

  // The save's two parts, as written under CARS_KEY and SAVE_KEY.
  function saveParts() {
    const { cars, pool, notice, ...rest } = state;
    return { cars: { saved: saves, cars, pool },
             rest: { version: GAME_CONFIG.VERSION, saved: saves, state: { ...rest, notice: null } } };
  }
  function saveYard(all = false) {
    try {
      const withCars = carsDirty || all;
      if (withCars) saves++;
      const p = saveParts();
      if (withCars) { localStorage.setItem(CARS_KEY, JSON.stringify(p.cars)); carsDirty = false; }
      localStorage.setItem(SAVE_KEY, JSON.stringify(p.rest));
    } catch (e) { carsDirty = true; /* storage full or blocked: play goes on unsaved */ }
  }
  // The yard as it stands, as a file for a bug report (#42): both parts of
  // the save under their keys, so writing each into localStorage and
  // reloading opens this yard exactly (docs/design/view.md).
  function saveFileText() {
    const p = saveParts();
    return JSON.stringify({ [SAVE_KEY]: p.rest, [CARS_KEY]: p.cars });
  }

  // Whether a saved STATE fits this yard: the same switches and vehicles,
  // every vehicle on a segment that exists, every train whole, and slack
  // at every coupling.
  function fitsYard(st) {
    const isObj = o => !!o && typeof o === "object";
    const sameKeys = (o, ref) => isObj(o) && Object.keys(o).sort().join() === Object.keys(ref).sort().join();
    if (!isObj(st) || !(st.clock >= 0 && Number.isFinite(st.clock))) return false;
    if (!isObj(st.trains) || !isObj(st.air) || !isObj(st.gaps) || !Number.isInteger(st.nextTrain)) return false;
    if (!isObj(st.work) || !Object.values(st.work).every(w => isObj(w) && ["hook", "unhook"].includes(w.kind)
        && typeof w.a === "string" && typeof w.b === "string" && Number.isFinite(w.done))) return false;
    if (!sameKeys(st.switches, SWITCHES)) return false;
    if (!isObj(st.cars) || !isObj(st.pool) || !Array.isArray(st.jobs) || !Number.isInteger(st.nextJob) || !Number.isInteger(st.moves)
        || !Number.isInteger(st.locoSense) || !Array.isArray(st.register)
        || !st.register.every(l => isObj(l) && typeof l.number === "string" && Number.isFinite(l.booked) && Number.isFinite(l.late))
        || !Number.isInteger(st.seed) || !Number.isFinite(st.nextShiftAt) || !Number.isFinite(st.timetableAt)) return false;
    if (!Array.isArray(st.held) || !st.held.every(r => isObj(r) && timetableEntry(r.tt) && Number.isFinite(r.at))) return false;
    if (!Number.isFinite(st.throughAt) || !isObj(st.main) || typeof st.main.held !== "boolean"
        || (st.main.held && !Number.isFinite(st.main.until))) return false;
    if (!Array.isArray(st.through) || !st.through.every(r => isObj(r) && throughEntry(r.tt) && Number.isFinite(r.at) && Number.isFinite(r.enters)
        && ["offered", "refused", "held", "running"].includes(r.status) && Number.isFinite(r.speed) && Array.isArray(r.vehicles))) return false;
    if (!Number.isInteger(st.nextCar) || !isObj(st.poolCount) || !Number.isInteger(st.poolCount.joined)
        || !Number.isInteger(st.poolCount.left) || !Number.isFinite(st.poolSince)) return false;
    // A car is in the traffic or in the pool, never both; one in the pool
    // is away, with no flow or trip.
    if (Object.keys(st.pool).some(id => st.cars[id])) return false;
    if (!sameKeys(st.industries, INDUSTRIES) || Object.values(st.industries).some(i => !isObj(i)
        || (i.setOut !== null && typeof i.setOut !== "string") || (i.pull !== null && typeof i.pull !== "string")
        || (i.readyAt !== null && !Number.isFinite(i.readyAt)))) return false;
    const carFits = c => isObj(c) && VEHICLE_TYPES[c.type] && !VEHICLE_TYPES[c.type].loco && typeof c.number === "string"
      && Array.isArray(c.history) && (c.waybill === null || !!DESTINATIONS[c.waybill]) && typeof c.loaded === "boolean"
      && (c.flow === null || (!!FLOWS[c.flow] && FLOWS[c.flow].type === c.type))
      && (c.away === null ? c.trip === null : Number.isFinite(c.away))
      && (c.spot === null || (isObj(c.spot) && !!INDUSTRIES[c.spot.industry]
          && (c.spot.n === null || (Number.isInteger(c.spot.n) && c.spot.n >= 1 && c.spot.n <= INDUSTRY_SPOTS))));
    for (const id in st.pool) { const c = st.pool[id]; if (!carFits(c) || c.flow !== null || c.trip !== null) return false; }
    for (const id in st.cars) {
      const c = st.cars[id], t = c.trip;
      if (!carFits(c)) return false;
      if (c.away !== null && !(isObj(t) && DESTINATIONS[t.at] && DESTINATIONS[t.at].away
          && Number.isFinite(t.back) && typeof t.pool === "boolean")) return false;
    }
    for (const j of st.jobs) if (!isObj(j) || !Array.isArray(j.cars) || !j.cars.every(id => st.cars[id]) || !Number.isFinite(j.due)
        || !Array.isArray(j.overheats)) return false;
    for (const id in SWITCHES) if (!SWITCHES[id].legs.includes(st.switches[id].set)) return false;
    // Every loco, and every car not away, has a vehicle.
    const startIds = {};
    for (const t of START_TRAINS) for (const v of t.vehicles) if (!CARS[v.id]) startIds[v.id] = v.type;
    for (const id in st.cars) if (st.cars[id].away === null) startIds[id] = st.cars[id].type;
    const runOf = {};                     // a through train's vehicles on the map
    for (const r of st.through) for (const id of r.vehicles) { startIds[id] = throughType(id); runOf[id] = r.id; }
    if (!sameKeys(st.vehicles, startIds)) return false;
    for (const id in st.vehicles) {
      const v = st.vehicles[id], type = VEHICLE_TYPES[v.type];
      if (v.id !== id || v.type !== startIds[id] || !SEGMENTS[v.seg] || !st.trains[v.train] || (v.run || null) !== (runOf[id] || null)) return false;
      if (!(v.s >= 0 && v.s <= segmentLength(v.seg)) || !Number.isFinite(v.speed)) return false;
      if (Math.abs(v.dir) !== 1 || Math.abs(v.flip) !== 1 || !!type.loco !== isObj(v.controls)) return false;
      const c = v.controls;
      if (c && (!["load", "pull", "sand", "heat", "fuel"].every(k => Number.isFinite(c[k]) && c[k] >= 0)
          || !Number.isInteger(c.throttle) || c.throttle < 0 || c.throttle > THROTTLE_NOTCHES
          || typeof c.slip !== "boolean" || typeof c.tripped !== "boolean" || typeof c.sanding !== "boolean"
          || (c.emptyAt !== null && !Number.isFinite(c.emptyAt)))) return false;
    }
    const placed = {};
    for (const tid in st.trains) {
      const ids = st.trains[tid].vehicles;
      if (st.trains[tid].id !== tid || !Array.isArray(ids) || !ids.length) return false;
      for (let i = 0; i < ids.length; i++) {
        const v = st.vehicles[ids[i]];
        if (!v || v.train !== tid || placed[ids[i]]) return false;
        placed[ids[i]] = true;
        if (i && !Number.isFinite(st.gaps[pairKey(ids[i - 1], ids[i])])) return false;
      }
    }
    return Object.keys(placed).length === Object.keys(startIds).length;
  }

  // The saved yard, if there is one that fits; otherwise the fresh one
  // makeState() built stays.
  function loadYard() {
    try {
      // Saves of an older shape are never read again: free their space.
      for (const k of Object.keys(localStorage))
        if (/^switching-game\.yard\.\d+(\.cars)?$/.test(k) && k !== SAVE_KEY && k !== CARS_KEY) localStorage.removeItem(k);
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY)), cars = JSON.parse(localStorage.getItem(CARS_KEY));
      if (!saved || !cars || saved.saved !== cars.saved) return false;
      const st = { ...saved.state, cars: cars.cars, pool: cars.pool };
      if (fitsYard(st)) {
        for (const id in st.vehicles) if (st.vehicles[id].controls) st.vehicles[id].controls.sanding = false;
        state = st; saves = cars.saved; carsDirty = false; return true;
      }
    } catch (e) { /* unreadable or blocked: start fresh */ }
    return false;
  }

  // A fresh yard as WORLD DATA lays it out, saved over the old one.
  function newYard() {
    state = makeState();
    saveYard(true);
  }

  const restored = !BENCH && loadYard();

