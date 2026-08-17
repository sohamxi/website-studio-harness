---
name: website-studio
description: Orchestrator for the 8-agent website studio. Use for ANY request to build, design, or redesign a website, landing page, portfolio, or marketing site — "build me a site for X", "one-shot a landing page", "make this $10K quality", "design and ship a site". Also use for ALL follow-up work — re-run, update, revise, improve the site, redo a section, fix gauntlet findings, "make it warmer/bolder", partial re-execution of any phase, or resuming an interrupted run. Simple one-file HTML questions don't need this skill.
---

# Website Studio Orchestrator

Runs an 8-agent studio that takes a brief to a shipped, gauntlet-scored site in one continuous pass. Phases mirror a top agency workflow: normalize → discover → story → experience → direction → system → content & assets → build → motion → gauntlet loop → polish & ship.

**Two front ends, one canon.** Inside a skills-aware coding agent, this file drives execution directly per the workflow below. Outside one — or when the goal is to call this pipeline as a subprocess from another tool — the standalone `website-studio` CLI (repo root `bin/`+`src/`) runs the identical phase order and gates by shelling out to a headless agentic CLI once per phase; `src/promptBuilder.js` inlines this file's canon (constitution, input contract, role, skill) into each call rather than relying on skill discovery. See the repo README's "Standalone CLI" section. The phase table, gate order, and machine-readable `VERDICT:` line below are binding for both front ends — keep `src/pipeline.js` in sync by hand if you change this workflow.

## Composition law (run-1 calibration, codex-amended)
**Every intentional pause must have a demonstrated narrative or interaction purpose — emptiness frames content, it never stands alone.** "One idea per viewport" is a hierarchy rule, not a scarcity rule: a viewport may hold one idea *richly* (image + claim + proof + path). Density and abundance are anchored to the audience's actual reference sites captured in Phase 0B — when the audience's 9/10 anchors are content-abundant, sparse-editorial is a wrong DERIVED inference regardless of how award-refined it looks. Peak sections (the thing being sold) favor rich-and-legible over sparse-and-clever; asymmetry must survive a "can a first-time visitor follow this?" read.

## Canon (read before any phase)
Two documents in `references/` are law for every run:
- **`references/constitution.md`** — the Award-Caliber Digital Experience Constitution: the primary rule (art-directed, not generated), experience-before-sections, reference-principle research, concept-level direction divergence, design-system-as-expression-rules, asset production bibles, library-as-raw-material, visual continuity, motion temperament, performance tiers, compositional responsive, brutal gauntlet, and the memory / screenshot / no-motion / originality tests. Every agent prompt includes the sections relevant to its phase.
- **`references/input-contract.md`** — the Project Input Contract: Phase 0 normalizes the raw ask into `_workspace/00_PROJECT_CONTEXT.md` (PROVIDED / DERIVED / UNKNOWN / RECOMMENDED classification, brand strength level 0–3, Experience Success Statement, CREATIVE_NORTH_STAR yaml). No agent starts without reading `00_PROJECT_CONTEXT.md`. Never block on non-critical missing info — infer, mark, continue; stop only for true blockers.

## Execution mode: hybrid
- **Preferred (when TeamCreate/TaskCreate exist):** one team for the production phases with direct SendMessage coordination; the gauntlet always runs OUTSIDE the team.
- **Fallback (this environment today):** sub-agent orchestration via the Agent tool, parallel where phases are independent, file-based data passing throughout. All Agent calls use `model: "opus"`.
- The critic-gauntlet is **always a fresh sub-agent per round**, never a team member — authorship bias is the failure this isolates against.

## Agent roster
| Agent | Definition | Phase | Key output |
|---|---|---|---|
| creative-director | `.claude/agents/creative-director.md` | 1, 3, arbiter throughout | `01_…brief.md`, `02_…references.md`, `04_…direction.md` |
| story-copywriter | `.claude/agents/story-copywriter.md` | 2, 5 | `03_…story.md`, `06_…copydeck.md` |
| experience-director | `.claude/agents/experience-director.md` | 2B | `03B_…experience.md` |
| design-systemist | `.claude/agents/design-systemist.md` | 4 | `05_…design-system.md` (DESIGN.md) |
| visual-asset-director | `.claude/agents/visual-asset-director.md` | 5 | `07_assets/` + manifest |
| frontend-artisan | `.claude/agents/frontend-artisan.md` | 6, fix rounds | `site/`, `08_build-notes.md` |
| motion-choreographer | `.claude/agents/motion-choreographer.md` | 7, fix rounds | motion code, `09_motion-notes.md` |
| critic-gauntlet | `.claude/agents/critic-gauntlet.md` | 8 (looped), 9 | `10_gauntlet/round-N-scorecard.md` |

