// Captures every tool's above-the-fold result panel ([data-tool-result] in
// ToolAboveFold) at one fixed size, light theme, en locale, into
// public/tool-previews/{slug}.png for the shared ToolCard image half.
// Usage (dev or prod server running): node scripts/capture-tool-previews.mjs [baseUrl] [slug...]
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "../public/tool-previews");
const [baseUrl = "http://localhost:3000", ...only] = process.argv.slice(2);
const SIZE = 416; // CSS px square = the result column's width at a 1440px viewport

const allSlugs = [...readFileSync(path.join(here, "../data/tools.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
const slugs = only.length ? only : allSlugs;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5, colorScheme: "light", reducedMotion: "reduce" });
await context.addInitScript(() => localStorage.setItem("theme", "light"));
const failed = [];

for (const slug of slugs) {
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/en/tools/${slug}`, { waitUntil: "networkidle", timeout: 60000 });
    const panel = page.locator("[data-tool-result]").first();
    await panel.waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(800);
    const box = await panel.boundingBox();
    if (!box || box.height < 80) throw new Error("result panel empty");
    await page.screenshot({ path: path.join(outDir, `${slug}.png`), clip: { x: box.x, y: box.y, width: SIZE, height: SIZE } });
    console.log(`ok   ${slug}`);
  } catch (e) {
    failed.push(slug);
    console.log(`FAIL ${slug}: ${e.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`\n${slugs.length - failed.length}/${slugs.length} captured`);
if (failed.length) console.log(`failed: ${failed.join(", ")}`);
