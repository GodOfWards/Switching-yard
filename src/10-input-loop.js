  // ==================================================
  // INPUT / LOOP
  // ==================================================
  // Pause holds the simulation step and every player action; zoom, follow
  // and pan still work, so the yard can be looked over while it is held.
  // A restored yard opens paused, so it waits for the player; retunable.
  let paused = restored;
  const togglePause = () => { paused = !paused; };
  const unlessPaused = fn => (...args) => { if (!paused) fn(...args); };
  // Leaving the page (another app, a call, a locked screen) pauses it, so
  // the game waits for the player to resume; retunable. It saves too: a
  // phone may drop the page while it is away.
  document.addEventListener("visibilitychange", () => { if (document.hidden) { paused = true; saveYard(true); } });
  window.addEventListener("pagehide", () => saveYard(true));

  // Keyboard: +/− zoom, M the Map, P pause, Q/A reverser, W/S or ↑/↓ throttle, R/F loco brake,
  // E/D train brake, Space emergency, X release.
  const KEYS = {
    q: () => moveReverser(1), a: () => moveReverser(-1),
    w: () => moveThrottle(1), ArrowUp: () => moveThrottle(1),
    s: () => moveThrottle(-1), ArrowDown: () => moveThrottle(-1),
    r: () => moveLocoBrake(1), f: () => moveLocoBrake(-1),
    e: () => moveTrainBrake(1), d: () => moveTrainBrake(-1),
    " ": emergency, x: release,
  };
  window.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (VIEW_KEYS[e.key]) VIEW_KEYS[e.key]();
    else if (KEYS[e.key]) unlessPaused(KEYS[e.key])();
    else return;
    e.preventDefault();
  });

  // pointerdown rather than click: it answers at once on touch screens.
  const onPress = (id, fn) => document.getElementById(id).addEventListener("pointerdown", e => {
    e.preventDefault(); unlessPaused(fn)();
  });
  onPress("revUp", () => moveReverser(1));
  onPress("revDown", () => moveReverser(-1));
  onPress("thrUp", () => moveThrottle(1));
  onPress("thrDown", () => moveThrottle(-1));
  onPress("lbUp", () => moveLocoBrake(1));
  onPress("lbDown", () => moveLocoBrake(-1));
  onPress("tbUp", () => moveTrainBrake(1));
  onPress("tbDown", () => moveTrainBrake(-1));
  onPress("releaseBtn", release);
  onPress("emergBtn", emergency);

  // Zoom steps through ZOOM_LEVELS, then out past the widest into the
  // Map's steps; in from the Map's first step is play again.
  function zoomBy(delta) {
    if (camera.map) setMap(camera.map - delta);
    else if (delta < 0 && camera.zoom === 0) setMap(1);
    else camera.zoom = clampNotch(camera.zoom + delta, 0, ZOOM_LEVELS.length - 1);
  }
  // Opening the Map closes the menus and the card: nothing on it is worked.
  function setMap(step) {
    camera.map = clampNotch(step, 0, MAP_STEPS);
    if (camera.map) { menuFor = null; cardFor = null; askFor = null; }
  }
  const onViewPress = (id, fn) => document.getElementById(id).addEventListener("pointerdown", e => {
    e.preventDefault(); fn();
  });
  onViewPress("zoomIn", () => zoomBy(1));
  onViewPress("zoomOut", () => zoomBy(-1));
  onViewPress("followBtn", () => { camera.map = 0; camera.follow = true; });
  onViewPress("mapBtn", () => setMap(camera.map ? 0 : 1));
  onViewPress("pauseBtn", togglePause);
  // New yard asks first: the yard as it stands can't be had back. A click,
  // not a press, so the question doesn't open under a finger still down.
  document.getElementById("newYardBtn").addEventListener("click", () => {
    if (confirm("Start a new yard? The yard as it stands will be lost.")) { newYard(); menuFor = null; cardFor = null; sheet = null; closeSkipMenu(); }
  });
  const VIEW_KEYS = { "+": () => zoomBy(1), "=": () => zoomBy(1), "-": () => zoomBy(-1), p: togglePause,
                      m: () => setMap(camera.map ? 0 : 1) };

  // A press on the yard that moves more than DRAG_START_PX pans it; one that
  // doesn't is a tap, acted on when it lifts.
  let press = null;
  canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture(e.pointerId);
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false, cx: view.cx, cy: view.cy };
  });
  canvas.addEventListener("pointermove", e => {
    if (!press || e.pointerId !== press.id) return;
    const dx = e.clientX - press.x, dy = e.clientY - press.y;
    if (!press.dragging && Math.hypot(dx, dy) < DRAG_START_PX) return;
    press.dragging = true;
    if (camera.map) return;   // the Map stays put
    camera.follow = false;
    // Screen motion back into world metres, undoing makeView's turn.
    camera.cx = press.cx - (view.turned ? -dy : dx) / view.k;
    camera.cy = press.cy - (view.turned ? dx : dy) / view.k;
  });
  canvas.addEventListener("pointercancel", () => { press = null; });
  canvas.addEventListener("pointerup", e => {
    if (!press || e.pointerId !== press.id) return;
    const tapped = !press.dragging;
    press = null;
    if (tapped) tap(e);
  });

  // On the Map, a tap on steps 1 and 2 goes back to play looking at that
  // spot, and on step 3 steps in to the yard.
  // In play, a tap acts on the nearest thing within TAP_RADIUS_PX on screen: a
  // switch (throws it, or, padlocked, opens the menu to ask for the main),
  // a coupling or buffers meeting (opens its menu) or a car's middle (opens its card). Any tap
  // closes an open menu or card. Opening a card only shows, so it works
  // while paused. A through train's couplings aren't the player's.
  function tap(e) {
    const r = canvas.getBoundingClientRect();
    const tx = e.clientX - r.left, ty = e.clientY - r.top;
    if (camera.map) {
      sheet = null;
      if (skipOpen) closeSkipMenu();
      if (camera.map === 3) setMap(1);
      else { const p = view.toWorld(tx, ty); Object.assign(camera, { map: 0, follow: false, cx: p.x, cy: p.y }); }
      return;
    }
    let best = null, bestD = TAP_RADIUS_PX, bestShows = false;
    const consider = (x, y, act, shows = false) => {
      const c = view.toScreen(x, y), d = Math.hypot(c.x - tx, c.y - ty);
      if (d < bestD) { best = act; bestD = d; bestShows = shows; }
    };
    for (const id in SWITCHES)
      consider(NODES[id].x, NODES[id].y, () => MAIN_SWITCHES.includes(id) && !state.main.held ? (askFor = id) : throwSwitch(id));
    for (const c of couplings()) if (!state.vehicles[c.vehicle].run) consider(c.at.x, c.at.y, () => { menuFor = c.key; });
    for (const id in state.vehicles) {
      const v = state.vehicles[id];
      if (!v.controls) { const p = pointOn(v.seg, v.s); consider(p.x, p.y, () => { cardFor = id; }, true); }
    }
    menuFor = null; cardFor = null; sheet = null; askFor = null;
    if (skipOpen) closeSkipMenu();
    if (best) (bestShows ? best : unlessPaused(best))();
  }

  // Asking for the main (#57): the menu over the padlocked switch `askFor`
  // tapped, a button per time the player may ask for, until a button or
  // another tap closes it.
  const mainMenu = document.getElementById("mainMenu");
  for (const m of MAIN_ASK_MINUTES) mainMenu.insertAdjacentHTML("beforeend", `<button data-min="${m}">${m} min</button>`);
  let askFor = null;
  function placeMainMenu() {
    if (askFor && state.main.held) askFor = null;
    mainMenu.classList.toggle("open", !!askFor);
    if (!askFor) return;
    const p = view.toScreen(NODES[askFor].x, NODES[askFor].y);
    mainMenu.style.left = `${Math.max(170, Math.min(screenW - 170, p.x))}px`;
    mainMenu.style.top = `${p.y}px`;
    mainMenu.style.transform = `translate(-50%, ${p.y < 120 ? "40%" : "-140%"})`;
  }
  mainMenu.addEventListener("pointerdown", e => {
    e.preventDefault(); e.stopPropagation();
    const b = e.target.closest("button");
    if (b) { unlessPaused(askForMain)(Number(b.dataset.min)); askFor = null; }
  });
  // The main-line chip: holding the main, until when and Report clear (a
  // train offered meanwhile calls the player off); otherwise the through
  // train offered, held or passing.
  const mainChip = document.getElementById("mainChip");
  let mainChipHtml = "";
  function renderMainChip() {
    const r = state.through[0], tt = r && throughEntry(r.tt);
    let html = "", warn = false;
    if (state.main.held) {
      warn = !!r || state.clock > state.main.until;
      html = (r ? (r.status === "refused" ? `${tt.number} held at ${waitsAt(tt)}` : `Clear the main for ${tt.number}`) : `Main yours until ${clockText(state.main.until)}${state.clock > state.main.until ? " · over time" : ""}`)
        + " · <em>Report clear</em>";
    } else if (r) {
      html = `${throughName(tt)} · ${r.status === "offered" ? `due ${clockText(r.enters)}` : r.status === "refused" ? `held at ${waitsAt(tt)}`
        : r.status === "held" ? "held for the main" : "passing"}`;
    }
    if (html !== mainChipHtml) mainChip.innerHTML = mainChipHtml = html;
    mainChip.classList.toggle("open", !!html);
    mainChip.classList.toggle("warn", warn);
    mainChip.style.top = jobChip.classList.contains("open") ? "92px" : "54px";
  }
  mainChip.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (state.main.held) unlessPaused(reportClear)();
  });

  // The coupling menu, open over the coupling `menuFor` (its pair key) until
  // a button or another tap closes it, or the coupling is gone.
  const couplingMenu = document.getElementById("couplingMenu");
  const airBtn = document.getElementById("airBtn"), hookBtn = document.getElementById("hookBtn");
  const uncoupleBtn = document.getElementById("uncoupleBtn");
  let menuFor = null;
  const menuCoupling = () => menuFor && couplings().find(c => c.key === menuFor);
  function placeCouplingMenu() {
    const c = menuCoupling();
    if (!c) menuFor = null;
    couplingMenu.classList.toggle("open", !!c);
    if (!c) return;
    const p = view.toScreen(c.at.x, c.at.y);
    // Above the coupling, or below it near the top; clear of the zoom buttons.
    couplingMenu.style.left = `${Math.max(150, Math.min(screenW - 96, p.x))}px`;
    couplingMenu.style.top = `${p.y}px`;
    couplingMenu.style.transform = `translate(-50%, ${p.y < 80 ? "40%" : "-140%"})`;
    // Buffers meeting: Hook up. A coupling: its air, and Uncouple. Work
    // under way shows on its button, which then does nothing.
    const w = state.work[c.key];
    hookBtn.style.display = c.hooked ? "none" : "";
    airBtn.style.display = uncoupleBtn.style.display = c.hooked ? "" : "none";
    hookBtn.textContent = w ? "Hooking up…" : "Hook up";
    uncoupleBtn.textContent = w ? "Uncoupling…" : "Uncouple";
    airBtn.textContent = menuFor in state.air ? "Part air" : "Connect air";
  }
  const onMenuPress = (id, fn) => document.getElementById(id).addEventListener("pointerdown", e => {
    e.preventDefault(); e.stopPropagation();
    const c = menuCoupling();
    if (c && !(id !== "airBtn" && state.work[c.key])) unlessPaused(fn)(c);
    menuFor = null;
  });
  onMenuPress("hookBtn", c => hookUp(c.key));
  onMenuPress("airBtn", c => toggleAir(c.vehicle));
  onMenuPress("uncoupleBtn", c => uncouple(c.vehicle));

  // The car card, open over the car `cardFor` (its id) until another tap
  // closes it: FA (or the line's initials, on a car not yet repainted) and
  // the number, its kind and load, the type code, and its tare and load
  // limit as stencilled, with its hand brake.
  const carCard = document.getElementById("carCard");
  const carText = document.getElementById("carText");
  const handBrakeBtn = document.getElementById("handBrakeBtn");
  let cardFor = null;
  function placeCarCard() {
    const v = cardFor && state.vehicles[cardFor], car = v && state.cars[cardFor];
    if (!car) cardFor = null;
    carCard.classList.toggle("open", !!car);
    if (!car) return;
    const type = vehicleType(v), at = pointOn(v.seg, v.s), p = view.toScreen(at.x, at.y);
    // FA's stencils (NEFA 771): T the tare and C the load limit, in kg.
    const kg = (t, digits) => String(t * 1000).padStart(digits, "0");
    // Then its traffic: the waybill, where it goes next, why it's bad
    // order, and the last of its history.
    const c = state.cars[cardFor], block = dispositionOf(cardFor);
    const next = !block ? "stays where it is" : dispositionMet(cardFor) ? `${BLOCKS[block].name}, in place` : `to ${tracksText(block)}`;
    carText.innerHTML = `<b>${car.line || "FA"} ${car.number}</b>${type.name} · ${loadedNow(cardFor) ? `loaded${c.flow ? `, ${FLOWS[c.flow].load}` : ""}` : "empty"}` +
      `<small>${car.line ? "" : `${type.code} ${FA_OPERATING_CODE} · `}T ${kg(type.tare, 5)} K · C ${kg(type.carga, 6)} K</small>` +
      `<small class="traffic">${c.waybill ? `Waybill: ${DESTINATIONS[c.waybill].name}` : "No waybill"} · ${next}</small>` +
      (c.badOrder ? `<small class="warn">Bad order: ${c.badOrder}</small>` : "") +
      `<div class="history">${c.history.slice(-3).reverse().map(e => `${dayClock(e.at)} · ${e.text}`).join("<br>")}</div>`;
    handBrakeBtn.textContent = v.handBrake ? "Release hand brake" : "Set hand brake";
    handBrakeBtn.classList.toggle("on", v.handBrake);
    // Beside the car, kept on screen and clear of the zoom buttons.
    const w = carCard.offsetWidth, h = carCard.offsetHeight;
    carCard.style.left = `${Math.max(52, Math.min(screenW - w - 8, p.x - w / 2))}px`;
    carCard.style.top = `${p.y - h - 24 < 8 ? p.y + 24 : p.y - h - 24}px`;
  }
  handBrakeBtn.addEventListener("pointerdown", e => {
    e.preventDefault(); e.stopPropagation();
    if (cardFor) unlessPaused(toggleHandBrake)(cardFor);
  });

  // Skip: a menu of the events ahead and the next SKIP_MARK_SECONDS marks,
  // open until an item, Skip again or a tap on the yard closes it. "…"
  // lists SKIP_MARKS_SHOWN more marks. It is redrawn as the clock moves on.
  const skipBtn = document.getElementById("skipBtn"), skipMenu = document.getElementById("skipMenu");
  let skipOpen = false, marksShown = SKIP_MARKS_SHOWN;
  function placeSkipMenu() {
    skipMenu.classList.toggle("open", skipOpen);
    skipBtn.classList.toggle("on", skipOpen);
    if (!skipOpen) return;
    const day = dayOf(state.clock), dayNote = at => dayOf(at) === day ? "" : ` <small>Day ${dayOf(at)}</small>`;
    let html = "<h3>Skip to next</h3>";
    // A job not taken that a skip passes the due time of goes to another
    // crew: the menu says so before the skip, beside the event and the marks.
    for (const e of eventsAhead()) {
      if (e.kind === "offer") {
        const tt = throughEntry(e.through);
        html += `<button class="event" data-at="${e.at}"><b>${clockText(e.at)}</b><span>${throughName(tt)} offered` +
          `<small>Through to ${tt.to}, due ${clockText(e.at + OFFER_LEAD_SECONDS)}${state.main.held ? "; clear the main" : ""}` +
          `${tt.passenger && !byDay(e.at) ? `<br>At night: if the main isn’t clear, it waits at ${waitsAt(tt)}` : ""}</small></span>${dayNote(e.at)}</button>`;
        continue;
      }
      const j = e.job && jobById(e.job), crew = j && !j.taken ? `<small class="warn">Not taken: another crew does it</small>` : "";
      const tt = e.tt && timetableEntry(e.tt);
      const text = tt ? (tt.arrives ? `${trainName(tt)} arrives<small>Onto Track ${YARD_TRACKS[ARRIVAL_TRACK].number}</small>`
          : `${trainName(tt)} leaves${j ? (j.taken ? "<small>It waits for your build</small>" : crew) : ""}`)
        : j ? `${j.title} falls due${crew}` : e.industry ? `Work done at ${INDUSTRIES[e.industry].name}<small>A pull job opens</small>`
        : `Shift change<small>The next jobs open</small>`;
      html += `<button class="event" data-at="${e.at}"><b>${clockText(e.at)}</b><span>${text}</span>${dayNote(e.at)}</button>`;
    }
    const handed = openJobs().filter(j => !j.taken);
    html += `<h3>Skip to time</h3><div class="marks">`;
    let last = 0;
    for (let i = 0, at = nextMark(); i < marksShown; i++, at += SKIP_MARK_SECONDS) {
      const warn = handed.some(j => j.due <= at);
      html += `<button data-at="${at}"${warn ? ' class="warn"' : ""}>${clockText(at)}</button>`;
      last = at;
    }
    html += `<button data-more="1" aria-label="More times">…</button></div>`;
    const passed = handed.filter(j => j.due <= last);
    if (passed.length) html += `<p class="note">From ${clockText(passed[0].due)}, another crew does: ${passed.map(j => j.title).join("; ")}</p>`;
    skipMenu.innerHTML = html;
  }
  function closeSkipMenu() { skipOpen = false; placeSkipMenu(); }
  skipBtn.addEventListener("pointerdown", e => {
    e.preventDefault();
    unlessPaused(() => {
      skipOpen = !skipOpen; marksShown = SKIP_MARKS_SHOWN; menuFor = null; cardFor = null; sheet = null;
      placeSkipMenu();
    })();
  });
  skipMenu.addEventListener("pointerdown", e => {
    const b = e.target.closest("button");
    if (!b) return;
    e.preventDefault();
    if (b.dataset.more) { marksShown += SKIP_MARKS_SHOWN; placeSkipMenu(); return; }
    unlessPaused(skipTo)(Number(b.dataset.at));
    closeSkipMenu();
  });

  // Jobs: the chip under the clock for the job being worked, which opens
  // its sheet; the Jobs button, which opens the board; and the sheet, which
  // shows the board or one job's sheet. A tap on a car's line shows that
  // car. The sheet is rewritten only when what it shows changes, and opens
  // only to look: taking, handing back and reporting done are actions.
  const jobChip = document.getElementById("jobChip"), jobsBtn = document.getElementById("jobsBtn");
  const sheetEl = document.getElementById("sheet");
  let sheet = null, sheetHtml = "", chipHtml = "";   // sheet: null, {} for the board, { job: id }, or { job: id, consist: true }
  const shortTime = at => `${clockText(at)}${dayOf(at) === dayOf(state.clock) ? "" : `, day ${dayOf(at)}`}`;
  const dayClock = at => `Day ${dayOf(at)} ${clockText(at)}`;
  function tracksText(block) {
    const n = blockTracks(block).map(t => YARD_TRACKS[t].number);
    return `Track ${n.join(" or ")}`;
  }
  // Where a vehicle stands, for the player.
  function placeName(v) {
    const t = trackAt(v);
    if (!t) return PLACE_OF[v.seg] || "the ladder";
    return YARD_TRACKS[t].name + (clearOn(v, t) ? "" : ", fouling the ladder");
  }
  function renderJobs() {
    const open = openJobs(), taken = open.filter(j => j.taken), fresh = open.filter(j => !j.taken), worked = taken[0];
    let chip = "";
    if (worked) {
      const st = jobStatus(worked);
      chip = `${worked.short} · <em>${st.met} of ${st.lines.length}</em> done${worked.due <= state.clock ? " · late" : ""}`;
    }
    if (chip !== chipHtml) jobChip.innerHTML = chipHtml = chip;
    jobChip.classList.toggle("open", !!worked);
    const label = taken.length ? `Jobs · ${taken.length} taken` : fresh.length ? `Jobs · ${fresh.length} new` : "Jobs";
    if (jobsBtn.textContent !== label) jobsBtn.textContent = label;
    jobsBtn.classList.toggle("on", !!open.length);
    if (sheet && sheet.job && !jobById(sheet.job)) sheet = {};
    if (sheet) {
      const html = sheet.register ? registerHtml() : sheet.consist ? consistHtml(jobById(sheet.job)) : sheet.job ? jobSheetHtml(jobById(sheet.job)) : boardHtml();
      if (html !== sheetHtml) sheetEl.innerHTML = sheetHtml = html;
    }
    sheetEl.classList.toggle("open", !!sheet);
  }
  // A finished job in a line; a build's train, gone or still to go.
  const trainText = j => j.kind !== "build" ? "" : j.departed
    ? ` · left ${shortTime(j.departed.at)}${j.departed.late >= ON_TIME_SECONDS ? `, ${lateText(j.departed.late)} late` : ""}` : ` · leaves ${shortTime(j.due)}`;
  // Timeliness sits beside the outcome, never in it (#62).
  const lateness = late => late >= ON_TIME_SECONDS ? `${lateText(late)} late` : "on time";
  const headline = r => `${r.outcome} · ${lateness(r.late)}`;
  const outcomeText = j => (j.result.by === "crew" ? `Done by another crew at ${shortTime(j.result.at)}`
    : `${headline(j.result)} · ${shortTime(j.result.at)}`) + trainText(j);
  const dueText = j => j.kind === "build" ? `leaves ${shortTime(j.due)}` : `due ${shortTime(j.due)}`;
  function boardHtml() {
    let h = `<div class="grab"></div><header><h2>Jobs · ${YARD_NAME}</h2><button data-act="register">Register</button>` +
      `<button data-act="close">Close ✕&#xFE0E;</button></header>`;
    for (const j of openJobs()) {
      const late = j.due <= state.clock ? ` · <span class="warn">late</span>` : "";
      h += `<div class="job" data-job="${j.id}"><div><b>${j.title}</b><small>${j.cars.length} cars · ${dueText(j)}` +
        `${j.taken ? " · taken" : ""}${late}</small></div>` + (j.taken
          ? `<button class="act primary" data-act="open" data-job="${j.id}">Open</button>`
          : `<button class="act" data-act="take" data-job="${j.id}">Take</button>`) + `</div>`;
    }
    // Road trains ahead: the next arrival and the next departure.
    const ahead = runsBetween(state.timetableAt, state.clock + DAY).map(r => ({ ...r, tt: timetableEntry(r.tt) }));
    for (const r of [ahead.find(r => r.tt.arrives), ahead.find(r => !r.tt.arrives)]) {
      if (!r || state.jobs.some(j => j.run === r.id)) continue;
      h += `<div class="job later"><div><b>${r.tt.arrives ? "Break up" : "Build"} ${trainName(r.tt)}</b>` +
        `<small>${r.tt.arrives ? `arrives ${shortTime(r.at)}` : `leaves ${shortTime(r.at)}; opens with the train before it`}</small></div></div>`;
    }
    for (const r of state.held) h += `<div class="job later"><div><b>${trainName(timetableEntry(r.tt))} held outside</b>` +
      `<small class="warn">Due ${shortTime(r.at)}; Track ${YARD_TRACKS[ARRIVAL_TRACK].number} must be clear</small></div></div>`;
    const done = state.jobs.filter(j => j.result).reverse();
    if (done.length) h += `<h3><span>Finished</span><span></span></h3>`;
    for (const j of done) h += `<div class="job" data-job="${j.id}"><div><b>${j.title}</b><small>${outcomeText(j)}</small></div></div>`;
    return h;
  }
  function jobSheetHtml(j) {
    const st = jobStatus(j), shift = shiftAt(j.opens), tt = j.run && timetableEntry(j.run.split(".")[0]);
    let h = `<div class="grab"></div><header><button data-act="board" aria-label="All jobs">‹</button><h2>${j.title}</h2>` +
      `<button data-act="close" aria-label="Close">✕&#xFE0E;</button></header>` +
      `<div class="meta"><span>Place</span><span>${YARD_NAME}</span><span>Loco</span><span>${vehicleType(playerLoco()).name}</span>` +
      `<span>Shift</span><span>${clockText(shift.start).slice(0, 2)}–${clockText(shift.end).slice(0, 2)}, day ${dayOf(j.opens)}</span>` +
      `<span>${j.kind === "build" ? "Leaves" : "Due"}</span><span>${shortTime(j.due)}</span></div>`;
    const remarks = [];
    if (j.kind === "breakup") remarks.push(`Train ${tt.number} from ${tt.from}, on Track ${YARD_TRACKS[ARRIVAL_TRACK].number}` +
      (j.arrivedLate >= ON_TIME_SECONDS ? `, held outside ${lateText(j.arrivedLate)}` : ""));
    if (j.kind === "build") remarks.push(`Train ${tt.number} to ${tt.to}, built on ${tracksText(j.block)} as one coupled cut, ` +
      `left by the loco, nothing else coupled in, the air joined through and every hand brake off`);
    if (j.kind === "setout") remarks.push(INDUSTRIES[j.industry].workTime === null
      ? `Empties to ${INDUSTRIES[j.industry].name} on ${tracksText(YARD_TRACKS[INDUSTRIES[j.industry].track].block)}, on any of its ` +
        `${INDUSTRY_SPOTS} spots from the buffer; loaded by the next shift change after the set-out`
      : `Cars to ${INDUSTRIES[j.industry].name} on ${tracksText(YARD_TRACKS[INDUSTRIES[j.industry].track].block)}, each at its ` +
        `consignee's ${INDUSTRIES[j.industry].spot}, numbered from the buffer; worked ${INDUSTRIES[j.industry].workTime / HOUR} h after the set-out`);
    if (j.kind === "pull") remarks.push(`Cars worked at ${INDUSTRIES[j.industry].name}, to their blocks`);
    for (const b of Object.keys(BLOCKS)) if (BLOCKS[b].ordering === "block" && st.lines.some(l => l.block === b))
      remarks.push(`${BLOCKS[b].name} block in order from the ladder end: ${BLOCKS[b].groups.map(g => DESTINATIONS[g].name).join(", ")}`);
    if (remarks.length) h += `<p class="remarks"><span>Remarks:</span> ${remarks.join("; ")}.</p>`;
    if (j.result) h += resultHtml(j);
    else if (j.taken) h += `<div class="buttons"><button class="act" data-act="handback" data-job="${j.id}">Hand back</button>` +
      `<button class="act primary" data-act="done" data-job="${j.id}">Report done</button></div>`;
    else h += `<div class="buttons"><button class="act primary" data-act="take" data-job="${j.id}">Take</button></div>`;
    if (j.kind === "build") h += `<div class="buttons"><button class="act" data-act="consist" data-job="${j.id}">Consist</button></div>`;
    for (const b of Object.keys(BLOCKS)) {
      const lines = st.lines.filter(l => l.block === b);
      if (!lines.length) continue;
      h += `<h3><span>${BLOCKS[b].name} block · ${tracksText(b)}</span><span>${lines.filter(l => l.met).length} of ${lines.length}</span></h3>`;
      for (const l of lines) h += lineHtml(l);
      if (BLOCKS[b].ordering === "block") h += checkHtml(blockInOrder(b), "In block order",
        `${BLOCKS[b].groups.map(g => DESTINATIONS[g].name).join(", ")}, from the ladder end`);
      if (j.kind === "build" && b === j.block) {
        h += checkHtml(st.cut.one, "One coupled cut", "Coupled together, the loco cut off");
        h += checkHtml(st.cut.clean, "Nothing else in the cut", "No car that isn't for this train");
        h += checkHtml(st.cut.air, "Air through the train", "Hoses joined between every two cars");
        const braked = lines.filter(l => !l.away && state.vehicles[l.id].handBrake).map(l => carName(l.id));
        h += checkHtml(st.cut.brakes, "Hand brakes off", braked.length ? `Still on: ${braked.join(", ")}` : "Released on every car");
      }
    }
    const gone = st.lines.filter(l => l.away);
    if (gone.length) {
      h += `<h3><span>Gone</span><span>${gone.length}</span></h3>`;
      for (const l of gone) h += lineHtml(l);
    }
    return h;
  }
  // A line that ticks when `ok`: a check on the formation, not on a car.
  const checkHtml = (ok, title, note) => `<div class="line order${ok ? " met" : ""}"><div class="tick">${ok ? "✓" : ""}</div>` +
    `<div><b>${title}</b><small>${note}</small></div></div>`;
  function lineHtml(l) {
    const id = l.id, c = state.cars[id], v = state.vehicles[id];
    const sp = c.spot && l.block !== "repair" && INDUSTRIES[c.spot.industry];
    const to = l.away ? "Away" : l.block === "repair" ? tracksText(l.block)
      : sp ? `${tracksText(l.block)} · ${sp.spot === "spot" && !c.spot.n ? "any spot" : `${sp.spot} ${c.spot.n}`}`
      : `${tracksText(l.block)} · ${DESTINATIONS[c.waybill].name}`;
    const where = l.away ? `left ${shortTime(c.away)}` : inPlayerTrain(v) ? "in your train" : `on ${placeName(v)}`;
    return `<div class="line${l.met ? " met" : ""}"${l.away ? "" : ` data-car="${id}"`}><div class="tick">${l.met ? "✓" : ""}</div>` +
      `<div><b>${carName(id)}</b><small>${VEHICLE_TYPES[c.type].name} · ${c.loaded ? "loaded" : "empty"}</small>` +
      `${c.badOrder ? `<small class="warn">Bad order: ${c.badOrder}</small>` : ""}</div>` +
      `<div class="where"><span>${to}</span><small>${where}</small></div></div>`;
  }
  function resultHtml(j) {
    const r = j.result, train = j.kind === "build" ? `<small>${j.departed ? `Left ${shortTime(j.departed.at)} with ${j.departed.cars} car${j.departed.cars === 1 ? "" : "s"}` +
      (j.departed.late >= ON_TIME_SECONDS ? `, <span class="warn">${lateText(j.departed.late)} late</span>` : "") : `Leaves ${shortTime(j.due)}`}</small>` : "";
    if (r.by === "crew") return `<div class="result"><b>Done by another crew</b><small>At ${shortTime(r.at)}</small>${train}` +
      `${r.left.length ? `<small class="warn">Left where they stood, the track blocked or full: ${r.left.map(carName).join(", ")}</small>` : ""}</div>`;
    const rows = [
      `${r.met} of ${r.total} cars where they belong${r.inOrder === null || r.met < r.total ? "" : r.inOrder ? ", in block order" : ", out of block order"}`,
      r.cut && !(r.cut.one && r.cut.clean) ? `<span class="warn">${!r.cut.one ? "Not one coupled cut" : "Another car in the cut"}</span>` : "",
      r.cut && r.cut.air === false ? `<span class="warn">Air not joined through the train</span>` : "",
      r.cut && r.cut.brakes === false ? `<span class="warn">A hand brake still on</span>` : "",
      `${r.moves} move${r.moves === 1 ? "" : "s"} (changes of direction), par ${+r.par.toFixed(1)}`,
      `Reported at ${shortTime(r.at)}, due ${shortTime(j.due)}`].filter(Boolean);
    return `<div class="result"><b>${r.outcome} · ${r.late >= ON_TIME_SECONDS ? `<span class="warn">${lateness(r.late)}</span>` : lateness(r.late)}</b>${rows.map(t => `<small>${t}</small>`).join("")}${train}` +
      `${j.damaged.length ? `<small class="warn">Rough handling: ${j.damaged.map(carName).join(", ")} damaged, bad order</small>` : ""}` +
      `${j.trainsHeld.length ? `<small class="warn">Main line: ${j.trainsHeld.map(h => `${h.number} held ${lateText(h.delay)}`).join(", ")}</small>` : ""}` +
      `${j.overruns.length ? `<small class="warn">Main kept past the time asked: ${j.overruns.map(lateText).join(", ")}</small>` : ""}</div>`;
  }
  // Junín's train register (#62), reached from the board: the trains of
  // the last REGISTER_DAYS days by shift, newest first, each with its
  // booked and actual times, how late, and the yard's cause; each shift
  // with the minutes of delay the yard caused, freight and passenger apart.
  function registerHtml() {
    let h = `<div class="grab"></div><header><button data-act="board" aria-label="All jobs">‹</button>` +
      `<h2>Train register</h2><button data-act="close" aria-label="Close">✕&#xFE0E;</button></header>`;
    const lines = [...state.register].sort((a, b) => b.actual - a.actual);
    if (!lines.length) return h + `<p class="remarks">No train has run yet.</p>`;
    const verb = { arrival: "arrived", departure: "left", through: "passed" };
    const shifts = [];
    for (const l of lines) {
      const start = shiftAt(l.actual).start;
      if (!shifts.length || shifts[shifts.length - 1].start !== start) shifts.push({ start, lines: [] });
      shifts[shifts.length - 1].lines.push(l);
    }
    for (const sh of shifts) {
      const caused = p => sh.lines.filter(l => l.cause && l.passenger === p).reduce((t, l) => t + l.late, 0);
      const total = p => { const s = caused(p); return s >= ON_TIME_SECONDS ? lateText(s) : "0 min"; };
      h += `<h3><span>Shift ${clockText(sh.start).slice(0, 2)}–${clockText(sh.start + SHIFT_HOURS * HOUR).slice(0, 2)}, day ${dayOf(sh.start)}</span>` +
        `<span>${sh.lines.length} train${sh.lines.length === 1 ? "" : "s"}</span></h3>` +
        `<p class="remarks"><span>Delay caused by the yard:</span> freight ${total(false)}, passenger ${total(true)}.</p>`;
      for (const l of sh.lines) h += `<div class="line"><div><b>${l.name}</b>` +
        `<small>Booked ${clockText(l.booked)} · ${verb[l.kind]} ${clockText(l.actual)}</small>` +
        `${l.cause ? `<small class="warn">${l.cause}</small>` : ""}</div>` +
        `<div class="where"><span${l.late >= ON_TIME_SECONDS ? ` class="warn"` : ""}>${l.late >= ON_TIME_SECONDS ? `${lateText(l.late)} late` : "On time"}</span></div></div>`;
    }
    return h;
  }
  // The consist page of a build job: a line per car of its train, as it
  // stands on its track from the ladder end (cars elsewhere after), and the
  // train's totals. Weights are tare plus load, in whole tonnes (RITO art.
  // 211).
  function consistHtml(j) {
    const tt = timetableEntry(j.run.split(".")[0]), track = blockTracks(j.block)[0];
    const ids = j.cars.filter(id => state.cars[id].away === null ? dispositionOf(id) === j.block : j.departed && state.cars[id].away === j.departed.at);
    const d = id => { const v = state.vehicles[id]; const o = v && trackAt(v) === track ? trackOffset(track, v.seg, v.s) : null; return o === null ? Infinity : o; };
    ids.sort((a, b) => d(a) - d(b));
    const rows = ids.map(id => {
      const type = VEHICLE_TYPES[state.cars[id].type], load = state.cars[id].loaded ? type.carga : 0;
      return { id, type, load, gross: type.tare + load };
    });
    const sum = f => rows.reduce((t, r) => t + f(r), 0);
    let h = `<div class="grab"></div><header><button data-act="open" data-job="${j.id}" aria-label="Back to the job">‹</button>` +
      `<h2>Consist · ${tt.number} to ${tt.to}</h2><button data-act="close" aria-label="Close">✕&#xFE0E;</button></header>` +
      `<div class="totals"><span><b>${rows.length}</b>cars</span><span><b>${sum(r => r.type.axles)}</b>axles</span>` +
      `<span><b>${Math.round(sum(r => r.type.length))} m</b>long</span><span><b>${sum(r => r.type.tare)} t</b>tare</span>` +
      `<span><b>${sum(r => r.gross)} t</b>gross</span></div>` +
      `<p class="remarks"><span>From the ladder end;</span> cars not yet on ${tracksText(j.block)} last.</p>` +
      `<table class="consist"><thead><tr><th>Car</th><th>Tare</th><th>Load</th><th>Gross</th><th>m</th></tr></thead><tbody>`;
    for (const r of rows) h += `<tr><td><b>${carName(r.id)}</b><small>${r.type.name}</small></td><td>${r.type.tare}</td>` +
      `<td>${r.load}</td><td>${r.gross}</td><td>${r.type.length}</td></tr>`;
    return h + `</tbody></table>`;
  }
  sheetEl.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"), line = e.target.closest("[data-car]"), row = e.target.closest(".job[data-job]");
    if (b) {
      const act = b.dataset.act, id = b.dataset.job;
      if (act === "close") sheet = null;
      else if (act === "board") sheet = {};
      else if (act === "register") sheet = { register: true };
      else if (act === "open") sheet = { job: id };
      else if (act === "consist") sheet = { job: id, consist: true };
      else if (act === "take") unlessPaused(() => { if (takeJob(id)) sheet = { job: id }; })();
      else if (act === "handback") unlessPaused(handBack)(id);
      else if (act === "done") unlessPaused(() => {
        const st = jobStatus(jobById(id)), left = st.lines.length - st.met;
        if (!left || confirm(`Report done with ${left} car${left === 1 ? "" : "s"} still to place?`)) reportDone(id);
      })();
    } else if (line) {                    // show the car, with its card
      const v = state.vehicles[line.dataset.car], p = pointOn(v.seg, v.s);
      Object.assign(camera, { map: 0, follow: false, cx: p.x, cy: p.y, zoom: Math.max(camera.zoom, START_ZOOM) });
      sheet = null; cardFor = line.dataset.car; menuFor = null;
    } else if (row) sheet = { job: row.dataset.job };
  });
  jobsBtn.addEventListener("pointerdown", e => {
    e.preventDefault();
    sheet = sheet ? null : {}; menuFor = null; cardFor = null;
    if (skipOpen) closeSkipMenu();
  });
  jobChip.addEventListener("pointerdown", e => {
    e.preventDefault();
    const j = openJobs().find(j => j.taken);
    sheet = j ? { job: j.id } : null; menuFor = null; cardFor = null;
    if (skipOpen) closeSkipMenu();
  });

  // The dev overlay (#42): a long press of DEV_PRESS_SECONDS on the version
  // number turns it on or off; a tap on the panel's header folds it; Save
  // state downloads the yard as it stands, for a bug report. None of it is
  // an action, so all of it works while paused.
  let devPress = null;
  versionEl.addEventListener("pointerdown", e => {
    e.preventDefault();
    clearTimeout(devPress);
    devPress = setTimeout(() => { devPress = null; dev.on = !dev.on; dev.folded = false; }, DEV_PRESS_SECONDS * 1000);
  });
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) versionEl.addEventListener(type, () => { clearTimeout(devPress); devPress = null; });
  versionEl.addEventListener("contextmenu", e => e.preventDefault());   // a long press opens no menu
  devHead.addEventListener("pointerdown", e => { e.preventDefault(); dev.folded = !dev.folded; });
  document.getElementById("devSave").addEventListener("click", () => {
    const a = document.createElement("a"), t = Math.floor(state.clock);
    a.href = URL.createObjectURL(new Blob([saveFileText()], { type: "application/json" }));
    a.download = `switching-yard-v${GAME_CONFIG.VERSION}-day${dayOf(t)}-${clockText(t).replace(":", "")}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // The yard is saved every SAVE_SECONDS of play, counted in steps.
  let last = performance.now(), acc = 0, sinceSave = 0;
  function frame(now) {
    acc = paused ? 0 : acc + Math.min((now - last) / 1000, STEP_SECONDS * MAX_STEPS_PER_FRAME);
    last = now;
    while (acc >= STEP_SECONDS) { step(STEP_SECONDS); acc -= STEP_SECONDS; sinceSave += STEP_SECONDS; }
    if (sinceSave >= SAVE_SECONDS) { saveYard(); sinceSave = 0; }
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

