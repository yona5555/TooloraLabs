#!/usr/bin/env node
// Regression lock for the APPROVED desktop layout (DESKTOP phase, 2026-10-26). Opens every tool page plus
// /, /tools, /categories and /docs at 1440px (light, en + ar) and records, per page: the top-level cards in
// screen order (title, rect, title font size), the charts (top-level <svg> rects), the layout each
// drawing + table row picked (GapFreeRow `data-gap-layout`, IndicatorWithTable `data-split`), the main
// headings (h1/h2 rect + font size) and the page height. Fails when any rect moves or resizes by more than
// 1px, or any order, title, layout or font size changes, against tests/baselines/desktop.json.
//   npm run test:desktop-lock                      -> compare (exit 1 on any change)
//   npm run baseline:desktop-lock -- --approve     -> rewrite the baseline (only with --approve)
// Options: --base http://localhost:3001, --only slug,slug (a subset; compare only)
// The clock is fixed (2026-10-20 12:00 UTC, timezone UTC) so the date tools render the same every day. The
// live-data pages (markets, weather) keep only their horizontal geometry, order, titles, layouts and fonts:
// their heights follow the live values. The pages use system fonts in places, so each OS has its own
// baseline: desktop.json on macOS (local), desktop.linux.json on Linux (CI runner ubuntu-24.04).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(join(ROOT, "apps/web/package.json"))("playwright");
const BASELINE = join(ROOT, `tests/baselines/desktop${process.platform === "linux" ? ".linux" : ""}.json`);
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const BASE = arg("base", "http://localhost:3001");
const ONLY = arg("only", "");
const WRITE = process.argv.includes("--write");
const APPROVE = process.argv.includes("--approve");
const TOLERANCE = 1;
const WIDTH = 1440;
const LIVE = new Set(["crypto-converter", "forex-converter", "commodities-tracker", "weather-forecast"]);
const PAGES = ["", "/tools", "/categories", "/docs"];
const WORKERS = 4;

if (WRITE && !APPROVE) {
  console.error("Refusing to rewrite the approved baseline without --approve (npm run baseline:desktop-lock -- --approve).");
  process.exit(2);
}
if (WRITE && ONLY) {
  console.error("--only measures a subset; the baseline is written from every page.");
  process.exit(2);
}

// Runs in the page. Compact rows: [label, x, y, w, h, font].
async function measure() {
  for (let y = 0; y < document.body.scrollHeight; y += 700) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  scrollTo(0, 0);
  await document.fonts.ready;
  // Lazy charts, measured layouts (GapFreeRow, FitNumbers) and hydration settle over a few frames: read
  // until two reads 500ms apart agree (at most ~10s), so a slow load never records a half-built page.
  let last = "";
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const now = JSON.stringify(read());
    if (now === last) break;
    last = now;
  }
  return JSON.parse(last);

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

const index = await (await fetch(`${BASE}/en/tools`)).text();
const slugs = [...new Set([...index.matchAll(/href="\/en\/tools\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
if (slugs.length < 90) throw new Error(`only ${slugs.length} tool links found on /en/tools`);
let paths = [...PAGES, ...slugs.map((s) => `/tools/${s}`)];
if (ONLY) paths = paths.filter((p) => ONLY.split(",").some((s) => p === `/tools/${s}` || p === s));
const jobs = ["en", "ar"].flatMap((locale) => paths.map((p) => `/${locale}${p}`));

// WebGL off: every 3D scene (ViewportScene, HeartViewer) shows its 2D fallback in the same box, so the
// lock never depends on when a lazy 3D chunk swaps in.
const browser = await chromium.launch({ args: ["--disable-3d-apis"] });
const current = {};
const failedLoads = [];
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
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00Z"));
    const res = await page.goto(`${BASE}${job}`, { waitUntil: "networkidle", timeout: 180000 });
    if (!res || res.status() !== 200) failedLoads.push(`${job}: answered ${res?.status()}`);
    else current[job] = await page.evaluate(measure);
    await ctx.close();
  }
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close();
if (failedLoads.length) {
  console.error(failedLoads.join("\n"));
  process.exit(3);
}

const sorted = Object.fromEntries(Object.keys(current).sort().map((k) => [k, current[k]]));
if (WRITE) {
  mkdirSync(dirname(BASELINE), { recursive: true });
  // One page per line keeps the baseline diffable.
  writeFileSync(BASELINE, "{\n" + Object.entries(sorted).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n");
  console.log(`Baseline written: ${Object.keys(sorted).length} pages.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const problems = [];
let checked = 0;
for (const [view, cur] of Object.entries(sorted)) {
  const base = baseline[view];
  if (!base) { problems.push(`${view}: not in the baseline`); continue; }
  const live = LIVE.has(view.split("/").pop());
  const keys = live ? [1, 3] : [1, 2, 3, 4];
  if (!live && Math.abs(base.height - cur.height) > TOLERANCE) problems.push(`${view}: page height ${cur.height} (approved ${base.height})`);
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
if (!ONLY) for (const view of Object.keys(baseline)) if (!sorted[view]) problems.push(`${view}: not measured`);
if (problems.length) {
  console.error(problems.slice(0, Number(process.env.LOCK_SHOW ?? 80)).join("\n"));
  console.error(`FAIL: ${problems.length} change(s) to the approved desktop layout (${Object.keys(sorted).length} pages, ${checked} items checked).`);
  process.exit(1);
}
console.log(`PASS: approved desktop layout unchanged (${Object.keys(sorted).length} pages at ${WIDTH}px, ${checked} items, tolerance ${TOLERANCE}px).`);
