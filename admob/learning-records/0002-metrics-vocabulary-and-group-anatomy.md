# Lessons 0002–0003: precise metric vocabulary + group anatomy before hands-on

Added the next two lessons after [[0001-mission-and-starting-point]], staying on the knowledge track
before any console-hands-on. Two decisions worth recording:

## 1. Taught AdMob's *real* metric split, not the loose "fill rate"
The rough plan (NOTES) called Lesson 2 "eCPM, fill rate & latency." On checking the official docs
(R12 reports glossary, R13 match rate), AdMob doesn't have one "fill rate" — it splits the pipeline
into **match rate** (matched ÷ requests: did a network *return* an ad?) and **show rate**
(impressions ÷ matched: did the returned ad get *shown*?). Taught the precise version because the two
have **opposite fixes** — low match rate = demand problem, low show rate = the learner's own code.
That diagnostic split is the actual skill; conflating them into "fill rate" would have hidden it.
eCPM formula and the $180/45,000=$4 example are Google's own (R12), used verbatim to avoid parametric
numbers.

## 2. Lesson 3 (mediation group) taught as *structure*, not a console click-through
The learning record from session 1 warned: don't assume console familiarity or known eCPM/fill numbers
yet. So Lesson 3 teaches the **anatomy** of a group (format + targeting + bidding/waterfall sources)
and the request-flow logic, with illustrative figures clearly flagged as illustrative — no live AdMob
account required. It ties L01 (hybrid flow) and L02 (eCPM ordering, match-rate backfill, latency tax)
together rather than introducing new console mechanics. The hands-on "build a real group against your
numbers" is offered explicitly in the ask-teacher footer, gated on the learner opting in.

## Spacing / interleaving applied
L02 opens with a cold-recall prompt about L01's waterfall ordering (answer deferred to the end), and
L03's quiz feedback points back to L01's hybrid flow. This is deliberate spaced retrieval, not review.

## Plan shift
Frequency caps moved from slot 3 → slot 5 in the index; ad formats inserted at slot 4. Rationale: caps
are a refinement applied *after* you have formats and a working group, so they now sit later in the ZPD
ladder. Mission unchanged.

## Still open (ask the learner)
- Live apps with real AdMob data, or starting fresh? Governs whether Lesson 4+ uses their numbers.
- Games or utility apps? Changes format/placement advice (R8, R11).
