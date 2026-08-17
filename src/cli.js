import { parseArgs } from "node:util";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { PHASES, findPhase } from "./pipeline.js";
import { initWorkspace, loadState, outputsSatisfied } from "./workspace.js";
import { executePhase, runPipeline, runGauntletLoop } from "./orchestrator.js";
import { resolveDriverName, DRIVERS } from "./drivers.js";
import { log, colors } from "./log.js";

const VERSION = "2.0.0";

const HELP = `\
website-studio — standalone CLI orchestrator for the 8-agent website studio

USAGE
  website-studio <command> [options]

COMMANDS
  init                 create/seed a run directory with a brief
  run                  run the full pipeline (init if needed)
  phase <id>           run a single phase
  status               show phase/gauntlet status for a run directory
  phases                list all phase ids
  drivers              list available drivers and how to configure a custom one
  help                 show this help

COMMON OPTIONS
  --dir <path>          run directory (default: ./website-studio-run)
  --brief "<text>"       the raw brief (init/run only)
  --brief-file <path>    read the brief from a file instead of --brief
  --driver <name>        claude | codex | custom | dry-run (default: autodetect)
  --driver-cmd "<tmpl>"  command template for --driver custom, e.g. "aider --yes --message-file {promptFile}"
  --model <name>         model name/alias passed through to the driver, if it supports one
  --timeout <seconds>    per-driver-call timeout (default: 2700 = 45 min)
  --force                ignore existing outputs / input gates and re-run anyway
  --from <phaseId>       (run only) start the pipeline at this phase, skipping earlier ones
  --max-rounds <n>       (run only) cap on gauntlet rounds (default: 4)

EXAMPLES
  website-studio run --dir ./ledgerline --brief "Ledgerline: close-the-books tool for CFOs, calm and credible" --driver claude
  website-studio run --dir ./ledgerline --driver codex --from p6_build --force
  website-studio phase p2_story --dir ./ledgerline
  website-studio status --dir ./ledgerline
  website-studio run --dir ./x --brief "..." --driver custom --driver-cmd "cursor-agent -p {promptFile} --force"
`;

