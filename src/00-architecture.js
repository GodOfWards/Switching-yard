  // ==================================================
  // ARCHITECTURE
  // ==================================================
  // The game is one file, index.html, built from src/ by tools/build.py
  // (#113): the page is src/shell.html, its style src/style.css, and each
  // section below is one file, src/00-architecture.js to src/11-checks.js,
  // in this order. They run inside one strict-mode IIFE and share its scope.
  // No dependencies. Content and mechanics are kept apart so a pass can
  // touch one without the other.
  //
  //   CONFIG       version and every tunable game rule, as named constants.
  //   WORLD DATA   the yard: track nodes, straight or curved segments between
  //                them, switches, the running tracks, and where track runs
  //                on beyond the map;
  //                the kinds of rolling stock, the cars with their
  //                markings and loads, and where it all starts; the yard
  //                tracks' blocks, the industries at Junín, the
  //                destinations waybills name, the cars' traffic at the
  //                start, the traffic plan's flows and the numbers of cars
  //                that join, and the road trains' and through trains'
  //                timetables; the lines out of Junín, for the Map.
  //                Content passes (a new siding, a new yard) touch only this.
  //   STATE        what changes while playing: the time of day, switch
  //                positions, vehicles, the trains they are coupled into,
  //                the shunter's work under way at couplings,
  //                the loco's controls, the cars' traffic (away off the
  //                map included) and the pool of cars elsewhere on the
  //                line, the industries' work, the jobs, the arrivals held
  //                outside, the through trains offered, refused line clear
  //                or running, who holds the main, and the train register.
  //                Built from WORLD DATA by makeState(); never edits WORLD DATA.
  //   UTILITIES    small geometry, track-walking and lookup helpers.
  //   SIMULATION   advances STATE by one fixed step, step(dt): the clock, and
  //                all movement rules: forces, brakes, slack, contact
  //                buffer to buffer, and the shunter's hooking up and
  //                uncoupling coming due. The events ahead (a job due, a shift change)
  //                come from here too. The
  //                loop calls it at a fixed rate, so behaviour never depends
  //                on the display's frame rate.
  //   OPERATIONS   the rules of the railway's work, stepped from SIMULATION:
  //                cars' traffic by the plan, their trips off the map and
  //                the pool, and their dispositions, the industries'
  //                set-outs, work and pulls, road trains arriving and
  //                leaving, jobs opening with them and at shift changes,
  //                their lines checked against the yard, work done
  //                off-screen, rough handling, and results; through trains
  //                offered, held or run past on the main; and the train
  //                register of every train run and how late.
  //   ACTIONS      what the player can do (reverser, levers, Emergency,
  //                Release, throw a switch, connect or part the air,
  //                hook up or uncouple, set a hand brake, skip ahead, take, hand back
  //                or report a job, ask for the main or report it clear),
  //                and the rules on
  //                when they may. They change STATE; they never draw.
  //   PERSISTENCE  keeps STATE in localStorage between visits, and starts a
  //                new yard: the cars apart from the rest, written only
  //                when carsChanged() says they changed. SAVE_KEY changes
  //                with every change to the saved shape.
  //   RENDERING    draws STATE to the canvas and the controls (the job
  //                board and sheet are drawn in INPUT, beside their menus),
  //                through a camera (zoom, follow or pan, or the Map's steps
  //                out) that is display only. It never holds rules.
  //   INPUT / LOOP keyboard, buttons and taps to ACTIONS; the fixed-step loop,
  //                and Pause, which holds the loop's steps and the player's
  //                actions but not the camera; when to save.
  //   CHECKS       what WORLD DATA names that doesn't exist, checked at every
  //                start; what is wrong with STATE; and the benchmark page
  //                (index.html?bench), which times fixed scenarios and ages
  //                a yard to check it, for the Performance check in CI.
  //
  // Coordinates are metres, +x along the yard, +y to its right; WORLD DATA
  // says where north is. They are the world's, not the screen's: RENDERING
  // fits the yard to the screen and, on a portrait screen, turns it a
  // quarter so the yard runs up the screen (see makeView()).
  // Physics is in SI units: metres, seconds, kilograms, newtons.
  //
  // A train is a list of coupled vehicles, ordered from its head to its tail.
  // Each vehicle has its own speed (+ toward its train's head); the couplings
  // between them have play, so a train stretches and bunches (slack). A
  // vehicle stands on the track at its centre, with `dir` the segment sense
  // (+1 toward `b`) that points toward its train's head; a lone car or loco
  // is a train of one.
  // Identity is an id string, never an array index.
  // ==================================================

