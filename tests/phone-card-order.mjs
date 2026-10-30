/**
 * GUARD (LOCKED phone card order, .claude/rules/visuals.md): every tool page at 390px.
 * - At most 3 open cards (always-open, above ad 1).
 * - Every card holding a result action ([data-result-action]: Share / Export, Copy, Print, Download,
 *   Export, Save) has phoneRole "output" (open, above ad 1) or "output-secondary" (a long table or
 *   schedule: in the collapsible group with its buttons inside it, never open).
 * - The primary output card (the "output" card with Share / Export, else the first "output" card with an
 *   action) is place 2 among the open cards, or place 1 when it is merged with the input (no input card).
 * - With --ids: zero duplicate id attributes on the page.
 * - Pure CSS: the page is loaded a second time with JavaScript disabled, and its cards, docs row and
 *   ad 2 (the article's first ad slot) must come in the same screen order with the same open cards as
 *   with JavaScript (every tool, the markets tools included): the order and the open cards come from
 *   the server HTML alone, no script. (Ad 1's balance and the in-article ads are measured, not ordered.)
 * - Every article ad slot shares one parent (globals.css selects ad 2 as the slot with no slot before it).
 * The markets tools keep their approved order (live data first) and are skipped for the role checks.
 * Usage: node tests/phone-card-order.mjs [--ids] <base, e.g. http://localhost:3110> [locale=en] [slug...]
 */
import { chromium } from "playwright";
import { requireBase } from "../scripts/lib/require-base.mjs";

const argv = process.argv.slice(2);
const checkIds = argv.includes("--ids");
const [rawBase, loc = "en", ...only] = argv.filter((a) => a !== "--ids");
const base = requireBase(rawBase);
const MARKETS = new Set(["crypto-converter", "forex-converter", "commodities-tracker"]);

const index = await (await fetch(`${base}/${loc}/tools`)).text();
const slugs = only.length ? only : [...new Set([...index.matchAll(new RegExp(`href="/${loc}/tools/([a-z0-9-]+)"`, "g"))].map((m) => m[1]))];
if (slugs.length < 90 && !only.length) throw new Error(`only ${slugs.length} tool links found on /${loc}/tools`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const noJs = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
const fails = [];
/** The phone flow's cards, docs row and ad 2 in screen order: "open|closed role title" per card. */
const screenOrder = () => {
  const root = document.querySelector("[data-phone-flow]");
  if (!root) return null;
  const title = (c) => (c.querySelector("[data-card-header] :is(h2,h3)")?.textContent || c.querySelector("h2,h3")?.textContent || "?").trim().slice(0, 40);
  const ad2 = root.querySelector("[data-phone-article] [data-article-ad]");
  const items = [...root.querySelectorAll("[data-card], [data-phone-docs]"), ...(ad2 ? [ad2] : [])]
    .filter((c) => !c.parentElement.closest("[data-card]") && !c.closest('dialog,[role="dialog"]') && c.getClientRects().length)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return items.map((c) => (c === ad2 ? "ad 2" : c.hasAttribute("data-phone-docs") ? "docs row" : `${c.hasAttribute("data-fixed") ? "open" : "closed"} ${c.getAttribute("data-phone-role") || "-"} ${title(c)}`));
};
for (const slug of slugs) {
  const page = await ctx.newPage();
  await page.goto(`${base}/${loc}/tools/${slug}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(([markets, checkIds]) => {
    const out = [];
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    if (checkIds && dup.length) out.push(`duplicate ids: ${dup.slice(0, 8).join(", ")}`);
    const slots = [...document.querySelectorAll("[data-phone-cards] [data-article-ad]")].filter((s) => !s.closest("[data-card]"));
    if (new Set(slots.map((s) => s.parentElement)).size > 1 || slots.some((s) => !s.closest("[data-phone-article]"))) out.push("article ad slots are not siblings inside the article (ad 2 is picked by CSS)");
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
    if (open.length > 3) out.push(`${open.length} open cards (max 3): ${open.map(title).join(" / ")}`);
    const role = (c) => c.getAttribute("data-phone-role") || "";
    const withAction = cards.filter((c) => c.querySelector("[data-result-action]"));
    for (const c of withAction) {
      if (!/^output(-secondary)?$/.test(role(c))) out.push(`"${title(c)}" has a result action but phoneRole="${role(c)}"`);
    }
    for (const c of cards) {
      if (role(c) === "output" && !open.includes(c)) out.push(`output "${title(c)}" is collapsed or after ad 1`);
      if (role(c) === "output-secondary" && open.includes(c)) out.push(`secondary output "${title(c)}" is open (it belongs to the collapsible group)`);
    }
    const primary = withAction.filter((c) => role(c) === "output");
    const main = primary.find((c) => c.querySelector('[data-result-action="share"]')) || primary[0];
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
  const withJs = await page.evaluate(screenOrder);
  await page.close();
  const bare = await noJs.newPage();
  await bare.goto(`${base}/${loc}/tools/${slug}`, { waitUntil: "load", timeout: 120000 });
  const withoutJs = await bare.evaluate(screenOrder);
  await bare.close();
  if (JSON.stringify(withJs) !== JSON.stringify(withoutJs)) {
    const i = (withJs || []).findIndex((x, k) => x !== (withoutJs || [])[k]);
    fails.push(`${slug}: order differs with JavaScript disabled at item ${i + 1}: JS "${withJs?.[i]}" vs no-JS "${withoutJs?.[i]}"`);
  }
}
await browser.close();
console.log(`phone card order: ${slugs.length} tools checked, ${fails.length} failure(s)`);
for (const f of fails) console.log("  FAIL " + f);
process.exit(fails.length ? 1 : 0);
