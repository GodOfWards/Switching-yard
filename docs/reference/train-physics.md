# Train physics: reference

Real-world figures for resistance and braking, to compare against the
game's tuned values. Researched 2026-10-08.

**Decided (Tom):**
- **Real drag per car** (2026-10-08, #25), replacing the tight yard
  setting: a loaded box car rolls about 255 m from 10 km/h, an empty one
  about 145 m.
- **Real curve drag** on the Junín curves (2026-10-08, #16).
- **Air not connected by default**; the train brake works only on cars
  with their air connected and charged (2026-10-08, #17).
- **Hand brakes on every car** (2026-10-08, #15).
- **Slack in every coupling** (2026-10-08, #26): free play, then a stiff
  draft gear.

**Status:** marked per figure. **Secondary** figures come from patents,
forum posts quoting AAR material, or a railroad's own rule; an AAR or FA
standard would confirm them.

## Rolling resistance

Updated 2026-10-08.

- The **Davis equation**'s constant part, in lb per short ton with w the
  tons per axle: **plain bearings `1.3 + 29/w`**, **roller bearings
  `1.3 + 18/w`** (AAR RP-548). Put another way: 1.3 lb per ton of weight,
  plus a fixed 29 lb (plain) or 18 lb (roller) per axle. The speed terms
  add little below 30 km/h. **Secondary**.
- Worked through, with plain bearings: a **loaded 60 t box car about
  0.0015 of its weight**, rolling about **255 m** from 10 km/h; an **empty
  25 t one about 0.0028**, about **145 m**. Empties stop sooner.
- FA-era freight cars were likely mostly on plain bearings. **Unconfirmed**.
- The G12 is taken as roller bearings. **Unconfirmed**.

## Starting resistance

- About **0.01 of weight** for plain bearings when cold, and **0.0025** for
  roller bearings. **Unconfirmed**.

## Curves

Researched 2026-10-08.

- About **0.7–0.8 lb per short ton per degree of curve**; the game uses
  0.7, the figure with a source. **Secondary**.
- A curve's degree, by the 100 ft chord definition, is about
  **1746.4 / R** for a radius R in metres.
- So **~0.004 of weight at 150 m** and **~0.0075 at 82 m**, the Junín
  curves: three to five times a loaded car's drag on straight track.

## Brakes

- **Net braking ratio** at full service, as AAR sets it for cars built
  today: **loaded 8.5–14 %** of weight, **empty 15–38 %**. The shoe force
  is fixed, so empties brake harder for their weight. **Secondary**.
- The game's train brake, 0.1 of weight at full on every braked vehicle,
  sits inside the loaded range. Retunable.
- In real switching the air hoses between cars often **aren't connected**,
  so a move stops on the loco brake alone. Charging a real brake pipe takes
  minutes; the game takes 15 s. **Unconfirmed** as an FA rule.
- FA standards cover **vacuum brake** equipment for freight cars (FAT
  V-1412, V-1413), so some FA stock was vacuum braked. Which, and when, is
  **Unconfirmed**. The game models air.

## Hand brakes

- **One per car** (US rule, 49 CFR 231). **Secondary**.
- A railroad rule quoted for cars left standing on a yard track: about
  **10 % of the cut plus one**. **Unconfirmed**.
- The game's hand brake force is a guess: a tenth of a loaded car's weight
  on the shoes at a shoe friction near 0.3, about 17.7 kN. **Unconfirmed**.

## Slack

Researched 2026-10-08.

- About **2 in (5 cm) of free play** between two freight cars' couplers.
  **Secondary** (US patents; Type E couplers alone are nearer 25/32 in, so
  the 2 in includes worn parts and the draft gear's own play).
- **Draft gear** (AAR M-901-G) is rated at about **2¾–3¼ in (7–8 cm) of
  travel under a 500,000 lb (2.2 MN) buff load**, and "goes solid" past
  it. **Secondary** (US patents). The game treats it as a linear spring of
  2.2 MN over 7.5 cm, about 30 MN/m, damped at half of critical (an
  estimate; friction draft gears soak up much of an impact).
- At the game's forces (up to the G12's 187 kN) the draft gear gives only
  millimetres, so the free play is what the player feels: a loco moves
  about 5 cm per car before each car starts, and a cut runs in by as much
  when the loco brakes alone.

## Couplers

Researched 2026-10-08.

- **FA ran two coupler systems on broad (1676 mm) and standard gauge.**
  Its 1982 coupler-height standard sets a **central hook** ("gancho
  central", the hook with screw link and side buffers) at 1055.5 mm and an
  **automatic coupler** at 900 mm, both for 1676 and 1435 mm gauge. Metre
  gauge (804 mm) and 750 mm (660 mm) are listed with automatic couplers
  only. **Confirmed** (FAT E-726).
- So in the FA era both were in service. Which cars and locos carried
  which, and in what share, is **Unconfirmed**: a FA rolling-stock list or
  a NEFA drawing per car type would settle it.
- A hook-and-screw coupling never joins on impact: someone drops the link
  over the hook and tightens the screw by hand. An automatic coupler joins
  on impact only if one knuckle is open. **Unconfirmed** here (general
  railway practice, no source recorded).

## Sources

- Davis and AAR RP-548 forms: [Trains forum, train resistance](https://forum.trains.com/t/train-resistance-for-oltmannd/140048);
  [FRA/DOT report](https://rosap.ntl.bts.gov/view/dot/79083/dot_79083_DS1.pdf)
- Curves, 0.7 lb/ton/degree: [Trains forum](https://cs.trains.com/trn/f/741/t/220779.aspx?page=1)
- Braking ratios: [US patent 5927822](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5927822);
  [Railinc UMLER release notes](https://public.railinc.com/sites/default/files/documents/UmlerReleaseNotes120717.pdf)
- Hand brakes: [49 CFR 232.103](https://www.govinfo.gov/content/pkg/CFR-2006-title49-vol4/html/CFR-2006-title49-vol4-sec232-103.htm);
  [Trains forum](https://cs.trains.com/mrr/f/13/t/292780.aspx)
- Slack and draft gear: [US patent 6446820](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6446820);
  [US patent 10189488](https://patents.justia.com/patent/10189488)
- Vacuum brakes: [CNRT FAT specifications](https://www.argentina.gob.ar/cnrt/especificaciones-fat)
- Couplers: [FAT E-726, Alturas de enganches de vehículos en Ferrocarriles
  Argentinos, Nov 1982 (CNRT copy)](https://argentina.gob.ar/sites/default/files/normas_fat/FAT_E_726.pdf)
