# Locomotives: reference

Which real locomotive the game's loco should model. Researched 2026-10-08.

**Decided (Tom):**
- **The loco models a GM G12 / GR12** (2026-10-08), over the Class 08 and
  SW1500, for an Argentine setting. Shipped in v0.2.1 (PR #5).

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

## Open points

- **Length.** No published length found; 14 m is a placeholder.
- **Top speed.** The real G12 is geared for the main line. The game caps it
  at 29 km/h as a yard limit, not the loco's own.
- **Minimum curve radius.** Not checked. The yard's curves are 50 m.

## Sources

- [EMD G12, Wikipedia](https://en.wikipedia.org/wiki/EMD_G12)
- [GAIA locomotive, Wikipedia](https://en.wikipedia.org/wiki/GAIA_locomotive)
- [Ferrosur Roca, Wikipedia](https://en.wikipedia.org/wiki/Ferrosur_Roca)
- [British Rail Class 08, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_08)
- [EMD SW1500, Wikipedia](https://en.wikipedia.org/wiki/EMD_SW1500)
- [ALCO RSD-16, Wikipedia](https://en.wikipedia.org/wiki/ALCO_RSD-16)
