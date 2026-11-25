# Diesel-electric traction: reference

How a DC diesel-electric pulls, slips, heats its motors and burns fuel, and
the yard engine's figures. Researched 2026-11-24 (#116, three passes); full
notes in the project's `research/traction/junin-switcher-and-fuel-2026-11-24.md`.

**Decided (Tom, 2026-11-24, #117):**
- **The yard engine is an ALCO RSD-35**, replacing the G12, with figures
  estimated from its weight and its sister, the Renfe 313, marked
  Unconfirmed. See [locomotives.md](locomotives.md#alco-rsd-35-the-yard-engine).
- 8 notches plus idle; dry rail always for now; a protective trip at the
  heat limit; a fuel gauge and a "Fuel the loco" task; no maintenance yet.
  The rules: [../design/traction.md](../design/traction.md).

## How a DC diesel-electric pulls

From EMD's booklet *Pull: Tractive Effort of Diesel Locomotives*
([utahrails.net](https://utahrails.net/pdf/EMD_Pull_Tractive-Effort-of-Diesel-Locomotives.pdf)).
**Confirmed** (builder's own publication; worked figures for an F3).

- Above the adhesion limit, pull follows constant power:
  "Tractive Effort (in pounds) = Engine Horsepower × 308 / Miles per Hour".
- **Thermal limit:** motor current makes heat; there is a continuous
  current, and a minimum continuous speed where full-throttle current falls
  to it. Below it, current exceeds the thermal limit; the cab ammeter warns
  the engineer.
- **Adhesion:** "usable adhesion factor may vary from 25% to as low as 5%.
  With very favorable conditions or the addition of sand … as much as 35%.
  A conservative adhesion factor of 22% …".
- F3 at 62:15: starting pull 22.4 % of weight, continuous 14.0 %.

## Throttle notches

- 8 power notches plus idle on EMD and ALCO stands of the period.
  **Secondary** (standard practice).
- **Power and fuel per notch**, NSW EPA test of an EMD 16-645E3B
  ([ABMARC for NSW EPA](https://www.epa.nsw.gov.au/sites/default/files/diesel-locomotive-emissions-report.pdf),
  Appendix A) — **Confirmed** for that engine. Fuel, L/h: idle 14.5, N1 55,
  N2 90, N3 179, N4 245, N5 309, N6 400, N7 538, N8 618. Power share, from
  fuel share over relative fuel per kWh: **7, 13, 27, 38, 48, 64, 87,
  100 %**. Applying the shape to an ALCO 251 is **Assumed**: no 251 notch
  table was found. A 12-567 forum table (TrainOrders 2006, Unconfirmed)
  gives fuel shares within a few points of it.
- Pull cap per notch at low speed: **Assumed** starting pull × √share
  (N1 ≈ 26 %, N4 ≈ 62 %), until a notch-current curve turns up.

## Traction motor ratings

**Unconfirmed** (forum transcriptions of cab plates,
[RyPN](https://rypn.org/forums/viewtopic.php?f=1&t=47437)).

- EMD D37 (F9): continuous 900 A; 1 h 925; ½ h 970; ¼ h 1,065; 10 min
  1,140; 5 min 1,275. As ratios of continuous: 1.03, 1.08, 1.18, 1.27,
  1.42.
- The ratings apply "only when operating at throttle No.8 engine speed.
  These values decrease as engine speed and cooling air is decreased"
  (blowers are engine-driven). "Do not hold the train at standstill …
  with the brakes applied and the throttle open for power."
- No GE 761 (RSD-35) plate found.

## Fuel

- **Switcher duty cycle**, US EPA,
  [40 CFR 1033.530](https://www.law.cornell.edu/cfr/text/40/1033.530) —
  **Confirmed**: idle 59.8 % of the time; N1 12.4, N2 12.3, N3 5.8, N4 3.6,
  N5 3.6, N6 1.5, N7 0.2, N8 0.8 %.
- ALCO 251 full-load fuel: 157.6 g/hp·h, WDM-2 load-box test
  ([IRIMEE](https://rskr.irimee.in/sites/default/files/Alco-Load%20box%20testing,HP,SFC.pdf))
  — **Confirmed** for that engine.
- Idle: ALCO C425 (16-251C) ~5.0 gal/h (NYSERDA, search summary only) —
  **Unconfirmed**.
- G12 tank 2,840 L ([Wikipedia](https://en.wikipedia.org/wiki/EMD_G12)) —
  **Secondary**.
- No FA rule for shutting diesels down when idle was found; RITO art. 290
  is written for steam. US practice idled for hours. **Assumed: the
  switcher idles all shift.**
- **Where Junín fuelled:** archive plans show underground oil reserve tanks
  (c. 1950) beside the turntable, today the "Estación de Servicio Junín"
  that maintains the San Martín's freight locos
  ([Montecelli, Yuln & Carrizo 2017](https://www.redalyc.org/pdf/748/74853485011.pdf),
  pp. 103–107) — **Secondary**. Diesels fuelling at the same spot is
  **Unconfirmed**. How often: not found.

## Inspection

**Confirmed** for the US only:
[49 CFR 229.21](https://www.law.cornell.edu/cfr/text/49/229.21), a daily
inspection with a written report;
[229.23](https://www.law.cornell.edu/cfr/text/49/229.23), periodic
inspection at most every 92 days. FA's own practice: not found. Not
modelled (#117: no maintenance yet).

## The game's figures

| | Game | Rests on | Status |
|---|---|---|---|
| Notch power shares | 7, 13, 27, 38, 48, 64, 87, 100 % | EMD 16-645 test | Assumed for the 251 |
| Notch pull cap | starting pull × √share | none | Assumed |
| Load build-up | within 5 % in ~4 s up, ~1 s down | none | Assumed |
| Adhesion, dry / sanded | 0.25 / 0.35 at a stand | EMD booklet | Confirmed (range) |
| Adhesion against speed | × μ(v) / μ(0), Curtius–Kniffler's shape | Curtius & Kniffler 1950 | Secondary curve, Assumed scaling |
| Slip | load drops to 60 % of the grip, held until notched down or sanded | none | Assumed |
| Sand box | 20 min of sanding; refilled with fuel | none | Assumed |
| Motor heat time constant | 10 min | fitted to the D37 plate (5 min at 1.42×, 15 min at 1.18×) | Assumed for the GE 761 |
| Blower cooling | 1 in N8, 0.5 at idle | EMD manual (ratings fall with engine speed) | Assumed |
| Trip / reset | heat 1 / 0.8 | Tom, 2026-11-24 | Decided |
| Fuel per notch | share of N8's burn: 55, 90, 179 … 618 / 618 | EMD 16-645 test | Assumed for the 251 |
| Low fuel | a quarter tank | none | Assumed |
| Fill rate | 150 L/min | none | Assumed |
| Run dry | engine stops; fuel brought out 1 h later | none | Assumed |

The model's own short-time times from cold (heat = r²(1 − e^(−t/τ))):
5 min at 1.59×, 10 min at 1.26×, 15 min at 1.13×, 30 min at 1.03×; the
load meter marks these, not the D37 plate's.

**Adhesion falls with speed** (Tom, 2026-11-24): Curtius and Kniffler's
curve for dry rail, μ = 0.161 + 7.5 / (v + 44), v in km/h (Curtius &
Kniffler, *Elektrische Bahnen*, 1950; as restated in railway traction
texts) — **Secondary**. Its value at a stand (0.33) is a peak, above EMD's
usable 0.25, so the game takes only its shape: grip = 0.25 (0.35 sanded) ×
μ(v) / μ(0), about 95 % at 5 km/h, 90 % at 10 km/h, 83 % at 21 km/h
(**Assumed**, retunable). With it, the RSD-35's starting pull (exactly the
dry grip at a stand) is more than the grip once moving: in checks with a
heavy drag, N8 slipped at about 5 km/h and N7 at about 8 km/h, N6 didn't,
and sand stopped it. A light loco gets away before its load builds, and
doesn't slip. Weight transfer off the leading axles is not modelled.

## Open

- RSD-35 tractive effort, gearing, length and tank (best lead: "Mantenimiento
  Locomotora ALCO RSD-35" on Scribd).
- ALCO 251 notch table; GE 752/761 short-time ratings.
- FA fuelling interval; FA loco inspection practice.
- Which engine actually worked Junín in a given year; where the San Martín's
  12 Cockerill locotractores were based.
