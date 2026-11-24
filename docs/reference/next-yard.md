# Next yard after Junín: candidates

Researched 2026-11-23 for Tom's question "where can we expand after this
location?". Which yard comes next is Tom's call; nothing is decided. FA-era
line status is in [rail-network-fa-era.md](rail-network-fa-era.md) (#52).

Map: [next-yard-candidates.png](next-yard-candidates.png) (San Martín lines in
OSM; red main line, grey branches in use, dashed disused).

## Ranked list

| # | Where | From Junín (straight line) | Why | Main risk |
|---|---|---|---|---|
| 1 | **Rufino** (Santa Fe) | 166 km west, same main line (SM-C) | Next real junction west: four lines meet. Fits the line graph with no gap | Medium-size yard; workshop closed 1979 |
| 2 | **Palmira** (Mendoza) | 724 km west, end of the main line (SM-D) | Where the wine traffic starts; the game already has a Mendoza block | Far; the graph between has to exist first |
| 3 | **Caseros / Santos Lugares** (Buenos Aires) | 219 km east, SM-A | The Retiro end; biggest San Martín yard track in OSM | Urban and dense; FA-era role of each yard unknown |
| 4 | **Justo Daract** (San Luis) | 397 km west | Big BAP workshop and junction town | Mostly workshops; history thin |
| 5 | **Chacabuco** (Buenos Aires) | 44 km east, via SM-B and SM-6 | Close; small branch yard for a local "road switcher" job | Small; SM-6 is partly disused, probably open in 1977 (Unconfirmed) |

### 1. Rufino: recommended next

- **Layout** (OSM, within 3 km): 9.2 km of yard track (7.8 yard, 0.9
  siding, 0.5 spur), **25 switches tagged** (Junín has 4) and a
  turntable. Well mapped. Secondary.
- **Junction**: the main line SM-C, SM-9 to Venado Tuerto (in use, the
  BAP's way to Rosario), SM-10 south to Huinca Renancó and La Paz (195 km
  in use, 310 disused), and SM-11 to La Carlota (disused). Secondary
  (OSM refs).
- **Traffic**: World Bank 1979 ¶2.32 gives the **densest freight section
  of 1977 as Mendoza–Rufino, over 2 million t a year** (Confirmed, already
  in [fa-freight-traffic.md](fa-freight-traffic.md)). Rufino is where that flow ends and splits,
  so trains would be re-made there for Buenos Aires and for Rosario. That
  heavy fuel oil (900,000 t a year Mendoza to San Lorenzo) turned off at
  Rufino for Rosario is an inference from the map: Unconfirmed.
- **History**: town founded 1886 when the BAP reached it; the Villa
  María and Rufino Railway (concession 1887) joined it to the Central
  Argentino, taken over by the BAP in 1900 (en.wikipedia, *Villa María and
  Rufino Railway*). The **locomotive workshop dated from 1890 and closed
  in 1979**, later reopened by ALL (notife.com). So it was working in the
  game's era only to 1979. Secondary.
- **Why first**: it's the next node the line graph would reach anyway,
  it adds the one thing Junín lacks (trains exchanged between routes),
  and the data is the best mapped of the candidates.

### 2. Palmira: the strongest theme

- **Layout**: 16.7 km of yard track (13.3 yard, 3.2 siding), 6 buffer
  stops, a turntable. Mendoza city's own yard is 7.2 km with 31 switches
  tagged. Secondary.
- **Traffic**: the origin of the FA's wine (over 600,000 t a year to
  Buenos Aires, ¶2.32), limestone and fuel oil. The game's Mendoza block
  and tank cars already point here. Wineries with their own spurs would
  give industries to work. Confirmed for the flows; Palmira as the yard
  that made them up is Unconfirmed.
- **Today**: Trenes Argentinos Cargas' *Centro Logístico Palmira*, with
  locomotive and wagon workshops (argentina.gob.ar, 2018 tender). Modern,
  Secondary.
- **Risk**: the branches round it (SM-26, SM-27) are abandoned in OSM and
  the main line SM-D is disused between Villa Mercedes and La Paz, so the
  FA-era routes need the FA-era dating in [rail-network-fa-era.md](rail-network-fa-era.md).

### 3. Caseros / Santos Lugares: the Buenos Aires end

- **Layout**: 25 to 32 km of yard track within 3 km, the most on the San
  Martín in OSM outside Retiro, with SM-3 linking to Haedo (Sarmiento and
  Roca). Secondary.
- **Gameplay**: the Retiro block's destination; commuter trains on SM-A
  would constrain every move, as the main line at Junín does.
- **Risk**: which tracks were freight, carriage sidings or depot in the
  FA era is not known; the Buenos Aires freight yards (Retiro, Palermo,
  La Paternal) were later closed or moved (argentina.gob.ar, norma
  51948). A lot to sort out before it's playable.

### 4. Justo Daract

- 9.2 km of yard at the station plus 19 km at the "Kilómetro 656"
  complex just north (with a turntable); junction of SM-C, SM-14 and
  SM-18 (to La Paz, in use today). Workshops moved here from Villa
  Mercedes (en.wikipedia, lightly sourced). Secondary.
- More workshop than yard; history is thin.

### 5. Chacabuco

- 5.5 km of yard and 1.3 km of spur on SM-6, 44 km from Junín. The
  closest yard with industries; suits a small local job rather than a
  second main yard. SM-6 is 70 km in use and 83 km disused in OSM; in the FA era it was
  probably open ([rail-network-fa-era.md](rail-network-fa-era.md),
  Unconfirmed).

## Considered and dropped

- **Villa Mercedes**: nearly all its yard track is disused in OSM and it
  is operated by FerroZAL today; the old BAP workshops are a cultural
  centre. Poor data.
- **Laboulaye**: 11 km of yard but its branches (SM-12, SM-13) are
  disused. Possible later as a junction.
- **Pergamino**: Mitre, and SM-5 to Junín closed in 1977 (Tom's era call).
- **Vedia, Alberdi**: small; better as stations on the line graph than as
  yards.

## Method

The OSM Argentina extract from download.openstreetmap.fr (downloaded
2026-11-23, © OpenStreetMap contributors, ODbL). Every `railway=rail`,
`disused` or `abandoned` way and every station node was read; for each
station, track with a `service` tag (yard, siding, spur, crossover) within
2.5 km (3 km for the detail figures) was summed, and main-line `ref`s
within 400 m listed. Ranked by yard track on San Martín lines. OSM's
tagging varies by mapper, so switch counts measure mapping care more than
real switch numbers. Judgment calls, retunable. Scripts were scratch work,
not kept.

## Not found

- Any FA-era track plan or traffic figure for Rufino, Palmira, Justo
  Daract or Caseros.
- Which Buenos Aires yard made up the San Martín's freight in 1977.
