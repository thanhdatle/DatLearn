# Mission: LLM Foundations — build one, end to end, on my own machine

## Why
I use language models every day and I cannot explain what happens inside them. That bothers me.
I want the black box opened — not by reading about it, but by **building the whole pipeline
myself**, from raw text to a model that generates. Not to ship a product, not to change careers.
To know. When someone says "we distilled a 32B MoE with GRPO," I want that sentence to be made
of things I have personally implemented, at whatever scale my laptop allows.

## Success looks like
- I can **write a working transformer from an empty file** — tokeniser, embedding, attention, MLP, training loop — without copying, and explain why each part exists.
- Given any tensor in the forward pass, I can state its **shape and what each axis means**.
- I have **personally run every stage** of the pipeline: tokenise → pretrain → midtrain → SFT → RL → eval → serve, on a model small enough to train on this Mac.
- I can read a frontier model's technical report (GLM, DeepSeek, Qwen) and identify **which parts are the same as what I built** and which are genuinely new.
- I can name the specific reason a given idea exists — why RoPE over learned positions, why RMSNorm over LayerNorm, why MoE at all — rather than knowing only that it is used.
- **6–12 months from now:** a repo I wrote containing a small language model I trained from scratch, and a written explanation of the gap between it and GLM that is about *scale and compute*, not about mystery.

## Constraints
- **Apple Silicon Mac only.** No CUDA, no cluster, no cloud budget. Everything must run on MPS or CPU in minutes, not hours. If a lesson can't be run, it must be honest that it is read-only.
- **Strong app developer, little ML.** Python is fine; PyTorch, tensors, and autograd are new. Calculus is a distant memory and must be rebuilt only where it earns its place.
- Learning is the entire point — there is no deadline and no deliverable but understanding.
- Lessons must be short, interactive, self-contained, and revisitable.

## The GLM question — scoped honestly
The original ask was "build a model that matches GLM performance myself." **That is not possible
and no lesson will pretend otherwise.** GLM-4.5 is a 355B-total / 32B-active mixture-of-experts
model trained on 23 trillion tokens ([tech report](https://arxiv.org/abs/2508.06471)).

Zhipu has **never published a training cost**, so no lesson may quote one as fact. What a lesson
*may* do is derive it, which is more useful anyway. Using the standard `C ≈ 6ND` approximation
(Kaplan 2020) with the active parameter count: `6 × 32e9 × 23e12 ≈ 4.4×10²⁴` FLOPs. At an H100's
989 TFLOP/s dense BF16 and a realistic 35–45% utilisation, that is **≈2.8–3.5 million H100-hours**,
or roughly **$5.5M–$10.6M** at $2–3/GPU-hour — about 120 days on a thousand H100s. The number is an
estimate; the *method* is the point, and he should be able to reproduce it by the end.

What this workspace delivers instead, in order:
1. **The same pipeline, 1/1000th the scale.** Every stage GLM's team ran, I run.
2. **The same architecture, understood.** GLM's specific design choices, implemented small enough to train here.
3. **An honest accounting of the gap.** By the end I should be able to say precisely what separates my model from GLM — and every item on that list should be a number (parameters, tokens, FLOPs, dollars), not a secret.

Reaching GLM's *capability* is out of scope. Reaching GLM's *comprehensibility* is the mission.

## Out of scope (for now)
- Training anything that needs a GPU cluster or paid cloud compute.
- Production serving, inference optimisation, quantisation for deployment.
- Prompt engineering and agent frameworks — this is about what's under them.
- Fine-tuning as a product skill (LoRA on someone else's base to ship a thing). It appears only as a stage of the pipeline, to be understood.
- The research frontier for its own sake. New ideas enter only when they explain something I built.
