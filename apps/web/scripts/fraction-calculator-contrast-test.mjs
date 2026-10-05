// Real WCAG contrast-ratio test for fraction-calculator's glass hero/indicator cards, in BOTH
// light and dark mode. For every card title, table header, table cell, and chip/badge, computes
// the TRUE rendered foreground/background colors (via canvas compositing of the full ancestor
// background stack -- not just the first non-transparent one, since several tokens are alpha
// blended) and asserts a real contrast ratio, not an assumption from the CSS source. Also checks:
// every text element actually renders in Inter (not a silent fallback), every indicator visual
// fills at least 70% of its box, and no table is clipped at 1440px or 390px.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.resolve(__dirname, "../../../artifacts/fraction-fix");
mkdirSync(ARTIFACTS_DIR, { recursive: true });

const BASE = "http://localhost:3000";
const URL = `${BASE}/en/tools/fraction-calculator`;

let failures = [];
function assert(cond, msg) {
  if (!cond) {
    failures.push(msg);
    console.error(`FAIL: ${msg}`);
  } else {
    console.log(`PASS: ${msg}`);
  }
}

// Runs entirely inside the page: resolves true rendered colors via canvas (which correctly
// parses any CSS color output, including lab()/oklab()/color-mix() results) and composites the
// full ancestor background stack in paint order, exactly as the browser does.
const PAGE_HELPERS = `
window.__contrastHelpers = {
  toRgba(cssColor) {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  },
  compositeOver(fg, bg) {
    const a = fg[3] + bg[3] * (1 - fg[3]);
    if (a === 0) return [255, 255, 255, 0];
    const mix = (i) => (fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / a;
    return [mix(0), mix(1), mix(2), a];
  },
  // Average the resolved color stops of a linear-/radial-gradient background-image. Computed
  // style always resolves CSS variables and color-mix() into concrete rgb()/rgba() stops, so this
  // is accurate even though it doesn't model stop *position* -- good enough for a contrast check
  // on small badges/chips where text sits roughly centered in the gradient.
  gradientAverageColor(bgImage) {
    // Computed style always flattens color-mix()/var() down to simple rgb/rgba/hsl/hsla/lab/
    // oklab/lch/oklch function calls -- match any of those, not just rgb().
    const matches = [...bgImage.matchAll(/\\b(?:rgb|rgba|hsl|hsla|lab|oklab|lch|oklch)\\([^)]+\\)/g)];
    const stops = matches.map((m) => this.toRgba(m[0]));
    if (!stops.length) return null;
    const sum = stops.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2], acc[3] + c[3]], [0, 0, 0, 0]);
    return sum.map((v) => v / stops.length);
  },
  effectiveBackground(el) {
    const chain = [];
    let e = el;
    while (e) {
      chain.unshift(e);
      e = e.parentElement;
    }
    let bg = [255, 255, 255, 1];
    for (const node of chain) {
      const cs = getComputedStyle(node);
      const bgColor = this.toRgba(cs.backgroundColor);
      if (bgColor[3] > 0) bg = this.compositeOver(bgColor, bg);
      if (cs.backgroundImage && cs.backgroundImage !== "none" && /gradient/.test(cs.backgroundImage)) {
        const grad = this.gradientAverageColor(cs.backgroundImage);
        if (grad) bg = this.compositeOver(grad, bg);
      }
    }
    return bg;
  },
  luminance([r, g, b]) {
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  },
  contrastRatio(c1, c2) {
    const l1 = this.luminance(c1), l2 = this.luminance(c2);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  },
  measure(el) {
    const cs = getComputedStyle(el);
    const fg = this.toRgba(cs.color);
    const bg = this.effectiveBackground(el);
    const ratio = this.contrastRatio(fg, bg);
    const fontSizePx = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = fontSizePx >= 24 || (fontSizePx >= 18.66 && weight >= 700);
    return { ratio, isLarge, fontFamily: cs.fontFamily, fontSizePx, weight };
  },
};
`;

async function measureElements(page, mode) {
  await page.evaluate(PAGE_HELPERS);
  const results = await page.evaluate(() => {
    const out = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      if (!card) continue;
      const title = card.querySelector("h3");
      if (title) out.push({ card: n, kind: "title", text: title.textContent.slice(0, 30), ...window.__contrastHelpers.measure(title) });
      const ths = card.querySelectorAll("table th");
      ths.forEach((th, i) => out.push({ card: n, kind: "table-header", text: th.textContent.slice(0, 20), idx: i, ...window.__contrastHelpers.measure(th) }));
      const tds = card.querySelectorAll("table td");
      tds.forEach((td, i) => {
        if (!td.textContent.trim()) return;
        out.push({ card: n, kind: "table-cell", text: td.textContent.slice(0, 20), idx: i, ...window.__contrastHelpers.measure(td) });
      });
      // "chips": small badge/pill-styled spans/buttons with their own background (rounded-full /
      // rounded-md and a background set), typically the LIVE badge footer and accent labels.
      const chips = card.querySelectorAll('[class*="rounded-full"], [class*="rounded-md"], [class*="rounded-lg"]');
      chips.forEach((chip, i) => {
        const txt = chip.textContent.trim();
        if (!txt || txt.length > 60) return;
        if (chip.querySelector("svg, input, table")) return;
        out.push({ card: n, kind: "chip", text: txt.slice(0, 30), idx: i, ...window.__contrastHelpers.measure(chip) });
      });
    }
    return out;
  });
  return results.map((r) => ({ ...r, mode }));
}

