// Chart label size + overlap check (visuals.md: chart axis labels >= 12 CSS px, §39 no overlaps) — measures,
// never screenshots. For every tool page, opens every collapsed card, scrolls the page so lazy charts mount,
// then for every <text> inside a chart SVG (rendered >= 60x40, outside the phone mini-card copies) computes the
// RENDERED font size = computed font-size x the SVG's current scale (getScreenCTM), and checks every pair of
// labels in the same SVG for overlapping boxes.
// Clipping is checked twice: glyph box past the SVG viewport ("viewport"), and glyph box cut by the nearest
// ancestor that clips its overflow ("container", e.g. an overflow-hidden card or scroll strip).
// Every overlap/clip is tagged with the label's role in the chart (axis, legend, value, annotation) so the
// findings group by the pattern that produces them.
// Usage: node scripts/axis-label-check.mjs [slug ...]
//   env BASE (default http://localhost:3001), LOCALES=en, WIDTHS=1440,390, MIN=12, JOBS=3,
//   OUT=<file.json> (all results + totals, grouped by tool and by chart)
// Prints one JSON line per tool/width/locale: {slug, w, locale, small:[...], overlaps:[...]}, then a TOTAL line
// and a table of the tools and charts with the most findings.
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE ?? "http://localhost:3001";
const locales = (process.env.LOCALES ?? "en").split(",");
const widths = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);
const MIN = Number(process.env.MIN ?? 12);
const jobs = Number(process.env.JOBS ?? 3);
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : process.env.SLUGS
    ? readFileSync(process.env.SLUGS, "utf8").trim().split("\n")
    : [...new Set([...readFileSync(new URL("../data/tools.ts", import.meta.url), "utf8").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]))];

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
      // [data-annotation]: a diagram that is not a chart (flow/formula diagram, no axis or scale): its text
      // keeps its authored size; it is still checked for overlaps and clipping, and counted apart.
      const exempt = !!t.closest("[data-annotation]");
      if (exempt) annotation++;
      if (!exempt && fs < MIN - 0.05) small.push({ card: where(svg), text: txt.slice(0, 24), px: Math.round(fs * 10) / 10, u: units, s: Math.round(scale * 100) / 100 });
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
      if (px < MIN - 0.05) small.push({ card: where(row), text: txt.slice(0, 24), px, html: 1 });
      boxes.push({ b: el.getBoundingClientRect(), txt });
    }
    for (let i = 0; i + 1 < boxes.length; i++) {
      const a = boxes[i].b, c = boxes[i + 1].b;
      const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
      if (ox > 1) overlaps.push({ card: where(row), a: boxes[i].txt, b: boxes[i + 1].txt, role: "axis+axis", pattern: "overlap · html track · axis+axis", ox: Math.round(ox), oy: 0 });
    }
  }
  return { checked, annotation, lineHits, small, overlaps, clipped };
}

async function scan(ctx, slug, locale) {
  const p = await ctx.newPage();
  try {
    await p.goto(`${base}/${locale}/tools/${slug}`, { waitUntil: "load", timeout: 120000 });
    await p.waitForTimeout(1500);
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
    await p.waitForTimeout(1500);
    return await p.evaluate(measure, MIN);
  } catch (e) {
    return { error: e.message.slice(0, 160) };
  } finally {
    await p.close();
  }
}

const b = await chromium.launch({ args: ["--use-angle=metal"] });
let nAnn = 0, nSmall = 0, nOver = 0, nClip = 0, nChecked = 0, nErr = 0;
const results = [];
for (const w of widths) {
  const ctx = await b.newContext(w < 800 ? { viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: 900 } });
  for (const locale of locales) {
    const queue = [...slugs];
    await Promise.all(
      Array.from({ length: jobs }, async () => {
        while (queue.length) {
          const slug = queue.shift();
          const r = await scan(ctx, slug, locale);
          if (r.error) nErr++;
          nSmall += r.small?.length ?? 0;
          nOver += r.overlaps?.length ?? 0;
          nClip += r.clipped?.length ?? 0;
          nChecked += r.checked ?? 0;
          nAnn += r.annotation ?? 0;
          results.push({ slug, w, locale, ...r });
          console.log(JSON.stringify({ slug, w, locale, ...r }));
        }
      }),
    );
  }
  await ctx.close();
}
console.log(`TOTAL labels=${nChecked} annotation=${nAnn} small(<${MIN}px)=${nSmall} overlaps=${nOver} clipped=${nClip} errors=${nErr} tools=${slugs.length} widths=${widths} locales=${locales}`);
await b.close();

// Grouped view: findings (overlaps + clips) per tool and per chart (tool / card title), with the split by
// locale, width, clip kind and label role, so the source pattern is visible at a glance.
const group = (key) => {
  const m = new Map();
  for (const r of results)
    for (const [type, list] of [["overlap", r.overlaps ?? []], ["clip", r.clipped ?? []]])
      for (const f of list) {
        const k = key(r, f);
        const g = m.get(k) ?? { key: k, overlaps: 0, clips: 0, by: {} };
        g[type === "overlap" ? "overlaps" : "clips"]++;
        for (const tag of [`${r.locale}`, `${r.w}`, type === "clip" ? `clip:${f.kind}` : "overlap", `${type}:${f.role}`]) g.by[tag] = (g.by[tag] ?? 0) + 1;
        m.set(k, g);
      }
  return [...m.values()].sort((a, c) => c.overlaps + c.clips - a.overlaps - a.clips);
};
const byTool = group((r) => r.slug);
const byChart = group((r, f) => `${r.slug} / ${f.card}`);
const byRole = group((r, f) => (f.kind ? `clip:${f.kind}:${f.role}` : `overlap:${f.role}`));
const byPattern = group((r, f) => f.pattern);
const totals = { labels: nChecked, annotation: nAnn, small: nSmall, overlaps: nOver, clipped: nClip, errors: nErr, tools: slugs.length, widths, locales };
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify({ totals, byTool, byChart, byRole, byPattern, results }, null, 1));
const table = (title, rows, n) => {
  console.log(`\n${title}\n${"overlaps".padStart(8)} ${"clips".padStart(6)}  name  [split]`);
  for (const g of rows.slice(0, n)) console.log(`${String(g.overlaps).padStart(8)} ${String(g.clips).padStart(6)}  ${g.key}  ${JSON.stringify(g.by)}`);
};
table("BY TOOL", byTool, 40);
table("BY CHART", byChart, 40);
table("BY ROLE", byRole, 20);
table("BY PATTERN", byPattern, 30);
