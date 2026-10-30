// Site audit: one gate over every indexable page for every text and page defect a visitor can see. Measures,
// never screenshots. The page list is the served /sitemap.xml, which app/sitemap.ts builds from
// lib/indexable-pages.ts only, so a page added there is audited with no edit here.
// For every page × locale (LOCALES, default en,ar) × width (WIDTHS, default 1440,390) it loads the page once,
// opens every collapsed card, scrolls so lazy charts mount, then measures in the light theme and again after
// switching to the dark theme (the ThemeToggle mechanism: the `dark` class on <html> + localStorage), and reports:
//   overlap    two chart labels (SVG <text>, HTML tick rows) whose glyph boxes overlap (§39)
//   clip       text cut by its SVG viewport or by a clipping ancestor (SVG and HTML), text cut by its own
//              overflow (ellipsis, line clamp, scroll box), and a page wider than the viewport
//   small      any visible text rendered below MIN (12) CSS px, transforms and SVG scale included
//   hydration  React hydration errors with the browser clock at build day + 3 days (tests/hydration-guard.mjs)
//   console    console errors, uncaught page errors, failed same-origin requests, a page that is not 200
//   a11y       axe-core: WCAG 2.x AA color contrast and every violation of critical impact
//   link       every same-origin <a href> on the audited pages answers 200 (after redirects)
//   idle       the settled page keeps animating: more than IDLE_MAX (5) animation frames or short timers (<= 100 ms)
//              fire in one idle second (a requestAnimationFrame / three.js / interval loop; tool-ui/motion)
// Each finding carries a `pattern`: the root cause key the inventory is grouped by (criterion, kind, component).
// Exits 1 when any criterion is above 0 (CI job site-audit, sharded; no pipe after it in the workflow).
// Usage: BASE=http://localhost:<port> node scripts/site-audit.mjs [path-filter ...]
//   RATCHET_MEASURE=1: measure only, always exit 0 unless the run itself breaks (CI's ratchet decides from OUT).
//   env LOCALES=en,ar  WIDTHS=1440,390  THEMES=light,dark  MIN=12  JOBS=3  SHARD=i/n (pages i, i+n, … of the
//   sitemap order, i from 1)  OUT=<file.json> (totals, inventory by root cause, every finding)  VERBOSE=1 (one
//   JSON line per page view)  PROGRESS=<file> (also append each progress line there)  RESULTS=<file.jsonl> (append
//   each page view's full result as one JSON line)  RESUME=<dir> (skip every view of this run already recorded in
//   <dir>/*.jsonl, and count its recorded result as if measured now: an interrupted run resumes)  PAGES=<file> (only
//   the localized pages listed, one per line, e.g. /ar/tools/bmi-calculator: CI's affected pages,
//   scripts/route-manifest.mjs). A path filter keeps the
//   paths that contain it (e.g. /tools/pomodoro-timer). Every page view prints one progress line.
//   --merge a.json b.json … : one inventory from shard OUT files (scripts/site-audit-sharded.sh runs the shards).
import { appendFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { settle } from "../../../scripts/lib/settle.mjs";
import { sliceShard } from "../../../scripts/lib/shard-pages.mjs";
import { chromium } from "playwright";
import { hydrationProblems, watchHydration } from "../../../tests/hydration-guard.mjs";

// --merge a.json b.json …: one inventory from the shards' OUT files (scripts/site-audit-sharded.sh); a broken
// link found by several shards counts once.
if (process.argv[2] === "--merge") {
  const parts = process.argv.slice(3).map((f) => JSON.parse(readFileSync(f, "utf8")));
  const seen = new Set();
  const findings = parts.flatMap((p) => p.findings).filter((f) => f.criterion !== "link" || (!seen.has(f.detail.url) && seen.add(f.detail.url)));
  const sum = (k) => parts.reduce((n, p) => n + p[k], 0);
  report(findings, { views: sum("views"), pages: sum("pages"), locales: parts[0].locales, widths: parts[0].widths, themes: parts[0].themes, links: sum("links"), measured: parts.flatMap((p) => p.measured ?? []), shards: parts.length });
  process.exit();
}

const base = requireBase(process.env.BASE);
const locales = (process.env.LOCALES ?? "en,ar").split(",");
const widths = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);
const themes = (process.env.THEMES ?? "light,dark").split(",");
const MIN = Number(process.env.MIN ?? 12);
const IDLE_MAX = 5; // animation frames + short timers allowed in one idle second (a stray deferred callback)
const VISIT_CLOCK = "2030-01-16T12:00:00Z";
const IDLE_WINDOWS = 3; // busy seconds in a row that make a loop
const jobs = Number(process.env.JOBS ?? 3);
const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const shard = process.env.SHARD ?? "1/1";
const [shardI, shardN] = shard.split("/").map(Number);
const filters = process.argv.slice(2);
const viewKey = (r) => `${r.locale}${r.path}@${r.w}`;
const listed = process.env.PAGES ? new Set(readFileSync(process.env.PAGES, "utf8").split("\n").filter(Boolean)) : null;
const inPages = (locale, path) => !listed || listed.has(`/${locale}${path}`);

