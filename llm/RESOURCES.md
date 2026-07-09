# LLM Foundations — Resources

Every claim in a lesson traces to something here. Verified July 2026.

## Knowledge — the from-scratch path (the spine of this workspace)

- [Neural Networks: Zero to Hero — Andrej Karpathy](https://karpathy.ai/zero-to-hero.html)
  Free video course: micrograd (backprop from nothing) → makemore (bigram → MLP → attention) →
  GPT → tokenizer. **The single best entry point for someone with code but no ML.** Start at
  micrograd; it builds autograd in ~100 lines before PyTorch is ever mentioned.
  Use for: everything through lesson ~6. The lesson order in this workspace deliberately shadows it.

- [Let's build GPT: from scratch, spelled out — Karpathy (2h13m)](https://www.youtube.com/watch?v=kCc8FmEb1nY)
  The canonical spelled-out transformer build. Use for: the attention lesson, and as the primary
  source once tokens and embeddings are understood.

- [Build a Large Language Model (From Scratch) — Sebastian Raschka](https://www.manning.com/books/build-a-large-language-model-from-scratch)
  · [companion repo, ~99k stars](https://github.com/rasbt/LLMs-from-scratch)
  Manning, ISBN 9781633437166. The definitive *written* from-scratch build in PyTorch (ch 1–7 plus a
  LoRA appendix), explicitly designed to run on a laptop. Use for: when video is too fast and you
  want to read and re-read. The repo alone is free and worth working through.

- [nanoGPT — Karpathy](https://github.com/karpathy/nanoGPT)
  ~300-line training + model files, MIT. The char-level Shakespeare config trains in minutes on a
  MacBook (MPS). Use for: the first model *you* train on this machine.

- [nanochat — Karpathy](https://github.com/karpathy/nanochat)
  · [Discussion #1: the budget tiers](https://github.com/karpathy/nanochat/discussions/1)
  The complete ChatGPT-shaped pipeline in one repo: tokenise → pretrain → midtrain → SFT → RL →
  eval → web UI. **This workspace's target shape.** Read the tiers honestly: the marquee speedrun is
  ~$48 / ~2h, and the "$100" tier is depth-20 (560M params, 11.2B tokens, 3h51m, CORE 0.2219 —
  between GPT-2 large and XL, and by Karpathy's own description "like talking to a kindergartener").
  **Every tier needs an 8×H100 node.** None of them run on a Mac. We reproduce the *pipeline*, not
  the scale.

- [Let's build the GPT Tokenizer — Karpathy (2h13m, Feb 2024)](https://www.youtube.com/watch?v=zduSFxRajkE)
  · [minbpe repo](https://github.com/karpathy/minbpe)
  Builds a GPT-4-grade BPE tokeniser from an empty file. Primary source for Lesson 02. Karpathy's own
  framing: "a lot of weird behaviors and problems of LLMs actually trace back to tokenization."

- [Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909)
  Sennrich, Haddow & Birch (arXiv 2015, ACL 2016). The paper that brought BPE from text compression to
  language. Short and readable. The origin of the algorithm in Lesson 02.

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/)
  Percy Liang & Tatsunori Hashimoto. Free lectures + 5 assignments (basics, Triton FlashAttention-2,
  fitting scaling laws, Common Crawl data, alignment/RL). Graduate-level, assumes strong PyTorch.
  Use for: the rigorous second pass, once the Karpathy path is done.

## Knowledge — the papers, in the order they'll matter

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Vaswani et al., NeurIPS 2017. The Transformer.
- [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) — Kaplan et al., OpenAI 2020. Loss is a power law in parameters, data, and compute. Source of the `C ≈ 6ND` estimate used throughout this workspace.
- [Training Compute-Optimal LLMs (Chinchilla)](https://arxiv.org/abs/2203.15556) — Hoffmann et al., DeepMind 2022. ≈20 tokens per parameter. Use for: deciding how big *your* model should be for a given budget.
- [TinyStories](https://arxiv.org/abs/2305.07759) — Eldan & Li, Microsoft Research. Sub-10M-parameter models write fluent, coherent children's English; all trainable on a single V100 in ≤30h. **The permission slip for this entire mission** — small models are not toys if the data is narrow.
- [Language Models are Few-Shot Learners (GPT-3)](https://arxiv.org/abs/2005.14165) — Brown et al., 2020. In-context learning.
- [Training LMs to follow instructions (InstructGPT / RLHF)](https://arxiv.org/abs/2203.02155) — Ouyang et al., OpenAI 2022. SFT → reward model → PPO. The recipe that turned a base model into ChatGPT.
- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290) — Rafailov et al., NeurIPS 2023. Preference alignment without RL.
- [LoRA](https://arxiv.org/abs/2106.09685) · [QLoRA](https://arxiv.org/abs/2305.14314) — low-rank adapters; 4-bit NF4 puts a 65B fine-tune on one 48GB GPU.
- [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531) — Hinton et al. And [Distilling Step-by-Step](https://arxiv.org/abs/2305.02301), Google 2023: a **770M student beats 540B PaLM on-task** — the honest answer to "can I ever match a giant?" (yes, on one narrow task, by distillation — never in general).
- MoE lineage, for reading GLM: [Switch Transformer](https://arxiv.org/abs/2101.03961) → [Mixtral](https://arxiv.org/abs/2401.04088) → [DeepSeekMoE](https://arxiv.org/abs/2401.06066).

## Knowledge — GLM specifically

- [GLM-4.5 technical report](https://arxiv.org/abs/2508.06471) — the primary source. **355B total / 32B active**, 1 shared + 128 routed experts, 8 routed per token, 96 heads at hidden 5120, **23T training tokens**. MIT licensed.
- [GLM-4.5 Meets SGLang — LMSYS](https://www.lmsys.org/blog/2025-07-31-glm4-5/) — the clearest plain-English breakdown of what makes GLM *not* a Llama clone: sigmoid-gated **loss-free (aux-loss-free) load balancing**, **GQA with partial RoPE**, **QK-Norm**, an **MoE multi-token-prediction layer** for speculative decoding, and a deliberate **depth-over-width** choice.
- [GLM-4.6 model card](https://huggingface.co/zai-org/GLM-4.6) — **357B/32B** (note: not 355B), context raised to **200K**, MIT.
- [GLM-5 report](https://arxiv.org/abs/2602.15763) (Feb 2026) — adds **Dynamic Sparse Attention** and asynchronous-RL post-training. Reported ~744B total / 40B active by secondary sources; **the abstract does not state the size**, so cite it as unconfirmed.
- [HF `glm4_moe` implementation](https://huggingface.co/docs/transformers/model_doc/glm4_moe) — the actual code. Read it once you've written your own attention.
- [GLM-4-9B](https://huggingface.co/THUDM/glm-4-9b-chat) — GLM's only realistically solo-fine-tunable open model.

> **Never quote a GLM training cost as fact.** Zhipu has not published one. Derive it: `C ≈ 6ND`
> → `6 × 32e9 × 23e12 ≈ 4.4×10²⁴` FLOPs → ≈3M H100-hours at 35–45% MFU → ≈$5.5–10.6M at $2–3/GPU-hr.

## Knowledge — what one person can actually do

- [Unsloth VRAM requirements](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md)
  Tested minimums: 7B needs **5GB QLoRA / 19GB LoRA**; 14B needs 8.5/33. A 24GB card QLoRA-fits ≤14B.
- [Apple MLX examples — LoRA](https://github.com/ml-explore/mlx-examples)
  **The Apple Silicon path.** LoRA/QLoRA on Apple's own framework. Relevant to this workspace's hardware in a way CUDA tutorials are not.
- [modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt)
  The GPT-2 speedrun leaderboard — currently **1.32 minutes** on 8×H100 (record #84, May 2026), versus 45 minutes for the 2024 llm.c baseline. Read for: what training-efficiency research actually looks like (Muon, RoPE, QK-norm, FP8). Not a beginner repo.
- [The Ultra-Scale Playbook — Hugging Face](https://huggingface.co/spaces/nanotron/ultrascale-playbook)
  What happens when one GPU isn't enough: 3D parallelism, expert parallelism. Read-only for us, but it's the bridge from "my model" to "GLM's cluster."

## Wisdom (Communities)

- [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/) — ~700k members, the front page of open-weights LLMs. Use for: hardware reality checks, "will this run on my Mac," new model releases. High volume, moderate signal.
- [EleutherAI Discord](https://www.eleuther.ai/) — research-grade (GPT-Neo, Pythia, The Pile). Use for: training internals and interpretability questions you can't answer from a repo. Read for a week before posting.
- [nanochat Discussions](https://github.com/karpathy/nanochat/discussions) — the stable Q&A venue for from-scratch learners; Karpathy participates. Use for: "why does my loss look like this."
- [Hugging Face Forums](https://discuss.huggingface.co/) — official, beginner-friendly, active. Use for: tooling and library questions.
- [fast.ai Forums](https://forums.fast.ai/) — long-running, unusually kind to beginners.

**Community preference: not yet asked.** Raise it around lesson 3, once he has a trained model and
something worth showing. Posting a loss curve is a better first post than a question.

## Gaps

- **No trusted, current, end-to-end "train a small LM on Apple Silicon (MPS)" guide has been found.**
  nanoGPT runs on MPS but its docs are CUDA-first; MLX examples cover fine-tuning, not pretraining
  from scratch. This is the single most mission-critical gap — the hardware constraint is absolute.
  Until it's filled, lessons must verify MPS behaviour empirically rather than cite a guide.
- No high-trust source found for **MPS-specific performance pitfalls** (fp16/bf16 support, ops that
  silently fall back to CPU). Likely needs primary testing on this machine and a reference doc of
  our own.
- GLM-5's architecture (Dynamic Sparse Attention) has a paper but **no accessible explainer** yet.
  Defer the GLM-architecture lesson to 4.5/4.6, which are well documented, and revisit.
