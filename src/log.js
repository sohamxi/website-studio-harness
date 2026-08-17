const colors = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

export const log = {
  info: (msg) => console.log(msg),
  step: (msg) => console.log(colors.cyan("▸ ") + colors.bold(msg)),
  ok: (msg) => console.log(colors.green("✔ ") + msg),
  warn: (msg) => console.log(colors.yellow("⚠ ") + msg),
  err: (msg) => console.log(colors.red("✖ ") + msg),
  dim: (msg) => console.log(colors.dim(msg)),
  child: (msg) => console.log(colors.dim("  ") + msg),
};

export { colors };
