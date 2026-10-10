// Scans side-by-side indicator rows (visual + table) and reports height mismatches (vertical gaps).
// Usage: node apps/web/scripts/card-gap-scan.mjs slug [width]
import { chromium } from "playwright";
const [slug, W = "1440"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: Number(W), height: 900 } })).newPage();
await p.goto(`http://localhost:3000/en/tools/${slug}`, { waitUntil: "load" });
await p.waitForTimeout(2500);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } });
const out = await p.evaluate(() => {
  const res = [];
  for (const row of document.querySelectorAll("div")) {
    const cs = getComputedStyle(row);
    if (cs.display !== "flex" || cs.flexDirection !== "row" || row.children.length !== 2) continue;
    const [a, c] = [...row.children].map((e) => e.getBoundingClientRect());
    if (a.width < 150 || c.width < 150) continue;
    const gap = Math.round(Math.abs(a.height - c.height));
    if (gap < 30) continue;
    const card = row.closest("[id]");
    res.push({ card: card?.id, visual: Math.round(a.height), table: Math.round(c.height), gap, y: Math.round(a.top + scrollY) });
  }
  return res;
});
console.log(JSON.stringify(out, null, 0));
await b.close();
