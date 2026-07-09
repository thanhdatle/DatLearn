# Mission set, and the GLM goal corrected

The learner arrived wanting to "build a model that matches GLM performance myself." That premise
was wrong and was corrected in the first exchange: GLM-class models are hundred-billion-parameter
MoE systems trained on tens of trillions of tokens across large clusters, costing millions of
dollars in compute. No individual reproduces that. He accepted the correction immediately and
chose the **full from-scratch pipeline at small scale** as the target — Karpathy's nanochat shape:
tokenise → pretrain → midtrain → SFT → RL → eval → serve, on a model that fits this machine.

This is the highest-value record in the workspace, because the misconception it corrects is the
one that makes people quit. A learner who expects GLM-quality output from a laptop reads their own
babbling small model as *failure*. Framed correctly, that same babble is *success* — the pipeline
ran. **Every lesson must reinforce that the gap to GLM is scale, not mystery**, and must quantify
the gap in parameters, tokens, FLOPs, or dollars rather than gesturing at it.

## Established prior knowledge
- **Strong application developer.** Python comfortable. Ships real software (Android, web).
- **Little to no ML.** PyTorch, tensors, and autograd are new. Calculus is distant. Do not assume
  `nn.Linear`, "gradient," or "softmax" carry meaning yet — each must be built before it is used.
- Motivation is **pure understanding**: no career change, no product, no deadline. This removes all
  pressure to cover breadth and licenses going slow and deep on foundations.

## Implications for future sessions
- **Hard constraint: Apple Silicon, no GPU, no cloud budget.** Anything presented as runnable must
  actually run here in minutes. Anything that needs a cluster must be explicitly marked read-only.
  This rules out nanochat's own headline tier as a hands-on exercise — the *pipeline* is the lesson,
  not the scale.
- Teach maths only where it earns its place, and build it from what he has (code, counting) rather
  than assuming notation. Lesson 01 therefore introduces a language model with **zero maths and zero
  PyTorch** — a bigram model built by counting — so that "next-token distribution" is concrete
  before anything is differentiated.
- Watch for the softmax/loss lesson. It is the first place notation becomes unavoidable and the most
  likely point of failure. If it stalls, rebuild from `exp` and counting rather than pushing on.
