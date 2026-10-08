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

## Sources

None recorded. The figures came from the switcher research thread, whose
cited sources ([locomotives.md](locomotives.md)) cover the locos, not these
values.
