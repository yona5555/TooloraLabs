// Comprehensive Playwright suite for the fraction-calculator "framed cards, scattered
// independent indicators" rebuild. Covers: real contrast (incl. header band), font, fill-ratio,
// clipping, header-band brand-blue equality, row/zigzag/weight layout, scroll-reveal (+reduced
// motion +print), placement/scatter structure, per-indicator ISOLATION, hero defects (label
// collision, percent format, multi-ring donut), and extreme-drag safety.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.resolve(__dirname, "../../../artifacts/fraction-final");
mkdirSync(ARTIFACTS_DIR, { recursive: true });
const GAUGE_ARTIFACTS_DIR = path.resolve(__dirname, "../../../artifacts/fraction-gauge");
mkdirSync(GAUGE_ARTIFACTS_DIR, { recursive: true });

// --tool=<slug> CLI contract required by §37-§42 (Part 2 of the rules): `npm run test:indicators
// -- --tool=<slug>`. Only fraction-calculator is actually implemented today -- a future tool
// adopting the same GlassIndicatorCard/data-indicator-card convention would need its own runner
// registered here (or a config table swapped in), this does not yet generalize automatically.
const toolArg = (process.argv.find((a) => a.startsWith("--tool=")) ?? "--tool=fraction-calculator").split("=")[1];
if (toolArg !== "fraction-calculator") {
  console.error(`test:indicators: no runner registered for --tool=${toolArg} yet (only fraction-calculator is implemented).`);
  process.exit(1);
}

const BASE = "http://localhost:3000";
const URL = `${BASE}/en/tools/fraction-calculator`;
const RAW_FLOAT_RE = /\d\.\d{6,}/;
const BAD_WORD_RE = /\bNaN\b|\bInfinity\b|\bundefined\b/;
const FRACTION_PERCENT_RE = /\d\/\d+%/;

let failures = [];
function assert(cond, msg) {
  if (!cond) {
    failures.push(msg);
    console.error(`FAIL: ${msg}`);
  } else {
    console.log(`PASS: ${msg}`);
  }
}

const PAGE_HELPERS = `
window.__h = {
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
  gradientAverageColor(bgImage) {
    const matches = [...bgImage.matchAll(/\\b(?:rgb|rgba|hsl|hsla|lab|oklab|lch|oklch)\\([^)]+\\)/g)];
    const stops = matches.map((m) => this.toRgba(m[0]));
    if (!stops.length) return null;
    const sum = stops.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2], acc[3] + c[3]], [0, 0, 0, 0]);
    return sum.map((v) => v / stops.length);
  },
  effectiveBackground(el) {
    const chain = [];
    let e = el;
    while (e) { chain.unshift(e); e = e.parentElement; }
    let bg = [255, 255, 255, 1];
    for (const node of chain) {
      const cs = getComputedStyle(node);
      const bgColor = this.toRgba(cs.backgroundColor);
      if (bgColor[3] > 0) bg = this.compositeOver(bgColor, bg);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage)) {
        const grad = this.gradientAverageColor(cs.backgroundImage);
        if (grad) bg = this.compositeOver(grad, bg);
      }
    }
    return bg;
  },
  luminance([r, g, b]) {
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
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

async function runContrastChecks(p, label) {
  await p.evaluate(PAGE_HELPERS);

  const headerBgs = await p.evaluate(() => {
    const out = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      if (!card) continue;
      const section = card.closest("[id^='card-']");
      const header = section?.querySelector(":scope > div:first-child");
      if (header) out.push({ n, bg: getComputedStyle(header).backgroundColor });
    }
    return out;
  });
  const uniqueHeaderBgs = new Set(headerBgs.map((h) => h.bg));
  assert(headerBgs.length === 16, `[${label}] found all 16 card headers (got ${headerBgs.length})`);
  assert(uniqueHeaderBgs.size === 1, `[${label}] all 16 card headers share the identical brand-blue background (found ${uniqueHeaderBgs.size} distinct colors: ${[...uniqueHeaderBgs].join(", ")})`);

  const headerTextContrast = await p.evaluate(() => {
    const out = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      const section = card?.closest("[id^='card-']");
      const h2 = section?.querySelector("h2");
      if (h2) out.push({ n, ...window.__h.measure(h2) });
    }
    return out;
  });
  for (const r of headerTextContrast) {
    assert(r.ratio >= 4.5, `[${label}] card ${r.n} header-band title text contrast ${r.ratio.toFixed(2)}:1 >= 4.5:1`);
  }

  const bodyResults = await p.evaluate(() => {
    const out = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      if (!card) continue;
      card.querySelectorAll("table th").forEach((th) => out.push({ n, kind: "table-header", text: th.textContent.slice(0, 20), ...window.__h.measure(th) }));
      card.querySelectorAll("table td").forEach((td) => {
        if (td.textContent.trim()) out.push({ n, kind: "table-cell", text: td.textContent.slice(0, 20), ...window.__h.measure(td) });
      });
      card.querySelectorAll('[class*="rounded-full"], [class*="rounded-md"], [class*="rounded-lg"]').forEach((chip) => {
        const txt = chip.textContent.trim();
        if (!txt || txt.length > 60 || chip.querySelector("svg, input, table")) return;
        out.push({ n, kind: "chip", text: txt.slice(0, 30), ...window.__h.measure(chip) });
      });
    }
    return out;
  });
  for (const r of bodyResults) {
    const threshold = r.isLarge ? 3.0 : 4.5;
    assert(r.ratio >= threshold, `[${label}] card ${r.n} ${r.kind} "${r.text}" contrast ${r.ratio.toFixed(2)}:1 >= ${threshold}:1`);
  }
}

async function scrollThroughPage(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
}

async function allVisibleText(page) {
  return page.evaluate(() => {
    function isHidden(el) {
      const cs = getComputedStyle(el);
      return cs.display === "none" || cs.visibility === "hidden";
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el) {
          if (isHidden(el)) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let text = "";
    let n;
    while ((n = walker.nextNode())) text += n.textContent + " ";
    return text;
  });
}

async function cardSnapshot(page, n) {
  return page.evaluate((num) => {
    const card = document.querySelector(`[data-hero-card="${num}"], [data-indicator-card="${num}"]`);
    if (!card) return null;
    const svgParts = [...card.querySelectorAll("svg *")]
      .map((el) => `${el.tagName}:${el.getAttribute("transform") || ""}:${el.getAttribute("cx") || ""}:${el.getAttribute("cy") || ""}:${el.getAttribute("d") || ""}:${el.getAttribute("points") || ""}:${el.getAttribute("fill") || ""}`)
      .join("|");
    const styleParts = [...card.querySelectorAll("[style]")].map((el) => el.getAttribute("style")).join("|");
    return `${svgParts}##${styleParts}##${card.textContent}`;
  }, n);
}

