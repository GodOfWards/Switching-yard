# FA freight cars: reference

Load limits, tares and markings of Ferrocarriles Argentinos broad-gauge
(1676 mm) freight cars, for the game's cars. Researched 2026-10-08 (#18, #54).

**Status:** load limits and some tares are **Confirmed**, read on FA's own
technical specifications (FAT), hosted by CNRT. **Lengths are not found**:
they are in the NEFA drawings each FAT points to, which weren't read. Car
body colours per type are in NEFA 560–562, also unread. Open gaps: #54.

## Load limits and tares

| Kind | Load limit | Tare | Source | Status |
|---|---|---|---|---|
| Vagón borde alto (high-side gondola) | 60 t | at most 20.0 t ± 0.2, bogies included | FAT V-1529, July 1977 | Confirmed |
| Vagón borde alto, broad and standard gauge | 59 t | — | FAT V-1527, May 1975 (CNRT's index lists it as 50 t; the document says 59) | Confirmed |
| Tolva granero (grain hopper) | 58 t | — | FAT V-1539 (title, on CNRT's index) | Confirmed |
| Tolva cubierta para cereal a granel | 50 t | — | FAT V-1500 (title) | Confirmed |
| Tolva para cemento a granel | 60 t | — | FAT V-1519, June 1974 | Confirmed |
| Tolva pedrero (ballast hopper) | 59 t | body 13.4 t, without bogies | FAT V-1530, May 1987 | Confirmed |
| Plataforma for three 20 ft (1C) containers | 61 t | at most 19.0 t, bogies included | FAT V-1520, December 1989 | Confirmed |
| Vagón mixto, rails and containers | — | 19.5 t ± 0.5, two bogies of about 4.25 t each | FAT V-1545, October 1981 | Confirmed |
| Vagón tanque | 60 m³ tank | — | FAT V-1548 (title: frame for a 60 m³ tank) | Confirmed |
| Vagón cubierto todo uso, broad gauge | 50 t | — | A web search summary of the NEFA drawing index; not seen on the page | Unconfirmed |

A broad-gauge bogie, as used under these cars, weighs about 4.25 t (FAT
V-1545), so a bogie car's tare is its body plus about 8.5 t.

## Numbering and marking

From FAT MRe-2002, "Marcado unificado de vehículos de carga", June 1988,
which applies the March 1971 recoding and renumbering of FA's wagons.
**Confirmed**.

- **An 11-digit code**, painted in two rows of six columns:
  - first row: **type** and **sub-type** (traffic code, NEFA 958), an
    **operating** digit (speed, gauge change, rack and mountain working;
    NEFA 956), and the **mechanical class and sub-class** (metal,
    part-metal or wooden; NEFA 957);
  - second row: the **car number**, five digits, then a **check digit**.
- **Car numbers by gauge:** 1000–7999 standard (1435 mm), 8000–39999 metre
  (1000 mm), **40000–99999 broad (1676 mm)**.
- The number is also painted near the top right of both ends, and punched
  into the frame's right-hand ends.
- A card holder for the **destination card** (ficha de destino) sits on the
  side (NEFA 410).
- **Colours:** FAT V-1520 (1989) gives a **black frame** and **white
  lettering**. Body colours per car kind are in NEFA 560 (tank cars), 561
  (box cars) and 562 (open cars), unread.
- The numbers' shapes and the standard letters are NEFA 938 and 674; the
  layout per kind is NEFA 543 (box), 544 (high side), 547 (tank), 548
  (flat).

The type codes themselves (NEFA 958) weren't read, so the game shows the
line initials, the number and the Spanish kind name, with no type code.

## In the game

What `index.html` uses, and where it comes from. **Estimated** values are
Unconfirmed and retunable.

| Kind | Length over couplers | Tare | Load limit |
|---|---|---|---|
| Vagón cubierto | 15.5 m, estimated | 21 t, estimated | 50 t, Unconfirmed (above) |
| Tolva cerealera | 15 m, estimated | 21 t, estimated | 58 t, FAT V-1539 |
| Borde alto | 14 m, estimated | 20 t, FAT V-1529 | 60 t, FAT V-1529 |
| Plataforma | 19.5 m, estimated from three 6.06 m containers | 19 t, FAT V-1520 | 61 t, FAT V-1520 |
| Vagón tanque | 14 m, estimated | 21 t, estimated | 50 t: 60 m³ of gasoil at about 0.84 t/m³, derived |

- A loaded car carries its full load limit, so a loaded car weighs 71–80 t
  and an empty one 19–21 t. The game's earlier box cars were 60 t loaded
  and 25 t empty, the figures in [train-physics.md](train-physics.md)'s
  worked example.
- Cars carry the initials of one of the four broad-gauge lines (FCGSM,
  FCDFS, FCGBM, FCGR); Junín is San Martín, so most are FCGSM. Which
  numbers go to which kind is the game's, not FA's.

## Sources

- [Especificaciones FAT, CNRT](https://www.argentina.gob.ar/cnrt/especificaciones-fat): the index of FA's technical specifications, with titles and capacities.
- [FAT V-1520](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1520.pdf), [FAT V-1527](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1527.pdf), [FAT V-1529](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1529.pdf), [FAT V-1530](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1530.pdf), [FAT V-1545](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1545.pdf): read 2026-10-08.
- [FAT MRe-2002, marcado unificado](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_MRe_2002.pdf): read 2026-10-08.
- [Planos NEFA, CNRT](https://www.argentina.gob.ar/cnrt/planos-nefa): drawing titles (NEFA 543–562, 674, 938, 956–958).
- V-1500, V-1501, V-1502, V-1539, V-1546, V-1547 and V-1548 didn't download (the server returned a page instead of the PDF).
