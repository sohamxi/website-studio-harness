import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HARNESS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function readHarnessFile(relPath) {
  const p = join(HARNESS_ROOT, relPath);
  if (!existsSync(p)) throw new Error(`Harness file missing: ${relPath} (looked in ${p})`);
  return readFileSync(p, "utf8").trim();
}

const CONSTITUTION = readHarnessFile("skills/website-studio/references/constitution.md");
const INPUT_CONTRACT = readHarnessFile("skills/website-studio/references/input-contract.md");

function readAgent(agentId) {
  return readHarnessFile(`agents/${agentId}.md`);
}

function readSkill(relSkillPath) {
  return readHarnessFile(`skills/${relSkillPath}`);
}

const RUNTIME_PREAMBLE = `\
You are running headlessly, one phase of an automated multi-phase pipeline, with no human in the loop and no chat back-and-forth available. This message is your ENTIRE instruction set for this phase.

Ground rules for headless execution:
- You have full file read/write/edit and shell access **scoped to the current working directory only**. Do all work there.
- This prompt inlines the studio's canon (constitution + input contract), your role definition, and any craft skills relevant to this phase, so you do not need to look them up elsewhere.
- The role/skill text below may reference sub-agents, sub-skills, or slash commands (e.g. "spawn atelier:reference-scout", "run /atelier:polish", "tasteskill") that may not exist in this environment. Where a named helper is unavailable, do the equivalent work yourself with the tools you have (web search, reasoning, file tools) — never stall or ask a question back; there is no one to answer it.
- Never wait for user input. If something is genuinely unknowable, mark it \`UNKNOWN\` (or \`ASSUMPTION:\` / \`NEEDS-CLIENT-INPUT\` per the canon below) and continue.
- When you are done, STOP. Do not keep exploring or start work belonging to a later phase.`;

function taskBlock(phase, { runDirLabel = "." } = {}) {
  const inputLines = phase.inputs.map((p) => `  - \`${p}\``).join("\n") || "  (none — this is the first phase)";
  const outputLines = phase.outputs.map((p) => `  - \`${p}\``).join("\n");
  return `\
## This phase's task

**Phase:** ${phase.title}
**Working directory (run root):** \`${runDirLabel}\`

**Read these inputs first** (paths are relative to the working directory):
${inputLines}

**You must write exactly these output(s)** before stopping (create parent directories as needed):
${outputLines}

**Gate for this phase (what "done" means):**
${phase.gate}

Follow your role definition and the craft skill(s) below to do the actual work. Write real content — no lorem ipsum, no placeholder prose in a file you present as final.`;
}

/**
 * @param {import('./pipeline.js').Phase} phase
 * @param {object} opts
 * @param {string} [opts.extraContext] - appended verbatim (e.g. gauntlet scorecard, fix-round scoping note)
 */
export function buildPhasePrompt(phase, opts = {}) {
  const sections = [
    RUNTIME_PREAMBLE,
    "---\n# Canon: Award-Caliber Digital Experience Constitution\n" + CONSTITUTION,
    "---\n# Canon: Project Input Contract\n" + INPUT_CONTRACT,
    "---\n# Your role\n" + readAgent(phase.agent),
    ...phase.skills.map((s) => `---\n# Skill: ${s}\n` + readSkill(s)),
    "---\n" + taskBlock(phase, opts),
  ];
  if (opts.extraContext) sections.push("---\n" + opts.extraContext.trim());
  return sections.join("\n\n");
}

/** Prompt for a fix-round owner: same role context, scoped to one scorecard. */
export function buildFixPrompt(agentId, { scorecardPath, roundN }) {
  const sections = [
    RUNTIME_PREAMBLE,
    "---\n# Canon: Award-Caliber Digital Experience Constitution\n" + CONSTITUTION,
    "---\n# Your role\n" + readAgent(agentId),
    `---\n## Fix round ${roundN}

Read the gauntlet scorecard at \`${scorecardPath}\`. It lists ranked findings, each keyed to an owner agent.

**Fix only the findings keyed to your role (${agentId}).** If none are keyed to you, or the ones that are keyed to you are already resolved, do nothing and say so — do not touch site code or content outside your remit, and do not re-litigate findings owned by other agents.

Edit the site in place (in \`site/\`) and any workspace artifact your role owns. When finished, append a short note to \`_workspace/10_gauntlet/round-${roundN}-fixes-${agentId}.md\` listing what you changed and, for any finding you judged not worth fixing, why.`,
  ];
  return sections.join("\n\n");
}

