#!/usr/bin/env node
// Regression lock for the APPROVED phone home page (.claude/rules/visuals.md, "APPROVED — LOCKED").
// Opens /ar and /en at 360px and 390px and records, for the header, the calculator frame, the
// categories list and the footer: element order, bounding rects, computed font sizes and visible
// texts. Fails when any rect moves or resizes by more than 1px, or any order, text or font size
// changes, against tests/baselines/home-phone.json. Colors are locked too (tests/color-lock.mjs): every
// element records its computed background-color, color and border-color in the light theme and, after a
// reload with localStorage theme=dark (the site's own mechanism), in the dark theme; any difference fails.
//   npm run test:home-phone                        -> compare (exit 1 on any change)
//   npm run baseline:home-phone -- --approve       -> rewrite the baseline (only with --approve)
// Options: --base <url> (required: a server on a dedicated free port, e.g. scripts/test-server.sh start 3110 apps/web)
// The page uses system fonts (Arial), so each OS has its own baseline: home-phone.json on macOS
// (local), home-phone.linux.json on Linux (CI runner ubuntu-24.04).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { compareColors, THEMES } from "./color-lock.mjs";
import { hydrationProblems, watchHydration } from "./hydration-guard.mjs";
import { requireBase } from "../scripts/lib/require-base.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(join(ROOT, "apps/web/package.json"))("playwright");
const BASELINE = join(ROOT, `tests/baselines/home-phone${process.platform === "linux" ? ".linux" : ""}.json`);
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const BASE = requireBase(arg("base"));
const WRITE = process.argv.includes("--write");
const APPROVE = process.argv.includes("--approve");
const TOLERANCE = 1;

if (WRITE && !APPROVE) {
  console.error("Refusing to rewrite the approved baseline without --approve (npm run baseline:home-phone -- --approve).");
  process.exit(2);
}

// Runs in the page.
async function measure() {
  await document.fonts.ready;
  // FitNumbers and other layout effects settle on the next animation frames.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const panel = document.querySelector("[data-history-panel]");
  const regions = {
    header: document.querySelector("header"),
    calculator: panel?.closest(".rounded-2xl.shadow-lg"),
    categories: [...document.querySelectorAll("nav[aria-label]")].find((n) => !n.closest("header") && !n.closest("footer")),
    footer: document.querySelector("footer"),
  };
  const out = { regionOrder: [], regions: {} };
  for (const [name, root] of Object.entries(regions)) {
    if (!root) { out.regions[name] = null; continue; }
    const items = [root, ...root.querySelectorAll("*")]
      .filter((e) => e.getClientRects().length > 0 && !["SCRIPT", "STYLE"].includes(e.tagName))
      .map((e) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        const text = [...e.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent.trim()).join(" ").trim();
        return { tag: e.tagName.toLowerCase(), x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), font: s.fontSize, text, colors: [s.backgroundColor, s.color, s.borderColor] };
      });
    out.regions[name] = items;
  }
  out.regionOrder = Object.entries(regions).filter(([, e]) => e).sort((a, b) => a[1].getBoundingClientRect().top - b[1].getBoundingClientRect().top).map(([n]) => n);
  return out;
}

const browser = await chromium.launch();
const current = {};
// Any React hydration error (tests/hydration-guard.mjs) on the light or the dark load fails the lock.
const hydrationFailures = [];
for (const locale of ["ar", "en"]) for (const width of [360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, colorScheme: "light", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const hydration = watchHydration(page);
  await page.addInitScript(() => document.addEventListener("DOMContentLoaded", () => {
    const st = document.createElement("style");
    st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
    document.head.appendChild(st);
  }));
  const res = await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle", timeout: 180000 });
  if (!res || res.status() !== 200) {
    console.error(`/${locale} answered ${res?.status()}; not measuring.`);
    process.exit(3);
  }
  const light = await page.evaluate(measure);
  // The dark theme the way the site applies it: the same page reloaded with localStorage theme=dark,
  // measured again, and only its colors kept (element i of a region gets dark colors from element i).
  await page.evaluate(() => localStorage.setItem("theme", "dark"));
  const again = await page.reload({ waitUntil: "networkidle", timeout: 180000 });
  if (!again || again.status() !== 200) {
    console.error(`/${locale} (dark) answered ${again?.status()}; not measuring.`);
    process.exit(3);
  }
  const dark = await page.evaluate(measure);
  for (const [name, items] of Object.entries(light.regions)) {
    items?.forEach((item, i) => (item.colors = { light: item.colors, dark: dark.regions[name]?.[i]?.colors }));
  }
  current[`${locale}@${width}`] = light;
  hydrationFailures.push(...hydrationProblems(`/${locale} @${width}px`, hydration()));
  await ctx.close();
}
await browser.close();
if (hydrationFailures.length) {
  console.error(`${hydrationFailures.join("\n")}\nFAIL: ${hydrationFailures.length} hydration error(s) on the phone home page; not measuring.`);
  process.exit(1);
}

if (WRITE) {
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(current, null, 1) + "\n");
  console.log(`Baseline written: ${Object.keys(current).length} views, ${Object.values(current).reduce((n, v) => n + Object.values(v.regions).reduce((m, r) => m + (r?.length ?? 0), 0), 0)} elements.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const problems = [];
let checked = 0;
for (const [view, base] of Object.entries(baseline)) {
  const cur = current[view];
  if (!cur) { problems.push(`${view}: not measured`); continue; }
  if (base.regionOrder.join(",") !== cur.regionOrder.join(",")) problems.push(`${view}: region order ${cur.regionOrder.join(" > ")} (approved ${base.regionOrder.join(" > ")})`);
  for (const [name, items] of Object.entries(base.regions)) {
    const now = cur.regions[name];
    if (!items || !now) { if (items !== now) problems.push(`${view} ${name}: region missing`); continue; }
    if (items.length !== now.length) problems.push(`${view} ${name}: ${now.length} elements (approved ${items.length})`);
    const n = Math.min(items.length, now.length);
    for (let i = 0; i < n; i++) {
      const a = items[i], b = now[i];
      checked++;
      const where = `${view} ${name} #${i} <${a.tag}>${a.text ? ` "${a.text.slice(0, 30)}"` : ""}`;
      if (a.tag !== b.tag) { problems.push(`${where}: element order changed (now <${b.tag}>)`); break; }
      if (a.text !== b.text) problems.push(`${where}: text now "${b.text.slice(0, 40)}"`);
      if (a.font !== b.font) problems.push(`${where}: font-size ${b.font} (approved ${a.font})`);
      for (const k of ["x", "y", "w", "h"]) if (Math.abs(a[k] - b[k]) > TOLERANCE) problems.push(`${where}: ${k} ${b[k]} (approved ${a[k]})`);
      problems.push(...compareColors(where, a.colors, b.colors));
    }
  }
}
if (problems.length) {
  console.error(problems.slice(0, 60).join("\n"));
  console.error(`FAIL: ${problems.length} change(s) to the approved phone home page layout or colors (${checked} elements checked).`);
  process.exit(1);
}
console.log(`PASS: approved phone home page layout and colors unchanged (${checked} elements, 4 views, tolerance ${TOLERANCE}px, ${THEMES.join(" + ")} colors).`);
