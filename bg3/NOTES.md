# BG3 — teaching notes

## Learner

- **Dat.** First BG3 playthrough, **not yet started**. Difficulty **Balanced**.
- **Completed Divinity: Original Sin 2.** This is the single most important fact about him as a
  BG3 learner and it cuts both ways. See [MISSION.md](MISSION.md).
- High CRPG fluency. Never explain turn-based basics. Explain *deltas*.
- Spoiler ceiling: **Act 1 only.** Enforce this in every lesson. When tempted to cite a famous
  Act 2/3 item, don't — find an Act 1 example or teach the principle bare.

## Teaching stance (locked)

**The spine of this topic is subtraction, not addition.** Dat does not need to be taught what a
turn is. He needs *specific DOS2 reflexes deleted*, in the order they will hurt him. Research
established the damage ranking, and lessons follow it:

1. **The armour gate is gone.** DOS2 gates all CC behind stripping an armour bar, then CC is
   100% reliable. BG3 has no such gate — CC lands on a failed save, turn one, but can whiff.
   The whole tactical loop inverts. *Lead with this. It is lesson 1.*
2. **Concentration.** DOS2 stacks buffs freely. BG3 allows one concentration effect per caster,
   and damage can break it. This silently ruins a DOS2 player's opening turns.
3. **The bonus action exists.** DOS2 has a fungible AP pool. BG3 has three separate slots and a
   DOS2 player habitually leaves the bonus action unspent — throwing away a third of the turn.
4. **The alpha strike is now legal.** DOS2's round-robin turn order *structurally forbids*
   chaining ally turns. BG3 does not, and a surprise round lets attackers act unopposed. DOS2
   trained him that this is impossible; in BG3 it is the strongest opening in the game.
5. Saves replace determinism → stack save DC, target the weak save.
6. Respec is cheap (Withers, 100g) and long rests are not punished → stop playing scared.
7. Surfaces are demoted from *win condition* to *save-gated tool*.
8. Damage-type purity is a non-issue.

## Evidence labelling — non-negotiable

Carried from every other DatLearn topic, and doubly important here: **game "knowledge" is
overwhelmingly folklore.** Build guides state opinions as facts and are frequently wrong about
mechanics. Every claim in this topic is labelled:

| Badge | Means |
|---|---|
| `MECHANIC` | Verifiable in game data / bg3.wiki. A fact. |
| `CONSENSUS` | What good players believe. Defensible, not proven. Argue with it freely. |
| `INFERENCE` | My own reasoning from mechanics. Flagged as mine. |

Three things research **corrected in my own parametric knowledge** — proof the labelling is not
theatre. All three are widespread misconceptions and all three are taught explicitly:

- **Initiative is `1d4 + DEX`, not `d20`.** The die range is tiny, so DEX and Alert (+5, larger
  than the entire die) dominate. I would have taught this wrong.
- **High Ground is a flat `+2`, not advantage.** (Low ground is `−2`.) Almost every casual guide
  says "advantage."
- **Backstab / flanking grant no advantage** in the released game. It was an Early Access thing.

## Open questions to verify in-game (do not teach as settled)

- **Does Prone actually break concentration?** bg3.wiki says yes; that diverges from 5e RAW and
  smells like a wiki error. If true it is a big deal — it means Grease/Ice (the surfaces a DOS2
  player reaches for by instinct) can break *your own team's* concentration. Currently taught
  with an explicit hedge.
- **Withers respec = 100g** — confirmed on bg3.wiki, but worth an eyeball in-game.
- **Multiclass spell-slot rounding** — bg3.wiki uses "rounded up" and "rounded down" on the same
  page. Out of scope for now (single-class first run), but do not teach a number until resolved.
- Which specific quests are rest-sensitive. No source enumerates them. Never claim "resting is
  always free" without the hedge.

## Design system

Shared `assets/course.css`, **not forked** — plus `bg3/assets/bg3.css`, a topic skin scoped to
`<html data-topic="bg3">`, exactly the pattern `strength.css` established.

- **Topic colour: `#8a5a00` light / `#e8b04b` dark.** Bronze/gold. *Measured, not guessed:*
  5.67:1 and 9.43:1 on their respective papers, hue 39°, which is 104° from the nearest existing
  topic (admob 167°, strength 232°, llm 295°). Comfortably clears HUB.md's ≥40° rule.
- Display type is **Cinzel** (an inscriptional Roman face — carries the Faerûn register without
  going full fantasy-novel), UI stays Public Sans, prose stays Newsreader.
- **Typography follows *when* a doc is read.** Lessons = serif, read once, slowly, at a desk.
  Reference = sans, read *mid-fight, on a second monitor, while a goblin waits.* Same rule the
  strength topic uses for phone-in-the-gym.
- BG3-specific components live in `bg3.css`: `.dice` (the d20 roll walkthrough), `.roll-line`,
  `.slot-grid` (action economy), `.vs` (the DOS2→BG3 two-column contrast — the workhorse of this
  topic), `.evidence` badges, `.tip`.
- `ui-ux-pro-max`'s `--design-system` generator was run and its output **rejected**: it returned
  Claymorphism + Baloo 2 + Comic Neue (a children's-education recommendation). Its *rule* layer
  was kept — 4.5:1 both themes, visible focus rings, reduced-motion, tabular figures, no emoji as
  icons, tables that scroll inside their own container.

## Where to go next

Lessons 1 and 2 are live (armour gate; three slots). The ranked list above is the backlog —
**concentration is lesson 3** and it is the highest-value thing left. After that: the alpha
strike / surprise round, then save-DC targeting.

Do **not** drift into build lists. The mission says competence, not optimisation, and Dat has not
started playing. Teach him to read the game, and the builds take care of themselves.
