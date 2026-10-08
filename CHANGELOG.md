# Changelog

Newest first. One entry per version bump.

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
