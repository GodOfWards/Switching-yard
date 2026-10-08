# Switching Game

A top-down railway switching game: one self-contained file, `index.html`, no
build step, no dependencies. Open it in a browser to run it.

## Rules that bind

- **Mobile first, portrait first.** The target is a phone held upright;
  landscape and desktop must still work. Touch targets are thumb-sized.
- **Nothing is edited, committed or pushed without being asked.** A question
  is a question: propose and wait.
- **Design decisions are Tom's; implementation choices are made and named.**
  When unsure which it is, ask. Flag judgment calls as retunable.
- **Section layout lives in the `ARCHITECTURE` comment** at the top of the
  script. No document restates it.
- **Content, mechanics and rendering stay separate.** A new siding or yard
  touches WORLD DATA only; rendering never holds rules.
- **Identity is an id string, never an array index.**
- **One source of truth**: a game rule (speed, rate, distance) gets a named
  constant in CONFIG, written as its derivation when derived.
- **Simulation runs on the fixed step** (`step(dt)`), never per frame, so
  behaviour doesn't depend on frame rate.
- **Changes to the saved shape change `SAVE_KEY`** once saving exists.
- **Facts are looked up in `docs/reference/` first.** Anything researched
  lands there in the same pull request, dated, sourced and with a status;
  Tom's design calls go in `docs/decisions.md`. → `docs/reference/README.md`

## The wrap

Work lands through a pull request from a branch, never a commit to `main`.

**A version number is picked only when Tom confirms the merge**, so two
pull requests open at once never claim the same one.

- While open, a pull request that changes `index.html` leaves
  `GAME_CONFIG.VERSION` and `CHANGELOG.md` alone. It drafts its changelog
  entry in the description's **Changelog** section and declares its bump
  type up front, but never the number: PATCH for fixes and content, MINOR
  for a new mechanic or saved state, MAJOR only when Tom says so.
- Once Tom confirms the merge, one last commit on that branch merges `main`
  in, bumps `GAME_CONFIG.VERSION` from the version on `main`, and adds the
  drafted entry to `CHANGELOG.md` under it. Then it merges.
- A pull request that doesn't change `index.html` gets no version.
