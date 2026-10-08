# Decisions

Design calls Tom has made, newest first, with where they were made. The
values these produced live in CONFIG and WORLD DATA in `index.html`.

## 2026-10-08: Setting and loco

- **Setting is Argentina.** Locos, cars and naming stay within Argentine
  railways. Naming reference:
  [argentine-rolling-stock-naming.md](research/argentine-rolling-stock-naming.md).
- **The loco models a GM G12 / GR12**, over the Class 08 and SW1500
  (PR #5, v0.2.1). See [locomotives.md](research/locomotives.md).

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
  realistic drag (200–400 m). See [train-physics.md](research/train-physics.md).
- **H. Train brake** builds up over a few seconds.
- Out of scope for now: slack between cars, gradients, wheel slip.

## Proposed, not yet merged

- **Curves and a bigger yard (PR #6).** Turnouts at 25° and tracks 12 m
  apart, against a real yard's ~7° and ~5 m, so it reads on a phone. All
  curves 50 m radius. A 50 m headshunt that fits the loco and two cars.
- **Zoom, pan and follow-loco (PR #4).**

## Open questions

- Curve drag: add extra resistance on tight curves?
- Switching without air: should moves stop on the loco brake alone?
- Realistic drag once the yard is big enough?
- Saving.
- Recreating a real yard such as Junín (its own thread).
