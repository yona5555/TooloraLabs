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
// Each finding carries a `pattern`: the root cause key the inventory is grouped by (criterion, kind, component).
// Exits 1 when any criterion is above 0 (CI job site-audit, sharded; no pipe after it in the workflow).
// Usage: BASE=http://localhost:<port> node scripts/site-audit.mjs [path-filter ...]
//   env LOCALES=en,ar  WIDTHS=1440,390  THEMES=light,dark  MIN=12  JOBS=3  SHARD=i/n (pages i, i+n, … of the
//   sitemap order, i from 1)  OUT=<file.json> (totals, inventory by root cause, every finding)  VERBOSE=1 (one
//   JSON line per page view)  PROGRESS=<file> (also append each progress line there). A path filter keeps the
//   paths that contain it (e.g. /tools/pomodoro-timer). Every page view prints one progress line.
//   --merge a.json b.json … : one inventory from shard OUT files (scripts/site-audit-sharded.sh runs the shards).
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { chromium } from "playwright";
import { clockAfterBuild, hydrationProblems, renderedAtOf, watchHydration } from "../../../tests/hydration-guard.mjs";

// --merge a.json b.json …: one inventory from the shards' OUT files (scripts/site-audit-sharded.sh); a broken
// link found by several shards counts once.
if (process.argv[2] === "--merge") {
  const parts = process.argv.slice(3).map((f) => JSON.parse(readFileSync(f, "utf8")));
  const seen = new Set();
  const findings = parts.flatMap((p) => p.findings).filter((f) => f.criterion !== "link" || (!seen.has(f.detail.url) && seen.add(f.detail.url)));
  const sum = (k) => parts.reduce((n, p) => n + p[k], 0);
  report(findings, { views: sum("views"), pages: sum("pages"), locales: parts[0].locales, widths: parts[0].widths, themes: parts[0].themes, links: sum("links"), shards: parts.length });
  process.exit();
}

const base = requireBase(process.env.BASE);
const locales = (process.env.LOCALES ?? "en,ar").split(",");
const widths = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);
const themes = (process.env.THEMES ?? "light,dark").split(",");
const MIN = Number(process.env.MIN ?? 12);
const jobs = Number(process.env.JOBS ?? 3);
const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const [shardI, shardN] = (process.env.SHARD ?? "1/1").split("/").map(Number);
const filters = process.argv.slice(2);

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
const paths = allPaths.filter((p) => !filters.length || filters.some((f) => p.includes(f))).filter((_, i) => i % shardN === shardI - 1);
if (!paths.length) throw new Error(`no page to audit (sitemap ${allPaths.length} paths, filters ${filters.join(" ") || "none"}, shard ${shardI}/${shardN})`);

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

async function axeCheck(p) {
  await p.evaluate(AXE);
  const v = await p.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }, resultTypes: ["violations"] });
    return r.violations.flatMap((x) => (x.id === "color-contrast" || x.impact === "critical" ? x.nodes.map((n) => ({ id: x.id, impact: x.impact, target: n.target.join(" ").slice(0, 120), text: (n.any[0]?.message ?? x.help).slice(0, 140) })) : []));
  });
  // Root cause: the rule and the element's selector with ids, nth-child and slugs dropped.
  return v.map((f) => ({ ...f, pattern: `a11y · ${f.id} · ${f.target.replace(/#[\w-]+/g, "#…").replace(/:nth-child\(\d+\)/g, "")}` }));
}

const sameOrigin = (u) => new URL(u, base).origin === new URL(base).origin;
const links = new Map(); // url -> first page that links to it

