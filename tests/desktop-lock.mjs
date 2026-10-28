#!/usr/bin/env node
// Regression lock for the APPROVED desktop layout (DESKTOP phase, 2026-10-26). At 1440px (light, en + ar) it
// records, per page: the top-level cards in screen order (title, rect, title font size), the charts
// (top-level <svg> rects), the layout each drawing + table row picked (GapFreeRow `data-gap-layout`,
// IndicatorWithTable `data-split`), the main headings (h1/h2 rect + font size) and the page height. Fails
// when any rect moves or resizes by more than 1px, or any order, title, layout or font size changes.
// Colors are locked too (tests/color-lock.mjs): each card, its header strip, each chart and each heading
// records its computed background-color, color and border-color in the light theme and, after a reload
// with localStorage theme=dark (the site's own mechanism), in the dark theme; any difference fails. Every
// shown control inside main (button, [role=tab], input, select, a) is locked for its colors the same way,
// in document order under a short label (tag or role + text), so a restyled control fails by name.
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
// A React hydration error on any load (tests/hydration-guard.mjs) fails that page by name.
// Before the first page the server is confirmed up and warmed (every page under test, the routes they
// prefetch, their static files), and pages run on half the cores (at most 4) so the one server is never starved.
// The clock is fixed (2026-10-20 12:00 UTC, timezone UTC, server TZ=UTC and LANG=C.UTF-8) so the date tools
// render the same every day; Math.random and crypto.getRandomValues are seeded and WebSockets get no frames, so
// nothing else moves.
// Approve mode (--write --approve) writes the baseline from that one measurement and exits; it never
// re-measures (CI compares in a later run, against the committed baseline). The
// pages use system fonts in places, so each OS has its own baseline: desktop.json on macOS (local),
// desktop.linux.json on Linux (CI runner ubuntu-24.04, CI set only).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createConnection } from "node:net";
import { availableParallelism } from "node:os";
import { compareColors, compareControls, THEMES } from "./color-lock.mjs";
import { watchHydration } from "./hydration-guard.mjs";

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
// One `next start` process and Chromium share the machine with the pages: half the cores, at most 4 (the
// 4-vCPU ubuntu-24.04 runner gets 2 pages at a time, so the server is never starved while pages load).
const WORKERS = Math.max(1, Math.min(4, Math.floor(availableParallelism() / 2)));
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
  // until two reads 250ms apart agree AND no same-origin request is in flight (at most 40 reads, ~10s), so
  // a slow load never records a half-built page. Two equal reads alone are not enough: a client fetch that
  // is still running (the crypto 24h sparklines, /api/crypto/chart) swaps its same-size placeholder for an
  // <svg> later, and one run recorded 3 charts while the next one recorded 5. (Counted, not timed: the
  // page clock is fixed.)
  let last = "";
  let reads = 0;
  for (let i = 0; i < 40; i++, reads++) {
    await new Promise((r) => setTimeout(r, 250));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const now = JSON.stringify(read());
    const busy = await window.__lockInflight();
    if (now === last && !busy) break;
    last = now;
  }
  return { reads, data: JSON.parse(last) };

  function read() {
    const main = document.querySelector("main");
    const shown = (e) => e.getClientRects().length > 0 && !e.closest('dialog, [role="dialog"]');
    const colors = (e) => {
      const s = getComputedStyle(e);
      return [s.backgroundColor, s.color, s.borderColor];
    };
    const row = (label, e, font = "") => {
      const r = e.getBoundingClientRect();
      return [label, +r.x.toFixed(1), +(r.y + scrollY).toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1), font];
    };
    // Rows and colors come from the same elements, in the same order: [row, {element, header?}].
    const cardPairs = [...main.querySelectorAll("[data-card]")]
      .filter((c) => shown(c) && !c.parentElement.closest("[data-card]"))
      .map((c) => {
        const h = c.querySelector("[data-card-header] :is(h2,h3)") ?? c.querySelector("h2,h3");
        const header = c.querySelector(":scope > [data-card-header]");
        return [row((h?.textContent ?? "?").trim().slice(0, 40), c, h ? getComputedStyle(h).fontSize : ""), header ? { element: colors(c), header: colors(header) } : { element: colors(c) }];
      })
      .sort((a, b) => a[0][2] - b[0][2] || a[0][1] - b[0][1]);
    const chartPairs = [...main.querySelectorAll("svg")]
      .filter((s) => shown(s) && !s.parentElement.closest("svg") && !s.closest("[data-card-header], button, a") && s.getBoundingClientRect().width >= 100)
      .map((s) => [row("svg", s), { element: colors(s) }]);
    const layouts = [...main.querySelectorAll("[data-gap-layout], [data-split]")].filter(shown).map((e) => e.dataset.gapLayout ?? e.dataset.split);
    const headingPairs = [...main.querySelectorAll("h1, h2")].filter((h) => shown(h) && !h.closest("[data-card]")).map((h) => [row(h.textContent.trim().slice(0, 40), h, getComputedStyle(h).fontSize), { element: colors(h) }]);
    const controlLabel = (e) => {
      const kind = e.getAttribute("role") === "tab" ? "tab" : e.tagName.toLowerCase() + (e.type && e.tagName === "INPUT" ? `[${e.type}]` : "");
      const name = e.getAttribute("aria-label") || (e.tagName === "INPUT" || e.tagName === "SELECT" ? e.name || e.id : e.textContent);
      return `${kind} ${(name ?? "").replace(/\s+/g, " ").trim().slice(0, 40)}`.trim();
    };
    const controlPairs = [...main.querySelectorAll('button, [role="tab"], input, select, a')].filter(shown).map((e) => [controlLabel(e), { element: colors(e) }]);
    const split = (pairs) => [pairs.map((p) => p[0]), pairs.map((p) => p[1])];
    const [cards, cardColors] = split(cardPairs), [charts, chartColors] = split(chartPairs), [headings, headingColors] = split(headingPairs), [controls, controlColors] = split(controlPairs);
    return { height: document.documentElement.scrollHeight, cards, charts, layouts, headings, controls, colors: { cards: cardColors, charts: chartColors, headings: headingColors, controls: controlColors } };
  }
}

