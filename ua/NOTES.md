# UA — teaching notes

## Learner baseline (established 2026-07-23, at workspace creation)

- **Paid UA experience: dabbler.** Has boosted posts and spent small amounts. Knows the
  vocabulary loosely. Has *never* run a campaign with attribution, an event ladder, or a
  ROAS model. Treat every acronym as new on first use; never assume MMP/AEO/tROAS is known.
- **Spend horizon: weeks away, money ready ($2–5k).** This is live-fire, not theory. **Every
  lesson must end in a concrete action taken in a real account or a real spreadsheet.** A
  lesson that ends in understanding only has failed this learner.
- **He operates the console himself.** No agency, no delegation. Lessons must include the
  actual click-path, not just the strategy behind it.
- Requested explicitly at kickoff: **competitor UA intelligence** — how to see what rival
  emulator apps are running on Meta and elsewhere. Scheduled as Lesson 02.

## Teaching preferences

- Editorial tone, sidenote citations, short lessons. Same as the rest of DatLearn.
- **Numbers over adjectives.** He has a strategy doc full of ranges; the skill being built is
  the ability to *do the arithmetic* and act on it, not to recite the ranges.
- Interactive calculators beat static tables here — the core skill is a computation he must be
  able to run cold, on his own inputs.
- Every benchmark cited must carry its provenance and its uncertainty. The whole mission turns
  on not trusting a number that came from a vendor blog.

## The through-line

His own `docs/ua-strategy.md` concludes ads-only LTV is **20–40% of CPI in every tier** — i.e.
paid UA does not pay back at baseline assumptions. The course is therefore *not* "how to scale
spend". It is **"how to find out cheaply whether spending is justified, and how to scale only
the part that is."** Lesson 01 teaches the arithmetic that makes that judgement possible;
everything after it is instrumentation, evidence-gathering, and the discipline to stop.

## Lesson plan

| # | Lesson | Skill won | Status |
|---|--------|-----------|--------|
| 01 | **The only number that matters** — max allowable CPI from ARPDAU × retention ÷ payback | Compute a bid ceiling and refuse to cross it | **Live** |
| 02 | **Reading your competitors' mail** — Meta Ad Library, TikTok Creative Center, Google Ads Transparency Center | Extract a rival's live creative set and infer which ones are winning from run dates | Next |
| 03 | **Phase 0 instrumentation** — MMP, `onPaidEvent`, the event ladder | Specify the measurement build and know why installs-optimisation loses money | Planned |
| 04 | **Your first Meta app campaign** — structure, budget, learning phase, the edits that reset it | Launch a campaign that can actually learn | Planned |
| 05 | **Kill, hold, or scale** — reading a live campaign, and when the numbers are still noise | Decide with a stated confidence, not a vibe | Planned |
| 06 | **The creative pipeline** — IP-safe hooks, testing cadence, what a winner looks like | Ship 3–5 fresh creatives a week without risking the ad account | Planned |
| 07 | **Scaling without breaking it** — value optimisation, tROAS, budget steps | Move from tCPA to value bidding at the right moment | Planned |
| 08 | **The other two channels** — TikTok Smart+ and Google UAC | Run the Android channel Meta cannot reach | Planned |

Ordering rationale: 01 before everything because it is the gate that decides whether the rest
matters. 02 next because it is **free, requires no SDK work, and is unblocked** — he can do it
tonight while ADR-0004 is still stalling Phase 0. 03 is blocked on the ADR-0004 amendment, so it
is taught as specification rather than execution until that lands.

## Open threads

- **ADR-0004 blocks Phase 0.** Until the amendment authorising one MMP SDK is recorded, Lesson 03
  is preparation only. Check status at the start of each session.
- **Play-policy exposure** (ROM link-out) is the one unbounded risk. Worth its own session, and it
  should probably gate any spend above ~$10k/month. Not yet researched — logged as a Gap in RESOURCES.
- The remove-ads IAP / subscription decision materially changes the LTV that Lesson 01 computes.
  If that lands, revisit Lesson 01's worked example and add a learning record.
- Watch for the moment he has real measured ARPDAU and retention: that is when Lesson 01's
  calculator gets re-run with true inputs, and when the go/no-go actually gets made.

## Workspace conventions

- Topic chip **`#486300` light / `#c9ff39` dark, hue 76°** — measured with
  `node scripts/chip-contrast.mjs --min-gap=30 --band=74,78 --exclude=ua`, never eyeballed.
  This chip is the reason HUB.md's hue rule was relaxed from 40° to 30°; see the hub for the record.
- Lessons link the shared `assets/course.css` + `assets/quiz.js` and the topic's `assets/ua.css`.
  Do not fork the design system.