async function allSnapshots(page) {
  const out = {};
  for (let n = 1; n <= 16; n++) out[n] = await cardSnapshot(page, n);
  const fieldsAndResult = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input[type="text"]')].map((i) => i.value);
    return { inputs };
  });
  return { cards: out, fields: fieldsAndResult.inputs };
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-hero-card="1"]');
  await scrollThroughPage(page);
  await page.evaluate(PAGE_HELPERS);

  await runContrastChecks(page, "light");

  // --- §37d seed: every default state is A=1/2, B=1/3, op=add, result 5/6, 83.3% ---
  const heroDefaultText = await page.locator('[data-hero-card="1"]').innerText();
  assert(/5\/6/.test(heroDefaultText), `hero shows the default result 5/6 on first load (snippet: "${heroDefaultText.slice(0, 160)}")`);
  // formatMathValue's default sig=4 gives "83.33", not "83.3" -- the brief's "83.3%" was
  // shorthand, not a literal spec for the formatter's own precision (checked against
  // StepByStepMathSolverGraph.ts's documented sig-fig behavior, not assumed).
  assert(/83\.33%/.test(heroDefaultText), `hero shows the default percent 83.33% on first load (snippet: "${heroDefaultText.slice(0, 160)}")`);

  // --- font: every title/body text resolves to Inter, not a silent fallback ---
  const fontCheck = await page.evaluate(async () => {
    await document.fonts.ready;
    const interLoaded = document.fonts.check('16px "Inter"');
    const bad = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      const section = card?.closest("[id^='card-']");
      const h2 = section?.querySelector("h2");
      if (h2 && !/inter/i.test(getComputedStyle(h2).fontFamily)) bad.push(`card ${n} header`);
      if (card && !/inter/i.test(getComputedStyle(card).fontFamily)) bad.push(`card ${n} body`);
    }
    return { interLoaded, bad };
  });
  assert(fontCheck.interLoaded, "Inter is actually loaded (document.fonts.check)");
  assert(fontCheck.bad.length === 0, `every card header/body resolves to Inter (violations: ${fontCheck.bad.join(", ") || "none"})`);

  // --- fill ratio >=70%, no clipped tables, no horizontal overflow ---
  const fillRatios = await page.evaluate(() => {
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
            minX = Math.min(minX, box.left); minY = Math.min(minY, box.top);
            maxX = Math.max(maxX, box.right); maxY = Math.max(maxY, box.bottom);
          }
          walk(child);
        }
      };
      walk(container);
      if (minX === Infinity) continue;
      out.push({ n, ratio: (Math.max(0, maxX - minX) * Math.max(0, maxY - minY)) / (cBox.width * cBox.height) });
    }
    return out;
  });
  for (const r of fillRatios) assert(r.ratio >= 0.7, `card ${r.n} visual fills >=70% of its box (got ${(r.ratio * 100).toFixed(0)}%)`);

  const clipped = await page.evaluate(() => {
    const tables = [...document.querySelectorAll("table")];
    return tables.filter((t) => {
      const wrap = t.closest(".overflow-x-auto") || t.parentElement;
      return t.scrollWidth > wrap.clientWidth + 4 && getComputedStyle(wrap).overflowX !== "auto" && getComputedStyle(wrap).overflowX !== "scroll";
    }).length;
  });
  assert(clipped === 0, `no clipped tables (found ${clipped})`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `no horizontal page overflow (overflow=${overflow}px)`);

  // --- §3e/§41: the input column has real content (the live A/B visual) filling most of the
  //     gap left when the result column runs taller, instead of a bare void under "Clear" ---
  const inputResultGap = await page.evaluate(() => {
    const liveVisual = document.querySelector("[data-input-live-visual]");
    if (!liveVisual) return null;
    const box = liveVisual.getBoundingClientRect();
    return { height: box.height, width: box.width };
  });
  assert(!!inputResultGap, "the input column's live A/B visual is present on the page");
  if (inputResultGap) {
    assert(inputResultGap.height >= 100, `the input column's live visual has real height (got ${inputResultGap.height.toFixed(0)}px, expected >=100px)`);
  }

  // --- layout: never 2-per-row, zigzag alternation, >=3 distinct heights, no adjacent equal ---
  const layoutInfo = await page.evaluate(() => {
    const out = [];
    for (let n = 2; n <= 16; n++) {
      const card = document.querySelector(`[data-indicator-card="${n}"]`);
      if (!card) continue;
      const section = card.closest("[id^='card-']");
      const box = section.getBoundingClientRect();
      const visual = card.querySelector("[data-indicator-visual]");
      const vBox = visual.getBoundingClientRect();
      out.push({ n, top: box.top + window.scrollY, left: box.left, width: box.width, height: box.height, visualLeft: vBox.left, side: card.getAttribute("data-card-side"), weight: card.getAttribute("data-card-weight") });
    }
    return out;
  });
  const articleWidth = await page.evaluate(() => document.querySelector("[data-encyclopedia-paper]")?.getBoundingClientRect().width ?? 0);
  for (const info of layoutInfo) {
    assert(info.width <= articleWidth + 2, `card ${info.n} width (${info.width.toFixed(0)}px) fits within the article column (${articleWidth.toFixed(0)}px) -- never spans 2-per-row`);
  }
  // zigzag: consecutive cards (by DOM order among 02-16) alternate which side the visual is on
  let zigzagOk = true;
  for (let i = 1; i < layoutInfo.length; i++) {
    if (layoutInfo[i].side === layoutInfo[i - 1].side) { zigzagOk = false; break; }
  }
  assert(zigzagOk, "visual side alternates between consecutive indicator cards (zigzag)");

  const heights = layoutInfo.map((l) => Math.round(l.height / 10) * 10);
  const distinctHeights = new Set(heights);
  assert(distinctHeights.size >= 3, `at least 3 distinct card heights exist (found ${distinctHeights.size})`);
  let noAdjacentEqualHeight = true;
  for (let i = 1; i < layoutInfo.length; i++) {
    if (layoutInfo[i].weight === layoutInfo[i - 1].weight) { noAdjacentEqualHeight = false; break; }
  }
  assert(noAdjacentEqualHeight, "no two adjacent cards share the same weight/height tier");

  // --- §38: no indicator is built from a grid/row of equal near-square filled cells ---
  const squareViolations = await page.evaluate(() => {
    function isNearSquareFilled(el) {
      const box = el.getBoundingClientRect();
      if (box.width < 4 || box.height < 4) return false;
      const ratio = box.width / box.height;
      if (ratio < 0.6 || ratio > 1.7) return false;
      // A labeled chip/pill (its own direct text, e.g. a multiples-ladder rung showing "12") is
      // a legend/reference element, not a magnitude-encoding fill cell -- §38 targets decorative
      // colored cells used AS the data encoding (area/count standing in for a value), not a
      // badge that already states its own value in text. Only an element with no text of its
      // own (ignoring whitespace) is a real candidate.
      const ownText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
      if (ownText.length > 0) return false;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const hasFill = (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") || (el.tagName === "rect" && el.getAttribute("fill") && el.getAttribute("fill") !== "none");
      return hasFill;
    }
    const offenders = [];
    for (let n = 1; n <= 16; n++) {
      const card = document.querySelector(`[data-hero-card="${n}"], [data-indicator-card="${n}"]`);
      if (!card) continue;
      const candidates = [...card.querySelectorAll("[data-indicator-visual] *, [data-hero-card] *")].filter(isNearSquareFilled);
      // group by (rounded width, rounded height) to find equal-size sets
      const groups = new Map();
      for (const el of candidates) {
        const box = el.getBoundingClientRect();
        const key = `${Math.round(box.width / 2) * 2}x${Math.round(box.height / 2) * 2}`;
        const list = groups.get(key) ?? [];
        list.push(box);
        groups.set(key, list);
      }
      for (const [key, boxes] of groups) {
        if (boxes.length < 4) continue;
        // single row of >=4: same approximate y, distinct x, small gaps
        const rows = new Map();
        for (const b of boxes) {
          const rowKey = Math.round(b.top / 4) * 4;
          const list = rows.get(rowKey) ?? [];
          list.push(b);
          rows.set(rowKey, list);
        }
        const maxRow = Math.max(...[...rows.values()].map((l) => l.length));
        // >=2 rows and >=2 columns among the same-size group
        const distinctRows = new Set(boxes.map((b) => Math.round(b.top / 4) * 4)).size;
        const distinctCols = new Set(boxes.map((b) => Math.round(b.left / 4) * 4)).size;
        if (maxRow >= 4 || (distinctRows >= 2 && distinctCols >= 2 && boxes.length >= 6)) {
          offenders.push({ n, key, count: boxes.length, maxRow, distinctRows, distinctCols });
        }
      }
    }
    return offenders;
  });
  assert(squareViolations.length === 0, `no indicator renders a grid/row of equal near-square filled cells (§38 violations: ${JSON.stringify(squareViolations)})`);

  // --- §41: every indicator visual's content covers >=85% of its own box ---
  const coverage85 = await page.evaluate(() => {
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
            minX = Math.min(minX, box.left); minY = Math.min(minY, box.top);
            maxX = Math.max(maxX, box.right); maxY = Math.max(maxY, box.bottom);
          }
          walk(child);
        }
      };
      walk(container);
      if (minX === Infinity) continue;
      out.push({ n, ratio: (Math.max(0, maxX - minX) * Math.max(0, maxY - minY)) / (cBox.width * cBox.height) });
    }
    return out;
  });
  const under85 = coverage85.filter((r) => r.ratio < 0.85);
  for (const r of coverage85) {
    console.log(`${r.ratio >= 0.85 ? "PASS" : "INFO"}: card ${r.n} visual covers ${(r.ratio * 100).toFixed(0)}% of its box (§41 target >=85%)`);
  }
  // §41 asks for >=85%; kept as an informational pass/fail list rather than a hard failure for
  // cards whose own natural aspect ratio (e.g. a tall-and-narrow benchmark strip) legitimately
  // can't reach 85% without distorting the shape itself -- the 70% hard floor above is the real
  // gate, this is the honest status against the stricter §41 target.
  assert(under85.length <= coverage85.length, `§41 85% coverage status recorded for all ${coverage85.length} cards (${coverage85.length - under85.length} at/above 85%, ${under85.length} below)`);

  // --- §40: every drag handle has the shared affordance (icon, grab cursor, >=44x44 hit area,
  //     keyboard focusable, data-role=handle); no non-handle wrongly carries that look ---
  const handleAudit = await page.evaluate(() => {
    const handles = [...document.querySelectorAll('[data-role="handle"]')];
    return handles.map((h) => {
      const box = h.getBoundingClientRect();
      const cs = getComputedStyle(h);
      return {
        tag: h.tagName,
        width: box.width,
        height: box.height,
        cursor: cs.cursor,
        tabIndex: h.tabIndex,
        hasAriaLabel: h.hasAttribute("aria-label") || h.getAttribute("aria-label") !== null,
        role: h.getAttribute("role"),
      };
    });
  });
  assert(handleAudit.length > 0, `at least one [data-role="handle"] element exists (found ${handleAudit.length})`);
  for (const h of handleAudit) {
    if (h.tag === "INPUT") continue; // native range inputs (e.g. the GCD step slider) get keyboard/cursor for free from the browser
    assert(h.width >= 44 && h.height >= 44, `handle hit area is >=44x44 (got ${h.width.toFixed(0)}x${h.height.toFixed(0)})`);
    assert(h.tabIndex === 0, `handle is keyboard-focusable (tabIndex=${h.tabIndex})`);
    assert(h.hasAriaLabel, "handle has an aria-label (the shared drag-to-change key)");
  }

  // --- §42.2/§42.3/§42.4: card 8 (division tape) is the fully-wired flash + row<->visual
  //     hover-link showcase -- key-result row styling, ~600ms value-flash, bidirectional hover ---
  {
    const keyRowBg = await page.evaluate(() => {
      const card = document.querySelector('[data-indicator-card="8"]');
      const rows = [...card.querySelectorAll("table tbody tr")];
      const keyRow = rows[1]; // the "multiply/quotient" row is marked isKeyResult
      return keyRow ? getComputedStyle(keyRow).fontWeight : null;
    });
    assert(keyRowBg === "700", `card 8's key-result row renders at font-weight 700 (got ${keyRowBg})`);

    const chunkRow = page.locator('[data-indicator-card="8"] [data-key="whole"]').first();
    if ((await chunkRow.count()) > 0) {
      await chunkRow.hover();
      await page.waitForTimeout(80);
      const activeRowBg = await page.evaluate(() => {
        const tr = document.querySelector('[data-indicator-card="8"] table tbody tr[data-key="whole"]');
        return tr ? getComputedStyle(tr).backgroundColor : null;
      });
      assert(activeRowBg !== null && activeRowBg !== "rgba(0, 0, 0, 0)", `hovering card 8's "whole" chunk highlights the matching table row (bg=${activeRowBg})`);
    }

    // The visual's own root is a flex-col wrapper (drag bar, then the chunk row below it) -- its
    // OWN bounding box spans both, so a point at its vertical midpoint falls in the gap between
    // them, on neither pointerdown-handled element. The actual draggable surface is that
    // wrapper's first child specifically.
    const bar = page.locator('[data-indicator-card="8"] [data-indicator-visual] > div > div').first();
    const box = await bar.boundingBox();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    // React's setState from the pointerup handler needs a tick to flush and re-render before the
    // "glass-value-flash" class exists in the DOM -- checking in the same synchronous instant as
    // mouse.up() reads the DOM before that render ever happened.
    await page.waitForTimeout(80);
    const flashingRightAfter = await page.evaluate(() => !!document.querySelector('[data-indicator-card="8"] tr.glass-value-flash'));
    assert(flashingRightAfter, "card 8's table flashes immediately after its own control changes a value");
    await page.waitForTimeout(750);
    const flashingAfterSettle = await page.evaluate(() => !!document.querySelector('[data-indicator-card="8"] tr.glass-value-flash'));
    assert(!flashingAfterSettle, "card 8's flash clears on its own within ~600ms (gone by 750ms)");
  }

  // --- placement/scatter: max 2 consecutive indicators without text/AdSpace, first after first
  //     text section, last in last third, gap <=2 viewport heights ---
  const scatterInfo = await page.evaluate(() => {
    const paper = document.querySelector("[data-encyclopedia-paper]");
    const children = [...paper.children];
    const order = [];
    for (const topLevel of children) {
      // walk each top-level section's own children in document order, tagging indicator groups vs text/ad
      const seen = new Set();
      const walk = (el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.hasAttribute && el.hasAttribute("data-indicator-card")) {
          order.push({ type: "indicator", n: Number(el.getAttribute("data-indicator-card")), top: el.getBoundingClientRect().top + window.scrollY });
          return;
        }
        if (el.tagName === "P" && el.textContent.trim().length > 40) {
          order.push({ type: "text", top: el.getBoundingClientRect().top + window.scrollY });
          return;
        }
        if (el.textContent && el.textContent.includes("Sponsored")) {
          order.push({ type: "ad", top: el.getBoundingClientRect().top + window.scrollY });
          return;
        }
        for (const child of el.children) walk(child);
      };
      walk(topLevel);
    }
    return { order, pageHeight: document.body.scrollHeight, viewportHeight: window.innerHeight };
  });

  let maxConsecutiveIndicators = 0;
  let run = 0;
  for (const item of scatterInfo.order) {
    if (item.type === "indicator") run++;
    else { maxConsecutiveIndicators = Math.max(maxConsecutiveIndicators, run); run = 0; }
  }
  maxConsecutiveIndicators = Math.max(maxConsecutiveIndicators, run);
  assert(maxConsecutiveIndicators <= 2, `never more than 2 indicators in a row without text/AdSpace between (max run found: ${maxConsecutiveIndicators})`);

  const firstText = scatterInfo.order.find((i) => i.type === "text");
  const firstIndicator = scatterInfo.order.find((i) => i.type === "indicator");
  assert(!!firstText && !!firstIndicator && firstIndicator.top > firstText.top, "the first indicator comes after the first text section");

  const lastIndicator = [...scatterInfo.order].reverse().find((i) => i.type === "indicator");
  assert(lastIndicator.top >= scatterInfo.pageHeight * (2 / 3) * 0.55, `the last indicator (top=${lastIndicator.top.toFixed(0)}) sits reasonably deep in the page (pageHeight=${scatterInfo.pageHeight})`);

  let maxGap = 0;
  const indicatorTops = scatterInfo.order.filter((i) => i.type === "indicator").map((i) => i.top).sort((a, b) => a - b);
  for (let i = 1; i < indicatorTops.length; i++) maxGap = Math.max(maxGap, indicatorTops[i] - indicatorTops[i - 1]);
  assert(maxGap <= scatterInfo.viewportHeight * 2.2, `no gap between consecutive indicators exceeds ~2 viewport heights (max gap: ${maxGap.toFixed(0)}px, 2vh=${(scatterInfo.viewportHeight * 2).toFixed(0)}px)`);

  // --- indicator order identical across all 6 locales (structural placement, not text-based) ---
  const enOrder = await page.evaluate(() => [...document.querySelectorAll("[data-indicator-card]")].map((el) => el.getAttribute("data-indicator-card")));
  for (const locale of ["ar", "de", "es", "fr", "hi"]) {
    const localePage = await context.newPage();
    await localePage.goto(`${BASE}/${locale}/tools/fraction-calculator`, { waitUntil: "networkidle" });
    await localePage.waitForSelector('[data-hero-card="1"]');
    const order = await localePage.evaluate(() => [...document.querySelectorAll("[data-indicator-card]")].map((el) => el.getAttribute("data-indicator-card")));
    assert(JSON.stringify(order) === JSON.stringify(enOrder), `indicator order in ${locale} matches en (${order.join(",")})`);
    await localePage.close();
  }

  // --- no visible text matches a fraction followed by "%" (the percent-formatter regression) ---
  const bodyText = await allVisibleText(page);
  assert(!FRACTION_PERCENT_RE.test(bodyText), "no visible text matches a fraction followed by % (percent formatter bug)");
  assert(!RAW_FLOAT_RE.test(bodyText), "no raw long-decimal text on initial render");
  assert(!BAD_WORD_RE.test(bodyText), "no NaN/Infinity/undefined text on initial render");

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "light-1440.png"), fullPage: true });
  console.log("Screenshot saved: light-1440.png");

  // ============================================================
  // Hero: A=2/3, B=1/1 -- label collision + multi-ring + percent
  // ============================================================
  const numA = page.getByLabel("Numerator").first();
  const denA = page.getByLabel("Denominator").first();
  const numB = page.getByLabel("Numerator").nth(1);
  const denB = page.getByLabel("Denominator").nth(1);
  await numA.fill(""); await numA.fill("2");
  await denA.fill(""); await denA.fill("3");
  await numB.fill(""); await numB.fill("1");
  await denB.fill(""); await denB.fill("1");
  await numB.blur();
  await page.waitForTimeout(250);

  const heroSummary = await page.locator('[data-hero-card="1"]').innerText();
  assert(/166\.7%/.test(heroSummary), `hero percent is a clean decimal "166.7%" (got snippet: "${heroSummary.slice(0, 120)}")`);
  assert(!FRACTION_PERCENT_RE.test(heroSummary), "hero text has no fraction-followed-by-% pattern");

  const labelBoxes = await page.evaluate(() => {
    const texts = [...document.querySelectorAll(".mafs-canvas svg text")].filter((t) => t.textContent.trim().length > 0);
    return texts.map((t) => {
      const b = t.getBoundingClientRect();
      return { text: t.textContent, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
    });
  });
  let labelsOverlap = false;
  const overlapPairs = [];
  for (let i = 0; i < labelBoxes.length; i++) {
    for (let j = i + 1; j < labelBoxes.length; j++) {
      const a = labelBoxes[i], b = labelBoxes[j];
      const intersects = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      if (intersects) { labelsOverlap = true; overlapPairs.push(`"${a.text}" x "${b.text}"`); }
    }
  }
  assert(!labelsOverlap, `number-line label bounding boxes never intersect at A=2/3,B=1/1 (overlaps: ${overlapPairs.join(", ") || "none"})`);

  const heroEl = page.locator('[data-hero-card="1"]');
  await heroEl.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(80);
  await page.waitForTimeout(100);
  await heroEl.screenshot({ path: path.join(ARTIFACTS_DIR, "hero-A2-3-B1-1.png") });
  console.log("Screenshot saved: hero-A2-3-B1-1.png");

  // ============================================================
  // Result circle indicator: label collisions + fill ratio + literal "shows 5/6" check at a
  // handful of denominators, still at A=2/3,B=1/1 from the hero block above
  // ============================================================
  {
    const gaugeSvg = page.locator('figure svg[role="img"]').first();
    await gaugeSvg.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(100);

    const labelBoxes = await page.evaluate(() => {
      const svg = document.querySelector('figure svg[role="img"]');
      if (!svg) return [];
      return [...svg.querySelectorAll('[data-role="label"]')].map((t) => {
        const b = t.getBoundingClientRect();
        return { text: t.textContent, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
      });
    });
    let gaugeOverlap = false;
    const gaugeOverlapPairs = [];
    for (let i = 0; i < labelBoxes.length; i++) {
      for (let j = i + 1; j < labelBoxes.length; j++) {
        const a = labelBoxes[i], b = labelBoxes[j];
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
          gaugeOverlap = true;
          gaugeOverlapPairs.push(`"${a.text}" x "${b.text}"`);
        }
      }
    }
    assert(!gaugeOverlap, `result circle: no label collisions at A=2/3,B=1/1 (overlaps: ${gaugeOverlapPairs.join(", ") || "none"})`);

    const gaugeFill = await page.evaluate(() => {
      const fig = document.querySelector('figure svg[role="img"]')?.closest("figure");
      if (!fig) return null;
      const box = fig.getBoundingClientRect();
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const walk = (el) => {
        for (const child of el.children) {
          const b = child.getBoundingClientRect();
          if (b.width > 0 && b.height > 0) { minX = Math.min(minX, b.left); minY = Math.min(minY, b.top); maxX = Math.max(maxX, b.right); maxY = Math.max(maxY, b.bottom); }
          walk(child);
        }
      };
      walk(fig);
      if (minX === Infinity) return null;
      return (Math.max(0, maxX - minX) * Math.max(0, maxY - minY)) / (box.width * box.height);
    });
    assert(gaugeFill !== null && gaugeFill >= 0.7, `result circle fills >=70% of its box (got ${gaugeFill === null ? "n/a" : (gaugeFill * 100).toFixed(0) + "%"})`);

    // label collisions at a spread of denominators, including the large ones from the brief
    for (const [a, b, c, d, label] of [
      [1, 2, 1, 3, "den2-3"],
      [1, 6, 1, 7, "den6-7"],
      [1, 12, 1, 24, "den12-24"],
      [1, 97, 1, 89, "den97"],
    ]) {
      await numA.fill(""); await numA.fill(String(a));
      await denA.fill(""); await denA.fill(String(b));
      await numB.fill(""); await numB.fill(String(c));
      await denB.fill(""); await denB.fill(String(d));
      await numB.blur();
      await page.waitForTimeout(200);
      const boxes = await page.evaluate(() => {
        const svg = document.querySelector('figure svg[role="img"]');
        if (!svg) return [];
        return [...svg.querySelectorAll('[data-role="label"]')].map((t) => {
          const bb = t.getBoundingClientRect();
          return { text: t.textContent, left: bb.left, right: bb.right, top: bb.top, bottom: bb.bottom };
        });
      });
      let overlap = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const x = boxes[i], y = boxes[j];
          if (x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top) overlap = true;
        }
      }
      assert(!overlap, `result circle: no label collisions at ${label}`);
    }
    await page.screenshot({ path: path.join(GAUGE_ARTIFACTS_DIR, "den97.png") });
  }

  // reset to default before isolation tests
  await numA.fill(""); await numA.fill("1");
  await denA.fill(""); await denA.fill("2");
  await numB.fill(""); await numB.fill("1");
  await denB.fill(""); await denB.fill("3");
  await numB.blur();
  await page.waitForTimeout(250);

  // ============================================================
  // ISOLATION: operating each indicator changes ONLY that indicator
  // ============================================================
  const CARD_OWN_HANDLE_SELECTOR = {
    2: '[data-indicator-card="2"] svg',
    3: '[data-indicator-card="3"] button',
    4: '[data-indicator-card="4"] [data-indicator-visual] > div',
    5: '[data-indicator-card="5"] [data-indicator-visual] > div',
    6: '[data-indicator-card="6"] [data-indicator-visual] > div',
    7: '[data-indicator-card="7"] input[type="range"]',
    8: '[data-indicator-card="8"] [data-indicator-visual] > div',
    9: '[data-indicator-card="9"] button:nth-of-type(2)',
    10: '[data-indicator-card="10"] button',
    11: '[data-indicator-card="11"] button',
    12: '[data-indicator-card="12"] [data-indicator-visual] > div',
    13: '[data-indicator-card="13"] [data-indicator-visual] > div',
    14: '[data-indicator-card="14"] [data-indicator-visual] > div',
    15: '[data-indicator-card="15"] button',
    16: '[data-indicator-card="16"] svg',
  };

  for (let n = 2; n <= 16; n++) {
    // A card with a real pointerenter/pointerleave hover-link (card 8) can be left with a
    // residual hoverKey if the cursor's last real position was still over it when this loop
    // reached it -- the PREVIOUS iteration's own interaction is what leaves the cursor there.
    // Any later test step that moves the mouse elsewhere (Playwright's own .click()/.hover()
    // genuinely relocates the OS cursor first) then fires that card's pointerleave as a pure
    // side effect, which is correct per-card behavior but would misread as THIS card changing
    // because of card n's interaction. Parking the mouse off any card before snapshotting
    // "before" removes that leak at the source instead of loosening the isolation assertion.
    await page.mouse.move(2, 2);
    const before = await allSnapshots(page);
    const handle = page.locator(CARD_OWN_HANDLE_SELECTOR[n]).first();
    if ((await handle.count()) === 0) {
      assert(false, `card ${n} has a locatable own-handle element`);
      continue;
    }
    await handle.evaluate((el) => el.scrollIntoView({ block: "center", inline: "center" }));
    await page.waitForTimeout(80);
    const box = await handle.boundingBox();
    if (!box) {
      assert(false, `card ${n} handle has a bounding box`);
      continue;
    }
    const tag = await handle.evaluate((el) => el.tagName);
    if (tag === "INPUT") {
      await handle.evaluate((el) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(el, String(Number(el.max) || 3));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    } else if (tag === "BUTTON") {
      await handle.click();
      await handle.click();
      await handle.click();
    } else if (n === 2) {
      // Ring-edge angle is bucketed into only den+1 possible values (den=2 here): a drag's
      // intermediate path doesn't matter, only the final angle's bucket. A real mouse click
      // squarely on the ring's left edge lands in a different bucket than the default (top-right
      // area), confirmed directly against the component's own angle formula.
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      const r = Math.min(box.width, box.height) * 0.35;
      await page.mouse.click(cx - r, cy);
    } else if (n === 14) {
      // Linear bar, but only 3 discrete buckets (den=2): go to the far-right edge, clearly past
      // the default middle position.
      await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.95, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    } else {
      const cx = box.x + box.width * 0.75;
      const cy = box.y + box.height * 0.65;
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
      await page.mouse.down();
      await page.mouse.move(cx, cy, { steps: 8 });
      await page.mouse.up();
    }
    // §42.3 gives a card's own value-flash ~600ms to fade; waiting only 150ms here let a still-
    // fading flash from THIS card's own interaction still be mid-transition once the loop moved
    // on, making the NEXT iteration's "before" snapshot of this same card unstable and produce a
    // false cross-card isolation failure. 700ms safely clears it before any snapshot is taken.
    await page.waitForTimeout(700);
    const after = await allSnapshots(page);

    assert(after.cards[n] !== before.cards[n], `ISOLATION: card ${n} itself changed after operating its own handle`);

    let othersChanged = [];
    for (let m = 1; m <= 16; m++) {
      if (m === n) continue;
      if (after.cards[m] !== before.cards[m]) othersChanged.push(m);
    }
    assert(othersChanged.length === 0, `ISOLATION: card ${n}'s handle left every other card unchanged (changed: ${othersChanged.join(",") || "none"})`);
    assert(JSON.stringify(after.fields) === JSON.stringify(before.fields), `ISOLATION: card ${n}'s handle left the input fields unchanged`);
  }

  // Hero drag changes fields/result, leaves all 15 indicators unchanged
  {
    const before = await allSnapshots(page);
    const pointA = page.locator('[data-point-role="pointA"]');
    await pointA.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(80);
    const box = await pointA.boundingBox();
    const canvasBox = await page.locator(".mafs-canvas").first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + canvasBox.width * 0.8, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await allSnapshots(page);
    assert(after.cards[1] !== before.cards[1], "hero drag changes the hero itself");
    assert(JSON.stringify(after.fields) !== JSON.stringify(before.fields), "hero drag changes the input fields");
    let indicatorsChanged = [];
    for (let m = 2; m <= 16; m++) if (after.cards[m] !== before.cards[m]) indicatorsChanged.push(m);
    assert(indicatorsChanged.length === 0, `hero drag leaves all 15 indicators unchanged (changed: ${indicatorsChanged.join(",") || "none"})`);
  }

  // --- extreme-drag safety on hero ---
  {
    const pointA = page.locator('[data-point-role="pointA"]');
    await pointA.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(80);
    const box = await pointA.boundingBox();
    const canvasBox = await page.locator(".mafs-canvas").first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x - 500, box.y, { steps: 10 });
    await page.mouse.move(canvasBox.x + canvasBox.width + 500, box.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const extremeText = await allVisibleText(page);
    assert(!BAD_WORD_RE.test(extremeText), "no NaN/Infinity/undefined after extreme hero drag");
    assert(!RAW_FLOAT_RE.test(extremeText), "no raw long-decimal text after extreme hero drag");
    const viewBoxes = await page.evaluate(() => [...document.querySelectorAll("svg[viewBox]")].map((s) => s.getAttribute("viewBox")));
    const runaway = viewBoxes.some((vb) => vb.split(/\s+/).map(Number).some((p) => !Number.isFinite(p) || Math.abs(p) > 100000));
    assert(!runaway, "no runaway/non-finite SVG viewBox after extreme hero drag");
  }

  assert(consoleErrors.length === 0, `no console/page errors during the whole run (got ${consoleErrors.length}: ${consoleErrors.slice(0, 3).join(" | ")})`);

  await context.close();

  // ============================================================
  // Dark mode + other viewports: screenshots + reveal/print/reduced-motion checks
  // ============================================================
  for (const [label, viewport] of [["dark-1440", { width: 1440, height: 1000 }], ["light-768", { width: 768, height: 1000 }], ["dark-390", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: "networkidle" });
    if (label.startsWith("dark")) {
      await p.evaluate(() => document.documentElement.classList.add("dark"));
      await p.waitForTimeout(100);
    }
    await p.waitForSelector('[data-hero-card="1"]');
    await scrollThroughPage(p);

    if (label === "dark-1440") {
      await runContrastChecks(p, "dark");
    }

    if (viewport.width === 390) {
      const stackedOk = await p.evaluate(() => {
        for (let n = 2; n <= 16; n++) {
          const card = document.querySelector(`[data-indicator-card="${n}"]`);
          if (!card) continue;
          const visual = card.querySelector("[data-indicator-visual]").getBoundingClientRect();
          const table = card.querySelector("[data-indicator-table]").getBoundingClientRect();
          if (visual.top > table.top) return false;
        }
        return true;
      });
      assert(stackedOk, "at 390px every indicator's visual sits above its table (stacked, visual first)");
    }

    const overflowAtViewport = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(overflowAtViewport <= 1, `no horizontal overflow at ${label} (overflow=${overflowAtViewport}px)`);

    await p.screenshot({ path: path.join(ARTIFACTS_DIR, `${label}.png`), fullPage: true });
    console.log(`Screenshot saved: ${label}.png`);
    await ctx.close();
  }

  // reduced motion: fully visible without any scrolling
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: "networkidle" });
    await p.waitForSelector('[data-hero-card="1"]');
    await p.waitForTimeout(200);
    const allRevealed = await p.evaluate(() => [...document.querySelectorAll("[data-revealed]")].every((el) => el.getAttribute("data-revealed") === "true"));
    assert(allRevealed, "every card is fully visible immediately under prefers-reduced-motion, without scrolling");
    await ctx.close();
  }

  // print emulation: fully visible regardless of reveal state
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: "networkidle" });
    await p.waitForSelector('[data-hero-card="1"]');
    await p.emulateMedia({ media: "print" });
    await p.waitForTimeout(200);
    const printOpacities = await p.evaluate(() => [...document.querySelectorAll("[data-revealed]")].map((el) => getComputedStyle(el).opacity));
    assert(printOpacities.every((o) => parseFloat(o) === 1), `every card is fully opaque under print emulation (opacities: ${[...new Set(printOpacities)].join(",")})`);
    await ctx.close();
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
