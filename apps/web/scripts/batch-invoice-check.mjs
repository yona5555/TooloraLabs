// Batch Invoice Calculator check: sample on load, live edits (add invoice, edit item, tax, currency),
// every indicator's values, CSV/XLSX exports, top-area gaps, console errors, optional screenshots.
// Usage: node apps/web/scripts/batch-invoice-check.mjs [outDir]   (screenshots only when outDir is given)
import { chromium } from "playwright";
import JSZip from "jszip";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = process.argv[2];
const browser = await chromium.launch();
const IND = ["line-items", "composition", "net-tax", "formula", "trend", "timeline", "clients", "concentration", "balance", "sensitivity", "vat-table", "currencies"];

async function open(locale, width, theme) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  await page.goto(`${BASE}/${locale}/tools/batch-invoice-calculator`, { waitUntil: "load" });
  await page.evaluate((t) => { localStorage.setItem("theme", t); localStorage.removeItem("toolora:batch-invoices:v2"); }, theme);
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector('[data-testid="grand-total"]');
  await page.waitForTimeout(1500);
  return page;
}

const read = (page) =>
  page.evaluate((ids) => {
    const q = (s) => document.querySelector(s);
    const txt = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    const out = {
      grand: q('[data-testid="grand-total"]')?.dataset.value,
      flowTotal: q('[data-testid="flow-total"]')?.dataset.value,
      flowTax: q('[data-testid="flow-tax"]')?.dataset.value,
      lineTotals: [...document.querySelectorAll('[data-testid="line-total"]')].map(txt),
    };
    for (const id of ids) {
      const card = document.getElementById(id);
      const dl = card?.querySelector("dl");
      out[id] = card ? { worked: dl ? [...dl.querySelectorAll("dd")].map(txt).join(" | ") : "(no worked table)", empty: !!card.textContent.match(/Add an invoice with at least/) } : "MISSING";
    }
    return out;
  }, IND);

const metrics = (page) =>
  page.evaluate(() => {
    const grid = document.getElementById("tool").firstElementChild;
    const r = (el) => el.getBoundingClientRect();
    const [inputCol, resultCol] = grid.children;
    const sidebarCol = grid.lastElementChild;
    const bottom = r(grid).bottom;
    const contentBottom = (el) => Math.max(...[...el.querySelectorAll("*")].filter((n) => n.children.length === 0 && r(n).height > 0).map((n) => r(n).bottom));
    const fill = document.querySelector('[data-testid="sidebar-fill"]');
    return {
      gridH: Math.round(r(grid).height),
      inputGap: Math.round(bottom - contentBottom(inputCol)),
      resultGap: Math.round(bottom - contentBottom(resultCol)),
      sidebarGap: getComputedStyle(sidebarCol).display === "none" ? "hidden" : Math.round(bottom - Math.max(contentBottom(sidebarCol), fill ? r(fill).bottom : 0)),
      docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

const page = await open("en", 1440, "light");
console.log("LOAD", JSON.stringify(await read(page), null, 1));
console.log("GAPS 1440", JSON.stringify(await metrics(page)));

// Edit an item: first line quantity 1 -> 2 (Website redesign 2400 -> 4800).
await page.locator('[data-testid="qty-input"]').first().fill("2");
await page.waitForTimeout(900);
const afterEdit = await read(page);
console.log("EDIT qty=2", afterEdit.lineTotals[0], afterEdit.flowTotal, afterEdit.grand);

// Change the tax rate of the selected invoice to 20.
await page.locator('[data-testid="tax-input"]').fill("20");
await page.waitForTimeout(900);
const afterTax = await read(page);
console.log("TAX 20", afterTax.flowTax, afterTax.flowTotal, afterTax.grand, "| trio:", afterTax.sensitivity.worked);

// Add an invoice with one item.
await page.click('[data-testid="add-invoice"]');
await page.locator('[data-testid="client-input"]').fill("Northwind Traders");
await page.locator('[data-testid="price-input"]').last().fill("500");
await page.waitForTimeout(900);
const afterAdd = await read(page);
console.log("ADD", afterAdd.grand, "| clients:", afterAdd.clients.worked, "| gauge:", afterAdd.concentration.worked);

// Currency to EUR.
await page.selectOption('[data-testid="currency-select"]', "EUR");
await page.waitForTimeout(900);
const afterCur = await read(page);
console.log("EUR", afterCur.grand, "| fx:", afterCur.currencies.worked);
console.log("ALL INDICATORS", JSON.stringify(afterCur, null, 1));

// Exports.
const [csvDl] = await Promise.all([page.waitForEvent("download"), page.click('[data-testid="export-csv"]')]);
const csv = fs.readFileSync(await csvDl.path(), "utf8");
console.log("CSV", csvDl.suggestedFilename(), csv.split("\r\n").length, "lines; first:", csv.split("\r\n")[0].slice(0, 90), "| last:", csv.split("\r\n").at(-1));
const [xDl] = await Promise.all([page.waitForEvent("download"), page.click('[data-testid="export-xlsx"]')]);
const zip = await JSZip.loadAsync(fs.readFileSync(await xDl.path()));
const s2 = await zip.file("xl/worksheets/sheet2.xml").async("string");
console.log("XLSX", xDl.suggestedFilename(), Object.keys(zip.files).length, "parts; summary rows:", (s2.match(/<row /g) ?? []).length, "| grand row:", s2.match(/<row r="\d+">(?:(?!<row).)*Grand total.*?<\/row>/)?.[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

// Persistence: reload keeps the edited batch.
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(1500);
console.log("RELOAD", (await read(page)).grand);
// Clear All, then Load Sample.
await page.click('[data-testid="clear-all"]');
await page.waitForTimeout(800);
console.log("CLEAR", (await read(page)).grand, await page.locator('[data-testid="empty-batch"]').count());
await page.click('[data-testid="load-sample"]');
await page.waitForTimeout(900);
console.log("SAMPLE", (await read(page)).grand);
console.log("ERRORS en", page.errors);

const ar = await open("ar", 1440, "light");
console.log("AR", JSON.stringify({ grand: (await read(ar)).grand, gaps: await metrics(ar), dir: await ar.evaluate(() => document.documentElement.dir) }), "ERRORS", ar.errors);
const mob = await open("en", 375, "light");
console.log("GAPS 375", JSON.stringify(await metrics(mob)));

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [locale, theme] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) {
    for (const width of [1440, 375]) {
      const p = await open(locale, width, theme);
      await p.screenshot({ path: `${outDir}/${locale}-${theme}-${width}.png`, fullPage: true });
      await p.context().close();
    }
  }
}
await browser.close();
