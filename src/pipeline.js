// Machine-readable mirror of skills/website-studio/SKILL.md's phase table.
// Keep this in sync by hand when SKILL.md's workflow section changes —
// it is the CLI's source of truth for order, gates, and artifact paths.

/**
 * @typedef {Object} Phase
 * @property {string} id
 * @property {string} title
 * @property {string} agent          - filename (without .md) in agents/
 * @property {string[]} skills       - filenames (relative to skills/) to inline into the prompt
 * @property {string[]} inputs       - workspace-relative paths this phase reads
 * @property {string[]} outputs      - workspace-relative paths this phase must produce (gate check)
 * @property {string} gate           - human-readable gate description, put in the prompt verbatim
 * @property {boolean} critical      - true = pipeline halts (not just marks MISSING) if this phase fails twice
 * @property {string} [parallelGroup]- phases sharing a group id run concurrently
 */

/** @type {Phase[]} */
export const PHASES = [
  {
    id: "p0_normalize",
    title: "Phase 0B — Normalize the ask",
    agent: "creative-director",
    skills: [],
    inputs: ["_workspace/00_input/brief-raw.md"],
    outputs: ["_workspace/00_PROJECT_CONTEXT.md"],
    gate: "No fabricated facts. Every field tagged PROVIDED / DERIVED / UNKNOWN / RECOMMENDED. Unknowns listed, never filled.",
    critical: true,
  },
  {
    id: "p1_discover",
    title: "Phase 1 — Discover & reference",
    agent: "creative-director",
    skills: ["design-resource-atlas/SKILL.md"],
    inputs: ["_workspace/00_PROJECT_CONTEXT.md"],
    outputs: [
      "_workspace/01_creative-director_brief.md",
      "_workspace/02_creative-director_references.md",
    ],
    gate: "Brief + reference-principle files exist; assumptions flagged, not silently made.",
    critical: false,
  },
  {
    id: "p2_story",
    title: "Phase 2 — Story",
    agent: "story-copywriter",
    skills: ["copy-craft/SKILL.md"],
    inputs: [
      "_workspace/01_creative-director_brief.md",
      "_workspace/02_creative-director_references.md",
    ],
    outputs: ["_workspace/03_story-copywriter_story.md"],
    gate: "Names one story and lists discarded concepts (forced-divergence).",
    critical: false,
  },
  {
    id: "p2b_experience",
    title: "Phase 2B — Experience architecture",
    agent: "experience-director",
    skills: [],
    inputs: [
      "_workspace/01_creative-director_brief.md",
      "_workspace/02_creative-director_references.md",
      "_workspace/03_story-copywriter_story.md",
    ],
    outputs: ["_workspace/03B_experience-director_experience.md"],
    gate: "Emotional curve has a marked peak; signature moment is specified (not just named); technical ambitions carry fallback tiers.",
    critical: false,
  },
  {
    id: "p3_direction",
    title: "Phase 3 — Direction lock",
    agent: "creative-director",
    skills: ["design-resource-atlas/SKILL.md"],
    inputs: ["_workspace/03B_experience-director_experience.md"],
    outputs: ["_workspace/04_creative-director_direction.md"],
    gate: "LOAD-BEARING GATE: three genuinely divergent directions considered, one picked, survives a devil's-advocate pass, then locked. No code, tokens, or assets exist before this file is written.",
    critical: true,
  },
  {
    id: "p4_design_system",
    title: "Phase 4 — Design system",
    agent: "design-systemist",
    skills: ["design-resource-atlas/SKILL.md"],
    inputs: [
      "_workspace/04_creative-director_direction.md",
      "_workspace/03B_experience-director_experience.md",
    ],
    outputs: ["_workspace/05_design-systemist_design-system.md"],
    gate: "Token-lint-clean spine; motion brief present; both themes or a reasoned single theme.",
    critical: true,
  },
  {
    id: "p5_content",
    title: "Phase 5 — Content (copy deck)",
    agent: "story-copywriter",
    skills: ["copy-craft/SKILL.md"],
    inputs: [
      "_workspace/05_design-systemist_design-system.md",
      "_workspace/03_story-copywriter_story.md",
    ],
    outputs: ["_workspace/06_story-copywriter_copydeck.md"],
    gate: "Deck keyed by section id, zero unsourced claims (mark NEEDS-CLIENT-INPUT instead of inventing).",
    critical: false,
    parallelGroup: "p5",
  },
  {
    id: "p5_assets",
    title: "Phase 5 — Assets (art-directed generation)",
    agent: "visual-asset-director",
    skills: ["asset-art-direction/SKILL.md", "design-resource-atlas/SKILL.md"],
    inputs: ["_workspace/05_design-systemist_design-system.md"],
    outputs: ["_workspace/07_assets/manifest.md"],
    gate: "Asset manifest complete. PENDING-GENERATION is acceptable when a generation tool is unavailable; gray placeholder boxes are not.",
    critical: false,
    parallelGroup: "p5",
  },
  {
    id: "p6_build",
    title: "Phase 6 — Build",
    agent: "frontend-artisan",
    skills: ["design-resource-atlas/SKILL.md"],
    inputs: [
      "_workspace/05_design-systemist_design-system.md",
      "_workspace/06_story-copywriter_copydeck.md",
      "_workspace/07_assets/manifest.md",
    ],
    outputs: ["_workspace/08_frontend-artisan_build-notes.md", "site/"],
    gate: "Sections built from the design system + deck + manifest; states included; dev build verified per section.",
    critical: true,
  },
  {
    id: "p7_motion",
    title: "Phase 7 — Motion",
    agent: "motion-choreographer",
    skills: ["design-resource-atlas/SKILL.md"],
    inputs: [
      "_workspace/03B_experience-director_experience.md",
      "_workspace/08_frontend-artisan_build-notes.md",
    ],
    outputs: ["_workspace/09_motion-choreographer_motion-notes.md"],
    gate: "Signature moment implemented to its 03B spec; reduced-motion tiers present.",
    critical: false,
  },
  // p8_gauntlet is a loop, not a fixed phase — handled directly by the orchestrator
  // (see orchestrator.js#runGauntletLoop). Kept here only for `status`/doc purposes.
  {
    id: "p8_gauntlet",
    title: "Phase 8 — Gauntlet loop (special: looped by the orchestrator)",
    agent: "critic-gauntlet",
    skills: ["quality-gate/SKILL.md"],
    inputs: ["site/"],
    outputs: ["_workspace/10_gauntlet/round-1-scorecard.md"],
    gate: "PASS (>=85, no dimension under floor, zero blockers) to exit the loop; max 4 rounds.",
    critical: true,
    loop: true,
  },
  {
    id: "p9_ship",
    title: "Phase 9 — Polish & ship report",
    agent: "frontend-artisan",
    skills: ["design-resource-atlas/SKILL.md"],
    inputs: ["_workspace/10_gauntlet/"],
    outputs: ["_workspace/12_ship-report.md"],
    gate: "Cheap-detail polish pass (favicon, OG, 404, focus rings, selection color) done; final report states score, rounds, and any known debts honestly.",
    critical: false,
  },
];

// Owner agents fanned out to on an ITERATE verdict. Each is told to touch only
// findings inside its remit and no-op otherwise — see promptBuilder.js.
export const FIX_OWNERS = [
  "frontend-artisan",
  "motion-choreographer",
  "story-copywriter",
  "visual-asset-director",
  "design-systemist",
];

export function findPhase(id) {
  const p = PHASES.find((p) => p.id === id);
  if (!p) throw new Error(`Unknown phase id: ${id}. Run "website-studio status" to list phases.`);
  return p;
}

export function phaseIndex(id) {
  return PHASES.findIndex((p) => p.id === id);
}
