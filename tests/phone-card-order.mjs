/**
 * GUARD (LOCKED phone card order, .claude/rules/visuals.md): every tool page at 390px.
 * - Every card holding a result action ([data-result-action]: Share / Export, Copy, Print, Download,
 *   Export, Save) has phoneRole "output", is open and sits above ad 1 — never collapsed, never after it.
 * - The main output card (the one with Share / Export, else the first output card with an action) is
 *   place 2 among the open cards, or place 1 when it is merged with the input (no input card).
 * - With --ids: zero duplicate id attributes on the page (not in CI yet: the PhoneMini copies still
 *   repeat the React useId of their original on 11 tools; see the LOCKED rule's open item).
 * The markets tools keep their approved order (live data first) and are skipped for the order checks.
 * Usage: node tests/phone-card-order.mjs [--ids] [base=http://localhost:3001] [locale=en] [slug...]
 */
import { chromium } from "playwright";

const argv = process.argv.slice(2);
const checkIds = argv.includes("--ids");
const [base = "http://localhost:3001", loc = "en", ...only] = argv.filter((a) => a !== "--ids");
const MARKETS = new Set(["crypto-converter", "forex-converter", "commodities-tracker"]);

const index = await (await fetch(`${base}/${loc}/tools`)).text();
const slugs = only.length ? only : [...new Set([...index.matchAll(new RegExp(`href="/${loc}/tools/([a-z0-9-]+)"`, "g"))].map((m) => m[1]))];
if (slugs.length < 90 && !only.length) throw new Error(`only ${slugs.length} tool links found on /${loc}/tools`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const fails = [];
for (const slug of slugs) {
  const page = await ctx.newPage();
  await page.goto(`${base}/${loc}/tools/${slug}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(([markets, checkIds]) => {
    const out = [];
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    if (checkIds && dup.length) out.push(`duplicate ids: ${dup.slice(0, 8).join(", ")}`);
    if (markets) return out;
    const root = document.querySelector("[data-phone-flow]");
    if (!root) return ["no [data-phone-flow]"];
    const title = (c) => (c.querySelector("[data-card-header] :is(h2,h3)")?.textContent || c.querySelector("h2,h3")?.textContent || "?").trim().slice(0, 40);
    const cards = [...root.querySelectorAll("[data-card]")]
      .filter((c) => !c.parentElement.closest("[data-card]") && !c.closest('dialog,[role="dialog"]') && c.getClientRects().length)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    const ad1 = root.querySelector("[data-phone-docs]");
    const adTop = ad1 ? ad1.getBoundingClientRect().top : Infinity;
    const open = cards.filter((c) => c.hasAttribute("data-fixed") && c.getBoundingClientRect().top < adTop);
    const withAction = cards.filter((c) => c.querySelector("[data-result-action]"));
    for (const c of withAction) {
      if (c.getAttribute("data-phone-role") !== "output") out.push(`"${title(c)}" has a result action but phoneRole="${c.getAttribute("data-phone-role") || ""}"`);
      if (!open.includes(c)) out.push(`"${title(c)}" has a result action but is collapsed or after ad 1`);
    }
    const main = withAction.find((c) => c.querySelector('[data-result-action="share"]')) || withAction[0];
    if (main) {
      const place = open.indexOf(main) + 1;
      const merged = !cards.some((c) => c.getAttribute("data-phone-role") === "input");
      const first = open[0]?.getAttribute("data-phone-role");
      const ok = place === 1 ? merged : place === 2 && (first === "input" || first === "output");
      if (!ok) out.push(`main output "${title(main)}" is open card ${place || "none"} (want 2, or 1 when merged with the input)`);
    }
    return out;
  }, [MARKETS.has(slug), checkIds]);
  for (const f of r) fails.push(`${slug}: ${f}`);
  await page.close();
}
await browser.close();
console.log(`phone card order: ${slugs.length} tools checked, ${fails.length} failure(s)`);
for (const f of fails) console.log("  FAIL " + f);
process.exit(fails.length ? 1 : 0);