Default stack: **Next.js (App Router) + Tailwind + shadcn/ui + motion/react**, per `atelier:award-grade-build` conventions. Deviate only on explicit user request; record the deviation in `00_input/`.

## Workflow

### Phase 0: Context check (follow-up support)
1. Does `_workspace/` exist?
   - **No** → initial run; continue to Phase 1.
   - **Yes + user asks for partial change** ("redo the copy", "warmer palette", "fix round-2 findings") → **partial re-run**: re-invoke only the owner agent(s) with the existing artifact paths in their prompt; downstream agents re-run only if their inputs changed.
   - **Yes + genuinely new brief** → archive to `_workspace_{YYYYMMDD_HHMMSS}/`, start fresh.
2. Interrupted run → resume at the first phase whose output file is missing or marked incomplete.

### Phase 0B: Normalize the ask (input contract)
Save raw brief to `_workspace/00_input/brief-raw.md`. **If `_workspace/00_input/client-intake.md` exists (see `references/client-intake-template.md`), read it first** — every field the client filled in is PROVIDED and authoritative, especially its reference-anchors section (input-contract §3), which sets the density/abundance register instead of a studio guess. Build `_workspace/00_PROJECT_CONTEXT.md` per `references/input-contract.md`: company/offering/audience/objective/conversion/brand (strength level)/creative ambition/content reality/technical reality/non-negotiables/deciding-questions/reference-anchors, every field tagged PROVIDED / DERIVED (with confidence + rationale) / UNKNOWN / RECOMMENDED. Write the Experience Success Statement and CREATIVE_NORTH_STAR. **Gate:** no fabricated facts; unknowns listed, not filled.

**No client intake yet?** Offer the client `references/client-intake-template.md` before starting a real (non-benchmark) run — it takes them under 10 minutes and materially reduces the odds of a post-ship miscalibration on density/register. Proceeding without it is fine (full DERIVED inference applies), just flag in the final report that intake was skipped.

### Phase 1: Discover & reference (creative-director)
Spawn creative-director with `00_PROJECT_CONTEXT.md`: interrogate brief (tasteskill inference), commission live references and produce the **Reference Principle Matrix** (constitution §3 — principles, not moodboards). **Gate:** brief + reference-principle files exist; assumptions flagged, not silently made.

### Phase 2: Story (story-copywriter)
Spawn with brief + references. Forced-divergence concepts → one spine. **Gate:** `03_…story.md` names one story and lists discarded concepts.

### Phase 2B: Experience architecture (experience-director)
Spawn with brief + references + story. Emotional curve, scroll topology, scene choreography, signature-moment spec, interaction grammar, technical ambitions → `03B_…experience.md`. **Gate:** curve has a marked peak; signature moment is specified (not just named); technical ambitions carry fallback tiers.

### Phase 3: Direction lock (creative-director)
Three divergent directions — each must serve the experience arc in `03B` — → pick → `devils-advocate` pass → lock into `04_…direction.md`. **Gate: no code, no tokens, no assets before this file exists.** This is the load-bearing gate of the whole pipeline.

### Phase 4: Design system (design-systemist)
DESIGN.md from the direction: tokens, type, color, archetypes, motion brief, asset treatment. **Gate:** `tokens_lint`-clean spine; motion brief present; both themes or a reasoned single theme.

### Phase 5: Content & assets — parallel
Spawn **story-copywriter** (full copy deck per `copy-craft`) and **visual-asset-director** (audit → set spec → generation per `asset-art-direction`) in parallel (`run_in_background: true` in sub-agent mode). **Gate:** deck keyed by section id with zero unsourced claims; asset manifest complete (`PENDING-GENERATION` acceptable, gray boxes are not).

### Phase 6: Build (frontend-artisan, creative-technologist mandate)
Sections built from DESIGN.md + deck + manifest; registries quarried **only for invisible primitives** — anything visible or identity-bearing is custom; `03B` technical ambitions are build-plan line items; states included; dev build verified per section.