async function view(ctx, path, locale, w) {
  const url = `${base}/${locale}${path}`;
  const p = await ctx.newPage();
  const hydration = watchHydration(p);
  const consoleErrors = [];
  p.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message.split("\n")[0].slice(0, 160)}`));
  p.on("console", (m) => m.type() === "error" && consoleErrors.push(`console: ${m.text().split("\n")[0].slice(0, 160)}`));
  p.on("requestfailed", (r) => sameOrigin(r.url()) && !r.failure()?.errorText.includes("ERR_ABORTED") && consoleErrors.push(`request failed: ${new URL(r.url()).pathname} ${r.failure()?.errorText}`));
  p.on("response", (r) => sameOrigin(r.url()) && r.status() >= 400 && consoleErrors.push(`HTTP ${r.status()}: ${new URL(r.url()).pathname}`));
  const out = { path, locale, w, themes: {}, ms: {} };
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
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1200);
    for (let k = 0; k < 3; k++) {
      const n = await p.evaluate(() => {
        const t = [...document.querySelectorAll('[data-card-toggle][aria-expanded="false"]')];
        t.forEach((b) => b.click());
        return t.length;
      });
      if (!n) break;
      await p.waitForTimeout(300);
    }
    // Scroll through the page so IntersectionObserver-lazy charts mount, then back to the top.
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1200);
    for (const href of await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href))) {
      if (!sameOrigin(href) || !/^https?:/.test(href)) continue;
      const u = new URL(href);
      u.hash = "";
      if (!links.has(u.href)) links.set(u.href, `/${locale}${path}`);
    }
    for (const theme of themes) {
      if (theme === "dark") {
        await p.emulateMedia({ colorScheme: "dark" });
        await p.evaluate(() => {
          localStorage.setItem("theme", "dark");
          document.documentElement.classList.add("dark");
        });
        await p.waitForTimeout(400);
      }
      lap("settle");
      const chart = await p.evaluate(measure, MIN);
      lap("svg");
      const html = await p.evaluate(measureHtml, MIN);
      lap("html");
      const a11y = await axeCheck(p);
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

// The browser clock: build time (the render clock of the first page that sends one) + 3 days.
let builtAt = null;
for (const path of allPaths.slice(0, 40)) {
  builtAt = renderedAtOf(await (await fetch(`${base}/${locales[0]}${path}`)).text());
  if (builtAt !== null) break;
}
if (builtAt === null) throw new Error(`no render clock (renderedAt) on the first sitemap pages of ${base}: the hydration guard needs it`);
const visitClock = clockAfterBuild(builtAt);
console.log(`site-audit: ${paths.length} pages × ${locales} × ${widths}px × ${themes}; browser clock ${visitClock.toISOString()} (build ${new Date(builtAt).toISOString()})`);

const b = await chromium.launch();
const results = [];
const totalViews = paths.length * locales.length * widths.length;
for (const w of widths) {
  const ctx = await b.newContext(w < 800 ? { viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: 900 } });
  await ctx.clock.setFixedTime(visitClock);
  await ctx.addInitScript(() => localStorage.setItem("theme", "light"));
  for (const locale of locales) {
    const queue = [...paths];
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
          if (process.env.VERBOSE) console.log(JSON.stringify(r));
        }
      }),
    );
  }
  await ctx.close();
}
await b.close();

// Internal links: each distinct same-origin URL once, redirects followed, must end at 200.
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
  for (const c of r.console) findings.push({ criterion: "console", ...at, theme: "-", detail: c, pattern: `console · ${c.replace(/\/(en|ar)(\/[^\s]*)?/g, "/{locale}…").replace(/\d+/g, "N").slice(0, 120)}` });
  for (const [theme, t] of Object.entries(r.themes)) {
    for (const f of t.overlaps) findings.push({ criterion: "overlap", ...at, theme, detail: f, pattern: f.pattern });
    for (const f of t.clipped) findings.push({ criterion: "clip", ...at, theme, detail: f, pattern: f.pattern });
    for (const f of t.small) findings.push({ criterion: "small", ...at, theme, detail: f, pattern: f.pattern });
    for (const f of t.a11y) findings.push({ criterion: "a11y", ...at, theme, detail: f, pattern: f.pattern });
  }
}
for (const l of brokenLinks) findings.push({ criterion: "link", page: l.from, w: "-", locale: "-", theme: "-", detail: l, pattern: l.pattern });

report(findings, { views: results.length * themes.length, pages: paths.length, locales, widths, themes, links: links.size });

/** Totals per criterion, the inventory grouped by root cause (OUT file + table), exit code 1 on any finding. */
function report(findings, meta) {
  const CRITERIA = ["overlap", "clip", "small", "hydration", "console", "a11y", "link"];
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
    console.error(`::error title=site-audit::${CRITERIA.map((c) => `${c} ${totals[c]}`).join(", ")} (inventory above${process.env.OUT ? `, ${process.env.OUT}` : ""})`);
    process.exitCode = 1;
  }
}
