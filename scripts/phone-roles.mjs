/**
 * LOCKED phone card order (.claude/rules/visuals.md): scans every tool page at 390px and proposes each
 * card's SectionCard `phoneRole` — a card with a result action ([data-result-action]) → "output"; the
 * first other card with inputs (inputs, selects, sliders, keypad) → "input" (none when the input card
 * itself holds a result action: merged, it is card 1); otherwise the first chart/scene → "visual"
 * (with two output cards it leads the collapsed group: "visual-collapsed"). It prints every card whose
 * current role differs from the proposal (decide each ambiguous case by reading it, then set the role in
 * the source) and writes the phone card order map.
 * Usage: node scripts/phone-roles.mjs [base=http://localhost:3001] [locale=en] [--map scripts/output/card-order-map.txt]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const mi = argv.indexOf("--map");
const mapFile = mi >= 0 ? argv.splice(mi, 2)[1] : "scripts/output/card-order-map.txt";
const [base = "http://localhost:3001", loc = "en"] = argv;
const MARKETS = new Set(["crypto-converter", "forex-converter", "commodities-tracker"]);
const index = await (await fetch(`${base}/${loc}/tools`)).text();
const slugs = [...new Set([...index.matchAll(new RegExp(`href="/${loc}/tools/([a-z0-9-]+)"`, "g"))].map((m) => m[1]))].sort();

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const map = ["tool / card1 / card2 / card3 (phone 390px, screen order; [role]; * = holds a result action)"];
const diffs = [];
for (const slug of slugs) {
  const page = await ctx.newPage();
  await page.goto(`${base}/${loc}/tools/${slug}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(800);
  const cards = await page.evaluate(() => {
    const root = document.querySelector("[data-phone-flow]") || document.querySelector("main");
    return [...root.querySelectorAll("[data-card]")]
      .filter((c) => !c.parentElement.closest("[data-card]") && !c.closest('dialog,[role="dialog"]') && c.getClientRects().length)
      .map((c, dom) => ({
        dom,
        y: c.getBoundingClientRect().top,
        title: (c.querySelector("[data-card-header] :is(h2,h3)")?.textContent || c.querySelector("h2,h3")?.textContent || "?").trim().slice(0, 40),
        role: c.getAttribute("data-phone-role") || "",
        open: c.hasAttribute("data-fixed"),
        action: !!c.querySelector("[data-result-action]"),
        input: !!c.querySelector('input:not([type=hidden]),textarea,select,[role=slider],[data-keypad]'),
        visual: [...c.querySelectorAll("svg,canvas")].some((v) => v.getBoundingClientRect().width > 150 && v.getBoundingClientRect().height > 80),
      }));
  });
  await page.close();
  const screen = [...cards].sort((a, b) => a.y - b.y).filter((c) => c.open).slice(0, 3);
  map.push(`${slug} / ${screen.map((c) => `${c.action ? "*" : ""}${c.title} [${c.role || "-"}]`).join(" / ")}`);
  if (MARKETS.has(slug)) continue;
  const plan = new Map();
  const outs = cards.filter((c) => c.action);
  const firstInput = cards.find((c) => c.input);
  if (firstInput && !firstInput.action) plan.set(firstInput.dom, "input");
  for (const o of outs) plan.set(o.dom, "output");
  const vis = cards.find((c) => c.visual && !plan.has(c.dom));
  const nonMergedOuts = outs.filter((o) => !o.input).length;
  if (vis) plan.set(vis.dom, nonMergedOuts >= 2 && plan.size >= 3 ? "visual-collapsed" : "visual");
  for (const c of cards) {
    const want = plan.get(c.dom);
    if (want && want !== c.role) diffs.push(`${slug}: "${c.title}" is [${c.role || "-"}], proposal [${want}]`);
  }
}
await browser.close();
mkdirSync(path.dirname(mapFile), { recursive: true });
writeFileSync(mapFile, map.join("\n") + "\n");
console.log(`${slugs.length} tools; map → ${mapFile}; ${diffs.length} proposal(s) to review:`);
for (const d of diffs) console.log("  " + d);
