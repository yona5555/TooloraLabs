// Captures every tool's whole above-the-fold result panel (the first bordered,
// rounded card in [data-tool-result] of ToolAboveFold, not the extras below
// it), en locale, in both themes, into
// public/tool-previews/{slug}-light.png and {slug}-dark.png for the shared
// ToolCard image half (scaled to fit there, never cropped).
// Usage (dev or prod server running): node scripts/capture-tool-previews.mjs [baseUrl] [slug...]
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "../public/tool-previews");
const [baseUrl = "http://localhost:3000", ...only] = process.argv.slice(2);

const allSlugs = [...readFileSync(path.join(here, "../data/tools.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
const slugs = only.length ? only : allSlugs;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const failed = [];

for (const theme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 2000 }, deviceScaleFactor: 1.5, colorScheme: theme, reducedMotion: "reduce" });
  for (const slug of slugs) {
    const page = await context.newPage();
    try {
      await page.goto(`${baseUrl}/en/tools/${slug}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate((t) => localStorage.setItem("theme", t), theme);
      await page.reload({ waitUntil: "networkidle", timeout: 60000 });
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      if (isDark !== (theme === "dark")) throw new Error(`page did not switch to ${theme}`);
      await page.locator("[data-tool-result]").first().waitFor({ state: "visible", timeout: 30000 });
      await page.evaluate(() => {
        const root = document.querySelector("[data-tool-result]");
        const card = [...root.querySelectorAll("*")].find((el) => {
          const cs = getComputedStyle(el);
          return parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderTopLeftRadius) >= 8 && el.getBoundingClientRect().height >= 80;
        });
        (card ?? root).setAttribute("data-preview-target", "");
      });
      const panel = page.locator("[data-preview-target]").first();
      await page.waitForTimeout(800);
      const box = await panel.boundingBox();
      if (!box || box.height < 80) throw new Error("result panel empty");
      await panel.screenshot({ path: path.join(outDir, `${slug}-${theme}.png`), animations: "disabled" });
      console.log(`ok   ${theme} ${slug}`);
    } catch (e) {
      failed.push(`${slug} (${theme})`);
      console.log(`FAIL ${theme} ${slug}: ${e.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
}

await browser.close();
console.log(`\n${slugs.length * 2 - failed.length}/${slugs.length * 2} captured`);
if (failed.length) console.log(`failed: ${failed.join(", ")}`);
