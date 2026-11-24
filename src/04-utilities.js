  // ==================================================
  // UTILITIES
  // ==================================================
  // Each segment's shape, built once from WORLD DATA: its length along the
  // track and, for a curve, its centre, radius, the angle of `a` seen from
  // the centre, and `turn` (+1 bending right, -1 left).
  const SHAPES = {};
  for (const id in SEGMENTS) {
    const { a, b, r } = SEGMENTS[id], A = NODES[a], B = NODES[b];
    const dx = B.x - A.x, dy = B.y - A.y, chord = Math.hypot(dx, dy);
    if (!r) { SHAPES[id] = { length: chord }; continue; }
    const radius = Math.abs(r), turn = Math.sign(r), half = chord / 2;
    if (radius < half) console.warn(`Segment ${id}: radius ${radius} m is too tight for its ends`);
    // The centre stands off the chord's midpoint, to the side it bends toward.
    const off = Math.sqrt(Math.max(0, radius * radius - half * half)) * turn / chord;
    const cx = A.x + dx / 2 - dy * off, cy = A.y + dy / 2 + dx * off;
    SHAPES[id] = { length: radius * 2 * Math.asin(Math.min(1, half / radius)),
                   cx, cy, radius, turn, start: Math.atan2(A.y - cy, A.x - cx) };
  }
  const segmentLength = segId => SHAPES[segId].length;
  // The point `s` metres along a segment from its `a` end, and the unit
  // vector of the track's direction there, pointing toward `b`.
  function pointOn(segId, s) {
    const g = SHAPES[segId], A = NODES[SEGMENTS[segId].a];
    if (!g.radius) {
      const B = NODES[SEGMENTS[segId].b], ux = (B.x - A.x) / g.length, uy = (B.y - A.y) / g.length;
      return { x: A.x + ux * s, y: A.y + uy * s, ux, uy };
    }
    const angle = g.start + g.turn * s / g.radius, cos = Math.cos(angle), sin = Math.sin(angle);
    return { x: g.cx + g.radius * cos, y: g.cy + g.radius * sin, ux: -g.turn * sin, uy: g.turn * cos };
  }
  // Segments meeting at each node, built once from WORLD DATA.
  const SEGMENTS_AT = {};
  for (const id in NODES) SEGMENTS_AT[id] = [];
  for (const id in SEGMENTS) {
    SEGMENTS_AT[SEGMENTS[id].a].push(id);
    SEGMENTS_AT[SEGMENTS[id].b].push(id);
  }

  // Which segment track arriving at `nodeId` along `fromSeg` continues onto,
  // or null at the end of track. Arriving on a switch's trunk follows the leg
  // it is set to; arriving on a leg returns to the trunk. With `trail`,
  // arriving on a leg also sets the switch to it: a train trailing through a
  // switch set against it pushes it over (a spring switch). Retunable: later
  // this could derail instead.
  function routeFrom(nodeId, fromSeg, trail) {
    const sw = SWITCHES[nodeId];
    if (sw) {
      if (fromSeg === sw.trunk) return state.switches[nodeId].set;
      if (trail) state.switches[nodeId].set = fromSeg;
      return sw.trunk;
    }
    return SEGMENTS_AT[nodeId].find(id => id !== fromSeg) || null;
  }

  // Walks `dist` (≥ 0) metres along the track from `s` on `seg`, heading in
  // segment sense `travel`. Returns where it ends and the sense it is then
  // heading in; at the end of track it stops there with `short` the distance
  // it could not go. `nodes`, when given, collects the nodes it passes.
  function walk(seg, s, travel, dist, trail = false, nodes = null) {
    for (;;) {
      const len = segmentLength(seg), room = travel > 0 ? len - s : s;
      if (dist <= room) return { seg, s: s + travel * dist, travel, short: 0 };
      const nodeId = travel > 0 ? SEGMENTS[seg].b : SEGMENTS[seg].a;
      const next = routeFrom(nodeId, seg, trail);
      if (!next) return { seg, s: travel > 0 ? len : 0, travel, short: dist - room };
      if (nodes) nodes.push(nodeId);
      dist -= room;
      travel = SEGMENTS[next].a === nodeId ? 1 : -1;
      s = travel > 0 ? 0 : segmentLength(next);
      seg = next;
    }
  }

  const vehicleType = v => VEHICLE_TYPES[v.type];
  // A starting vehicle's kind: a car's from CARS, a loco's its own.
  function startType(v) { return CARS[v.id] ? CARS[v.id].type : v.type; }
  // A vehicle's mass in kg: a loco's own; a car's tare, plus its load limit
  // while loaded.
  const loadedNow = id => state.cars[id].loaded;
  function vehicleMass(v) {
    const type = vehicleType(v);
    if (state.cars[v.id]) return (type.tare + (loadedNow(v.id) ? type.carga : 0)) * 1000;
    return type.loco ? type.mass : (type.tare + type.carga) * 1000;    // a through train's car, loaded
  }
  // A vehicle's two ends: `head` toward its train's head, `tail` away. Each
  // carries `travel`, the segment sense pointing outward from the vehicle.
  function vehicleEnds(v, trail = false, nodes = null) {
    const half = vehicleType(v).length / 2;
    return { head: walk(v.seg, v.s, v.dir, half, trail, nodes),
             tail: walk(v.seg, v.s, -v.dir, half, trail, nodes) };
  }
  function trainEnds(t) {
    return { head: vehicleEnds(state.vehicles[t.vehicles[0]]).head,
             tail: vehicleEnds(state.vehicles[t.vehicles[t.vehicles.length - 1]]).tail };
  }
  const playerLoco = () => state.vehicles[PLAYER_LOCO];
  // A coupling's identity: the ids of the two vehicles it joins, in order.
  const pairKey = (a, b) => a < b ? a + "|" + b : b + "|" + a;
  const trainOf = v => state.trains[v.train];
  // A coupling's free play: a chain link's when either vehicle is a
  // two-axle car, else a screw coupling's, nearly none (#33).
  const freePlay = (a, b) => vehicleType(a).axles === 2 || vehicleType(b).axles === 2 ? CHAIN_FREE_PLAY : SCREW_FREE_PLAY;

  // Each yard track's shape, built once from WORLD DATA: for each of its
  // segments, `from` (metres from the switch to the segment's start) and
  // `fromA` (whether its `a` end is the switch's side); its length; its
  // buffer node, `end`; and `fouling`, how far from the switch a vehicle's
  // end must be to stand clear of every other track (FOULING_CLEARANCE).
  const TRACK_GEOM = {};
  for (const id in YARD_TRACKS) {
    const segs = {};
    let node = YARD_TRACKS[id].switch, from = 0;
    for (const seg of YARD_TRACKS[id].segments) {
      const fromA = SEGMENTS[seg].a === node;
      segs[seg] = { from, fromA };
      from += segmentLength(seg);
      node = fromA ? SEGMENTS[seg].b : SEGMENTS[seg].a;
    }
    TRACK_GEOM[id] = { segs, length: from, end: node, fouling: 0 };
  }
  // How far along yard track `trackId` from its switch the point `s` on
  // `seg` is, or null when `seg` isn't part of it.
  function trackOffset(trackId, seg, s) {
    const g = TRACK_GEOM[trackId].segs[seg];
    return g ? g.from + (g.fromA ? s : segmentLength(seg) - s) : null;
  }
  // The point `d` metres along yard track `trackId` from its switch.
  function trackPoint(trackId, d) {
    const g = TRACK_GEOM[trackId];
    for (const seg of YARD_TRACKS[trackId].segments) {
      const { from, fromA } = g.segs[seg], len = segmentLength(seg);
      if (d <= from + len) return pointOn(seg, fromA ? d - from : len - (d - from));
    }
    return null;
  }
  // Spot `n` of industry `ind` (numbered from the buffer; null for all its
  // spots together), as offsets from its track's switch: `near` and `far`.
  function spotSpan(ind, n) {
    const g = TRACK_GEOM[INDUSTRIES[ind].track], lo = n ? n - 1 : 0, hi = n || INDUSTRY_SPOTS;
    return { near: g.length - SET_BACK - hi * SPOT_LENGTH, far: g.length - SET_BACK - lo * SPOT_LENGTH };
  }
  // The fouling points: the last metre near the switch where another track
  // comes within FOULING_CLEARANCE, measured against points every metre
  // along every other segment.
  {
    const samples = [];
    for (const seg in SEGMENTS) for (let s = 0, len = segmentLength(seg); s <= len; s += 1) samples.push({ seg, p: pointOn(seg, s) });
    for (const id in TRACK_GEOM) {
      const g = TRACK_GEOM[id], sw = NODES[YARD_TRACKS[id].switch];
      const near = samples.filter(o => !g.segs[o.seg] && Math.hypot(o.p.x - sw.x, o.p.y - sw.y) < 250);
      for (let d = 0; d < Math.min(200, g.length); d += 0.5) {
        const p = trackPoint(id, d);
        if (near.some(o => Math.hypot(o.p.x - p.x, o.p.y - p.y) < FOULING_CLEARANCE)) g.fouling = d + 0.5;
      }
    }
  }
  // The yard track a segment belongs to, or what PLACES calls it, by id.
  const TRACK_OF = {}, PLACE_OF = {};
  for (const id in YARD_TRACKS) for (const seg of YARD_TRACKS[id].segments) TRACK_OF[seg] = id;
  const ofTrack = (seg, t) => seg === t || seg.startsWith(t + "_");
  for (const p of PLACES) for (const seg in SEGMENTS) if (p.tracks.some(t => ofTrack(seg, t))) PLACE_OF[seg] = p.name;
  const RUNNING = new Set(Object.keys(SEGMENTS).filter(seg => RUNNING_TRACKS.some(t => ofTrack(seg, t))));
  // The switches on the running tracks, padlocked lying for the main
  // unless the player holds it (RITO art. 154).
  const MAIN_SWITCHES = Object.keys(SWITCHES).filter(id => [SWITCHES[id].trunk, ...SWITCHES[id].legs].some(seg => RUNNING.has(seg)));
  const MAIN_LENGTH = [...RUNNING].filter(seg => ofTrack(seg, "main")).reduce((sum, seg) => sum + segmentLength(seg), 0);

  // A clock time as HH:MM, and the day it falls on, counted from 1.
  const pad2 = n => String(n).padStart(2, "0");
  const clockText = at => { const m = Math.floor(at / 60) % (24 * 60); return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`; };
  const dayOf = at => Math.floor(at / DAY) + 1;
  // A length of time, `s` seconds, as minutes, or hours and minutes.
  const lateText = s => s >= HOUR ? `${Math.floor(s / HOUR)} h ${Math.floor(s % HOUR / 60)} min` : `${Math.ceil(s / 60)} min`;

