import { join } from "node:path";
import { PHASES, FIX_OWNERS, findPhase } from "./pipeline.js";
import { buildPhasePrompt, buildFixPrompt, buildGauntletPrompt, buildFeedbackRequestPrompt, buildFeedbackIngestPrompt, buildFeedbackFixPrompt } from "./promptBuilder.js";
import { runDriver } from "./drivers.js";
import { outputsSatisfied, markPhase, readIfExists, recordGauntletRound, loadState } from "./workspace.js";
import { recordTelemetry } from "./telemetry.js";
import { log } from "./log.js";
import { existsSync } from "node:fs";

const DEFAULT_TIMEOUT_MS = 45 * 60 * 1000; // 45 min per driver invocation
const MAX_GAUNTLET_ROUNDS_DEFAULT = 4;

/**
 * Runs one phase's driver call, with the SKILL.md-specified error handling:
 * retry once on failure; on a second failure, critical phases halt the run,
 * non-critical phases are marked MISSING and the run continues.
 */
export async function executePhase(runDir, phase, ctx, promptOverride) {
  const inputsMissing = phase.inputs.filter((rel) => !dirLikelyExists(runDir, rel) && !readIfExists(join(runDir, rel)));
  if (inputsMissing.length && !ctx.force) {
    throw new Error(
      `${phase.id}: missing input(s) ${inputsMissing.join(", ")} — run the phases that produce them first, or pass --force.`
    );
  }

  if (!ctx.force && outputsSatisfied(runDir, phase)) {
    log.dim(`  ${phase.id}: outputs already present, skipping (use --force to redo)`);
    markPhase(runDir, phase.id, { status: "done", skipped: true });
    return { ok: true, skipped: true };
  }

  log.step(`${phase.title}`);
  markPhase(runDir, phase.id, { status: "running", startedAt: new Date().toISOString() });

  const prompt = promptOverride ?? buildPhasePrompt(phase);
  let result = await attempt();

  if (!result.ok || !outputsSatisfied(runDir, phase)) {
    log.warn(`  ${phase.id}: first attempt did not produce required outputs — retrying once`);
    result = await attempt(true, 2);
  }

  const satisfied = outputsSatisfied(runDir, phase);
  if (satisfied) {
    log.ok(`${phase.title} — done`);
    markPhase(runDir, phase.id, { status: "done", finishedAt: new Date().toISOString() });
    return { ok: true };
  }

  if (phase.critical) {
    markPhase(runDir, phase.id, { status: "failed", finishedAt: new Date().toISOString() });
    throw new Error(
      `${phase.id} is a critical/gate phase and did not produce its required output(s) after 2 attempts:\n` +
        phase.outputs.map((o) => `  - ${o}`).join("\n") +
        `\nHalting the run. Inspect the driver's output above, then resume with:\n  website-studio run --dir "${runDir}" --from ${phase.id} --force`
    );
  }

  log.warn(`  ${phase.id}: still missing outputs after retry — marking MISSING and continuing`);
  markPhase(runDir, phase.id, { status: "missing", finishedAt: new Date().toISOString() });
  return { ok: false, missing: true };

  async function attempt(isRetry = false, attemptN = 1) {
    const p = isRetry ? prompt + "\n\n---\nNOTE: this is a retry — the previous attempt did not produce the required output file(s). Make sure to actually write them." : prompt;
    const startedAt = Date.now();
    const res = await runDriver(ctx.driverName, {
      prompt: p,
      cwd: runDir,
      timeoutMs: ctx.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      model: ctx.model,
      template: ctx.driverCmd,
      log: log.child,
      phaseId: phase.id,
    });
    recordTelemetry(runDir, {
      phaseId: phase.id,
      driver: ctx.driverName,
      wallClockMs: Date.now() - startedAt,
      ok: res.ok,
      attempt: attemptN,
      exitCode: res.code ?? null,
      timedOut: Boolean(res.timedOut),
      costUsd: res.costUsd ?? null,
      tokens: res.tokens ?? null,
    });
    return res;
  }
}

function dirLikelyExists(runDir, rel) {
  // inputs that are directories (e.g. "site/") are checked loosely — a build
  // in progress may legitimately have an empty dir before its first write.
  return rel.endsWith("/");
}

