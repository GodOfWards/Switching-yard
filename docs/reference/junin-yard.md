# Junín yard

Researched 2026-10-08 from OpenStreetMap. The game's version of it lives in
WORLD DATA in `index.html`.

## Decided (Tom)

- **2026-10-08: Build the depot fan** (section A below) over the east throat
  (B). The turntable starts as a plain dead end.
- **2026-10-08: A north arrow** in a corner of the view, since the yard
  is turned to fit the screen.
- **2026-10-08: OpenRailwayMap is the standard map reference.** It draws
  the same OpenStreetMap data used here; at Junín that data has no signals
  or track numbers. Re-download before laying more track (#44).

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

## How the fan became game track

OSM's lines for the fan are rough: straight lines with sharp corners and no
curves. What was kept from OSM:

- the tree: which track leaves which switch, in what order;
- where the switches stand and where the tracks end.

What was laid again, so it follows the real layout but not exactly:

- Each track from its switch is a curve then a straight, aimed at the next
  switch or the track's end, so every joint is smooth (checked: no kink
  over 0.2°).
- Curves are 150 m radius where they fit. Where switches stand too close
  for that, the curve is tighter: 82, 111 and 138 m.
- Switches closer than 30 m to the switch before them were moved out
  along their line to 30 m, and of two branches' switches standing
  together, the further one was moved 30 m further out. In OSM, three
  switches near the start of the fan stand 6 to 22 m apart, which is
  probably simplified mapping, since a real turnout is longer than that.
- The approach is 110 m of the yard track that the lead leaves from, cut
  off at a buffer. The lead's other branch, towards the yard's northern
  tracks, was left out.
- The whole fan is turned 40° clockwise so its length lies along the
  game's x axis. `NORTH` in WORLD DATA keeps true north.

Game track lengths, switch to buffer: track 1 182 m, track 2 121 m,
track 3 119 m, track 4 101 m, track 5 56 m, track 6 57 m, track 7 176 m,
turntable spur 64 m. Tracks are numbered from the turntable side. These
numbers are the game's, not the railway's.
