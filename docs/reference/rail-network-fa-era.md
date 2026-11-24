# Which lines around Junín were open in the FA era (1977 on)

Researched 2026-11-23 for #52. Builds on [rail-network-junin.md](rail-network-junin.md),
which holds the lines out of Junín and how they were extracted. Machine-readable
version: [rail-network-fa-era.json](rail-network-fa-era.json), keyed by OSM `ref`.

Almost everything here rests on Spanish Wikipedia stubs and railfan blogs; no FA
ramal list, CNRT table or closure decree annex was found online (see "Not found").
Statuses as in [README.md](README.md).

**The game agrees since #107 (2026-11-24):** WORLD DATA's `NETWORK_LINES`
used to end SM-B at Membrillar as a junction (28.6 km). Membrillar is not a
junction (below); `tools/rail_network.py` now treats it as double track and
ends SM-B at Chacabuco (42.6 km).

## The three questions

### SM-7 Saforcada–Santa Isabel: open through the FA era

- Passenger trains ran (Tuesdays and Fridays from Buenos Aires) "until the
  Menem decade", i.e. the early 1990s; freight still runs
  (arqueologiaferroviaria.blogspot.com, Arribeños, 2014). Spanish Wikipedia's
  Arribeños article: freight only today.
- The Chacabuco–Mayor José Orellano article describes today's grain flow
  Laplacette → Chacabuco → Junín → **Saforcada–Santa Isabel** → Rastreador
  Fournier → Rosario ports, so the line is in use now.
- In 1954 it was joined at Santa Isabel to the Mitre branch Peyrano–Wheelwright–
  Rastreador Fournier (OSM GM-46), a through route to Rosario.
- Wikipedia's "no operations" infobox is outdated or refers to passengers.
  OSM (`railway=rail`, all 103 km) agrees with the freight sources.
- **Status: Secondary, but consistent across three sources.** Open in 1977.

### SM-6: not at Membrillar; it is the Chacabuco–Mayor José Orellano branch

- **Correction to [rail-network-junin.md](rail-network-junin.md).** OSM has no branch at Membrillar. There
  SM-B splits into two separate tracks that rejoin about 35 km east, past
  Chacabuco. The walk's 20 km search didn't reach the rejoin, so it read
  Membrillar as a junction. SM-6 actually leaves SM-B at **Chacabuco**
  (shared node 0.4 km from the station), 14 km further east, and ends at
  Mayor José Orellano (Germania), where it meets SM-8.
- Ramal Chacabuco–Mayor José Orellano (also "Chacabuco–Germania"), BAP, 153 km,
  opened 1 December 1909, running about 20 km south of and parallel to the
  main line. Stations in OSM: Irala, Baigorrita, Bermúdez, Triunvirato,
  El Dorado, Günther.
- FA era: used as a diversion for *El Cuyano* when the main line was blocked
  (Wikipedia); locals say the last passenger trains ran in the 1980s
  (Plataforma14 "El atajo del B.A.P.", seen only through a search summary; the
  site blocks this environment). Today freight on Laplacette–Chacabuco only;
  OSM 70 km rail, 83 km disused.
- **Status: Unconfirmed** for 1977 (no closure date found, signs point to
  open into the 1980s). For the Junín graph it is a second-ring line, not one
  of the lines out of Junín.

### SM-5 Pergamino–Junín: both dates are right, and it was San Martín

- Two closures: **closed 1961** (Frondizi, Plan Larkin), **reopened for freight
  1964** (Illia), **closed again 1977** (arqueologiaferroviaria, Rojas FCO,
  2014; Wikipedia Rafael Obligado, Agustín Roca and Rojas (Mitre) articles).
  Rafael Obligado's "closed 1961, reopened under Illia" and Agustín Roca's
  "stopped in 1977" are the two halves of the same story. **Secondary,
  agreed by four sources.** The exact 1977 date and decree were not found, so
  a game set early in 1977 might still see it open; with no year fixed, closed
  stands.
