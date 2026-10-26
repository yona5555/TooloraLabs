#!/usr/bin/env node
// Regression lock for the APPROVED desktop layout (DESKTOP phase, 2026-10-26). At 1440px (light, en + ar) it
// records, per page: the top-level cards in screen order (title, rect, title font size), the charts
// (top-level <svg> rects), the layout each drawing + table row picked (GapFreeRow `data-gap-layout`,
// IndicatorWithTable `data-split`), the main headings (h1/h2 rect + font size) and the page height. Fails
// when any rect moves or resizes by more than 1px, or any order, title, layout or font size changes.
//   npm run build:desktop-lock                     -> the build it runs against (.next-lock, live fixtures)
//   npm run test:desktop-lock                      -> CI set: home + 12 representative tools (26 pages)
//   npm run test:desktop-lock:full                 -> every tool page plus /, /tools, /categories, /docs
//   npm run baseline:desktop-lock -- --approve     -> rewrite the measured pages in the baseline (add --full
//                                                     or --only for other sets; other pages are kept)
// Options: --only slug,slug (a subset), --base http://localhost:3001 (an already running server; its live
// data is NOT fixed), --timing file (per-page load/measure times and slow requests).
// Without --base it starts `next start` on the .next-lock build with tests/fixtures/offline-fetch.mjs
// preloaded: every external fetch (prices, rates, weather, hazards) is answered from tests/fixtures/live,
// so no page waits on the network and live values never move the layout. Every wait is bounded (10s load,
// 10s network idle, ~5s settling, 30s hard cap per page): a stuck page fails by name instead of hanging.
// The clock is fixed (2026-10-20 12:00 UTC, timezone UTC) so the date tools render the same every day. The
// pages use system fonts in places, so each OS has its own baseline: desktop.json on macOS (local),
// desktop.linux.json on Linux (CI runner ubuntu-24.04, CI set only).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB = join(ROOT, "apps/web");
const webRequire = createRequire(join(WEB, "package.json"));
const { chromium } = webRequire("playwright");
const BASELINE = join(ROOT, `tests/baselines/desktop${process.platform === "linux" ? ".linux" : ""}.json`);
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const PORT = 3109;
const BASE = arg("base", `http://localhost:${PORT}`);
const OWN_SERVER = !process.argv.includes("--base");
const ONLY = arg("only", "");
const FULL = process.argv.includes("--full");
const TIMING = arg("timing", "");
const WRITE = process.argv.includes("--write");
const APPROVE = process.argv.includes("--approve");
const TOLERANCE = 1;
const WIDTH = 1440;
const PAGES = ["", "/tools", "/categories", "/docs"];
// The CI set: the home page plus tools covering every shared layout (finance pages with schedules and
// charts, the live market pages, the scientific keypad, a 3D drawing + table tool, a text tool).
const CI_SET = ["", ...["mortgage-calculator", "loan-calculator", "compound-interest-calculator", "retirement-calculator",
  "affordable-loan-calculator", "crypto-converter", "forex-converter", "scientific-calculator", "bmi-calculator",
  "mean-median-mode-range-calculator", "json-formatter", "surface-area-calculator"].map((s) => `/tools/${s}`)];
const WORKERS = 4;
const PAGE_CAP_MS = 30000;

if (WRITE && !APPROVE) {
  console.error("Refusing to rewrite the approved baseline without --approve (npm run baseline:desktop-lock -- --approve).");
  process.exit(2);
}

