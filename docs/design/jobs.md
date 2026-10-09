# Jobs

A job is the work needed to carry out dispositions: a chain of tasks. It
can span the yard and the industries near it.

## Rules

- **Jobs are derived from traffic and dispositions**, not the other way
  round. Avoid: job → predetermined cars → predetermined tracks →
  reproduce an exact arrangement. Prefer: traffic → operational
  requirement → valid solutions → physical work → operational result.
- **Task kinds:** pull cars that are ready from an industry; set out cars
  at an industry; bring cars into the yard; build a consist; leave cars on
  a given track; take a consist apart; sort the yard for the next shift.
- **A job states requirements, not an arrangement.** Several solutions can
  satisfy it.
- **Each block in a requirement has an ordering level**, set by whoever
  needs the cars:
  - **exact:** A1-A2-A3, for example an industry that needs A1 at its
    first door;
  - **block:** A cars before B cars, any order inside each;
  - **none:** the cars only need to be present.
  So A2-A1-A3-A4 | B3-B1-B2 against A1-A2-A3-A4 | B1-B2-B3 is fully correct
  under block order and an invalid formation under exact order.
- **The job board** lists open jobs with due times. The player takes as
  many as they like and can hand one back. Work not taken is done
  off-screen when due.
- **The job sheet** reads as a list: a header (job, place, loco, shift,
  date, remarks); requirements grouped by task; a line per car (number,
  type and load, where it is, where it goes, notes). A line ticks itself
  when its requirement is met. Weights go on a consist page for a train
  being built.
- **Stage 1 uses a simplified form**: destination blocks on the east
  end's yard tracks (#48). It's an early-game representation, not the
  model. A stage 1 job classifies named cars onto their block tracks
  (ordering: none) with the Retiro block in block order, due at shift
  change. Exact order comes with industries (#50).
- **Yard tracks**, numbered from the main-line side (#49): 1 Retiro and
  2 Mendoza (each a block and where its departures are built), 3 arrival,
  4 local, 5 storage, 6 empties, 7 repair (bad order). The fan and
  turntable spur hold locos only; the lead and head-shunt are for
  switching, never a block.
- **Stage 2 jobs** (#49), from the [road trains](traffic.md):
  - **Break up an arrival:** its cars to their block tracks, as stage 1;
    opens on arrival, due at the next shift change.
  - **Build a departure:** every car for the train (up to the cap) on its
    track as one coupled cut, left by the loco, with nothing else in it,
    no bad-order car, the Retiro block in block order. Opens with the
    arrival before it; due at departure time. A build taken and not
    reported done by then holds the train, which leaves when it is, late.
  - **Sort the yard** stays for cars that need moving outside a train's
    jobs: repaired, unloaded or loaded cars with new waybills.
- **The consist page** of a build: a line per car (tare, load, gross,
  length) and the train's totals (cars, axles, length, tare, gross) in
  whole tonnes, as the RITO weighs a train (art. 211,
  [fa-yard-operations.md](../reference/fa-yard-operations.md)). No
  tonnage limit is checked yet.

## Open

- Stage 1 on the new basis: #48.
- When a car counts as left on its track. Stage 1 asks for it uncoupled
  from the loco and clear of the track's fouling point (implementation
  choices, retunable, until decided).
- Which destinations make up the Retiro block, and their order. Stage 1
  uses O'Higgins, Membrillar, Retiro from the ladder end (content,
  retunable).
- Industry work: #50.
