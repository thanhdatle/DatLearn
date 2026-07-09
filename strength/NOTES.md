# Notes — Strength & Bodybuilding workspace

Teaching preferences and working notes for this topic.

## Learner preferences
- Intermediate lifter, **6 months–2 years** consistent training. Full commercial gym. Age **30–45**.
- **Monday–Friday, 45–60 min.** This constraint is load-bearing — it is why accessories are
  supersetted and why calves/delts sit at maintenance volume. Never quietly extend the session.
- **Knee history, currently pain-free. No medical flags.** See [[0002-screening-gap-and-knee-history]].
- Wants **online communities** (form checks, programme critique). Has not asked for in-person
  coaching; don't push it unless technique becomes the blocker.
- Learns by doing, revisits material later → lessons must be short, interactive, self-contained.
- Deals in **kilograms**.
- **Audits what he's given.** He caught the screening gap himself. Expose uncertainty, show the
  reasoning, expect it to be tested. Never present a coaching heuristic as settled science.

## Teaching stance (locked, from the mission)
The mission is longevity, not a number. When the evidence is genuinely split — and on
proximity-to-failure it is — **the tie goes to the option that doesn't bury him.** Teach 1–3 RIR,
cap the main lifts at RPE 8, treat a stall as a signal to reset rather than to push.

Label every claim by evidence status. He is blocked on progression precisely because the internet
gave him confident answers with no provenance. The `progression-protocol.html` reference carries a
Peer-reviewed / Coaching-construct / Convention column for exactly this reason. Do not drop it.

**Screen before you programme.** Injury history, medical flags, current pain, age. I failed to do
this and shipped three pages first. Never again — it goes in the first interview.

## Design system
- Base: `../assets/course.css` (shared, **do not fork**). Toggle: `../assets/theme.js`.
  Quiz engine: `../assets/quiz.js` (created for this topic, 2026-07-09 — the AdMob lessons each
  inline a single-quiz script keyed to `#quiz-feedback`, so they support one quiz per page).
- Topic skin: **`strength/assets/strength.css`**, loaded after `course.css`, scoped to
  `<html data-topic="strength">` so it cannot leak into the hub or AdMob.
  - Display type **Barlow Condensed**, UI/labels **Barlow** — the `ui-ux-pro-max` typography
    recommendation for sports/fitness. (Its *pattern* recommendation was "Webinar Registration with
    an urgency timer" and its *style* pick was youth/gaming-oriented; both discarded as wrong for a
    longevity course.)
  - Lesson prose stays **Newsreader** (read once, slowly, at a desk). Reference docs go **sans**
    (read mid-set, on a phone).
  - Topic colour is a token with two values: `#4a56a6` light (6.2:1), `#9aa2e8` dark (7.9:1).
    **No single hex clears 4.5:1 against both `#fbfaf6` and `#15140f`** — that is why the old inline
    `#5560b8` failed in dark mode, and why the hub card needs its own theme-aware override.
- Reuse `.lesson-body` + `.sidenote`, `.callout`, `.quiz`, `.pull`, `.table-wrap`, `.day`,
  `.evidence`, `.log`, `.glossary` before writing new CSS.

## Quiz construction rule
Per the teach skill: every option must be the **same word count and near-identical character
count**, so formatting leaks no clue. Lesson 01 uses one fixed option set across all four drills —
"Add load, reset reps" / "Add reps, keep load" / "Repeat load and reps" / "Drop load, rebuild up"
(4 words, 19–21 chars each). This doubles as interleaving: the learner must discriminate rather
than recognise.

## The decision rule is ORDERED — don't revert it
A Codex review found the original five-row table was neither mutually exclusive nor exhaustive:
`6,6,6,6 @ RPE 10` matched two rows; `5,4,4,4 @ RPE 9` in week one matched none. It is now five
**ordered** rules, first match wins, which is provably total. All four drills were re-verified to
have exactly one correct answer under the ordering. If you ever restate the rule, restate the order.

## Teaching plan (rough, revise freely)
1. ✅ **0001 — Double progression & RIR.** The ordered rule. Four drills, one per branch.
   Cited R4/R5/R6/R9/R10/R11/R12. Failure debate flagged as contested.
2. **0002 — Calibrating RPE.** *Promoted ahead of volume.* The whole rule reads its input from his
   RPE estimate, and most intermediates cannot tell 8 from 9. Test: predict reps-to-failure, then
   take one set to failure on a machine and compare. (R4)
3. **0003 — Counting your weekly hard sets.** Volume landmarks; why ~20 sets/muscle/wk is the wrong
   target for a 50-minute session. Hook: the `five-day-split.html` audit — calves (~3) and delts
   (~6) are below range. Must also explain the counting *approximation* (main lifts are 4–6 reps,
   below Baz-Valle's validated band). (R1, R3, R7, R8, R12, R13)
4. **0004 — Stalls, resets & deloads.** Planned back-off vs. forced back-off. (R5, R13)
5. **0005 — Training for the next twenty years.** Joint health, lift swaps, what "sustainable"
   costs. The mission's payoff lesson — and where the knee work belongs long-term.

## Open questions to ask the learner
- **Can he actually rate RPE yet?** Gating question for the whole rule. Ask before teaching volume.
- Bodyweight and current working loads on the four main lifts? Future drills should use his real
  numbers, not my invented ones.
- Eating at maintenance, surplus, or deficit? Changes how to read a stall.
- Which knee, and what happened? The modifications are generic patellofemoral-friendly defaults. A
  meniscus tear and anterior knee pain want different things.
- Do calves or side delts matter to him? If yes, we move sets — we don't add time.

## Gaps carried from RESOURCES.md
No RCT for double progression or the 90% reset. No validation of the exact MEV/MAV/MRV numbers.
Proximity-to-failure contested. Singer 2024 says *no detected* benefit past ~90 s rest — which is
weaker than "no benefit"; don't overstate it again. Nothing in the literature addresses the 5-day
upper/lower split or the 45–60 min constraint directly — the split is best understood as a
volume-distribution vehicle, which is **my inference, not a cited finding.**
