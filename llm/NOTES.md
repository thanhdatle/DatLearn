# Teaching notes — LLM Foundations

## Who I'm teaching
Strong application developer (Android/web, ships real things). Python is comfortable.
**PyTorch, tensors, autograd, and the calculus behind them are new.** Treat every ML
primitive as unfamiliar until he has built it. Never assume `nn.Linear` means anything yet.

He learns by doing and revisits material later. Lessons are short, self-contained, interactive.

## Hard constraints on every lesson
- **Apple Silicon, no GPU, no cloud.** Any code presented as runnable must actually run on
  MPS/CPU in minutes. If something requires a cluster, say so explicitly and mark it read-only.
- **No hand-waving.** He is here to remove mystery, so "and then attention happens" is a failure.
- **Shapes always.** Every tensor introduced gets its shape and the meaning of each axis. This is
  the single highest-leverage habit for someone new to ML, and it becomes a reference doc.
- **Say the scale.** When citing a frontier result, give the parameter count, token count, and
  hardware. The gap between his model and GLM must always be a *number*, never a vibe.

## Design direction (from `/ui-ux-pro-max`, then overruled where it was wrong)
The skill's `--design-system` pass returned **Claymorphism** ("children education apps",
anti-pattern: "muted colors"). Rejected — bubbly 3D clay around backprop equations is hostile to
the content. Kept the parts that survived judgment:

- **Base:** the shared `assets/course.css` — warm-paper editorial/Tufte. Not forked.
- **Skin:** `llm/assets/llm.css`, scoped to `<html data-topic="llm">`, same pattern as `strength`.
- **Type:** Newsreader stays for prose (long-form legibility). Headings and labels move to
  **IBM Plex Sans** — the technical-documentation voice the skill recommended, and distinct from
  strength's Barlow. Code and all tensor shapes in **JetBrains Mono** with tabular figures.
- **Topic colour: deep plum `#86198f` light / `#e879f9` dark.** This is the skill's *own* palette
  advice ("editorial black + accent pink") at an accessible lightness — so the search was right about
  colour even while being wrong about style. I first chose teal `#0f766e` and **measured my way out of
  it**: it sits only 8° of hue from admob's `#0a8a6f`, so the two topic chips on the hub would read as
  one topic. Plum is 128° from admob, 63° from strength's indigo. Contrast (WCAG 2.x relative
  luminance, computed not guessed): 7.89:1 on light paper; 7.49:1 on dark paper and 6.94:1 on dark
  surface — chips sit on *surface*, so both had to be checked.

  **Rule for the next topic colour:** check hue separation from the existing chips, not just
  contrast. Contrast keeps text legible; hue separation keeps topics distinguishable.
- **Bespoke components** (the anti-template requirement — these are what make it look like *this*
  course and not a template):
  - `.shape` — inline tensor-shape badge, e.g. `(B, T, C)`, mono + tabular.
  - `.code-annot` — code block with a margin gutter, notes anchored per line (Tufte sidenotes for code).
  - `.dimflow` — dimension-flow diagram showing a tensor changing shape through layers.
  - `.scale-bar` — visual comparison of his model vs GLM on a log axis. Used to keep the gap honest.
  - `.probs` — a token-probability bar strip; the recurring visual motif of the whole course.

## Recurring motif
**The probability strip.** Every lesson that touches the model's output shows the same widget:
a row of candidate next tokens with their probabilities. It is the one picture that carries from
lesson 1 (a bigram counting table) to the end (a trained transformer). Reuse it, don't reinvent it.

## Rules for skills practice
- Quiz options: same word count, same character count where possible. No formatting tells.
- Prefer widgets where the learner *predicts before revealing*. Retrieval, not recognition.
- Interleave: once there are ≥3 lessons, later quizzes should pull questions from earlier ones.

## Open questions to revisit with him
- Does he want to write the Python locally alongside the browser lessons, or keep the browser as the
  only surface until the concepts land? (Assume: browser first, then a local repo from ~lesson 4.)
- Comfort with maths notation. Lesson 01 avoids it entirely; watch whether lesson 02's `softmax`
  lands or needs a rebuild from `exp`.
