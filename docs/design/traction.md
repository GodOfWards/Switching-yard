# Traction

How the yard engine pulls, slips, heats its motors and burns fuel (#117).
Figures and sources: [../reference/diesel-traction.md](../reference/diesel-traction.md)
and [../reference/locomotives.md](../reference/locomotives.md). Every
number is retunable.

## Rules

- **The yard engine is an ALCO RSD-35**, 79 t, C-C, all six axles driven,
  with estimated figures (Tom, 2026-11-24). Through freights are headed by
  the RSD-16, which the game drives.
- **The throttle has 8 notches plus idle**, read 0–8 on two buttons. Each
  notch is a share of full power: 7, 13, 27, 38, 48, 64, 87, 100 %.
- **The load builds** toward the notch's over about 4 s, and falls in
  about 1 s, after a notch change; a meter under the throttle shows it.
- **Pull against speed:** the least of the notch's cap at low speed
  (starting pull × √share), its power over the speed, and the rail's grip.
  Pull fades out at the yard's 29 km/h limit.
- **Wheel slip:** asking for more than the grip (dry rail 0.25 of the
  weight on the driven axles; sanded 0.35) slips the wheels. Pull drops to
  60 % of the grip, the Wheel slip light shows, and it holds until the
  player notches down or puts sand on. **The rail is always dry** for now
  (Tom), so with the RSD-35's estimates it never slips; slip and sand are
  built for weather later.
- **Sand** goes on while its button is held, from a box that empties
  slowly and is refilled with the fuel.
- **Traction motors heat** with the square of their current and cool by
  their blowers, which turn with the engine: fastest in the top notch,
  half as fast at idle. The **load meter** shows the current as a share of
  continuous, with a red mark at continuous and ticks for the 60, 30, 15,
  10 and 5 minute bands past it; above continuous it names the band.
- **At the heat limit, a protective trip** (Tom): power cuts until the
  motors cool to 80 %. It counts as rough handling on the jobs being
  worked.
- **Fuel:** a gauge by the speed. The engine idles all shift, and burns by
  the notch in use. Below a quarter tank a **"Fuel the loco"** task shows
  on the board (not a job: nobody else does it, and it isn't assessed). The
  loco fills, and its sand box with it, standing at the fuel point beside
  the turntable. Run dry, the engine stops and fuel is brought out an hour
  later.
- **Skipping needs the throttle shut** as well as everything standing;
  over a skip the motors cool, the engine idles and a loco at the fuel
  point fills.
- **No maintenance** in this build (Tom).

## Open

- Maintenance: engine start and air pump-up, a walk-around, damage from
  rough handling, shop visits (each its own issue when wanted; #117).
- Weather, wet rail and adhesion that falls with speed, which would make
  slip and sand matter.