function parseVerdict(scorecardText) {
  const m = scorecardText?.match(/^VERDICT:\s*(PASS|ITERATE|STRUCTURAL|BLOCKED)\b/m);
  return m ? m[1] : null;
}

/** Fan a fix round out to every owner agent in parallel; each self-scopes to its remit. */
async function runFixRound(runDir, ctx, { scorecardPath, roundN }) {
  log.step(`Fix round (after round ${roundN} ITERATE) — dispatching to owner agents`);
  await Promise.all(
    FIX_OWNERS.map(async (agentId) => {
      const prompt = buildFixPrompt(agentId, { scorecardPath, roundN });
      const startedAt = Date.now();
      const res = await runDriver(ctx.driverName, {
        prompt,
        cwd: runDir,
        timeoutMs: ctx.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        model: ctx.model,
        template: ctx.driverCmd,
        log: log.child,
        phaseId: `fix-${agentId}`,
      });
      recordTelemetry(runDir, {
        phaseId: `fix-${agentId}-round${roundN}`,
        driver: ctx.driverName,
        wallClockMs: Date.now() - startedAt,
        ok: res.ok,
        exitCode: res.code ?? null,
        timedOut: Boolean(res.timedOut),
        costUsd: res.costUsd ?? null,
        tokens: res.tokens ?? null,
      });
      log.child(`${res.ok ? "✔" : "✖"} ${agentId} fix pass`);
    })
  );
}

/**
 * Runs the Phase 8 gauntlet loop per quality-gate rules:
 * PASS → exit. ITERATE → fan-out fix round, loop. BLOCKED → re-run the build
 * phase, loop. STRUCTURAL → stop and hand back to the user (v1 does not
 * auto-rewind to Phase 3; the constitution requires a devils-advocate pass
 * a CLI heuristic shouldn't fake). Max rounds → ship with the gap stated.
 */
export async function runGauntletLoop(runDir, ctx, { maxRounds = MAX_GAUNTLET_ROUNDS_DEFAULT } = {}) {
  const gauntletPhase = findPhase("p8_gauntlet");
  let prevScorecardPath = null;

  for (let round = 1; round <= maxRounds; round++) {
    log.step(`Gauntlet — round ${round}/${maxRounds}`);
    const scorecardRel = `_workspace/10_gauntlet/round-${round}-scorecard.md`;
    const prompt = buildGauntletPrompt(gauntletPhase, { roundN: round, prevScorecardPath });

    const phaseForRound = { ...gauntletPhase, outputs: [scorecardRel] };
    const result = await executePhase(runDir, phaseForRound, ctx, prompt);

    const scorecardText = readIfExists(join(runDir, scorecardRel));
    const verdict = result.ok ? parseVerdict(scorecardText) : null;

    recordGauntletRound(runDir, { round, verdict: verdict ?? "UNPARSEABLE", scorecardPath: scorecardRel });

    if (!verdict) {
      log.warn(`  round ${round}: could not find a "VERDICT: ..." line in the scorecard — treating as ITERATE`);
    } else {
      log.ok(`  round ${round} verdict: ${verdict}`);
    }

    prevScorecardPath = scorecardRel;

    if (verdict === "PASS") return { verdict, round, scorecardPath: scorecardRel };

    if (verdict === "STRUCTURAL") {
      log.warn(
        `  round ${round}: STRUCTURAL — score isn't moving; the ceiling is in the locked direction, not execution.\n` +
          `  This needs a devils-advocate pass against Phase 3, not another mechanical fix round.\n` +
          `  Resume manually: website-studio phase p3_direction --dir "${runDir}" --force, then re-run the gauntlet.`
      );
      return { verdict, round, scorecardPath: scorecardRel, needsManualRedirection: true };
    }

    if (round === maxRounds) {
      log.warn(`  round ${round}: max rounds reached without PASS — shipping with the gap stated in the final report.`);
      return { verdict: verdict ?? "ITERATE", round, scorecardPath: scorecardRel, exhausted: true };
    }

    if (verdict === "BLOCKED") {
      log.step(`  round ${round} BLOCKED — re-running the build phase before the next round`);
      const buildPhase = findPhase("p6_build");
      await executePhase(runDir, buildPhase, { ...ctx, force: true });
    } else {
      // ITERATE (or unparseable, treated as ITERATE)
      await runFixRound(runDir, ctx, { scorecardPath: scorecardRel, roundN: round });
    }
  }
}

