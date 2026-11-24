  // ==================================================
  // ACTIONS
  // ==================================================
  const clampNotch = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  // The reverser: forward (+1), neutral (0) or reverse (−1), one position a
  // press. It moves only with the throttle shut and the train stopped.
  // Retunable: both rules are design choices.
  function moveReverser(delta) {
    const v = playerLoco(), c = v.controls;
    const next = clampNotch(c.reverser + delta, -1, 1);
    if (next === c.reverser) return false;
    if (c.throttle) { setNotice("Shut the throttle first"); return false; }
    if (v.speed !== 0) { setNotice("Stop before moving the reverser"); return false; }
    c.reverser = next;
    return true;
  }
  // The throttle opens only with the reverser in forward or reverse.
  // Notching down ends a wheel slip (#117).
  function moveThrottle(delta) {
    const c = playerLoco().controls;
    if (delta > 0 && !c.reverser) { setNotice("Reverser is in neutral"); return; }
    const next = clampNotch(c.throttle + delta, 0, THROTTLE_NOTCHES);
    if (next < c.throttle) c.slip = false;
    c.throttle = next;
  }
  // Sand goes on while the button is held (#117), from a box that empties
  // as it's used; putting it on ends a wheel slip, if there's sand left.
  function setSand(on) {
    const c = playerLoco().controls;
    c.sanding = on;
    if (on && c.sand > 0) c.slip = false;
  }
  function moveLocoBrake(delta) {
    const c = playerLoco().controls;
    c.locoBrake = clampNotch(c.locoBrake + delta, 0, LOCO_BRAKE_NOTCHES);
  }
  function moveTrainBrake(delta) {
    const c = playerLoco().controls;
    c.trainBrake = clampNotch(c.trainBrake + delta, 0, TRAIN_BRAKE_NOTCHES);
    c.emergency = false;
  }
  // Emergency: power off, both brakes full, the train brake at its fastest.
  function emergency() {
    const c = playerLoco().controls;
    c.throttle = 0; c.locoBrake = LOCO_BRAKE_NOTCHES; c.trainBrake = TRAIN_BRAKE_NOTCHES; c.emergency = true;
  }
  // Release: both brake levers off.
  function release() {
    const c = playerLoco().controls;
    c.locoBrake = 0; c.trainBrake = 0; c.emergency = false;
  }
  // A switch with a vehicle over it cannot be thrown, nor one the station
  // has locked for a Retiro road train (#78).
  function throwSwitch(swId) {
    const lock = roadLock(swId);
    if (lock) { setNotice(`Locked for ${roadName(lock)}`); return false; }
    if (MAIN_SWITCHES.includes(swId) && !state.main.held) { setNotice("Padlocked: ask the station for the main"); return false; }
    if (nodeOccupied(swId)) { setNotice("A train is on that switch"); return false; }
    const sw = SWITCHES[swId], cur = state.switches[swId];
    cur.set = cur.set === sw.legs[0] ? sw.legs[1] : sw.legs[0];
    return true;
  }
  // The vehicle coupled behind `vehicleId` in its train, or null.
  function behind(vehicleId) {
    const t = trainOf(state.vehicles[vehicleId]), i = t.vehicles.indexOf(vehicleId);
    return i >= 0 && i < t.vehicles.length - 1 ? t.vehicles[i + 1] : null;
  }
  // Connects or parts the air at the coupling behind `vehicleId`. Newly
  // connected air starts uncharged.
  function toggleAir(vehicleId) {
    const next = behind(vehicleId);
    if (!next) return false;
    const k = pairKey(vehicleId, next);
    if (k in state.air) delete state.air[k]; else state.air[k] = 0;
    return true;
  }
  // Sets or releases a car's hand brake. A loco has none; it has its own brake.
  function toggleHandBrake(vehicleId) {
    const v = state.vehicles[vehicleId];
    if (!v || v.controls) return false;
    v.handBrake = !v.handBrake;
    return true;
  }
  // Coupling is a shunter's work, HOOK_UP_SECONDS with both vehicles
  // standing (#33; stepWork() finishes it). Hook up joins two trains whose
  // ends meet (meetings()), by the pair key of the meeting; Uncouple parts a
  // train behind its vehicle `vehicleId`.
  function startWork(kind, a, b) {
    const k = pairKey(a, b);
    if (state.work[k]) return false;
    if (state.vehicles[a].speed !== 0 || state.vehicles[b].speed !== 0) { setNotice("Stop before the shunter goes in"); return false; }
    state.work[k] = { kind, a, b, done: state.clock + HOOK_UP_SECONDS };
    return true;
  }
  function hookUp(key) {
    const m = meetings().find(m => m.key === key);
    return !!m && startWork("hook", m.a, m.b);
  }
  function uncouple(vehicleId) {
    const next = behind(vehicleId);
    return !!next && startWork("unhook", vehicleId, next);
  }
  // Parts a train between its vehicles `a` and `b`, coupled next to each
  // other, and the air there too. Both parts keep moving; a part without a
  // loco has its air bled off.
  function splitBehind(a, b) {
    const t = trainOf(state.vehicles[a]), i = t.vehicles.indexOf(a), j = t.vehicles.indexOf(b);
    if (i < 0 || j < 0 || Math.abs(i - j) !== 1) return false;
    const at = Math.min(i, j);
    delete state.air[pairKey(a, b)];
    delete state.gaps[pairKey(a, b)];
    const rest = { id: "t" + state.nextTrain++, vehicles: t.vehicles.slice(at + 1) };
    t.vehicles = t.vehicles.slice(0, at + 1);
    for (const id of rest.vehicles) state.vehicles[id].train = rest.id;
    state.trains[rest.id] = rest;
    return true;
  }

  // The main (#57): the player asks the station for it for `minutes`. It's
  // granted, unlocking the crossover, when no through train is offered or
  // on the map and none will be offered in that time; otherwise refused,
  // saying why. A Retiro road train (#78) is treated as a through train:
  // one waiting to come in or to leave, or on the main, refuses it, as one
  // offered or leaving in that time does.
  function askForMain(minutes) {
    if (state.main.held || !MAIN_ASK_MINUTES.includes(minutes)) return false;
    const r = state.through[0];
    if (r) { setNotice(`Refused: ${throughName(throughEntry(r.tt))} is ${r.status === "offered" ? "offered" : r.status === "refused" ? "waiting" : "on the main"}`); return false; }
    const until = state.clock + minutes * 60;
    const road = state.road.find(o => holdsMain(o) || (o.kind === "arrival" && o.status === "refused") || (o.kind === "departure" && o.at < until));
    if (road) {
      const leaving = road.kind === "departure" && road.status !== "running";
      setNotice(`Refused: ${roadName(road)} ${leaving ? (road.at > state.clock ? `leaves at ${clockText(road.at)}` : "is due to leave")
        : road.status === "refused" ? "is waiting" : road.kind === "arrival" ? "is coming in" : "is leaving"}`);
      return false;
    }
    const comes = runsBetween(state.roadAt, until + ROAD_LEAD).find(x => {
      const tt = timetableEntry(x.tt);
      return tt.east && (tt.arrives ? roadStartAt(tt, x.at) : x.at) < until;
    });
    if (comes) {
      const tt = timetableEntry(comes.tt);
      setNotice(`Refused: ${trainName(tt)} ${tt.arrives ? "is due at" : "leaves at"} ${clockText(comes.at)}`);
      return false;
    }
    const next = nextOfferAt();
    if (next && next.at < state.clock + minutes * 60) {
      setNotice(`Refused: ${throughName(next.tt)} is due at ${clockText(next.at + OFFER_LEAD_SECONDS)}`);
      return false;
    }
    state.main = { held: true, until: state.clock + minutes * 60 };
    setNotice(`The main is yours until ${clockText(state.main.until)}`);
    return true;
  }
  // The player reports the main clear: the crossover lying for the main,
  // and nothing but through trains on the running tracks. The station
  // padlocks the crossover. Kept past the time asked for, it's noted on the
  // jobs being worked.
  function reportClear() {
    if (!state.main.held) return false;
    const wrong = MAIN_SWITCHES.find(id => state.switches[id].set !== SWITCHES[id].normal);
    if (wrong) { setNotice(`Set ${wrong} for the main first`); return false; }
    for (const id in state.vehicles) {
      const v = state.vehicles[id], e = vehicleEnds(v);
      if (!v.run && [v, e.head, e.tail].some(p => RUNNING.has(p.seg))) { setNotice("Not clear: get off the main first"); return false; }
    }
    const over = state.clock - state.main.until;
    if (over >= 60) for (const j of openJobs()) if (j.taken) j.overruns.push(over);
    state.main = { held: false, until: null };
    setNotice("Main reported clear");
    mainEvents();
    return true;
  }

  // Skips the clock ahead to `at`, an event ahead or a SKIP_MARK_SECONDS
  // mark, only while every vehicle stands still and the throttle is shut.
  // Nothing else moves or changes: no physics runs during a skip; the
  // locos' heat and fuel are worked out at once (restLocos()).
  function skipTo(at) {
    if (!(at > state.clock) || !(at % SKIP_MARK_SECONDS === 0 || eventsAhead().some(e => e.at === at))) return false;
    if (playerLoco().speed !== 0) { setNotice("Stop the loco before skipping"); return false; }
    if (playerLoco().controls.throttle) { setNotice("Shut the throttle before skipping"); return false; }
    const moving = state.road.find(r => r.status === "running" || r.status === "shed");
    if (moving) { setNotice(`Wait for ${moving.status === "shed" ? "the road loco" : roadName(moving)} to stand`); return false; }
    for (const id in state.vehicles) {
      if (state.vehicles[id].speed !== 0 && !state.vehicles[id].run) { setNotice("Wait for the cars to stop"); return false; }
    }
    // A through train running passes on during the skip.
    for (const r of state.through) if (r.status === "running") {
      for (const id of r.vehicles) { detach(id); delete state.vehicles[id]; }
      r.status = "gone";
      registerThrough(r);
    }
    restLocos(at - state.clock);
    state.clock = at;
    stepWork();
    runEvents(true);
    return true;
  }

  // Jobs: the player takes one from the board, hands it back, or reports it
  // done, which assesses it. A job handed back after it fell due goes to
  // another crew at once.
  function takeJob(jobId) {
    const j = jobById(jobId);
    if (!j || j.result || j.taken) return false;
    Object.assign(j, { taken: true, movesAtTake: state.moves, damaged: [], trainsHeld: [], overruns: [], overheats: [] });
    return true;
  }
  function handBack(jobId) {
    const j = jobById(jobId);
    if (!j || j.result || !j.taken) return false;
    j.taken = false;
    if (readyBy(j) <= state.clock) {
      doOffScreen(j, state.clock);
      if (j.kind === "build" && !j.ready) depart(j, state.clock);   // a Retiro build's loco comes for it (#78)
    }
    return true;
  }
  // A build reported done after its train's time lets the train go now.
  function reportDone(jobId) {
    const j = jobById(jobId);
    if (!j || j.result || !j.taken) return false;
    assess(j, state.clock);
    if (j.kind === "build" && !j.departed && !j.ready && j.due <= state.clock) depart(j, state.clock);
    return true;
  }

