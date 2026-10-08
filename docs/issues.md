# Issues

GitHub Issues hold pending work and designs still being worked out. If the
tracker is unreachable, say so and carry on; file what surfaced once it's back.

## Labels

Every issue carries one kind, and a state label when one applies.

| Kind | For |
|---|---|
| `mechanic` | A new rule or system, or a change to one |
| `content` | World data: tracks, sidings, cars, names, text |
| `ui` | A new way of showing or reaching existing state |
| `bug` | Something the player sees go wrong |
| `research` | A real-world fact the game needs ([reference/](reference/README.md)) |
| `process` | How the project works: docs, templates, CI |

| State | Means |
|---|---|
| `designed` | Every design call in it is Tom's and made; the body is the spec, and a pull request can be built from it without more discussion |
| `deferred` | Decided later; a comment says what would bring it back |

`designed` is applied when Tom confirms a design is done, and removed if the
scope reopens. There are no priority or size labels: the bump type
(PATCH / MINOR) goes in the body.

## Bodies

- **One template per kind** in `.github/ISSUE_TEMPLATE/`. Filing through the
  API skips GitHub's forms, so whoever files it follows the template.
- **Titles** read "Subject — elaboration". Status never goes in a title.
- **The body is the current truth; comments are history.** When scope
  changes, edit the body.
- **Facts are linked, not copied**: figures live in `docs/reference/`, calls
  Tom has made in `decisions.md`. An open `research` issue is the exception:
  findings go in its body until its pull request moves them into the folder.
- **Relations use GitHub's own links** (sub-issues, blocked-by).

## Filing and closing

- **File first, work later.** When Tom brings something up, or it turns up
  during a task, the first action is filing an issue with the best
  description to hand; a rough one is fine if it needs looking into. Only
  then is it worked on, as its own task. Don't start investigating it or
  open a thread for it just because it came up.
- **Claude files and edits issues without asking.** This is the one
  exception to "propose and wait". Don't file an issue to record what was
  shipped.
- **An issue closes through the pull request that fulfils it** (`Closes #NN`).
  An idea Tom drops for good is closed by hand as not planned, with a comment
  naming the decision.