// Locale-free paths of the served sitemap (lib/indexable-pages.ts), in its order.
const sitemap = await fetch(`${base}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`${base}/sitemap.xml answered ${sitemap.status}`);
const allPaths = [
  ...new Set(
    [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => new URL(m[1]).pathname)
      .filter((p) => locales.includes(p.split("/")[1]))
      .map((p) => p.replace(/^\/[^/]+/, "")),
  ),
];
const selected = allPaths.filter((p) => !filters.length || filters.some((f) => p.includes(f))).filter((p) => locales.some((l) => inPages(l, p)));
if (!selected.length) throw new Error(`no page to audit (sitemap ${allPaths.length} paths, filters ${filters.join(" ") || "none"}${listed ? `, PAGES ${listed.size} pages` : ""})`);
const paths = sliceShard(selected, shard);
// More shards than filtered pages: this shard has nothing to visit, and its empty OUT merges like any other.
if (!paths.length) {
  report([], { views: 0, pages: 0, locales, widths, themes, links: 0, measured: [] });
  process.exit();
}

function measure(MIN) {
  const visible = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    return true;
  };
  const where = (el) => {
    const card = el.closest("[data-card]") ?? el.closest("[data-bp-panel]");
    const h = card?.querySelector("h2, h3")?.textContent?.trim();
    const id = el.closest("[data-testid]")?.getAttribute("data-testid");
    return (h || id || "?").slice(0, 50);
  };
  // Role of a label in its chart, from its geometry only: legend = beside a small swatch; axis = in the band
  // along the drawing's left, right or bottom edge; value = a number inside the plot; else annotation.
  const role = (t, b, r) => {
    for (let s = t.previousElementSibling; s; s = s.previousElementSibling) {
      if (s.tagName === "text") break;
      if (/^(rect|circle|line|path)$/.test(s.tagName)) {
        const q = s.getBoundingClientRect();
        if (q.width <= 18 && q.height <= 18 && Math.abs((q.top + q.bottom) / 2 - (b.top + b.bottom) / 2) < 10) return "legend";
        break;
      }
    }
    const band = Math.min(48, r.width * 0.12);
    if (b.left - r.left < band || r.right - b.right < band || r.bottom - b.bottom < Math.min(36, r.height * 0.15)) return "axis";
    return /\d/.test(t.textContent) ? "value" : "annotation";
  };
  const clipBox = (svg) => {
    for (let n = svg.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX !== "visible" || cs.overflowY !== "visible") return n.getBoundingClientRect();
    }
    return null;
  };
  const ctx2d = document.createElement("canvas").getContext("2d");
  const ink = (t, e, scale) => {
    const cs = getComputedStyle(t);
    ctx2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx2d.direction = cs.direction;
    ctx2d.textAlign = "left"; // measure from the run's left edge (= e.left) in either direction
    const m = ctx2d.measureText(t.textContent);
    const base = e.bottom - m.fontBoundingBoxDescent * scale;
    return { left: e.left - m.actualBoundingBoxLeft * scale, right: e.left + m.actualBoundingBoxRight * scale, top: base - m.actualBoundingBoxAscent * scale, bottom: base + m.actualBoundingBoxDescent * scale };
  };
  const small = [];
  const overlaps = [];
  const clipped = [];
  let checked = 0;
  let visibleCount = 0; // labels with glyphs inside the drawing (`checked` also counts font boxes that only touch it)
  let lineHits = 0;
  let annotation = 0;
  for (const svg of document.querySelectorAll("svg")) {
    if (svg.parentElement?.closest("svg")) continue; // nested svg: handled with its outer one
    if (svg.closest("[data-phone-mini-slot], [data-phone-ticker]")) continue; // 88px thumbnail copies (approved phone standard)
    const r = svg.getBoundingClientRect();
    if (r.width < 60 || r.height < 40 || !visible(svg)) continue;
    const boxes = [];
    const cb = clipBox(svg);
    // Pattern tag: drawing library (Mafs or hand-drawn SVG) and whether svgPx has grown its labels (--svg-k > 1,
    // a fixed-viewBox chart scaled down: font sizes grow while the authored positions stay put).
    const lib = svg.closest(".MafsView") ? "mafs" : "svg";
    const grown = (parseFloat(getComputedStyle(svg).getPropertyValue("--svg-k")) || 1) > 1.001 ? "grown" : "authored";
    for (const t of svg.querySelectorAll("text")) {
      const txt = t.textContent.trim();
      if (!txt || !visible(t)) continue;
      const e = t.getBoundingClientRect();
      if (e.width < 0.5 || e.height < 0.5) continue;
      // Entirely outside the SVG viewport (e.g. Mafs tick labels past the visible range): never shown.
      if (e.right <= r.left || e.left >= r.right || e.bottom <= r.top || e.top >= r.bottom) continue;
      const m = t.getScreenCTM();
      if (!m) continue;
      const scale = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
      const units = parseFloat(getComputedStyle(t).fontSize);
      const fs = units * scale;
      // Ink box, not the font box: getBoundingClientRect spans the font's ascent + descent, which differ per
      // font (IBM Plex Sans Arabic descends 0.41em, Arial 0.23em), so two labels whose glyphs are 5px apart
      // can still have touching font boxes. The glyph extents are measured with canvas measureText in the
      // label's own font; the baseline is the font box bottom minus the font descent. Rotated or multi-line
      // (positioned <tspan>) labels keep the font box.
      const upright = Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6;
      const oneLine = ![...t.querySelectorAll("tspan")].some((s) => s.hasAttribute("x") || s.hasAttribute("y") || s.hasAttribute("dy"));
      const b = upright && oneLine ? ink(t, e, scale) : e;
      checked++;
      // Counted (its font box reaches into the drawing), but its glyphs are entirely outside: nothing of it
      // is drawn (e.g. a Mafs tick label just past the view), so it cannot be clipped or overlap anything.
      if (b.right <= r.left || b.left >= r.right || b.bottom <= r.top || b.top >= r.bottom) continue;
      visibleCount++;
      // Every visible label counts, diagrams ([data-annotation], counted apart) included: no text below MIN.
      if (t.closest("[data-annotation]")) annotation++;
      if (fs < MIN - 0.05) small.push({ card: where(svg), text: txt.slice(0, 24), px: Math.round(fs * 10) / 10, u: units, s: Math.round(scale * 100) / 100 });
      const rl = role(t, b, r);
      boxes.push({ t, b, txt, rl });
      // §39 / visuals.md "labels never clipped": glyph box past the SVG viewport (overflow hidden by default)
      const out = (c) => b.left < c.left - 1.5 || b.right > c.right + 1.5 || b.top < c.top - 1.5 || b.bottom > c.bottom + 1.5;
      const kind = getComputedStyle(svg).overflow !== "visible" && out(r) ? "viewport" : cb && out(cb) ? "container" : null;
      const c = kind === "viewport" ? r : cb;
      const edge = () => (b.left < c.left - 1.5 ? "left" : b.right > c.right + 1.5 ? "right" : b.top < c.top - 1.5 ? "top" : "bottom");
      if (kind)
        clipped.push({ card: where(svg), text: txt.slice(0, 24), kind, role: rl, pattern: `clip ${kind} · ${lib} · ${rl} at ${edge()} edge`, l: Math.round(b.left - c.left), r: Math.round(c.right - b.right), t: Math.round(b.top - c.top), b: Math.round(c.bottom - b.bottom) });
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].b, c = boxes[j].b;
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
        const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        // Glyph boxes include line-gap padding: require a real 1.5px overlap both ways, and ignore a label
        // nested in the other's text box (e.g. a halo copy drawn under the same label).
        if (ox > 1.5 && oy > 1.5 && boxes[i].txt !== boxes[j].txt) overlaps.push({ card: where(svg), a: boxes[i].txt.slice(0, 20), b: boxes[j].txt.slice(0, 20), role: [boxes[i].rl, boxes[j].rl].sort().join("+"), pattern: `overlap · ${lib} · ${[boxes[i].rl, boxes[j].rl].sort().join("+")} · ${grown} font`, ox: Math.round(ox), oy: Math.round(oy) });
      }
    // Labels crossed by a straight line (tick, axis, grid line): reported as a count to compare runs, since
    // some charts deliberately draw a label on a haloed band over a grid line.
    const lines = [...svg.querySelectorAll("line")].filter((l) => visible(l)).map((l) => l.getBoundingClientRect());
    for (const { b: a } of boxes)
      for (const c of lines) {
        const ox = Math.min(a.right - 2, c.right) - Math.max(a.left + 2, c.left);
        const oy = Math.min(a.bottom - 3, c.bottom) - Math.max(a.top + 3, c.top);
        if (ox >= 0 && oy >= 0) lineHits++;
      }
  }
  // HTML track scales (KitTrack ticks and any [data-axis-ticks] row): tick text in CSS px, never overlapping.
  for (const row of document.querySelectorAll("[data-ph-ticks], [data-axis-ticks]")) {
    if (row.closest("[data-phone-mini-slot], [data-phone-ticker]") || !visible(row)) continue;
    const boxes = [];
    for (const el of row.children) {
      const txt = el.textContent.trim();
      if (!txt || !visible(el)) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      checked++;
      visibleCount++;
      if (px < MIN - 0.05) small.push({ card: where(row), text: txt.slice(0, 24), px, html: 1 });
      boxes.push({ b: el.getBoundingClientRect(), txt });
    }
    for (let i = 0; i + 1 < boxes.length; i++) {
      const a = boxes[i].b, c = boxes[i + 1].b;
      const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
      if (ox > 1) overlaps.push({ card: where(row), a: boxes[i].txt, b: boxes[i + 1].txt, role: "axis+axis", pattern: "overlap · html track · axis+axis", ox: Math.round(ox), oy: 0 });
    }
  }
  return { checked, visible: visibleCount, annotation, lineHits, small, overlaps, clipped };
}


// HTML text (everything outside SVG): size below MIN, text cut by a clipping ancestor, text cut by its own
// overflow (ellipsis, line clamp, overflow hidden), and a page wider than the viewport. Text whose box is
// entirely outside its clip box is hidden on purpose (a collapsed panel), not cut, and is skipped.
function measureHtml(MIN) {
  const skip = "script, style, noscript, template, svg, [data-phone-mini-slot], [data-phone-ticker]";
  const hidden = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return true;
      if (cs.clipPath === "inset(50%)" || (cs.position === "absolute" && cs.clip === "rect(0px, 0px, 0px, 0px)")) return true; // sr-only
    }
    return false;
  };
  const scaleOf = (el) => {
    let s = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.transform && cs.transform !== "none") {
        const m = new DOMMatrix(cs.transform);
        s *= Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
      }
      if (cs.zoom && cs.zoom !== "normal") s *= Number(cs.zoom) || 1;
    }
    return s;
  };
  const sig = (el) => {
    const marker = el.closest("[data-testid], [data-card], [data-bp-panel], header, footer, nav, main, aside");
    const m = marker ? (marker.getAttribute("data-testid") ?? (marker.hasAttribute("data-card") ? "card" : marker.hasAttribute("data-bp-panel") ? "panel" : marker.tagName.toLowerCase())) : "body";
    const cls = [...el.classList].filter((c) => !/^(dark:|hover:|focus)/.test(c)).slice(0, 4).join(".");
    return `${m} > ${el.tagName.toLowerCase()}${cls ? "." + cls : ""}`;
  };
  const where = (el) => {
    const card = el.closest("[data-card]") ?? el.closest("[data-bp-panel]");
    const h = card?.querySelector("h2, h3")?.textContent?.trim();
    return (h || el.closest("[data-testid]")?.getAttribute("data-testid") || el.closest("header, footer, nav, main")?.tagName.toLowerCase() || "?").slice(0, 50);
  };
  const small = [];
  const clipped = [];
  let checked = 0;
  const range = document.createRange();
  const seenSelf = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const txt = node.textContent.trim();
    const el = node.parentElement;
    if (!txt || !el || el.closest(skip) || hidden(el)) continue;
    range.selectNodeContents(node);
    const b = range.getBoundingClientRect();
    if (b.width < 0.5 || b.height < 0.5) continue;
    checked++;
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize) * scaleOf(el);
    if (px < MIN - 0.05) small.push({ card: where(el), text: txt.slice(0, 24), px: Math.round(px * 10) / 10, pattern: `small · html · ${sig(el)}` });
    // Clipping ancestors, per axis; a scroll box (auto/scroll) keeps its content reachable on that axis.
    let cutX = true, cutY = true;
    for (let n = el; n && n !== document.body && (cutX || cutY); n = n.parentElement) {
      const ns = getComputedStyle(n);
      const c = n.getBoundingClientRect();
      const ox = ns.overflowX, oy = ns.overflowY;
      const hidX = cutX && (ox === "hidden" || ox === "clip"), hidY = cutY && (oy === "hidden" || oy === "clip");
      if (hidX || hidY) {
        const apart = b.right <= c.left || b.left >= c.right || b.bottom <= c.top || b.top >= c.bottom;
        if (apart) break; // hidden on purpose, not cut
        const edge = hidX && b.left < c.left - 1.5 ? "left" : hidX && b.right > c.right + 1.5 ? "right" : hidY && b.top < c.top - 1.5 ? "top" : hidY && b.bottom > c.bottom + 1.5 ? "bottom" : null;
        if (edge) {
          clipped.push({ card: where(el), text: txt.slice(0, 24), kind: "container", pattern: `clip container · html · ${sig(el)} at ${edge} edge (clipped by ${sig(n)})` });
          break;
        }
      }
      if (ox === "auto" || ox === "scroll") cutX = false;
      if (oy === "auto" || oy === "scroll") cutY = false;
    }
    // The text's own box cuts it: an ellipsis, a line clamp, or overflow hidden on the text element.
    if (!seenSelf.has(el) && (cs.textOverflow === "ellipsis" || (cs.webkitLineClamp && cs.webkitLineClamp !== "none") || cs.overflowX === "hidden" || cs.overflowY === "hidden" || cs.overflowX === "clip" || cs.overflowY === "clip")) {
      seenSelf.add(el);
      const over = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      if (over && el.clientWidth > 0)
        clipped.push({ card: where(el), text: txt.slice(0, 24), kind: cs.textOverflow === "ellipsis" ? "ellipsis" : cs.webkitLineClamp !== "none" ? "line-clamp" : "self", pattern: `clip ${cs.textOverflow === "ellipsis" ? "ellipsis" : "self"} · html · ${sig(el)}` });
    }
  }
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    let widest = null;
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 1 && (!widest || r.right > widest.r)) widest = { r: r.right, el };
    }
    clipped.push({ card: "page", text: `scrollWidth ${de.scrollWidth} > ${de.clientWidth}`, kind: "page", pattern: `clip page · wider than the viewport · ${widest ? sig(widest.el) : "?"}` });
  }
  return { checked, small, clipped };
}

// The first theme runs every WCAG 2.x A/AA rule; a later theme runs only color-contrast, the one reported rule
// that depends on the theme (a critical violation is markup, the same in both themes, so it is reported once).
async function axeCheck(p, contrastOnly) {
  if (!(await p.evaluate(() => "axe" in window))) await p.evaluate(AXE);
  const v = await p.evaluate(async (contrastOnly) => {
    const runOnly = contrastOnly ? { type: "rule", values: ["color-contrast"] } : { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] };
    const r = await window.axe.run(document, { runOnly, resultTypes: ["violations"] });
    return r.violations.flatMap((x) => (x.id === "color-contrast" || x.impact === "critical" ? x.nodes.map((n) => ({ id: x.id, impact: x.impact, target: n.target.join(" ").slice(0, 120), text: (n.any[0]?.message ?? x.help).slice(0, 140) })) : []));
  }, contrastOnly);
  // Root cause: the rule and the element's selector with ids, nth-child and slugs dropped.
  return v.map((f) => ({ ...f, pattern: `a11y · ${f.id} · ${f.target.replace(/#[\w-]+/g, "#…").replace(/:nth-child\(\d+\)/g, "")}` }));
}

const sameOrigin = (u) => new URL(u, base).origin === new URL(base).origin;

async function view(ctx, path, locale, w) {
  const url = `${base}/${locale}${path}`;
  const p = await ctx.newPage();
  const hydration = watchHydration(p);
  const consoleErrors = [];
  p.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message.split("\n")[0].slice(0, 160)}`));
  p.on("console", (m) => m.type() === "error" && consoleErrors.push(`console: ${m.text().split("\n")[0].slice(0, 160)}`));
  p.on("requestfailed", (r) => sameOrigin(r.url()) && !r.failure()?.errorText.includes("ERR_ABORTED") && consoleErrors.push(`request failed: ${new URL(r.url()).pathname} ${r.failure()?.errorText}`));
  p.on("response", (r) => sameOrigin(r.url()) && r.status() >= 400 && consoleErrors.push(`HTTP ${r.status()}: ${new URL(r.url()).pathname}`));
  const out = { path, locale, w, themes: {}, ms: {}, links: [] };
  // per-phase time, added to the progress line: a slow phase is named, not guessed
  let t = Date.now();
  const lap = (k) => {
    out.ms[k] = (out.ms[k] ?? 0) + Date.now() - t;
    t = Date.now();
  };
  try {
    const res = await p.goto(url, { waitUntil: "load", timeout: 120000 });
    if (res?.status() !== 200) consoleErrors.push(`page answered ${res?.status()}`);
    lap("load");
    await settle(p);
    for (let k = 0; k < 3; k++) {
      const n = await p.evaluate(() => {
        const t = [...document.querySelectorAll('[data-card-toggle][aria-expanded="false"]')];
        t.forEach((b) => b.click());
        return t.length;
      });
      if (!n) break;
      await settle(p);
    }
    // Scroll through the page so IntersectionObserver-lazy charts mount, then back to the top.
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await settle(p);
    // Idle: nothing may keep animating once the page has settled (tool-ui/motion). Count the animation frames
    // and short timers (<= 100 ms) the page requests during one idle second, with where each was requested. A
    // deferred callback lands in one second, a loop in all of them, so only IDLE_WINDOWS busy seconds in a row
    // are a finding; one window would report whichever callback happened to fall inside it.
    for (let k = 0; k < IDLE_WINDOWS; k++) {
      await p.evaluate(() => window.__idleProbe.reset());
      await p.waitForTimeout(1000);
      out.idle = await p.evaluate(() => window.__idleProbe.read());
      if (out.idle.raf + out.idle.timers <= IDLE_MAX) break;
    }
    lap("idle");
    for (const href of await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href))) {
      if (!sameOrigin(href) || !/^https?:/.test(href)) continue;
      const u = new URL(href);
      u.hash = "";
      out.links.push(u.href);
    }
    for (const theme of themes) {
      if (theme === "dark") {
        await p.emulateMedia({ colorScheme: "dark" });
        await p.evaluate(() => {
          localStorage.setItem("theme", "dark");
          document.documentElement.classList.add("dark");
        });
        await settle(p);
      }
      lap("settle");
      const chart = await p.evaluate(measure, MIN);
      lap("svg");
      const html = await p.evaluate(measureHtml, MIN);
      lap("html");
      const a11y = await axeCheck(p, theme !== themes[0]);
      lap("axe");
      out.themes[theme] = { overlaps: chart.overlaps, clipped: [...chart.clipped, ...html.clipped], small: [...chart.small.map((f) => ({ ...f, pattern: `small · svg · ${f.card}` })), ...html.small], a11y, labels: chart.checked, texts: html.checked };
    }
  } catch (e) {
    consoleErrors.push(`audit error: ${e.message.split("\n")[0].slice(0, 160)}`);
  } finally {
    out.hydration = hydration();
    out.console = consoleErrors.filter((m) => !hydration().some((h) => m.includes(h.slice(0, 60))));
    await p.close();
  }
  return out;
}

// The browser clock: one fixed moment, far from any build, not the build time + 3 days: the page's content follows the
// clock (sun angles, clock labels), so a clock that moves with the build moves the findings. It still differs from
// the server's render clock, which is what exposes a time-dependent hydration mismatch.
const visitClock = new Date(VISIT_CLOCK);
console.log(`site-audit: ${paths.length} pages × ${locales} × ${widths}px × ${themes}; browser clock ${visitClock.toISOString()}`);

// Views recorded by an interrupted run of this audit (RESUME): only this shard's pages, locales and widths, and
// only results of the same themes; the last record of a view wins.
const results = [];
const wanted = new Set(paths.flatMap((path) => locales.filter((locale) => inPages(locale, path)).flatMap((locale) => widths.map((w) => viewKey({ path, locale, w })))));
if (process.env.RESUME) {
  const recorded = new Map();
  for (const f of readdirSync(process.env.RESUME).filter((f) => f.endsWith(".jsonl")))
    for (const line of readFileSync(join(process.env.RESUME, f), "utf8").split("\n")) {
      if (!line) continue;
      const r = JSON.parse(line);
      // a record without the idle check predates that criterion: the view is measured again
      if (!wanted.has(viewKey(r)) || !themes.every((t) => r.themes[t]) || !r.idle) continue;
      // a view recorded before axe ran contrast-only after the first theme: the same rule applied to its record
      for (const t of themes.slice(1)) r.themes[t].a11y = r.themes[t].a11y.filter((f) => f.id === "color-contrast");
      recorded.set(viewKey(r), r);
    }
  results.push(...recorded.values());
  console.log(`site-audit: resuming, ${results.length} of ${wanted.size} views already recorded in ${process.env.RESUME}`);
}
const done = new Set(results.map(viewKey));
const b = await chromium.launch();
const totalViews = wanted.size;
// Random numbers (init script): one fixed sequence per page load, so a page that draws random values renders the
// same thing on every run; fixture data and the browser clock are already fixed.
function seedRandom() {
  let s = 0x2f6e2b1;
  const next = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Math.random = next;
  crypto.getRandomValues = (a) => {
    for (let i = 0; i < a.length; i++) a[i] = Math.floor(next() * 2 ** (a.BYTES_PER_ELEMENT * 8));
    return a;
  };
}

// The idle probe (init script): counts every animation frame and every timer of <= 100 ms that FIRES, each with
// the call site that scheduled it (first stack frame outside the probe), so a loop is named by its source.
function idleProbe() {
  const probe = { raf: 0, timers: 0, sites: {} };
  const site = () => (new Error().stack ?? "").split("\n").slice(3, 4).join("").trim().replace(/^at /, "").replace(/\?[^:)]*/, "").slice(0, 160);
  const note = (kind, s) => {
    probe[kind]++;
    probe.sites[s] = (probe.sites[s] ?? 0) + 1;
  };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => {
    const s = site();
    return raf((t) => (note("raf", s), cb(t)));
  };
  for (const name of ["setTimeout", "setInterval"]) {
    const orig = window[name].bind(window);
    window[name] = (cb, ms, ...rest) => {
      if ((Number(ms) || 0) > 100 || typeof cb !== "function") return orig(cb, ms, ...rest);
      const s = site();
      return orig((...a) => (note("timers", s), cb(...a)), ms, ...rest);
    };
  }
  window.__idleProbe = {
    reset: () => Object.assign(probe, { raf: 0, timers: 0, sites: {} }) && Date.now(),
    read: () => ({ raf: probe.raf, timers: probe.timers, sites: Object.keys(probe.sites).sort().slice(0, 5) }), // no counts: they follow the frame rate
  };
}

for (const w of widths) {
  const ctx = await b.newContext(w < 800 ? { viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: 900 } });
  await ctx.clock.setFixedTime(visitClock);
  await ctx.addInitScript(() => localStorage.setItem("theme", "light"));
  await ctx.addInitScript(idleProbe);
  await ctx.addInitScript(seedRandom);
  await ctx.routeWebSocket(/^wss?:\/\//, () => {}); // live price streams stay silent: a real tick changes the page between runs
  for (const locale of locales) {
    const queue = paths.filter((path) => inPages(locale, path) && !done.has(viewKey({ path, locale, w })));
    await Promise.all(
      Array.from({ length: jobs }, async () => {
        while (queue.length) {
          const path = queue.shift();
          const t0 = Date.now();
          const r = await view(ctx, path, locale, w);
          results.push(r);
          // one progress line per page view: a stuck page shows at once (no new line), and the rate is visible
          const line = `[${new Date().toISOString().slice(11, 19)}] shard ${shardI}/${shardN} ${results.length}/${totalViews} /${locale}${path} @${w}px ${((Date.now() - t0) / 1000).toFixed(1)}s ${Object.entries(r.ms).map(([k, v]) => `${k}=${(v / 1000).toFixed(1)}`).join(" ")}`;
          console.log(line);
          if (process.env.PROGRESS) appendFileSync(process.env.PROGRESS, line + "\n"); // the merged progress file of all shards
          if (process.env.RESULTS) appendFileSync(process.env.RESULTS, JSON.stringify(r) + "\n"); // RESUME reads it back
          if (process.env.VERBOSE) console.log(JSON.stringify(r));
        }
      }),
    );
  }
  await ctx.close();
}
await b.close();

// Internal links: each distinct same-origin URL once (the first view that links to it), redirects followed, must end at 200.
const links = new Map();
for (const r of results) for (const u of r.links ?? []) if (!links.has(u)) links.set(u, `/${r.locale}${r.path}`);
const brokenLinks = [];
const queue = [...links];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const [u, from] = queue.shift();
      const res = await fetch(u, { redirect: "follow" }).catch((e) => ({ status: e.message }));
      if (res.status !== 200) brokenLinks.push({ url: new URL(u).pathname, from, status: res.status, pattern: `link · ${res.status} · ${new URL(u).pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "/{locale}")}` });
    }
  }),
);

// Inventory: every finding with its criterion, view and root-cause pattern.
const findings = [];
for (const r of results) {
  const at = { page: `/${r.locale}${r.path}`, w: r.w, locale: r.locale };
  for (const h of hydrationProblems(at.page, r.hydration)) findings.push({ criterion: "hydration", ...at, theme: "-", detail: h, pattern: `hydration · ${r.path.startsWith("/tools/") ? r.path : "page " + r.path}` });
  if (r.idle && r.idle.raf + r.idle.timers > IDLE_MAX)
    findings.push({ criterion: "idle", ...at, theme: "-", detail: { sites: r.idle.sites.map((s) => s.replace(/\/_next\/static\/chunks\/[\w.-]+/, "chunk")) }, pattern: `idle · ${r.idle.sites[0]?.replace(/\/_next\/static\/chunks\/[\w.-]+/, "chunk") ?? "?"} · ${r.path.startsWith("/tools/") ? r.path : "page " + r.path}` });
  for (const c of r.console) findings.push({ criterion: "console", ...at, theme: "-", detail: c, pattern: `console · ${c.replace(/\/(en|ar)(\/[^\s]*)?/g, "/{locale}…").replace(/\d+/g, "N").slice(0, 120)}` });
  for (const [theme, t] of Object.entries(r.themes)) {
    for (const f of t.overlaps) findings.push({ criterion: "overlap", ...at, theme, detail: f, pattern: f.pattern });
    for (const f of t.clipped) findings.push({ criterion: "clip", ...at, theme, detail: f, pattern: f.pattern });
    for (const f of t.small) findings.push({ criterion: "small", ...at, theme, detail: f, pattern: f.pattern });
    for (const f of t.a11y) findings.push({ criterion: "a11y", ...at, theme, detail: f, pattern: f.pattern });
  }
}
for (const l of brokenLinks) findings.push({ criterion: "link", page: l.from, w: "-", locale: "-", theme: "-", detail: l, pattern: l.pattern });

// A page counts as measured only when every width of it was visited: scripts/ratchet.mjs compares this list with
// the pages the shard had to measure, so an unvisited page can never pass as a clean one.
const viewsOf = Map.groupBy(results, (r) => `/${r.locale}${r.path}`);
const measured = [...viewsOf].filter(([, views]) => new Set(views.map((r) => r.w)).size === widths.length).map(([page]) => page).sort();
// Shards visit pages concurrently: the order of arrival is not a result.
const order = (f) => JSON.stringify([f.page, f.w, f.theme, f.criterion, f.pattern, f.detail]);
findings.sort((a, c) => (order(a) < order(c) ? -1 : order(a) > order(c) ? 1 : 0));
report(findings, { views: results.length * themes.length, pages: paths.length, locales, widths, themes, links: links.size, measured });

/** Totals per criterion, the inventory grouped by root cause (OUT file + table), exit code 1 on any finding; with
 *  RATCHET_MEASURE=1 the results only go to OUT and scripts/ratchet.mjs decides, so no ::error is raised here. */
function report(findings, meta) {
  const CRITERIA = ["overlap", "clip", "small", "hydration", "console", "a11y", "link", "idle"];
  const totals = Object.fromEntries(CRITERIA.map((c) => [c, findings.filter((f) => f.criterion === c).length]));
  const groups = new Map();
  for (const f of findings) {
    const g = groups.get(f.pattern) ?? { pattern: f.pattern, criterion: f.criterion, count: 0, pages: new Set(), example: f };
    g.count++;
    g.pages.add(f.page);
    groups.set(f.pattern, g);
  }
  const byRootCause = [...groups.values()].sort((a, c) => a.criterion.localeCompare(c.criterion) || c.count - a.count).map((g) => ({ ...g, pages: [...g.pages].sort() }));
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify({ totals, ...meta, byRootCause, findings }, null, 1) + "\n");
  console.log(`TOTAL views=${meta.views} pages=${meta.pages} ${CRITERIA.map((c) => `${c}=${totals[c]}`).join(" ")} links=${meta.links}`);
  if (findings.length) {
    console.log(`\nINVENTORY BY ROOT CAUSE (${byRootCause.length} causes)\n${"count".padStart(6)} ${"pages".padStart(5)}  criterion  pattern  [example]`);
    for (const g of byRootCause.slice(0, Number(process.env.SHOW ?? 120)))
      console.log(`${String(g.count).padStart(6)} ${String(g.pages.length).padStart(5)}  ${g.criterion.padEnd(9)}  ${g.pattern}  [${g.example.page} ${g.example.w}px ${g.example.theme}]`);
    if (process.env.RATCHET_MEASURE) return;
    console.error(`::error title=site-audit::${CRITERIA.map((c) => `${c} ${totals[c]}`).join(", ")} (inventory above${process.env.OUT ? `, ${process.env.OUT}` : ""})`);
    process.exitCode = 1;
  }
}
