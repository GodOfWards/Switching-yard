# Locomotives: reference

Which real locomotive the game's loco should model. Researched 2026-10-08.

**Decided (Tom):**
- **The yard engine is an ALCO RSD-35** (2026-11-24, #117), replacing the
  G12: no G12 ever ran on the San Martín. Figures estimated, Unconfirmed;
  see [below](#alco-rsd-35-the-yard-engine).
- **Through freights are headed by the RSD-16** (2026-11-24, #117), the
  San Martín's main-line loco, replacing the G12 there too; so are
  Retiro's road trains (#78).
- ~~The loco models a GM G12 / GR12~~ (2026-10-08, PR #5, v0.2.1);
  superseded by the RSD-35.

**Status:** the specs are **Secondary** (Wikipedia). Power at the rail is
**Unconfirmed**, an estimate; a builder's data sheet would confirm it.

## Candidates

| | Game before v0.2.1 | BR Class 08 | EMD SW1500 | GM G12 / GR12 |
|---|---|---|---|---|
| Mass | 80 t | 50 t | 112 t | 109 t |
| Max pull | 160 kN | 160 kN | ~188 kN continuous | 187 kN |
| Engine | | | ~1,100 kW | 977 kW (~930 kW in some sources) |
| Power at rail | 400 kW | ~195 kW (estimate) | ~900 kW | ~780 kW (estimate: engine less a fifth) |
| Top speed | 29 km/h | 24 km/h | road speeds | road speeds |
| Length | 14 m | 8.9 m | 13.6 m | not found; the game uses 14 m |
| Axles | | 0-6-0 | Bo-Bo | Bo-Bo |

- **Class 08 (UK).** A true yard shunter: short, slow, already close to the
  game's old numbers. The best fit for a small yard, but not Argentine.
- **SW1500 (US).** A road-capable switcher, heavy and powerful for a small
  yard.
- **GM G12 / GR12 (Argentina).** A road switcher. The Sarmiento ran about
  85 of them on broad gauge (1676 mm). Same class of machine as the SW1500.
- **GAIA (Italian-Argentine).** 280 built, 92 t, 770–970 kW. Mostly a
  passenger and freight loco.

No dedicated Argentine shunter with published numbers turned up. Argentine
yards seem to have been worked mostly by general-purpose locos. Ferrosur
Roca reports 15 shunters but doesn't name the models.

## ALCO RSD-35 (the yard engine)

Researched 2026-11-24 for #116; built in #117. How it pulls, heats and
burns fuel: [diesel-traction.md](diesel-traction.md).

### Which loco switched Junín

- **No G12 of any wheel arrangement is recorded on the San Martín.** FA's
  G12s were the Sarmiento's: 25 A1A-A1A and 60 C-C GR12
  ([Wikipedia](https://en.wikipedia.org/wiki/EMD_G12);
  [thedieselshop.us](https://thedieselshop.us/FerroSanMartin.HTML)) —
  Secondary. The game's old Bo-Bo G12 was a game choice, not history.
- Steam still shunted the broad gauge around 1977; its 128 shunting locos
  were scrapped by 1981 (World Bank 1979, Second Railways Project SAR,
  Table 2.3) — Confirmed. 130 Cockerill locotractores came 1979–81, 12 of
  them to the San Martín (Museo Astillero Río Santiago) — Secondary;
  nothing places one at Junín.
- The San Martín's 70 MLW-built **RSD-35s** were its light branch-and-local
  loco; post-FA photos show them shunting and stabled at Junín depot
  (railpictures.net 278808, 231001; Latin Tracks 16, 2005) — Secondary,
  post-FA. **Not found:** which engine worked Junín in any FA year.

### Figures

| | RSD-35 | Game | Status |
|---|---|---|---|
| Built | 110, 1961–63, ALCO/MLW; 70 San Martín, 40 Belgrano ([es.wikipedia](https://es.wikipedia.org/wiki/ALCO_RSD-35)) | | Secondary |
| Weight | 79 t, C-C, all six axles driven | 79 t | Secondary |
| Engine | 6-cyl inline ALCO 251; 1,200 hp (es.wikipedia) or 1,300 hp (the 1961 order, Noticias con Enfoque) | 1,200 hp (895 kW) | Secondary, conflict |
| Power at the rail | — | 716 kW: the engine less a fifth, as for the G12 | Assumed |
| Starting pull | not found; Renfe 313 (its sister, 84 t) 193 kN, 23.5 % | 194 kN, 25 % of 79 t | Unconfirmed |
| Continuous pull | not found | 120 kN (14–17 % of weight), at ~21 km/h by power / pull | Unconfirmed |
| Motors | 6 × GE 761 | | Secondary |
| Top speed | 105 km/h | yard limit 29 km/h | Secondary |
| Fuel, N8 | 1,200 hp × the 251's 157.6 g/hp·h ÷ 0.84 kg/L | 225 L/h | Unconfirmed |
| Fuel, idle | C425 scaled by cylinders, 7–9 L/h | 8 L/h | Assumed |
| Tank | not found; the G12 carries 2,840 L | 2,500 L | Assumed |
| Length | not found | 14 m, the G12's placeholder kept | Assumed |
| Paint | not found for the RSD-35 | FA yellow-orange and red, as the RSD-16 | Unconfirmed |

On the switcher duty cycle (diesel-traction.md) the game's figures burn
about 26 L/h, 210 L a shift: a tank lasts about 4 days.

**Nearest documented relative:** Renfe 313 = ALCO DL535S/RSD-39, 6-251D,
1,370 hp, 83.9 t, broad gauge 1,668 mm, 40 in wheels, TE 193.25 kN,
120 km/h ([Wikipedia](https://en.wikipedia.org/wiki/Renfe_Class_313)) —
Secondary.

## ALCo RSD-16 (the *Aconcagua*'s loco)

Researched 2026-11-24 for #77.

**Decided (Tom, 2026-11-24):** the RSD-16 is the game's second loco type,
at the head of the *Aconcagua*. The game drives it; the player never does.

| | ALCo RSD-16 | Status |
|---|---|---|
| Built | Schenectady, 1957–59; 130 for the Sarmiento, Mitre and San Martín | Secondary |
| Mass | ~108 t | Secondary |
| Length | 17.06 m (55 ft 11¾ in); the game uses 17.1 m | Secondary |
| Axles | Co'Co' (6) | Secondary |
| Engine | ALCo 251-B, ~1,950 hp | Secondary |
| Top speed | 122 km/h | Secondary |
| Gauge | 1,676 mm | Secondary |
| FA livery | yellow-orange body, red lower band, dark roof, black and yellow chevrons on the pilot (one photo; see [aconcagua.md](aconcagua.md)) | Secondary |

The game draws it from above in yellow-orange with the red band showing
along each side. Its mass and length matter only to its length on the
main; the game doesn't model its pull.

The RSD-16 also heads the through freights and Retiro's road trains (#117). The Diesel Shop's
DL540 tractive figures (361 / 349 kN) are the US RSD-12's, not the
Argentine RSD-16's; 108 t is favoured over its 131.5 t (#116, third pass).

## Open points

- **RSD-35 length, pull, gearing and tank.** None found; best lead an
  RSD-35 maintenance manual ("Mantenimiento Locomotora ALCO RSD-35",
  Scribd).
- **Top speed.** The RSD-35 is geared for the road. The game caps it at
  29 km/h as a yard limit, not the loco's own.
- **Minimum curve radius.** Not checked. The yard's curves are 50 m.

## Sources

- [EMD G12, Wikipedia](https://en.wikipedia.org/wiki/EMD_G12)
- [GAIA locomotive, Wikipedia](https://en.wikipedia.org/wiki/GAIA_locomotive)
- [Ferrosur Roca, Wikipedia](https://en.wikipedia.org/wiki/Ferrosur_Roca)
- [British Rail Class 08, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_08)
- [EMD SW1500, Wikipedia](https://en.wikipedia.org/wiki/EMD_SW1500)
- [ALCO RSD-16, Wikipedia](https://en.wikipedia.org/wiki/ALCO_RSD-16)
- [ALCO RSD-35, es.wikipedia](https://es.wikipedia.org/wiki/ALCO_RSD-35)
- [Renfe Class 313, Wikipedia](https://en.wikipedia.org/wiki/Renfe_Class_313)
