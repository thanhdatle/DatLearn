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
| [Cơm Nhà](meals/index.html) | Three dishes on the table every weeknight in under an hour — the mâm cơm as a grid you fill, not a meal you invent at 5:40pm | 1 lesson live |
| [Kai Memory](kai-memory/index.html) | Get my phone number into a 3-year-old — as a song, because ten digits is 3× his span — and keep the coaching loop for everything after it | 1 lesson live |
| [UA](ua/index.html) | Reach a defensible go/no-go on paid user acquisition for AndroidEmulator before the $2–5k is gone — and scale only the part that survives the arithmetic | 1 lesson live |

### Topic colours

Topic chips (`--chip`, defined in `index.html`) must clear **4.5:1 contrast in both themes** — they
are rendered as kicker *text* — **and** sit **≥ 30° apart in hue** (relaxed from 40°; see below), or
two topics read as one on the grid. Both properties are measured, never guessed:

```
node scripts/chip-contrast.mjs                                   # audit at the default 40° rule
node scripts/chip-contrast.mjs --min-gap=30                      # audit at the live rule
node scripts/chip-contrast.mjs --min-gap=30 --band=198,202 --exclude=<topic>
```

Given `--band=lo,hi` the script **searches** the colour space for a passing pair — bounded on hue,
saturation and lightness, scored on cross-theme hue agreement — rather than checking hexes a human
guessed. It also prints the arcs still free at whatever rule you pass.

Current: **bg3 39°, ua 76°, meals 113°, admob 167°, strength 232°, llm 295°, kai 340°.**

**The 40° wheel filled at six, and the rule was relaxed to admit the seventh.** The previous version
of this section predicted that topic six had exactly one viable arc — **336°–359°, 24° wide** — and
that prediction held: **`kai` was placed at 340°** (`#b3164b` light, 6.70:1 · `#fb9aba` dark,
8.48:1), 45° from llm. It then stated that a seventh topic could not satisfy ≥ 40° separation
anywhere, and that the next topic would force a deliberate choice between **relaxing the policy to
~30°** and **adding a second channel** (shape, weight, a mark).

**That choice was made on 2026-07-23, for the `ua` topic: the policy is relaxed to ≥ 30°.** The
second-channel option was not taken, and remains available when 30° runs out too.

At 30°, three arcs opened. `ua` took the widest, and sat at its **centre** rather than against
either edge:

| Arc free at ≥ 30° | Width | Status |
|---|---|---|
| **70°–83°** | 14° | **Taken by `ua` at 76°** — 37° from *both* bg3 (39°) and meals (113°) |
| 198°–202° | 5° | Free — a cerulean, between admob (167°) and strength (232°) |
| 263°–265° | 3° | Free — a violet, between strength (232°) and llm (295°) |

`ua` measured: `#486300` light, **6.86:1**; `#c9ff39` dark, **14.51:1**; hue **76° in both themes**,
so it reads as one colour across a theme toggle.

**Two slots remain, then the wheel is genuinely finished.** After topics eight and nine there is no
further relaxation worth making — 30° is already close to the point where adjacent chips stop being
reliably distinguishable — so the *next* forced decision is the second-channel one, and it should be
taken rather than deferred again. Computed with `node scripts/chip-contrast.mjs`, never eyeballed.

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
