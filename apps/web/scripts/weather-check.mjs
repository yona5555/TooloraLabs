// DOM-text check for the weather tool (no screenshots): result, 8 indicator cards, map layers, credits, errors.
import { chromium } from "playwright";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
const base = requireBase(process.env.BASE);
let browser;
try {
  browser = await chromium.launch();
} catch {
  browser = await chromium.launch({ executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" });
}
for (const [locale, theme] of [["ar", "light"], ["en", "dark"], ["hi", "light"]]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${base}/${locale}/tools/weather-forecast`, { waitUntil: "load" });
  if (theme === "dark") {
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "load" });
  }
  const info = await page.evaluate(() => {
    const txt = (sel) => document.querySelector(sel)?.textContent?.trim().slice(0, 160) ?? null;
    const cards = [...document.querySelectorAll("[data-bp-panel] h2")].map((h) => h.textContent.trim());
    return {
      dir: document.documentElement.dir,
      result: txt("[data-tool-result]"),
      cards,
      sky: !!document.querySelector("[data-tool-result] svg[aria-label='sky']"),
      tableRows: document.querySelectorAll("[data-tool-result] tbody tr").length,
      credits: [...document.querySelectorAll("a[href*='creativecommons'], a[href*='usgs'], a[href*='eonet']")].map((a) => a.textContent.trim()),
      oldSources: /open-meteo|openstreetmap\.org\/\{|tile\.openstreetmap/i.test(document.documentElement.innerHTML),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log(JSON.stringify({ locale, theme, ...info, errors: errors.slice(0, 5) }, null, 1));
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector("#wx-map")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(9000);
  const map = await page.evaluate(() => ({
    canvas: !!document.querySelector("#wx-map canvas.maplibregl-canvas"),
    attribution: document.querySelector("#wx-map .maplibregl-ctrl-attrib")?.textContent?.trim() ?? null,
    nearest: [...document.querySelectorAll("#wx-map ul li button")].length,
    layers: [...document.querySelectorAll("#wx-map label")].map((l) => l.textContent.trim()),
  }));
  // Drag the hourly chart and read the worked example change.
  const svg = page.locator("#wx-hourly svg").first();
  await svg.scrollIntoViewIfNeeded();
  const box = await svg.boundingBox();
  const before = await page.locator("#wx-hourly dd").first().textContent();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2, { steps: 5 });
  const during = await page.locator("#wx-hourly dd").first().textContent();
  await page.mouse.up();
  console.log(JSON.stringify({ map, drag: { before, during }, errors: errors.slice(0, 5) }, null, 1));
  await page.close();
}
const m = await browser.newPage({ viewport: { width: 375, height: 800 } });
await m.goto(`${base}/ar/tools/weather-forecast`, { waitUntil: "load" });
console.log("mobile overflowX", await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth));
await browser.close();
