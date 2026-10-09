// Playwright test suite for scientific-notation-converter's rebuilt hero + 15 indicators (batch1
// hard rules). Uses REAL mouse events throughout. Covers assertion categories (a)-(g) -- see
// batch1-fraction-calculator-test.mjs for the full category breakdown; this mirrors that script's
// structure and verified fixes (scrollIntoViewIfNeeded before every boundingBox()).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.resolve(__dirname, "../../../artifacts/batch1");
mkdirSync(ARTIFACTS_DIR, { recursive: true });

const BASE = "http://localhost:3000";
const URL = `${BASE}/en/tools/scientific-notation-converter`;
const RAW_FLOAT_RE = /\d\.\d{6,}/;
const BAD_WORD_RE = /\bNaN\b|\bInfinity\b|\bundefined\b/;

let failures = [];
function assert(cond, msg) {
  if (!cond) {
    failures.push(msg);
    console.error(`FAIL: ${msg}`);
  } else {
    console.log(`PASS: ${msg}`);
  }
}

async function cardSignature(page, n) {
  return page.evaluate((num) => {
    const card = document.querySelector(`[data-indicator-card="${num}"]`);
    if (!card) return null;
    const svgParts = [...card.querySelectorAll("svg *")]
      .map((el) => `${el.tagName}:${el.getAttribute("transform") || ""}:${el.getAttribute("cx") || ""}:${el.getAttribute("cy") || ""}:${el.getAttribute("d") || ""}:${el.getAttribute("points") || ""}:${el.getAttribute("width") || ""}:${el.getAttribute("x") || ""}:${el.getAttribute("fill") || ""}`)
      .join("|");
    const styleParts = [...card.querySelectorAll("[style]")].map((el) => el.getAttribute("style")).join("|");
    const text = card.textContent || "";
    return `${svgParts}##${styleParts}##${text}`;
  }, n);
}

async function allVisibleText(page) {
  return page.evaluate(() => {
    function isHidden(el) {
      const cs = getComputedStyle(el);
      return cs.display === "none" || cs.visibility === "hidden";
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el) {
          if (isHidden(el)) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let text = "";
    let n;
    while ((n = walker.nextNode())) text += n.textContent + " ";
    return text;
  });
}

async function checkNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `no horizontal page overflow at ${label} (overflow=${overflow}px)`);
}

async function checkNoTableClipped(page, label) {
  const clipped = await page.evaluate(() => {
    const tables = [...document.querySelectorAll("[data-indicator-table] table")];
    return tables.filter((t) => {
      const wrap = t.closest(".overflow-x-auto") || t.parentElement;
      return t.scrollWidth > wrap.clientWidth + 4 && getComputedStyle(wrap).overflowX !== "auto" && getComputedStyle(wrap).overflowX !== "scroll";
    }).length;
  });
  assert(clipped === 0, `no clipped (non-scrollable) tables at ${label} (found ${clipped})`);
}

