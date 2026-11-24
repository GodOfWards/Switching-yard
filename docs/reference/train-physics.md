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
- The locos are taken as roller bearings. **Unconfirmed**.

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
- At the game's forces (up to the RSD-35's 194 kN) the draft gear gives only
  millimetres, so the free play is what the player feels: a loco moves
  about 5 cm per car before each car starts, and a cut runs in by as much
  when the loco brakes alone.
- On FA's broad gauge a screw coupling is tightened until the buffers meet
  (see Couplers), so the 5 cm applies only to a chain link. Since #33 the
  game gives bogie cars no free play and keeps the 5 cm for two-axle cars.

## Couplers

Researched 2026-10-08; which vehicles carried which, 2026-11-24 (#33).

- **FA standardised two coupler systems for broad (1676 mm) and standard
  gauge.** Its 1982 coupler-height standard sets a **central hook**
  ("gancho central", the hook with screw link and side buffers) at 1055.5
  mm and an **automatic coupler** at 900 mm, both for 1676 and 1435 mm
  gauge. Metre gauge (804 mm) and 750 mm (660 mm) are listed with
  automatic couplers only. **Confirmed** (FAT E-726).
- **But on broad gauge the hook and screw was the coupler in service.**
  FAT MR-706 (November 1975) makes the **30 t screw coupling mandatory on
  all motive power and every new 1676 and 1435 mm vehicle**, and declares
  the older 20 t one non-standard. **Confirmed**.
- **New cars of 1975–1981** (FAT V-1527, V-1529, V-1534, V-1545) came with
  side buffers, a draw hook and a screw coupling, plus brackets or a pocket
  for a *future* automatic coupler. **Confirmed**.
- **Transition couplers** (FAT E-724, 1978; E-721, 1981): an automatic head
  that folds down to uncover a hook, so a vehicle can meet either system.
  New line locos (FAT LG-1801, 1981) were specified with one at each end,
  side buffers 930 mm off centre, and a changeover done by hand in the
  yard. Private-owner cars (FAT VP-3009, 1978) took buffers and the hook
  and screw, or a transition coupler. **Confirmed** for the specs; whether
  locos ran with the transition head fitted is **Unconfirmed**.
- **Locos in practice:** the broad-gauge GM GT22CW carried buffers and the
  hook, chain and screw coupling. **Secondary**.
- **Two-axle cars used a chain link, not the screw.** RITO art. 210: four-axle
  cars couple with the screw coupling tightened fully; two-axle cars
  "with the link chain they carry", whatever is next to them; a screw
  coupling on a two-axle car is left slack. NEFA 479 (1951) shows the
  central chain on a broad-gauge common-use car. **Confirmed**.
- **So the share, as far as found:** broad-gauge bogie cars and locos all
  on buffers and the hook with screw coupling; two-axle cars on buffers and
  the hook with a chain link; **no automatic coupler found in broad-gauge
  freight service**. The last is **Unconfirmed** (no source shows one,
  none says there were none). RITO art. 210 e, on automatic couplers, is
  FA-wide and fits metre gauge.
- **Order in a heavy train:** in trains over 20 t of tractive effort, at
  least a third of the cars must have the 30 t coupling, placed **next to
  the locomotive**, with the 20 t ones behind (MR-706 D-5). **Confirmed**.
- **How it's coupled** (MR-706 D-7, D-8): centre the screw, slacken it,
  drop the shackle over the facing hook, then **tighten until the buffer
  faces meet**. Steam-hauled freight trains were exempt from tightening.
  It never joins on impact. **Confirmed**. An automatic coupler joins on
  impact only if one knuckle is open. **Unconfirmed** here (general
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
- Coupler use, read 2026-11-24: [FAT MR-706](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_MR_706.pdf) (Nov 1975),
  [E-721](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_E_721.pdf), [E-724](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_E_724.pdf) (transition couplers),
  [LG-1801](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_LG_1801.pdf) (line locos, 1981), [VP-3009](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_VP_3009.pdf) (private cars, 1978),
  [V-1534](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1534.pdf), [V-1545](https://www.argentina.gob.ar/sites/default/files/normas_fat/FAT_V_1545.pdf);
  [NEFA 479](https://www.argentina.gob.ar/sites/default/files/subidos_tanda_2/NEFA_479.pdf) (chain coupling, 1951);
  RITO 1993 art. 210 (see [fa-yard-operations.md](fa-yard-operations.md));
  GT22CW: [leivag1991vehicles blog](http://leivag1991vehicles.blogspot.com/2021/08/984-locomotoras-general-motors-gt22-en.html?m=1) (Secondary)
