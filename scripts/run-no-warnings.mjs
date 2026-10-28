// Runs a command, streams its output unchanged, and fails if any line is a warning
// (Next.js "⚠", webpack "Compiled with warnings", React/Node/npm warnings and deprecations).
// Usage: node scripts/run-no-warnings.mjs <command> [args...]
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

export const WARNING_LINE = /⚠|\bwarn(ing|ings)?\b|\bdeprecat(ed|ion)\b|DeprecationWarning|Compiled with warnings/i;

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/run-no-warnings.mjs <command> [args...]");
  process.exit(2);
}

const child = spawn(command, args, { stdio: ["inherit", "pipe", "pipe"] });
const warnings = [];
for (const [stream, out] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
  createInterface({ input: stream }).on("line", (line) => {
    out.write(`${line}\n`);
    if (WARNING_LINE.test(line)) warnings.push(line.trim());
  });
}

child.on("close", (code, signal) => {
  for (const line of warnings) console.log(`::error title=Warning in output::${line}`);
  if (code !== 0 || signal) process.exit(code ?? 1);
  if (warnings.length > 0) {
    console.error(`${warnings.length} warning line(s) in the output of: ${[command, ...args].join(" ")}`);
    process.exit(1);
  }
});
