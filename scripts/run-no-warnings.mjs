// Runs a command, streams its output unchanged, and fails if any line is a warning or an error report from
// a tool (or if the command itself fails). Only real tool output matches: plain text that merely contains
// "warning" or "error" (an echoed `--max-warnings 0`, a test named "... with a warning annotation") does not.
// Usage: node scripts/run-no-warnings.mjs <command> [args...]
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";

// [name, pattern]. Each pattern is anchored to the start of the line, where tools print their level.
export const PROBLEM_PATTERNS = [
  // Next.js status lines: " ⚠ No build cache found", " ⨯ Failed to compile".
  ["next-warning", /^\s*⚠\s/],
  ["next-error", /^\s*⨯\s/],
  // Node process warnings: "(node:1234) Warning: ...", "(node:1234) [DEP0040] DeprecationWarning: ...".
  ["node-warning", /^\(node:\d+\)\s+(?:\[[A-Z0-9_]+\]\s+)?\w*Warning:\s/],
  // "Warning:" prefixes (React's "Warning: Each child in a list ...", libraries' console.warn).
  ["warning-prefix", /^\s*Warning:\s/],
  // Log-level prefixes: "warn  - ...", "npm warn deprecated ...", "WARN ...", "npm ERR! ...".
  ["warn-level", /^\s*(?:npm\s+)?(?:warn|WARN)\s/],
  ["npm-error", /^\s*npm\s+(?:ERR!|error)\s/],
  // Error reports from the build and static generation: "Error: ...", "TypeError: ...", and a tagged log
  // line such as "[commodities-tracker] getMetalSnapshot failed: Error: ...".
  ["error-prefix", /^\s*(?:\[[\w.-]+\][^:\n]*:\s+)?[A-Z]?\w*Error:\s/],
  // ESLint (stylish): "  32:32  warning  '_url' is defined but never used  no-unused-vars".
  ["eslint", /^\s*\d+:\d+\s+(?:warning|error)\s/],
  // webpack.
  ["webpack-warnings", /^\s*Compiled with warnings\b/],
];

/** The name of the first pattern a line matches, or null for an ordinary line. */
export function problemOf(line) {
  for (const [name, re] of PROBLEM_PATTERNS) if (re.test(line)) return name;
  return null;
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command) {
    console.error("Usage: node scripts/run-no-warnings.mjs <command> [args...]");
    process.exit(2);
  }
  const child = spawn(command, args, { stdio: ["inherit", "pipe", "pipe"] });
  const problems = [];
  for (const [stream, out] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
    createInterface({ input: stream }).on("line", (line) => {
      out.write(`${line}\n`);
      if (problemOf(line)) problems.push(line.trim());
    });
  }
  child.on("close", (code, signal) => {
    for (const line of problems) console.log(`::error title=Warning or error in output::${line}`);
    if (code !== 0 || signal) process.exit(code ?? 1);
    if (problems.length > 0) {
      console.error(`${problems.length} warning or error line(s) in the output of: ${[command, ...args].join(" ")}`);
      process.exit(1);
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
