# User Acquisition Resources

Sources are cited in lessons as **(R1)**, **(R2)**, … Prefer the primary docs; the
vendor blogs are benchmark aggregates and rot fast — treat every number from them as a
±50% prior until replaced by measured data from our own campaigns.

## Knowledge — primary sources (highest trust)

- **R1.** [Impression-level ad revenue — AdMob Android](https://developers.google.com/admob/android/impression-level-ad-revenue)
  Google's own spec for `OnPaidEventListener`: `getValueMicros()`, `getCurrencyCode()`,
  `getPrecisionType()` (`UNKNOWN` / `ESTIMATED` / `PUBLISHER_PROVIDED` / `PRECISE`), supported on
  app-open, banner, interstitial, rewarded, rewarded-interstitial and native.
  **Use for:** the exact API Phase 0 must wire into the MMP — and the trap that test impressions
  from bidding sources return `UNKNOWN` with value `0`, so a test device proves nothing about revenue.

- **R2.** [Choose a bid strategy for your App campaign — Google Ads Help](https://support.google.com/google-ads/answer/12073727?hl=en)
  The five App-campaign bid strategies (tCPI, tCPA, Maximize Conversions, Maximize Conversion Value,
  tROAS) and what each optimises for. Notes Google's own advice to set tCPA bids ~20% above observed.
  **Use for:** choosing a bid strategy in Google App Campaigns, and the vocabulary Meta/TikTok mirror.

- **R3.** [Set a recommended initial Target ROAS for App campaigns — Google Ads Help](https://support.google.com/google-ads/answer/15995101?hl=en)
  Google's stated sequencing: run tCPA first to establish a baseline ROAS, *then* move to tROAS.
  **Use for:** why you cannot start on value optimisation, in any channel, on day one.

- **R4.** [About the Learning Phase — Meta Business Help Center](https://www.facebook.com/business/help/112167992830700)
  · [Significant Edits and Learning Phase](https://www.facebook.com/business/help/316478108955072)
  · [About Learning Limited](https://www.facebook.com/business/help/269269737396981)
  Meta's own definition: ~50 optimisation events per ad set per 7 days to exit learning, and the
  edit types that reset it.
  **Use for:** structuring ad sets and budgets so the algorithm can actually learn — and knowing which
  mid-flight tweaks throw away everything the campaign has learned. *(These pages are JS-rendered and
  resist automated fetching; read them in a browser.)*

- **R5.** [ROI360 — ad revenue attribution guide, AppsFlyer](https://support.appsflyer.com/hc/en-us/articles/217490046-ROI360-guide-ad-revenue-attribution)
  · [AdMob ad-revenue attribution configuration](https://support.appsflyer.com/hc/en-us/articles/360006951817-Google-AdMob-Ad-revenue-attribution-configuration)
  · [SDK-side API](https://support.appsflyer.com/hc/en-us/articles/4416353506833-ROI360-impression-level-ad-revenue-SDK-API-integration-guide)
  How impression-level ad revenue becomes an `af_ad_revenue` event attributed back to the acquiring
  source. Note: ROI360 is a **paid add-on**, which is a real Phase 0 line item.
  **Use for:** the Phase 0 build, and for understanding why an IAA app that optimises on installs
  instead of revenue loses money.

- **R6.** [TikTok Ads — intellectual property policy](https://ads.tiktok.com/help/article/tiktok-ads-policy-intellectual-property-infringement)
  TikTok frame-scans creatives for copyrighted content and requires written authorisation for
  third-party IP; penalties escalate from ad rejection to account suspension.
  **Use for:** the hard creative rule — no commercial ROM footage, no Nintendo/Sega marks, ever.

## Knowledge — competitor intelligence (free, public, primary)

- **R7.** [Meta Ad Library](https://www.facebook.com/ads/library/)
  Every ad currently running on Facebook/Instagram, searchable by advertiser, filterable by country
  and platform, showing the creative and the date it started running.
  **Use for:** seeing exactly which creatives competing emulator apps are running, and — via start
  dates — which ones they've kept alive long enough to be winners.

- **R8.** [TikTok Creative Center — Top Ads](https://ads.tiktok.com/business/creativecenter/)
  TikTok's own showcase of high-performing ads, filterable by industry, region and objective, with
  reported metrics. Also carries trend, hashtag and song data.
  **Use for:** hook patterns that work on TikTok in gaming, and what "shot like organic" actually looks like.

- **R9.** [Google Ads Transparency Center](https://adstransparency.google.com/)
  Every verified advertiser's running ads across Google Search, Display, YouTube and Play, with
  date ranges and formats.
  **Use for:** the channel Meta Ad Library cannot see — what competitors run on UAC and YouTube.

- **R10.** [Sensor Tower](https://sensortower.com/) · [Appfigures](https://appfigures.com/) · [data.ai](https://www.data.ai/)
  Third-party *estimates* of competitor installs, revenue and ad-network mix. Paid, and modelled —
  directionally useful, never quotable as fact.
  **Use for:** sizing a competitor's spend when the free tools only show creative.

## Knowledge — benchmarks (secondary; treat as ±50% priors)

- **R11.** [Pollen VC — How to calculate ROAS](https://pollen.vc/blog/how-to-calculate-roas/)
  Clean derivation of ROAS as LTV ÷ CPI at a time horizon, and how payback period falls out of it.
  **Use for:** the arithmetic in Lesson 01. The clearest non-vendor explanation of the core loop.

- **R12.** [Liftoff — What is a good ROAS? 2026 benchmarks](https://liftoff.ai/blog/what-is-a-good-roas/)
  · [Admiral Media — Mobile app marketing benchmarks 2026](https://admiral.media/mobile-app-marketing-benchmarks-2026/)
  D7/D30 ROAS bands by vertical; channel character (Meta ROAS vs TikTok CPI).
  **Use for:** sanity-checking whether our measured numbers are plausible or broken.

- **R13.** [Playwire — AdMob eCPM benchmarks](https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect)
  · [Tenjin 2026 ad-monetization report](https://tenjin.com/blog/ad-mon-gaming-2026/)
  Rewarded vs interstitial vs banner eCPM by geo — the ~30× spread that makes geo choice decisive.
  **Use for:** the revenue side of the max-CPI calculation before we have our own data.

- **R14.** [AppAgent — Mobile game retention benchmarks](https://appagent.com/blog/mobile-game-retention-benchmarks/)
  D1/D7/D30 retention curves by genre — the multiplier that turns ARPDAU into LTV.
  **Use for:** judging whether the emulator's measured retention is good, average or fatal.

## Our own documents (the ground truth this workspace serves)

- **R15.** `AndroidEmulator/docs/ua-strategy.md` — the adopted strategy (2026-07-07): Phase 0/1/2,
  the LTV model, the blocked ADR-0004 conflict, the creative hard rule, and the contrarian case.
  **Use for:** every lesson. This is the plan the skills are being built to execute.
- **R16.** `AndroidEmulator/CONTEXT.md` — the domain glossary (Core, Library, Discover, Seed game,
  Handheld Deck…). **Use for:** naming things correctly in creative and store copy.
- **R17.** `AndroidEmulator/docs/adr/0004-monetization-policy.md` — the ad-surface contract that
  determines ARPDAU, and the SDK prohibition currently blocking Phase 0.

## Wisdom (Communities)

- [r/UserAcquisition](https://www.reddit.com/r/UserAcquisition/) — practitioners running real budgets.
  **Use for:** sanity-checking a campaign structure or a suspicious CPI before spending more.
- [r/androiddev](https://www.reddit.com/r/androiddev/) and [r/gamedev](https://www.reddit.com/r/gamedev/)
  **Use for:** Play-policy questions, which are our largest unbounded risk.
- [Mobile Dev Memo](https://mobiledevmemo.com/) + its [Slack community](https://mobiledevmemo.com/slack/) — Eric Seufert.
  The most rigorous public writing on mobile UA economics.
  **Use for:** whether the pure-IAA-can't-pay-back thesis holds, from people who have tested it.
- [AppAgent](https://appagent.com/blog/) and [Growth Gems](https://growthgems.co/) newsletters.
  **Use for:** staying current without reading vendor marketing.

## Gaps

- **No emulator-specific benchmark exists publicly.** Every CPI/eCPM/retention figure above is
  category-level. The Phase 1 calibration spend is precisely the instrument for closing this gap —
  which is why Lesson 01 is arithmetic, not tactics.
- **No primary Meta source is machine-readable.** R4's pages resist fetching, so learning-phase
  numbers here were cross-checked against secondary write-ups. Verify in-browser before betting on them.
- **Play-policy precedent for ROM link-out apps** is not yet researched. This is the biggest
  unbounded risk in the mission and deserves its own session.
