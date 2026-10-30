// Performance budgets: a hard gate on every indexable page (the served /sitemap.xml, built from
// lib/indexable-pages.ts) in every audited locale. The official metric of the project (reported numbers,
// scheduled daily full run on main): Lighthouse mobile with its default (simulated/Lantern) throttling, RUNS (3)
// runs per page, the median of each metric, on a production build (`next start`; CI and the local container use
// the fixture build .next-lock, so live data is fixed). On a PR (RUNS=1, set by the workflow) the budget still
// gates on Lighthouse's own simulated throttling, just one run instead of three medianed, to fit the 15-minute
// PR check window even when every page is affected; the daily scheduled run on main is the trend/fidelity source.
// A page fails when any median (or, at RUNS=1, the single run) is over its budget:
//   LCP  largest-contentful-paint      <= 2500 ms
//   TBT  total-blocking-time           <= 200 ms
//   CLS  cumulative-layout-shift       <= 0.1
//   PERF the performance category      >= 90
//   JS   transferred JavaScript of the route (every Script request of the load) <= BUDGET.jsKiB KiB
// One Chrome (Playwright's Chromium) launched once per shard process and reused for every page/run: Lighthouse
// resets storage (cache, cookies) before each navigation on its own (settings.disableStorageReset defaults to
// false), so a shared Chrome measures the same "empty cache" load as a fresh one, without paying a Chrome launch
// (~1-2s) per run — the dominant fixed cost once dozens of pages are affected on a PR.
// Exits 1 on any page over budget (CI job perf-budget, sharded; no pipe after it in the workflow).
// Usage: BASE=http://localhost:<port> node scripts/perf-budget.mjs [path-filter ...]
//   env LOCALES=en,ar  RUNS=3  SHARD=i/n (pages i, i+n, … of the sitemap order)  OUT=<file.json> (every page's
//   medians and runs, the pages over budget)  PROGRESS=<file> (also append each progress line there)
//   RESULTS=<file.jsonl> (append each page's result as one JSON line)  RESUME=<dir> (skip the pages already
//   recorded in <dir>/*.jsonl and count their recorded result: an interrupted run resumes)  PAGES=<file> (only the
//   localized pages listed, one per line: CI's affected pages, scripts/route-manifest.mjs).
//   --merge a.json b.json … : one report from shard OUT files.
import { appendFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { requireBase } from "../../../scripts/lib/require-base.mjs";

export const BUDGET = { lcp: 2500, tbt: 200, cls: 0.1, perf: 90, jsKiB: 350 };
const METRICS = [
  ["lcp", "LCP", (v) => `${Math.round(v)}ms`, (v) => v > BUDGET.lcp],
  ["tbt", "TBT", (v) => `${Math.round(v)}ms`, (v) => v > BUDGET.tbt],
  ["cls", "CLS", (v) => v.toFixed(3), (v) => v > BUDGET.cls],
  ["perf", "PERF", (v) => String(v), (v) => v < BUDGET.perf],
  ["jsKiB", "JS", (v) => `${v}KiB`, (v) => v > BUDGET.jsKiB],
];

if (process.argv[2] === "--merge") {
  const parts = process.argv.slice(3).map((f) => JSON.parse(readFileSync(f, "utf8")));
  report(parts.flatMap((p) => p.pages), { runs: parts[0].runs, locales: parts[0].locales, shards: parts.length });
  process.exit();
}

const base = requireBase(process.env.BASE);
const locales = (process.env.LOCALES ?? "en,ar").split(",");
const RUNS = Number(process.env.RUNS ?? 3);
const [shardI, shardN] = (process.env.SHARD ?? "1/1").split("/").map(Number);
const filters = process.argv.slice(2);

const sitemap = await fetch(`${base}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`${base}/sitemap.xml answered ${sitemap.status}`);
const urls = [
  ...new Set(
    [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => new URL(m[1]).pathname)
      .filter((p) => locales.includes(p.split("/")[1])),
  ),
];
const listed = process.env.PAGES ? new Set(readFileSync(process.env.PAGES, "utf8").split("\n").filter(Boolean)) : null;
const selected = urls.filter((p) => !filters.length || filters.some((f) => p.includes(f))).filter((p) => !listed || listed.has(p));
if (!selected.length) throw new Error(`no page to measure (sitemap ${urls.length} pages, filters ${filters.join(" ") || "none"})`);
const pages = selected.filter((_, i) => i % shardN === shardI - 1);

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/** One Lighthouse mobile run (default config = mobile, simulated throttling) against the shard's shared Chrome. */
async function run(url, chromePort) {
  const { lhr } = await lighthouse(url, { port: chromePort, output: "json", logLevel: "error", onlyCategories: ["performance"] });
  if (lhr.runtimeError) throw new Error(`${lhr.runtimeError.code}: ${lhr.runtimeError.message}`);
  const a = lhr.audits;
  const scripts = a["network-requests"].details.items.filter((r) => r.resourceType === "Script");
  return {
    lcp: a["largest-contentful-paint"].numericValue,
    tbt: a["total-blocking-time"].numericValue,
    cls: a["cumulative-layout-shift"].numericValue,
    perf: Math.round(lhr.categories.performance.score * 100),
    jsKiB: Math.round(scripts.reduce((n, r) => n + (r.transferSize ?? 0), 0) / 1024),
    lcpElement: a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 160) ?? null,
  };
}

const results = [];
if (process.env.RESUME) {
  const wanted = new Set(pages);
  const recorded = new Map();
  for (const f of readdirSync(process.env.RESUME).filter((f) => f.endsWith(".jsonl")))
    for (const line of readFileSync(join(process.env.RESUME, f), "utf8").split("\n")) {
      if (!line) continue;
      const r = JSON.parse(line);
      if (wanted.has(r.page) && r.runs.length === RUNS) recorded.set(r.page, r);
    }
  results.push(...recorded.values());
  console.log(`perf-budget: resuming, ${results.length} of ${pages.length} pages already recorded in ${process.env.RESUME}`);
}
const done = new Set(results.map((r) => r.page));
const remaining = pages.filter((p) => !done.has(p));
console.log(`perf-budget: ${pages.length} pages (shard ${shardI}/${shardN}) × ${RUNS} Lighthouse mobile runs, budgets ${JSON.stringify(BUDGET)}`);

// One Chrome for the whole shard (see header comment), launched only if there is a page left to run.
const chrome = remaining.length ? await launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"] }) : null;
try {
  for (const page of remaining) {
    const t0 = Date.now();
    const runs = [];
    let error = null;
    try {
      for (let k = 0; k < RUNS; k++) runs.push(await run(`${base}${page}`, chrome.port));
    } catch (e) {
      error = e.message.split("\n")[0].slice(0, 200);
    }
    const med = runs.length === RUNS ? Object.fromEntries(METRICS.map(([k]) => [k, median(runs.map((r) => r[k]))])) : null;
    const over = med ? METRICS.filter(([k, , , bad]) => bad(med[k])).map(([k]) => k) : ["error"];
    const r = { page, median: med, over, error, lcpElement: runs[0]?.lcpElement ?? null, runs };
    results.push(r);
    const line = `[${new Date().toISOString().slice(11, 19)}] shard ${shardI}/${shardN} ${results.length}/${pages.length} ${page} ${((Date.now() - t0) / 1000).toFixed(1)}s ${med ? METRICS.map(([k, name, fmt]) => `${name}=${fmt(med[k])}`).join(" ") : `error: ${error}`}${over.length ? `  OVER: ${over.join(",")}` : ""}`;
    console.log(line);
    if (process.env.PROGRESS) appendFileSync(process.env.PROGRESS, line + "\n");
    if (process.env.RESULTS) appendFileSync(process.env.RESULTS, JSON.stringify(r) + "\n"); // RESUME reads it back
  }
} finally {
  if (chrome) await chrome.kill();
}

report(results, { runs: RUNS, locales });

/** Every page's medians (OUT), the pages over budget worst first, exit code 1 when any page is over. */
function report(all, meta) {
  const over = all.filter((r) => r.over.length);
  // worst first: the sum of how far each metric is past its budget, relative to the budget
  const excess = (r) => (r.median ? METRICS.reduce((n, [k, , , bad]) => n + (bad(r.median[k]) ? Math.abs(r.median[k] - BUDGET[k]) / BUDGET[k] : 0), 0) : Infinity);
  over.sort((a, b) => excess(b) - excess(a));
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify({ budget: BUDGET, ...meta, total: all.length, overBudget: over.length, pages: all }, null, 1) + "\n");
  console.log(`TOTAL pages=${all.length} over-budget=${over.length} ${METRICS.map(([k, name]) => `${name}=${all.filter((r) => r.over.includes(k)).length}`).join(" ")} errors=${all.filter((r) => r.error).length}`);
  if (over.length) {
    console.log(`\nPAGES OVER BUDGET (worst first; medians of ${meta.runs} runs)`);
    for (const r of over.slice(0, Number(process.env.SHOW ?? 60)))
      console.log(`  ${r.page}  ${r.median ? METRICS.map(([k, name, fmt]) => `${name}=${fmt(r.median[k])}${r.over.includes(k) ? "!" : ""}`).join(" ") : `error: ${r.error}`}`);
    console.error(`::error title=perf-budget::${over.length} of ${all.length} pages over budget (${METRICS.map(([k, name]) => `${name} ${all.filter((r) => r.over.includes(k)).length}`).join(", ")})`);
    process.exitCode = 1;
  }
}
