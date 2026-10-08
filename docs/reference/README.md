# Reference: real-world facts, researched once

Real-world data the game needs to be accurate: locomotives, rolling stock,
resistance and brake figures, naming. The game's own values stay in CONFIG
and WORLD DATA in `index.html`; this folder is where they came from.

## Rules

- **Look here first.** A fact already here, with its source, isn't looked up
  again unless it's being re-verified.
- **What gets researched is added here in the same pull request**, in the
  file it belongs to, or a new file named for its subject with a row in the
  table below. A fact left only in a thread will be searched for again.
- **Every file says when it was researched, and every fact carries a
  source and a status:**
  - **Confirmed:** read on the primary source (the builder, the operator,
    the regulator, an official drawing).
  - **Secondary:** read on an encyclopedia, enthusiast site or article that
    restates the primary.
  - **Unconfirmed:** a figure without a source that states it, or an
    estimate. Say what would confirm it.
- **Tom's design calls** that a file's facts led to go at the top of that
  file under **Decided (Tom)**, dated, and in `../decisions.md`.
- **When a figure here and a figure in the game disagree,** say so in the
  file. Fixing it in the game is Tom's call.

## Files

| File | Covers |
|---|---|
| [locomotives.md](locomotives.md) | Switcher candidates (Class 08, SW1500, GM G12, GAIA) and why the G12 |
| [train-physics.md](train-physics.md) | Rolling and starting resistance (Davis), curve drag, brakes, air, hand brakes, slack, FA coupler types |
| [argentine-rolling-stock-naming.md](argentine-rolling-stock-naming.md) | Line initials, FA loco numbers, Spanish car type names, current operators |
| [fa-freight-cars.md](fa-freight-cars.md) | FA freight cars: load limits and tares from FA's specifications, type codes, the marking panel, tare stencil, paint colours, couplers |
| [junin-yard.md](junin-yard.md) | Junín yard from OpenStreetMap, the depot fan section and how it became game track |
| [switch-indicators.md](switch-indicators.md) | How Argentine railways show a switch's position (RGF art. 100), and the track figures used to draw rails |
