# Website Studio Harness

An 8-agent design studio for coding agents that one-shots agency-level websites — top-designer workflow phases, an award-caliber design constitution, adversarial critique loops, and a self-calibration protocol that evolves the harness from real user ratings.

Built and battle-tested on Claude Code; installable into any agent that reads skills or markdown instructions.

## What's inside

```
skills/
  website-studio/        ← the orchestrator: 10-phase pipeline + canon in references/
    references/constitution.md      (Award-Caliber Digital Experience Constitution)
    references/input-contract.md    (Project Input Contract: Phase-0 normalization)
  design-resource-atlas/ ← task → tool routing map (edit for your own toolchain)
  copy-craft/            ← voice charters, headline systems, banned-slop lists
  asset-art-direction/   ← shot lists, render loop, cinematographer prompting, video loops
  quality-gate/          ← 100-pt rubric + constitution floors + sufficiency/desire gate
  studio-evolve/         ← blind self-rating vs user-rating calibration experiment
agents/                  ← 8 role definitions (creative-director … critic-gauntlet)
```

**The pipeline:** normalize → discover → story → experience architecture → direction lock (devils-advocate attacked) → design system → copy deck ∥ art-directed asset generation → build (creative-technologist mandate) → motion → adversarial gauntlet loop (fresh critic each round, 12-dimension floors) → polish & ship. Every phase writes numbered artifacts to `_workspace/` so runs are resumable and auditable.

## Install

### Claude Code (full experience)
```bash
# skills
npx skills add sohamxi/website-studio-harness --agent claude-code --global
# agents (role definitions for the Agent tool)
git clone https://github.com/sohamxi/website-studio-harness /tmp/wsh && \
  mkdir -p ~/.claude/agents && cp /tmp/wsh/agents/*.md ~/.claude/agents/
```
Then say: *"Build a site for ⟨brief⟩"* — the `website-studio` skill orchestrates the rest. Say *"…in evolution mode"* to run with rating gates and the calibration protocol.

### Codex / other skills-aware agents
```bash
npx skills add sohamxi/website-studio-harness --agent codex --global
```
Agents without a subagent system: the orchestrator degrades gracefully — one agent plays the roles sequentially, using `agents/*.md` as per-phase role briefs (see AGENTS.md).

### Any agent (plain markdown)
Everything is plain markdown with no runtime dependencies. Point your agent at `skills/website-studio/SKILL.md` and keep `agents/` readable; `AGENTS.md` in this repo is the generic entry point.

## Adapting the toolchain
`design-resource-atlas` maps tasks to the specific tools this harness was built against (Higgsfield image/video generation, 21st.dev + MagicUI registries, Playwright, ui-craft instruments, tasteskill, atelier critics). Swap rows for your own stack — the pipeline, constitution, and quality gates are toolchain-agnostic.

## Provenance
Evolved across a real calibration experiment (see `skills/studio-evolve/`): a full run scored 66 → 85.2 across four adversarial gauntlet rounds, then was rated by a real user; the deltas were validated, adversarially reviewed (Codex), and fed back as permanent harness law. Example output: [Slow Waves](https://sohamxi.github.io/website-designs/) ([source + full design workspace](https://github.com/sohamxi/website-designs)).

MIT licensed. Built with Claude Code.
