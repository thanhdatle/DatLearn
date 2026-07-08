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
│   └── theme.js          ← shared light/dark toggle
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

## Viewing

Open `index.html` in a browser (or run `open index.html` on macOS). Everything is static —
no build step, no server required.
