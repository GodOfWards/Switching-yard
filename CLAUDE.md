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

## The wrap

Every pull request that changes `index.html` bumps `GAME_CONFIG.VERSION`
(PATCH for fixes and content, MINOR for a new mechanic or saved state) and
adds a `CHANGELOG.md` entry. Work lands through a pull request from a
branch, never a commit to `main`.
