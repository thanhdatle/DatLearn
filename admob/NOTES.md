# Notes — AdMob workspace

Teaching preferences and working notes for this topic.

## Learner preferences
- Wants **short, hands-on** lessons; reviews material later, so lessons must be beautiful and self-contained.
- Two platforms in scope: **Android (Kotlin)** and **iOS (Swift)** — give parallel code where it helps.
- Insists on **official Google sources** over blogs. Cite R1–R15 from RESOURCES.md.
- Asked for the pages to be designed via the `ui-ux-pro-max` skill → editorial / Tufte look, light + dark, print-friendly.

## Design system (locked)
- Shared stylesheet: `../assets/course.css`. Shared toggle: `../assets/theme.js`.
- Serif reading (Newsreader) + sans labels (Public Sans) + mono for figures (JetBrains Mono).
- Accent = Tufte rust. AdMob topic chip = teal `#0a8a6f`.
- Reusable components already available: `.lesson-body` + `.sidenote`, `.callout`, `.quiz`, `.pull`, comparison tables, `.glossary`. **Reuse these before inventing new ones.**

## Teaching plan (rough, revise freely)
1. ✅ 0001 — Waterfall vs. bidding: the core mental model. *(knowledge, retrieval quiz)*
2. ✅ 0002 — eCPM, match rate & latency — the three numbers. Used AdMob's precise vocabulary (match rate = matched÷requests, show rate = impressions÷matched) rather than the loose "fill rate"; cited R12/R13/R15. Interleaved a spaced recall of L01.
3. ✅ 0003 — Building a mediation group (hybrid). Taught the *structure* conceptually (no live console/data required, per learning record) so it's familiar when they open the real console. Cited R4/R14.
4. Ad formats & where they belong — interstitial / rewarded / app-open / banner. (R8, R9)
5. Frequency capping & measuring the retention cost. *(the UX-balance payoff)* (R7)
6. Wiring it up: Kotlin + Swift SDK integration + test ads. (R5, R6)

## Open questions to ask the learner
- Do you have live apps with AdMob data already, or starting fresh? (changes lesson 2–3 to real vs. simulated numbers)
- Games or utility apps? (placement advice differs — R11)
