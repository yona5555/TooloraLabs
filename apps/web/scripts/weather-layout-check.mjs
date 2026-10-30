// DOM check (no screenshots): weather cards put the table at the start side, labels unclipped, RTL chart mirroring, map fullscreen.
import { chromium } from "playwright";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
const base = requireBase(process.env.BASE);
const browser = await chromium.launch();
for (const [locale, width, theme] of [["ar", 1440, "light"], ["en", 1440, "dark"], ["ar", 375, "light"]]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${base}/${locale}/tools/weather-forecast`, { waitUntil: "load" });
  if (theme === "dark") {
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "load" });
  }
  const cards = await page.evaluate(() =>
    ["wx-hourly", "wx-daily", "wx-wind", "wx-pressure", "wx-humidity", "wx-uv", "wx-sun", "wx-moon"].map((id) => {
      const card = document.getElementById(id);
      const dl = card?.querySelector("dl");
      const table = dl?.parentElement;
      const chart = table?.nextElementSibling;
      if (!table || !chart) return { id, missing: true };
      const t = table.getBoundingClientRect();
      const c = chart.getBoundingClientRect();
      const clipped = [...dl.querySelectorAll("dt,dd")].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
      const empty = [...dl.querySelectorAll("dd")].filter((e) => !e.textContent.trim()).length;
      const side = Math.abs(t.top - c.top) < 4 ? (t.left > c.left ? "table-right" : "table-left") : t.top > c.top ? "table-below" : "table-above";
      return { id, side, tableW: Math.round(t.width), rows: dl.querySelectorAll("dt").length, clipped, empty };
    }),
  );
  const axis = await page.evaluate(() => {
    const txt = [...document.querySelectorAll("#wx-hourly svg text")].filter((x) => /^\d\d$/.test(x.textContent.trim()));
    return txt.length > 1 ? (Number(txt[0].getAttribute("x")) > Number(txt[1].getAttribute("x")) ? "right-to-left" : "left-to-right") : "?";
  });
  // hover changes the table
  const svg = page.locator("#wx-hourly svg").first();
  await svg.scrollIntoViewIfNeeded();
  const b = await svg.boundingBox();
  const first = await page.locator("#wx-hourly dd").first().textContent();
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height / 2);
  const hovered = await page.locator("#wx-hourly dd").first().textContent();
  let fs = null;
  if (width > 800) {
    await page.evaluate(() => document.querySelector("#wx-map")?.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(8000);
    await page.locator("#wx-map ul li button").first().click();
    const btn = page.locator("#wx-map .maplibregl-ctrl-fullscreen");
    const label = await btn.getAttribute("aria-label");
    await btn.click();
    await page.waitForTimeout(1200);
    const inFs = await page.evaluate(() => {
      const box = document.querySelector("#wx-map .maplibregl-ctrl-shrink")?.closest("[class*='flex-col gap-3']");
      const r = box?.getBoundingClientRect();
      const grid = box?.querySelector(".grid");
      const [tableCol, mapCol] = [grid?.children[0], grid?.children[1]].map((e) => e?.getBoundingClientRect());
      return {
        fullscreenApi: !!document.fullscreenElement,
        covers: r ? r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2 : false,
        table: tableCol && mapCol ? (tableCol.left > mapCol.left ? "table-right" : "table-left") : "?",
        mapH: mapCol ? Math.round(mapCol.height) : 0,
        attribution: !!document.querySelector("#wx-map .maplibregl-ctrl-attrib")?.offsetParent,
        toggles: box?.querySelectorAll("input[type=checkbox]").length,
        selectedKept: !!box?.querySelector("dl"),
        exitLabel: document.querySelector("#wx-map .maplibregl-ctrl-shrink")?.getAttribute("aria-label"),
      };
    });
    // Native fullscreen exits on Esc in the browser itself; headless Chromium does not deliver it, so also use the button.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    if (await page.locator("#wx-map .maplibregl-ctrl-shrink").count()) await page.locator("#wx-map .maplibregl-ctrl-shrink").click();
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => ({ restored: !document.querySelector("#wx-map .maplibregl-ctrl-shrink") && !document.fullscreenElement, selectedKept: !!document.querySelector("#wx-map dl") }));
    fs = { label, inFs, after };
  }
  console.log(JSON.stringify({ locale, width, theme, axis, hover: { first, hovered }, cards, fs, errors: errors.slice(0, 4) }));
  await page.close();
}
await browser.close();
