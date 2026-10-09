// Market tool check (forex-converter / commodities-tracker / crypto-converter): top-area gaps,
// display-currency switching, chart pair switching, fullscreen, console errors, optional screenshots.
// Usage: node apps/web/scripts/market-tool-check.mjs <slug> [outDir]   (screenshots only when outDir is given)
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const slug = process.argv[2] ?? "forex-converter";
const outDir = process.argv[3];
const browser = await chromium.launch();

async function open(locale, width, theme) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  await page.goto(`${BASE}/${locale}/tools/${slug}`, { waitUntil: "load" });
  await page.evaluate(([t, s]) => { localStorage.setItem("theme", t); localStorage.removeItem(`${s}:fiat`); }, [theme, slug]);
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector('[data-testid="candle-chart"]', { timeout: 60000 });
  await page.waitForTimeout(2500);
  return page;
}

// Gaps: blank space under each top-area column's real content, relative to the tallest column.
const metrics = (page) =>
  page.evaluate(() => {
    const grid = document.getElementById("tool").firstElementChild;
    const r = (el) => el.getBoundingClientRect();
    const [inputCol, resultCol] = grid.children;
    const sidebarCol = grid.lastElementChild;
    const bottom = r(grid).bottom;
    const contentBottom = (el) => Math.max(...[...el.querySelectorAll("*")].filter((n) => n.children.length === 0 && r(n).height > 0).map((n) => r(n).bottom));
    const fill = document.querySelector('[data-testid="sidebar-fill"]');
    return {
      gridH: Math.round(r(grid).height),
      inputGap: Math.round(bottom - contentBottom(inputCol)),
      resultGap: Math.round(bottom - contentBottom(resultCol)),
      sidebarGap: getComputedStyle(sidebarCol).display === "none" ? "hidden" : Math.round(bottom - Math.max(contentBottom(sidebarCol), fill ? r(fill).bottom : 0)),
      sidebarFillH: fill ? Math.round(r(fill).height) : null,
      docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

const read = (page) =>
  page.evaluate(() => {
    const q = (s) => document.querySelector(s)?.textContent?.trim();
    return {
      result: q('[data-testid="converted-amount"]'),
      fiat: q('[data-testid="converted-fiat"]'),
      flowRate: q('[data-testid="flow-rate"]'),
      quickRow: q('[data-testid="quick-table"] tbody tr'),
      chartHeading: q("#chart h3"),
      volatility: q('[data-testid="volatility-value"]'),
      sensitivity: q('[data-testid="sensitivity-trio"]')?.slice(0, 120),
      range: q('[data-testid="range-strip"]')?.slice(0, 80),
      compare: q('[data-testid="comparison-cards"]')?.slice(0, 100),
      strength: q('[data-testid="strength-meter"] li'),
      cardIds: [...document.querySelectorAll("[id]")].filter((e) => e.querySelector(":scope > div.bg-blue-600")).map((e) => e.id),
    };
  });

async function pickFiat(page, code) {
  await page.click('[data-testid="fiat-picker"]');
  await page.fill('[data-testid="fiat-search"]', code);
  await page.click(`[data-fiat="${code}"]`);
  await page.waitForTimeout(500);
}

const page = await open("en", 1440, "light");
console.log("metrics 1440", await metrics(page));
console.log("default", await read(page));

await page.fill('input[inputmode="decimal"]', "250");
await page.waitForTimeout(400);
console.log("amount 250", await read(page));
for (const code of ["JPY", "SAR"]) {
  await pickFiat(page, code);
  console.log(`fiat ${code}`, await read(page));
}
console.log("persisted", await page.evaluate((s) => localStorage.getItem(`${s}:fiat`), slug));
await pickFiat(page, "USD");

const rowAttr = await page.evaluate(() => ["data-pair", "data-instrument", "data-coin"].find((a) => document.querySelector(`#chart [${a}]`)));
const ids = await page.evaluate((a) => [...document.querySelectorAll(`#chart [${a}]`)].filter((e) => e.getAttribute("aria-pressed") !== "true").slice(0, 3).map((e) => e.getAttribute(a)), rowAttr);
for (const id of ids) {
  const before = await page.evaluate(() => document.querySelector("#chart h3")?.textContent);
  await page.click(`#chart [${rowAttr}="${id}"]`);
  await page.waitForFunction((b) => document.querySelector("#chart h3")?.textContent !== b, before, { timeout: 10000 });
  await page.waitForSelector('[data-testid="candle-chart"]', { timeout: 30000 });
  console.log("chart ->", id, await page.evaluate(() => document.querySelector("#chart h3")?.textContent));
}
for (const tf of await page.evaluate(() => [...document.querySelectorAll("#chart [data-tf]")].map((b) => b.dataset.tf))) {
  await page.click(`#chart [data-tf="${tf}"]`);
  await page.waitForSelector('[data-testid="candle-chart"]', { timeout: 30000 });
  await page.waitForTimeout(300);
  console.log("tf", tf, await page.evaluate(() => ({ mode: document.querySelector('[data-testid="candle-chart"]')?.dataset.mode, tip: document.querySelector('[data-testid="candle-tooltip"]')?.textContent })));
}

await page.click('[data-testid="chart-fullscreen"]');
await page.waitForTimeout(800);
console.log("fullscreen", await page.evaluate(() => ({ on: document.fullscreenElement?.dataset.testid ?? null, chartH: Math.round(document.querySelector('[data-testid="candle-chart"]').getBoundingClientRect().height) })));
await page.click('[data-testid="chart-fullscreen"]');
await page.waitForTimeout(500);
console.log("after exit", await page.evaluate(() => document.fullscreenElement === null));
console.log("errors", page.errors.slice(0, 8));

const m375 = await open("en", 375, "light");
console.log("metrics 375", await metrics(m375));
const ar = await open("ar", 1440, "light");
console.log("ar metrics", await metrics(ar), "ar errors", ar.errors.slice(0, 5));

if (outDir) {
  for (const [locale, theme] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) {
    for (const width of [1440, 375]) {
      const p = await open(locale, width, theme);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        window.scrollTo(0, 0);
      });
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${outDir}/${slug}-${locale}-${theme}-${width}.png`, fullPage: true });
      await p.close();
    }
  }
}
await browser.close();
