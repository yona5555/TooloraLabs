// Phone layout scan: page-level horizontal scroll, elements spilling out of their card / clipping box,
// numeric text nodes broken across lines, and the phone section order (input + result before any drawing).
// Usage: node apps/web/scripts/mobile-layout-scan.mjs [--base http://localhost:3005] [--locales en,ar]
//        [--widths 320,360] [--slugs a,b] [--jobs 6] [--details]
// Exit code 1 when any page has an overflow or a broken number.
import { chromium } from "playwright";

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const BASE = arg("base", "http://localhost:3005");
const LOCALES = arg("locales", "en,ar,es,fr,de,hi").split(",");
const WIDTHS = arg("widths", "320,360,375,390,430").split(",").map(Number);
const JOBS = Number(arg("jobs", "6"));
const DETAILS = process.argv.includes("--details");

let slugs = arg("slugs", "");
if (!slugs) {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  slugs = [...new Set([...xml.matchAll(/\/en\/tools\/([a-z0-9-]+)</g)].map((m) => m[1]))].join(",");
}
const SLUGS = slugs.split(",");

// Runs in the page.
function measure() {
  const vw = document.documentElement.clientWidth;
  const out = { sw: document.documentElement.scrollWidth, cw: vw, spills: [], broken: [], order: null };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0";
  };
  const label = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 4).join(".")}` : "";
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls} "${txt}"`;
  };
  const isScroller = (el) => /(auto|scroll)/.test(getComputedStyle(el).overflowX);
  const clips = (el) => getComputedStyle(el).overflowX !== "visible";
  // Skip off-canvas UI: fixed/absolute menus, sr-only text, tooltips, things inside a horizontal scroller.
  const skip = (el, inScroller = true) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.position === "fixed") return true;
      if (inScroller && e !== el && isScroller(e)) return true;
      if (e.matches?.("[role=tooltip], .sr-only, [aria-hidden=true][data-ticker]")) return true;
      if (cs.display === "none" || cs.visibility === "hidden") return true;
    }
    return false;
  };
  const main = document.querySelector("main") || document.body;
  const all = [...main.querySelectorAll("*")].filter((el) => !(el instanceof SVGElement && el.tagName !== "svg"));
  const spilled = new Set();
  for (const el of all) {
    if (!visible(el) || skip(el)) continue;
    const r = el.getBoundingClientRect();
    // the box that should contain it: nearest clipping ancestor or card, else the viewport
    let box = null;
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      if (e.matches("[data-bp-panel]") || clips(e)) { box = e.getBoundingClientRect(); break; }
    }
    const left = box ? box.left : 0;
    const right = box ? box.right : vw;
    if (r.right > right + 1.5 || r.left < left - 1.5) {
      if (getComputedStyle(el).position === "absolute" && el.closest("[data-preview=visual], svg, canvas")) continue;
      spilled.add(el);
    }
  }
  // report only the outermost spilling element of each chain
  for (const el of spilled) {
    let p = el.parentElement, nested = false;
    while (p) { if (spilled.has(p)) { nested = true; break; } p = p.parentElement; }
    if (!nested) {
      const r = el.getBoundingClientRect();
      out.spills.push(`${label(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
    }
  }

  // Numeric text nodes: digits plus operators / separators / at most 6 letters (units, symbols).
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim();
    if (!t || t.length > 60 || !/\p{Nd}/u.test(t)) continue;
    if ((t.match(/[\p{L}\p{M}]/gu) || []).length > 6) continue;
    const host = n.parentElement;
    if (!host || host.closest("svg, textarea, script, style, [contenteditable=true]") || !visible(host) || skip(host, false)) continue;
    range.selectNodeContents(n);
    const tops = new Set();
    for (const rect of range.getClientRects()) if (rect.width > 0.5) tops.add(Math.round(rect.top / 4));
    // two rects on adjacent 4px buckets are one line (sub-pixel baseline jitter)
    const lines = [...tops].sort((a, b) => a - b).filter((v, i, a) => i === 0 || v - a[i - 1] > 1).length;
    if (lines > 1) out.broken.push(`${label(host)} → ${lines} lines`);
  }

  // Phone order: the input cell, the result cell, and the first drawing (svg/canvas >= 80px, map, 3D).
  const result = document.querySelector("[data-tool-result]");
  if (result) {
    const input = result.parentElement.querySelector(":scope > [data-afold-cell]");
    const y = (el) => Math.round(el.getBoundingClientRect().top + scrollY);
    const drawings = [...main.querySelectorAll("svg, canvas, .maplibregl-map")].filter((d) => {
      const r = d.getBoundingClientRect();
      // a drawing that is part of the input card itself (a keypad, a preview) is not "before" it
      return r.width >= 80 && r.height >= 80 && visible(d) && !d.closest("button, a, [data-icon]") && !(input && input !== result && input.contains(d));
    });
    const firstNumber = (() => {
      // the result's headline value: first numeric text inside the result cell
      const w = document.createTreeWalker(result, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const h = n.parentElement;
        if (/\p{Nd}/u.test(n.textContent) && h && visible(h) && !h.closest("svg, button")) return y(h);
      }
      return null;
    })();
    const firstDrawing = drawings.length ? Math.min(...drawings.map(y)) : null;
    const h1 = document.querySelector("main h1");
    out.order = {
      h1Lines: h1 ? Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)) : null,
      inputTop: input && input !== result ? y(input) : null,
      inputBottom: input && input !== result ? y(input) + Math.round(input.getBoundingClientRect().height) : null,
      resultTop: y(result),
      firstNumber,
      firstDrawing,
      drawingBeforeInput: firstDrawing !== null && input && firstDrawing < y(input),
      drawingBeforeResultValue: firstDrawing !== null && firstNumber !== null && firstDrawing < firstNumber,
    };
  }
  return out;
}

const combos = [];
for (const w of WIDTHS) for (const l of LOCALES) for (const s of SLUGS) combos.push({ w, l, s });

const browser = await chromium.launch();
const results = [];
let next = 0;
async function worker() {
  const contexts = new Map();
  while (next < combos.length) {
    const c = combos[next++];
    if (!contexts.has(c.w)) contexts.set(c.w, await browser.newContext({ viewport: { width: c.w, height: 800 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }));
    const page = await contexts.get(c.w).newPage();
    try {
      await page.goto(`${BASE}/${c.l}/tools/${c.s}`, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(1200);
      results.push({ ...c, ...(await page.evaluate(measure)) });
    } catch (e) {
      results.push({ ...c, error: String(e).slice(0, 200) });
    }
    await page.close();
  }
  for (const ctx of contexts.values()) await ctx.close();
}
await Promise.all(Array.from({ length: JOBS }, worker));
await browser.close();

let bad = 0;
const pageScroll = results.filter((r) => r.sw > r.cw);
const spills = results.filter((r) => r.spills?.length);
const broken = results.filter((r) => r.broken?.length);
const errors = results.filter((r) => r.error);
for (const r of results) {
  const issues = [];
  if (r.error) issues.push(`ERROR ${r.error}`);
  if (r.sw > r.cw) issues.push(`page scroll ${r.sw}/${r.cw}`);
  if (r.spills?.length) issues.push(`spills ${r.spills.length}${DETAILS ? ": " + r.spills.slice(0, 4).join(" | ") : ""}`);
  if (r.broken?.length) issues.push(`broken ${r.broken.length}${DETAILS ? ": " + r.broken.slice(0, 4).join(" | ") : ""}`);
  if (issues.length) { bad++; console.log(`${r.s} ${r.l} ${r.w}: ${issues.join(" ; ")}`); }
}
const orderBad = [...new Set(results.filter((r) => r.l === "en" && r.order && (r.order.drawingBeforeInput || r.order.drawingBeforeResultValue)).map((r) => r.s))];
console.log(JSON.stringify({
  pages: results.length,
  pagesWithIssues: bad,
  pageScroll: pageScroll.length,
  pagesWithSpills: spills.length,
  pagesWithBrokenNumbers: broken.length,
  errors: errors.length,
  orderDrawingFirst: orderBad,
}));
if (DETAILS) for (const r of results.filter((x) => x.order && x.l === "en")) console.log("order", r.s, r.w, JSON.stringify(r.order));
process.exit(bad ? 1 : 0);