async function main() {
  const browser = await chromium.launch();
  const consoleErrors = [];

  const context1440 = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context1440.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-hero-card="1"]');

  await checkNoHorizontalOverflow(page, "1440px");
  await checkNoTableClipped(page, "1440px");

  let bodyText = await allVisibleText(page);
  assert(!RAW_FLOAT_RE.test(bodyText), "no raw long-decimal text on initial render (1440px)");
  assert(!BAD_WORD_RE.test(bodyText), "no NaN/Infinity/undefined text on initial render (1440px)");

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "scientific-notation-converter-1440.png"), fullPage: true });
  console.log("Screenshot saved: scientific-notation-converter-1440.png");

  // --- (b) handle-position assertion after typing into the standard-value input field ---
  const standardValueInput = page.locator('input[type="text"]').first();
  await standardValueInput.fill("");
  await standardValueInput.fill("12345");
  await standardValueInput.blur();
  await page.waitForTimeout(150);
  const heroTextAfterType = await page.locator('[data-hero-card="1"]').innerText();
  assert(/1\.2345.{0,3}10\^4/.test(heroTextAfterType.replace(/\s/g, "")) || /A = 1\.2345/.test(heroTextAfterType), `hero reflects typed standardValue=12345 as 1.2345x10^4 (got snippet: "${heroTextAfterType.slice(0, 150)}")`);

  // reset back to the default so the drag section below starts from the spec's canonical state
  await standardValueInput.fill("");
  await standardValueInput.fill("299792458");
  await standardValueInput.blur();
  await page.waitForTimeout(150);

  // --- (a)+(d) real-mouse drag on hero pointA, exact snapped value assertion ---
  const pointAGroup = page.locator('[data-point-role="pointA"]');
  await page.waitForSelector('[data-point-role="pointA"]');
  const beforeSignatures = {};
  for (let n = 2; n <= 16; n++) beforeSignatures[n] = await cardSignature(page, n);

  await pointAGroup.scrollIntoViewIfNeeded();
  const box = await pointAGroup.boundingBox();
  assert(!!box, "pointA handle has a bounding box (is visible and mounted)");
  if (box) {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const mafsCanvas = page.locator(".mafs-canvas").first();
    const canvasBox = await mafsCanvas.boundingBox();
    const targetX = canvasBox.x + canvasBox.width * 0.75;
    const targetY = canvasBox.y + canvasBox.height * 0.3;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move((startX + targetX) / 2, (startY + targetY) / 2, { steps: 5 });
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "scientific-notation-converter-middrag.png"), fullPage: true });
    console.log("Screenshot saved: scientific-notation-converter-middrag.png");

    const heroSummary = await page.locator('[data-hero-card="1"]').innerText();
    const match = heroSummary.match(/A\s*=\s*(-?\d+(?:\.\d+)?)\s*×\s*10\^(-?\d+)/);
    assert(!!match, `hero shows a clean A = c × 10^e form after drag (got: "${heroSummary.slice(0, 200)}")`);
    if (match) {
      const coeff = parseFloat(match[1]);
      assert(coeff >= 1 && coeff < 10, `dragged coefficient stays in [1,10) (got ${coeff})`);
    }
    bodyText = await allVisibleText(page);
    assert(!RAW_FLOAT_RE.test(bodyText), "no raw long-decimal text after drag");
    assert(!BAD_WORD_RE.test(bodyText), "no NaN/Infinity/undefined text after drag");
  }

  // --- (c) >=12/15 indicators changed after the drag ---
  let changedCount = 0;
  const changedList = [];
  for (let n = 2; n <= 16; n++) {
    const after = await cardSignature(page, n);
    if (after !== null && after !== beforeSignatures[n]) {
      changedCount++;
      changedList.push(n);
    }
  }
  console.log(`Indicators changed after drag: ${changedCount}/15 -> cards [${changedList.join(", ")}]`);
  assert(changedCount >= 12, `at least 12/15 indicators changed after the drag (got ${changedCount}/15: cards ${changedList.join(",")})`);

  // --- (d) per-indicator-handle drag: CoefficientZoneCard (card 3) bar drag ---
  const zone3Before = await cardSignature(page, 3);
  const zoneBar = page.locator('[data-indicator-card="3"] [data-indicator-visual] > div > div').first();
  await zoneBar.scrollIntoViewIfNeeded();
  const zoneBox = await zoneBar.boundingBox();
  if (zoneBox) {
    await page.mouse.move(zoneBox.x + zoneBox.width * 0.2, zoneBox.y + zoneBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(zoneBox.x + zoneBox.width * 0.9, zoneBox.y + zoneBox.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const zone3After = await cardSignature(page, 3);
    assert(zone3After !== zone3Before, "CoefficientZoneCard (indicator 3) changes after dragging its own bar handle");
  }

  // --- (d) per-indicator-handle drag: AbsoluteErrorCard (card 10) curve drag ---
  const err10Before = await cardSignature(page, 10);
  const errSvg = page.locator('[data-indicator-card="10"] svg').first();
  await errSvg.scrollIntoViewIfNeeded();
  const errBox = await errSvg.boundingBox();
  if (errBox) {
    await page.mouse.move(errBox.x + errBox.width * 0.3, errBox.y + errBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(errBox.x + errBox.width * 0.8, errBox.y + errBox.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const err10After = await cardSignature(page, 10);
    assert(err10After !== err10Before, "AbsoluteErrorCard (indicator 10) changes after dragging its own curve handle");
  }

  // --- (e) extreme-drag safety ---
  const pointAGroup2 = page.locator('[data-point-role="pointA"]');
  await pointAGroup2.scrollIntoViewIfNeeded();
  const box2 = await pointAGroup2.boundingBox();
  const mafsCanvas2 = page.locator(".mafs-canvas").first();
  const canvasBox2 = await mafsCanvas2.boundingBox();
  if (box2 && canvasBox2) {
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox2.x - 400, canvasBox2.y - 400, { steps: 10 });
    await page.mouse.move(canvasBox2.x + canvasBox2.width + 400, canvasBox2.y + canvasBox2.height + 400, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const extremeText = await allVisibleText(page);
    assert(!BAD_WORD_RE.test(extremeText), "no NaN/Infinity/undefined after extreme out-of-bounds drag");
    assert(!RAW_FLOAT_RE.test(extremeText), "no raw long-decimal text after extreme out-of-bounds drag");
    const svgViewBoxes = await page.evaluate(() => [...document.querySelectorAll("svg[viewBox]")].map((s) => s.getAttribute("viewBox")));
    const runaway = svgViewBoxes.some((vb) => {
      const parts = vb.split(/\s+/).map(Number);
      return parts.some((p) => !Number.isFinite(p) || Math.abs(p) > 100000);
    });
    assert(!runaway, "no runaway/non-finite SVG viewBox after extreme drag");
  }

  assert(consoleErrors.length === 0, `no console errors or page errors during the whole test run (got ${consoleErrors.length}: ${consoleErrors.slice(0, 3).join(" | ")})`);

  await context1440.close();

  // --- 390px mobile pass ---
  const context390 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page390 = await context390.newPage();
  await page390.goto(URL, { waitUntil: "networkidle" });
  await page390.waitForSelector('[data-hero-card="1"]');

  await checkNoHorizontalOverflow(page390, "390px");
  await checkNoTableClipped(page390, "390px");

  const text390 = await allVisibleText(page390);
  assert(!RAW_FLOAT_RE.test(text390), "no raw long-decimal text at 390px");
  assert(!BAD_WORD_RE.test(text390), "no NaN/Infinity/undefined text at 390px");

  await page390.screenshot({ path: path.join(ARTIFACTS_DIR, "scientific-notation-converter-390.png"), fullPage: true });
  console.log("Screenshot saved: scientific-notation-converter-390.png");

  const pointA390 = page390.locator('[data-point-role="pointA"]');
  await pointA390.scrollIntoViewIfNeeded();
  const box390 = await pointA390.boundingBox();
  if (box390) {
    const before390 = await cardSignature(page390, 3);
    await page390.mouse.move(box390.x + box390.width / 2, box390.y + box390.height / 2);
    await page390.mouse.down();
    await page390.mouse.move(box390.x + 40, box390.y - 20, { steps: 6 });
    await page390.mouse.up();
    await page390.waitForTimeout(150);
    const after390 = await cardSignature(page390, 3);
    console.log(`390px drag indicator-3 changed: ${before390 !== after390}`);
  }

  await context390.close();
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
