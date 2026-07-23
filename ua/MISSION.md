# Mission: User Acquisition — AndroidEmulator

## Why
I have $2–5k and a retro-emulator app that earns **only from ads**, and within weeks I
will be spending that money myself in Meta and TikTok Ads Manager. I want to come out
the other side with a **defensible go/no-go on paid UA** — not a burned budget and a
shrug. The app's own `AndroidEmulator/docs/ua-strategy.md` already says ads-only LTV is
roughly **20–40% of CPI in every tier**, which means the default outcome of spending
this money is losing it. My job is to be the operator who can tell, early and cheaply,
whether that verdict is real for *my* app.

## Success looks like
- I can compute my **maximum allowable CPI** for any geo from ARPDAU, retention and a payback window — and refuse to bid above it.
- I can read a live campaign and say **kill / hold / scale** with a reason, not a vibe, and know when the numbers are still noise.
- I can stand up a Meta app campaign end-to-end: MMP, event ladder, budget, learning phase, and the edits that reset it.
- I can find **what competing emulator apps are actually running** — their live creatives, hooks, and how long each has been up — from Meta Ad Library, TikTok Creative Center and Google's Ads Transparency Center.
- I can build a creative pipeline that never shows commercial ROM footage, because IP flags cost the ad *account*, not just the ad.
- I can tell when the honest answer is **"stop, the economy isn't there yet"** — and say it before spending the rest.

## Constraints
- **Pure IAA.** Revenue is AdMob impressions. Every LTV number depends on eCPM and retention, both of which I must measure, not assume.
- **Blocked upstream.** ADR-0004 currently forbids attribution SDKs; Phase 0 needs an MMP. Until that amendment lands, instrumentation lessons are preparation, not execution.
- **I operate the console myself.** Lessons must end in an action I take in a real account, not a concept I nod at.
- **Play-policy exposure is unsettled.** The ROM link-out direction risks takedown, which would vaporise both the spend and the ad-account history. Budget stays phased until that is resolved.
- Dabbler baseline: I've boosted posts and spent small amounts. I know the vocabulary loosely. Attribution, event ladders and ROAS modelling are new.

## Out of scope
- iOS, SKAN and ATT — the app is Android-only.
- Building the app's monetization surfaces themselves; that's the AdMob workspace's job.
- ASO as a discipline in its own right (beyond the store-listing CRO that paid traffic lands on).
- Agency management and hiring — I'm running this myself.
