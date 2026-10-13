# Changelog

Newest first. One entry per version bump.

## 0.14.1

**Changed**
- `render()` is split into one function per layer it draws (#91).
  Nothing is drawn differently.

## 0.14.0

**Fixed**
- The game no longer stutters every few seconds after many days of play.
  It now saves the cars only when something happened to them.

**Added**
- A benchmark page, `index.html?bench`, that times the game and checks the
  yard for problems.

**Changed**
- A yard saved by an earlier version starts fresh.

## 0.13.0

**Added**
- A grain elevator on Track E and a goods shed on Track G, two tracks of
  Junín's east throat now on the map. Both are invented: no rail-served
  industry at Junín was found.
- Set-out jobs take cars to the industries. At the elevator any of its
  6 spots will do. At the goods shed each car goes to its consignee's
  door, in exact order.
- The elevator loads its cars by the next shift change, and the shed's
  doors work their cars in 2 hours. Then a pull job brings them back to
  the yard.
- The Skip menu shows when an industry's work is done.

**Changed**
- Grain, merchandise, wine in casks and small lots at Junín go through
  the industries. Only fuel and materials are still loaded and unloaded
  at the shift change.
- A yard saved by an earlier version starts fresh.

## 0.12.0

**Added**
- A traffic plan: cars carry grain, wine, fuel, merchandise and small lots
  between Junín, Retiro, Mendoza, Vedia, O'Higgins and Membrillar, at set
  rates.
- Cars go on trips. A car that leaves is away for its station's round trip
  (8 to 16 days), is loaded or unloaded there, and comes back on a train
  from that side with its next waybill.
- About 370 cars in traffic. Cars from elsewhere on the San Martín join
  when the plan is short of cars and stay out when it has too many.
- The car card shows what a loaded car carries.

**Changed**
- Arrivals bring the cars due back, up to 12, so their size varies.
- A yard saved by an earlier version starts fresh.

## 0.11.1

**Changed**
- New colour palette: green-grey chrome, a sage accent, ochre for
  reversed switches and warnings.

## 0.11.0

**Added**
- The main line belongs to the station. The crossover is padlocked lying
  for the main: ask for the main for 10, 20 or 30 minutes, and report clear
  when you are off it. The station refuses if a train is due.
- Through freights: four a day between Retiro and Mendoza run through on
  the main, hauled by a G12. Each is offered 10 minutes ahead and held at
  the home signal if you hold the main.
- Results show trains held for the main, with their delay, and time kept
  on the main past what you asked for.
- A home signal at the east end, and padlock marks on the main's switches.

**Changed**
- A yard saved by an earlier version starts fresh.

## 0.10.0

**Added**
- Road trains: one arrival and one departure a shift, Retiro and Mendoza
  in turn (07:00, 12:30, 15:00, 20:30, 23:00, 04:30). Arrivals stand on
  Track 3 at the buffer end; departures leave from Track 1 (Retiro) or
  Track 2 (Mendoza).
- Break-up jobs: an arrival's cars to their block tracks, due at shift
  change.
- Build jobs: a departure's cars on its track as one coupled cut, nothing
  else in it, the Retiro block in order, due when the train leaves. A
  build taken and late holds the train, which leaves late.
- The consist page of a build: tare, load, gross and length per car, and
  the train's totals.
- An arrival waits outside while Track 3 is occupied, and comes in late.
- Cars travel: one that leaves comes back on a later arrival, empty if it
  left loaded, loaded if it left empty. Loads on the local track are
  unloaded, and empties on the empties track loaded, at shift change.
- 24 more freight cars, 40 in all.

**Changed**
- Track 3 is the arrival track; the local block is Track 4 only.
- The Skip menu lists arrivals and departures.
- A yard saved by an earlier version starts fresh.

## 0.9.1

**Added**
- The main line is track: single, running on off the map at both ends,
  joined to the head-shunt by Junín's real crossover. The player may use
  it; no trains run on it yet.

**Changed**
- The head-shunt follows its real line, bending in beside the main for
  its last 200 m. A yard saved by an earlier version starts fresh.

## 0.9.0

**Added**
- Jobs: a job opens at each shift change to sort the yard's cars onto
  their tracks (1 Retiro, 2 Mendoza, 3–4 local, 5 storage, 6 empties,
  7 repair), the Retiro block in order, due at the next shift change.
  Take it from the Jobs board and follow it on its sheet; a job not taken
  is done by another crew.
- Reporting a job done assesses it: cars placed, block order, moves
  against par, and on time or late.
- Each car has a waybill and a history on its card. A car hit harder than
  5 km/h is damaged and goes bad order, for the repair track.
- Track numbers, and a clearance mark where each yard track stands clear
  of the ladder.

**Changed**
- The cars start on the yard tracks. A yard saved by an earlier version
  starts fresh.

## 0.8.0

**Added**
- A clock: the time of day, the day and the shift sit at the top of the
  yard. It runs at real time from 06:00, day 1, and is saved with the
  yard.
- Skip: with everything standing still, jump to the next shift change or
  to a time on a 10-minute mark.

## 0.7.3

**Changed**
- The yard is now the east end of Junín: seven yard tracks ladder into
  one lead, with the depot fan, two short tracks and a head-shunt. The
  fan is laid again to follow the real track. The main line runs
  alongside but can't be used.
- Sixteen cars instead of eight.
- Play starts zoomed in, following the loco, and zoom reaches further for
  the bigger yard.

## 0.7.2

**Changed**
- Most cars carry FA's marks: FA, the type code and the number, with the
  tare and load limit stencilled in kilograms as FA did. A couple not yet
  repainted keep their old line's initials and brown paint.
- Cars are painted as FA painted them: grey box cars, hoppers and
  gondolas, a yellow container flat, a black tank car with a yellow band.

## 0.7.1

**Changed**
- The cars are FA freight cars: box cars, grain hoppers, a gondola, a flat
  and a tank car, each with its line's initials and FA number, loaded or
  empty. Loaded cars are heavier than before (71–80 t), empties lighter
  (19–21 t).
- Tapping a car opens its card: number, kind, load, tare and load limit,
  and a button for its hand brake.

## 0.7.0

**New**
- The yard is saved as you leave it and comes back on your next visit,
  paused, with every car where it stood.
- New yard (↺, under Pause) starts over with a fresh yard, after asking.

## 0.6.2

**Changed**
- Dark palette: the yard and controls sit on black, with cool grey track
  and chrome, one amber accent and red kept for Emergency.
- Buttons are 10% smaller; in landscape the controls stack in two columns
  so the yard gets more width.

## 0.6.1

**Fixed**
- After uncoupling while pushing, the loco no longer passes through the
  cars it left; it meets and pushes them.

## 0.6.0

**New**
- Slack between cars. Each coupling has a few centimetres of play, so the
  loco starts a cut one car at a time, and a cut runs in behind the loco
  when only the loco brakes.

**Changed**
- Train ends meet car to car, and the rest of the train feels it through
  the couplings.
- Coupling by shoving takes a firmer push than before: about notch 2
  against a hand-braked car.

## 0.5.0

**New**
- Air between cars. Coupling doesn't connect it: tap a coupling and pick
  Connect air. The train brake then reaches the car once the air has
  charged. Without air, a move stops on the loco brake.
- Hand brakes. Tap a car to set or release one.

**Changed**
- Cars roll real distances, by load and bearings: a loaded box car about
  255 m from 10 km/h, an empty one about 145 m.
- Curves slow cars, more on tighter ones.
- Tapping a coupling opens a menu (Air, Uncouple) instead of uncoupling at
  once.
- Coupling needs a closing speed of at least 1.5 km/h, or a firm shove. A
  gentle touch only pushes.

## 0.4.1

**Changed**
- Switches show their position the Argentine way: a green disc when set
  normal, a yellow triangle when reversed, pointing along the set track.
  The track a switch isn't set to fades out near the switch.
- Zoomed in, track is drawn as rails on ties.

## 0.4.0

**New**
- Pause. The ❚❚ button under the zoom buttons (P on a keyboard) holds
  the game; ▶ resumes it. While paused the controls, switches and
  couplings don't respond, but zoom, follow and dragging the yard still
  work. Leaving the page pauses it.

## 0.3.1

**Changed**
- The yard is now the locomotive depot fan at Junín, Buenos Aires, on the
  San Martín line, from OpenStreetMap. A 110 m approach leads to seven
  dead-end tracks (56 to 182 m) and a spur to the turntable, with seven
  switches. The turntable doesn't turn yet. Cars start on tracks 1, 3, 6
  and 7.

**New**
- A north arrow in the top right corner. The yard is turned to fit the
  screen, so north is rarely up.

## 0.3.0

**New**
- Reverser. It sets the loco's direction: Fwd (cab end first), N or Rev,
  one position a press (Q/A on a keyboard). It moves only with the
  throttle shut and the train stopped, and the throttle won't open with it
  in N. The loco starts in N. A yellow arrow at the loco's end shows which
  way it will move.
- Zoom. Buttons at the top left zoom in and out (+/− on a keyboard), up
  to 4×. Zoomed in, the view follows the loco; drag the yard to look
  around, and ◎ follows the loco again. Taps on switches and couplings
  now act when the finger lifts, so a drag never throws a switch.

**Changed**
- The throttle runs 0 to 4; direction comes from the reverser.
- Control buttons are smaller (44 px tall, was 56) to fit the reverser's
  column.

## 0.2.2

**New**
- Curved track. A segment can be a circular curve of a given radius;
  trains run along it and cars are drawn as chords across it.
- A bigger yard. A 50 m headshunt at the west end leads to a ladder of
  four sidings (157, 121, 86 and 50 m), a run-around loop north of the main
  and an industry spur curving south off the east end. Seven switches. Eight
  cars start spread over three sidings and the spur.
- Every curve is 50 m radius. Turnouts leave at 25° with tracks 12 m apart:
  wider than a real yard so it reads on a phone.

## 0.2.1

**Changed**
- The loco is now modelled on a GM G12, as run on Argentina's Sarmiento
  line: 109 t, 187 kN of pull and about 780 kW at the rail. It's heavier
  and stronger than before, and holds its full pull up to about 15 km/h.
  Yard speed stays capped at 29 km/h.

## 0.2.0

**New**
- Physics. Vehicles have weight. The loco's pull is shared across its
  notches and limited by its power at speed. Rolling resistance, tuned for
  a small yard, lets a car cut loose at 10 km/h roll about 60 m. A standing
  vehicle needs extra force to get moving.
- Rolling stock. Two cuts of box cars, loaded and empty, stand in the
  sidings. Running into a car at 5 km/h or less couples it. Anything faster
  is a hard hit, and the two bounce apart. Tap a coupling to uncouple; the
  cars roll free with no brakes.
- Brakes. A notched loco brake acts on the loco alone and comes on in half
  a second. A notched train brake acts on the whole coupled train and
  builds up over 4 seconds. Release takes both off. Emerg cuts the
  throttle and puts both brakes fully on, with the train brake at full in
  1 second.
- A switch can't be thrown while a vehicle stands on it.

**Fixed**
- Trains stop with their end, not their middle, at the buffers.

## 0.1.1

**Changed**
- Built for a phone held upright. The yard fills the screen and, in
  portrait, is turned so it runs up the screen; landscape shows it as laid
  out. The canvas is sharp on high-density screens.
- On-screen − / Stop / + buttons along the bottom, in thumb reach; tapping
  near a switch throws it. The keyboard still works.

## 0.1.0

**New**
- `index.html`: a single-file skeleton with the ARCHITECTURE layout, a
  fixed-step loop and canvas rendering.
- A small yard: a main line and a two-switch ladder into two sidings.
- One locomotive with a four-notch throttle each way; it stops at the end of
  track and trails through switches set against it, pushing them over.
- Click a switch to throw it.
