#!/usr/bin/env node
// Parses every JSON file the app reads (apps/web and packages, plus the repo root),
// skipping node_modules, .next and other build output. Failures (path, position and
// 80 characters around the error) go to stdout and to scripts/output/json-check.txt.
//   node scripts/check-json.mjs            -> source JSON
//   node scripts/check-json.mjs --next     -> also the .next cache
// Exit code 1 when any file fails to parse.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const withNext = process.argv.includes("--next");
const SKIP = new Set(["node_modules", ".git", "dist", "coverage", "output", "test-results", "playwright-report", ...(withNext ? [] : [".next"])]);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith(".json")) yield path;
  }
}

const roots = [join(ROOT, "apps"), join(ROOT, "packages")];
const files = [...roots.flatMap((r) => [...walk(r)]), ...readdirSync(ROOT).filter((f) => f.endsWith(".json")).map((f) => join(ROOT, f))];
const failures = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  try {
    JSON.parse(text);
  } catch (error) {
    const pos = Number(/position (\d+)/.exec(error.message)?.[1] ?? 0);
    const around = text.slice(Math.max(0, pos - 40), pos + 40).replace(/\n/g, "\\n");
    failures.push(`${relative(ROOT, file)}\n  ${error.message}\n  around: ${around}`);
  }
}
const report = [...failures, `${failures.length} of ${files.length} JSON files failed to parse${withNext ? " (including .next)" : ""}`].join("\n");
mkdirSync(join(ROOT, "scripts", "output"), { recursive: true });
writeFileSync(join(ROOT, "scripts", "output", "json-check.txt"), report + "\n");
console.log(report);
process.exit(failures.length ? 1 : 0);
