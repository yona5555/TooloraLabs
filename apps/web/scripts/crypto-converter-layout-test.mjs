// Crypto converter layout check: fiat switching, chart coin switching, gap metrics, optional screenshots.
// Usage: node apps/web/scripts/crypto-converter-layout-test.mjs [outDir]  (screenshots only when outDir is given)
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = process.argv[2];
const browser = await chromium.launch();

async function open(locale, width, theme) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${BASE}/${locale}/tools/crypto-converter`, { waitUntil: "load" });
  await page.evaluate((t) => { localStorage.setItem("theme", t); localStorage.removeItem("crypto-converter:fiat"); }, theme);
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector('[data-testid="candle-chart"]', { timeout: 30000 });
  await page.waitForTimeout(1500);
  return page;
}

const metrics = (page) =>
  page.evaluate(() => {
    const tool = document.getElementById("tool");
    const [inputCol, resultCol] = tool.children;
    const card = inputCol.firstElementChild;
    const body = card.lastElementChild;
    const lastChild = body.lastElementChild;
    const gap = body.getBoundingClientRect().bottom - lastChild.getBoundingClientRect().bottom;
    return {
      inputH: Math.round(inputCol.getBoundingClientRect().height),
      resultH: Math.round(resultCol.getBoundingClientRect().height),
      gapUnderInputContent: Math.round(gap),
      toolWidth: Math.round(tool.getBoundingClientRect().width),
      chartCardWidth: Math.round(document.getElementById("chart").getBoundingClientRect().width),
      docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

async function pickFiat(page, code) {
  await page.click('[data-testid="fiat-picker"]');
  await page.fill('[data-testid="fiat-search"]', code);
  await page.click(`[data-fiat="${code}"]`);
  await page.waitForTimeout(400);
  return page.evaluate(() => ({
    fiat: document.querySelector('[data-testid="converted-fiat"]')?.textContent,
    result: document.querySelector('[data-testid="converted-amount"]')?.textContent,
    firstListPrice: document.querySelector('[data-testid="sidebar-ticker"] li button span[dir="ltr"].font-mono')?.textContent,
    quickRow: document.querySelector('[data-testid="quick-table"] tbody tr')?.textContent,
    heading: document.querySelector("#chart h3")?.textContent,
  }));
}

const page = await open("en", 1440, "light");
console.log("metrics 1440", await metrics(page));
for (const code of ["EUR", "JPY"]) console.log(code, await pickFiat(page, code));
console.log("persisted", await page.evaluate(() => localStorage.getItem("crypto-converter:fiat")));
await pickFiat(page, "USD");

for (const id of ["ethereum", "solana", "ripple"]) {
  const before = await page.evaluate(() => document.querySelector("#chart h3")?.textContent);
  await page.click(`#chart [data-coin="${id}"]`);
  await page.waitForFunction((b) => document.querySelector("#chart h3")?.textContent !== b, before, { timeout: 10000 });
  await page.waitForSelector('[data-testid="candle-chart"]', { timeout: 20000 }).catch(() => {});
  const r = await page.evaluate((cid) => ({
    heading: document.querySelector("#chart h3")?.textContent,
    pressed: document.querySelector(`#chart [data-coin="${cid}"]`)?.getAttribute("aria-pressed"),
    tooltip: document.querySelector('[data-testid="candle-tooltip"]')?.textContent?.slice(0, 60),
  }), id);
  console.log("chart", id, r);
}
await page.close();

const m = await open("en", 375, "light");
console.log("metrics 375", await m.evaluate(() => ({ overflowX: document.documentElement.scrollWidth > window.innerWidth })));
await m.close();

if (outDir) {
  for (const [locale, theme] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) {
    for (const width of [1440, 375]) {
      const p = await open(locale, width, theme);
      await p.screenshot({ path: `${outDir}/${locale}-${theme}-${width}.png`, fullPage: true });
      await p.close();
    }
  }
}
await browser.close();
