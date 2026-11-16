# dossie

A skill for Claude Code (and compatible agents) that turns a finished code
analysis, ADR, or postmortem into a single, presentable HTML page — with a
fixed CSS/React template, interactive diagrams, severity-coded findings, and
a light/dark + EN/PT switch. The agent only ever writes a small `deck.jsx` of
data; the template is never rewritten per piece.

See [`SKILL.md`](SKILL.md) for the full reference, and
[`examples/example-analysis.jsx`](examples/example-analysis.jsx) for a
complete worked example — `dossie` analyzing its own code, three real bugs
found and fixed along the way.

## Install

Clone this repo and symlink it into your assistant's skills directory. For
Claude Code:

```bash
git clone https://github.com/gilmarlj/dossie.git ~/.claude/skills/dossie
```

If you keep skills in a personal monorepo (the way this skill's own author
does, in a separate private repo), add `dossie` as a git submodule instead and
symlink from there — see "Keeping your own fork in sync" below.

Requires Python 3 with PyYAML (`pip install pyyaml`).

## Quick start

```bash
# 1. Configure once (theme, language, output folders)
/dossie:setup

# 2. Turn a finished analysis into a page
/dossie:analysis

# 3. Package it to send
/dossie:to-zip
```

Each slash command is really just: invoke the `dossie` skill and follow the
matching file in `flows/`. If your assistant doesn't support slash commands,
tell it "use the dossie skill to build an analysis page" and point it at
`SKILL.md`.

## What's in the box

- Two themes (`slate`, `terminal`) — see `flows/new-theme.md` to extract your
  own from an installed design system's CSS custom properties.
- A component library (`assets/components.jsx`) with an interactive
  entity-relationship canvas (JointJS), annotated code blocks with real line
  numbers, and severity chips.
- Five flows: `setup`, `analysis`, `adr`, `postmortem`, `new-theme`, `to-zip`.
- Zero external runtime dependencies beyond what's loaded from CDN in the
  built page itself (React, Babel standalone, JointJS — all pinned versions).

## Keeping your own fork in sync

If you maintain Inditex-, company-, or project-specific additions on top of
this skill (an extra theme, extra house-style rules), keep those in a
separate directory alongside your checkout rather than editing this repo's
files directly — that way `git pull` here never conflicts with your local
layer. See the "Adaptar a um design system ou ecossistema específico" section
of `SKILL.md` for the pattern this repo's own author uses.

## License

MIT — see [`LICENSE`](LICENSE).
