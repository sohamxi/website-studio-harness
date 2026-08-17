import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const STATE_DIR = "_workspace/.website-studio";
const STATE_FILE = "state.json";

export function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

export function statePath(runDir) {
  return join(runDir, STATE_DIR, STATE_FILE);
}

export function loadState(runDir) {
  const p = statePath(runDir);
  if (!existsSync(p)) {
    return { runDir, driver: null, brief: null, createdAt: null, phases: {}, gauntlet: { rounds: [] } };
  }
  return JSON.parse(readFileSync(p, "utf8"));
}

export function saveState(runDir, state) {
  const p = statePath(runDir);
  ensureDir(dirname(p));
  writeFileSync(p, JSON.stringify(state, null, 2) + "\n", "utf8");
}

export function initWorkspace(runDir, { brief, driver }) {
  ensureDir(join(runDir, "_workspace/00_input"));
  const briefPath = join(runDir, "_workspace/00_input/brief-raw.md");
  if (!existsSync(briefPath) && brief) {
    writeFileSync(briefPath, brief.trim() + "\n", "utf8");
  }
  const state = loadState(runDir);
  if (!state.createdAt) state.createdAt = new Date().toISOString();
  if (driver) state.driver = driver;
  state.brief = existsSync(briefPath) ? readFileSync(briefPath, "utf8") : brief ?? state.brief;
  saveState(runDir, state);
  return state;
}

/** Does every declared output for a phase exist and carry content? */
export function outputsSatisfied(runDir, phase) {
  return phase.outputs.every((rel) => pathHasContent(join(runDir, rel)));
}

export function pathHasContent(absPath) {
  if (!existsSync(absPath)) return false;
  const st = statSync(absPath);
  if (st.isDirectory()) {
    // directory output: satisfied if it contains at least one file (recursively-shallow check)
    try {
      return readdirSync(absPath).length > 0;
    } catch {
      return false;
    }
  }
  return st.size > 0;
}

export function readIfExists(absPath) {
  if (!existsSync(absPath)) return null;
  if (statSync(absPath).isDirectory()) return null;
  return readFileSync(absPath, "utf8");
}

export function markPhase(runDir, phaseId, patch) {
  const state = loadState(runDir);
  state.phases[phaseId] = { ...(state.phases[phaseId] ?? {}), ...patch };
  saveState(runDir, state);
  return state;
}

export function recordGauntletRound(runDir, round) {
  const state = loadState(runDir);
  state.gauntlet.rounds.push(round);
  saveState(runDir, state);
  return state;
}
