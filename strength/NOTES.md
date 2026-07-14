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

## Two parallel streams (requested 2026-07-09)
The workspace now teaches on two tracks. Don't merge them.

| Stream | Directory | Unit | Revisited? |
|--------|-----------|------|-----------|
| **Concept** | `lessons/` | `0001-…`, `0002-…` | Rarely. How training *works*. |
| **Session** | `sessions/` | `S01-…` … `S05-…` | Weekly. One per workout day, teaching that day's *movements*. |

The exercise knowledge lives **once**, in `reference/exercise-library.html`, anchored per movement
(`#back-squat`, `#romanian-deadlift`, …). Session lessons link to those anchors; they do not restate
cues. Five sessions sharing one library beats five copies drifting apart — the same DRY rule
`HUB.md` applies to the stylesheet.

The five sessions are stable across a block. Only the RPE cap and the loading change week to week,
which is why `reference/two-week-block.html` links the *same* five session pages for both weeks.

## Block cadence
- **Block 1: Mon 13 – Fri 24 July 2026.** Week 1 caps main lifts at RPE 7 and *establishes* loads.
  Week 2 caps at RPE 8 and runs the ordered rule live. Review Sunday 26 July.
- **First loads arrived 14 July** — see [[0004-first-loads-and-the-smith-substitution]]. Kilograms,
  yes; **reps and RPE, still no.** The block plan's "why this block has no kilograms in it" callout
  is now half-stale and will need rewriting the moment he sends reps. Don't rewrite it before then —
  loads alone still can't start week 2.
- Week 1 carries the **RPE calibration test** on two machine exercises (Mon lat pulldown, Wed seated
  cable row): predict reps-to-failure, then go to failure, compare. Never on squat/deadlift/OHP.
  This finally answers the standing "can he rate RPE?" question while producing the loads.

### Day order (moved 2026-07-14, at his request)

| Day | Session | File |
|-----|---------|------|
| Mon | Upper — bench | `S02-upper-bench.html` |
| Tue | Lower — squat | `S01-lower-squat.html` |
| Wed | Upper — overhead press | `S04-upper-press.html` |
| Thu | Lower — deadlift | `S03-lower-deadlift.html` |
| Fri | Arms & weak points | `S05-arms.html` |

**Why Wed/Thu swapped too, and not just Mon/Tue.** The constraint that survives any reshuffle is the
spacing of the two heavy lower days: **2 days squat → deadlift (Tue → Thu), and 5 days from deadlift
back round to squat.** Moving bench to Monday alone would have left the deadlift one day after the
squat. The press went to Wednesday so it sits *between* them — it is the one upper day that asks
nothing of the erectors, which is what protects both the recovering squat and the coming pull.

**The price, stated honestly.** The squat no longer leads the week, so it no longer gets the freshest
body. The "technique degrades with fatigue" rationale that originally justified Monday **does not
survive the move, and the pages now say so.** The cost is small — nothing below the waist is loaded on
Monday, so legs and knee arrive fresh; what is given up is *systemic* freshness, not local recovery —
but it is not zero. Do not let this get quietly re-spun into "it makes no difference." He asked for the
schedule; he is owed the trade-off in writing.

**S-numbers are session IDs, not day ordinals.** `S01`…`S05` are keyed to the **lift**, permanently —
S01 is the squat wherever the squat lands. They are *not* day 1…day 5, and after this move they no
longer read in day order: the week now runs **S2, S1, S4, S3, S5**. **Never rename the files to restore
a tidy 1-2-3-4-5** — every cross-link, every footer "Next" link, and every calendar row in
`reference/two-week-block.html` is keyed to those filenames. If the days move again, change labels and
ordering only. `index.html` says this explicitly above the session cards, so the out-of-order numbering
doesn't read as a bug.

## He squats on a Smith machine (found 2026-07-14)
He ran the prescribed free-barbell back squat on a **Smith machine** and did not flag it as a change
— it surfaced only because I asked what bar he used. **Ask what equipment he used, every session.**
The library now covers it (`exercise-library.html#smith-machine-squat`, R25–R31). Three things not to
get wrong when it comes up again:

1. **It is not a downgrade.** Schwanbeck 2020 (8-wk RCT, the machine arm squatted on a Smith): 11–19%
   strength gain in *both* arms, no difference, no difference in quad thickness. Haugen 2023 agrees.
   Never imply he wasted the session.
