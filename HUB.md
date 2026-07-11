# DatLearn — how this space works

A personal, multi-topic learning workshop built on the `/teach` skill.

The `teach` skill treats one directory as **one** teaching workspace (one mission per
workspace). DatLearn adapts that into a **hub of many topics**: the root is a home page,
and each topic gets its own full teach workspace in a subfolder.

## Layout

```
DatLearn/
├── index.html            ← hub home page: cards for every topic
├── HUB.md                ← this file
├── assets/               ← shared design system (reused by ALL topics)
│   ├── course.css        ← editorial / Tufte look, light+dark, print-friendly
│   ├── theme.js          ← shared light/dark toggle
│   └── quiz.js           ← shared retrieval-practice quiz engine (many per page)
└── <topic>/              ← one full teach workspace per topic
    ├── index.html        ← the topic's landing page (lessons + reference)
    ├── MISSION.md        ← WHY the user is learning it (the compass)
    ├── RESOURCES.md      ← high-trust sources, cited by lessons
    ├── NOTES.md          ← teaching preferences & plan
    ├── lessons/          ← 0001-*.html, incrementing — the unit of teaching
    ├── reference/        ← printable cheat-sheets & glossaries
    ├── learning-records/ ← 0001-*.md — what the learner has demonstrably learned
    └── assets/           ← topic-specific components (rare; prefer /assets)
```

## Current topics

| Topic | Mission | Status |
|-------|---------|--------|
| [AdMob](admob/index.html) | Master mediation & the revenue-vs-retention balance (Android + iOS) | 1 lesson live |
| [Strength](strength/index.html) | Still lifting, still strong, in twenty years — progression without grinding | 1 lesson live |
| [LLM Foundations](llm/index.html) | Open the black box by building one, on this Mac. The gap to GLM is a number, not a mystery | 2 lessons live |
| [Baldur's Gate 3](bg3/index.html) | Finish a first playthrough on Balanced without hitting a wall — by deleting the DOS2 reflexes BG3 punishes | 2 lessons live |

### Topic colours

Topic chips (`--chip`, defined in `index.html`) must clear **4.5:1 contrast in both themes** — they
are rendered as kicker *text* — **and** sit **≥ 40° apart in hue**, or two topics read as one on the
grid. Both properties are measured, never guessed. Current: admob 167°, strength 232°, llm 295°,
bg3 39°.

The wheel is now crowded. A fifth topic must land ≥ 40° from **all four**, which leaves exactly two
usable arcs: **79–127°** (yellow → green) and **335–359°** (crimson). The 167→232 and 232→295 gaps
are 65° and 63° wide and therefore admit *nothing* — a chip in either would sit < 40° from both
neighbours. Computed, not eyeballed; recompute when you add the fifth.

## Adding a topic

Run `/teach <subject>` (or just ask). I will:
1. Interview you for the **mission** — the real-world reason — and write `<topic>/MISSION.md`.
2. Research **high-trust sources** and record them in `<topic>/RESOURCES.md`.
3. Build the topic's `index.html` and a first short lesson, reusing `assets/course.css`.
4. Add a card to the hub `index.html`.

## Design system (shared, don't fork it)

One stylesheet drives everything so the whole workshop reads as a single course:
Newsreader (serif reading) + Public Sans (labels) + JetBrains Mono (figures), a warm-paper /
ink palette with a rust accent, per-topic color chips, full light + dark, and print styles for
the reference docs. Reusable components in `course.css`: `.lesson-body` + `.sidenote`, `.callout`,
`.quiz`, `.pull`, comparison tables, `.glossary`, `.topic-card`. **Reuse these before adding CSS.**

Behaviour lives in two shared scripts: `assets/theme.js` (light/dark toggle) and `assets/quiz.js`
(wires every `.quiz` on a page, so a lesson can hold several drills). New lessons should link
`quiz.js` rather than inlining quiz logic — the AdMob lessons predate it and each inline their own
single-quiz script.

## Viewing

Open `index.html` in a browser (or run `open index.html` on macOS). Everything is static —
no build step, no server required.
