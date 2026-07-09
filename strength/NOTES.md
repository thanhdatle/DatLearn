# Notes — Strength & Bodybuilding workspace

Teaching preferences and working notes for this topic.

## Learner preferences
- Intermediate lifter, **6 months–2 years** consistent training. Full commercial gym.
- **Monday–Friday, 45–60 min.** This constraint is load-bearing — it is why accessories are
  supersetted and why calves/delts sit at maintenance volume. Never quietly extend the session.
- Wants **online communities** (form checks, programme critique). Has not asked for in-person
  coaching; don't push it unless technique becomes the blocker.
- Learns by doing, revisits material later → lessons must be short, interactive, self-contained.
- Deals in **kilograms**.

## Teaching stance (locked, from the mission)
The mission is longevity, not a number. So when the evidence is genuinely split — and on
proximity-to-failure it is — **the tie goes to the option that doesn't bury him.** Teach 1–3 RIR,
cap the main lifts at RPE 8, and treat a stall as a signal to reset rather than to push.

Label every claim by its evidence status. He is blocked on progression precisely because the
internet gave him confident answers with no provenance. The `progression-protocol.html` reference
carries a Peer-reviewed / Coaching-construct / Convention column for exactly this reason. Do not
drop it.

## Design system (shared, don't fork)
- Stylesheet `../assets/course.css`; toggle `../assets/theme.js`; quiz engine `../assets/quiz.js`.
- **`assets/quiz.js` was created for this topic** (2026-07-09) because the AdMob lessons each inline
  a single-quiz script keyed to `#quiz-feedback` — one quiz per page. The shared engine wires every
  `.quiz` on the page. New lessons link it; the AdMob lessons were left untouched.
- Strength topic chip = indigo `#5560b8` (AdMob is teal `#0a8a6f`).
- Reuse `.lesson-body` + `.sidenote`, `.callout`, `.quiz`, `.pull`, tables, `.glossary` before
  writing new CSS.

## Quiz construction rule
Per the teach skill: every option must be the **same word count and near-identical character
count**, so formatting leaks no clue. Lesson 01 uses one fixed option set across all four drills —
"Add load, reset reps" / "Add reps, keep load" / "Repeat load and reps" / "Drop load, rebuild up" —
which doubles as interleaving, since the learner must discriminate rather than recognise.

## Teaching plan (rough, revise freely)
1. ✅ **0001 — Double progression & RIR.** The decision rule. Four drills, one per branch of the
   table. Cited R4/R5/R6/R9/R10/R11/R12. Flagged the failure debate honestly.
2. **0002 — Counting your weekly hard sets.** Volume landmarks; why ~20 sets/muscle/wk is the wrong
   target for a 50-minute session. The `five-day-split.html` volume audit is the hook — his calves
   (~3 sets) and delts (~6) are below range and he hasn't been told why. (R1, R3, R7, R8, R13)
3. **0003 — Calibrating RPE.** The whole rule depends on telling RPE 8 from RPE 9, and most lifters
   *cannot* at this stage. Test: predict reps-to-failure, then take one set to failure on a machine
   and compare. (R4)
4. **0004 — Stalls, resets & deloads.** Planned back-off vs. forced back-off. (R5, R13)
5. **0005 — Training for the next twenty years.** Joint health, lift swaps, what "sustainable"
   costs. The mission's real payoff lesson.

## Open questions to ask the learner
- **Can you actually rate RPE yet?** If he can't distinguish 8 from 9, lesson 01's rule is running
  on a broken sensor and lesson 03 should jump the queue. Ask before teaching 02.
- Bodyweight and current working loads on the four main lifts? Needed to make future drills use his
  real numbers instead of my invented ones.
- Eating at maintenance, surplus, or deficit? Changes how to read a stall (see the note at the foot
  of `five-day-split.html`).
- Do calves or side delts matter to him aesthetically? If yes, we move sets — we don't add time.

## Gaps carried from RESOURCES.md
No RCT for double progression or the 90% reset. No validation of the exact MEV/MAV/MRV numbers.
Proximity-to-failure contested. Nothing in the literature addresses the 5-day upper/lower split or
the 45–60 min constraint directly — the split is best understood as a volume-distribution vehicle,
which is **my inference, not a cited finding.** Say so when it comes up in lesson 02.
