#!/usr/bin/env node
// The ratchet: turns the two site-wide hard gates (site-audit, perf-budget) into required PR checks that can
// never go backward, without requiring the whole site to already be clean. Zero stays the eventual target
// (scripts/launch-readiness.mjs runs both gates at their own hard zero-tolerance exit code, daily on main,
// not required on PRs) - this script only decides whether a PR's own measured pages got WORSE than the
// committed baseline (.audit/ratchet/*.json), one page at a time:
//   site-audit:   a page's count for any criterion must not rise versus its baseline entry; a page with no
//                 baseline entry (new, or never audited before) must have zero findings.
//   perf-budget:  a page's LCP/TBT/CLS/JS must not rise, and its Performance score must not fall, by more than
//                 TOLERANCE (measured run-to-run noise, see tolerance()); a page with no baseline entry must be
//                 fully within apps/web/scripts/perf-budget.mjs's BUDGET.
// The baseline itself can only go down: `node scripts/ratchet.mjs update <kind> <run.json> <baseline.json>`
// lowers it to the better of (current, committed) per page, and never raises any value - a baseline edit that
// does (by hand or a bad update) is caught by `check-baseline`, run on the baseline files themselves whenever
// a PR touches them.
// Usage:
//   node scripts/ratchet.mjs check <site-audit|perf-budget> <run.json> [baseline.json]
//   node scripts/ratchet.mjs check-baseline <site-audit|perf-budget> <new-baseline.json> <old-baseline.json>
//   node scripts/ratchet.mjs update <site-audit|perf-budget> <run.json> <baseline.json>
// Exit 1 on any regression (check, check-baseline) or nothing to lower (update: exit 0 always, reports what moved).
import { readFileSync, writeFileSync } from "node:fs";

const CRITERIA = ["overlap", "clip", "small", "hydration", "console", "a11y", "link", "idle"];
// Run-to-run noise on the same build (see docs/claude/full-project-handbook.md, "perf-budget ratchet tolerance"
// for how these were measured: RUNS=5 of scripts/perf-budget.mjs against ten representative pages on an
// otherwise idle CI runner, the tolerance set above the largest observed same-build delta for each metric).
export const TOLERANCE = { lcp: 150, tbt: 40, cls: 0.02, perf: 3, jsKiB: 5 };
const METRICS = ["lcp", "tbt", "cls", "perf", "jsKiB"];
const worse = { lcp: (c, b, t) => c > b + t, tbt: (c, b, t) => c > b + t, cls: (c, b, t) => c > b + t, jsKiB: (c, b, t) => c > b + t, perf: (c, b, t) => c < b - t };

const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));

/** Current OUT (site-audit.mjs) -> { page: { criterion: count } }, for exactly the pages it measured. */
function siteAuditCounts(run) {
  const by = {};
  for (const f of run.findings) (by[f.page] ??= Object.fromEntries(CRITERIA.map((c) => [c, 0])))[f.criterion]++;
  // A measured page with zero findings still needs an entry (all zero) so "measured, clean" beats "not measured".
  for (const path of new Set(run.findings.map((f) => f.page))) by[path] ??= Object.fromEntries(CRITERIA.map((c) => [c, 0]));
  return by;
}
/** Every page actually visited this run, zero-findings/zero-over pages included (so a now-clean page still lowers
 *  its baseline under `update`, and a check doesn't silently skip a page with no finding to report). MEASURED
 *  (env, set by the CI step from affected-pages.txt x LOCALES, one locale-prefixed path per line) is authoritative;
 *  without it (a local ad-hoc run) this falls back to the pages the run actually reported something for. */
function measuredPages(run, kind) {
  if (process.env.MEASURED) return readFileSync(process.env.MEASURED, "utf8").split("\n").filter(Boolean);
  return kind === "site-audit" ? [...new Set(run.findings.map((f) => f.page))] : run.pages.map((p) => p.page);
}

/** Current OUT (perf-budget.mjs) -> { page: { lcp, tbt, cls, perf, jsKiB } }, measured-median or null on error. */
function perfBudgetMedians(run) {
  return Object.fromEntries(run.pages.map((p) => [p.page, p.median]));
}

function checkSiteAudit(run, baseline) {
  const counts = siteAuditCounts(run);
  const problems = [];
  for (const page of measuredPages(run, "site-audit")) {
    const cur = counts[page] ?? Object.fromEntries(CRITERIA.map((c) => [c, 0]));
    const base = baseline[page];
    if (!base) {
      const total = CRITERIA.reduce((n, c) => n + cur[c], 0);
      if (total > 0) problems.push(`${page}: new page (no baseline), ${CRITERIA.filter((c) => cur[c]).map((c) => `${c}=${cur[c]}`).join(" ")}`);
      continue;
    }
    for (const c of CRITERIA) if (cur[c] > (base[c] ?? 0)) problems.push(`${page}: ${c} ${cur[c]} (baseline ${base[c] ?? 0})`);
  }
  return problems;
}

