// A "driver" knows how to hand a phase prompt to some headless agentic CLI
// and let it run with file/tool access inside a working directory. Every
// driver implements the same shape:
//
//   async run({ prompt, cwd, timeoutMs, model, log }) -> { ok, code, signal }
//
// The driver's job is I/O plumbing only — no phase/gate logic lives here.

import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function spawnStreamed(cmd, args, { cwd, timeoutMs, input, log }) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: [input ? "pipe" : "inherit", "inherit", "inherit"] });
    let timedOut = false;
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGTERM");
        }, timeoutMs)
      : null;

    if (input && child.stdin) {
      child.stdin.write(input);
      child.stdin.end();
    }

    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(new Error(`failed to launch "${cmd}": ${err.message}`));
    });
    child.on("close", (code, signal) => {
      if (timer) clearTimeout(timer);
      if (timedOut) {
        log?.(`⏱  "${cmd}" timed out after ${timeoutMs}ms and was killed`);
      }
      resolve({ ok: code === 0 && !timedOut, code, signal, timedOut });
    });
  });
}

/** claude -p, headless, permission-safe for an unattended run. */
async function claudeDriver({ prompt, cwd, timeoutMs, model, log }) {
  const args = [
    "-p",
    prompt,
    "--permission-mode",
    "bypassPermissions",
    "--output-format",
    "text",
  ];
  if (model) args.push("--model", model);
  log?.(`→ claude -p (cwd=${cwd})`);
  return spawnStreamed("claude", args, { cwd, timeoutMs, log });
}

/** codex exec, sandboxed to the run directory, prompt via stdin. */
async function codexDriver({ prompt, cwd, timeoutMs, model, log }) {
  const args = ["exec", "-C", cwd, "-s", "workspace-write", "--skip-git-repo-check", "-"];
  if (model) args.push("-m", model);
  log?.(`→ codex exec (cwd=${cwd})`);
  return spawnStreamed("codex", args, { cwd, timeoutMs, input: prompt, log });
}

/**
 * Generic driver for any other agentic CLI: a shell command template with
 * {promptFile} and {cwd} placeholders. Configure via --driver-cmd or the
 * WEBSITE_STUDIO_DRIVER_CMD env var, e.g.:
 *   --driver-cmd "aider --yes --message-file {promptFile}"
 *   --driver-cmd "cursor-agent -p {promptFile} --force"
 */
async function customDriver({ prompt, cwd, timeoutMs, log, template }) {
  if (!template) {
    throw new Error(
      'driver "custom" needs a command template: pass --driver-cmd "<cmd with {promptFile}>" or set WEBSITE_STUDIO_DRIVER_CMD.'
    );
  }
  const dir = mkdtempSync(join(tmpdir(), "website-studio-"));
  const promptFile = join(dir, "prompt.md");
  writeFileSync(promptFile, prompt, "utf8");
  const filled = template.replaceAll("{promptFile}", promptFile).replaceAll("{cwd}", cwd);
  log?.(`→ custom driver: ${filled}`);
  try {
    return await spawnStreamed("/bin/sh", ["-c", filled], { cwd, timeoutMs, log });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Writes the prompt to a file inside the run's log dir and does nothing else — for scripting/inspection. */
async function dryRunDriver({ prompt, cwd, log, phaseId }) {
  const dir = join(cwd, "_workspace/.website-studio/prompts");
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${phaseId ?? "phase"}.md`);
  writeFileSync(p, prompt, "utf8");
  log?.(`✎ dry-run: wrote prompt to ${p} (no agent invoked)`);
  return { ok: true, code: 0, dryRun: true };
}

export const DRIVERS = {
  claude: claudeDriver,
  codex: codexDriver,
  custom: customDriver,
  "dry-run": dryRunDriver,
};

export function resolveDriverName(explicit) {
  if (explicit) return explicit;
  if (process.env.WEBSITE_STUDIO_DRIVER) return process.env.WEBSITE_STUDIO_DRIVER;
  // Best-effort autodetect: prefer claude, then codex, in PATH.
  for (const [name, bin] of [["claude", "claude"], ["codex", "codex"]]) {
    if (isOnPath(bin)) return name;
  }
  return "dry-run";
}

function isOnPath(bin) {
  const paths = (process.env.PATH ?? "").split(":");
  const exts = process.platform === "win32" ? [".exe", ".cmd", ""] : [""];
  return paths.some((dir) => {
    try {
      return exts.some((ext) => existsSync(join(dir, bin + ext)));
    } catch {
      return false;
    }
  });
}

export async function runDriver(name, opts) {
  const fn = DRIVERS[name];
  if (!fn) {
    throw new Error(`Unknown driver "${name}". Available: ${Object.keys(DRIVERS).join(", ")}.`);
  }
  return fn(opts);
}
