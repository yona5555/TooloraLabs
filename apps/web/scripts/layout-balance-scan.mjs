// Conditional layout rule scan (no screenshots): for every tool page, read each drawing+table card's
// final mode (data-split), and check LiveTable3DLayout cards for a drawing
// much taller than its table. Usage: node scripts/layout-balance-scan.mjs [slug ...] > out.json
import { readFileSync } from "node:fs";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { chromium } from "playwright";
const base = requireBase(process.env.BASE);
const locale = process.env.LOCALE ?? "en";
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : [...readFileSync(new URL("../data/tools.ts", import.meta.url), "utf8").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
const browser = await chromium.launch();
const out = [];
for (const slug of slugs) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(`${base}/${locale}/tools/${slug}`, { waitUntil: "load", timeout: 60000 });
    for (let y = 0; y < 30; y++) {
      const done = await page.evaluate(() => {
        window.scrollBy(0, 900);
        return window.scrollY + window.innerHeight >= document.body.scrollHeight - 5;
      });
      await page.waitForTimeout(120);
      if (done) break;
    }
    await page.waitForTimeout(1500);
    const cards = await page.evaluate(() => {
      const title = (el) => el.closest("[data-bp-panel]")?.querySelector("h2,h3")?.textContent.trim() ?? el.closest("section,div")?.querySelector("h2,h3,h4")?.textContent.trim() ?? "?";
      const splits = [...document.querySelectorAll("[data-split]:not([data-split=lt3d])")].map((el) => ({ kind: "split", title: title(el), mode: el.dataset.split }));
      const lt = [...document.querySelectorAll("[data-split=lt3d]")].map((el) => {
        const grid = el.firstElementChild;
        const [a, b] = [grid?.children[0], grid?.children[1]];
        if (!a || !b) return { kind: "lt3d", title: title(el), mode: "?" };
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const side = Math.abs(ra.top - rb.top) < 4 && ra.left !== rb.left;
        const tableH = a.querySelector("table")?.getBoundingClientRect().height ?? 0;
        return { kind: "lt3d", title: title(el), mode: side ? "side" : "stacked", ratio: side ? +(rb.height / Math.max(1, tableH)).toFixed(2) : 0 };
      });
      return [...splits, ...lt];
    });
    out.push({ slug, cards, errors: errors.length });
  } catch (e) {
    out.push({ slug, error: String(e).slice(0, 120) });
  }
  await page.close();
}
await browser.close();
console.log(JSON.stringify(out));