- Railway: the nationalisation decree 32574/1948 put Junín–Pergamino in the
  Mitre, but a follow-up decree moved **Junín–Pergamino and Rufino–Venado
  Tuerto to the San Martín from 1 January 1949** (Wikipedia, "Ferrocarril
  General San Martín", citing the decrees). Rojas (Mitre) station article:
  "pertenecía al Ferrocarril San Martín". The Rojas blog gives the chain
  FCO → FCCA → FCGSM → FCGM → NCA, so a later move back to the Mitre is
  reported but undated. **San Martín under FA in 1949; whether it was moved
  back before 1977: Unconfirmed.** OSM's "FC Mitre" comes from the 1990s
  concession: the Pergamino–Rojas end went to Nuevo Central Argentino (the
  Mitre freight concessionaire).
- Loose end: Pergamino–Rojas carries NCA freight today, so either the 1977
  closure covered only Rojas–Junín or that end reopened. Not settled.
  Irrelevant to Junín: the Junín end (Junín–Agustín Roca–Rafael Obligado) is
  closed either way.

### Did FA use the SM ramal codes? Probably yes, from 1985

- A SkyscraperCity thread ("Nomenclatura de líneas y ramales ferroviarios")
  says FA's 1985 rules coded branches as `SM-` + number for the San Martín and
  `GM-` + number for the Mitre (forum post, unverified; the page blocks this
  environment, read through search summaries).
- Strong circumstantial support: OSM's only two "SM" codes on lines named
  "FC Mitre" are **SM-5 (Junín–Pergamino) and SM-9 (Rufino–Venado Tuerto:
  Tarragona, Sancti Spíritu, San Eduardo)**, exactly the two sections the 1949
  decree moved from the Mitre to the San Martín. A scheme invented by the 1990s
  concessions would have filed both under the Mitre (NCA). So the SM numbers
  follow the state railway's own assignment.
- The Belgrano and Urquiza letter codes (G, G6, CC, M; U-1) are used as the
  branch names in Spanish Wikipedia ("ramal U-1", "Ramal G6"), and Trenes
  Argentinos Cargas used "ramal SM12" in 2021.
- **Status: Secondary.** Best lead, not read: the public GitHub repository
  `arielsbecker/codigos-ramales` holds `lista-ramales-FFAA-1985.txt` (an FA 1985
  branch list) and a digitised 1964 EFEA station-code manual. The research
  session could reach only the two game repos on GitHub, so it was not opened.

## The wider network

Second ring: lines meeting the first four at their far junctions, the lines
those reach next, and the other railways within about 60 km of Junín. Lengths
are OSM track today; "Junín graph" says how each touches the first ring.

| OSM ref | Branch | Built | Open in 1977? | Evidence | Status |
|---|---|---|---|---|---|
| SM-B | Retiro–Junín (BAP main line) | 1884–86 | **Open** | Main line; *Aconcagua* to 1993 | Confirmed |
| SM-C | Junín–Rufino–Mendoza (main line) | 1886 | **Open** | Main line, freight today | Confirmed |
| SM-7 | Saforcada–Santa Isabel, 103 km | 1901–02 | **Open** | Above | Secondary |
| SM-5 | Junín–Pergamino, 88 km | 1885 | **Closed** (1977) | Above | Secondary |
| SM-6 | Chacabuco–Mayor José Orellano, 153 km; leaves SM-B at Chacabuco | 1909 | Probably open | Diversion route; passenger "into the 1980s" | Unconfirmed |
| SM-4 | Rawson–Arribeños, 132 km; meets SM-B at Rawson, crosses SM-5 8 km past Rafael Obligado, meets SM-7 at Arribeños | 1912 | **Open** | Trains until 10 March 1993 (endesvio blog, Inés Indart); never worked by ALL after concession, abandoned by 2014 | Secondary |
| SM-8 | Alberdi–Hipólito Bouchard (Buchardo), 168 km; meets SM-C at Alberdi and SM-6 at Orellano | 1903–06 | **Closed** (1976) | Wikipedia, one cited line | Secondary |
| SM-10 | Rufino–Monte Comán (via Buchardo) | — | **Open** | *El Sanrafaelino* Retiro–Junín–San Rafael; passengers to 1993 | Secondary |
| SM-11 | Villa María–Rufino, 227 km | 1890–91 | Unknown | Abandoned now, no date | — |
| SM-9 | Rufino–Venado Tuerto | — | Unknown | No source found | — |
| GM-46 | Peyrano–Wheelwright–Rastreador Fournier; joins SM-7 at Santa Isabel | 1914 | **Open** | Linked to SM-7 1954; freight today | Secondary |
| GM-5 | San Nicolás–Pergamino, 76 km | 1884 | **Closed** (Dec 1961) | Wikipedia, "clausura definitivamente" | Secondary |
| GM-8 | Victoria–Capilla del Señor–Pergamino, 206 km | 1891–94 | **Open** | Retiro–Río Cuarto passengers until 1992 | Secondary |
| GM-15 | Pergamino–Peyrano–Cañada de Gómez, 143 km | — | Probably open | NCA freight Pergamino–Peyrano today | Unconfirmed |
| G | Buenos Aires–Pergamino–Rosario (CGBA, metre gauge), 380 km | 1908 | Probably open | Passengers back to Villars 2022 "after three decades" | Unconfirmed |
| G-6 | Pergamino–Vedia (CGBA, metre), 122 km; ends beside SM-C at Vedia, no connection | 1910 | **Closed** (from 28 Oct 1961) | Wikipedia, Plan Larkin | Secondary |
| U-1 | Fátima–Salto–Rojas (Urquiza, standard gauge) | 1889–1900s | **Open** Fátima–Rojas | Last freight 1998 (citation needed) | Unconfirmed |
| U-1 | Rojas–Cuatro de Febrero | — | **Closed** | Decree 4176 of 22 May 1961 authorised closure; Plataforma14 says reopened to Sarasa, closed for good 1974; Wikipedia says lifted early 1980s | Secondary (closed by 1977 either way) |
| S-5 | Suipacha–Bayauca (Sarmiento), passes 34 km from Junín | 1907 | **Open** | Services ceased in the 1990s | Secondary |
| S-7 | Bragado–Lincoln–Villegas–Realicó | — | **Open** | Main Sarmiento western line; only Chamaicó–Bowen (far west) closed, Decree 2294/77, 5 Aug 1977 | Secondary |
| S-9 | Los Toldos–Roberts–Ojeda–Ingeniero Luiggi | 1909–10 | Unknown | No closure date; only Ojeda–Luiggi active now | — |

What it means for the graph (Tom's "active in the FA era"):

- **Out of Junín: three lines**, unchanged: SM-B, SM-C, SM-7. SM-5 closed.
- **SM-B's next junction moves**: Chacabuco (SM-6), not Membrillar. Rawson
  (SM-4) is the one after.
- **Open second-ring branches:** SM-4 and probably SM-6. SM-7 runs on past
  Arribeños to Santa Isabel and the Mitre to Rosario (GM-46), which is the
  through freight route.
- **Closed before 1977:** SM-8 (1976), G-6 (1961), GM-5 (1961), Rojas–Cuatro
  de Febrero (1961 or 1974), SM-5 (1977).

## Not found

- **The 1977 closure decree(s).** The World Bank 1979 appraisal in
  the project's `research/fa-operations/` folder gives the plan (5,000 route-km closed in 1977,
  856 km in 1978, 3,644 km in 1979) but no list. A Revista Transporte y
  Territorio paper (Benedetti 2016) says the closures came through a series
  of 1977–79 decrees. Decree 547/77 of 2 March 1977 (4,040 km closed and
  lifted plus 1,910 km closed) is named by one search summary only; not
  verified, annex not online.
- **The 1961 decrees**: 4176/61 (22 May 1961) is cited for Fátima–Rojas; the
  October 1961 closures came after the strike. No list found.
- **CNRT network tables** or an FA ramal list. The `codigos-ramales` repo above
  is the best lead.

## Sources

All read 2026-11-23.

- es.wikipedia.org: "Ferrocarril General San Martín" (1949 transfer),
  "Ramal ferroviario Saforcada-Santa Isabel", "Ramal ferroviario
  Chacabuco-Mayor José Orellano", "Ramal ferroviario Rawson-Arribeños",
  "Ramal ferroviario Alberdi-Hipólito Bouchard", "Ramal ferroviario
  Pergamino-Junín", "Ramal ferroviario San Nicolás-Pergamino", "Ramal
  ferroviario Victoria-Capilla del Señor-Pergamino", "Ramal ferroviario
  Pergamino-Cañada de Gómez", "Ramal ferroviario Peyrano-Wheelwright-Rastreador
  Fournier", "Ramal ferroviario Rufino-Monte Comán", "Ramal ferroviario Villa
  María-Rufino", "Ramal G del Ferrocarril Belgrano", "Ramal G6 del Ferrocarril
  Belgrano", "Anexo:Ramales del Ferrocarril General Belgrano", "Ramal
  Fátima-Rojas-4 de Febrero del Ferrocarril General Urquiza", "Ramal
  ferroviario Suipacha-Bayauca", "Ramal ferroviario
  Bragado-Lincoln-Villegas-Realicó-Colonia Alvear", "Ramal ferroviario Los
  Toldos-Roberts-Ojeda-Ingeniero Luiggi"; stations Agustín Roca, Rafael
  Obligado, Rojas (Mitre), Arribeños, Rastreador Fournier, Baigorrita,
  Bermúdez, Mayor José Orellano, Inés Indart, Coronel Isleño, Ascensión,
  Vedia (Belgrano), Membrillar.
- arqueologiaferroviaria.blogspot.com: "Estación Rojas (FCO)" (2014-07-09),
  "Estación Arribeños (BAP)" (2014-09-28).
- endesvio.blogspot.com: "Inés Indart (Buenos Aires al Pacífico)" (2012-07).
- Plataforma14 ("El atajo del B.A.P.", "El ramal perdido del Gran Capitán") and
  SkyscraperCity (nomenclature thread): blocked here, known only through
  search-engine summaries. Treat as leads.
- Benedetti, A. (2016), "Argentina, ¿país sin ferrocarril?", Revista
  Transporte y Territorio 15, pp. 68–85.
- World Bank (1979), Second Railway Project appraisal (in
  the project's `research/fa-operations/` folder), para. 2.05.
- OpenStreetMap, Argentina extract from download.openstreetmap.fr, fetched
  2026-11-23 (© OpenStreetMap contributors, ODbL): refs, track state, junction
  nodes.
