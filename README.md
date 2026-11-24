# Switching Game

A top-down railway switching game in a single HTML file. Open `index.html`
in a browser; nothing needs installing.

`index.html` is built from the source in `src/`: after editing it, run
`python tools/build.py` (Python 3, nothing else).

It's made for a phone held upright. Along the bottom are three notched
levers, each a + and a −: the throttle (past zero it runs in reverse), the
loco brake and the train brake. Release takes both brakes off and Emerg
stops everything. Tap a switch to throw it. Cars never couple on their own:
ease the loco up to a car until the buffers touch, then tap the ring between
them and Hook up; tap a coupling to connect its air or uncouple it. Cuts
other crews leave stand with a hand brake on: release it from the car's
card before you pull them. Hooking
up and uncoupling take the shunter a few seconds, with everything standing.

On a keyboard: W / S (or the arrow keys) for the throttle, R / F for the
loco brake, E / D for the train brake, X to release and Space for emergency.
