// Card gap check (visuals.md "no empty gaps" rule) — measures, never screenshots.
// For every tool page at 1440px (ar + en by default), every card ([data-bp-panel]) that holds a
// drawing (svg ≥ 100×60 or canvas) is classified:
//   side-by-side: the drawing's part and the part(s) beside it; gap when one part's CONTENT is
//                 more than 30% taller than the other's (a stretched but half-empty panel counts).
//   stacked:      gap when the drawings on the drawing's row use less than 75% of the card's
//                 inner width (narrow centred column with blank sides).
// Usage: node scripts/card-gap-check.mjs [slug ...]  (env BASE, LOCALES=ar,en, WIDTH=1440, ONLY_GAPS=1)
// Prints JSON lines: {slug, locale, title, layout, ratio|fill, gap}.
import { readFileSync } from "node:fs";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { chromium } from "playwright";

const base = requireBase(process.env.BASE);
const locales = (process.env.LOCALES ?? "ar,en").split(",");
const width = Number(process.env.WIDTH ?? 1440);
const onlyGaps = process.env.ONLY_GAPS === "1";
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...new Set([...readFileSync(new URL("../data/tools.ts", import.meta.url), "utf8").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]))];

function measure() {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  // A zero-size wrapper still counts when something inside it is visible (e.g. maplibre's canvas container).
  const shown = (el, d = 0) => visible(el) || (d < 4 && getComputedStyle(el).display !== "none" && [...el.children].some((k) => shown(k, d + 1)));
  const ownCard = (el) => el.closest("[data-bp-panel]");
  // Visible content height of an element: union of its children's content, not its stretched box.
  const contentBottom = (el, depth = 0) => {
    const r = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    if (depth > 7 || ["svg", "canvas", "img", "table", "input", "select", "textarea", "button", "p", "span", "dl", "ul", "ol", "h2", "h3", "h4", "label", "a"].includes(tag)) return r.bottom;
    const kids = [...el.children].filter((k) => shown(k));
    if (kids.length === 0) return r.bottom;
    const cs = getComputedStyle(el);
    const clip = /(auto|scroll|hidden)/.test(cs.overflowY) ? r.bottom : Infinity;
    const pad = parseFloat(cs.paddingBottom) || 0;
    return Math.min(clip, Math.max(...kids.map((k) => contentBottom(k, depth + 1))) + pad);
  };
  const contentH = (el) => contentBottom(el) - el.getBoundingClientRect().top;
  const overlapV = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  const results = [];
  const innerWidth = (el) => {
    const cs = getComputedStyle(el);
    return el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
  };
  // Width actually used by a part's content (union of its visible children, recursively one level for wrappers).
  const usedWidth = (el) => {
    let kids = [...el.children].filter(visible);
    while (kids.length === 1 && kids[0].children.length && !["svg", "canvas"].includes(kids[0].tagName.toLowerCase()) && Math.abs(kids[0].getBoundingClientRect().width - el.getBoundingClientRect().width) < 2) kids = [...kids[0].children].filter(visible);
    if (kids.length === 0) return el.getBoundingClientRect().width;
    const rs = kids.map((k) => k.getBoundingClientRect());
    return Math.max(...rs.map((r) => r.right)) - Math.min(...rs.map((r) => r.left));
  };
  for (const card of document.querySelectorAll("[data-bp-panel]")) {
    if (!visible(card)) continue;
    const body = card.lastElementChild;
    if (!body || !visible(body)) continue;
    const title0 = card.querySelector("h2,h3")?.textContent.trim().slice(0, 70) ?? "?";
    // Shared split components mark their parts: measure those precisely.
    const splits = [...body.querySelectorAll("[data-split]")].filter((sp) => ownCard(sp) === card && visible(sp));
    if (splits.length) {
      for (const sp of splits) {
        const draw = sp.querySelector(":scope [data-part=drawing]");
        const table = sp.querySelector(":scope [data-part=table]");
        if (!draw || !table) continue;
        const rd = draw.getBoundingClientRect();
        const rt = table.getBoundingClientRect();
        const side = overlapV(rd, rt) > 0.3 * Math.min(rd.height, rt.height) && (rt.right <= rd.left + 2 || rt.left >= rd.right - 2);
        if (side) {
          const hs = [contentH(draw), contentH(table)];
          const ratio = Math.max(...hs) / Math.max(1, Math.min(...hs));
          results.push({ title: title0, kind: sp.dataset.split, layout: "side", ratio: +ratio.toFixed(2), taller: hs[0] > hs[1] ? "drawing" : "table", drawW: Math.round(rd.width), gap: ratio > 1.3 });
        } else {
          const fill = usedWidth(draw) / Math.max(1, innerWidth(body));
          results.push({ title: title0, kind: sp.dataset.split, layout: "stacked", fill: +fill.toFixed(2), gap: fill < 0.75 });
        }
      }
      continue;
    }
    const drawings = [...body.querySelectorAll("svg, canvas")].filter((d) => {
      if (ownCard(d) !== card || !visible(d)) return false;
      if (d.tagName.toLowerCase() === "svg" && d.parentElement.closest("svg")) return false;
      if (d.closest("button, a, [data-sidebar-grow]")) return false;
      const r = d.getBoundingClientRect();
      return r.width >= 100 && r.height >= 60;
    });
    if (drawings.length === 0) continue;
    const main = drawings.reduce((a, d) => {
      const ra = a.getBoundingClientRect();
      const rd = d.getBoundingClientRect();
      return rd.width * rd.height > ra.width * ra.height ? d : a;
    });
    const title = card.querySelector("h2,h3")?.textContent.trim().slice(0, 70) ?? "?";
    // Walk up from the drawing to find a level where siblings sit beside it.
    let node = main;
    let row = null;
    while (node && node !== body) {
      const parent = node.parentElement;
      if (!parent) break;
      const rn = node.getBoundingClientRect();
      const side = [...parent.children].filter((s) => {
        if (s === node || !visible(s)) return false;
        const rs = s.getBoundingClientRect();
        return overlapV(rn, rs) > 0.3 * Math.min(rn.height, rs.height) && (rs.right <= rn.left + 2 || rs.left >= rn.right - 2) && rs.width > 60;
      });
      // Only card-level columns count (both parts ≥ 20% of the card), not small inner rows like icon + label.
      const big = (r) => r.width >= 0.2 * body.clientWidth;
      if (side.length && big(rn) && side.some((x) => big(x.getBoundingClientRect())) && rn.width < body.clientWidth * 0.97) {
        row = { part: node, side, cls: (parent.getAttribute("class") ?? "").slice(0, 80) };
        break;
      }
      node = parent;
    }
    if (row) {
      const hs = [contentH(row.part), ...row.side.map(contentH)];
      const ratio = Math.max(...hs) / Math.max(1, Math.min(...hs));
      results.push({ title, kind: "custom", layout: "side", ratio: +ratio.toFixed(2), taller: hs[0] > Math.min(...hs.slice(1)) ? "drawing" : "table", rowClass: row.cls, gap: ratio > 1.3 });
    } else {
      const cs = getComputedStyle(body);
      const inner = body.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      const rm = main.getBoundingClientRect();
      const band = drawings.map((d) => d.getBoundingClientRect()).filter((r) => overlapV(r, rm) > 0.3 * Math.min(r.height, rm.height));
      const used = Math.max(...band.map((r) => r.right)) - Math.min(...band.map((r) => r.left));
      const fill = used / Math.max(1, inner);
      results.push({ title, kind: "custom", layout: "stacked", fill: +fill.toFixed(2), drawClass: (main.parentElement.getAttribute("class") ?? "").slice(0, 80), gap: fill < 0.75 });
    }
  }
  return results;
}

