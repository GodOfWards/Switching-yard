# Junín yard

Researched 2026-10-08 from OpenStreetMap. The game's version of it lives in
WORLD DATA in `index.html`.

## Decided (Tom)

- **2026-10-08: Build the depot fan** (section A below) over the east throat
  (B). The turntable starts as a plain dead end.
- **2026-10-08: A north arrow** in a corner of the view, since the yard
  is turned to fit the screen.
- **2026-10-08: The east end is the next map** (#44): the ladder, its
  yard tracks cut short, the fan and a head-shunt (section C below), for
  free switching.
- **2026-10-08: The fan is laid again for accuracy.** The first game fan
  (v0.3.1 to v0.7.2) was discarded: it had been laid as a curve and a
  straight per track with switches spaced out, and at true scale it
  didn't look like OSM's.
- **2026-10-08: OpenRailwayMap is the standard map reference.** It draws
  the same OpenStreetMap data used here; at Junín that data has no signals
  or track numbers. Re-download before laying more track (#44).
- **2026-10-09: The main line becomes track** (#44), joined to the
  head-shunt by the yard's one real crossover, for main-line traffic
  (#56) and authority to move (#57). Open to the player; nothing runs on
  it yet.

## The site

| Fact | Value | Source | Status |
|---|---|---|---|
| Station | Junín, San Martín line, operated by Trenes Argentinos; node at −34.5842, −60.9498 | OSM station node, Wikidata Q5842976 | Secondary |
| Gauge | 1676 mm (broad) | OSM `gauge` on 42 of the 73 rail ways | Secondary |
| Yard size | About 22 km of yard track, 48 ways, on a site about 2 km by 600 m running ENE along the main line | OSM, measured from the export | Secondary |
| Topology | Connected: 61 junctions, no gaps between ways | OSM export, checked by script | Secondary |
| Turntable | One, north-east of the station, at the end of a spur off the fan | OSM `railway=turntable` | Secondary |
| What the fan is | A locomotive depot, judged from the turntable and the dead-end fan. OSM doesn't name it | Inference | Unconfirmed: a track plan or a local history source would confirm it |
| Workshops | The Villa Talleres workshops, about 800 m north of the station, have no track in OSM | OSM | Secondary |
| Switches | Only 7 nodes are tagged `railway=switch`; the rest are inferred from where ways join | OSM | Secondary |

The OSM export used (bbox −60.975, −34.600, −60.925, −34.565; © OpenStreetMap
contributors, ODbL) is saved in the project at
`research/junin/junin-2026-10-08.osm`, with a picture of both candidate
sections in `research/junin/junin-sections.png`.

Access from the cloud environment: `api.openstreetmap.org/api/0.6/map` and
Nominatim work; overpass-api.de resets the connection and two Overpass
mirrors returned errors.

## Candidate sections

- **A. Depot fan.** A lead off the north side of the yard splits into seven
  dead-end tracks and a spur to the turntable. It's about 280 m long, plus
  an approach.
- **B. East throat.** Five tracks laddering into the main line, about
  450 m long.
- **C. East end** (the game's map since #44). Eight parallel yard tracks,
  about 4.5 m apart, run about 1.1 km along the north side of the main
  line from the station east. Seven of them ladder, at their east end,
  into one lead; the eighth, nearest the main line, runs past the ladder
  and isn't joined to it. A diagonal from the northernmost track joins the
  lead too, making a loop. The fan (A) leaves the northernmost track just
  west of the ladder, by two leads: one to the turntable and seven
  tracks, one to an eighth fan track and a short track. Another short
  track leaves the northernmost yard track. East of the ladder the lead
  opens into the east throat (B) and the main line.

## How the east end became game track

`tools/junin_east.py` reads the saved export and prints WORLD DATA's
track. What it does:

- **The frame**: turned 20.6° so the main line runs along the game's x
  axis, east up the portrait screen. `NORTH` in WORLD DATA keeps true
  north.
- **What is kept**: everything joined to the ladder between two cuts,
  less the rest of the east throat and the through track nearest the
  main line. The yard tracks are cut at a buffer on one line across the
  yard, 300 to 500 m west of their switches; the lead is cut at a buffer
  281 m east of the ladder, making a head-shunt. The lead follows OSM's
  track that carries the crossover, so for its last 200 m it bends in to
  run 4 m from the main as the real one does.
- **The main line** (since #44's main-line step) is laid between its
  own cuts, 10 m west of the yard tracks' cut and 1 km past the crossover
  (1810 m in all), and runs on off the map at both ends: no buffer stop
  there. The crossover (53 m) is OSM's: a switch on the lead 197 m east
  of the ladder, one on the main 52 m further east, facing a train from
  Retiro. It is the only track joining the yard to the main in this
  stretch; the main is the only `usage=main` way, so single track.
- **Lines**: OSM's lines are simplified (to within 0.75 m) and each
  corner is rounded with a curve as wide as fits, up to 300 m.
- **Switches** stand where OSM puts them. Each one's direction is read
  from OSM 15 m along its three tracks. A track leaves its switch along
  that direction and curves onto OSM's line, on a 190 m curve where there
  is room, tighter where switches stand close. So a track runs off OSM's
  line near its switch, as a real turnout's curve would.
- **Close switches**: two switches with nothing between them and less
  than 60 m apart are joined by a pair of curves. Four stood closer than
  25 m to the one before (one at the ladder's start, three in the fan's
  throat, where OSM has them 15 to 22 m apart) and were moved out to
  25 m, along the line between them.
- **How close it stays** (measured from the game's track to OSM's lines):
  half the pieces stay within 0.35 m; near switches up to about 2 m; at
  most 3.6 m, on fan track 1, beyond two of the moved switches.
- Every joint is smooth (checked in the game: no kink over 0.5°). The
  tightest curves are in the fan's throat and its second lead, 26 to
  55 m, where OSM's switches stand closest.

Game track lengths, switch to buffer (the numbers and names are the
game's, not the railway's): yard tracks, numbered from the main-line
side, 1: 494 m, 2: 453, 3: 412, 4: 383, 5: 345, 6: 294, 7: 143 (the
northernmost, behind the fan's leads). Fan tracks, numbered from the
turntable side, 1: 192 m, 2: 124, 3: 124, 4: 143, 5: 98, 6: 98, 7: 210,
8: 239; turntable spur 73 m. Short tracks: 226 m (off the fan's second
lead) and 275 m (off the northernmost yard track). Lead: 282 m. Main
line: 1810 m. Crossover: 53 m.
