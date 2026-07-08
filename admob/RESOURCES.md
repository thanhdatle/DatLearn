# Resources: AdMob

High-trust sources for grounding lessons. Google-first — ad-tech blogs age badly.
Verified reachable July 2026. Each lesson should cite from here.

## Primary (official Google)

| # | Resource | Type | Trust | Use for |
|---|----------|------|-------|---------|
| R1 | [Guide to AdMob Mediation (bidding & waterfall)](https://support.google.com/admob/answer/13420272?hl=en) | Help doc | ★★★★★ | The core mental model. Primary source for Lesson 0001. |
| R2 | [Overview of bidding](https://support.google.com/admob/answer/9234488?hl=en) | Help doc | ★★★★★ | How the real-time auction works; hybrid setups. |
| R3 | [Bidding FAQ](https://support.google.com/admob/answer/9360574?hl=en) | Help doc | ★★★★☆ | Edge cases, migration questions. |
| R4 | [About AdMob mediation groups](https://support.google.com/admob/answer/13411971?hl=en) | Help doc | ★★★★★ | Setting up groups, ad sources, eCPM ordering. |
| R5 | [Choose ad sources — Android](https://developers.google.com/admob/android/choose-networks) | Dev doc | ★★★★★ | Kotlin: which networks, adapters. |
| R6 | [Choose ad sources — iOS](https://developers.google.com/admob/ios/choose-networks) | Dev doc | ★★★★★ | Swift: which networks, adapters. |
| R7 | [Set frequency caps for apps or ad units](https://support.google.com/admob/answer/6244508?hl=en) | Help doc | ★★★★★ | The retention lever. |
| R8 | [App open ad guidance & best practices](https://support.google.com/admob/answer/9341964?hl=en) | Help doc | ★★★★★ | Placement rules; what NOT to stack. |
| R9 | [Implementation guidance (ad placement)](https://support.google.com/admob/answer/2936217?hl=en) | Help doc | ★★★★★ | General placement / UX policy. |
| R10 | [3 ways to optimize revenue with ad mediation](https://admob.google.com/home/resources/optimize-revenue-with-ad-mediation/) | Article | ★★★★☆ | Business framing of mediation value. |
| R11 | [Optimize your in-app advertising strategy](https://admob.google.com/home/resources/optimize-in-app-advertising-strategy/) | Article | ★★★★☆ | Revenue vs. UX balance, testing placements. |
| R12 | [AdMob reports glossary (metric definitions)](https://support.google.com/admob/table/9462111?hl=en) | Help doc | ★★★★★ | Exact formulas: requests, match rate, show rate, impressions, eCPM. Primary source for Lesson 0002. |
| R13 | [Match rate](https://support.google.com/admob/answer/9654749?hl=en) | Help doc | ★★★★★ | The AdMob name for "fill" — matched requests ÷ requests. |
| R14 | [Optimize waterfall ad sources in mediation](https://support.google.com/admob/answer/7374110?hl=en) | Help doc | ★★★★★ | How eCPM ordering and manual/auto tuning work inside a group. Primary source for Lesson 0003. |
| R15 | [Common reasons for low match rate](https://support.google.com/admob/answer/9655701?hl=en) | Help doc | ★★★★☆ | Diagnosing empty fills — why a source fails to return an ad. |

## SDK references (for hands-on lessons)
- Android Google Mobile Ads SDK — https://developers.google.com/admob/android/quick-start
- iOS Google Mobile Ads SDK — https://developers.google.com/admob/ios/quick-start

## Communities (for wisdom — testing ideas with practitioners)
- **r/admob** and **r/gamedev** (monetization threads) — real fill-rate/eCPM numbers.
- **Google AdMob Community** — https://support.google.com/admob/community — official, policy answers.
- Candidate for later: an indie-dev monetization Discord (to be chosen with the user).

## Notes on trust
- ★★★★★ = official Google docs, current. ★★★★☆ = official but marketing-framed or FAQ.
- Anything below that (random blogs, Medium posts) is **not** listed until vetted. Never cite parametric memory for numbers — link R1–R11.