function commonOptionsSpec() {
  return {
    dir: { type: "string", default: "./website-studio-run" },
    brief: { type: "string" },
    "brief-file": { type: "string" },
    driver: { type: "string" },
    "driver-cmd": { type: "string" },
    model: { type: "string" },
    timeout: { type: "string" },
    force: { type: "boolean", default: false },
    from: { type: "string" },
    "max-rounds": { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  };
}

function readBrief(values) {
  if (values.brief) return values.brief;
  if (values["brief-file"]) return readFileSync(resolve(values["brief-file"]), "utf8");
  if (!process.stdin.isTTY) {
    try {
      return readFileSync(0, "utf8"); // stdin, if piped
    } catch {
      /* no stdin available */
    }
  }
  return null;
}

function buildCtx(values, runDir) {
  const driverName = resolveDriverName(values.driver);
  if (!DRIVERS[driverName]) {
    throw new Error(`Unknown driver "${driverName}". Available: ${Object.keys(DRIVERS).join(", ")}.`);
  }
  return {
    driverName,
    driverCmd: values["driver-cmd"] ?? process.env.WEBSITE_STUDIO_DRIVER_CMD,
    model: values.model,
    timeoutMs: values.timeout ? Number(values.timeout) * 1000 : undefined,
    force: Boolean(values.force),
    fromPhaseId: values.from,
    maxRounds: values["max-rounds"] ? Number(values["max-rounds"]) : undefined,
  };
}

export async function main(argv) {
  const [command, ...rest] = argv;

  if (!command || command === "help" || command === "-h" || command === "--help") {
    console.log(HELP);
    return;
  }

  if (command === "phases") {
    for (const p of PHASES) {
      console.log(`${colors.bold(p.id.padEnd(16))} ${p.title}${p.critical ? colors.dim("  [gate]") : ""}`);
    }
    return;
  }

  if (command === "drivers") {
    console.log(`Available drivers: ${Object.keys(DRIVERS).join(", ")}\n`);
    console.log("  claude    → `claude -p <prompt> --permission-mode bypassPermissions`");
    console.log("  codex     → `codex exec -C <dir> -s workspace-write -` (prompt piped via stdin)");
    console.log("  custom    → shell out to any CLI: --driver-cmd \"<cmd with {promptFile} and/or {cwd}>\"");
    console.log("              or set WEBSITE_STUDIO_DRIVER_CMD once in your shell profile");
    console.log("  dry-run   → writes each phase's assembled prompt to _workspace/.website-studio/prompts/ and stops");
    console.log(`\nResolution order: --driver flag > WEBSITE_STUDIO_DRIVER env var > first of claude/codex found on PATH > dry-run.`);
    return;
  }

  if (command === "init") {
    const { values } = parseArgs({ args: rest, options: commonOptionsSpec(), allowPositionals: false });
    if (values.help) return console.log(HELP);
    const runDir = resolve(values.dir);
    const brief = readBrief(values);
    if (!brief) throw new Error("No brief given. Pass --brief \"...\", --brief-file <path>, or pipe one via stdin.");
    initWorkspace(runDir, { brief, driver: values.driver ? resolveDriverName(values.driver) : undefined });
    log.ok(`Initialized run at ${runDir}`);
    return;
  }

  if (command === "run") {
    const { values } = parseArgs({ args: rest, options: commonOptionsSpec(), allowPositionals: false });
    if (values.help) return console.log(HELP);
    const runDir = resolve(values.dir);
    const ctx = buildCtx(values, runDir);
    const brief = readBrief(values);
    if (!existsSync(join(runDir, "_workspace/00_input/brief-raw.md")) && !brief) {
      throw new Error(
        `No existing run at ${runDir} and no brief given. Pass --brief "..." (or --brief-file / stdin) to start a new run.`
      );
    }
    initWorkspace(runDir, { brief, driver: ctx.driverName });
    log.info(`${colors.bold("website-studio")} v${VERSION} — driver: ${colors.bold(ctx.driverName)} — dir: ${runDir}\n`);
    const result = await runPipeline(runDir, ctx);
    printFinalSummary(runDir, result);
    return;
  }

  if (command === "phase") {
    const [phaseId, ...phaseRest] = rest;
    if (!phaseId || phaseId === "-h" || phaseId === "--help") {
      console.log(HELP);
      return;
    }
    const { values } = parseArgs({ args: phaseRest, options: commonOptionsSpec(), allowPositionals: false });
    const runDir = resolve(values.dir);
    const ctx = buildCtx(values, runDir);
    if (!existsSync(join(runDir, "_workspace"))) {
      throw new Error(`No run at ${runDir} yet. Run "website-studio init" or "website-studio run" first.`);
    }
    if (phaseId === "p8_gauntlet") {
      const result = await runGauntletLoop(runDir, ctx, { maxRounds: ctx.maxRounds });
      printFinalSummary(runDir, result);
      return;
    }
    const phase = findPhase(phaseId);
    await executePhase(runDir, phase, ctx);
    return;
  }

  if (command === "status") {
    const { values } = parseArgs({ args: rest, options: commonOptionsSpec(), allowPositionals: false });
    const runDir = resolve(values.dir);
    printStatus(runDir);
    return;
  }

  throw new Error(`Unknown command "${command}". Run "website-studio help" for usage.`);
}

function printStatus(runDir) {
  if (!existsSync(join(runDir, "_workspace"))) {
    log.warn(`No run at ${runDir}`);
    return;
  }
  const state = loadState(runDir);
  console.log(`${colors.bold("Run:")} ${runDir}`);
  console.log(`${colors.bold("Driver:")} ${state.driver ?? "(not set)"}   ${colors.bold("Created:")} ${state.createdAt ?? "?"}\n`);

  for (const phase of PHASES) {
    if (phase.loop) continue;
    const st = state.phases[phase.id];
    const satisfied = outputsSatisfied(runDir, phase);
    const badge = satisfied ? colors.green("done") : st?.status === "failed" ? colors.red("failed") : st?.status === "missing" ? colors.yellow("missing") : colors.dim("pending");
    console.log(`  ${phase.id.padEnd(16)} ${badge.padEnd(20)} ${phase.title}`);
  }

  if (state.gauntlet?.rounds?.length) {
    console.log(`\n${colors.bold("Gauntlet rounds:")}`);
    for (const r of state.gauntlet.rounds) {
      console.log(`  round ${r.round}: ${r.verdict}  (${r.scorecardPath})`);
    }
  }
}

function printFinalSummary(runDir, gauntletResult) {
  console.log("");
  log.step("Run summary");
  printStatus(runDir);
  if (gauntletResult?.verdict === "PASS") {
    log.ok(`Shipped — gauntlet PASSed on round ${gauntletResult.round}.`);
  } else if (gauntletResult?.needsManualRedirection) {
    log.warn(`Stopped for manual redirection (STRUCTURAL verdict) — see the message above.`);
  } else if (gauntletResult?.exhausted) {
    log.warn(`Delivered at max rounds without PASS (verdict: ${gauntletResult.verdict}). See the round-${gauntletResult.round} scorecard for the honestly-stated gap.`);
  }
  console.log(`\nArtifacts: ${join(runDir, "_workspace")}\nSite: ${join(runDir, "site")}`);
}
