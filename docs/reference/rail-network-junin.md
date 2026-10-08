# Rail network around Junín

Researched 2026-10-08 from OpenStreetMap (#52). The yard itself is in
[junin-yard.md](junin-yard.md). Nothing here is in the game yet.

## Decided (Tom)

- **2026-10-08: "Active" means track in the FA era**: OSM `railway=rail`
  plus `railway=disused` (track still down), not `railway=abandoned`
  (track lifted). This also catches lines closed before the 1970s, so a
  line's dates are checked before it's relied on.
- **2026-10-08: Two tiers.** The network is a line graph (stations,
  junctions, distances, shape); full switching track exists only in the
  yards that are played.
- **2026-10-08: First area: every line out of Junín to its next
  junction.**
- **2026-10-08: The graph goes in WORLD DATA**, simplified, made by
  `tools/rail_network.py`, so the game stays one file. It goes in when the
  overview (#53) or main-line traffic (#56) needs it.

## The lines out of Junín

![Lines out of Junín](rail-network-junin.png)

| Line (OSM `ref`, `name`) | Out of Junín | To | Length | Track | Stations on it (OSM) | Status |
|---|---|---|---|---|---|---|
| SM-C, FC San Martín | West | Juan Bautista Alberdi, where disused SM-8 leaves | 78.5 km | In use | Saforcada, Las Parvas, Blandengues, Leandro N. Alem, Vedia, Edmundo Banbury Perkins, Juan Bautista Alberdi | Secondary |
| SM-7, FC San Martín | West, then north-west at Saforcada | Arribeños, where disused SM-4 leaves | 64.3 km | In use | Saforcada, Agustina, Fortín Tiburcio, Arenales, Arribeños | Secondary |
| SM-5, FC Mitre | East, then north | A junction with disused SM-4 in Rojas partido, 8 km past Rafael Obligado | 35.1 km | Disused | Agustín Roca, Rafael Obligado | Secondary |
| SM-B, FC San Martín | East, towards Buenos Aires | Membrillar, where SM-6 leaves | 28.6 km | In use | La Oriental, O'Higgins, Membrillar | Secondary |

Source: the OpenStreetMap extract of Argentina from
download.openstreetmap.fr, data as of 2026-10-07 01:06 UTC (© OpenStreetMap
contributors, ODbL). The same refs are what OpenRailwayMap labels the lines
with. The lines' geometry and these figures are in
[rail-network-junin.geojson](rail-network-junin.geojson).

What the table doesn't settle (research: #66):

- **The refs** (SM-B, SM-C, SM-5, …) are OSM's; what scheme they come
  from isn't recorded with them. Unconfirmed; a Trenes Argentinos Cargas
  or ADIF line list would confirm it.
- **SM-5 is tagged "FC Mitre"**, the line of the former Central
  Argentino, while the others are San Martín. Which railway built and ran
  it in the FA era: unconfirmed.
- **Whether each line was open in the 1970s–80s**, the disused SM-5 above
  all. Unconfirmed; a line history (closure dates) would confirm it.
- **SM-C and SM-7 leave Junín side by side** on separate tracks and part
  at Saforcada, 10 km out. They have no connection there in OSM, so in
  the graph they are two lines from Junín, not a junction at Saforcada.
  Secondary.
- **No abandoned line** reaches Junín in OSM. Lines lifted before OSM
  mapped them may be missing altogether.

## Method

`tools/rail_network.py` (needs `pip install osmium matplotlib`):

1. **`extract`** keeps, from the Argentina extract, every way tagged
   `railway=rail` or `railway=disused` with no `service` tag (yards,
   sidings, spurs and crossovers are yard detail) and not `usage=tourism`,
   in a box 3° by 2.5° either side of Junín, plus station and halt nodes,
   disused ones included. A run takes about four minutes.
2. **`walk`** treats track within 3 km of Junín station as the station.
   Every track leaving that circle is followed outward. Exits whose track
   meets again outside are one line; of those, the one with the most track
   in use is kept.
3. A node where the track divides is a **junction** when at least two of
   the ways onward reach 5 km or more from it (followed up to 20 km of
   track) without rejoining each other or leading back into Junín.
   Shorter ones are spurs, and rejoining ones are loops, so the walk
   carries on past them.
4. A station is **on a line** when it's within 400 m of the track; one
   from another railway can show up where two lines pass close (Vedia has
   a Belgrano station beside the San Martín one).

The numbers in steps 2 to 4 are judgment calls, named constants at the
top of the script, retunable.

Access from the cloud environment: download.openstreetmap.fr works
(484 MB); Geofabrik resets the connection; Overpass doesn't work.

## Size

Simplified to 50 m, the four lines are 32 points in all (OSM has 268).
At that rate the network for a whole province would still be small for
WORLD DATA, so size doesn't limit how far the graph can reach.
