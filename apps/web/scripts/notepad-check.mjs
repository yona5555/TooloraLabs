// Notepad Calculator check: sample on load, live edits, snippet switch, what-if drag + apply,
// every indicator's worked-example values, top-area column heights, console errors, optional screenshots.
// Usage: BASE_URL=http://localhost:3103 node apps/web/scripts/notepad-check.mjs [outDir]
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = process.argv[2];
const browser = await chromium.launch(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {});
const IND = ["line-values", "composition", "variables", "steps", "formula", "dependencies", "what-if", "sensitivity", "impact", "timeline", "magnitude", "rounding"];

async function open(locale, width, theme) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  await page.goto(`${BASE}/${locale}/tools/notepad-calculator`, { waitUntil: "load" });
  await page.evaluate((t) => localStorage.setItem("theme", t), theme);
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector('[data-testid="bottom-line"]');
  await page.waitForTimeout(1500);
  return page;
}

const read = (page) =>
  page.evaluate((ids) => {
    const txt = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    const out = { bottom: txt(document.querySelector('[data-testid="bottom-line"]')), labX: txt(document.querySelector('[data-testid="lab-x"]')), labY: txt(document.querySelector('[data-testid="lab-y"]')) };
    for (const id of ids) {
      const card = document.getElementById(id);
      const dl = card?.querySelector("dl");
      out[id] = card ? (dl ? [...dl.querySelectorAll("dd")].map(txt).join(" | ") : txt(card).slice(0, 80)) : "MISSING";
    }
    return out;
  }, IND);

const setText = async (page, text) => {
  await page.fill('[data-testid="notepad-input"]', text);
  await page.waitForTimeout(900);
};

const page = await open("en", 1440, "light");
console.log("ON LOAD", JSON.stringify(await read(page), null, 1));

const sample = await page.inputValue('[data-testid="notepad-input"]');
await setText(page, sample.replace("months = 5", "months = 10"));
const r2 = await read(page);
console.log("months=10 →", r2.bottom, "| trend:", r2["line-values"], "| trio:", r2.sensitivity);

await page.click('[data-testid="snippet-loan"]');
await page.waitForTimeout(900);
const r3 = await read(page);
console.log("LOAN →", r3.bottom, "| steps:", r3.steps, "| impact:", r3.impact);

await page.click('[data-testid="snippet-trip"]');
await page.waitForTimeout(900);

// Drag the what-if point and read the values while the mouse is still down.
const lab = page.locator('[data-testid="ind-lab"]');
await lab.scrollIntoViewIfNeeded();
const handle = lab.locator(".mafs-movable-point").first();
const box = await handle.boundingBox();
const before = await read(page);
if (box) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 120, cy, { steps: 8 });
  const during = await read(page);
  await page.mouse.up();
  console.log("DRAG before:", before.labX, before.labY, "| during:", during.labX, during.labY, "| worked:", during["what-if"]);
} else console.log("DRAG: movable point not found");
await page.click('[data-testid="lab-apply"]');
await page.waitForTimeout(900);
const after = await read(page);
console.log("APPLY → note now has:", (await page.inputValue('[data-testid="notepad-input"]')).split("\n").find((l) => l.startsWith("months")), "| bottom:", after.bottom);

await page.click('[data-testid="snippet-trip"]');
await page.waitForTimeout(600);
await page.click('[data-testid="tweak-up-months"]');
await page.waitForTimeout(1200);
console.log("TWEAK months +10% → note:", (await page.inputValue('[data-testid="notepad-input"]')).split("\n").find((l) => l.startsWith("months")), "| bottom:", (await read(page)).bottom);

await setText(page, "0.1 + 0.2");
console.log("0.1+0.2 rounding:", (await read(page)).rounding);
console.log("errors:", page.errors.slice(0, 5));
await page.context().close();

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [locale, theme] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) {
    for (const width of [1440, 375]) {
      const p = await open(locale, width, theme);
      const cols = await p.evaluate(() => {
        const grid = document.querySelector("[data-tool-result]")?.parentElement;
        return grid ? [...grid.children].map((c) => Math.round(c.getBoundingClientRect().height)) : [];
      });
      const file = `${outDir}/notepad-${locale}-${theme}-${width}.png`;
      await p.screenshot({ path: file, fullPage: true });
      console.log("shot", file, "top columns", cols.join("/"), "errors", p.errors.length);
      await p.context().close();
    }
  }
}
await browser.close();