/** Runs the whole pipeline from a given phase id (default: the first). */
export async function runPipeline(runDir, ctx) {
  const startIndex = ctx.fromPhaseId ? PHASES.findIndex((p) => p.id === ctx.fromPhaseId) : 0;
  if (startIndex === -1) throw new Error(`Unknown --from phase id: ${ctx.fromPhaseId}`);

  // p8_gauntlet (loop) and p9_ship are driven explicitly below, never via the
  // plain sequential/parallel walk.
  const sequentialPhases = PHASES.slice(startIndex).filter((p) => !p.loop && p.id !== "p9_ship");

  const startedAtOrBeforeGauntlet = !ctx.fromPhaseId || PHASES.findIndex((p) => p.id === ctx.fromPhaseId) < PHASES.findIndex((p) => p.id === "p8_gauntlet");
  const startedAtOrBeforeShip = !ctx.fromPhaseId || PHASES.findIndex((p) => p.id === ctx.fromPhaseId) <= PHASES.findIndex((p) => p.id === "p9_ship");

  let i = 0;
  while (i < sequentialPhases.length) {
    const phase = sequentialPhases[i];
    if (phase.parallelGroup) {
      const group = [phase];
      while (sequentialPhases[i + group.length]?.parallelGroup === phase.parallelGroup) {
        group.push(sequentialPhases[i + group.length]);
      }
      log.step(`Running ${group.map((p) => p.id).join(" ∥ ")} in parallel`);
      await Promise.all(group.map((p) => executePhase(runDir, p, ctx)));
      i += group.length;
      continue;
    }
    await executePhase(runDir, phase, ctx);
    i += 1;
  }

  let gauntletResult;
  if (ctx.fromPhaseId === "p9_ship") {
    gauntletResult = { verdict: "SKIPPED", note: "started at p9_ship" };
  } else if (startedAtOrBeforeGauntlet || ctx.fromPhaseId === "p8_gauntlet") {
    gauntletResult = await runGauntletLoop(runDir, ctx, { maxRounds: ctx.maxRounds });
  }

  if ((!gauntletResult || !gauntletResult.needsManualRedirection) && startedAtOrBeforeShip) {
    const shipPhase = findPhase("p9_ship");
    await executePhase(runDir, shipPhase, ctx);
  }

  return gauntletResult;
}

export function summarizeState(runDir) {
  const state = loadState(runDir);
  return state;
}

const MAX_CLIENT_FEEDBACK_ROUNDS = 2;

async function runDriverWithTelemetry(runDir, ctx, phaseId, prompt) {
  const startedAt = Date.now();
  const res = await runDriver(ctx.driverName, {
    prompt,
    cwd: runDir,
    timeoutMs: ctx.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    model: ctx.model,
    template: ctx.driverCmd,
    log: log.child,
    phaseId,
  });
  recordTelemetry(runDir, {
    phaseId,
    driver: ctx.driverName,
    wallClockMs: Date.now() - startedAt,
    ok: res.ok,
    exitCode: res.code ?? null,
    timedOut: Boolean(res.timedOut),
    costUsd: res.costUsd ?? null,
    tokens: res.tokens ?? null,
  });
  return res;
}

/**
 * Autonomous post-ship client-feedback loop (see skills/client-feedback-loop).
 * Bounded at MAX_CLIENT_FEEDBACK_ROUNDS — this is a fix loop, not an
 * open-ended redesign loop. Two modes, both idempotent / resumable:
 *   - "request": generate _workspace/13_client_feedback/request-round-N.md
 *     and stop (waits for a real human to send it and get a real answer).
 *   - "ingest": if response-round-N.md exists, convert it to a fix list,
 *     dispatch to owner agents, and (if PASS) re-run p9_ship.
 * The CLI decides which mode based on what's on disk; see cli.js `feedback`.
 */
