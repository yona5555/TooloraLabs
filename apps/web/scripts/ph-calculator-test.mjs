// Playwright suite for the pH calculator visual rebuild (1 hero + 8 indicator cards).
// Covers: article content identical to the recorded baseline, element counts and leftovers,
// hero two-way sync by real mouse drag, per-card isolation (drag, buttons, limits, keyboard),
// ≤2 live WebGL contexts while scrolling, the no-WebGL fallback, label overlap at key pH values,
// clipping / fill ratio / empty bands / horizontal scroll, no serif, contrast, literal colours.
// Usage: node scripts/ph-calculator-test.mjs [--shots]   (dev server on :3000)
import { chromium } from "playwright";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { mkdirSync, readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readContent, BASELINE_FILE } from "./ph-calculator-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const WEB = path.resolve(__dirname, "..");
const PH_DIR = path.join(WEB, "components/tools/ph-calculator");
const SHOTS = path.join(ROOT, "artifacts/ph-calculator");
mkdirSync(SHOTS, { recursive: true });
const BASE = requireBase(process.env.BASE);
const SHOTS_ON = process.argv.includes("--shots");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

const failures = [];
const ok = (cond, msg) => {
  if (cond) console.log(`PASS: ${msg}`);
  else {
    failures.push(msg);
    console.error(`FAIL: ${msg}`);
  }
};
const run = (name) => !ONLY || ONLY.split(",").includes(name);

// ── Static checks ────────────────────────────────────────────────────────────────────
if (run("static")) {
  const removed = ["PhScaleGauge", "PhScaleDiagram", "PhIndicatorColorDiagram", "PhConcentrationBarDiagram", "PhSeesawDiagram", "PhVariablesDiagram"];
  const files = readdirSync(PH_DIR);
  const src = files.map((f) => readFileSync(path.join(PH_DIR, f), "utf8")).join("\n");
  for (const r of removed) ok(!files.includes(`${r}.tsx`) && !src.includes(r), `old visual ${r} deleted and never imported`);
  ok(!/RatioGauge/.test(src), "shared RatioGauge no longer used on the pH page");
  const LIT = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/;
  for (const f of files) ok(!LIT.test(readFileSync(path.join(PH_DIR, f), "utf8")), `no literal colour in ${f}`);
  const removedKeys = [["education", "intro", "diagram"], ["education", "intro", "indicatorCaption"], ["education", "intro", "phScaleGauge"], ["result", "diagramCaption"], ["result", "barCaption"], ["result", "seesawCaption"], ["form", "variablesCaption"]];
  const leaf = (o, pre = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? leaf(v, `${pre}${k}.`) : [`${pre}${k}`]));
  const locales = ["en", "ar", "es", "fr", "de", "hi"];
  const msgs = Object.fromEntries(locales.map((l) => [l, JSON.parse(readFileSync(path.join(WEB, `messages/${l}.json`), "utf8")).tools["ph-calculator"]]));
  for (const l of locales) {
    ok(removedKeys.every((ks) => ks.reduce((o, k) => (o ? o[k] : undefined), msgs[l]) === undefined), `${l}: removed visual keys are gone`);
    ok(leaf(msgs[l]).sort().join() === leaf(msgs.en).sort().join(), `${l}: key parity with en`);
  }
  // Every visuals key is used: its last segment appears in the pH sources (dynamic families by parent).
  const dynamic = ["region.", "names.", "forms.", "items."];
  const unused = leaf(msgs.en.visuals).filter((k) => {
    const seg = k.split(".").pop();
    if (dynamic.some((d) => k.includes(`.${d}`) || k.startsWith(d))) return false;
    if (k.startsWith("common.") && ["acidic", "neutral", "basic"].includes(seg)) return !src.includes("tc(cls)") && !src.includes("tc(classify(");
    return !new RegExp(`["'\`]${seg}["'\`]`).test(src);
  });
  ok(unused.length === 0, `no unused visuals translation key ${unused.length ? JSON.stringify(unused) : ""}`);
  // Kw source named in code.
  ok(/Bandura/.test(src), "Kw data source is cited in phMath.ts");
}

// ── Browser helpers ──────────────────────────────────────────────────────────────────
const GL_TRACKER = `
(() => {
  const ctxs = [];
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (c && /webgl/.test(type) && !ctxs.includes(c)) ctxs.push(c);
    return c;
  };
  window.__liveGL = () => ctxs.filter((c) => !c.isContextLost()).length;
})();`;
const NO_GL = `
(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (/webgl/.test(type)) return null;
    return orig.call(this, type, ...rest);
  };
})();`;

async function open(browser, { locale = "en", width = 1440, dark = false, noGL = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(noGL ? NO_GL : GL_TRACKER);
  await ctx.addInitScript((d) => {
    try {
      localStorage.setItem("theme", d ? "dark" : "light");
    } catch {}
  }, dark);
  const page = await ctx.newPage();
  page.__errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") page.__errors.push(m.text().slice(0, 240));
  });
  page.on("pageerror", (e) => page.__errors.push("PAGEERROR " + e.message.slice(0, 240)));
  await page.goto(`${BASE}/${locale}/tools/ph-calculator`, { waitUntil: "load", timeout: 180000 });
  await page.waitForSelector("[data-ph-card='8']", { timeout: 60000 });
  await page.waitForTimeout(800);
  return page;
}

