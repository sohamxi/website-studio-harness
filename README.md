# Website Studio Harness

An 8-agent design studio for coding agents that one-shots agency-level websites — top-designer workflow phases, an award-caliber design constitution, adversarial critique loops, and a self-calibration protocol that evolves the harness from real user ratings.

Built and battle-tested on Claude Code. Two ways to run it: as skills/agents inside a skills-aware coding agent, or as a standalone `website-studio` CLI that drives any headless agentic CLI (Claude Code, Codex, or your own) directly — see Install below.

## What's inside

```
bin/website-studio.js   ← CLI entry point
src/                     ← the standalone orchestrator (pipeline, gates, drivers, state) — zero runtime deps
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

The CLI in `bin/`+`src/` and the markdown in `skills/`+`agents/` are two front ends over the same canon: `src/promptBuilder.js` inlines the exact same constitution, input contract, role, and skill files that Claude Code loads natively, so a run behaves the same regardless of which front end drives it.

**The pipeline:** normalize → discover → story → experience architecture → direction lock (devils-advocate attacked) → design system → copy deck ∥ art-directed asset generation → build (creative-technologist mandate) → motion → adversarial gauntlet loop (fresh critic each round, 12-dimension floors) → polish & ship. Every phase writes numbered artifacts to `_workspace/` so runs are resumable and auditable.

## Install

### Standalone CLI (any agentic tool, no skill system required)
The `website-studio` CLI is a thin, dependency-free Node orchestrator (`src/`) that drives the same 10-phase pipeline by shelling out to a headless agentic CLI once per phase — it needs no MCP server and no host-specific plugin format, so any tool that can run a shell command can drive it, or be driven by it.

```bash
npm install -g website-studio-harness   # or: npx website-studio-harness <command>

website-studio run --dir ./ledgerline \
  --brief "Ledgerline: a close-the-books tool for CFOs. Calm, credible, not corporate-boring." \
  --driver claude          # or: --driver codex

website-studio status --dir ./ledgerline
```

Each phase gets a **self-contained prompt** (constitution + input contract + role definition + relevant craft skill, all inlined) and runs as one headless call to the chosen driver, scoped to the run directory. State, resumability, and gate enforcement (no code before the direction lock, no ship before a PASS or an honestly-stated gap) live in the orchestrator, not in the driver.

**Built-in drivers:** `claude` (`claude -p ... --permission-mode bypassPermissions`), `codex` (`codex exec -s workspace-write`). **`custom`** wires up anything else — pass a command template:
```bash
website-studio run --dir ./x --brief "..." \
  --driver custom --driver-cmd "aider --yes --message-file {promptFile}"
```
`{promptFile}` and `{cwd}` are substituted; set `WEBSITE_STUDIO_DRIVER_CMD` once in your shell profile instead of passing `--driver-cmd` every time. `--driver dry-run` (the default when nothing else is on `PATH`) writes each phase's assembled prompt to `_workspace/.website-studio/prompts/` without invoking anything — useful for inspecting exactly what a phase would be asked to do.

Other useful commands: `website-studio phase <id> --dir <path> [--force]` re-runs one phase; `website-studio phases` lists every phase id; `website-studio run --from <id> --force` resumes or redoes from a given point; `--max-rounds <n>` caps the gauntlet loop (default 4, matching `quality-gate`).

**v1 scope, honestly stated:** an `ITERATE` verdict fans the fix round out to all five owner agents in parallel (each is told to touch only findings in its own remit and no-op otherwise) rather than parsing per-finding ownership out of the scorecard prose. A `STRUCTURAL` verdict stops the run for a manual `website-studio phase p3_direction --force` + devils-advocate pass rather than auto-rewinding — that decision is deliberately not one a mechanical loop should make for you. Evolution mode's gate-by-gate user review isn't wired into the CLI loop yet; run it inside Claude Code (below) for that path.

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