/** Prompt for the gauntlet phase: requires a machine-readable verdict line. */
export function buildGauntletPrompt(phase, { roundN, prevScorecardPath }) {
  const base = buildPhasePrompt(phase, {
    extraContext: `## Round ${roundN}

${prevScorecardPath ? `Previous round's scorecard: \`${prevScorecardPath}\`. Verify each of its findings as fixed / regressed / open before scoring this round.` : "This is round 1 — no previous scorecard."}

**Required machine-readable header:** the FIRST line of \`_workspace/10_gauntlet/round-${roundN}-scorecard.md\` must be exactly:

\`VERDICT: PASS\` or \`VERDICT: ITERATE\` or \`VERDICT: STRUCTURAL\` or \`VERDICT: BLOCKED\`

(one of those four tokens, nothing else on that line). Everything else in the file — instrument table, panel summaries, reconciled score, ranked fix list — follows after that line, per the quality-gate skill above.`,
  });
  return base.replace(
    phase.outputs[0],
    `_workspace/10_gauntlet/round-${roundN}-scorecard.md`
  );
}

/** Prompt to generate the client-facing feedback request form (client-feedback-loop Step 1). */
export function buildFeedbackRequestPrompt({ roundN }) {
  // client-feedback-loop lives outside skills/website-studio/, read it directly.
  const skillText = readHarnessFile("skills/client-feedback-loop/SKILL.md");
  const templateText = readHarnessFile("skills/client-feedback-loop/references/feedback-form-template.md");
  const taskLines = [
    "## Task",
    "",
    "Read `_workspace/00_PROJECT_CONTEXT.md` (for the deciding questions) and `_workspace/12_ship-report.md` (for the live site location).",
    "Fill in the template above (do not just copy placeholders) and write it to " +
      `\`_workspace/13_client_feedback/request-round-${roundN}.md\`.`,
    "Then STOP — do not fabricate a client response; a human sends this form and waits for a real answer.",
  ].join("\n");
  return [
    RUNTIME_PREAMBLE,
    "---\n# Skill: client-feedback-loop\n" + skillText,
    "---\n# Form template to fill in\n" + templateText,
    "---\n" + taskLines,
  ].join("\n\n");
}

/** Prompt to convert a filled client response into a ranked, owner-keyed fix list (client-feedback-loop Step 2). */
export function buildFeedbackIngestPrompt({ roundN, responsePath }) {
  const skillText = readHarnessFile("skills/client-feedback-loop/SKILL.md");
  const taskLines = [
    "## Task",
    "",
    `Read the client's raw response at \`${responsePath}\`. Per the client-feedback-loop skill's Step 2, convert it into ` +
      `\`_workspace/13_client_feedback/round-${roundN}-fixlist.md\`: first line exactly \`VERDICT: ITERATE\` or \`VERDICT: PASS\`, ` +
      "then a ranked fix list (severity, file/section, defect in the client's own terms, fix direction, owner agent from: " +
      "frontend-artisan, motion-choreographer, story-copywriter, visual-asset-director, design-systemist).",
    "Do not editorialize away a client's dislike. If the feedback suggests the direction itself is wrong (not an execution gap), " +
      "make the first line `VERDICT: STRUCTURAL` instead and explain why in the file — do not silently downgrade a structural " +
      "problem into a list of small fixes.",
  ].join("\n");
  return [
    RUNTIME_PREAMBLE,
    "---\n# Canon: Award-Caliber Digital Experience Constitution\n" + CONSTITUTION,
    "---\n# Skill: client-feedback-loop\n" + skillText,
    "---\n" + taskLines,
  ].join("\n\n");
}

/** Prompt for a client-feedback fix-round owner: same shape as a gauntlet fix, scoped to the client fixlist. */
export function buildFeedbackFixPrompt(agentId, { fixlistPath, roundN }) {
  const taskLines = [
    `## Client feedback round ${roundN}`,
    "",
    `Read the fix list at \`${fixlistPath}\`. It lists findings from real client feedback, each keyed to an owner agent.`,
    "",
    `**Fix only the findings keyed to your role (${agentId}).** If none are keyed to you, do nothing and say so. ` +
      "Edit the site in place (in `site/`) and any workspace artifact your role owns. When finished, append a short note to " +
      `\`_workspace/13_client_feedback/round-${roundN}-fixes-${agentId}.md\` listing what you changed and, for anything you ` +
      "judged not worth fixing, why (a client-feedback finding is a strong signal — do not dismiss one without a stated reason).",
  ].join("\n");
  return [
    RUNTIME_PREAMBLE,
    "---\n# Canon: Award-Caliber Digital Experience Constitution\n" + CONSTITUTION,
    "---\n# Your role\n" + readAgent(agentId),
    "---\n" + taskLines,
  ].join("\n\n");
}