// { part: [{ element: [bg, color, border], header? }] } per theme -> { part: [{ element: { light, dark }, header? }] }.
function themed(light, dark) {
  return Object.fromEntries(Object.entries(light).map(([part, items]) => [part, items.map((item, i) =>
    Object.fromEntries(Object.entries(item).map(([name, value]) => [name, { light: value, dark: dark[part]?.[i]?.[name] }])))]));
}

let server;
if (OWN_SERVER) {
  if (!existsSync(join(WEB, ".next-lock/BUILD_ID"))) {
    console.error("No .next-lock build: run npm run build:desktop-lock first.");
    process.exit(2);
  }
  // The dedicated port must be free: a server already there would be measured instead of the fixture build,
  // and it is never stopped from here (only the server this test starts is, by its own handle).
  const taken = await new Promise((done) => {
    const probe = createConnection({ port: PORT, host: "127.0.0.1" }, () => (probe.destroy(), done(true)));
    probe.on("error", () => done(false));
  });
  if (taken) {
    console.error(`Port ${PORT} is already in use by another process; the desktop lock needs it free. Nothing was stopped.`);
    process.exit(2);
  }
  server = spawn(process.execPath, [webRequire.resolve("next/dist/bin/next"), "start", "-p", String(PORT)], {
    cwd: WEB,
    stdio: ["ignore", "ignore", "inherit"],
    // Fixed timezone and locale for the server too, so server-rendered dates match on every machine.
    env: { ...process.env, TZ: "UTC", LANG: "C.UTF-8", LC_ALL: "C.UTF-8", NEXT_TELEMETRY_DISABLED: "1", NEXT_DIST_DIR: ".next-lock", NODE_OPTIONS: `--import=${join(ROOT, "tests/fixtures/offline-fetch.mjs")}` },
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

// Warm the server before the first page: every page under test, every route those pages link to (Next.js
// prefetches each visible <Link> as RSC while measure() scrolls) and every static chunk they load. A cold
// route renders and loads its server modules on first request; done here, no page waits on a cold server.
async function warm() {
  const get = async (url, headers) => {
    const res = await fetch(`${BASE}${url}`, { headers });
    await res.arrayBuffer();
    if (!res.ok) throw new Error(`warm-up: ${url} answered ${res.status}`);
  };
  const html = new Map();
  await pool(jobs, async (job) => {
    const res = await fetch(`${BASE}${job}`);
    if (!res.ok) throw new Error(`warm-up: ${job} answered ${res.status}`);
    html.set(job, await res.text());
  });
  const routes = new Set(), chunks = new Set();
  for (const text of html.values()) {
    for (const [, href] of text.matchAll(/href="(\/(?:en|ar)(?:\/[^"#?]*)?)"/g)) routes.add(href);
    for (const [, src] of text.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) chunks.add(src);
  }
  await pool([...routes], (r) => get(r, { RSC: "1", "Next-Router-Prefetch": "1" }));
  await pool([...chunks], (c) => get(c));
  return { pages: html.size, routes: routes.size, chunks: chunks.size };
}
async function pool(items, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    for (let item; (item = queue.shift()) !== undefined; ) await fn(item);
  }));
}
const warmed = await warm().catch((e) => {
  stop();
  console.error(e.message);
  process.exit(3);
});
console.log(`Server warm: ${warmed.pages} pages, ${warmed.routes} linked routes (RSC prefetch), ${warmed.chunks} static files in ${((Date.now() - begun) / 1000).toFixed(1)}s; ${WORKERS} workers on ${availableParallelism()} cores.`);
const measuredFrom = Date.now();

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
    await ctx.addInitScript(() => {
      // Seeded Math.random (mulberry32): any random sample or example renders the same on every run.
      let seed = 0x2f6b9a1d;
      Math.random = () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      // crypto.getRandomValues from the same seed (a generated password, a random draw): the page renders
      // the same values on every run, so its control labels and chart widths never move.
      crypto.getRandomValues = (arr) => {
        const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
        return arr;
      };
      document.addEventListener("DOMContentLoaded", () => {
        const st = document.createElement("style");
        st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}";
        document.head.appendChild(st);
      });
    });
    const page = await ctx.newPage();
    // Any React hydration error (tests/hydration-guard.mjs) on the light or the dark load fails the page.
    const hydration = watchHydration(page);
    await page.route((url) => !sameOrigin(url.href), (route) => route.abort());
    // page.route does not see WebSockets: the live Coinbase ticker would reach the real feed and move live
    // prices. Every socket is answered locally and never sends a frame, so the snapshot (fixture) prices stay.
    await page.routeWebSocket(/.*/, () => {});
    const started = new Map(), slow = [];
    // Per-page server timings: the slowest /_next/static chunk and the slowest RSC (route prefetch) answer.
    const served = { chunk: 0, rsc: 0, rscCount: 0 };
    page.on("request", (r) => started.set(r, Date.now()));
    await page.exposeFunction("__lockInflight", () => [...started.keys()].filter((r) => sameOrigin(r.url())).length);
    const done = (r) => {
      const ms = Date.now() - started.get(r);
      started.delete(r);
      if (ms > 1500) slow.push(`${ms}ms ${r.url().replace(BASE, "")}`);
      if (r.url().includes("/_next/static/")) served.chunk = Math.max(served.chunk, ms);
      else if (r.url().includes("_rsc=")) (served.rsc = Math.max(served.rsc, ms)), served.rscCount++;
    };
    page.on("requestfinished", done);
    page.on("requestfailed", done);
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00Z"));
    const t0 = Date.now();
    let t1 = t0, tNav = 0, reads = 0;
    const visit = async () => {
      const res = await page.goto(`${BASE}${job}`, { waitUntil: "load", timeout: 10000 });
      if (!res || res.status() !== 200) throw new Error(`answered ${res?.status()}`);
      tNav = Date.now() - t0;
      // Ready signal: no request in flight for 500ms (lazy chunks, the market /api calls), then fonts and
      // two equal reads with no request in flight inside measure(). Live data comes from fixtures, so this is quick on every page.
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => slow.push("network not idle after 10s"));
      t1 = Date.now();
      let light;
      ({ reads, data: light } = await page.evaluate(measure));
      // The dark theme the way the site applies it (ThemeInitScript reads localStorage before paint): the
      // same page reloaded, measured again, and only its colors kept.
      await page.evaluate(() => localStorage.setItem("theme", "dark"));
      const again = await page.reload({ waitUntil: "load", timeout: 10000 });
      if (!again || again.status() !== 200) throw new Error(`dark reload answered ${again?.status()}`);
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => slow.push("dark: network not idle after 10s"));
      const { data: dark } = await page.evaluate(measure);
      // A hydration error makes React re-render the whole document, which drops the `dark` class from
      // <html>: the "dark" colors would then be the light ones. Fail by name instead of recording them.
      if (!(await page.evaluate(() => document.documentElement.classList.contains("dark")))) throw new Error("dark theme not applied after reload (no .dark on <html>: a hydration error re-rendered the document)");
      const hydrationErrors = hydration();
      if (hydrationErrors.length) throw new Error(`hydration error (${hydrationErrors[0]})${hydrationErrors.length > 1 ? ` and ${hydrationErrors.length - 1} more` : ""}`);
      current[job] = { ...light, colors: themed(light.colors, dark.colors) };
    };
    let cap;
    await Promise.race([visit(), new Promise((_, no) => (cap = setTimeout(() => no(new Error(`not measured within ${PAGE_CAP_MS / 1000}s`)), PAGE_CAP_MS)))])
      .catch((e) => failedLoads.push(`${job}: ${e.message.split("\n")[0]}`))
      .finally(() => clearTimeout(cap));
    const pending = [...started].map(([r, t]) => `pending ${Date.now() - t}ms ${r.url().replace(BASE, "")}`);
    timing.push({ job, nav: tNav, load: t1 - t0, measure: Date.now() - t1, reads, ...served, requests: [...slow, ...pending] });
    await ctx.close();
  }
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close();
stop();
const slowest = timing.reduce((a, t) => (t.load + t.measure > a.load + a.measure ? t : a), timing[0]);
console.log(`${SET} in ${((Date.now() - measuredFrom) / 1000).toFixed(1)}s; slowest ${slowest.job} ${slowest.load + slowest.measure}ms.`);
if (TIMING) {
  timing.sort((a, b) => b.load + b.measure - (a.load + a.measure));
  const total = timing.reduce((n, t) => n + t.load + t.measure, 0);
  writeFileSync(TIMING, [`${timing.length} pages, ${WORKERS} workers, page-time sum ${(total / 1000).toFixed(1)}s`, "page | nav ms | load ms | measure ms | reads | max chunk ms | max rsc ms (count) | slow (>1.5s) or pending requests",
    ...timing.map((t) => `${t.job} | ${t.nav} | ${t.load} | ${t.measure} | ${t.reads} | ${t.chunk} | ${t.rsc} (${t.rscCount}) | ${t.requests.join(", ")}`)].join("\n") + "\n");
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
      const was = base.colors?.[part]?.[i] ?? {}, now = cur.colors[part][i];
      for (const name of new Set([...Object.keys(was), ...Object.keys(now)])) problems.push(...compareColors(`${where} ${name}`, was[name], now[name]));
    }
  }
  checked += cur.controls.length;
  problems.push(...compareControls(view, base.controls, base.colors?.controls, cur.controls, cur.colors.controls));
}
if (FULL && !ONLY) for (const view of Object.keys(baseline)) if (!sorted[view]) problems.push(`${view}: not measured`);
if (problems.length) {
  console.error(problems.slice(0, Number(process.env.LOCK_SHOW ?? 80)).join("\n"));
  console.error(`FAIL: ${problems.length} change(s) to the approved desktop layout or colors (${Object.keys(sorted).length} pages, ${checked} items checked).`);
  process.exit(1);
}
console.log(`PASS: approved desktop layout and colors unchanged (${Object.keys(sorted).length} pages at ${WIDTH}px, ${checked} items, tolerance ${TOLERANCE}px, ${THEMES.join(" + ")} colors).`);