function checkPerfBudget(run, baseline) {
  const medians = perfBudgetMedians(run);
  const byPage = Object.fromEntries(run.pages.map((p) => [p.page, p]));
  const problems = [];
  for (const page of measuredPages(run, "perf-budget")) {
    const p = byPage[page];
    const base = baseline[page];
    if (!base) {
      if (!p || p.over.length) problems.push(`${page}: new page (no baseline), over ${p?.over.join(",") ?? "error"}`);
      continue;
    }
    if (!p || !medians[page]) {
      problems.push(`${page}: failed to measure (${p?.error ?? "not in this run"}); treated as a regression against its baseline`);
      continue;
    }
    for (const m of METRICS) if (worse[m](medians[page][m], base[m], TOLERANCE[m])) problems.push(`${page}: ${m} ${medians[page][m]} vs baseline ${base[m]} (tolerance ${TOLERANCE[m]})`);
  }
  return problems;
}

function checkBaseline(kind, next, prev) {
  const problems = [];
  const keysOf = (b) => (kind === "site-audit" ? CRITERIA : METRICS);
  for (const page of Object.keys(prev)) {
    if (!(page in next)) { problems.push(`${page}: removed from the baseline (a page must stay tracked, even at 0)`); continue; }
    for (const k of keysOf()) {
      const a = prev[page][k] ?? 0, b = next[page][k] ?? 0;
      const raised = kind === "site-audit" ? b > a : worse[k](b, a, 0);
      if (raised) problems.push(`${page}.${k}: ${a} -> ${b} (the baseline can only go down)`);
    }
  }
  return problems;
}

function update(kind, run, baseline) {
  const next = structuredClone(baseline);
  const changed = [];
  if (kind === "site-audit") {
    const counts = siteAuditCounts(run);
    for (const page of measuredPages(run, "site-audit")) {
      const cur = counts[page] ?? Object.fromEntries(CRITERIA.map((c) => [c, 0]));
      const base = next[page] ?? Object.fromEntries(CRITERIA.map((c) => [c, 0]));
      const merged = Object.fromEntries(CRITERIA.map((c) => [c, Math.min(cur[c], base[c] ?? cur[c])]));
      if (JSON.stringify(merged) !== JSON.stringify(next[page])) changed.push(page);
      next[page] = merged;
    }
  } else {
    const medians = perfBudgetMedians(run);
    for (const page of measuredPages(run, "perf-budget")) {
      if (!medians[page]) continue;
      const base = next[page];
      const merged = base ? Object.fromEntries(METRICS.map((m) => [m, worse[m](base[m], medians[page][m], 0) ? medians[page][m] : base[m]])) : medians[page];
      if (JSON.stringify(merged) !== JSON.stringify(base)) changed.push(page);
      next[page] = merged;
    }
  }
  return { next, changed };
}

const [mode, kind, ...rest] = process.argv.slice(2);
if (!["site-audit", "perf-budget"].includes(kind)) { console.error(`ratchet: kind must be site-audit or perf-budget, got ${JSON.stringify(kind)}`); process.exit(2); }

if (mode === "check") {
  const [runFile, baselineFile = `.audit/ratchet/${kind}.json`] = rest;
  const run = readJson(runFile), baseline = readJson(baselineFile);
  const problems = kind === "site-audit" ? checkSiteAudit(run, baseline) : checkPerfBudget(run, baseline);
  if (problems.length) {
    console.log(`RATCHET FAIL (${kind}): ${problems.length} page(s) regressed versus ${baselineFile}\n${problems.map((p) => `  ${p}`).join("\n")}`);
    console.error(`::error title=ratchet-${kind}::${problems.length} page(s) regressed versus the committed baseline (details above)`);
    process.exit(1);
  }
  console.log(`RATCHET PASS (${kind}): no measured page regressed versus ${baselineFile}`);
} else if (mode === "check-baseline") {
  const [nextFile, prevFile] = rest;
  const problems = checkBaseline(kind, readJson(nextFile), readJson(prevFile));
  if (problems.length) {
    console.log(`BASELINE RAISE (${kind}): ${problems.length} value(s) went up\n${problems.map((p) => `  ${p}`).join("\n")}`);
    console.error(`::error title=ratchet-baseline-${kind}::${problems.length} value(s) raised in ${nextFile} versus ${prevFile} (the baseline can only go down)`);
    process.exit(1);
  }
  console.log(`BASELINE OK (${kind}): nothing in ${nextFile} is worse than ${prevFile}`);
} else if (mode === "update") {
  const [runFile, baselineFile] = rest;
  const { next, changed } = update(kind, readJson(runFile), readJson(baselineFile));
  writeFileSync(baselineFile, JSON.stringify(next, null, 1) + "\n");
  console.log(`ratchet update (${kind}): ${changed.length} page(s) lowered in ${baselineFile}${changed.length ? "\n  " + changed.join("\n  ") : ""}`);
} else {
  console.error(`ratchet: unknown mode ${JSON.stringify(mode)} (check | check-baseline | update)`);
  process.exit(2);
}