// Runs in the page. Compact rows: [label, x, y, w, h, font].
async function measure() {
  // At most 40 steps (28,000px): a page that keeps growing while it scrolls can never loop for ever.
  for (let y = 0, i = 0; y < document.body.scrollHeight && i < 40; y += 700, i++) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  scrollTo(0, 0);
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
  // Lazy charts, measured layouts (GapFreeRow, FitNumbers) and hydration settle over a few frames: read
  // until two reads 250ms apart agree (at most 20 reads, ~5s), so a slow load never records a half-built
  // page. (Counted, not timed: the page clock is fixed.)
  let last = "";
  let reads = 0;
  for (let i = 0; i < 20; i++, reads++) {
    await new Promise((r) => setTimeout(r, 250));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const now = JSON.stringify(read());
    if (now === last) break;
    last = now;
  }
  return { reads, data: JSON.parse(last) };

  function read() {
    const main = document.querySelector("main");
    const shown = (e) => e.getClientRects().length > 0 && !e.closest('dialog, [role="dialog"]');
    const row = (label, e, font = "") => {
      const r = e.getBoundingClientRect();
      return [label, +r.x.toFixed(1), +(r.y + scrollY).toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1), font];
    };
    const cards = [...main.querySelectorAll("[data-card]")]
      .filter((c) => shown(c) && !c.parentElement.closest("[data-card]"))
      .map((c) => {
        const h = c.querySelector("[data-card-header] :is(h2,h3)") ?? c.querySelector("h2,h3");
        return row((h?.textContent ?? "?").trim().slice(0, 40), c, h ? getComputedStyle(h).fontSize : "");
      })
      .sort((a, b) => a[2] - b[2] || a[1] - b[1]);
    const charts = [...main.querySelectorAll("svg")]
      .filter((s) => shown(s) && !s.parentElement.closest("svg") && !s.closest("[data-card-header], button, a") && s.getBoundingClientRect().width >= 100)
      .map((s) => row("svg", s));
    const layouts = [...main.querySelectorAll("[data-gap-layout], [data-split]")].filter(shown).map((e) => e.dataset.gapLayout ?? e.dataset.split);
    const headings = [...main.querySelectorAll("h1, h2")].filter((h) => shown(h) && !h.closest("[data-card]")).map((h) => row(h.textContent.trim().slice(0, 40), h, getComputedStyle(h).fontSize));
    return { height: document.documentElement.scrollHeight, cards, charts, layouts, headings };
  }
}

let server;
if (OWN_SERVER) {
  if (!existsSync(join(WEB, ".next-lock/BUILD_ID"))) {
    console.error("No .next-lock build: run npm run build:desktop-lock first.");
    process.exit(2);
  }
  server = spawn(process.execPath, [webRequire.resolve("next/dist/bin/next"), "start", "-p", String(PORT)], {
    cwd: WEB,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_DIST_DIR: ".next-lock", NODE_OPTIONS: `--import=${join(ROOT, "tests/fixtures/offline-fetch.mjs")}` },
  });
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    up = await fetch(`${BASE}/en`).then((r) => r.ok, () => false);
    if (!up) await new Promise((r) => setTimeout(r, 500));
  }
  if (!up) {
    server.kill();
    console.error(`The fixture server on ${BASE} did not start in 30s.`);
    process.exit(3);
  }
}
const stop = () => server?.kill();

let paths = CI_SET;
if (FULL || ONLY) {
  const index = await (await fetch(`${BASE}/en/tools`)).text();
  const slugs = [...new Set([...index.matchAll(/href="\/en\/tools\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  if (slugs.length < 90) throw new Error(`only ${slugs.length} tool links found on /en/tools`);
  paths = [...PAGES, ...slugs.map((s) => `/tools/${s}`)];
}
if (ONLY) paths = paths.filter((p) => ONLY.split(",").some((s) => p === `/tools/${s}` || p === s));
const jobs = ["en", "ar"].flatMap((locale) => paths.map((p) => `/${locale}${p}`));
const SET = `${jobs.length} pages (${FULL ? "full" : ONLY ? "--only" : "CI set"})`;
const begun = Date.now();

const browser = await chromium.launch({ args: ["--disable-3d-apis"] });
// Nothing outside the server under test is ever waited on (analytics, ads, third-party images).
const sameOrigin = (url) => url.startsWith(BASE) || url.startsWith("data:") || url.startsWith("blob:");
const current = {};
const failedLoads = [];
const timing = [];
async function worker() {
  for (let job; (job = jobs.shift()); ) {
    // A fresh context per page: tools keep inputs and recent calculations in localStorage, so a page
    // must never see what an earlier page (or the other locale) stored.
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 900 }, colorScheme: "light", reducedMotion: "reduce", timezoneId: "UTC", locale: "en-US" });
    await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => {
      const st = document.createElement("style");
      st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}";
      document.head.appendChild(st);
    }));
    const page = await ctx.newPage();
    await page.route((url) => !sameOrigin(url.href), (route) => route.abort());
    const started = new Map(), slow = [];
    page.on("request", (r) => started.set(r, Date.now()));
    const done = (r) => {
      const ms = Date.now() - started.get(r);
      started.delete(r);
      if (ms > 1500) slow.push(`${ms}ms ${r.url().replace(BASE, "")}`);
    };
    page.on("requestfinished", done);
    page.on("requestfailed", done);
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00Z"));
    const t0 = Date.now();
    let t1 = t0, reads = 0;
    const visit = async () => {
      const res = await page.goto(`${BASE}${job}`, { waitUntil: "load", timeout: 10000 });
      if (!res || res.status() !== 200) throw new Error(`answered ${res?.status()}`);
      // Ready signal: no request in flight for 500ms (lazy chunks, the market /api calls), then fonts and
      // two equal reads inside measure(). Live data comes from fixtures, so this is quick on every page.
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => slow.push("network not idle after 10s"));
      t1 = Date.now();
      ({ reads, data: current[job] } = await page.evaluate(measure));
    };
    let cap;
    await Promise.race([visit(), new Promise((_, no) => (cap = setTimeout(() => no(new Error(`not measured within ${PAGE_CAP_MS / 1000}s`)), PAGE_CAP_MS)))])
      .catch((e) => failedLoads.push(`${job}: ${e.message.split("\n")[0]}`))
      .finally(() => clearTimeout(cap));
    const pending = [...started].map(([r, t]) => `pending ${Date.now() - t}ms ${r.url().replace(BASE, "")}`);
    timing.push({ job, load: t1 - t0, measure: Date.now() - t1, reads, requests: [...slow, ...pending] });
    await ctx.close();
  }
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close();
stop();
const slowest = timing.reduce((a, t) => (t.load + t.measure > a.load + a.measure ? t : a), timing[0]);
console.log(`${SET} in ${((Date.now() - begun) / 1000).toFixed(1)}s; slowest ${slowest.job} ${slowest.load + slowest.measure}ms.`);
if (TIMING) {
  timing.sort((a, b) => b.load + b.measure - (a.load + a.measure));
  const total = timing.reduce((n, t) => n + t.load + t.measure, 0);
  writeFileSync(TIMING, [`${timing.length} pages, ${WORKERS} workers, page-time sum ${(total / 1000).toFixed(1)}s`, "page | load ms | measure ms | reads | slow (>1.5s) or pending requests",
    ...timing.map((t) => `${t.job} | ${t.load} | ${t.measure} | ${t.reads} | ${t.requests.join(", ")}`)].join("\n") + "\n");
}
if (failedLoads.length) {
  console.error(failedLoads.join("\n"));
  process.exit(3);
}

