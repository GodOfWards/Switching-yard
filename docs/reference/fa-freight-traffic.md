# FA freight traffic: reference

What Ferrocarriles Argentinos carried, how much and how far, and how long
a freight car took to come back. Researched 2026-10-12 (#86) for the
traffic plan of jobs stage 3a (#50). FA's actual turnaround added
2026-10-13 (#86). The San Martín, Junín's stations and wine added
2026-11-23 and 2026-11-24 (#98); turnaround after 1977, the split of a
cycle and cars between lines are in [fa-car-turnaround.md](fa-car-turnaround.md).

**Status:** the system-wide figures are **Confirmed**, read on the World
Bank's 1979 appraisal of FA, which quotes FA's own 1977 statistics and its
1979-1982 targets; the actual turnaround is read off its operating
statistics tables (2.12, 2.13), images in the scan. **No FA figure per
line or per station was found.** The San Martín's traffic through Junín
is **Derived** from the system figures, the line's track densities and
the concession years; what Vedia, O'Higgins and Membrillar shipped is
**Derived** from today's grain stores. Open gaps: #112.

## Sources

| Source | What it is | Status |
|---|---|---|
| World Bank 1979 | *Staff Appraisal Report: Argentina, Second Railway Project*, Report No. 2155b-AR, 14 March 1979, 100 pages, documents1.worldbank.org/curated/en/986621468221690736/pdf/multi-page.pdf. Copy in the project files at `research/fa-operations/worldbank-1979-second-railway-project.pdf` | Confirmed |
| La Nación 2021 | Article on a former Buenos Aires winery building (Distrito del Vino), lanacion.com.ar, 5 November 2021 | Secondary |
| Diario de Cuyo 2019 | "La historia de La Superiora, una de las bodegas más emblemáticas de San Juan", diariodecuyo.com.ar, 6 November 2019 | Secondary, undated for the fact used |
| BCR 2017 | Bolsa de Comercio de Rosario, *El alto potencial de la línea de ferrocarril San Martín*, weekly report | Secondary, modern |
| rm-forwarding 2016 | "Ferrocarril o camión. Analizando el caso del vino", rm-forwarding.com, September 2016 | Secondary, modern |
| Hernández 2014 | J. J. Hernández, "La ley 23.149 de fraccionamiento de vinos en origen en Argentina", *H-industri@* 8 (15), 2014, dialnet.unirioja.es/descarga/articulo/4919099.pdf | Confirmed for the INV figures it tabulates |
| DNPT 2019 | Dirección Nacional de Planificación de Transporte de Cargas y Logística, *Transporte Ferroviario de Cargas en Argentina*, December 2019, argentina.gob.ar/sites/default/files/transporte_ferroviario_de_cargas_en_argentina_0.pdf | Confirmed |
| Kogan and Thompson 1994 | "Reshaping Argentina's Railways", *Japan Railway & Transport Review* 2, ejrcf.or.jp/jrtr/jrtr02/f23_kog.html | Secondary |
| World Bank 2005 | *Results of Railway Privatization in Latin America*, documents1.worldbank.org/curated/en/772451468046495809 | Secondary |
| Ramamurti | *Testing the limits of privatization: Argentine railroads*, Northeastern University working paper 26 | Secondary |
| MAGyP | *Acopios con desvío propio / con lote lindero / sin acceso a ferrocarril*, magyp.gob.ar (…/000060_Ferrocarriles/000002_Acopios/), read 2026-11-23; rows for the Junín area in [magyp-acopios-junin-area.csv](magyp-acopios-junin-area.csv) | Secondary, modern |
| OpenStreetMap | Overpass query around Vedia, O'Higgins and Membrillar, 2026-11-23 (ODbL) | Confirmed for today |
| Wikipedia | es: Estación Vedia (San Martín), Vedia (Argentina), Estación Vedia (Belgrano), Estación O'Higgins, Estación Membrillar, Partido de Chacabuco; en: Buenos Aires al Pacífico S.A. | Secondary |
| Semo | Local-history articles on the La Paternal wineries, Nuestro Barrio (2021) and Villa del Parque Info (2020) | Secondary |

Paragraph and table numbers are the report's ("¶2.32", "Table 2.8").

## How much FA carried

| Fact | Source | Status |
|---|---|---|
| FA freight: 16.3 million t and 10.7 billion t-km in 1975; **19.8 million t, 11.5 billion t-km in 1977**, average haul 579 km | World Bank 1979 ¶2.30-2.31 | Confirmed |
| Main commodities by t-km in 1977: sugar 11%, fuel oil 11%, **wine 7%**, wheat 7%, petroleum 6%, cement 5%, sorghum 5%, mineral products 5%, corn 5%, forestry 4%, limestone 4% | ¶2.32 | Confirmed |
| **Wine: over 600,000 t a year from Mendoza and San Juan to Buenos Aires** (about 1,000 km). Limestone: about 212,000 t a year Mendoza to Buenos Aires. Heavy fuel oil: almost 900,000 t a year Mendoza to San Lorenzo | ¶2.32 | Confirmed |
| Densest freight section in 1977: **over 2 million t a year between Mendoza and Rufino**, on the San Martín (Junín is east of Rufino) | ¶2.32 | Confirmed |
| Grain: about 7.5 million t a year, average haul about 270-330 km, to ports and consumption centres; **about 70% of rail grain moved in block trains** | ¶2.31, 2.32, note to ¶2.47 | Confirmed |
| Broad-gauge forecast for 1981 (thousand t, average haul): wine 776 at 1,054 km; limestone 631; cement 1,393; petroleum products 1,338; corn, wheat and sorghum about 2,000-2,900 each at 240-385 km | Table 2.8 (forecast, not actual) | Confirmed as a forecast |
| A block train has cars of one origin and destination; neither it nor a unit train needs intermediate switching | note to ¶2.52 | Confirmed |
| Bulk wine reached Buenos Aires from Mendoza **in tank cars**, run into the wineries' depots and bottled there; the trains fell out of use once wine was bottled in Mendoza and table-wine demand fell in the 1980s | La Nación 2021 | Secondary |
| The project bought 60 new broad-gauge **wine tankers** | ¶3.06 (c) | Confirmed |
| Wineries owned tank cars: La Superiora (San Juan) had 40 of its own on the Belgrano and 25 on the San Martín, with its name painted on them. The article gives no date for the fleet | Diario de Cuyo 2019 | Secondary, date unknown |
| Today the San Martín's freight is mostly cereals and food products; wine was 1.6% of its tonnage in 2016 | BCR 2017; rm-forwarding 2016 | Secondary, modern |

## The San Martín and Junín

Researched 2026-11-23 (#98). **No per-line commodity table for the San
Martín was found for any FA year.** What was found, and what passes Junín
worked out from it:

| Fact | Source | Status |
|---|---|---|
| FA broad gauge 1977: 14.4 Mt, 7.45 bn t-km, average haul 517 km. By commodity (thousand t, average haul): wheat 2,850 (261 km), corn 2,336 (211), sorghum 1,354 (360), **wine 627 (1,073)**, petroleum 964, petroleum products 1,322 (811), cement 1,091 (548), limestone 306 (946), stones 469, salt 397, metal products 364, other products 733 | World Bank 1979, "Freight Traffic Statistics (1973-1977)", 1977, broad-gauge columns | Confirmed |
| Same table, 1976 broad gauge: wine 632 kt at 1,049 km, limestone 431 kt at 906 km | same, 1976 | Confirmed |
| San Martín route length July 1978: 4,563 km; by traffic, **1,601 km carried over 2 million gross t a year**, 833 km 0.8–2 Mt, 545 km 0.4–0.8 Mt, 1,584 km under 0.4 Mt | World Bank 1979, "Route and Track Data", July 1978 | Confirmed |
| Grain production 1976/77 (forecast base): wheat 11.0 Mt, corn 8.3, sorghum 6.6, other grains 3.6, oilseeds 0.9; about 30 Mt | World Bank 1979, "Forecasts of National Production" | Confirmed |
| The Junta Nacional de Granos owned and ran the port silos and unloaded trains there | World Bank 1979, ch. 1 (ports) | Confirmed |
| FA freight: 14,186 million t-km (1970) to 7,523 (1991) | Ramamurti, *Testing the limits of privatization: Argentine railroads*, Northeastern University working paper 26, table 1 | Secondary |
| Freight concession packages, tonnes a year (about 1990, year not stated): **San Martín plus the rest of the Sarmiento, 4,700 km, 3.4 Mt**; Mitre 2.5; Rosario–Bahía Blanca 2.0; Belgrano 1.5; Roca 1.3; Urquiza 1.2 | Kogan and Thompson, "Reshaping Argentina's Railways", *Japan Railway & Transport Review* 2 (1994) | Secondary |
| BAP (the San Martín concession) took over in August 1993, 5,493 km | World Bank, *Results of Railway Privatization in Latin America* (2005), table 2-1 | Secondary |
| **BAP carried 2,439,729 t in 1994** | en.wikipedia "Buenos Aires al Pacífico S.A.", citing CNRT | Secondary |
| San Martín line (BAP, then ALL): **2000: 2,928,171 t, average haul 775 km**; 2007 peak 4.36 Mt; 2018 2.17 Mt | Dirección Nacional de Planificación de Transporte de Cargas y Logística, *Transporte Ferroviario de Cargas en Argentina* (December 2019), tables 2 and 4, CNRT data | Confirmed |

### What passed Junín, 1977 (Derived)

Junín is on the Retiro–Mendoza main line, so the Mendoza–Buenos Aires
flows above pass it. Car loads use the 60 m³ wine tank (about 59 t of wine
full, [fa-freight-cars.md](fa-freight-cars.md)) and FA's 35.3 t average
broad-gauge load for other cars. All **Derived**.

| Flow at Junín | Direction | t / year | Loaded cars / year | Per day (365) | Inputs |
|---|---|---|---|---|---|
| Wine, bulk, Mendoza/San Juan to Buenos Aires | East (to Retiro) | about 600,000 | about 10,000 tank cars | about 28 | ¶2.32 |
| Empty wine tanks back to Cuyo | West | (empty) | about 10,000 | about 28 | Tank cars return empty |
| Limestone, Mendoza to Buenos Aires | East | about 212,000 | about 6,000 | about 16 | ¶2.32 |
| Fuel oil, Mendoza to San Lorenzo | East, then north? | up to 900,000 | up to 15,000 tanks | up to 40 | Only if routed via Junín: not found |
| Grain from Junín, Chacabuco and Leandro N. Alem partidos | Mostly east (Buenos Aires port), some to Rosario | about 190,000 | about 5,500 | about 15 averaged, in a few harvest months | Grain estimate below |
| Westbound loads (merchandise, fuel and goods for Cuyo) | West | not found | not found | | The 2 Mt Mendoza–Rufino density counts both directions; no split found |

Check on the total: the known Cuyo flows (wine 600 + limestone 212 + fuel
oil 900 = about 1.7 Mt) sit inside the "over 2 Mt" Mendoza–Rufino density,
leaving a few hundred thousand tonnes for everything else, westbound
included. The 1,601 km of the San Martín carrying over 2 Mt gross fits a
busy Retiro–Mendoza trunk of about 1,050 km.

**Grain estimate.** Partido areas: Junín about 2,260 km², Chacabuco about
2,290, Leandro N. Alem about 1,600 (es.wikipedia, not rechecked), so
about 615,000 ha. *Assumed*: half of it in grain at 2.5 t/ha (no census
figure found; the 1988 Censo Nacional Agropecuario per partido isn't
online), about 770,000 t a year. FA carried 7.5 Mt of about 30 Mt grown in
1977, a 25% rail share, so about **190,000 t a year by rail from the three
partidos**, about 5,500 car loads. With 70% in block trains from the big
plants, roughly **1,600 car loads a year moved as wagonload** from the
smaller stations: the traffic a road freight works. Wheat ships around
December–February, corn and sorghum around March–July.

**Later years.** Wine through Junín scales with bulk shipments (below): by
volume, 1980 was 82% of 1977, 1985 51%, 1990 29%. So about 490,000 t in
1980, 310,000 t in 1985 and 175,000 t in 1990, *if rail kept the same share
of bulk wine*, which it probably didn't (trucks gained), so these are
ceilings. The whole line: about 3.4 Mt for the San Martín plus the rest of
the Sarmiento around 1990, then 2.44 Mt in BAP's first full year (1994).

## Vedia, O'Higgins and Membrillar

Researched 2026-11-23 (#98). The Agriculture Ministry (MAGyP) lists every
registered grain store by rail access: own siding (*desvío propio*), plot
beside the track (*lote lindero*) or none. The lists are undated (2010s
from the firms listed) and give today's plants, not FA-era ones. The rows
for Junín, Chacabuco and Leandro N. Alem partidos are in
[magyp-acopios-junin-area.csv](magyp-acopios-junin-area.csv). Capacities
are tonnes of wheat.

| Station | Plant (MAGyP) | Rail access | Use of rail (when listed) | Capacity | Status |
|---|---|---|---|---|---|
| **O'Higgins** (Chacabuco) | Cooperativa Defensa de Agricultores, "Estación O'Higgins": metal bins 7,000, **concrete silo 800**, sheet silos 33,070 | Beside the track | Not used for 10 years | 40,870 t | Secondary, modern |
| O'Higgins | Agro Comercial O'Higgins S.A., "Playa Est. FFCC" (on the station yard, railway land) | Beside the track | Not used for 2 years | 23,560 t | Secondary, modern |
| **Membrillar** (Chacabuco) | Cooperativa Defensa de Agricultores, "Estación Membrillar": **railway grain shed (galpón ferroviario) 1,500 t**, sheet silo 2,100 | Own siding | Never used | 3,600 t | Secondary, modern |
| **Vedia** (Leandro N. Alem) | Cargill, "FFCC Gral San Martín", on railway land | Own siding | **Used normally** | 5,290 t | Secondary, modern |
| Vedia | Werthein, "Predio General Belgrano", on railway land (the old metre-gauge yard) | Own siding | Branch out of service | 11,400 t | Secondary, modern |
| Vedia | Compañía Argentina de Granos 31,000 t; Cargill (Ruta 7) 24,900 t; El Chúcaro 3,240 t | None | | 59,140 t | Secondary, modern |

| Fact | Source | Status |
|---|---|---|
| OSM today: O'Higgins has about 25 silos and 10 warehouses on industrial land along the station; Membrillar 7 silos and 3 warehouses next to the halt; Vedia a spur, a siding, San Martín yard tracks, **disused metre-gauge (Belgrano) yard tracks**, and industrial buildings up to 30 m tall beside them | OpenStreetMap via Overpass, read 2026-11-23 | Confirmed for today |
| Vedia had a connection with the metre-gauge Compañía General de Buenos Aires (later Belgrano) branch G6 Pergamino–Vedia "for the transfer of freight". The Belgrano station opened 1914 and closed 1977 (uncited) | es.wikipedia "Vedia (Argentina)", "Estación Vedia (Belgrano)" | Secondary |
| Vedia station is at km 310.4 from Retiro; O'Higgins and Membrillar opened 15 February 1886 | es.wikipedia station articles; OSM `railway:position` | Secondary |
| Chacabuco partido: soy, corn and wheat; its grain dealers put it "a la altura de los principales centros de acopio de la zona"; farmers' co-ops "con casi un siglo de permanencia" (uncited) | es.wikipedia "Partido de Chacabuco" | Secondary |
| An FA timetable or station list giving each station's freight category | | Not found |

### What each station shipped in the FA era (Derived)

This rests on three things: the co-op that owns the plants today is a
century-old Chacabuco co-op; the plant types that predate the 1980s
steel-bin boom (a concrete silo, a railway grain shed) are there; and the
plants sit on railway land at the station. Today's capacity is a ceiling
for the FA era.

| Station | FA-era role | Rough car loads a year | Inputs |
|---|---|---|---|
| **O'Higgins** | **Grain station with storage**: the co-op's plant at the station, loading on the station tracks. Big enough for a block of cars at harvest | 450–1,400 | 64,430 t beside the track × one turn a year × 25–75% by rail ÷ 35 t |
| **Vedia** | **Grain station**, partido seat, and the break of gauge with the metre-gauge line until 1977 (transfer traffic both ways). After 1977, grain only | 150–500 from the rail-served plants; up to 1,600 if the off-rail plants trucked to the station | 16,690 t on rail (or 75,830 t with the off-rail plants), same turn and share |
| **Membrillar** | **Small lots**: bagged or bulk grain from the 1,500 t railway grain shed and later a small bin; a few cars at a time in the season. Also the junction where SM-6 leaves | 25–100 | 3,600 t × same turn and share ÷ 35 t |

All three loaded **grain outbound** (wheat in summer, corn and sorghum in
autumn and winter) and received little. Inbound would be seed, fertiliser,
fuel and building materials in small lots: *Assumed*, no source found.

**Junín partido today**, from the same lists: Molinos Tassara (a flour mill
in town, three plants with an own siding, disused 20 years), Liga Agrícola
Ganadera co-op plants beside the track at Junín, Morse, Agustina and
Agustín Roca, and **Nidera at Saforcada, 309,037 t with an own siding in
regular use**, the biggest rail-served store in the area. Secondary,
modern.

## Wine: tank cars, barrels and bottles

Researched 2026-11-23 and 2026-11-24 (#98).

| Fact | Source | Status |
|---|---|---|
| **Wine shipped packaged at origin vs in bulk for bottling elsewhere, Argentina (hl):** 1977: 5,635,862 (24.34%) vs 17,522,301 (75.66%); 1978: 28.30%; 1979: 28.97%; **1980: 6,678,718 (31.69%) vs 14,393,162**; 1981: 39.10%; 1982: 43.57%; 1983: 43.47%; 1984: 43.86%; **1985: 9,578,657 (51.63%) vs 8,973,306**; 1986: 55.82%; 1987: 62.83%; 1988: 64.31%; 1989: 65.19%; **1990: 12,611,690 (71.20%) vs 5,102,372**; 1993: 80.75%; 1999: 97.62% | Hernández, "La ley 23.149 de fraccionamiento de vinos en origen", *H-industri@* 15 (2014), cuadro 3, from INV data | Confirmed (INV via a peer-reviewed paper) |
| Law 23.149 (1984) made packaging at origin compulsory for some container sizes; 1985 was the first year most wine left the producing provinces packaged | same | Confirmed |
| In 1984 the law's supporters said "cerca de la mitad del vino en **damajuanas** ya se fraccionaba en origen": packaged wine was largely demijohns | same | Secondary (quoted claim) |
| The winemakers' association argued that packaged wine would raise freight volume 300% and that "los ferrocarriles" couldn't carry it; 70% of consumption was over 1,200 km from production. Bulk wine moved "en camiones y trenes" | same, quoting Los Andes, 7 October 1984 | Secondary |
| The San Martín brought bulk wine in tank cars to Sáenz Peña, La Paternal and Palermo in Buenos Aires, where it was piped (*vinoductos*) to bottling plants; a spur crossed calle Espinosa to a winery at La Paternal | E. Semo, Nuestro Barrio (3 February 2021) and Villa del Parque Info (25 July 2020) | Secondary, local history |
| **FA still had wine-barrel cars in 1978.** Its broad-gauge scrapping plan lists a wagon group **"Barrels (wine)"**, separate from "Tanks (wine)": 7 to be scrapped in 1978–81, and the consultants proposed 60 more | World Bank 1979, Table 2.6, p. 55 | Confirmed |
| How packaged wine (demijohns, bottles) travelled, rail box car or truck | | Not found |

**Derived:**

- Bulk tank cars carried the wine; a dwindling group of barrel cars still
  ran at the start of the game's era and was being scrapped. The packaged
  alternative was demijohns and bottles, by an unknown mode.
- If FA's 627 kt of broad-gauge wine in 1977 was all bulk, it was about
  36% of the 1.75 Mt shipped in bulk nationally (17.5 Mhl at about
  1 t/m³). Whether FA's "wine" included packaged wine isn't stated.
- **Wine through Junín in tank cars is safe for any year 1977–1985**;
  packaged wine in box cars is plausible from the early 1980s but
  unsourced; by 1990 the tank flow was a fraction of 1977's.

## Cars

| Fact | Source | Status |
|---|---|---|
| **Actual freight car turnaround, broad gauge, 1977: 19.8 days**; standard gauge 13.5, narrow gauge 17.9, FA as a whole 18.7 | Table 2.13 (FA, July 1978), "average turn round of cars (days)" | Confirmed |
| FA's turnaround over the decade, all gauges: 17.3 (1968), 16.9, 16.3, 16.8, 18.7, 19.3, 19.4, 20.8 (1975), 20.0, 18.7 (1977). So **16 to 21 days**, worst in 1975 | Table 2.12 (FA, May 1978) | Confirmed |
| Broad gauge, 1977: 24,212 freight cars available, 415,000 loadings in the year, a car covered **52 km a day** on average (loaded and empty), 55% of car-km loaded, 35.3 t per loaded car, average haul 517 km | Table 2.13 | Confirmed |
| So a broad-gauge car's average cycle was about 1,030 km (two average hauls: out loaded, back mostly empty) in about 20 days. Derived: 18,900 car-km a car a year × 19.8 / 365 | Table 2.13 | Derived |
| **Target turnaround, broad gauge: 18 days** (1979), falling to 16 by 1982; standard gauge 11.8, narrow gauge 18.3. The 18-day target was a cut from the 19.8 actual | Plan of Action targets, line (12) | Confirmed as a target |
| Average load per broad-gauge car: 32.5 t (1979 target) | line (11) | Confirmed |
| Freight car availability, broad gauge: 79% (1979 target) | line (10) | Confirmed |
| **Cars still belonged to a line under FA**: a car held for a shifted load is reported with its number "and the railway it belongs to" (*ferrocarril al que pertenece*) | RITO art. 415 d (1993 text), [fa-yard-operations.md](fa-yard-operations.md) | Confirmed |
| Only the broad-gauge lines (Roca, Sarmiento, Mitre, San Martín) could exchange cars at all; freight moved between gauges was 60,000 t in 1977, about 3% of the total | World Bank 1979 ¶2.32 | Confirmed |
| How freely broad-gauge cars ran between those lines: **partly answered** in [fa-car-turnaround.md](fa-car-turnaround.md#how-freely-broad-gauge-cars-moved-between-lines). Cars belonged to a line, and empties went back towards it, loading on the way only "en buen rumbo". Today each operator keeps its own fleet on its own line | Res. SETOP 352/75; argentina.gob.ar, Trenes Argentinos Cargas, *Material rodante* | Confirmed for the rules, Unconfirmed for how often |
| Turnaround after 1977 (broad gauge 21–24 days in a normal 1980s year), FA's freight train speed (23–27 km/h), the free time to load and unload, and a fitted split of a cycle by distance | [fa-car-turnaround.md](fa-car-turnaround.md) | Confirmed and Derived there |

## Yards

| Fact | Source | Status |
|---|---|---|
| With SOFRERAIL (French) assistance from 1970, FA divided its system into operating zones for train programming and wagon control, and set out to **concentrate on some 24 major yards**. Finished only on the standard gauge; started but not completed elsewhere for lack of locomotives. This matches the "*Plan de Encaminamiento*, drawn up by the French" in [fa-yard-operations.md](fa-yard-operations.md) | ¶2.51 | Confirmed |

## What it means for the game

Not decided here; Tom's calls go in `../decisions.md`.

- **The bulk moved in through trains.** Wine, limestone and most grain went
  in block or full trains that didn't stop to be switched; on the game's
  map those are the through freights on the main (#56). The road trains
  the yard works carry wagonload traffic: mixed merchandise, small lots,
  part-loads, and cars for intermediate stations.
- **A car comes back after weeks, not days.** FA's broad-gauge cars
  actually took about 20 days a cycle in 1977 (19.8), not the 18 of the
  1979 target. The game's away times (8, 12 and 16 days from Junín) are
  shorter than that average for every destination.
- **The data can't split a cycle into moving and waiting.** The 52 km a
  day is an average over the whole cycle, terminals included. Scaled by
  distance alone, an average cycle (about 1,030 km in 20 days) gives
  Retiro, 255 km away (Junín is km 254.9 from Retiro, Wikipedia), about
  10 days, and Mendoza, roughly 800 km away (not checked), about 31.
  The stations a few tens of km out would then come back in 1 to 2 days,
  which no FA source supports, because loading, unloading
  and yard time don't shrink with distance. A split fitted to the RGF's
  legal transit times is in [fa-car-turnaround.md](fa-car-turnaround.md#splitting-a-cycle-derived)
  (about 13 days short trip, 16 Retiro, 24 Mendoza); using it is a game
  choice, not a finding.
- **Junín sees long-haul Cuyo freight going east** (wine tanks,
  limestone), empties going west, and local grain at harvest; the
  stations east of Junín load grain outbound, O'Higgins most, Membrillar
  in small lots.

## Molinos Tassara's rates (#105)

Added 2026-11-24. The game's estimates, not findings; retunable. The mill
and its sidings are in [fa-yard-operations.md](fa-yard-operations.md#junín).

- **Flour out, 6 box cars a week:** 6 × 35.3 t × 52 weeks ≈ 11,000 t a
  year. The 35.3 t a car is FA's 1977 average load from the World Bank
  appraisal (above). **Estimate.**
- **Wheat in, 4 hoppers a week:** at about 75% extraction, 11,000 t of
  flour needs about 14,700 t of wheat; 4 × 35.3 t × 52 ≈ 7,300 t, about
  half, the rest by truck. **Estimate**; the extraction rate is general
  milling practice, no source recorded.
- **2 days away**, there and back from the local track through the west
  end. **Estimate.**
- **Capacity:** the Retiro side's flows came to about 110 cars a week
  each way against one 16-car departure a day (112). Tassara's 10 more
  overloaded it: in a 90-day test, arrivals were held outside for days.
  A second departure to Retiro clears it (Tom, 2026-11-24).

## Not found

Open in #112 (FA records not online).

- The San Martín's own traffic by commodity for any FA year, and the
  route of the Mendoza–San Lorenzo fuel oil (through Junín or not).
- FA-era freight categories of Vedia, O'Higgins and Membrillar.
- How packaged wine travelled (rail box car or truck) in the 1980s, and how
  many barrel cars were left.
- Fleet per line, and the rules on charging for another line's cars.
