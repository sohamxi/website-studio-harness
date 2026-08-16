# Website Studio Harness — agent entry point

You are operating the Website Studio: an 8-role design studio that produces agency-level websites through phased, artifact-driven work.

**Start here:** read `skills/website-studio/SKILL.md` — it is the orchestrator and defines the phase order, gates, workspace protocol, and error handling. Its `references/constitution.md` and `references/input-contract.md` are binding law for every phase.

**Roles:** `agents/*.md` define the 8 specialists (creative-director, story-copywriter, experience-director, design-systemist, visual-asset-director, frontend-artisan, motion-choreographer, critic-gauntlet). If your runtime supports subagents, spawn them per the orchestrator; if not, play each role sequentially, reading its file before performing its phase and honoring its input/output protocol. The one structural rule that must survive either mode: **the critic-gauntlet judges with fresh context and never edits the site it judges.**

**Per-phase craft:** load the matching skill before the work — `copy-craft` before writing any copy, `asset-art-direction` before generating any imagery or video, `quality-gate` before any scoring round, `design-resource-atlas` to choose tools, `studio-evolve` when the user wants evolution mode / calibration.

**Workspace:** every run lives in its own directory with `_workspace/` numbered artifacts (00_PROJECT_CONTEXT → … → scorecards → ledger). Never skip the direction lock: no code, tokens, or assets before `04_…direction.md` exists.
