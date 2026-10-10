// History tape check: 3 calculations, delete one, grand total updates, persists on reload,
// click reuses; same for dice-roller. Screenshots of the scientific panel in en light/dark + ar light.
// Usage: node apps/web/scripts/history-tape-check.mjs outDir
import { chromium } from "playwright";
const S = process.argv[2];
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.setDefaultTimeout(120000);
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
const tape = () => p.evaluate(() => ({
  total: document.querySelector('[data-testid="tape-total"]')?.textContent,
  count: document.querySelector('[data-testid="tape-count"]')?.textContent,
  rows: [...document.querySelectorAll("[data-entry]")].map((r) => r.textContent),
}));
await p.goto(`${BASE}/en/tools/scientific-calculator`, { waitUntil: "load" });
await p.evaluate(() => localStorage.removeItem("tooloralabs:scientific-calculator-history"));
await p.reload({ waitUntil: "load" }); await p.waitForTimeout(2000);
for (const keys of ["12+30=", "7*8=", "100-12="]) { for (const k of keys) await p.keyboard.press(k === "=" ? "Enter" : k); await p.keyboard.press("Escape"); await p.waitForTimeout(150); }
console.log("AFTER 3:", JSON.stringify(await tape()));
await p.locator('[data-testid="tape-delete"]').nth(1).click(); await p.waitForTimeout(300);
console.log("AFTER DELETE:", JSON.stringify(await tape()));
await p.reload({ waitUntil: "load" }); await p.waitForTimeout(2000);
console.log("AFTER RELOAD:", JSON.stringify(await tape()));
await p.locator("[data-entry] button").first().click(); await p.waitForTimeout(300);
console.log("DISPLAY AFTER REUSE (expect 88):", (await p.locator('[data-tool-result]').textContent()).includes("88"));
const shot = async (name) => { const card = p.locator('[data-testid="history-tape"]').locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]"); await card.screenshot({ path: `${S}/${name}.png` }); };
await shot("tape-en-light");
await p.evaluate(() => localStorage.setItem("theme", "dark")); await p.reload({ waitUntil: "load" }); await p.waitForTimeout(2000); await shot("tape-en-dark");
await p.evaluate(() => localStorage.setItem("theme", "light"));
await p.goto(`${BASE}/ar/tools/scientific-calculator`, { waitUntil: "load" }); await p.waitForTimeout(2500); await shot("tape-ar-light");
// dice
await p.goto(`${BASE}/en/tools/dice-roller`, { waitUntil: "load" });
await p.evaluate(() => localStorage.removeItem("tooloralabs:dice-roller-history")); await p.reload({ waitUntil: "load" }); await p.waitForTimeout(2000);
const roll = p.getByRole("button", { name: /^roll/i }).first();
for (let i = 0; i < 3; i++) { await roll.click(); await p.waitForTimeout(1200); }
console.log("DICE 3:", JSON.stringify(await tape()));
await p.locator('[data-testid="tape-delete"]').first().click(); await p.waitForTimeout(300);
console.log("DICE DELETE:", JSON.stringify(await tape()));
await p.locator('[data-testid="tape-clear"]').click(); await p.waitForTimeout(300);
console.log("DICE CLEAR:", JSON.stringify(await tape()), errs);
await b.close();
