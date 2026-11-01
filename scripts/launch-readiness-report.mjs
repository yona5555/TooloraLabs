#!/usr/bin/env node
// Merges this run's shard artifacts (downloaded to the working directory by the caller) and appends one
// summary line to GITHUB_STEP_SUMMARY: what launch-readiness found, the number that must reach zero (every
// criterion for site-audit, every page within budget for perf-budget) before launch.
// Usage: node scripts/launch-readiness-report.mjs <site-audit|perf-budget>
import { appendFileSync, readFileSync, readdirSync } from "node:fs";

const kind = process.argv[2];
const files = readdirSync(".").filter((f) => new RegExp(`^${kind}-\\d+\\.json$`).test(f));

let line;
if (kind === "site-audit") {
  const CRITERIA = ["overlap", "clip", "small", "hydration", "console", "a11y", "link", "idle", "empty"];
  const totals = Object.fromEntries(CRITERIA.map((c) => [c, 0]));
  let pages = 0;
  for (const f of files) {
    const r = JSON.parse(readFileSync(f, "utf8"));
    pages += r.pages ?? 0;
    for (const c of CRITERIA) totals[c] += r.totals?.[c] ?? 0;
  }
  line = `site-audit: ${files.length}/12 shard(s) reported, ${pages} pages, ${CRITERIA.map((c) => `${c}=${totals[c]}`).join(" ")}`;
} else {
  let pages = 0, over = 0;
  const byMetric = { lcp: 0, tbt: 0, cls: 0, perf: 0, jsKiB: 0 };
  for (const f of files) {
    const r = JSON.parse(readFileSync(f, "utf8"));
    pages += r.total ?? 0;
    over += r.overBudget ?? 0;
    for (const p of r.pages ?? []) for (const m of p.over ?? []) byMetric[m] = (byMetric[m] ?? 0) + 1;
  }
  line = `perf-budget: ${files.length}/16 shard(s) reported, ${pages} pages, over-budget=${over} (${Object.entries(byMetric).map(([k, v]) => `${k}=${v}`).join(" ")})`;
}

console.log(line);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + "\n");