### Phase 7: Motion (motion-choreographer)
Vocabulary from the interaction grammar → per-section choreography → the signature moment implemented to its `03B` spec → reduced-motion tiers. Compositor-first for DOM motion; canvas/WebGL where `03B` declared it. May overlap Phase 6 per-section (artisan announces section-complete).

### Phase 8: Gauntlet loop (critic-gauntlet, fresh each round)
Per `quality-gate`: render → instruments → panel → score → verdict.
- `ITERATE` → dispatch ranked fix list to owner agents (parallel where files don't overlap), re-run gauntlet.
- `STRUCTURAL` → back to Phase 3 with devils-advocate findings; downstream artifacts marked stale.
- `BLOCKED` → frontend-artisan fixes build, gauntlet re-runs.
- Max 4 rounds; round-4 non-pass ships with the gap stated honestly.

### Evolution mode (when the user says "evolution mode", or a `benchmarks/` brief is being run)
Load `studio-evolve` at run start and overlay its gate protocol on the phases:
- Pause for user review at **G1** (after Phase 3), **G3** (after Phase 5), **G4** (after Phase 7), **G5** (after Phase 8 PASS or round-4 stop). G2 folds into G3 unless the user asks for it.
- At each gate, in this exact order: freeze the blind self-rating to `_workspace/11_evolution/gate-N-self.md` → present the artifact with the rating card (no self-scores visible) → collect user scores, then verbatim reactions → reveal self-scores → record to `gate-N-user.md` → continue.
- Mid-run fixes only on user-declared blockers; log every intervention (it costs the one-shot-ness score).
- After G5, run the calibration analysis per `studio-evolve` (delta table → classified hypotheses → user validation → ≤3 changes → codex challenge → regression check → ledger + CLAUDE.md history).

### Phase 9: Polish & ship
On PASS: `/atelier:polish` details (favicon, OG, 404, focus rings, selection color), `ui-craft:finalize` verdict, then ship prep (`/atelier:ship` if deploying). Final report to user: score, rounds, `NEEDS-CLIENT-INPUT` list, known debts from build-notes.

## Data flow
```
00_input/ → 01 brief → 02 references → 03 story → 03B experience → 04 direction ⟂(LOCK)
04 + 03B → 05 design-system
05 + 03 → 06 copydeck ∥ 07_assets/          (parallel)
05 + 06 + 07 → site/ + 08 build-notes → 09 motion-notes
site/ + all → 10_gauntlet/round-N → fix lists → owners → round-N+1
```
All inter-agent data passes as files in `_workspace/` (naming: `{NN}_{agent}_{artifact}.md`). `_workspace/` is never deleted — audit trail. Final deliverable is `site/` + the last scorecard.

## Error handling
- Any agent fails → retry once with the error in the prompt; second failure → proceed with the artifact marked `MISSING`, note it in the final report, and let the gauntlet score the gap. Exception: Phase 3/4 failures halt the run (everything downstream depends on them).
- Conflicting outputs (copy vs layout, motion vs perf) → creative-director arbitrates in writing; both positions preserved in the losing agent's notes, never silently deleted.
- Tool/MCP outages → each agent's own error-handling section names its fallback; orchestrator records degradations in `00_input/degradations.md`.
- Shell/build tooling down → build proceeds source-only flagged `BUILD-UNVERIFIED`; gauntlet verdict capped at `ITERATE` (never PASS unrendered).

## Test scenarios
**Normal flow:** "Build a site for Ledgerline, a close-the-books tool for CFOs — calm, credible, not corporate-boring." → Phases 1–9; expect: locked direction file before any code, copy deck with `NEEDS-CLIENT-INPUT` for unsourced claims, ≥1 gauntlet iterate round, final PASS scorecard.
**Error flow:** Higgsfield down during Phase 5 → manifest ships `PENDING-GENERATION` with geometry placeholders; gauntlet imagery dimension scored on placeholders with the outage noted; run completes, report lists regeneration as follow-up.
**Follow-up flow:** "Make the copy more technical" on an existing `_workspace/` → Phase 0 detects partial re-run → story-copywriter only (deck edit, register delta logged) → artisan re-binds changed sections → single gauntlet round.
