  // ==================================================
  // RENDERING
  // ==================================================
  // Canvas colours, matched to the page's CSS palette. Rolling stock keeps
  // its own colours in WORLD DATA.
  const PALETTE = {
    bg: "#000",
    trackFar: "#777d80",   // track as one line, zoomed out: steel grey
    ties: "#484039",       // dark, so the rails lead and the ties are texture
    rails: "#b5b9b7",
    buffer: "#d6d0c4",
    switchEdge: "#000",
    switchNormal: "#38b96b",
    switchReversed: "#d4a052", // ochre, the CSS --warn
    light: "#ecebe7",      // cab, hand-brake band, notices
    accent: "#829c85",     // reverser arrow, Paused; the CSS --accent
    air: "#78afc4",
    north: "#a0aaa2",      // the CSS --muted
    ballast: "#292b2a",    // under the running tracks, setting them apart from the yard's
    signalClear: "#38b96b",
    signalDanger: "#e54840",
    label: "#252927",      // a yard track's number disc
    mapRunning: "#5c6264",  // the Map: the running tracks, darker than the yard's
    mapClosed: "#545859",   // the Map: a closed line, dashed
    mapFrameFill: "rgba(130, 156, 133, 0.13)",  // the Map: what play shows, the accent faintly
  };
  const canvas = document.getElementById("yard");
  const ctx = canvas.getContext("2d");
  const readoutText = document.getElementById("readoutText");
  const versionEl = document.getElementById("version");
  versionEl.textContent = `v${GAME_CONFIG.VERSION}`;
  const followBtn = document.getElementById("followBtn");
  const mapBtn = document.getElementById("mapBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const levers = { rev: document.getElementById("revLever"), thr: document.getElementById("thrLever"), lb: document.getElementById("lbLever"),
                   tb: document.getElementById("tbLever") };

  // Points every few metres along a stretch of a segment, from `s0` to `s1`,
  // for drawing it. A straight needs only its ends.
  function trackPoints(segId, s0, s1) {
    const n = SHAPES[segId].radius ? Math.max(1, Math.ceil(Math.abs(s1 - s0) / 2)) : 1, out = [];
    for (let i = 0; i <= n; i++) out.push(pointOn(segId, s0 + (s1 - s0) * i / n));
    return out;
  }

  // World bounds, from WORLD DATA, once. Curves can bow out past their nodes.
  // BOUNDS holds all the track, which the camera can pan over; YARD_BOUNDS
  // the track but the running tracks, which the Map's first step fits
  // the screen, so the main line runs on off it.
  function boundsOf(ids) {
    const pts = ids.flatMap(id => trackPoints(id, 0, segmentLength(id)));
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    return { minX: Math.min(...xs) - VIEW_MARGIN, maxX: Math.max(...xs) + VIEW_MARGIN,
             minY: Math.min(...ys) - VIEW_MARGIN, maxY: Math.max(...ys) + VIEW_MARGIN };
  }
  const BOUNDS = boundsOf(Object.keys(SEGMENTS));
  const YARD_BOUNDS = boundsOf(Object.keys(SEGMENTS).filter(id => !RUNNING.has(id)));

  // What the screen shows. In play, ZOOM_LEVELS[zoom] px per metre,
  // following the player's loco until a drag pans it to (cx, cy). `map` is
  // the Map's step out (#53), 1 to MAP_STEPS, or 0 in play.
  const camera = { zoom: START_ZOOM, follow: true, cx: 0, cy: 0, map: 0 };

  // A yard wider than it is tall, on a screen taller than it is wide, is
  // turned a quarter anticlockwise: +x runs up the screen and +y runs right.
  function yardTurned(w, h) {
    return (h > w) === (YARD_BOUNDS.maxX - YARD_BOUNDS.minX > YARD_BOUNDS.maxY - YARD_BOUNDS.minY);
  }
  // The world↔screen mappings for a canvas of w×h CSS px: toScreen(x, y)
  // and its inverse toWorld(sx, sy).
  const makeView = (w, h) => camera.map ? makeMapView(w, h) : makePlayView(w, h);
  // Play: the view centres on the camera's point, kept so the track never
  // leaves the screen.
  function makePlayView(w, h) {
    const turned = yardTurned(w, h), k = ZOOM_LEVELS[camera.zoom];
    let cx = camera.cx, cy = camera.cy;
    if (camera.follow) { const p = pointOn(playerLoco().seg, playerLoco().s); cx = p.x; cy = p.y; }
    const fit = (c, lo, hi, seen) => hi - lo <= seen ? (lo + hi) / 2 : Math.max(lo + seen / 2, Math.min(hi - seen / 2, c));
    cx = fit(cx, BOUNDS.minX, BOUNDS.maxX, (turned ? h : w) / k);
    cy = fit(cy, BOUNDS.minY, BOUNDS.maxY, (turned ? w : h) / k);
    return {
      k, turned, cx, cy,
      toScreen: turned
        ? (x, y) => ({ x: w / 2 + (y - cy) * k, y: h / 2 - (x - cx) * k })
        : (x, y) => ({ x: w / 2 + (x - cx) * k, y: h / 2 + (y - cy) * k }),
      toWorld: turned
        ? (sx, sy) => ({ x: cx - (sy - h / 2) / k, y: cy + (sx - w / 2) / k })
        : (sx, sy) => ({ x: cx + (sx - w / 2) / k, y: cy + (sy - h / 2) / k }),
    };
  }
  // The Map, kept clear of the buttons and the clock: MAP_INSET is the room
  // left at the top, right, bottom and left, in CSS px.
  const MAP_INSET = { top: 56, right: 16, bottom: 52, left: 52 };
  // Step 1 is the yard turned as play is, fitted, and widened across the
  // yard (k along it, ka across) so its tracks come apart. Steps 2 and up
  // are north up, fitted to their points (mapPoints()).
  function makeMapView(w, h) {
    const M = MAP_INSET, aw = w - M.left - M.right, ah = h - M.top - M.bottom;
    if (camera.map === 1) {
      const B = YARD_BOUNDS, along = B.maxX - B.minX, across = B.maxY - B.minY, turned = yardTurned(w, h);
      const roomAlong = turned ? ah : aw, roomAcross = turned ? aw : ah;
      const k = Math.min(roomAlong / along, roomAcross / across);
      const ka = Math.max(k, Math.min(MAP_WIDEN_MAX * k, roomAcross / across));
      const oa = (turned ? M.top : M.left) + (roomAlong - along * k) / 2;
      const oc = (turned ? M.left : M.top) + (roomAcross - across * ka) / 2;
      return {
        k, ka, turned,
        toScreen: turned
          ? (x, y) => ({ x: oc + (y - B.minY) * ka, y: oa + (B.maxX - x) * k })
          : (x, y) => ({ x: oa + (x - B.minX) * k, y: oc + (y - B.minY) * ka }),
        toWorld: turned
          ? (sx, sy) => ({ x: B.maxX - (sy - oa) / k, y: B.minY + (sx - oc) / ka })
          : (sx, sy) => ({ x: B.minX + (sx - oa) / k, y: B.minY + (sy - oc) / ka }),
      };
    }
    // North up: east (E) runs right, north (NORTH) up the screen.
    const E = { x: -NORTH.y, y: NORTH.x }, en = p => ({ e: p.x * E.x + p.y * E.y, n: p.x * NORTH.x + p.y * NORTH.y });
    const pts = mapPoints(camera.map).map(en), es = pts.map(p => p.e), ns = pts.map(p => p.n);
    const e0 = Math.min(...es), e1 = Math.max(...es), n0 = Math.min(...ns), n1 = Math.max(...ns);
    const k = Math.min(aw / (e1 - e0), ah / (n1 - n0));
    const ox = M.left + (aw - (e1 - e0) * k) / 2, oy = M.top + (ah - (n1 - n0) * k) / 2;
    return {
      k, turned: false,
      toScreen: (x, y) => { const q = en({ x, y }); return { x: ox + (q.e - e0) * k, y: oy + (n1 - q.n) * k }; },
      toWorld: (sx, sy) => { const e = e0 + (sx - ox) / k, n = n1 - (sy - oy) / k; return { x: e * E.x + n * NORTH.x, y: e * E.y + n * NORTH.y }; },
    };
  }
  // What a north-up step of the Map fits: step 2 the track, step 3 the lines
  // out of Junín as well.
  const TRACK_ENDS = Object.keys(SEGMENTS).flatMap(id => [pointOn(id, 0), pointOn(id, segmentLength(id))]);
  const NETWORK_POINTS = NETWORK_LINES.flatMap(l => l.points.map(([x, y]) => ({ x, y })));
  const mapPoints = step => step === 2 ? TRACK_ENDS : TRACK_ENDS.concat(NETWORK_POINTS);
  let screenW = 1, screenH = 1, view = makeView(1, 1);

  function resize() {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    screenW = r.width; screenH = r.height;
  }
  new ResizeObserver(resize).observe(canvas);

  function line(x1, y1, x2, y2, colour, width) {
    const a = view.toScreen(x1, y1), b = view.toScreen(x2, y2);
    ctx.strokeStyle = colour; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  function polyline(points, colour, width) {
    ctx.strokeStyle = colour; ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((p, i) => { const c = view.toScreen(p.x, p.y); i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y); });
    ctx.stroke();
  }
  const endPoint = e => pointOn(e.seg, e.s);
  // A point `d` metres from `p` toward `q`.
  function toward(p, q, d) {
    const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: p.x + (q.x - p.x) * d / len, y: p.y + (q.y - p.y) * d / len };
  }
  // Where each coupling is: the joint behind every vehicle but a train's
  // last, `hooked`; and where two trains' ends meet uncoupled, between them,
  // with the `gap` between their buffers.
  function couplings() {
    const out = [];
    for (const id in state.trains) {
      const t = state.trains[id];
      for (let i = 0; i < t.vehicles.length - 1; i++) {
        const v = state.vehicles[t.vehicles[i]];
        out.push({ vehicle: v.id, key: pairKey(v.id, t.vehicles[i + 1]), hooked: true, at: endPoint(vehicleEnds(v).tail) });
      }
    }
    for (const m of meetings()) {
      const p = endPoint(trainEnds(m.X)[m.xEnd]), q = endPoint(trainEnds(m.Y)[m.yEnd]);
      out.push({ vehicle: m.a, key: m.key, hooked: false, gap: m.gap, at: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } });
    }
    return out;
  }

  function render() {
    view = makeView(screenW, screenH);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    if (camera.map) drawMap(); else drawYard();
    if (dev.on) drawDevLabels();
    placeCouplingMenu();
    placeCarCard();
    placeMainMenu();

    // North arrow in the top right corner, turned with the view.
    {
      const o = view.toScreen(0, 0), n = view.toScreen(NORTH.x, NORTH.y);
      const len = Math.hypot(n.x - o.x, n.y - o.y) || 1, ux = (n.x - o.x) / len, uy = (n.y - o.y) / len;
      const cx = screenW - 26, cy = 34, size = 10;
      ctx.fillStyle = PALETTE.north;
      ctx.beginPath();
      ctx.moveTo(cx + ux * size, cy + uy * size);
      ctx.lineTo(cx - ux * size * 0.6 - uy * size * 0.5, cy - uy * size * 0.6 + ux * size * 0.5);
      ctx.lineTo(cx - ux * size * 0.3, cy - uy * size * 0.3);
      ctx.lineTo(cx - ux * size * 0.6 + uy * size * 0.5, cy - uy * size * 0.6 - ux * size * 0.5);
      ctx.fill();
      ctx.font = "600 11px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("N", cx + ux * size * 2, cy + uy * size * 2);
      ctx.globalAlpha = 1; ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    }

    if (state.notice) {
      ctx.globalAlpha = Math.min(1, state.notice.time);
      ctx.font = "600 15px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.light;
      const chips = (jobChip.classList.contains("open") ? 1 : 0) + (mainChip.classList.contains("open") ? 1 : 0);
      ctx.fillText(state.notice.text, screenW / 2, 72 + 38 * chips);   // under the clock and the chips
      ctx.globalAlpha = 1; ctx.textAlign = "start";
    }
    if (paused) {
      ctx.font = "600 22px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.accent;
      ctx.fillText("Paused", screenW / 2, screenH / 2);
      ctx.textAlign = "start";
    }

    const loco = playerLoco(), c = loco.controls, t = trainOf(loco);
    const cars = t.vehicles.length - 1, reach = brakeReach(t);
    const braked = t.vehicles.filter(id => !state.vehicles[id].controls && reach[id] >= 1).length;
    const text = `${(Math.abs(loco.speed) * 3.6).toFixed(1)} km/h · ${cars} car${cars === 1 ? "" : "s"}${cars ? ` · air ${braked}/${cars}` : ""}`;
    if (readoutText.textContent !== text) readoutText.textContent = text;
    renderClock();
    renderJobs();
    renderMainChip();
    renderDevPanel();
    followBtn.classList.toggle("on", camera.follow && !camera.map);
    mapBtn.classList.toggle("on", !!camera.map);
    pauseBtn.classList.toggle("on", paused);
    pauseBtn.innerHTML = paused ? "▶&#xFE0E;" : "❚❚";
    pauseBtn.setAttribute("aria-label", paused ? "Resume" : "Pause");
    levers.rev.innerHTML = `Reverser<b>${c.reverser > 0 ? "Fwd" : c.reverser < 0 ? "Rev" : "N"}</b>`;
    levers.thr.innerHTML = `Throttle<b>${c.throttle}/${THROTTLE_NOTCHES}</b>`;
    levers.lb.innerHTML = `Loco brake<b>${c.locoBrake}/${LOCO_BRAKE_NOTCHES}</b>` +
      `<div class="meter"><i style="width:${c.locoApplied * 100}%"></i></div>`;
    levers.tb.innerHTML = `Train brake<b>${c.emergency ? "EMERG" : c.trainBrake + "/" + TRAIN_BRAKE_NOTCHES}</b>` +
      `<div class="meter"><i style="width:${c.trainApplied * 100}%"></i></div>`;
  }

  // The yard in play, at the camera's zoom.
  function drawYard() {
    const k = view.k;
    const trackWidth = Math.max(3, k);
    const detailed = k >= TRACK_DETAIL_K;
    for (const id of RUNNING) polyline(trackPoints(id, 0, segmentLength(id)), PALETTE.ballast, Math.max(trackWidth * 3, k * TIE_LENGTH * 1.6));
    // A stretch of track, `s0` to `s1` along segment `id`: zoomed out a
    // single line; zoomed in two rails on ties.
    function drawTrack(id, s0, s1, alpha) {
      const pts = trackPoints(id, s0, s1);
      ctx.globalAlpha = alpha;
      if (!detailed) { polyline(pts, PALETTE.trackFar, trackWidth); ctx.globalAlpha = 1; return; }
      const half = GAUGE / 2, len = Math.abs(s1 - s0), dir = Math.sign(s1 - s0) || 1;
      ctx.lineCap = "butt";
      ctx.strokeStyle = PALETTE.ties; ctx.lineWidth = Math.max(1.5, k * 0.25);  // ties, in one path
      ctx.beginPath();
      for (let d = TIE_SPACING / 2; d < len; d += TIE_SPACING) {
        const p = pointOn(id, s0 + dir * d), h = TIE_LENGTH / 2;
        const e1 = view.toScreen(p.x - p.uy * h, p.y + p.ux * h), e2 = view.toScreen(p.x + p.uy * h, p.y - p.ux * h);
        ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y);
      }
      ctx.stroke();
      for (const side of [-1, 1])                                        // rails
        polyline(pts.map(p => ({ x: p.x - p.uy * half * side, y: p.y + p.ux * half * side })), PALETTE.rails, Math.max(1.2, k * 0.12));
      ctx.lineCap = "round";
      ctx.globalAlpha = 1;
    }
    // The leg a switch is not set to fades in from the switch, so the route
    // through the points reads at a glance.
    const dimmed = {};
    for (const id in SWITCHES) for (const leg of SWITCHES[id].legs)
      if (leg !== state.switches[id].set) (dimmed[leg] = dimmed[leg] || []).push(SEGMENTS[leg].a === id ? "a" : "b");
    // Faded stretches go down first, so the set route draws over them where
    // the legs still overlap. They fade in from the switch in a few steps.
    const solid = [];
    for (const id in SEGMENTS) {
      const len = segmentLength(id), ends = dimmed[id] || [], reach = Math.min(SWITCH_DIM_LENGTH, len / 2);
      const s0 = ends.includes("a") ? reach : 0, s1 = ends.includes("b") ? len - reach : len;
      solid.push([id, s0, s1]);
      for (let i = 0; i < SWITCH_DIM_STEPS; i++) {
        const f0 = i / SWITCH_DIM_STEPS, f1 = (i + 1) / SWITCH_DIM_STEPS, alpha = 0.3 + 0.7 * f0;
        if (s0 > 0) drawTrack(id, s0 * f0, s0 * f1, alpha);
        if (s1 < len) drawTrack(id, len - (len - s1) * f0, len - (len - s1) * f1, alpha);
      }
    }
    for (const [id, s0, s1] of solid) drawTrack(id, s0, s1, 1);
    // Buffer stops at every end of track but the map's edges.
    for (const id in NODES) {
      if (SEGMENTS_AT[id].length !== 1 || MAP_EDGES.includes(id)) continue;
      const seg = SEGMENTS_AT[id][0], p = pointOn(seg, SEGMENTS[seg].a === id ? 0 : segmentLength(seg));
      line(p.x - p.uy * 2, p.y + p.ux * 2, p.x + p.uy * 2, p.y - p.ux * 2, PALETTE.buffer, Math.max(3, k * 0.8));
    }

    // Switch targets, after FA practice (RGF art. 100): a green disc when the
    // switch is set normal, a yellow triangle on black when it is reversed,
    // pointing along the leg it is set to.
    for (const id in SWITCHES) {
      const n = NODES[id], set = state.switches[id].set, normal = set === SWITCHES[id].normal;
      const len = segmentLength(set), atA = SEGMENTS[set].a === id;
      const c = view.toScreen(n.x, n.y), r = Math.max(6, k * 1.6);
      const ahead = pointOn(set, atA ? Math.min(6, len) : len - Math.min(6, len)), q = view.toScreen(ahead.x, ahead.y);
      const dl = Math.hypot(q.x - c.x, q.y - c.y) || 1, ux = (q.x - c.x) / dl, uy = (q.y - c.y) / dl;
      ctx.strokeStyle = PALETTE.switchEdge; ctx.lineWidth = 2;
      ctx.beginPath();
      if (normal) { ctx.fillStyle = PALETTE.switchNormal; ctx.arc(c.x, c.y, r * 0.8, 0, Math.PI * 2); }
      else {
        ctx.fillStyle = PALETTE.switchReversed;
        ctx.moveTo(c.x + ux * r * 1.2, c.y + uy * r * 1.2);
        ctx.lineTo(c.x - ux * r * 0.7 - uy * r, c.y - uy * r * 0.7 + ux * r);
        ctx.lineTo(c.x - ux * r * 0.7 + uy * r, c.y - uy * r * 0.7 - ux * r);
        ctx.closePath();
      }
      ctx.stroke(); ctx.fill();
      // Padlocked, lying for the main or locked for a Retiro road train's
      // route (#78): a small lock beside it.
      if ((MAIN_SWITCHES.includes(id) && !state.main.held) || roadLock(id)) {
        const lx = c.x + r * 1.3, ly = c.y - r * 1.3, w = Math.max(7, r * 0.9);
        ctx.strokeStyle = PALETTE.light; ctx.lineWidth = Math.max(1.5, w * 0.18);
        ctx.beginPath(); ctx.arc(lx, ly - w * 0.25, w * 0.3, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = PALETTE.light; ctx.fillRect(lx - w / 2, ly - w * 0.25, w, w * 0.65);
      }
    }
    // The east home signal, beside the main on the side away from the yard:
    // clear while a through train or a Retiro road train from the east runs
    // in past it, at danger otherwise.
    {
      const sig = homeSignal(), p = pointOn(sig.seg, sig.s), side = 3.5;
      const past = r => r.vehicles.some(id => pointOn(state.vehicles[id].seg, state.vehicles[id].s).x > p.x);
      const clear = state.through.some(r => r.status === "running" && throughEntry(r.tt).enters === "east" && past(r))
        || state.road.some(r => r.kind === "arrival" && r.status === "running" && past(r));
      const foot = { x: p.x - p.uy * 2, y: p.y + p.ux * 2 }, top = { x: p.x - p.uy * (2 + side), y: p.y + p.ux * (2 + side) };
      line(foot.x, foot.y, top.x, top.y, PALETTE.light, Math.max(1.5, k * 0.25));
      const c = view.toScreen(top.x, top.y);
      ctx.fillStyle = clear ? PALETTE.signalClear : PALETTE.signalDanger; ctx.strokeStyle = PALETTE.switchEdge; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(5, k * 1.1), 0, Math.PI * 2); ctx.stroke(); ctx.fill();
    }

    // Vehicles, each drawn end to end with a small gap; couplings bridge it.
    const bodyWidth = Math.max(10, 3 * k), inset = 0.5;
    ctx.lineCap = "butt";
    for (const id in state.vehicles) {
      const v = state.vehicles[id], type = vehicleType(v), e = vehicleEnds(v);
      const head = endPoint(e.head), tail = endPoint(e.tail);
      const front = toward(head, tail, inset), back = toward(tail, head, inset);
      if (id === cardFor) line(back.x, back.y, front.x, front.y, PALETTE.accent, bodyWidth + 4);  // its card is open
      const car = state.cars[id];
      line(back.x, back.y, front.x, front.y, car && car.line ? LINE_PAINT : type.colour, bodyWidth);
      if (car && type.band && !car.line)                  // a tank's band, across it at a quarter from each end
        for (const at of [0.25, 0.75]) {
          const p = toward(head, tail, type.length * at - 0.5), q = toward(head, tail, type.length * at + 0.5);
          line(p.x, p.y, q.x, q.y, type.band, bodyWidth);
        }
      if (type.stripe) {                                  // a stripe along each side
        const sw = bodyWidth * type.stripeShare, off = (bodyWidth - sw) / 2;   // screen px from the middle
        const s1 = view.toScreen(front.x, front.y), s2 = view.toScreen(back.x, back.y);
        const len = Math.hypot(s2.x - s1.x, s2.y - s1.y) || 1, nx = -(s2.y - s1.y) / len * off, ny = (s2.x - s1.x) / len * off;
        ctx.strokeStyle = type.stripe; ctx.lineWidth = sw;
        for (const side of [1, -1]) {
          ctx.beginPath(); ctx.moveTo(s1.x + nx * side, s1.y + ny * side); ctx.lineTo(s2.x + nx * side, s2.y + ny * side); ctx.stroke();
        }
      }
      if (type.ends)                                      // a coach's ends
        for (const [a, b] of [[front, back], [back, front]]) {
          const q = toward(a, b, 0.8);
          line(a.x, a.y, q.x, q.y, type.ends, bodyWidth);
        }
      if (car && !loadedNow(id)) {                        // an empty car is drawn hollow
        const f = toward(front, back, 1), b = toward(back, front, 1);
        line(b.x, b.y, f.x, f.y, PALETTE.bg, bodyWidth * 0.4);
      }
      if (type.loco) {                                    // cab, at the end it faces
        const cabEnd = v.flip > 0 ? front : back, other = v.flip > 0 ? back : front;
        const c1 = toward(cabEnd, other, 0.6), c2 = toward(cabEnd, other, 3);
        line(c1.x, c1.y, c2.x, c2.y, PALETTE.light, bodyWidth * 0.6);
      }
      if (type.coach && k > 2.5) {                        // a coach's FA code, on its roof
        const m = view.toScreen((head.x + tail.x) / 2, (head.y + tail.y) / 2);
        ctx.fillStyle = type.ends; ctx.font = `700 ${Math.round(Math.min(13, bodyWidth * 0.7))}px system-ui, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(type.code, m.x, m.y + 0.5);
        ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
      }
      if (v.handBrake) {                                  // a hand brake set: a light band at the middle
        const mid = toward(head, tail, type.length / 2), along = toward(head, tail, type.length / 2 + 1.5);
        line(mid.x, mid.y, along.x, along.y, PALETTE.light, bodyWidth * 1.3);
      }
      if (v.controls && v.controls.reverser) {            // arrow off the end the reverser points to
        const toHead = v.controls.reverser * v.flip > 0;
        const pe = toHead ? head : tail, po = toHead ? tail : head;
        const e = view.toScreen(pe.x, pe.y), o = view.toScreen(po.x, po.y);
        const len = Math.hypot(e.x - o.x, e.y - o.y) || 1, ux = (e.x - o.x) / len, uy = (e.y - o.y) / len;
        const size = Math.max(7, k * 1.5), bx = e.x + ux * size * 0.4, by = e.y + uy * size * 0.4;
        ctx.fillStyle = PALETTE.accent;
        ctx.beginPath();
        ctx.moveTo(bx + ux * size * 1.2, by + uy * size * 1.2);
        ctx.lineTo(bx - uy * size * 0.8, by + ux * size * 0.8);
        ctx.lineTo(bx + uy * size * 0.8, by - ux * size * 0.8);
        ctx.fill();
      }
    }
    // Couplings: dark with no air; with air connected, a larger dot that
    // fills in blue as the air charges. Buffers meeting uncoupled: a ring.
    // The shunter's work under way: an arc round it, filling as it's done.
    for (const c of couplings()) {
      const p = view.toScreen(c.at.x, c.at.y), air = state.air[c.key], r = Math.max(2.5, k * 0.5), w = state.work[c.key];
      if (!c.hooked) {
        ctx.strokeStyle = PALETTE.bg; ctx.lineWidth = Math.max(1.5, r * 0.6);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.3, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.fillStyle = PALETTE.bg;
        ctx.beginPath(); ctx.arc(p.x, p.y, air === undefined ? r : r * 1.6, 0, Math.PI * 2); ctx.fill();
        if (air !== undefined) {
          ctx.fillStyle = PALETTE.air; ctx.globalAlpha = 0.35 + 0.65 * air;
          ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.1, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      if (w) {
        const done = 1 - Math.max(0, w.done - state.clock) / HOOK_UP_SECONDS;
        ctx.strokeStyle = PALETTE.accent; ctx.lineWidth = Math.max(2, r * 0.6);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.4, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2); ctx.stroke();
      }
    }
    // Each yard track: a clearance mark across it at its fouling point, and
    // its number on a disc a little past it.
    for (const id in YARD_TRACKS) {
      const g = TRACK_GEOM[id], p = trackPoint(id, g.fouling), h = GAUGE * 1.2;
      line(p.x - p.uy * h, p.y + p.ux * h, p.x + p.uy * h, p.y - p.ux * h, PALETTE.buffer, Math.max(1.5, k * 0.3));
      const at = trackPoint(id, g.fouling + 12), c = view.toScreen(at.x, at.y), r = Math.max(8, Math.min(12, k * 2));
      ctx.fillStyle = PALETTE.label; ctx.strokeStyle = PALETTE.trackFar; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PALETTE.light; ctx.font = `600 ${Math.round(r * 1.1)}px system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(YARD_TRACKS[id].number, c.x, c.y + 0.5);
      ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    }
    // Each industry's spots: a tick across its track at either end of each,
    // with its number where cars go to a numbered spot, and its name
    // beside them.
    for (const ind in INDUSTRIES) {
      const t = INDUSTRIES[ind].track, all = spotSpan(ind, null), h = GAUGE * 0.9;
      // Labels go on the side away from the other industries' tracks.
      const mid = trackPoint(t, (all.near + all.far) / 2), others = Object.keys(INDUSTRIES).filter(o => o !== ind)
        .map(o => { const sa = spotSpan(o, null); return trackPoint(INDUSTRIES[o].track, (sa.near + sa.far) / 2); });
      const away = sd => Math.min(Infinity, ...others.map(o => Math.hypot(mid.x - mid.uy * sd - o.x, mid.y + mid.ux * sd - o.y)));
      const side = away(1) >= away(-1) ? 1 : -1;
      for (let i = 0; i <= INDUSTRY_SPOTS; i++) {
        const p = trackPoint(t, all.far - i * SPOT_LENGTH);
        line(p.x - p.uy * h, p.y + p.ux * h, p.x + p.uy * h, p.y - p.ux * h, PALETTE.buffer, Math.max(1, k * 0.2));
      }
      ctx.fillStyle = PALETTE.label; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (BLOCKS[YARD_TRACKS[t].block].ordering === "exact" && k > 2.5) {
        ctx.font = `600 ${Math.round(Math.min(12, k * 1.6))}px system-ui, sans-serif`;
        for (let n = 1; n <= INDUSTRY_SPOTS; n++) {
          const sp = spotSpan(ind, n), p = trackPoint(t, (sp.near + sp.far) / 2), c = view.toScreen(p.x - p.uy * 3 * side, p.y + p.ux * 3 * side);
          ctx.fillText(n, c.x, c.y);
        }
      }
      const c = view.toScreen(mid.x - mid.uy * 7 * side, mid.y + mid.ux * 7 * side);
      ctx.font = `600 ${Math.round(Math.max(10, Math.min(13, k * 2)))}px system-ui, sans-serif`;
      ctx.fillText(INDUSTRIES[ind].short, c.x, c.y);
      ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    }
    // The cars of a job being worked that aren't yet where they belong: an
    // amber dot on each.
    for (const j of openJobs()) if (j.taken) for (const l of jobStatus(j).lines) {
      if (l.met) continue;
      const v = state.vehicles[l.id], at = pointOn(v.seg, v.s), c = view.toScreen(at.x, at.y);
      ctx.fillStyle = PALETTE.accent; ctx.strokeStyle = PALETTE.bg; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(4, k * 0.7), 0, Math.PI * 2); ctx.stroke(); ctx.fill();
    }
    // Panned away from the loco: an arrow at the screen's edge points to
    // it, with how far it is.
    const lp = pointOn(playerLoco().seg, playerLoco().s), ls = view.toScreen(lp.x, lp.y);
    const edge = { top: MAP_INSET.top + 8, right: 24, bottom: 24, left: MAP_INSET.left + 8 };
    if (ls.x < 0 || ls.x > screenW || ls.y < 0 || ls.y > screenH) {
      const cx = screenW / 2, cy = screenH / 2, dx = ls.x - cx, dy = ls.y - cy;
      const t = Math.min((dx > 0 ? screenW - edge.right - cx : cx - edge.left) / Math.abs(dx || 1e-9),
                         (dy > 0 ? screenH - edge.bottom - cy : cy - edge.top) / Math.abs(dy || 1e-9));
      const ax = cx + dx * t, ay = cy + dy * t, ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy), size = 12;
      ctx.fillStyle = PALETTE.light;
      ctx.beginPath();
      ctx.moveTo(ax + ux * size, ay + uy * size);
      ctx.lineTo(ax - ux * size * 0.6 - uy * size * 0.7, ay - uy * size * 0.6 + ux * size * 0.7);
      ctx.lineTo(ax - ux * size * 0.6 + uy * size * 0.7, ay - uy * size * 0.6 - ux * size * 0.7);
      ctx.fill();
      ctx.font = "600 12px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(Math.hypot(lp.x - view.cx, lp.y - view.cy) / 10) * 10} m`, ax - ux * size * 2.6, ay - uy * size * 2.6);
      ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    }
  }

  // The Map (#53), to see where everything is; nothing on it can be worked.
  // Step 1 is the yard's own shape with the cars on it, step 2 every
  // stretch of track as a straight line, step 3 the lines out of Junín.
  // Steps 1 and 2 frame what play shows.
  const MAP_TITLES = ["", "Map · the yard", "Map · the yard as lines", "Map · the lines out of Junín"];
  function drawMap() {
    const step = camera.map, S = (x, y) => view.toScreen(x, y);
    const path = (pts, colour, width) => {
      ctx.strokeStyle = colour; ctx.lineWidth = width;
      ctx.beginPath();
      pts.forEach((p, i) => { const c = S(p.x, p.y); i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y); });
      ctx.stroke();
    };
    if (step < 3) {
      const pv = makePlayView(screenW, screenH);
      const corners = [[0, 0], [screenW, 0], [screenW, screenH], [0, screenH]].map(([x, y]) => pv.toWorld(x, y));
      ctx.fillStyle = PALETTE.mapFrameFill; ctx.strokeStyle = PALETTE.accent; ctx.lineWidth = 1.5;
      ctx.beginPath();
      corners.forEach((p, i) => { const c = S(p.x, p.y); i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y); });
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    for (const id in SEGMENTS) {
      const pts = step === 1 ? trackPoints(id, 0, segmentLength(id)) : [pointOn(id, 0), pointOn(id, segmentLength(id))];
      path(pts, RUNNING.has(id) ? PALETTE.mapRunning : PALETTE.trackFar, step === 3 ? 2.5 : 2);
    }
    if (step === 3) {
      // The station is where the lines start; the main runs to it from the
      // map's west end.
      const station = NETWORK_LINES[0].points[0], west = NODES[MAP_EDGES[0]];
      path([west, { x: station[0], y: station[1] }], PALETTE.mapRunning, 2.5);
      ctx.font = "600 12px system-ui, sans-serif"; ctx.textBaseline = "middle";
      for (const l of NETWORK_LINES) {
        ctx.setLineDash(l.closed ? [5, 5] : []);
        path(l.points.map(([x, y]) => ({ x, y })), l.closed ? PALETTE.mapClosed : PALETTE.trackFar, 2.5);
        ctx.setLineDash([]);
        const [ex, ey] = l.points[l.points.length - 1], c = S(ex, ey), right = c.x > screenW / 2, dx = right ? -7 : 7;
        ctx.fillStyle = PALETTE.light; ctx.beginPath(); ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = right ? "right" : "left";
        ctx.fillText(`${l.id}${l.closed ? " (closed)" : ""}`, c.x + dx, c.y - 8);
        ctx.fillStyle = PALETTE.north; ctx.fillText(l.to, c.x + dx, c.y + 8);
      }
      const j = S(station[0], station[1]);
      ctx.fillStyle = PALETTE.light; ctx.textAlign = "center";
      ctx.beginPath(); ctx.arc(j.x, j.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("Junín", j.x, j.y + 16);
    } else {
      ctx.lineCap = "butt";
      for (const id in state.vehicles) {
        const v = state.vehicles[id], type = vehicleType(v), e = vehicleEnds(v), car = state.cars[id];
        path([endPoint(e.head), endPoint(e.tail)], car && car.line ? LINE_PAINT : type.colour, type.loco ? 6 : 4);
      }
      ctx.lineCap = "round";
      if (step === 1) for (const id in YARD_TRACKS) {
        const at = trackPoint(id, TRACK_GEOM[id].fouling + 12), c = S(at.x, at.y);
        ctx.fillStyle = PALETTE.label; ctx.strokeStyle = PALETTE.trackFar; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = PALETTE.light; ctx.font = "600 10px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(YARD_TRACKS[id].number, c.x, c.y + 0.5);
      }
    }
    // The player's loco, ringed.
    const lp = pointOn(playerLoco().seg, playerLoco().s), lc = S(lp.x, lp.y);
    ctx.strokeStyle = PALETTE.light; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(lc.x, lc.y, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = PALETTE.north; ctx.font = "600 12px system-ui, sans-serif";
    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`${MAP_TITLES[step]} · ${step} of ${MAP_STEPS}`, 12, screenH - 14);
  }

  // The clock at the top: the time, then the day and the shift. Written
  // only when it changes.
  const clockTime = document.getElementById("clockTime"), clockShift = document.getElementById("clockShift");
  let clockMinute = null;
  function renderClock() {
    if (Math.floor(state.clock / 60) === clockMinute) return;
    clockMinute = Math.floor(state.clock / 60);
    const shift = shiftAt(state.clock);
    clockTime.textContent = clockText(state.clock);
    clockShift.textContent = `Day ${dayOf(state.clock)} · Shift ${clockText(shift.start).slice(0, 2)}–${clockText(shift.end).slice(0, 2)}`;
    placeSkipMenu();
  }


  // The dev overlay (#42), for troubleshooting: while `dev.on`, the yard's
  // ids and the figures play hides, drawn over the yard, and a panel of
  // STATE under the clock, folded to its header while `dev.folded`. A long
  // press on the version number turns it on or off (INPUT); it starts off
  // at every load. Display only: every figure is read from STATE or an
  // existing helper, and it never takes a tap but on its own panel.
  const dev = { on: false, folded: false };
  const devTime = at => `day ${dayOf(at)} ${clockText(at)}:${pad2(Math.floor(at % 60))}`;
  // Labels over the yard: at each coupling its gap past touching, its air's
  // charge and the shunter's work with the seconds left; each vehicle's id,
  // its train's and its speed when moving, and HB with its hand brake on;
  // each switch's id and the leg it is set for; each yard track's id; each
  // segment's id at its middle. Placed in that order, and a label that
  // would overlap a coupling ring or one already placed is left out, so
  // the yard thins itself out zoomed out. On the Map's yard steps, only
  // the switches and the tracks; none on the lines out of Junín.
  function drawDevLabels() {
    if (camera.map === 3) return;
    const k = view.k, h = DEV_LABEL_PX + 2, used = [];   // screen boxes taken
    const free = b => !used.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    ctx.font = `600 ${DEV_LABEL_PX}px ui-monospace, Menlo, Consolas, monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    // `text` at world point (x, y), `dy` CSS px below it, if it fits.
    const label = (text, x, y, colour, dy = 0) => {
      const c = view.toScreen(x, y), w = ctx.measureText(text).width, cy = c.y + dy;
      const b = { x0: c.x - w / 2 - 2, x1: c.x + w / 2 + 2, y0: cy - h / 2, y1: cy + h / 2 };
      if (b.x1 < 0 || b.x0 > screenW || b.y1 < 0 || b.y0 > screenH || !free(b)) return;
      used.push(b);
      ctx.strokeStyle = PALETTE.bg; ctx.lineWidth = 3; ctx.strokeText(text, c.x, cy);
      ctx.fillStyle = colour; ctx.fillText(text, c.x, cy);
    };
    const keep = (x, y, r) => { const c = view.toScreen(x, y); used.push({ x0: c.x - r, x1: c.x + r, y0: c.y - r, y1: c.y + r }); };
    const swR = camera.map ? 4 : Math.max(6, k * 1.6) * 1.2, discR = camera.map ? 9 : Math.max(8, Math.min(12, k * 2));
    for (const id in SWITCHES) keep(NODES[id].x, NODES[id].y, swR);          // the switch targets and track discs, kept clear
    for (const id in YARD_TRACKS) { const at = trackPoint(id, TRACK_GEOM[id].fouling + 12); keep(at.x, at.y, discR); }
    if (!camera.map) {
      const cs = couplings(), ring = Math.max(2.5, k * 0.5) * 2.4 + 2;
      for (const c of cs) keep(c.at.x, c.at.y, ring);   // the rings too
      for (const c of cs) {
        const air = state.air[c.key], w = state.work[c.key];
        const parts = [`${((c.hooked ? state.gaps[c.key] : c.gap) * 100).toFixed(1)} cm${c.hooked ? "" : " apart"}`];
        if (air !== undefined) parts.push(`air ${Math.round(air * 100)}%`);
        if (w) parts.push(`${w.kind === "hook" ? "hook up" : "uncouple"} ${Math.max(0, Math.ceil(w.done - state.clock))} s`);
        label(parts.join(" · "), c.at.x, c.at.y, PALETTE.air, -(ring + h / 2));
      }
      for (const id in state.vehicles) {
        const v = state.vehicles[id], p = pointOn(v.seg, v.s);
        label(`${id} · ${v.train}${v.speed ? ` · ${(Math.abs(v.speed) * 3.6).toFixed(1)} km/h` : ""}`, p.x, p.y, PALETTE.light);
        if (v.handBrake) label("HB", p.x, p.y, PALETTE.switchReversed, h);
      }
    }
    for (const id in SWITCHES) {
      const set = state.switches[id].set;
      label(`${id} → ${set}`, NODES[id].x, NODES[id].y, set === SWITCHES[id].normal ? PALETTE.switchNormal : PALETTE.switchReversed, swR + h / 2 + 1);
    }
    for (const id in YARD_TRACKS) {
      const at = trackPoint(id, TRACK_GEOM[id].fouling + 12);
      label(id, at.x, at.y, PALETTE.light, discR + h / 2 + 1);
    }
    if (!camera.map) for (const id in SEGMENTS) {
      const p = pointOn(id, segmentLength(id) / 2);
      label(id, p.x, p.y, PALETTE.north);
    }
    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  }

  // The panel: the clock raw and as day and time, day or night by the
  // night rule, the seed; who holds the main; the through trains, the
  // Retiro road trains and the arrivals held outside; the open jobs; the
  // industries and the pool;
  // stateProblems(), run every DEV_PROBLEMS_SECONDS as it checks the whole
  // yard. Written only when it changes.
  const devPanel = document.getElementById("devPanel"), devHead = document.getElementById("devHead");
  const devBody = document.getElementById("devBody");
  let devHeadText = "", devBodyHtml = "", devProblems = [], devCheckedAt = -Infinity;
  function renderDevPanel() {
    devPanel.classList.toggle("open", dev.on);
    if (!dev.on) return;
    devPanel.style.top = `${54 + 38 * ((jobChip.classList.contains("open") ? 1 : 0) + (mainChip.classList.contains("open") ? 1 : 0))}px`;
    const now = performance.now();
    if (now - devCheckedAt >= DEV_PROBLEMS_SECONDS * 1000) { devProblems = stateProblems(); devCheckedAt = now; }
    const head = `${dev.folded ? "▸" : "▾"} ${clockText(state.clock)}:${pad2(Math.floor(state.clock % 60))} · ${devProblems.length} problem${devProblems.length === 1 ? "" : "s"}`;
    if (head !== devHeadText) devHead.textContent = devHeadText = head;
    devPanel.classList.toggle("folded", dev.folded);
    if (dev.folded) return;
    const at = t => t === null || t === undefined ? "–" : devTime(t);
    const row = (key, text, warn = false) => `<div${warn ? ' class="warn"' : ""}><b>${key}</b> ${text}</div>`;
    let html = row("clock", `${state.clock.toFixed(1)} s · ${devTime(state.clock)} · ${byDay(state.clock) ? "by day" : "at night"} ` +
      `(day is ${clockText(DAYLIGHT_FROM)}–${clockText(DAYLIGHT_TO)}) · seed ${state.seed}`);
    html += row("main", state.main.held ? `held by you until ${at(state.main.until)}` : "clear", state.main.held && state.clock > state.main.until);
    for (const r of state.through) html += row("through", `${r.id} · ${r.status}${r.cause ? ` · ${r.cause}` : ""} · booked ${at(r.at)}, ` +
      `enters ${at(r.enters)}${r.late ? ` · late ${Math.round(r.late)} s` : ""}${r.vehicles.length ? ` · ${(r.speed * 3.6).toFixed(1)} km/h` : ""}`,
      r.status !== "offered" && r.status !== "running");
    if (!state.through.length) html += row("through", "none");
    for (const r of state.road) html += row("road", `${r.id} · ${r.kind} · ${r.status}${r.why ? ` · ${r.why}` : ""} · booked ${at(r.at)} · ` +
      `${r.route} leg ${r.leg}${r.locks.length ? ` · locked ${r.locks.join(" ")}` : ""}${r.vehicles.length ? ` · ${(r.speed * 3.6).toFixed(1)} km/h` : ""}`,
      r.status === "refused" || r.blocked);
    for (const r of state.held) html += row("held", `${r.tt} · due ${at(r.at)}, outside`, true);
    for (const j of openJobs()) html += row(j.id, `${j.short || j.title} · ${j.taken ? `taken · moves ${jobMoves(j)} of par ${+jobPar(j).toFixed(1)}` : "not taken"}` +
      ` · due ${at(j.due)}`, j.due <= state.clock);
    if (!openJobs().length) html += row("jobs", "none open");
    for (const id in state.industries) {
      const i = state.industries[id];
      html += row(id, `set-out ${i.setOut || "–"} · ready ${at(i.readyAt)} · pull ${i.pull || "–"}`);
    }
    html += row("pool", `${Object.keys(state.pool).length} cars · joined ${state.poolCount.joined}, left ${state.poolCount.left} since ${at(state.poolSince)}`);
    html += row("problems", devProblems.length ? devProblems.join("; ") : "none", devProblems.length > 0);
    if (html !== devBodyHtml) devBody.innerHTML = devBodyHtml = html;
  }
