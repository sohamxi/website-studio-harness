// Minimal per-phase run telemetry: one JSON line appended per driver
// invocation to _workspace/00_input/run-telemetry.jsonl. No dependencies,
// no assumptions about what a driver can report (drivers here shell out to
// CLIs that mostly print to inherited stdio, not structured cost info) —
// so this captures what we can always know for free (phase id, driver,
// wall-clock ms, exit outcome, attempt/retry number) and leaves a `cost`
// field null for drivers that don't report one, rather than fabricating a
// number. Fill `cost` in a driver's return value (see drivers.js) when a
// CLI does emit usable cost/token data and this will pick it up.

import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";

const TELEMETRY_REL = "_workspace/00_input/run-telemetry.jsonl";

export function telemetryPath(runDir) {
  return join(runDir, TELEMETRY_REL);
}

/**
 * @param {string} runDir
 * @param {object} entry
 * @param {string} entry.phaseId
 * @param {string} entry.driver
 * @param {number} entry.wallClockMs
 * @param {boolean} entry.ok
 * @param {number} [entry.attempt]        - 1 = first try, 2 = retry
 * @param {number|null} [entry.exitCode]
 * @param {boolean} [entry.timedOut]
 * @param {number|null} [entry.costUsd]   - only when the driver reports one; null otherwise
 * @param {number|null} [entry.tokens]    - only when the driver reports one; null otherwise
 */
export function recordTelemetry(runDir, entry) {
  const p = telemetryPath(runDir);
  mkdirSync(dirname(p), { recursive: true });
  const line = {
    ts: new Date().toISOString(),
    phaseId: entry.phaseId ?? null,
    driver: entry.driver ?? null,
    wallClockMs: entry.wallClockMs ?? null,
    ok: entry.ok ?? null,
    attempt: entry.attempt ?? 1,
    exitCode: entry.exitCode ?? null,
    timedOut: entry.timedOut ?? false,
    costUsd: entry.costUsd ?? null,
    tokens: entry.tokens ?? null,
  };
  appendFileSync(p, JSON.stringify(line) + "\n", "utf8");
}

/** Reads and aggregates a run's telemetry for `website-studio report`. */
export function summarizeTelemetry(runDir) {
  const p = telemetryPath(runDir);
  let lines = [];
  try {
    lines = readFileSync(p, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return { entries: [], totalWallClockMs: 0, totalCostUsd: null, byPhase: {}, costKnown: false };
  }
  const byPhase = {};
  let totalWallClockMs = 0;
  let totalCostUsd = 0;
  let costKnown = false;
  for (const l of lines) {
    totalWallClockMs += l.wallClockMs ?? 0;
    if (typeof l.costUsd === "number") {
      totalCostUsd += l.costUsd;
      costKnown = true;
    }
    byPhase[l.phaseId] ??= { calls: 0, wallClockMs: 0, retries: 0, failures: 0 };
    byPhase[l.phaseId].calls += 1;
    byPhase[l.phaseId].wallClockMs += l.wallClockMs ?? 0;
    if ((l.attempt ?? 1) > 1) byPhase[l.phaseId].retries += 1;
    if (!l.ok) byPhase[l.phaseId].failures += 1;
  }
  return { entries: lines, totalWallClockMs, totalCostUsd: costKnown ? totalCostUsd : null, byPhase, costKnown };
}
