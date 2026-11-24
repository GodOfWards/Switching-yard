# The view

What the screen shows: play, and the Map. The build is #53; the mock-ups
and the Big-map lab are linked there.

## Rules

- **Play happens zoomed in, following the loco.** A drag pans away from
  it; ◎ follows it again. While the loco is off the screen, an arrow at
  the screen's edge points to it, with how far it is.
- **Play zoom is set in pixels per metre**, not as a share of the map, so
  play looks the same however big the map grows.
- **The Map is the overview**, separate from play zoom. A Map button opens
  it, and zooming out past play's widest level does too. The controls stay
  live while it is open. Nothing on it can be worked: no switches, no
  couplings, no cards.
- **The Map has three steps out:**
  1. **The yard**, drawn in its own shape and turned as play is, widened
     across the yard so its parallel tracks come apart. Lengths along the
     yard stay true. It shows the track numbers, the cars, the loco and
     what play shows.
  2. **The yard as lines**, north up: every stretch of track as a straight
     line, with the main line in full.
  3. **The lines out of Junín**, north up, to their next junction
     ([rail-network-junin.md](../reference/rail-network-junin.md)), with
     the yard at Junín. Closed lines are dashed.
- **A tap on the Map goes there.** On steps 1 and 2 play opens looking at
  the spot tapped, not following the loco. On step 3 a tap steps in to the
  yard.
- **The dev overlay is for troubleshooting** (#42). A long press of about a
  second on the version number turns it on, and again off; it starts off
  at every load, and ships in every release. It only shows: ids and the
  figures play hides drawn over the yard (couplings' gap, air and work,
  vehicles' and trains' ids and speed, hand brakes, switches and the leg
  each is set for, tracks and segments; only switches and tracks on the
  Map's yard steps), and a panel under the clock of the clock, the main,
  through trains, held arrivals, jobs against par, industries, the pool and
  `stateProblems()`, folded to one line by a tap on its header. Labels that
  would cover a coupling or each other are left out.
- **Save state** on the panel downloads the yard as it stands, a JSON file
  holding both parts of the save under their localStorage keys. To open
  it, write each key's value into localStorage on the game's page and
  reload, for example from the browser console:
  `for (const [k, v] of Object.entries(FILE)) localStorage.setItem(k, JSON.stringify(v))`,
  with `FILE` the file's contents. It loads only into a build with the
  same `SAVE_KEY` and WORLD DATA.

## Open

- Turning the view by hand, with two fingers: #96.
