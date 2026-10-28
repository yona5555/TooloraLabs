// Records (or checks) the pH calculator's article content: every paragraph/heading text, every
// link (href + text), the FAQ (questions + answers), Behind the Tool and references. Visual
// elements (figures, the old live widget, the new indicator cards) are excluded, so this proves
// the visual rebuild never changed a word of the explanation.
// Usage: node scripts/ph-calculator-content.mjs record | check
import { chromium } from "playwright";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "../../../artifacts/ph-calculator");
const FILE = path.join(DIR, "content-baseline.json");
mkdirSync(DIR, { recursive: true });

export async function readContent(page) {
  // Open every FAQ answer one by one (the accordion renders only the open one).
  const faq = [];
  const buttons = page.locator("#faq button[aria-expanded]");
  const n = await buttons.count();
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(i);
    if ((await b.getAttribute("aria-expanded")) !== "true") await b.click();
    const answer = await b.evaluate((el) => el.nextElementSibling?.textContent?.trim() ?? "");
    faq.push({ q: (await b.textContent()).trim(), a: answer });
  }
  const article = await page.evaluate(() => {
    const root = document.querySelector("[data-encyclopedia-paper]");
    // Ad slots are layout, not explanation: their "Sponsored" label is excluded (an extra slot may be added).
    const isAd = (el) => el.tagName === "P" && !!el.nextElementSibling?.className.includes("border-dashed");
    const skip = (el) => isAd(el) || !!el.closest("figure, [data-ph-visual], [data-ph-old-visual], #faq button, .not-italic");
    const texts = [...root.querySelectorAll("h2, h3, h4, p, li, th, td, dt, dd")]
      .filter((el) => !skip(el))
      .map((el) => el.textContent.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const links = [...root.querySelectorAll("a")].filter((el) => !skip(el)).map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() }));
    const ads = [...root.querySelectorAll("p")].filter(isAd).map((el) => el.textContent.trim());
    return { texts, links, ads };
  });
  return { ...article, faq };
}

export const BASELINE_FILE = FILE;
const isMain = process.argv[1]?.endsWith("ph-calculator-content.mjs");
const mode = process.argv[2] ?? "check";
const browser = isMain ? await chromium.launch() : null;
if (isMain) {
const out = {};
for (const locale of ["en", "ar"]) {
  const page = await browser.newPage();
  await page.goto(`${requireBase(process.env.BASE)}/${locale}/tools/ph-calculator`, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("[data-encyclopedia-paper]");
  out[locale] = await readContent(page);
  await page.close();
}
await browser.close();

if (mode === "record") {
  writeFileSync(FILE, JSON.stringify(out, null, 2));
  console.log(`recorded ${FILE}: en ${out.en.texts.length} texts, ${out.en.links.length} links, ${out.en.faq.length} faq`);
} else {
  const base = JSON.parse(readFileSync(FILE, "utf8"));
  let bad = 0;
  for (const locale of Object.keys(base)) {
    for (const k of ["texts", "links", "faq"]) {
      const a = JSON.stringify(base[locale][k]);
      const b = JSON.stringify(out[locale][k]);
      if (a !== b) {
        bad++;
        console.error(`FAIL: ${locale} ${k} differ`);
        const A = base[locale][k].map((x) => JSON.stringify(x));
        const B = out[locale][k].map((x) => JSON.stringify(x));
        console.error("  missing:", A.filter((x) => !B.includes(x)).slice(0, 5));
        console.error("  extra:", B.filter((x) => !A.includes(x)).slice(0, 5));
      } else console.log(`PASS: ${locale} ${k} identical (${base[locale][k].length})`);
    }
  }
  process.exit(bad ? 1 : 0);
}
}
