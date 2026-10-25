// Chart label size + overlap check (visuals.md: chart axis labels >= 12 CSS px, §39 no overlaps) — measures,
// never screenshots. For every tool page, opens every collapsed card, scrolls the page so lazy charts mount,
// then for every <text> inside a chart SVG (rendered >= 60x40, outside the phone mini-card copies) computes the
// RENDERED font size = computed font-size x the SVG's current scale (getScreenCTM), and checks every pair of
// labels in the same SVG for overlapping boxes.
// Usage: node scripts/axis-label-check.mjs [slug ...]
//   env BASE (default http://localhost:3001), LOCALES=en, WIDTHS=1440,390, MIN=12, JOBS=3
// Prints one JSON line per tool/width/locale: {slug, w, locale, small:[...], overlaps:[...]}, then a TOTAL line.
import { readFileSync } from "node:fs";
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
      // Ink box, not the em box: the em box reaches the font ascent (~0.9em) while caps and digits stop at
      // ~0.72em, so two 12px labels set 12px apart do not touch even though their em boxes overlap by 2px.
      const upright = Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6;
      const b = upright ? { left: e.left, right: e.right, top: e.top + 0.19 * fs, bottom: e.bottom } : e;
      checked++;
      // [data-annotation]: a diagram that is not a chart (flow/formula diagram, no axis or scale): its text
      // keeps its authored size; it is still checked for overlaps and clipping, and counted apart.
      const exempt = !!t.closest("[data-annotation]");
      if (exempt) annotation++;
      if (!exempt && fs < MIN - 0.05) small.push({ card: where(svg), text: txt.slice(0, 24), px: Math.round(fs * 10) / 10, u: units, s: Math.round(scale * 100) / 100 });
      boxes.push({ t, b, txt });
      // §39 / visuals.md "labels never clipped": glyph box past the SVG viewport (overflow hidden by default)
      if (getComputedStyle(svg).overflow !== "visible" && (b.left < r.left - 1.5 || b.right > r.right + 1.5 || b.top < r.top - 1.5 || b.bottom > r.bottom + 1.5))
        clipped.push({ card: where(svg), text: txt.slice(0, 24), l: Math.round(b.left - r.left), r: Math.round(r.right - b.right), t: Math.round(b.top - r.top), b: Math.round(r.bottom - b.bottom) });
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].b, c = boxes[j].b;
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
        const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        // Glyph boxes include line-gap padding: require a real 1.5px overlap both ways, and ignore a label
        // nested in the other's text box (e.g. a halo copy drawn under the same label).
        if (ox > 1.5 && oy > 1.5 && boxes[i].txt !== boxes[j].txt) overlaps.push({ card: where(svg), a: boxes[i].txt.slice(0, 20), b: boxes[j].txt.slice(0, 20), ox: Math.round(ox), oy: Math.round(oy) });
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
      if (ox > 1) overlaps.push({ card: where(row), a: boxes[i].txt, b: boxes[i + 1].txt, ox: Math.round(ox), oy: 0 });
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
          console.log(JSON.stringify({ slug, w, locale, ...r }));
        }
      }),
    );
  }
  await ctx.close();
}
console.log(`TOTAL labels=${nChecked} annotation=${nAnn} small(<${MIN}px)=${nSmall} overlaps=${nOver} clipped=${nClip} errors=${nErr} tools=${slugs.length} widths=${widths} locales=${locales}`);
await b.close();