2. **The number does not transfer, ever.** Smith loads get their own column. Never convert to a bar.
3. **It does NOT protect his knee — say so out loud.** Zero human comparison of Smith vs free-bar knee
   loading. No knee-history trials, no pain outcomes. The feet-forward modelling cuts knee torque by
   *raising hip and low-back torque* — the same trade as R16. If he picked the Smith for his knee, he
   picked it on an untested inference. **This is the claim I am most likely to be tempted to fudge.**

## The blocking failure is instrumentation, not adherence
Three sessions logged, three sessions with **no reps and no RPE.** He reliably reports what he can
read off a plate and omits the two numbers that require attention *during* a set. He is not lazy — he
is not yet instrumented. Consequences:

- The ordered rule has never once run on real data. It is, so far, a rule he has been taught and never
  used.
- This promotes **lesson 0002 (Calibrating RPE) from "important" to blocking.** Nothing downstream —
  volume, stalls, deloads — can be taught on numbers he cannot produce.
- Ask for the log **at the rack**, not afterwards. A dictated reconstruction is where the reps go.

### The log was reduced to three numbers (2026-07-14, at his request)

He asked "can we just record the last set?" **Yes — and it is a derived result, not a concession.** The
log is now **load, last-set reps, last-set RPE** (+ knee /10 on lower days, which feeds the *monitoring*
rule, not the ordered one). Written up in `progression-protocol.html` §3; log sheet and all four session
pages updated to match.

**The rule itself is unchanged.** Only what he writes down changed. Never let this get restated as
"we relaxed the standard."

Why it holds, under **one assumption — the last set is the worst (lowest-rep) set**:
- **R1** ("any set < 4"): last set ≥ 4 ⟹ all sets ≥ 4. The RPE-10 clause was already last-set-only.
- **R3** ("every set at 6"): needs the assumption **and** the 6-rep ceiling. Lowest set = 6 + nothing can
  exceed 6 ⟹ all four = 6.
- **R4**: last-set-only by definition.
- **R5**: the residual of an ordered, total rule — its conditions are never checked.
- **R2** is the one that did **not** fall out for free. "No rep added" was ambiguous (added to *which*
  set?). I **pinned** it: *a stall is three sessions at the same load with no rep added to the last set.*
  That is a definitional choice, not a deduction, and it makes R2 fire **sooner** than a
  count-any-set reading — which is the right direction for this course. Glossary updated to match.

**The blind spot, and it is bidirectional.** If reps *increase* across sets (a bad earlier set, then a
rally), the three-number log misreads in two ways: **R1 gets missed** (sub-4 set unseen), *and*
**R3 false-fires** (last set 6, earlier sets 5 → the log says add load when the rule says add reps).
Escape hatch, one line and it is in all five pages: **"if any earlier set felt worse than your last,
say so"** — then log all four for that lift.

**If the data still doesn't arrive after this, the problem is not friction.** Three numbers is the floor;
there is nothing left to cut without breaking the rule. A continued blank means it is habit, timing, or
motivation — and the next intervention is behavioural (log *at the rack*, before racking the bar; a
standing prompt; or asking him what actually stops him), **not another simplification.** Do not respond
to a fourth empty log by simplifying further. There is nowhere left to go.

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
- **Last-set reps and last-set RPE. Asked three times, never received.** The ask is now two numbers, not
  five — see the log reduction above. Everything else on this list is secondary.
  See [[0004-first-loads-and-the-smith-substitution]].
- **Can he actually rate RPE yet?** Gating question for the whole rule. Ask before teaching volume.
- **Why the Smith?** Preference, availability, or a belief it spares the knee? If it's the third, that
  belief is untested and he must be told. The answer changes whether we adopt it or correct it.
- **Which Smith machine (make/model)?** The carriage is unknowable otherwise, and manufacturer-stated
  effective bar weights span ~3–20 kg. Irrelevant for progression on the same machine; fatal for any
  comparison to a free bar.
- **"Leg raise, 55 kg"** — the S01 A2 slot is a *seated leg curl*. Probably that; possibly a leg
  extension. Don't map it silently.
- Bodyweight? Still unknown. Loads on the four main lifts: **squat only, and Smith-bound.** Bench,
  deadlift and OHP are still blank.
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

Added 2026-07-14 (gaps 5–6): **no study compares knee loading between a Smith squat and a free-bar
squat in the same lifters** — no knee-history trials, no pain outcomes, nothing. "The Smith is kinder
to my knee" is an untested inference and must never be implied anywhere in this workspace. And **no
peer-reviewed measurement of effective bar weight across commercial Smith machines** — the
counterweight *mechanism* is evidenced (R31), the 3–20 kg numbers are manufacturer claims. Convention,
not measurement.
