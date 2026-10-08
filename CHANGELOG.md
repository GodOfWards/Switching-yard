# Changelog

Newest first. One entry per version bump.

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