const cardValue = (page, n) => page.locator(`[data-testid="ph-c${n}-value"]`).textContent();
const allValues = async (page) => {
  const out = {};
  for (let n = 1; n <= 8; n++) out[n] = (await cardValue(page, n)).trim();
  out.hero = (await page.locator('[data-testid="ph-result-ph"]').textContent()).trim();
  return out;
};
// Reset is disabled while a card already sits on its seed.
async function resetCard(page, n) {
  const b = page.locator(`[data-testid="ph-c${n}-reset"]`);
  if (!(await b.isDisabled())) await b.click();
}
const center = async (loc) => {
  const b = await loc.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};
async function scrollTo(page, sel) {
  await page.locator(sel).first().evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(350);
}
async function visibleHandle(page, n) {
  const sel = n === "hero" ? '[data-testid="ph-hero-handle"]' : `[data-testid="ph-c${n}-handle"]`;
  const all = page.locator(`${sel} [data-role="handle"]`);
  const count = await all.count();
  for (let i = 0; i < count; i++) if (await all.nth(i).isVisible()) return all.nth(i);
  return null;
}

// ── Layout audit (runs in page) ──────────────────────────────────────────────────────
async function layoutAudit(page, label, desktop) {
  const r = await page.evaluate((desktop) => {
    const toRgba = (css) => {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const x = c.getContext("2d");
      x.fillStyle = css;
      x.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = x.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const over = (fg, bg) => {
      const a = fg[3] + bg[3] * (1 - fg[3]);
      return [0, 1, 2].map((i) => (fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / (a || 1)).concat(1);
    };
    const lum = ([r, g, b]) => {
      const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    const bgOf = (el) => {
      const stack = [];
      for (let e = el; e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor;
        const v = toRgba(c);
        if (v[3] > 0) stack.push(v);
        if (v[3] >= 1) break;
      }
      let bg = toRgba(getComputedStyle(document.body).backgroundColor);
      if (bg[3] < 1) bg = [255, 255, 255, 1];
      for (const v of stack.reverse()) bg = over(v, bg);
      return bg;
    };
    const issues = [];
    const metrics = [];
    const docW = document.documentElement;
    if (docW.scrollWidth > docW.clientWidth + 1) issues.push(`horizontal scroll ${docW.scrollWidth} > ${docW.clientWidth}`);

    // Serif: every element with its own text, whole page.
    const SERIF = /(^|,)\s*("?)(ui-serif|serif|Georgia|Cambria|Times New Roman|Times)\2\s*(,|$)/i;
    for (const el of document.querySelectorAll("body *")) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const ff = getComputedStyle(el).fontFamily;
      if (SERIF.test(ff.replace(/sans-serif/gi, ""))) {
        issues.push(`serif font on <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 30)}" (${ff.slice(0, 40)})`);
        break;
      }
    }

    // Data colours (excluded from graphic-contrast checks).
    const dataCols = new Set();
    for (const name of [...Array(15).keys()].map((i) => `--ph-ui-${i}`).concat(["--ph-dye-phth-acid", "--ph-dye-phth-base", "--ph-dye-mo-acid", "--ph-dye-mo-base", "--ph-dye-btb-acid", "--ph-dye-btb-mid", "--ph-dye-btb-base", "--ph-dye-litmus-acid", "--ph-dye-litmus-base", "--ph-ion-h", "--ph-ion-oh", "--ph-water", "--ph-grid"])) {
      const probe = document.createElement("span");
      probe.style.color = `var(${name})`;
      document.body.appendChild(probe);
      dataCols.add(toRgba(getComputedStyle(probe).color).slice(0, 3).join(","));
      probe.remove();
    }
    const near = (a) => [...dataCols].some((d) => d.split(",").every((v, i) => Math.abs(+v - a[i]) < 4));

    const blocks = [...document.querySelectorAll("[data-ph-card], [data-ph-hero]")];
    for (const card of blocks) {
      const id = card.dataset.phCard ? `card ${card.dataset.phCard}` : "hero";
      const cardBody = card.querySelector("[data-bp-panel]");
      // Text contrast ≥ 4.5 (HTML and SVG text).
      for (const el of card.querySelectorAll("*")) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own || el.closest("[hidden]") || el.closest("button:disabled")) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || +cs.opacity === 0) continue;
        const isSvg = el instanceof SVGElement;
        const fg = toRgba(isSvg ? cs.fill : cs.color);
        const bg = isSvg ? bgOf(el.closest("[data-ph-drawing]") || cardBody) : bgOf(el);
        const cr = ratio(over(fg, bg), bg);
        if (cr < 4.5) issues.push(`${id}: text contrast ${cr.toFixed(2)} "${el.textContent.trim().slice(0, 24)}"`);
      }
      // Graphic contrast ≥ 3 for UI strokes (handles, buttons, axes, curves), data colours excluded.
      for (const el of card.querySelectorAll("[data-role=handle] > span:last-child, button:not(:disabled), [data-ph-drawing] svg line, [data-ph-drawing] svg polyline, [data-ph-drawing] svg path")) {
        const cs = getComputedStyle(el);
        const isSvg = el instanceof SVGElement;
        if (isSvg && (cs.stroke === "none" || parseFloat(cs.strokeWidth) < 1.5 || +cs.opacity < 0.5)) continue;
        const col = toRgba(isSvg ? cs.stroke : cs.borderTopColor);
        if (near(col)) continue;
        const bg = bgOf(isSvg ? el.closest("[data-ph-drawing]") : el.parentElement);
        const cr = ratio(over(col, bg), bg);
        if (cr < 3) issues.push(`${id}: graphic contrast ${cr.toFixed(2)} <${el.tagName.toLowerCase()}>`);
      }
      // Clipping: SVG text inside its svg; no inner horizontal overflow.
      for (const svg of card.querySelectorAll("[data-ph-drawing] svg")) {
        if (svg.closest("[hidden]")) continue;
        const sb = svg.getBoundingClientRect();
        for (const t of svg.querySelectorAll("text")) {
          const b = t.getBoundingClientRect();
          if (b.width && (b.left < sb.left - 1 || b.right > sb.right + 1 || b.top < sb.top - 1 || b.bottom > sb.bottom + 1)) issues.push(`${id}: clipped label "${t.textContent}"`);
        }
      }
      for (const el of card.querySelectorAll("[data-ph-figure], [data-ph-table-col], table")) {
        if (el.scrollWidth > el.clientWidth + 1) issues.push(`${id}: horizontal overflow in ${el.tagName.toLowerCase()}`);
      }
      if (card.dataset.phResult !== undefined) {
        const body = card.querySelector("[data-bp-panel] > div:last-child");
        const cs = getComputedStyle(body);
        const bb = body.getBoundingClientRect();
        const boxes = [...body.querySelectorAll("[data-ph-scene], [data-ph-controls], hr, [data-testid='ph-result-ph'], [data-testid='ph-result-class'], [data-ph-subvalues] > div, [data-ph-mode-tabs] button, [data-ph-result-values] > *")]
          .map((e) => e.getBoundingClientRect())
          .filter((b) => b.height > 0)
          .sort((a, b) => a.top - b.top);
        let y = bb.top + parseFloat(cs.paddingTop);
        let worst = 0;
        for (const b of boxes) {
          worst = Math.max(worst, b.top - y);
          y = Math.max(y, b.bottom);
        }
        worst = Math.max(worst, bb.bottom - parseFloat(cs.paddingBottom) - y);
        if (worst > 16.5) issues.push(`Result card: empty band ${worst.toFixed(0)}px`);
        if (desktop) {
          const col = (sel) => {
            const c = document.querySelector(sel);
            const ps = [...c.querySelectorAll("[data-bp-panel]")];
            return Math.max(...(ps.length ? ps : [c.firstElementChild]).map((e) => e.getBoundingClientRect().bottom));
          };
          const bottoms = [col(".lg\\:col-start-1.lg\\:row-start-1"), col(".lg\\:col-start-2.lg\\:row-start-1"), col(".lg\\:absolute.lg\\:end-0")];
          if (Math.max(...bottoms) - Math.min(...bottoms) > 1.5) issues.push(`above-the-fold columns end at different edges ${bottoms.map(Math.round).join("/")}`);
          metrics.push(`columns end at ${bottoms.map(Math.round).join(" / ")}`);
        }
      }
      if (!card.dataset.phCard) continue;
      // Fill ratio of each 2D drawing: union of drawn marks / drawing box.
      const drawing = card.querySelector("[data-ph-drawing]");
      const db = drawing.getBoundingClientRect();
      const canvas = drawing.querySelector("canvas");
      let fill = 1;
      if (!canvas || !canvas.offsetParent) {
        const svg = [...drawing.querySelectorAll("svg")].find((s) => !s.closest("[hidden]"));
        const marks = [...svg.querySelectorAll("path,line,polyline,circle,ellipse,rect,text")].map((m) => m.getBoundingClientRect()).filter((b) => b.width + b.height > 0);
        const u = marks.reduce((a, b) => ({ l: Math.min(a.l, b.left), t: Math.min(a.t, b.top), r: Math.max(a.r, b.right), b: Math.max(a.b, b.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
        fill = ((Math.min(u.r, db.right) - Math.max(u.l, db.left)) * (Math.min(u.b, db.bottom) - Math.max(u.t, db.top))) / (db.width * db.height);
      }
      if (fill < 0.7) issues.push(`${id}: fill ratio ${(fill * 100).toFixed(0)}% < 70%`);
      // Empty bands: in each column, vertical gaps between content boxes > 16px.
      const fig = card.querySelector("[data-ph-figure]");
      const col = card.querySelector("[data-ph-table-col]");
      const bandCheck = (container, sel) => {
        const cb = container.getBoundingClientRect();
        const boxes = [...container.querySelectorAll(sel)].filter((e) => e.offsetParent || e instanceof SVGElement).map((e) => e.getBoundingClientRect()).filter((b) => b.height > 0).sort((a, b) => a.top - b.top);
        let y = cb.top;
        let worst = 0;
        for (const b of boxes) {
          worst = Math.max(worst, b.top - y);
          y = Math.max(y, b.bottom);
        }
        worst = Math.max(worst, cb.bottom - y);
        return worst;
      };
      const g1 = bandCheck(fig, "[data-ph-drawing], [data-ph-controls], [data-testid$='-handle'], [data-ph-ticks], figcaption");
      const g2 = bandCheck(col, "caption, tr");
      if (g1 > 16.5) issues.push(`${id}: empty band ${g1.toFixed(0)}px in visual column`);
      if (g2 > 16.5) issues.push(`${id}: empty band ${g2.toFixed(0)}px in table column`);
      if (desktop) {
        const fb = fig.getBoundingClientRect();
        const tb = col.getBoundingClientRect();
        if (Math.abs(fb.bottom - tb.bottom) > 1.5) issues.push(`${id}: visual and table end ${Math.abs(fb.bottom - tb.bottom).toFixed(0)}px apart`);
        const rows = col.querySelectorAll("tbody tr");
        const rowH = [...rows].map((r) => r.getBoundingClientRect().height);
        metrics.push(`${id}: fig ${fb.height.toFixed(0)} table ${tb.height.toFixed(0)} rowH ${Math.max(...rowH).toFixed(0)} fill ${(fill * 100).toFixed(0)}%`);
      }
    }
    return { issues, metrics };
  }, desktop);
  for (const m of r.metrics) console.log(`  [${label}] ${m}`);
  ok(r.issues.length === 0, `${label}: layout audit${r.issues.length ? " → " + r.issues.slice(0, 12).join(" | ") : ""}`);
}

// Overlapping SVG labels inside each drawing (3D labels are resolved in-scene by Label3D).
async function labelOverlaps(page) {
  return page.evaluate(() => {
    const bad = [];
    for (const d of document.querySelectorAll("[data-ph-drawing], [data-ph-hero]")) {
      const svg = [...d.querySelectorAll("svg")].find((s) => !s.closest("[hidden]") && s.getBoundingClientRect().width > 0 && s.querySelector("text"));
      if (!svg) continue;
      const boxes = [...svg.querySelectorAll("text")].map((t) => ({ t: t.textContent, b: t.getBoundingClientRect() })).filter((x) => x.b.width > 0);
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].b;
          const b = boxes[j].b;
          if (a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5) bad.push(`"${boxes[i].t}" × "${boxes[j].t}"`);
        }
    }
    return bad;
  });
}

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

// ── Content identical to the recording ───────────────────────────────────────────────
if (run("content") && existsSync(BASELINE_FILE)) {
  const base = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
  for (const locale of ["en", "ar"]) {
    const page = await open(browser, { locale });
    const now = await readContent(page);
    // The recording predates the ad filter: drop the ad label from it the same way.
    base[locale].texts = base[locale].texts.filter((x) => !now.ads.includes(x));
    for (const k of ["texts", "links", "faq"]) ok(JSON.stringify(now[k]) === JSON.stringify(base[locale][k]), `${locale}: ${k} identical to the Step-1 recording (${base[locale][k].length})`);
    await page.context().close();
  }
}

// ── Structure + hero + isolation (en 1440 light, ar 390 dark) ────────────────────────
for (const cfg of [
  { locale: "en", width: 1440, dark: false },
  { locale: "ar", width: 390, dark: true },
]) {
  if (!run("interact")) break;
  if (process.env.CFG && process.env.CFG !== cfg.locale) continue;
  const tag = `${cfg.locale}-${cfg.width}-${cfg.dark ? "dark" : "light"}`;
  const page = await open(browser, cfg);
  ok((await page.locator("[data-ph-hero]").count()) === 1, `${tag}: exactly 1 hero`);
  const ns = await page.locator("[data-ph-card]").evaluateAll((els) => els.map((e) => e.dataset.phCard).sort().join(","));
  ok(ns === "1,2,3,4,5,6,7,8", `${tag}: exactly 8 indicator cards (${ns})`);
  ok((await page.locator("[data-ph-card] [data-ph-interactive]").count()) === 8, `${tag}: every card carries the interactive icon`);
  const kinds = await page.locator("[data-ph-card]").evaluateAll((els) => els.filter((e) => e.dataset.phKind === "3d").length);
  ok(kinds === 3, `${tag}: 3 of the 8 cards are 3D`);
  const sides = await page.locator("[data-ph-card]").evaluateAll((els) => els.map((e) => e.dataset.cardSide));
  ok(sides.every((s, i) => i === 0 || s !== sides[i - 1]), `${tag}: zigzag sides alternate down the page`);
  // Cards are spread through the article, never one contiguous block.
  const contiguous = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[data-ph-card]")];
    return cards.filter((c, i) => i > 0 && c.previousElementSibling === cards[i - 1]).length;
  });
  ok(contiguous === 0, `${tag}: no two cards are adjacent siblings (each sits next to its own text)`);

  // §44: one Result card = the 3D card: scene, then pH + status, then pOH/[H⁺]/[OH⁻], then the tabs.
  ok((await page.locator("[data-ph-visual]").count()) === 9, `${tag}: exactly 9 visual elements (Result card + 8 cards)`);
  const rc = await page.evaluate(() => {
    const cards = document.querySelectorAll("[data-ph-result]");
    const card = cards[0];
    const sel = ["[data-ph-scene='hero']", "[data-testid='ph-result-ph']", "[data-testid='ph-result-class']", "[data-ph-subvalues]", "[data-ph-mode-tabs]"];
    const els = sel.map((x) => card?.querySelector(x));
    if (els.some((e) => !e)) return { count: cards.length, missing: true };
    const dom = els.every((e, i) => i === 0 || !!(els[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
    const tops = els.map((e) => e.getBoundingClientRect().top);
    const visual = tops.every((t, i) => i === 0 || t > tops[i - 1]);
    const head = card.querySelector("[data-bp-panel] > div").getBoundingClientRect().bottom;
    const titles = [...document.querySelectorAll("[data-bp-panel] h2")].map((h) => h.textContent.trim());
    const tool = document.getElementById("tool");
    const strayTabs = [...tool.querySelectorAll("[role=tab]")].filter((b) => !b.closest("[data-bp-panel]")).length;
    return { count: cards.length, dom, visual, gap: els[0].getBoundingClientRect().top - head, heroSame: document.querySelectorAll("[data-ph-hero]").length === 1 && !!document.querySelector("[data-ph-hero][data-ph-result]"), titles, strayTabs };
  });
  ok(rc.count === 1 && !rc.missing && rc.dom && rc.visual, `${tag}: one Result card; DOM and visual order = scene, pH, status, pOH/[H⁺]/[OH⁻], tabs`);
  ok(rc.gap <= 24.5, `${tag}: the scene sits directly under the Result header band (${rc.gap?.toFixed(0)}px = body padding)`);
  ok(rc.heroSame && !rc.titles.some((x) => /Live Beaker|الكأس الحية/.test(x)), `${tag}: no separate Live Beaker card`);
  ok(rc.strayTabs === 0, `${tag}: no tab button outside a card`);
  // Symbol case as rendered (innerText applies text-transform).
  const caseBad = await page.evaluate(() => (document.querySelector("main")?.innerText ?? "").match(/\b(POH|PH|PKW|PKA|KW|MOL\/L|H3O)\b/g));
  ok(!caseBad, `${tag}: symbols keep their exact case on the whole page${caseBad ? " → " + [...new Set(caseBad)].join(",") : ""}`);
  const dt = await page.locator("[data-ph-subvalues] dt").allInnerTexts();
  ok(dt[0] === "pOH" && dt[1] === "[H⁺]" && dt[2] === "[OH⁻]", `${tag}: Result labels render as pOH / [H⁺] / [OH⁻] (${dt.join(" / ")})`);

  // Hero: real mouse drag of the pH marker → exact snapped value, calculator updated.
  await scrollTo(page, "[data-ph-hero]");
  // Let the scene settle: the 2D twin shows until the 3D canvas has drawn its first frame.
  await page.waitForSelector('[data-ph-scene="hero"][data-ph-mode="3d"]', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(500);
  const mode = await page.locator('[data-ph-scene="hero"]').getAttribute("data-ph-mode");
  console.log(`  hero renders in ${mode}`);
  const h = await visibleHandle(page, "hero");
  ok(!!h, `${tag}: hero marker handle is visible`);
  if (h) {
    const p0 = await center(h);
    const scene = page.locator('[data-ph-scene="hero"]');
    const sb = await scene.boundingBox();
    let bottom;
    let top;
    if (mode === "3d") {
      const s = (await page.locator('[data-testid="ph-hero-handle"][data-scale]').getAttribute("data-scale")).split(",").map(Number);
      const host = await page.locator('[data-testid="ph-hero-3d"]').boundingBox();
      bottom = { x: host.x + s[0], y: host.y + s[1] };
      top = { x: host.x + s[2], y: host.y + s[3] };
    } else {
      const [bx, by, tx, ty, W, H] = (await page.locator("[data-scale-vb]").getAttribute("data-scale-vb")).split(",").map(Number);
      const svgBox = await page.locator("[data-scale-vb] svg").boundingBox();
      bottom = { x: svgBox.x + (bx / W) * svgBox.width, y: svgBox.y + (by / H) * svgBox.height };
      top = { x: svgBox.x + (tx / W) * svgBox.width, y: svgBox.y + (ty / H) * svgBox.height };
    }
    const target = 9.3;
    // A real drag moves the marker by the pointer's travel along the scale: start on the marker
    // (whatever pH it shows) and travel (target − start) / 14 of the scale length.
    const startPh = +(await h.getAttribute("aria-valuenow"));
    const tp = { x: p0.x + ((top.x - bottom.x) * (target - startPh)) / 14, y: p0.y + ((top.y - bottom.y) * (target - startPh)) / 14 };
    console.log(`  hero drag: from ${JSON.stringify(p0)} to ${JSON.stringify(tp)} bottom ${JSON.stringify(bottom)} top ${JSON.stringify(top)} viewport ${JSON.stringify(page.viewportSize())}`);
    const scaleBefore = mode === "3d" ? await page.locator('[data-testid="ph-hero-handle"][data-scale]').getAttribute("data-scale") : null;
    await page.mouse.move(p0.x, p0.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(p0.x + ((tp.x - p0.x) * i) / 12, p0.y + ((tp.y - p0.y) * i) / 12);
    const mid = (await page.locator('[data-testid="ph-result-ph"]').textContent()).trim();
    if (SHOTS_ON && cfg.locale === "en") await page.locator("[data-ph-hero]").screenshot({ path: path.join(SHOTS, "hero-mid-drag.png") });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const field = await page.locator('form input[inputmode="decimal"]').inputValue();
    const hero = (await page.locator('[data-testid="ph-result-ph"]').textContent()).trim();
    const resultHero = (await page.locator("[data-ph-subvalues] dd").first().textContent()).trim();
    ok(mid === "9.3" && hero === "9.3", `${tag}: real-mouse drag in the Result card snaps to exactly pH 9.3 (mid-drag ${mid}, after ${hero})`);
    ok(field === "9.3", `${tag}: drag writes pH 9.3 into the calculator field (got ${field})`);
    ok(resultHero === "4.7", `${tag}: pOH below the scene follows the drag (got ${resultHero})`);
    if (scaleBefore) ok(scaleBefore === (await page.locator('[data-testid="ph-hero-handle"][data-scale]').getAttribute("data-scale")), `${tag}: orbit stays still while the marker is dragged`);
    // Calculator → hero.
    await page.locator('form input[inputmode="decimal"]').fill("3.2");
    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(400);
    const back = (await page.locator('[data-testid="ph-result-ph"]').textContent()).trim();
    const now = await (await visibleHandle(page, "hero")).getAttribute("aria-valuenow");
    ok(back === "3.2" && Math.abs(+now - 3.2) < 1e-9, `${tag}: typing pH 3.2 + Calculate moves the hero (readout ${back}, marker ${now})`);
    // Hero keyboard.
    await (await visibleHandle(page, "hero")).focus();
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(200);
    ok((await page.locator('form input[inputmode="decimal"]').inputValue()) === "3.3", `${tag}: hero marker keyboard ArrowUp → pH 3.3 in the calculator`);
    void sb;
  }

  // Each card: drag, buttons, limits, keyboard — only its own value changes.
  for (let n = 1; n <= 8; n++) {
    await scrollTo(page, `[data-ph-card="${n}"]`);
    const before = await allValues(page);
    const hd = await visibleHandle(page, n);
    if (!hd) {
      ok(false, `${tag}: card ${n} handle visible`);
      continue;
    }
    const c0 = await center(hd);
    const vertical = n === 1;
    await page.mouse.move(c0.x, c0.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(c0.x + (vertical ? 0 : i * 8), c0.y + (vertical ? i * 8 : n === 7 ? -i * 2 : 0));
    await page.mouse.up();
    await page.waitForTimeout(250);
    const afterDrag = await allValues(page);
    const changedByDrag = Object.keys(before).filter((k) => before[k] !== afterDrag[k]);
    ok(changedByDrag.length === 1 && changedByDrag[0] === String(n), `${tag}: card ${n} drag changes only card ${n} (${changedByDrag.join(",") || "nothing"}: ${before[n]} → ${afterDrag[n]})`);
    // Buttons: reset, then minus to the floor.
    await resetCard(page, n);
    await page.waitForTimeout(150);
    const seed = await allValues(page);
    ok(seed[n] === before[n], `${tag}: card ${n} reset returns to its seed (${seed[n]})`);
    await page.locator(`[data-testid="ph-c${n}-plus"]`).click();
    await page.waitForTimeout(150);
    const plus = await allValues(page);
    const changedByPlus = Object.keys(seed).filter((k) => seed[k] !== plus[k]);
    ok(changedByPlus.length === 1 && changedByPlus[0] === String(n), `${tag}: card ${n} + changes only card ${n} (${seed[n]} → ${plus[n]})`);
    for (let i = 0; i < 120 && !(await page.locator(`[data-testid="ph-c${n}-minus"]`).isDisabled()); i++) await page.locator(`[data-testid="ph-c${n}-minus"]`).click();
    ok((await page.locator(`[data-testid="ph-c${n}-minus"]`).isDisabled()) && !(await page.locator(`[data-testid="ph-c${n}-plus"]`).isDisabled()), `${tag}: card ${n} at its minimum disables − only`);
    // Hold-to-repeat on +.
    const plusBtn = page.locator(`[data-testid="ph-c${n}-plus"]`);
    const pb = await center(plusBtn);
    const v0 = (await cardValue(page, n)).trim();
    await page.mouse.move(pb.x, pb.y);
    await page.mouse.down();
    await page.waitForTimeout(800);
    await page.mouse.up();
    const v1 = (await cardValue(page, n)).trim();
    ok(v0 !== v1, `${tag}: card ${n} + hold-to-repeat steps several times (${v0} → ${v1})`);
    for (let i = 0; i < 120 && !(await plusBtn.isDisabled()); i++) await plusBtn.click();
    ok((await plusBtn.isDisabled()) && !(await page.locator(`[data-testid="ph-c${n}-minus"]`).isDisabled()), `${tag}: card ${n} at its maximum disables + only`);
    // Keyboard on the handle.
    await resetCard(page, n);
    const k0 = (await cardValue(page, n)).trim();
    await (await visibleHandle(page, n)).focus();
    await page.keyboard.press((await page.locator(`[data-testid="ph-c${n}-minus"]`).isDisabled()) ? "ArrowRight" : "ArrowLeft");
    await page.waitForTimeout(120);
    const k1 = (await cardValue(page, n)).trim();
    ok(k0 !== k1, `${tag}: card ${n} handle responds to arrow keys (${k0} → ${k1})`);
    await page.locator(`[data-testid="ph-c${n}-reset"]`).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
    ok((await cardValue(page, n)).trim() === k0, `${tag}: card ${n} reset works from the keyboard`);
    const end = await allValues(page);
    const others = Object.keys(before).filter((k) => k !== String(n) && k !== "hero" && before[k] !== end[k]);
    ok(others.length === 0, `${tag}: card ${n} never touched another card`);
  }

  // Label overlaps at pH 0, 1, 3.5, 7, 10.5, 14 (hero + pH-driven cards), and every state of the others.
  const pHs = [0, 1, 3.5, 7, 10.5, 14];
  const allBad = [];
  for (const target of pHs) {
    await page.locator('form input[inputmode="decimal"]').fill(String(target));
    await page.locator('form button[type="submit"]').click();
    for (const n of [1, 6, 7, 8]) {
      await resetCard(page, n);
      const steps = Math.round((target - 5.5) / 0.5);
      const btn = page.locator(`[data-testid="ph-c${n}-${steps > 0 ? "plus" : "minus"}"]`);
      for (let i = 0; i < Math.abs(steps); i++) await btn.click();
    }
    await page.waitForTimeout(150);
    const vals = await allValues(page);
    ok([1, 6, 7, 8].every((n) => vals[n].includes(target.toFixed(2))), `${tag}: pH-driven cards reach pH ${target.toFixed(2)} without NaN (${[1, 6, 7, 8].map((n) => vals[n]).join(" / ")})`);
    const bad = await labelOverlaps(page);
    if (bad.length) allBad.push(`pH ${target}: ${bad.slice(0, 4).join(", ")}`);
    const nan = await page.evaluate(() => /NaN|Infinity|undefined/.test(document.querySelector("main")?.innerText ?? ""));
    ok(!nan, `${tag}: no NaN/Infinity/undefined on the page at pH ${target}`);
    if (SHOTS_ON && target === 7 && cfg.locale === "en") {
      // nothing extra
    }
  }
  for (const [n, count] of [[2, 101], [3, 8], [4, 5], [5, 7]]) {
    await resetCard(page, n);
    for (let i = 0; i < 120 && !(await page.locator(`[data-testid="ph-c${n}-minus"]`).isDisabled()); i++) await page.locator(`[data-testid="ph-c${n}-minus"]`).click();
    const stepEvery = n === 2 ? 1 : 1;
    for (let i = 0; i < count; i += stepEvery) {
      if (n !== 2 || [0, 24, 49, 50, 51, 100].includes(i)) {
        const bad = await labelOverlaps(page);
        if (bad.length) allBad.push(`card ${n} state ${i}: ${bad.slice(0, 3).join(", ")}`);
        const nan = await page.locator(`[data-ph-card="${n}"]`).evaluate((el) => /NaN|Infinity|undefined/.test(el.innerText));
        if (nan) allBad.push(`card ${n} state ${i}: NaN`);
      }
      if (!(await page.locator(`[data-testid="ph-c${n}-plus"]`).isDisabled())) await page.locator(`[data-testid="ph-c${n}-plus"]`).click();
    }
  }
  ok(allBad.length === 0, `${tag}: no overlapping labels or NaN at any tested state${allBad.length ? " → " + allBad.slice(0, 6).join(" | ") : ""}`);

  // Titration at its equivalence point (screenshot).
  if (SHOTS_ON && cfg.locale === "en") {
    await resetCard(page, 2);
    await page.locator('[data-testid="ph-c2-plus"]').click();
    ok((await cardValue(page, 2)).trim() === "25.0 mL", "titration + from its seed reaches the 25.0 mL equivalence point");
    await scrollTo(page, '[data-ph-card="2"]');
    await page.locator('[data-ph-card="2"]').screenshot({ path: path.join(SHOTS, "card-2-titration-equivalence.png") });
  }
  ok(page.__errors.length === 0, `${tag}: no console errors${page.__errors.length ? " → " + page.__errors.slice(0, 3).join(" | ") : ""}`);
  await page.context().close();
}

// ── WebGL budget while scrolling + fallback ──────────────────────────────────────────
if (run("webgl")) {
  for (const width of [1440, 390]) {
    const page = await open(browser, { width });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    let maxLive = 0;
    let maxCanvases = 0;
    const seen3d = new Set();
    for (const dir of [1, -1]) {
      for (let y = dir > 0 ? 0 : total; dir > 0 ? y <= total : y >= 0; y += dir * 350) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(260);
        const s = await page.evaluate(() => ({
          live: window.__liveGL(),
          canvases: document.querySelectorAll("canvas[data-ph-live]").length,
          modes: [...document.querySelectorAll("[data-ph-scene]")].filter((e) => e.dataset.phMode === "3d").map((e) => e.dataset.phScene),
        }));
        maxLive = Math.max(maxLive, s.live);
        maxCanvases = Math.max(maxCanvases, s.canvases);
        s.modes.forEach((m) => seen3d.add(m));
      }
    }
    ok(maxLive <= 2 && maxCanvases <= 2, `${width}: never more than 2 live WebGL contexts while scrolling (max ${maxLive} contexts, ${maxCanvases} canvases)`);
    ok(seen3d.size === 4, `${width}: all four scenes rendered in 3D at some point (${[...seen3d].join(",")})`);
    ok(page.__errors.length === 0, `${width}: no console errors while scrolling${page.__errors.length ? " → " + page.__errors.slice(0, 3).join(" | ") : ""}`);
    if (SHOTS_ON && width === 1440) {
      for (const n of [3, 5, 8]) {
        await scrollTo(page, `[data-ph-card="${n}"]`);
        await page.waitForSelector(`[data-ph-scene="c${n}"][data-ph-mode="3d"]`, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(600);
        await page.locator(`[data-ph-card="${n}"]`).screenshot({ path: path.join(SHOTS, `card-${n}-3d.png`) });
      }
    }
    await page.context().close();
  }
  const page = await open(browser, { noGL: true });
  for (const sc of ["hero", "c3", "c5", "c8"]) {
    await scrollTo(page, `[data-ph-scene="${sc}"]`);
    const r = await page.locator(`[data-ph-scene="${sc}"]`).evaluate((el) => {
      const svg = [...el.querySelectorAll("svg")].find((s) => s.getBoundingClientRect().height > 50);
      return { mode: el.dataset.phMode, svg: !!svg, marks: svg ? svg.querySelectorAll("circle,path,rect,text,line").length : 0 };
    });
    ok(r.mode === "2d" && r.svg && r.marks > 5, `no-WebGL: ${sc} renders its 2D version (${r.marks} marks)`);
  }
  ok(page.__errors.length === 0, `no-WebGL: no console errors${page.__errors.length ? " → " + page.__errors.slice(0, 3).join(" | ") : ""}`);
  await page.context().close();
}

// ── Layout matrix: light/dark × 390/768/1440 × en/ar ─────────────────────────────────
if (run("layout")) {
  // Full-page captures fail under the software-GL flags; this audit uses the default browser.
  const plain = await chromium.launch();
  for (const locale of ["en", "ar"])
    for (const dark of [false, true])
      for (const width of [390, 768, 1440]) {
        const page = await open(plain, { locale, width, dark });
        await page.evaluate(() => window.scrollTo(0, 0));
        await layoutAudit(page, `${locale}-${width}-${dark ? "dark" : "light"}`, width >= 1024);
        const tag = `${locale}-${width}-${dark ? "dark" : "light"}`;
        if (SHOTS_ON && ((width === 390 && dark) || (width === 1440 && locale === "en"))) {
          // Clear the sticky site header so the card's own blue header band is in the capture.
          await page.locator("[data-ph-result]").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 110));
          await page.waitForSelector('[data-ph-scene="hero"][data-ph-mode="3d"]', { timeout: 20000 }).catch(() => {});
          await page.waitForTimeout(800);
          // The desktop card is taller than 900px: a taller viewport keeps it in one clean capture.
          if (width === 1440) await page.setViewportSize({ width, height: 1400 });
          await page.waitForTimeout(400);
          await page.locator("[data-ph-result]").screenshot({ path: path.join(SHOTS, `result-card-${dark ? "dark" : "light"}-${width}-${locale}.png`) });
          if (width === 1440) await page.setViewportSize({ width, height: 900 });
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        if (SHOTS_ON && width === 1440 && locale === "en") {
          await page.screenshot({ path: path.join(SHOTS, `full-${dark ? "dark" : "light"}-1440.png`), fullPage: true });
        }
        if (SHOTS_ON && width === 390 && locale === "ar" && dark) {
          await page.screenshot({ path: path.join(SHOTS, "full-dark-390-ar-rtl.png"), fullPage: true });
        }
        ok(page.__errors.length === 0, `${tag}: no console errors${page.__errors.length ? " → " + page.__errors.slice(0, 2).join(" | ") : ""}`);
        await page.context().close();
      }
  await plain.close();
}

await browser.close();
console.log(`\n${failures.length ? `${failures.length} FAILED` : "ALL PASSED"}`);
process.exit(failures.length ? 1 : 0);
