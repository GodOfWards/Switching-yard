# Decisions

Design calls Tom has made, newest first, with where they were made. The
values these produced live in CONFIG and WORLD DATA in `index.html`.

## 2026-10-08: Freight cars

- **Tapping a car opens its card**: line and number, kind, load, tare and
  load limit as stencilled, with its hand brake as a button. Replaces
  tapping a car to set its hand brake (#18).
- **Car marks: both kinds** (#54). Most cars carry FA's unified panel
  (monogram and type code, NEFA 555); a few not yet repainted keep their
  line's initials. See [fa-freight-cars.md](reference/fa-freight-cars.md).

## 2026-10-08: Jobs

Made in the "Jobs" design thread; the full rules are in #35, built in
three stages (#48, #49, #50).

- **A job is one operation**: the chain of tasks a piece of work needs
  (pull from an industry, set out, bring to the yard, build a consist,
  leave cars on a track, take a consist apart, sort the yard for the next
  shift). It can span the yard and the industries near it.
- **Cars live on across days**, each with a waybill naming its next
  destination, so a player can follow one car through its cycle. Traffic
  comes from a plan in WORLD DATA: industries' rates and a road-train
  timetable.
- **The player takes as many jobs as they like** from a job board. Work
  they don't take is done off-screen when due; other crews on the map are
  backlog (#46).
- **Time runs at real time**, with skips to the next event or to a
  10-minute mark, only when nothing the player could touch is moving.
- **A job sheet** states the end result, grouped by task, a line per car
  that ticks itself. Weights go on a consist page for trains being built.
- **Nothing fails**: jobs have due times, lateness is recorded and the
  train leaves late. The report scores time, rough handling and moves.
  Knock-on delays later (#47).
- **Stages**: 1. clock, board, sheet and "sort the yard" on the fan;
  2. bigger map (#44), road trains, consists; 3. industries and waybills.
- **How yards work** is researched from real FA practice (#45).
- **Stage 1 on the fan** (#48): tracks get destination blocks (1 Retiro,
  7 Mendoza, 2–3 local, 4 repair, 5–6 storage); a sort job puts named cars
  on their block tracks by a time, the Retiro block in order; three 8-hour
  shifts from 06:00; a history log per car; clock and Skip at the top, the
  sheet sliding up from the bottom.
- **The map grows by only what jobs need** (#44); mapping every active
  rail is the long-term aim (#52). Play happens zoomed in, following the
  loco, with zoomed out as an overview (#53).
- **Trains are capped shorter than real**, about 15–20 cars (≈ 250 m), so
  tracks shrink; retunable. The option kept: real train lengths (40 cars
  ≈ 600 m, unchecked) if the map grows enough.

## 2026-10-08: Saving

- **The whole yard is saved as it stands**, mid-move included, every 5 s
  of play and on leaving the page; no save button (#13).
- **New yard** (↺, under Pause) starts over, after asking.
- **A restored yard opens paused.** A save that no longer fits the yard
  is dropped for a fresh one.

## 2026-10-08: Slack

- **Each vehicle moves on its own**, joined by couplings with about 5 cm of
  free play and a stiff draft gear, so a loco starts a cut one car at a
  time and a cut runs in on the loco brake (#26). Replaces the one rigid
  train of Physics A–H.

## 2026-10-08: Physics update, first part

Made in the "Realistic physics update design" thread. These replace
Physics D, F and G below.

- **Real drag per car** from load and bearings (Davis equation), not the
  tight yard setting (#25).
- **Real curve drag** on the Junín curves (#16).
- **Air isn't connected on coupling.** The train brake works only on cars
  whose air runs back to the loco and has charged (#17).
- **Tapping a coupling opens a small menu**, Air and Uncouple (#17).
- **Hand brakes on every car**, set or released by tapping the car (#15).
- **Coupling needs a minimum closing speed**, or a shove hard enough. A
  gentle touch only pushes (#30).
- Next: slack (#26). Later: derailment (#14), hook-and-screw couplings
  (#33).

## 2026-10-08: Switch indicators and track look

- **Switches show their position after FA practice** (RGF art. 100): a
  green disc when set normal, a yellow triangle on black when reversed.
  The triangle points along the set leg.
- **The unset leg fades** for its first stretch past the switch.
- **Track is drawn as rails and ties when zoomed in**, and as a single line
  zoomed out, where rails would crowd. See
  [switch-indicators.md](reference/switch-indicators.md).

## 2026-10-08: Junín depot fan

- **The yard is the depot fan at Junín**, from OpenStreetMap: seven
  dead-end tracks and a turntable spur off one lead. Chosen over the east
  throat. See [junin-yard.md](reference/junin-yard.md).
- **The turntable doesn't turn** for now; its spur is a dead end (#21).
- **A north arrow** sits in a corner of the view.

## 2026-10-08: Controls (PR #4, v0.3.0)

- **Reverser** (Fwd / N / Rev, cab end first is forward) sets direction;
  the throttle runs 0–4.
- **Strict reverser rules**: it moves only when stopped with the throttle
  shut, the throttle won't open in N, and the loco starts in N.
- **An arrow on the loco** shows the set direction.
- **Control buttons** a bit smaller (44 px).
- **Zoom buttons at the top left**; zoomed in, the view follows the loco
  and a drag pans.

## 2026-10-08: Setting and loco

- **Setting is Argentina.** Locos, cars and naming stay within Argentine
  railways. Naming reference:
  [argentine-rolling-stock-naming.md](reference/argentine-rolling-stock-naming.md).
- **The loco models a GM G12 / GR12**, over the Class 08 and SW1500
  (PR #5, v0.2.1). See [locomotives.md](reference/locomotives.md).

## 2026-10-08: Physics (PR #3, v0.2.0)

- **A. Throttle** gives force over mass, not a target speed. Weight matters.
- **B. Hard hit** (above coupling speed) is a jolt and the vehicles bounce
  apart. No derailment.
- **C. Running through a switch** set against you pushes it over. No
  derailment.
- **D. Uncouple** by tapping the gap between two vehicles.
- **E. Brakes** are notched levers, plus Emergency and Release buttons.
- **F. A car cut loose** rolls free with no brakes. Hand brakes may come
  later.
- **G. Drag** uses the tight yard setting (a 10 km/h cut rolls ~60 m), not
  realistic drag (200–400 m). See [train-physics.md](reference/train-physics.md).
- **H. Train brake** builds up over a few seconds.
- Out of scope for now: slack between cars, gradients, wheel slip.

## Proposed, not yet merged

- **Curves and a bigger yard (PR #6).** Turnouts at 25° and tracks 12 m
  apart, against a real yard's ~7° and ~5 m, so it reads on a phone. All
  curves 50 m radius. A 50 m headshunt that fits the loco and two cars.

## Open questions

Pending work and open designs are GitHub Issues ([issues.md](issues.md)):
saving #13, derailment #14, hand brakes #15, curve drag #16, switching
without air #17, freight cars #18, phone playtest #19, Junín turntable #21,
yard choice #22, close switches #23. Not yet filed:

- Realistic drag once the yard is big enough?