export async function runClientFeedbackRound(runDir, ctx) {
  if (!existsSync(join(runDir, "_workspace/12_ship-report.md"))) {
    throw new Error(
      `No ship report at _workspace/12_ship-report.md — run the pipeline through p9_ship before requesting client feedback.`
    );
  }

  const dir = "_workspace/13_client_feedback";
  let round = 1;
  while (existsSync(join(runDir, dir, `round-${round}-fixlist.md`))) round++;

  const requestPath = join(runDir, dir, `request-round-${round}.md`);
  const responsePath = join(runDir, dir, `response-round-${round}.md`);
  const responsePathRel = `${dir}/response-round-${round}.md`;

  if (!existsSync(requestPath)) {
    if (round > MAX_CLIENT_FEEDBACK_ROUNDS) {
      log.warn(
        `  client-feedback: already ran ${MAX_CLIENT_FEEDBACK_ROUNDS} rounds — per the harness's bounded-iteration rule, ` +
          `not requesting another. Ship with open items stated honestly, or start a fresh direction pass if the concept itself needs to change.`
      );
      return { status: "capped", round: round - 1 };
    }
    log.step(`Client feedback — generating request form (round ${round}/${MAX_CLIENT_FEEDBACK_ROUNDS})`);
    const prompt = buildFeedbackRequestPrompt({ roundN: round });
    await runDriverWithTelemetry(runDir, ctx, `client-feedback-request-r${round}`, prompt);
    if (existsSync(requestPath)) {
      log.ok(`  wrote ${dir}/request-round-${round}.md — send this to the client, then save their answer to ${responsePathRel} and re-run.`);
      return { status: "awaiting-request-review", round, requestPath };
    }
    log.warn(`  client-feedback: request form was not written — check the driver's output above.`);
    return { status: "failed", round };
  }

  if (!existsSync(responsePath)) {
    log.warn(`  client-feedback: waiting for ${responsePathRel} — no client response yet. Nothing to ingest.`);
    return { status: "awaiting-response", round, requestPath };
  }

  log.step(`Client feedback — ingesting response (round ${round})`);
  const ingestPrompt = buildFeedbackIngestPrompt({ roundN: round, responsePath: responsePathRel });
  await runDriverWithTelemetry(runDir, ctx, `client-feedback-ingest-r${round}`, ingestPrompt);

  const fixlistRel = `${dir}/round-${round}-fixlist.md`;
  const fixlistText = readIfExists(join(runDir, fixlistRel));
  const verdict = fixlistText?.match(/^VERDICT:\s*(PASS|ITERATE|STRUCTURAL)\b/m)?.[1] ?? null;

  if (!verdict) {
    log.warn(`  client-feedback: couldn't parse a VERDICT line from the fixlist — stopping for manual review.`);
    return { status: "unparseable", round, fixlistPath: fixlistRel };
  }
  log.ok(`  round ${round} client verdict: ${verdict}`);

  if (verdict === "STRUCTURAL") {
    log.warn(
      `  client-feedback: STRUCTURAL — the client's feedback points at the direction itself, not an execution gap. ` +
        `This needs a new Phase 3 pass (website-studio phase p3_direction --force), not a mechanical fix round.`
    );
    return { status: "structural", round, fixlistPath: fixlistRel };
  }

  if (verdict === "PASS") {
    log.ok(`  client-feedback: PASS — no fix round needed. Re-running ship report to note the client sign-off.`);
    await executePhase(runDir, findPhase("p9_ship"), { ...ctx, force: true });
    return { status: "pass", round, fixlistPath: fixlistRel };
  }

  // ITERATE
  log.step(`Client feedback round ${round} ITERATE — dispatching fix round to owner agents`);
  await Promise.all(
    FIX_OWNERS.map(async (agentId) => {
      const prompt = buildFeedbackFixPrompt(agentId, { fixlistPath: fixlistRel, roundN: round });
      const res = await runDriverWithTelemetry(runDir, ctx, `client-feedback-fix-${agentId}-r${round}`, prompt);
      log.child(`${res.ok ? "✔" : "✖"} ${agentId} client-feedback fix pass`);
    })
  );
  log.step(`Re-running ship report after client-feedback round ${round} fixes`);
  await executePhase(runDir, findPhase("p9_ship"), { ...ctx, force: true });

  if (round >= MAX_CLIENT_FEEDBACK_ROUNDS) {
    log.warn(
      `  client-feedback: round ${round} was the last allowed round (max ${MAX_CLIENT_FEEDBACK_ROUNDS}). ` +
        `Shipping with any remaining open items stated honestly in the ship report, per the harness's bounded-iteration rule.`
    );
  }
  return { status: "iterated", round, fixlistPath: fixlistRel };
}
