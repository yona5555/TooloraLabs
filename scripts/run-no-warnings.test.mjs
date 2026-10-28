// Unit tests for the warnings gate (scripts/run-no-warnings.mjs): every pattern catches the real tool
// output it is for, known plain-text lines pass, and the gate's exit code follows the command's output.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PROBLEM_PATTERNS, problemOf } from "./run-no-warnings.mjs";

const TRUE_POSITIVES = {
  "next-warning": " ⚠ No build cache found. Please configure build caching for faster rebuilds.",
  "next-error": " ⨯ Failed to compile",
  "node-warning": "(node:4242) [DEP0040] DeprecationWarning: The `punycode` module is deprecated.",
  "warning-prefix": "Warning: Each child in a list should have a unique \"key\" prop.",
  "warn-level": "npm warn deprecated inflight@1.0.6: This module is not supported",
  "npm-error": "npm ERR! code ELIFECYCLE",
  "error-prefix": "[commodities-tracker] getMetalSnapshot failed: Error: Missing METALPRICE_API_KEY environment variable",
  eslint: "  32:32  warning  '_url' is defined but never used  @typescript-eslint/no-unused-vars",
  "webpack-warnings": "Compiled with warnings.",
};

test("every pattern has a true-positive case", () => {
  assert.deepEqual(Object.keys(TRUE_POSITIVES).sort(), PROBLEM_PATTERNS.map(([name]) => name).sort());
});

for (const [name, line] of Object.entries(TRUE_POSITIVES)) {
  test(`catches ${name}: ${line.slice(0, 50)}`, () => assert.equal(problemOf(line), name));
}

test("catches more real forms", () => {
  assert.equal(problemOf("(node:77) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0'"), "node-warning");
  assert.equal(problemOf("warn  - Fast Refresh had to perform a full reload"), "warn-level");
  assert.equal(problemOf("TypeError: Cannot read properties of undefined (reading 'x')"), "error-prefix");
  assert.equal(problemOf("Error: ENOENT: no such file or directory"), "error-prefix");
});

test("known false positive: the echoed lint command", () => assert.equal(problemOf("> eslint --max-warnings 0"), null));

test("known false positive: a test name containing 'warning'", () =>
  assert.equal(problemOf("✔ a successful run with a warning annotation opens an issue (0.188542ms)"), null));

test("plain text containing the words passes", () => {
  for (const line of [
    "client-message-deps: 98 tools, 19 with cross-tool namespaces",
    "✔ Error boundary renders the fallback (1.2ms)",
    "  no warnings, no errors",
    "ℹ fail 0",
    "> node scripts/run-no-warnings.mjs npm run build",
    "✓ Compiled successfully in 26.0s",
  ])
    assert.equal(problemOf(line), null, line);
});

const GATE = fileURLToPath(new URL("./run-no-warnings.mjs", import.meta.url));
const gate = (script) => spawnSync(process.execPath, [GATE, process.execPath, "-e", script], { encoding: "utf8" });

test("gate exits 0 on clean output", () => assert.equal(gate("console.log('✓ Compiled successfully')").status, 0));
test("gate fails on a warning line", () => assert.equal(gate("console.log(' ⚠ something')").status, 1));
test("gate fails on an error line", () => assert.equal(gate("console.error('Error: boom')").status, 1));
test("gate keeps the command's own failure code", () => assert.equal(gate("process.exit(3)").status, 3));