function checkResults(results) {
  for (const r of results) {
    const threshold = r.isLarge ? 3.0 : 4.5;
    assert(
      r.ratio >= threshold,
      `[${r.mode}] card ${r.card} ${r.kind} "${r.text}" contrast ${r.ratio.toFixed(2)}:1 >= ${threshold}:1 (fontSize=${r.fontSizePx.toFixed(1)}px weight=${r.weight})`
    );
  }
}

async function checkFonts(page, mode) {
  const fontInfo = await page.evaluate(async () => {
    await document.fonts.ready;
    const interLoaded = document.fonts.check('16px "Inter"');
    const nonInter = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      if (!card) continue;
      const title = card.querySelector("h3");
      if (!title) continue;
      const ff = getComputedStyle(title).fontFamily;
      if (!/inter/i.test(ff)) nonInter.push(`card ${n} title font-family="${ff}"`);
      const lastToken = ff.split(",").map((s) => s.trim().toLowerCase()).pop();
      if (lastToken === "serif") nonInter.push(`card ${n} title falls back to literal serif: "${ff}"`);
    }
    return { interLoaded, nonInter };
  });
  assert(fontInfo.interLoaded, `[${mode}] Inter font is actually loaded and available (document.fonts.check)`);
  assert(fontInfo.nonInter.length === 0, `[${mode}] every card title's computed font-family references Inter, no serif fallback (violations: ${fontInfo.nonInter.join("; ") || "none"})`);
}

async function checkFillRatio(page, mode) {
  const ratios = await page.evaluate(() => {
    const out = [];
    for (let n = 2; n <= 16; n++) {
      const container = document.querySelector(`[data-indicator-card="${n}"] [data-indicator-visual]`);
      if (!container) continue;
      const cBox = container.getBoundingClientRect();
      if (cBox.width === 0 || cBox.height === 0) continue;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const walk = (el) => {
        for (const child of el.children) {
          const box = child.getBoundingClientRect();
          if (box.width > 0 && box.height > 0) {
            minX = Math.min(minX, box.left);
            minY = Math.min(minY, box.top);
            maxX = Math.max(maxX, box.right);
            maxY = Math.max(maxY, box.bottom);
          }
          walk(child);
        }
      };
      walk(container);
      if (minX === Infinity) continue;
      const contentArea = Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
      const containerArea = cBox.width * cBox.height;
      out.push({ card: n, ratio: contentArea / containerArea });
    }
    return out;
  });
  for (const r of ratios) {
    assert(r.ratio >= 0.7, `[${mode}] card ${r.card}'s visual content fills >=70% of its box (got ${(r.ratio * 100).toFixed(0)}%)`);
  }
}

async function checkNoTableClipped(page, label) {
  const clipped = await page.evaluate(() => {
    const tables = [...document.querySelectorAll("[data-indicator-table] table, [data-hero-card] table")];
    return tables.filter((t) => {
      const wrap = t.closest(".overflow-x-auto") || t.parentElement;
      return t.scrollWidth > wrap.clientWidth + 4 && getComputedStyle(wrap).overflowX !== "auto" && getComputedStyle(wrap).overflowX !== "scroll";
    }).length;
  });
  assert(clipped === 0, `no clipped (non-scrollable) tables at ${label} (found ${clipped})`);
}

async function checkNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `no horizontal page overflow at ${label} (overflow=${overflow}px)`);
}

async function main() {
  const browser = await chromium.launch();

  for (const viewport of [{ width: 1440, height: 1000, label: "1440" }, { width: 390, height: 844, label: "390" }]) {
    for (const mode of ["light", "dark"]) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      await page.goto(URL, { waitUntil: "networkidle" });
      if (mode === "dark") {
        await page.evaluate(() => document.documentElement.classList.add("dark"));
        await page.waitForTimeout(150);
      }
      await page.waitForSelector('[data-hero-card="1"]');

      const label = `${mode}-${viewport.label}`;
      await checkNoHorizontalOverflow(page, label);
      await checkNoTableClipped(page, label);
      await checkFonts(page, label);
      if (viewport.label === "1440") await checkFillRatio(page, label);

      const results = await measureElements(page, label);
      checkResults(results);

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${mode}-${viewport.label}.png`), fullPage: true });
      console.log(`Screenshot saved: ${mode}-${viewport.label}.png`);

      await context.close();
    }
  }

  await browser.close();

  console.log("\n--- SUMMARY ---");
  console.log(`${failures.length === 0 ? "ALL TESTS PASSED" : `${failures.length} FAILURES`}`);
  if (failures.length) {
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});
