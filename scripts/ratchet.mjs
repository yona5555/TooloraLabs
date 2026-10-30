#!/usr/bin/env node
// The ratchet: turns the two site-wide hard gates (site-audit, perf-budget) into required PR checks that can
// never go backward, without requiring the whole site to already be clean. Zero stays the eventual target
// (scripts/launch-readiness.mjs runs both gates at their own hard zero-tolerance exit code, daily on main,
// not required on PRs) - this script only decides whether a PR's own measured pages got WORSE than the
// committed baseline (.audit/ratchet/*.json), one page at a time:
//   site-audit:   a page's count for any criterion must not rise versus its baseline entry; a page with no
//                 baseline entry (new, or never audited before) must have zero findings.
//   perf-budget:  a page's initial JS and CSS bytes, render-blocking resources and requests must not rise, and an
//                 LCP element in the server HTML must stay there (apps/web/scripts/perf-static.mjs: deterministic,
//                 so no tolerance); a page with no baseline entry must be fully within that script's BUDGET.
// The baseline itself can only go down: `node scripts/ratchet.mjs update <kind> <run.json> <baseline.json>`
// lowers it to the better of (current, committed) per page, and never raises any value - a baseline edit that
// does (by hand or a bad update) is caught by `check-baseline`, run on the baseline files themselves whenever
// a PR touches them.
// Usage:
//   node scripts/ratchet.mjs check <site-audit|perf-budget> <run.json> [baseline.json]
//   node scripts/ratchet.mjs check-baseline <site-audit|perf-budget> <new-baseline.json> <old-baseline.json>
//   node scripts/ratchet.mjs update <site-audit|perf-budget> <run.json> <baseline.json>
// check needs MEASURED=<file>: the exact pages this shard had to measure (scripts/expand-measured-pages.mjs), one per
// line. It fails, naming the cause, when the results file is missing or unparsable, or when the pages it measured are
// not exactly that list; an unmeasured page is never read as a clean one.
// Exit 1 on any regression (check, check-baseline) or nothing to lower (update: exit 0 always, reports what moved).
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CRITERIA = ["overlap", "clip", "small", "hydration", "console", "a11y", "link", "idle"];
const METRICS = ["jsBytes", "cssBytes", "blocking", "requests", "lcpInHtml"];
const rises = (c, b) => c > b;
const worse = { jsBytes: rises, cssBytes: rises, blocking: rises, requests: rises, lcpInHtml: (c, b) => b && !c };

const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));

/** A check that cannot compare: never a pass. */
function failCheck(kind, message) {
  console.log(`RATCHET FAIL (${kind}): ${message}`);
  console.error(`::error title=ratchet-${kind}::${message.split("\n")[0]}`);
  process.exit(1);
}

/** The results file of a check; a missing, unparsable or malformed one fails with its cause. */
function readRun(kind, file) {
  if (!existsSync(file)) failCheck(kind, `results file ${file} is missing: the measuring step produced no results`);
  let run;
  try {
    run = readJson(file);
  } catch (e) {
    failCheck(kind, `results file ${file} is unparsable: ${e.message}`);
  }
  const valid = kind === "site-audit" ? Array.isArray(run?.findings) && Array.isArray(run?.measured) : Array.isArray(run?.pages);
  if (!valid) failCheck(kind, `results file ${file} is unparsable: it has no ${kind === "site-audit" ? "findings/measured" : "pages"} list`);
  return run;
}

/** The results must cover exactly the shard's pages: none missing, none extra. */
function checkPageSet(kind, run) {
  const file = process.env.MEASURED;
  if (!file || !existsSync(file)) failCheck(kind, `no page list to compare with: MEASURED ${file ? `file ${file} is missing` : "is not set"}`);
  const expected = new Set(readFileSync(file, "utf8").split("\n").filter(Boolean));
  const got = new Set(measuredPages(run, kind));
  if (kind === "site-audit") for (const f of run.findings) got.add(f.page);
  const missing = [...expected].filter((p) => !got.has(p));
  const extra = [...got].filter((p) => !expected.has(p));
  if (missing.length || extra.length) {
    failCheck(kind, `the measured pages are not the shard's ${expected.size} pages (${missing.length} missing, ${extra.length} extra)\n${[...missing.map((p) => `  missing: ${p}`), ...extra.map((p) => `  extra: ${p}`)].join("\n")}`);
  }
}

/** Current OUT (site-audit.mjs) -> { page: { criterion: count } }, for the pages with a finding. */
function siteAuditCounts(run) {
  const by = {};
  for (const f of run.findings) (by[f.page] ??= Object.fromEntries(CRITERIA.map((c) => [c, 0])))[f.criterion]++;
  return by;
}
/** Every page the gate reports as measured, zero-findings/zero-over pages included, so a now-clean page still lowers
 *  its baseline under `update`. */
function measuredPages(run, kind) {
  return kind === "site-audit" ? run.measured : run.pages.map((p) => p.page);
}

/** Current OUT (perf-static.mjs) -> { page: { jsBytes, cssBytes, blocking, requests, lcpInHtml } }, null on error. */
function perfBudgetValues(run) {
  return Object.fromEntries(run.pages.map((p) => [p.page, p.values]));
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
  const values = perfBudgetValues(run);
  const byPage = Object.fromEntries(run.pages.map((p) => [p.page, p]));
  const problems = [];
  for (const page of measuredPages(run, "perf-budget")) {
    const p = byPage[page];
    const base = baseline[page];
    if (!base) {
      if (p.over.length) problems.push(`${page}: new page (no baseline), over ${p.over.join(",")}`);
      continue;
    }
    const stale = METRICS.filter((m) => !(m in base));
    if (stale.length) {
      problems.push(`${page}: baseline entry has no ${stale.join(",")}`);
      continue;
    }
    if (!values[page]) {
      problems.push(`${page}: failed to measure (${p.error}); treated as a regression against its baseline`);
      continue;
    }
    for (const m of METRICS) if (worse[m](values[page][m], base[m])) problems.push(`${page}: ${m} ${values[page][m]} vs baseline ${base[m]}`);
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
      const raised = kind === "site-audit" ? b > a : worse[k](b, a);
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
    const values = perfBudgetValues(run);
    for (const page of measuredPages(run, "perf-budget")) {
      if (!values[page]) continue;
      const base = next[page];
      const merged = base ? Object.fromEntries(METRICS.map((m) => [m, worse[m](base[m], values[page][m]) ? values[page][m] : base[m]])) : values[page];
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
  const run = readRun(kind, runFile), baseline = readJson(baselineFile);
  checkPageSet(kind, run);
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
  const { next, changed } = update(kind, readRun(kind, runFile), readJson(baselineFile));
  writeFileSync(baselineFile, JSON.stringify(next, null, 1) + "\n");
  console.log(`ratchet update (${kind}): ${changed.length} page(s) lowered in ${baselineFile}${changed.length ? "\n  " + changed.join("\n  ") : ""}`);
} else {
  console.error(`ratchet: unknown mode ${JSON.stringify(mode)} (check | check-baseline | update)`);
  process.exit(2);
}
