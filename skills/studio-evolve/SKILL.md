---
name: studio-evolve
description: Self-evolution protocol for the website-studio harness — blind self-ratings at each gate, real-user ratings on the same dimensions, delta analysis, hypothesis validation, and targeted harness changes with regression benchmarks. Use for "evolution mode" runs, "run the calibration analysis", "why did we disagree", "evolve the harness", "re-run the benchmark", or any request to improve the studio toward one-shot $10K quality. Also use when the user gives ratings or gate feedback on a studio run.
---

# Studio Evolve — Calibration-Driven Harness Evolution

The experiment: the studio's ratings of its own work and the real user's ratings of the same work converge, while the user's absolute scores rise. The gap between the two ratings is the training signal. High agreement at a score of 6 is calibrated mediocrity — both numbers must move.

## The two metrics
- **Calibration error**: mean |self − user| per dimension per run. Target: trending to < 1.
- **User absolute score**: target ≥ 8.5 overall at the final gate, on a true one-shot (no mid-run human fixes).

## Shared dimensions (identical for self and user, 1–10)
1. Distinctiveness — could only be this brand; passes the competitor-swap test
2. Typography & layout craft
3. Copy voice — specific, in register, no slop
4. Motion feel — one temperament, signature moment lands
5. Imagery & brand coherence
6. **$10K test** — "would I invoice/pay $10K for this as-is"
7. One-shot-ness (final gate only) — 10 = zero human intervention was needed

## Review gates
| Gate | Artifact under review | Default |
|---|---|---|
| G1 | Brief + story + locked direction (`01–04`) | always |
| G2 | Design system (`05`) | light runs: skip, fold into G3 |
| G3 | Copy deck + asset set (`06`, `07`) | always |
| G4 | Built site with motion, rendered | always — the big one |
| G5 | Post-gauntlet final | always |

## Per-gate protocol (order is the whole method)
1. **Freeze the blind self-rating first.** Before the user sees the artifact, write `_workspace/11_evolution/gate-N-self.md`: score per applicable dimension + one-line justification each. Never revised afterward — a revised blind rating is a destroyed data point.
2. **Present the artifact to the user with the rating card** (dimensions listed, no self-scores visible). Ask them to score before reacting, react in their own words after ("the moment I stopped trusting it was…" beats "7/10").
3. **Record** user scores + verbatim reactions in `gate-N-user.md`. Only then reveal self-scores.
4. **Continue the pipeline.** Delta work happens at the end, not mid-run — mid-run fixes contaminate the one-shot measurement. Exception: user marks something a blocker.

## Calibration analysis (after G5, or on "run the calibration analysis")
1. Build the delta table: dimension × gate, self vs user. Flag |delta| ≥ 2 — **both directions**: overrating = taste blind spot; underrating = broken internal standard (it makes the gauntlet gate on the wrong things).
2. For each flagged delta, generate 2–3 candidate causes, each classified:
   - **taste gap** — the model genuinely can't see the defect → fix: better references/critics/instruments
   - **instruction gap** — a skill/agent never told anyone → fix: skill or agent file
   - **process gap** — right instruction, wrong phase order or wrong owner → fix: orchestrator
   - **rubric gap** — quality-gate measures the wrong proxy → fix: quality-gate skill
   - **resource gap** — a missing tool/registry/database → fix: install + atlas row
3. **Validate with the user before changing anything** (max 3 AskUserQuestion probes, always concrete A/B artifacts — two headline samples, two screenshots — never abstract "did you mean X"). Unvalidated hypotheses are how a harness evolves toward the author's rationalizations.
4. **Adversarial pass**: run `/codex` consult on the delta table + hypotheses — Codex has no authorship stake in this harness and exists to break causal stories.
5. **Evolve — max 3 changes per run**, each traceable to a validated delta, each logged in CLAUDE.md change history with the delta that caused it. More than 3 = thrash, and next run's deltas can't be attributed.
6. **Red-team the change**: `/codex` challenge on each modified skill/agent file — "following this text exactly, how would an agent still produce the defect?" Patch the loopholes it finds.
7. **Regression check**: re-run the affected phase against a benchmark brief (below); the targeted delta must shrink next run or the change is reverted (revert is logged too).

## Benchmark briefs
`benchmarks/` holds 2–3 fixed briefs (different page kinds: SaaS landing, portfolio, editorial). They never change once written — they are the yardstick. A full one-shot re-run of a benchmark after every 2–3 evolution cycles measures absolute progress across harness versions; scorecards accumulate in `benchmarks/<name>/history/`.

## Ledger
`_workspace/11_evolution/ledger.md` (append-only, survives workspace archiving — copy forward): per run: date, harness version (CLAUDE.md history row), per-dimension calibration error, user overall, changes shipped, reverts. This is the experiment's actual output.

## Rules that keep the experiment honest
- Self-ratings are frozen blind; user rates before seeing self-ratings (anchoring kills the signal in both directions).
- One-shot-ness is measured, not aspired to: every human intervention mid-run is logged and costs the dimension a point.
- The user's vague reactions are data, not noise — decompose "feels off" with A/B probes, never dismiss it.
- Cross-model agreement (Codex + self) is a recommendation; the user's validation is the decision.
- Never relabel: if the run needed interventions, it was not a one-shot, and the ledger says so.
