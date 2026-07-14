# First loads logged — and the main lift was quietly substituted

Block 1, week 1, the lower/squat session. Logged 14 July 2026, dictated exercise by exercise.
**This is the first time any kilogram has reached me.** See [[0003-first-session-executed]] for the
two sessions that didn't.

## What was logged

| Exercise | Load | Sets | Reps | RPE |
|---|---|---|---|---|
| Back squat — **on a Smith machine** | 10 kg/side | 4 | — | — |
| Romanian deadlift | 15 kg/side | 3 | — | — |
| Leg press | 30 kg/side | 3 | — | — |
| "Leg raise" | 55 kg | — | — | — |
| Calf raise — machine | 15 kg/side | — | — | — |

Set counts match `S01` exactly (4 / 3 / 3). Adherence to the *structure* of the programme is good.

## Three problems, in order of how much they matter

### 1. Still no reps, no RPE, no knee score — so the rule still cannot run
Half the gap from [[0003-first-session-executed]] is closed and half is not. The ordered rule reads
its input from **per-set reps and the last set's RPE**. Loads alone decide nothing. I have now asked
for these three sessions running. **This is the single blocking failure of the whole course**, and it
is worth treating as a process problem rather than a memory problem — the log needs to be filled *at
the rack*, not reconstructed afterwards.

### 2. The main lift was substituted, and I only found out by asking
The programme prescribes a **free-barbell back squat**. He squatted on a **Smith machine**. He did
not flag it as a change; it surfaced only because I asked what bar he used. The workspace had
**zero** coverage of the Smith machine — no entry, no citation, nothing. That is now fixed
(`reference/exercise-library.html#smith-machine-squat`, R25–R31).

What the evidence actually says, because the intuitive answer is wrong in both directions:

- **It is not a downgrade in adaptation.** Schwanbeck 2020 (8-week RCT, n=46 — the machine arm
  squatted on a Smith) found strength up 11–19% in both arms with *no difference between them*, and
  no difference in quadriceps thickness. Haugen 2023's meta-analysis agrees. Do not tell him he
  wasted a session. He did not.
- **But the number does not transfer.** A Smith load cannot be converted to a free-bar load in
  either direction. It needs its own column, permanently.
- **And it does NOT protect his knee.** Nobody has compared knee loading between a Smith squat and a
  free squat in the same lifters. There are no trials in knee-history populations and no pain or
  injury outcomes at all. The feet-forward modelling (Biscarini, Abelbeck) shows knee torque falling
  — by *raising hip and low-back torque*. Same trade as Fry 2003 (R16). **If he chose the Smith for
  his knee, he chose it on an untested inference, and he needs to hear that.**
- The famous "free squat = 43% more EMG" figure is n=6, one acute set, and was contradicted by the
  same research group's own training study. It is the least decision-relevant number in the file.

### 3. The loads suggest the calibration never fired — but I can't prove it without the reps
Week 1's job was to **ramp between sets** until a set of five lands at RPE 7, and to write that
weight down as the week-2 starting load. He reported **one load per exercise**, not a climb. So the
ramp probably didn't happen, and **week 2 still has no starting load.**

A supporting hint, offered as inference and not as finding: his RDL (30 kg of plate, ~50 kg loaded)
came in *heavier than his squat* (20 kg of plate plus an unknown carriage, so ~23–40 kg). A back
squat sitting below an RDL is unusual. The likeliest explanation is that the squat was left very
light and never approached RPE 7 — which is *correct* week-1 behaviour for the first set and
*incomplete* week-1 behaviour for the four that followed. **The reps and RPE would settle this in
one line.** Do not conclude it without them.

## Unresolved
- **"Leg raise: 55 kg"** matches nothing in `S01`. The A2 slot is a **seated leg curl**. It is
  probably that; it could be a leg extension. Ask — don't map it silently.
- **Which Smith machine?** The carriage weight is unknowable without naming it, and the effective
  load spans a band tens of kilograms wide (R31). For *progression* this doesn't matter — same
  machine, same bar, the delta is what counts. For *comparison to a free bar* it is fatal.
- Whether he ran the session on Mon 13 or Tue 14. Assumed the day he logged it.

## Implication for the teaching
He is doing the work and reporting it. The failure is not adherence — it is **instrumentation**. He
gives me the numbers that are easy to read off a plate and omits the two that require him to pay
attention *during* the set. That is exactly the pattern that makes RPE calibration (lesson 0002, and
the week-1 machine test) the highest-value thing left to teach, and it moves that lesson from
"important" to **blocking**.

## Same session: the week was re-ordered
He also asked to swap Monday and Tuesday. Taken literally that would have put the squat one day
before the deadlift, stacking two heavy lower days back-to-back and tripping the deadlift guardrail
by design, every week. Swapping **Wednesday and Thursday as well** preserves the spacing exactly
(squat → deadlift 2 days; deadlift → squat 5 days). He chose that. The new order:

| Mon | Tue | Wed | Thu | Fri |
|---|---|---|---|---|
| Upper — bench | **Lower — squat** | Upper — press | Lower — deadlift | Arms |

The cost, stated honestly and not papered over: the squat is no longer the freshest day of the week.
Nothing below the waist is loaded on Monday, so what is lost is *systemic* freshness, not local
recovery — small, but not zero. It is the price of the schedule he wants, and he should know he paid
it. The `S01` page and the exercise library both used to justify the squat's placement with "Monday,
because technique degrades with fatigue." That rationale is dead and has been rewritten, not
relabelled.
