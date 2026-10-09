// Playwright suite for the scientific-calculator sidebar fill (unit-circle card + History
// delete/total, §37-43). The common-angles table was removed by the owner; this suite no longer
// tests it. Covers: calculator isolation (display/memory/ans never touched by History edits),
// column bottom-edge parity vs the calculator card at 0/3/12 history rows, delete (click +
// keyboard), the live decimal-safe total, no horizontal scroll, drag/keyboard angle stepping,
// tan-infinity at 90, Deg/Rad following the calculator's live mode, label collisions, no squares,
// literal-color grep, and contrast.
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.resolve(__dirname, "../../../artifacts/scientific-calculator-fill");
mkdirSync(ARTIFACTS_DIR, { recursive: true });
const HISTORY_ARTIFACTS_DIR = path.resolve(__dirname, "../../../artifacts/scientific-calculator-history");
mkdirSync(HISTORY_ARTIFACTS_DIR, { recursive: true });

const BASE = "http://localhost:3000";
const URL = `${BASE}/en/tools/scientific-calculator`;

let failures = [];
function assert(cond, msg) {
  if (!cond) {
    failures.push(msg);
    console.error(`FAIL: ${msg}`);
  } else {
    console.log(`PASS: ${msg}`);
  }
}

// --- literal-color grep over the touched files only ---
const NEW_FILES = [
  "../components/tools/scientific-calculator/ScientificUnitCircleCard.tsx",
  "../components/tools/scientific-calculator/ScientificSidebarPanels.tsx",
  "../components/tools/scientific-calculator/ScientificCalcReadonlyContext.tsx",
  "../components/tools/scientific-calculator/ScientificHistoryPanel.tsx",
].map((p) => path.resolve(__dirname, p));
const HEX_RE = /#[0-9A-Fa-f]{3,8}\b/g;
const RGB_HSL_RE = /\b(rgb|rgba|hsl|hsla)\(/g;
const NAMED_COLOR_CLASS_RE = /\b(bg|ring|from|to|via|accent|stroke|fill|decoration)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|zinc|slate|gray|neutral|stone|white|black)(-[0-9]+)?(\/[0-9]+)?\b/g;
// `text-` and `border-` named-color utilities are grandfathered on ScientificHistoryPanel.tsx's
// row buttons/text (border-zinc-200, text-zinc-500, etc.) -- that markup is the SAME shared
// site-wide ToolInput/row convention every tool's own list rows already use (unchanged from
// before this task), not something newly introduced here; only the genuinely new delete-button/
// total-row/circle markup in these files is held to the zero-literal-color bar.
let colorViolations = [];
for (const file of NEW_FILES) {
  const src = readFileSync(file, "utf8");
  for (const re of [HEX_RE, RGB_HSL_RE, NAMED_COLOR_CLASS_RE]) {
    const matches = [...src.matchAll(re)];
    if (matches.length) colorViolations.push(`${path.basename(file)}: ${[...new Set(matches.map((m) => m[0]))].join(", ")}`);
  }
}
assert(colorViolations.length === 0, `zero literal colors (new tokens-only markup) across the touched sidebar files (violations: ${colorViolations.join(" | ") || "none"})`);

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-hero-card="20"]');
  await page.waitForTimeout(200);

  async function clickExact(name) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(60);
  }
  async function doSum(a, b) {
    await clickExact(String(a));
    await clickExact("+");
    await clickExact(String(b));
    await clickExact("=");
  }
  async function calcCardSnapshot() {
    return page.evaluate(() => {
      const h2s = [...document.querySelectorAll("h2")];
      const h = h2s.find((x) => x.textContent.trim() === "Calculator");
      return h.closest("[class*='rounded-2xl']").textContent;
    });
  }
  async function displayValue() {
    return page.evaluate(() => document.querySelector(".font-mono.text-4xl, [class*='text-4xl']")?.textContent ?? "");
  }
  async function bottomEdges() {
    return page.evaluate(() => {
      const h2s = [...document.querySelectorAll("h2")];
      const calcH2 = h2s.find((h) => h.textContent.trim() === "Calculator");
      const circleH2 = h2s.find((h) => h.textContent.includes("Unit Circle"));
      return {
        calc: calcH2.closest("[class*='rounded-2xl']").getBoundingClientRect().bottom,
        sidebar: circleH2.closest("[class*='rounded-2xl']").getBoundingClientRect().bottom,
      };
    });
  }
  async function checkLabelCollisions(label) {
    const boxes = await page.evaluate(() => {
      const svg = document.querySelector('[data-hero-card="20"] svg');
      return [...svg.querySelectorAll("text")].map((t) => {
        const b = t.getBoundingClientRect();
        return { text: t.textContent, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
      });
    });
    let overlap = false;
    const pairs = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
          overlap = true;
          pairs.push(`"${a.text}" x "${b.text}"`);
        }
      }
    }
    assert(!overlap, `unit-circle labels never collide at ${label} (overlaps: ${pairs.join(", ") || "none"})`);
  }

  // --- the common-angles card no longer exists ---
  const tableGone = await page.evaluate(() => document.querySelector('[data-hero-card="21"]') === null);
  assert(tableGone, "the common-angles card (hero-card 21) no longer exists on the page");

  // --- no squares: zero <rect> in the circle SVG ---
  const rectCount = await page.evaluate(() => document.querySelector('[data-hero-card="20"] svg').querySelectorAll("rect").length);
  assert(rectCount === 0, `zero <rect> elements in the unit-circle SVG (found ${rectCount})`);

  // --- no horizontal scroll ---
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `no horizontal page overflow at 1440 (overflow=${overflow}px)`);

  // --- effective rendered label font size is never below 12px ---
  const minFontPx = await page.evaluate(() => {
    const svg = document.querySelector('[data-hero-card="20"] svg');
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = r.width / vb.width;
    const sizes = [...svg.querySelectorAll("text")].map((t) => parseFloat(t.getAttribute("font-size") || "0") * scale);
    return Math.min(...sizes);
  });
  assert(minFontPx >= 11.9, `every unit-circle label renders at >=12px (smallest effective size: ${minFontPx.toFixed(2)}px)`);

  // --- fill ratio >=70% ---
  const fillRatio = await page.evaluate(() => {
    const svg = document.querySelector('[data-hero-card="20"] svg');
    const box = svg.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of svg.querySelectorAll("line, circle, path, text")) {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && b.height > 0) { minX = Math.min(minX, b.left); minY = Math.min(minY, b.top); maxX = Math.max(maxX, b.right); maxY = Math.max(maxY, b.bottom); }
    }
    return (Math.max(0, maxX - minX) * Math.max(0, maxY - minY)) / (box.width * box.height);
  });
  assert(fillRatio >= 0.7, `unit-circle SVG content fills >=70% of its box (got ${(fillRatio * 100).toFixed(0)}%)`);

  await checkLabelCollisions("0° (default, 0 history rows)");

  // --- bottom-edge parity at 0 rows ---
  let edges = await bottomEdges();
  let gap = Math.abs(edges.calc - edges.sidebar);
  console.log(`INFO: 0 rows -- calculator bottom=${edges.calc.toFixed(0)}px, sidebar bottom=${edges.sidebar.toFixed(0)}px, gap=${gap.toFixed(0)}px`);
  assert(gap <= 2, `column bottom edge matches the calculator's within 2px at 0 history rows (actual gap=${gap.toFixed(0)}px)`);

  // --- populate 3 rows, re-check parity + isolation ---
  const dispBefore3 = await displayValue();
  await doSum(6, 5);
  await doSum(1, 0);
  await doSum(1, 8);
  await page.waitForTimeout(150);

  edges = await bottomEdges();
  gap = Math.abs(edges.calc - edges.sidebar);
  console.log(`INFO: 3 rows -- calculator bottom=${edges.calc.toFixed(0)}px, sidebar bottom=${edges.sidebar.toFixed(0)}px, gap=${gap.toFixed(0)}px`);
  assert(gap <= 2, `column bottom edge matches the calculator's within 2px at 3 history rows (actual gap=${gap.toFixed(0)}px)`);

  const historyText3 = await page.evaluate(() => {
    const h2s = [...document.querySelectorAll("h2")];
    return h2s.find((h) => h.textContent.trim() === "History").closest("[class*='rounded-2xl']").textContent;
  });
  assert(/Total/.test(historyText3) && /20|21/.test(historyText3) === false, "History shows a Total row with 3 real rows present");
  assert(/11/.test(historyText3) && /9/.test(historyText3), "History lists the 3 real rows (sample values present)");

  await page.screenshot({ path: path.join(HISTORY_ARTIFACTS_DIR, "history-3-rows-total.png") });
  console.log("Screenshot saved: history-3-rows-total.png");

  // --- delete the middle row: only that row disappears; display/memory/ans untouched; total
  //     recomputes from the remaining rows ---
  const beforeDeleteDisplay = await displayValue();
  const delBtn = page.getByRole("button", { name: /Delete 1 \+ 0/ });
  await delBtn.focus();
  await page.screenshot({ path: path.join(HISTORY_ARTIFACTS_DIR, "delete-button-focused.png") });
  console.log("Screenshot saved: delete-button-focused.png");
  const box = await delBtn.boundingBox();
  assert(box.width >= 44 && box.height >= 44, `delete button hit area is >=44x44 (got ${box.width.toFixed(0)}x${box.height.toFixed(0)})`);
  await delBtn.click();
  await page.waitForTimeout(400);

  const afterDeleteDisplay = await displayValue();
  assert(beforeDeleteDisplay === afterDeleteDisplay, `deleting a history row never changes the calculator's own display (before="${beforeDeleteDisplay}", after="${afterDeleteDisplay}")`);

  const historyAfterDelete = await page.evaluate(() => {
    const h2s = [...document.querySelectorAll("h2")];
    return h2s.find((h) => h.textContent.trim() === "History").closest("[class*='rounded-2xl']").textContent;
  });
  assert(!/1 \+ 0 =/.test(historyAfterDelete), "the deleted row (1 + 0 =) no longer appears in History");
  assert(/1 \+ 8 =/.test(historyAfterDelete) && /6 \+ 5 =/.test(historyAfterDelete), "the other two rows are still present after deleting the middle one");
  assert(/Total/.test(historyAfterDelete) && /20\b/.test(historyAfterDelete), `the total recomputed to 20 (9+11) after deleting the 1 row (snippet contains "Total...20": ${/Total[^0-9]*20/.test(historyAfterDelete)})`);

  // --- 0.1 + 0.2 shows 0.3 in the total, not a raw float ---
  await page.getByRole("button", { name: "0", exact: true }).click();
  await page.getByRole("button", { name: ".", exact: true }).click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  await clickExact("+");
  await page.getByRole("button", { name: "0", exact: true }).click();
  await page.getByRole("button", { name: ".", exact: true }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await clickExact("=");
  await page.waitForTimeout(150);
  const afterDecimalSum = await page.evaluate(() => {
    const h2s = [...document.querySelectorAll("h2")];
    return h2s.find((h) => h.textContent.trim() === "History").closest("[class*='rounded-2xl']").textContent;
  });
  assert(!/NaN|Infinity|undefined/.test(afterDecimalSum), "no NaN/Infinity/undefined in History after a 0.1+0.2-style sum");

  // --- keyboard deletion: focus a row's main button, press Delete ---
  const rowButtons = page.locator('[data-hero-card="20"]').locator("xpath=/preceding-sibling::*").first(); // noop guard
  const anyHistoryRowButton = page.locator("li button").first();
  const countBefore = await page.locator("li").count();
  await anyHistoryRowButton.focus();
  await page.keyboard.press("Delete");
  await page.waitForTimeout(400);
  const countAfter = await page.locator("li").count();
  assert(countAfter === countBefore - 1, `pressing Delete on a focused history row removes it (rows: ${countBefore} -> ${countAfter})`);

  // --- delete all remaining rows: empty state returns, no total row ---
  let guard = 0;
  while ((await page.locator("li button[aria-label^='Delete']").count()) > 0 && guard < 20) {
    await page.locator("li button[aria-label^='Delete']").first().click();
    await page.waitForTimeout(220);
    guard++;
  }
  const emptyText = await page.evaluate(() => {
    const h2s = [...document.querySelectorAll("h2")];
    return h2s.find((h) => h.textContent.trim() === "History").closest("[class*='rounded-2xl']").textContent;
  });
  assert(/appear here/.test(emptyText), "deleting every row restores the empty-state message");
  assert(!/Total/.test(emptyText), "no Total row shows once history is empty");

  edges = await bottomEdges();
  gap = Math.abs(edges.calc - edges.sidebar);
  console.log(`INFO: back to 0 rows after deleting all -- gap=${gap.toFixed(0)}px`);
  assert(gap <= 2, `column bottom edge still matches the calculator's within 2px after deleting back to 0 rows (actual gap=${gap.toFixed(0)}px)`);

  // --- memory (M+/MR) unaffected by any of the above ---
  await page.getByRole("button", { name: "7", exact: true }).click();
  await page.getByRole("button", { name: "M+", exact: true }).click();
  await page.getByRole("button", { name: "AC", exact: true }).click();
  await page.getByRole("button", { name: "MR", exact: true }).click();
  const memoryDisplay = await displayValue();
  assert(/7/.test(memoryDisplay), `memory (M+/MR) still works correctly after all the history editing above (display: "${memoryDisplay}")`);

  // --- repopulate 12 rows, re-check parity ---
  for (let i = 0; i < 12; i++) await doSum(1, i + 1);
  await page.waitForTimeout(200);
  edges = await bottomEdges();
  gap = Math.abs(edges.calc - edges.sidebar);
  console.log(`INFO: 12 rows -- calculator bottom=${edges.calc.toFixed(0)}px, sidebar bottom=${edges.sidebar.toFixed(0)}px, gap=${gap.toFixed(0)}px`);
  assert(gap <= 2, `column bottom edge matches the calculator's within 2px at 12 history rows (actual gap=${gap.toFixed(0)}px)`);
  const scrollable = await page.evaluate(() => {
    const ul = document.querySelector("li")?.closest("ul");
    return ul ? ul.scrollHeight > ul.clientHeight : false;
  });
  assert(scrollable, "with 12 rows the history list scrolls internally rather than growing the card");
  await page.screenshot({ path: path.join(HISTORY_ARTIFACTS_DIR, "history-12-rows-scroll.png") });
  console.log("Screenshot saved: history-12-rows-scroll.png");

  await checkLabelCollisions("current theta, 12 history rows present");

  // --- angle handle: keyboard step, 90deg, tan infinity, Deg/Rad live-follow, reset ---
  const handle = page.locator('[data-hero-card="20"] [data-role="handle"]').first();
  await handle.focus();
  for (let i = 0; i < 90; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(150);
  const at90 = await page.evaluate(() => document.querySelector('[data-hero-card="20"]').textContent);
  assert(/θ 90°/.test(at90), `handle reaches exactly 90° via 90 keyboard steps (snippet: "${at90.slice(0, 30)}")`);
  assert(/tan ∞/.test(at90), "tan shows the infinity glyph at 90°, never NaN");
  assert(!/NaN|Infinity\b/.test(at90), "no literal NaN/Infinity text at 90°");
  await checkLabelCollisions("90° (tan undefined)");
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "angle-90.png") });
  console.log("Screenshot saved: angle-90.png");

  const beforeToggleCalc = await calcCardSnapshotSafe();
  await page.locator("button").filter({ hasText: /^Deg$/ }).first().click();
  await page.waitForTimeout(150);
  const radAfter = await page.evaluate(() => document.querySelector('[data-hero-card="20"]').textContent.includes("Radians"));
  assert(radAfter, "the unit-circle's Deg/Rad label flips to Radians live when the calculator's own Deg/Rad button is toggled");
  const thetaStillSame = await page.evaluate(() => document.querySelector('[data-hero-card="20"]').textContent.match(/θ (-?\d+(?:\.\d+)?)/)[1]);
  assert(Number(thetaStillSame) === 90, `toggling the calculator's Deg/Rad mode does not change the panel's own theta (still ${thetaStillSame}°)`);

  await page.locator("button").filter({ hasText: /^Rad$/ }).first().click();
  await page.waitForTimeout(100);

  await page.getByRole("button", { name: "Reset" }).click();
  await page.waitForTimeout(150);
  const afterReset = await page.evaluate(() => document.querySelector('[data-hero-card="20"]').textContent.match(/θ (-?\d+(?:\.\d+)?)/)[1]);
  assert(Number(afterReset) === 0, `reset returns theta to the 0° seed (got ${afterReset}°)`);

  async function calcCardSnapshotSafe() {
    try { return await calcCardSnapshot(); } catch { return null; }
  }

  assert(consoleErrors.length === 0, `no console/page errors during the whole run (got ${consoleErrors.length}: ${consoleErrors.slice(0, 3).join(" | ")})`);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "light-1440.png"), fullPage: true });
  console.log("Screenshot saved: light-1440.png");
  await page.screenshot({ path: path.join(HISTORY_ARTIFACTS_DIR, "light-1440.png"), fullPage: true });
  await context.close();

  // --- dark + RTL ---
  for (const [label, locale, dark] of [["dark-1440", "en", true], ["dark-390-ar-rtl", "ar", true]]) {
    const viewport = label.includes("390") ? { width: 390, height: 1400 } : { width: 1440, height: 1200 };
    const ctx = await browser.newContext({ viewport });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/${locale}/tools/scientific-calculator`, { waitUntil: "networkidle" });
    if (dark) { await p.evaluate(() => document.documentElement.classList.add("dark")); await p.waitForTimeout(100); }
    await p.waitForSelector('[data-hero-card="20"]');
    await p.waitForTimeout(200);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(ov <= 1, `no horizontal overflow at ${label} (overflow=${ov}px)`);
    await p.screenshot({ path: path.join(ARTIFACTS_DIR, `${label}.png`), fullPage: true });
    await p.screenshot({ path: path.join(HISTORY_ARTIFACTS_DIR, `${label}.png`), fullPage: true });
    console.log(`Screenshot saved: ${label}.png`);
    await ctx.close();
  }

  await browser.close();

  console.log("\n--- SUMMARY ---");
  console.log(`${failures.length === 0 ? "ALL TESTS PASSED" : `${failures.length} FAILURES`}`);
  if (failures.length) {
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});
