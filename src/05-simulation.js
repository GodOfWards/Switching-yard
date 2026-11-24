  // ==================================================
  // SIMULATION
  // ==================================================
  // A vehicle's ends trail through switches as well as its centre, so a
  // switch is pushed over the moment a vehicle reaches it.
  function trailSwitches(v) { vehicleEnds(v, true); }

  // Flips a train end for end: same vehicles, same motion, head and tail
  // swapped.
  function reverseTrain(t) {
    t.vehicles.reverse();
    for (const id of t.vehicles) { const v = state.vehicles[id]; v.dir *= -1; v.flip *= -1; v.speed = -v.speed; }
  }

  function setNotice(text) { state.notice = { text, time: NOTICE_SECONDS }; }

  // Moves each lever's brake force toward its setting.
  function stepBrakes(c, dt) {
    const approach = (cur, target, upRate, downRate) => target > cur
      ? Math.min(target, cur + upRate * dt) : Math.max(target, cur - downRate * dt);
    c.locoApplied = approach(c.locoApplied, c.locoBrake / LOCO_BRAKE_NOTCHES, LOCO_BRAKE_RATE, LOCO_BRAKE_RATE);
    c.trainApplied = approach(c.trainApplied, c.trainBrake / TRAIN_BRAKE_NOTCHES,
      c.emergency ? EMERGENCY_RATE : TRAIN_BRAKE_APPLY_RATE, TRAIN_BRAKE_RELEASE_RATE);
  }

  // Charges the air at each coupling linked to a loco by connected air all
  // the way; any other coupling's air is bled off.
  function stepAir(t, dt) {
    const ids = t.vehicles, linked = new Set();
    for (const order of [ids, [...ids].reverse()]) {
      let on = false;
      order.forEach((id, i) => {
        if (state.vehicles[id].controls) { on = true; return; }
        const k = i > 0 ? pairKey(order[i - 1], id) : null;
        on = on && k in state.air;
        if (on) linked.add(k);
      });
    }
    for (let i = 1; i < ids.length; i++) {
      const k = pairKey(ids[i - 1], ids[i]);
      if (k in state.air) state.air[k] = linked.has(k) ? Math.min(1, state.air[k] + dt / AIR_CHARGE_SECONDS) : 0;
    }
  }

  // How much of the train brake reaches each vehicle, by id: all of it on a
  // loco; on a car, the weakest charge between it and a loco; 0 when the air
  // is not connected all the way.
  function brakeReach(t) {
    const ids = t.vehicles, reach = {};
    for (const order of [ids, [...ids].reverse()]) {
      let carry = 0;
      order.forEach((id, i) => {
        if (state.vehicles[id].controls) carry = 1;
        else carry = i > 0 ? Math.min(carry, state.air[pairKey(order[i - 1], id)] || 0) : 0;
        reach[id] = Math.max(reach[id] || 0, carry);
      });
    }
    return reach;
  }

  // The forces on each vehicle of a train this step, by id: `pull` (+
  // toward the head), `hold` from brakes, and the resistance to rolling
  // (`roll`) or to getting a standing vehicle moving (`start`). Curves add
  // to both. The train brake reaches only cars with their air connected and
  // charged; a hand brake holds its car whatever train it is in.
  function vehicleForces(t, out) {
    const reach = brakeReach(t);
    let trainApplied = 0;
    for (const id of t.vehicles) {
      const c = state.vehicles[id].controls;
      if (c) trainApplied = Math.max(trainApplied, c.trainApplied);
    }
    for (const id of t.vehicles) {
      const v = state.vehicles[id], type = vehicleType(v), c = v.controls, weight = vehicleMass(v) * G;
      let pull = 0, hold = 0;
      if (c && c.throttle && c.reverser) {
        const sense = c.reverser * v.flip;                        // toward the head, or not
        const along = v.speed * sense;                            // speed in the direction of pull
        const share = c.throttle / THROTTLE_NOTCHES;
        const force = Math.min(LOCO_MAX_FORCE, LOCO_POWER / Math.max(Math.abs(along), EPS));
        const governor = Math.max(0, Math.min(1, (LOCO_MAX_SPEED - along) / GOVERNOR_BAND));
        pull = sense * share * force * governor;
      }
      if (c) hold += c.locoApplied * LOCO_BRAKE_RATIO * weight;
      hold += trainApplied * TRAIN_BRAKE_RATIO * weight * reach[id];
      if (v.handBrake) hold += HAND_BRAKE_FORCE;
      const radius = SHAPES[v.seg].radius;
      const curve = radius ? CURVE_RESISTANCE / radius * weight : 0;
      out[id] = { pull, hold,
                  roll: DAVIS_WEIGHT_SHARE * weight + type.axles * BEARING_AXLE_DRAG[type.bearing] + curve,
                  start: STARTING_RESISTANCE[type.bearing] * weight + curve };
    }
  }

  // The force in the coupling between `front` and the vehicle `back` behind
  // it: + pulling them together (stretched), − pushing them apart (bunched),
  // nothing while the gap is within the free play.
  function couplerForce(front, back) {
    const gap = state.gaps[pairKey(front.id, back.id)], play = freePlay(front, back);
    if (gap >= 0 && gap <= play) return 0;
    const opening = front.speed - back.speed;                     // how fast the gap grows
    const mF = vehicleMass(front), mB = vehicleMass(back);
    const damping = 2 * DRAFT_GEAR_DAMPING * Math.sqrt(DRAFT_GEAR_STIFFNESS * mF * mB / (mF + mB));
    if (gap > 0) return Math.max(0, DRAFT_GEAR_STIFFNESS * (gap - play) + damping * opening);
    return Math.min(0, DRAFT_GEAR_STIFFNESS * gap + damping * opening);
  }

  // Changes a vehicle's speed by `applied` (its pull and coupler forces, +
  // toward the head) against its brakes and resistance, which hold back
  // but never more than it takes to stop. A standing vehicle stays put
  // until `applied` beats its brakes and starting resistance, so a loco
  // takes up the slack and starts a cut one car at a time.
  function accelerateVehicle(v, f, applied, dt) {
    const m = vehicleMass(v);
    if (v.speed === 0) {
      if (Math.abs(applied) <= f.hold + f.start) return;
      v.speed = Math.sign(applied) * (Math.abs(applied) - f.hold - f.roll) / m * dt;
      return;
    }
    const next = v.speed + (applied - Math.sign(v.speed) * (f.hold + f.roll)) / m * dt;
    v.speed = Math.sign(next) === Math.sign(v.speed) ? next : 0;
  }

  // The nearest thing ahead of a train end within `dist` metres: another
  // train's end facing it, or the end of track. null when the way is clear.
  // An end facing it up to DRAFT_GEAR_TRAVEL behind still counts, touching:
  // a coupling parted while bunched leaves its two ends pressed that far
  // into each other. Looking ahead never pushes switches over.
  function findObstacle(end, dist, selfId) {
    const others = [];
    for (const id in state.trains) {
      if (id === selfId) continue;
      const e = trainEnds(state.trains[id]);
      others.push({ train: id, which: "head", ...e.head }, { train: id, which: "tail", ...e.tail });
    }
    let { seg, s, travel } = end, gone = 0;
    for (;;) {
      const len = segmentLength(seg), room = travel > 0 ? len - s : s;
      const reach = Math.min(room, dist - gone);
      let best = null;
      for (const o of others) {
        if (o.seg !== seg || o.travel !== -travel) continue;
        const d = (o.s - s) * travel;
        if (d >= -DRAFT_GEAR_TRAVEL && d <= reach + EPS && (!best || d < best.d)) best = { ...o, d };
      }
      if (best) return { kind: "train", train: best.train, which: best.which, gap: gone + Math.max(0, best.d) };
      if (dist - gone <= room) return null;
      gone += room;
      const nodeId = travel > 0 ? SEGMENTS[seg].b : SEGMENTS[seg].a;
      const next = routeFrom(nodeId, seg, false);
      if (!next) return { kind: "buffer", node: nodeId, gap: gone };
      travel = SEGMENTS[next].a === nodeId ? 1 : -1;
      s = travel > 0 ? 0 : segmentLength(next);
      seg = next;
    }
  }

  // Moves a vehicle `d` metres (+ toward its train's head).
  function moveVehicle(v, d) {
    if (d === 0) return;
    const sense = Math.sign(d);
    const p = walk(v.seg, v.s, v.dir * sense, Math.abs(d), true);
    v.seg = p.seg; v.s = p.s; v.dir = p.travel * sense;
    trailSwitches(v);
  }

  // The vehicle at end `which` ("head" or "tail") of train `t`.
  const endVehicle = (t, which) => state.vehicles[t.vehicles[which === "head" ? 0 : t.vehicles.length - 1]];
  // Which end of train `t` its end vehicle `v` is; for a train of one, the
  // end it met with, `which`.
  const endOf = (t, v, which) => t.vehicles.length === 1 ? which : t.vehicles[0] === v.id ? "head" : "tail";

  // Train X's end `xEnd` has met train Y's end `yEnd`. The two end vehicles
  // meet buffer to buffer; the rest feel it through their couplings. Speeds
  // are compared along one axis, pointing from X into Y. They never couple:
  // that is Hook up's work (hookUp()).
  function contact(X, xEnd, Y, yEnd) {
    const a = endVehicle(X, xEnd), b = endVehicle(Y, yEnd);
    const xs = xEnd === "head" ? 1 : -1, ys = yEnd === "head" ? -1 : 1;
    const uA = a.speed * xs, uB = b.speed * ys, closing = uA - uB;
    if (closing <= 0) return;                                   // already parting
    const mA = vehicleMass(a), mB = vehicleMass(b);
    const shared = (mA * uA + mB * uB) / (mA + mB);              // momentum is kept
    const damaged = closing > DAMAGE_SPEED ? [a, b].filter(v => damageCar(v.id, closing)).map(v => carName(v.id)) : [];
    if (damaged.length) setNotice(`${damaged.join(", ")} damaged at ${(closing * 3.6).toFixed(0)} km/h: bad order`);
    if (closing > HARD_HIT_SPEED) {
      a.speed = (shared + HARD_HIT_RESTITUTION * (shared - uA)) * xs;
      b.speed = (shared + HARD_HIT_RESTITUTION * (shared - uB)) * ys;
      if (!damaged.length) setNotice(`Hard hit at ${(closing * 3.6).toFixed(0)} km/h`);
      return;
    }
    a.speed = shared * xs;                                       // a gentle meeting: buffers touch and push
    b.speed = shared * ys;
  }

  // Joins Y onto X. X's coupling end becomes its tail and Y's its head, so
  // the joined train runs X's vehicles then Y's. The new coupling starts
  // with its buffers touching.
  function couple(X, xEnd, Y, yEnd) {
    if (xEnd === "head") reverseTrain(X);
    if (yEnd === "tail") reverseTrain(Y);
    state.gaps[pairKey(X.vehicles[X.vehicles.length - 1], Y.vehicles[0])] = 0;
    for (const id of Y.vehicles) state.vehicles[id].train = X.id;
    X.vehicles = X.vehicles.concat(Y.vehicles);
    delete state.trains[Y.id];
  }

  // Where two trains' ends meet, buffer to buffer or up to HOOK_REACH
  // apart, uncoupled: each with its pair key, the two end vehicles, their
  // trains and ends, and the gap. A through train is never one of them.
  function meetings() {
    const out = [], seen = new Set();
    for (const id in state.trains) {
      const X = state.trains[id];
      if (drivenBy(X)) continue;
      const ends = trainEnds(X);
      for (const xEnd of ["head", "tail"]) {
        const hit = findObstacle(ends[xEnd], HOOK_REACH, id);
        if (!hit || hit.kind !== "train") continue;
        const Y = state.trains[hit.train];
        if (drivenBy(Y)) continue;
        const a = endVehicle(X, xEnd), b = endVehicle(Y, hit.which), key = pairKey(a.id, b.id);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ key, a: a.id, b: b.id, X, xEnd, Y, yEnd: hit.which, gap: hit.gap });
      }
    }
    return out;
  }

  // The shunter's work at couplings (#33): each piece done once its time
  // comes, or dropped, with a notice, if a vehicle moved or the coupling or
  // meeting is gone. Hooking up closes the gap and joins the two trains;
  // uncoupling parts them, and the air with them. Skipping stands
  // everything, so work falls due during a skip as in play.
  function stepWork() {
    for (const k in state.work) {
      const w = state.work[k], a = state.vehicles[w.a], b = state.vehicles[w.b];
      const what = w.kind === "hook" ? "Hook-up" : "Uncoupling";
      if (!a || !b) { delete state.work[k]; continue; }
      if (a.speed !== 0 || b.speed !== 0) { delete state.work[k]; setNotice(`${what} stopped: the cars moved`); continue; }
      if (state.clock < w.done) continue;
      delete state.work[k];
      if (w.kind === "unhook") { splitBehind(w.a, w.b); continue; }
      const m = meetings().find(m => m.key === k);
      if (!m) { setNotice(`${what} stopped: the cars are apart`); continue; }
      // The screw draws the two together until the buffers meet.
      const sense = m.yEnd === "head" ? 1 : -1;
      for (const id of m.Y.vehicles) moveVehicle(state.vehicles[id], sense * m.gap);
      couple(m.X, m.xEnd, m.Y, m.yEnd);
    }
  }

  // Moves each vehicle of a train by its own speed. The two end vehicles
  // stop short at whatever they meet, then meet it; each coupling's gap
  // changes by how far its two vehicles moved apart.
  function advance(t, dt) {
    const ids = t.vehicles.slice(), last = ids.length - 1, moved = {}, hits = [];
    ids.forEach((id, i) => {
      const v = state.vehicles[id], d = v.speed * dt;
      const lead = i === 0 && d > 0 ? "head" : i === last && d < 0 ? "tail" : null;
      const hit = lead && findObstacle(vehicleEnds(v)[lead], Math.abs(d), t.id);
      moved[id] = hit ? Math.sign(d) * hit.gap : d;
      moveVehicle(v, moved[id]);
      if (hit) hits.push({ v, lead, hit, other: hit.kind === "train" && endVehicle(state.trains[hit.train], hit.which) });
    });
    for (let i = 0; i < last; i++) state.gaps[pairKey(ids[i], ids[i + 1])] += moved[ids[i]] - moved[ids[i + 1]];
    for (const { v, lead, hit, other } of hits) {
      if (hit.kind === "buffer") {
        // A buffer stop: the vehicle stops against it. The map's edge stops
        // the player's train the same way; a through train leaves the map
        // there (stepThrough).
        if (MAP_EDGES.includes(hit.node)) { if (!drivenBy(trainOf(v))) setNotice("The line runs on beyond the map"); }
        else if (Math.abs(v.speed) > HARD_HIT_SPEED) setNotice(`Hit the buffers at ${(Math.abs(v.speed) * 3.6).toFixed(0)} km/h`);
        v.speed = 0;
        continue;
      }
      // An earlier meeting this substep may have joined or turned the trains.
      // A through train is never coupled to: meeting one stops the
      // vehicle as a buffer would.
      const X = trainOf(v), Y = trainOf(other);
      if (X !== Y && (drivenBy(X) || drivenBy(Y))) { v.speed = 0; continue; }
      if (X !== Y) contact(X, endOf(X, v, lead), Y, endOf(Y, other, hit.which));
    }
  }

  // One substep: coupler forces, then speeds, then moves.
  function substep(forces, dt) {
    for (const id in state.trains) {
      const ids = state.trains[id].vehicles, applied = {}, run = drivenBy(state.trains[id]);
      if (run) { for (const vid of ids) state.vehicles[vid].speed = run.speed; continue; }   // the game drives it
      for (const vid of ids) applied[vid] = forces[vid].pull;
      for (let i = 0; i + 1 < ids.length; i++) {
        const tension = couplerForce(state.vehicles[ids[i]], state.vehicles[ids[i + 1]]);
        applied[ids[i]] -= tension;
        applied[ids[i + 1]] += tension;
      }
      for (const vid of ids) accelerateVehicle(state.vehicles[vid], forces[vid], applied[vid], dt);
    }
    for (const id of Object.keys(state.trains)) if (state.trains[id]) advance(state.trains[id], dt);
  }

  function step(dt) {
    state.clock += dt;
    for (const id in state.vehicles) if (state.vehicles[id].controls) stepBrakes(state.vehicles[id].controls, dt);
    for (const id in state.trains) stepAir(state.trains[id], dt);
    const forces = {};
    for (const id in state.trains) vehicleForces(state.trains[id], forces);
    for (let i = 0; i < SLACK_SUBSTEPS; i++) substep(forces, dt / SLACK_SUBSTEPS);
    stepWork();
    countMoves();
    stepThrough(dt);
    runEvents();
    if (state.notice && (state.notice.time -= dt) <= 0) state.notice = null;
  }

  // The shift the clock `at` falls in: when it began and when it ends.
  function shiftAt(at) {
    const len = SHIFT_HOURS * HOUR;
    const start = START_CLOCK + Math.floor((at - START_CLOCK) / len) * len;
    return { start, end: start + len };
  }
  // The events ahead of the clock, soonest first, up to and including the
  // end of this shift: jobs falling due, road trains arriving and leaving
  // (a departure with its build job), through trains offered, an
  // industry's work done, and the shift change, when the next jobs open.
  function eventsAhead() {
    const end = shiftAt(state.clock).end, out = [];
    for (const j of state.jobs) if (!j.result && j.kind !== "build" && j.due > state.clock && j.due <= end) out.push({ at: j.due, kind: "due", job: j.id });
    for (const r of runsBetween(state.timetableAt, end)) {
      if (r.at <= state.clock) continue;
      const j = state.jobs.find(j => j.run === r.id);
      out.push({ at: r.at, kind: "train", tt: r.tt, job: j && !j.result ? j.id : null });
    }
    for (const r of runsBetween(Math.max(state.throughAt, state.clock + 1) + OFFER_LEAD_SECONDS, end + OFFER_LEAD_SECONDS, THROUGH_TIMETABLE))
      out.push({ at: r.at - OFFER_LEAD_SECONDS, kind: "offer", through: r.tt });
    for (const ind in INDUSTRIES) {
      const r = state.industries[ind].readyAt;
      if (r !== null && r > state.clock && r < end) out.push({ at: r, kind: "industry", industry: ind });
    }
    out.push({ at: end, kind: "shift" });
    return out.sort((a, b) => a.at - b.at);
  }
  // The first SKIP_MARK_SECONDS mark after the clock.
  const nextMark = () => (Math.floor(state.clock / SKIP_MARK_SECONDS) + 1) * SKIP_MARK_SECONDS;

  // Whether any vehicle stands over a node.
  function nodeOccupied(nodeId) {
    for (const id in state.vehicles) {
      const nodes = [];
      vehicleEnds(state.vehicles[id], false, nodes);
      if (nodes.includes(nodeId)) return true;
    }
    return false;
  }