const sorted = Object.fromEntries(Object.keys(current).sort().map((k) => [k, current[k]]));
if (WRITE) {
  mkdirSync(dirname(BASELINE), { recursive: true });
  // Only the measured pages are rewritten; the others keep their approved values. One page per line
  // keeps the baseline diffable.
  const merged = { ...(existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {}), ...sorted };
  const out = Object.fromEntries(Object.keys(merged).sort().map((k) => [k, merged[k]]));
  writeFileSync(BASELINE, "{\n" + Object.entries(out).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n");
  console.log(`Baseline written: ${Object.keys(sorted).length} pages measured, ${Object.keys(out).length} in ${BASELINE.split("/").pop()}.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const problems = [];
let checked = 0;
for (const [view, cur] of Object.entries(sorted)) {
  const base = baseline[view];
  if (!base) { problems.push(`${view}: not in the baseline`); continue; }
  // Live pages are measured in full too: their data comes from fixtures, so their heights are fixed.
  const keys = [1, 2, 3, 4];
  if (Math.abs(base.height - cur.height) > TOLERANCE) problems.push(`${view}: page height ${cur.height} (approved ${base.height})`);
  if (base.layouts.join(",") !== cur.layouts.join(",")) problems.push(`${view}: row layouts ${cur.layouts.join(",")} (approved ${base.layouts.join(",")})`);
  for (const part of ["cards", "charts", "headings"]) {
    const a = base[part], b = cur[part];
    if (a.length !== b.length) problems.push(`${view} ${part}: ${b.length} (approved ${a.length})`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      checked++;
      const where = `${view} ${part} #${i} "${a[i][0]}"`;
      if (a[i][0] !== b[i][0]) { problems.push(`${where}: order changed (now "${b[i][0]}")`); break; }
      if (a[i][5] !== b[i][5]) problems.push(`${where}: font-size ${b[i][5]} (approved ${a[i][5]})`);
      for (const k of keys) if (Math.abs(a[i][k] - b[i][k]) > TOLERANCE) problems.push(`${where}: ${"_xywh"[k]} ${b[i][k]} (approved ${a[i][k]})`);
    }
  }
}
if (FULL && !ONLY) for (const view of Object.keys(baseline)) if (!sorted[view]) problems.push(`${view}: not measured`);
if (problems.length) {
  console.error(problems.slice(0, Number(process.env.LOCK_SHOW ?? 80)).join("\n"));
  console.error(`FAIL: ${problems.length} change(s) to the approved desktop layout (${Object.keys(sorted).length} pages, ${checked} items checked).`);
  process.exit(1);
}
console.log(`PASS: approved desktop layout unchanged (${Object.keys(sorted).length} pages at ${WIDTH}px, ${checked} items, tolerance ${TOLERANCE}px).`);