const browser = await chromium.launch();
for (const slug of slugs) {
  for (const locale of locales) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    // Live-data cards are measured after their own /api/ requests finish, not while loading.
    let pending = 0;
    const isApi = (r) => new URL(r.url()).pathname.startsWith("/api/");
    page.on("request", (r) => isApi(r) && pending++);
    page.on("requestfinished", (r) => isApi(r) && pending--);
    page.on("requestfailed", (r) => isApi(r) && pending--);
    try {
      await page.goto(`${base}/${locale}/tools/${slug}`, { waitUntil: "load", timeout: 60000 });
      for (let i = 0; i < 40; i++) {
        const done = await page.evaluate(() => {
          window.scrollBy(0, 800);
          return window.scrollY + window.innerHeight >= document.body.scrollHeight - 5;
        });
        await page.waitForTimeout(100);
        if (done) break;
      }
      await page.waitForTimeout(1500);
      for (let i = 0; i < 100 && pending > 0; i++) await page.waitForTimeout(100);
      await page.waitForTimeout(300);
      // Lazy maps: wait until each maplibre map has drawn its canvas.
      await page.waitForFunction(() => [...document.querySelectorAll(".maplibregl-map")].every((m) => m.querySelector("canvas")), null, { timeout: 8000 }).catch(() => {});
      for (const r of await page.evaluate(measure)) if (!onlyGaps || r.gap) console.log(JSON.stringify({ slug, locale, ...r }));
    } catch (e) {
      console.log(JSON.stringify({ slug, locale, error: String(e).slice(0, 100) }));
    }
    await page.close();
  }
}
await browser.close();
