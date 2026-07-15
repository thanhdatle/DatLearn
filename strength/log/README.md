# The session log

The ordered rule, wired to your phone. You log three numbers at the rack; the rule runs itself and
tells you what goes on the bar next session.

## Log from your phone

1. Open **[the session-log form](https://github.com/thanhdatle/DatLearn/issues/new?template=session-log.yml)**.
   Add it to your home screen — it opens straight into the form.
2. One lift per issue. Fill in **date, block week, lift, equipment, total load, last-set reps,
   last-set RPE** (plus **knee /10** on lower days). Submit.
3. Within a minute a comment comes back: **which rule fired, what it means, and the load and target
   reps for next session.** The issue closes itself and the row lands in `sessions.csv` on `main`.

**In week 1 the ordered rule does not run** — which is why the form asks which week it was. Week 1 caps
at RPE 7 and its job is to *find* the loads, so a week-1 session comes back with calibration guidance
instead of a rule number: whether the set landed under, at, or over the RPE 7 cap, and what goes on the
bar to find the load. The **knee tripwire runs in both weeks** — it was never part of the ordered rule.

**Do it at the rack, before you rack the bar.** Not in the car, not that evening. A dictated
reconstruction is exactly where the reps go missing — three sessions have already been lost that way.

Got something wrong? **Edit the issue.** The row is corrected in place rather than duplicated, and the
verdict is recomputed. A duplicate row would poison the stall window, so this matters.

## What happens to it

```
issue form  ->  parse  ->  load history for THIS (lift, equipment)
            ->  run the ordered rule  ->  write the row to sessions.csv
            ->  commit to main  ->  comment the verdict  ->  close the issue
```

- The rule lives in [`scripts/progression-rule.mjs`](../../scripts/progression-rule.mjs). Five rules,
  first match wins, **in week 2 only**, and **the order is the whole point** — see
  [`progression-protocol.html`](../reference/progression-protocol.html) §2.
- The plumbing lives in [`scripts/session-log.mjs`](../../scripts/session-log.mjs). It makes no
  training decisions.
- The workflow is [`.github/workflows/session-log.yml`](../../.github/workflows/session-log.yml). It
  runs the test suite before it will hand you a verdict.

Run the tests yourself: `node --test scripts/*.test.mjs`. Zero dependencies, no `npm install`.

## The columns

`date, lift, equipment, load_kg, last_set_reps, last_set_rpe, knee, verdict, issue_url, notes,
block_week`

Four of them earn their keep in ways that are easy to get wrong.

**`block_week` decides whether the rule runs at all.** Week 1 caps at RPE 7 and calibrates; week 2 caps
at RPE 8 and progresses. Without it, a week-1 set of 6 reps @ RPE 8 fires rule 3 and tells you to **add
load** — during a calibration week, off a set that blew that week's own cap, which the glossary says is
not earned. A week-1 row is also never counted toward a stall: rule 2 counts *progression* sessions, and
a calibration session is not one.

**`equipment` is part of the lift's identity, not a footnote.** A Smith-machine back squat and a
free-bar back squat are **different lifts with separate load histories**. They are never merged and
never converted, in either direction. The Smith carriage weight is unpublished and varies by tens of
kilos between machines, so the two numbers are not comparable even in principle
([why](../reference/exercise-library.html#smith-machine-squat)).

**A blank is not a zero.** The seeded 14 July row carries a load and no reps and no RPE, because those
numbers were never supplied. They are left **empty**, not guessed. An entry with no reps cannot count
as one of the three sessions in a stall — the rule will not drop your load on the strength of a blank.

**`notes` is where the escape hatch lands.** The three-number log rests on one assumption: **your last
set is your worst set.** When that breaks — you ground out a 3 on set two, then rallied — the rule
misreads the session in one of two directions. So: **if any earlier set felt worse than your last, say
so in the notes**, and give all four sets. The verdict comment will flag it straight back at you.

## What the rule will not do

It will not invent a number. If the lift is not on the list, if the RPE is a quarter point, if the block
week is missing, if the date is malformed — the run **fails, comments why, commits nothing, and leaves
the issue open.** A wrong number in the log is worse than a missing one, because a wrong one gets
silently believed.

**Half-point RPEs are fine** — 7.5, 8.5, 9.5. They used to be refused, and that refusal was a patch over
a bug: rule 4 read `RPE = 9` exactly, so an 8.5 slipped past it into rule 5 and was rewarded with an
extra rep at an effort that had already gone over the cap. Rule 4 now reads **above RPE 8**, which is
what it always meant, so the form can accept the number you actually felt.
