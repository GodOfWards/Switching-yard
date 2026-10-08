# Train physics: reference

Real-world figures for resistance and braking, to compare against the
game's tuned values. Researched 2026-10-08.

**Decided (Tom):**
- **Drag uses the tight yard setting** (2026-10-08): a 10 km/h cut rolls
  about 60 m, not the real 200–400 m. Retunable as the yard grows.

**Status:** every figure here is **Unconfirmed**: general railway values
with no source recorded. A rolling-resistance study (Davis-type
coefficients) or an AAR or FA braking standard would confirm them.

## Rolling resistance

- Modern roller-bearing freight cars have drag of about **0.001–0.002 of
  their weight**.
- At that drag, a cut released at 10 km/h rolls **200–400 m**, longer than
  the game's yard.
- The game rolls it about 60 m instead (see Decided above). It's one number,
  `CUT_ROLL_DISTANCE`. Realistic drag would call for hand brakes or very
  careful speeds, and suits a bigger yard.

## Starting resistance

- The game's 0.012 of weight is a **plain-bearing** figure.
- Modern roller-bearing cars need about **0.0025**.

## Brakes

- The game's train brake, 0.1 g at full, is about **twice** what a real
  freight train gets in a service application.
- In real switching the air hoses between cars often **aren't connected**,
  so a move stops on the loco brake alone. With a heavy cut behind the loco
  that makes braking a skill. Not built; a possible mechanic and Tom's call.

## Curves

- Real stock slows more on a tight curve. The game has no curve drag yet;
  adding it would be a new rule and is Tom's call.

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

- Couplers: [FAT E-726, Alturas de enganches de vehículos en Ferrocarriles
  Argentinos, Nov 1982 (CNRT copy)](https://argentina.gob.ar/sites/default/files/normas_fat/FAT_E_726.pdf)

Otherwise none recorded. The figures came from the switcher research thread, whose
cited sources ([locomotives.md](locomotives.md)) cover the locos, not these
values.
