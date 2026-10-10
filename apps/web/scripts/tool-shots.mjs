// Full-page screenshots of one or more tools. Usage:
// node apps/web/scripts/tool-shots.mjs outDir slug[,slug] [combos]   combos e.g. "en-light-1440,en-dark-375"
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const [outDir, slugs, combos = "en-light-1440,en-dark-1440,ar-light-1440,en-light-375,en-dark-375,ar-light-375"] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {});
for (const slug of slugs.split(",")) {
  for (const c of combos.split(",")) {
    const [locale, theme, w] = c.split("-");
    const ctx = await browser.newContext({ viewport: { width: Number(w), height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    await page.goto(`${BASE}/${locale}/tools/${slug}`, { waitUntil: "load" });
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2500);
    // scroll through so reveal-on-scroll cards render
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(800);
    const f = `${outDir}/${slug}-${c}.png`;
    await page.screenshot({ path: f, fullPage: true });
    console.log(f, errs.length ? "ERR " + errs.join(" | ").slice(0, 200) : "");
    await ctx.close();
  }
}
await browser.close();
