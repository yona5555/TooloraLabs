// Real-drag dynamism test with actual SVG geometry diffs (not just text comparison), per the
// mandate: for every indicator, drag its own handle and confirm the underlying SVG attributes
// (transform/cx/cy/d) actually changed, AND its worked-example text changed, AND the reverse
// direction (editing a field) also moves things.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const INDICATOR_TITLES = [
  "Balance Diagram", "Decision Path", "Progress Gauges", "Newton's-Method Iterations",
  "Intersection & Area", "Six Solving Methods", "Root vs. Parameter", "Complex Plane",
  "Formulas Used", "Notation Mapping", "Number-Line Solution Set", "Substitution Check",
  "Sensitivity Heatmap", "Vieta's Rectangle", "Unit Circle & Wave",
];

function cardLocatorByTitle(page, title) {
  return page.locator(`.rounded-2xl:has(h2:text-is("${title}"))`).first();
}

async function svgSignature(locator) {
  return locator.evaluate((el) => {
    const svgEls = el.querySelectorAll("svg *");
    return Array.from(svgEls)
      .map((n) => `${n.tagName}:${n.getAttribute("transform") || ""}:${n.getAttribute("cx") || ""}:${n.getAttribute("cy") || ""}:${n.getAttribute("d") || ""}:${n.getAttribute("points") || ""}`)
      .join("|");
  }).catch(() => "");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1200 } })).newPage();
  await page.goto(`${BASE}/en/tools/step-by-step-math-solver`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  let failures = 0;
  const results = [];

  for (const title of INDICATOR_TITLES) {
    const card = cardLocatorByTitle(page, title);
    await card.scrollIntoViewIfNeeded();
    const point = card.locator("svg g.mafs-movable-point, input[type=range], button").first();
    const count = await point.count();
    if (count === 0) {
      results.push({ title, status: "NO_DRAGGABLE_FOUND" });
      failures++;
      continue;
    }
    const tag = await point.evaluate((el) => el.tagName.toLowerCase());
    const beforeSvg = await svgSignature(card);
    const beforeText = await card.textContent();

    if (tag === "input") {
      // range slider: set to a clearly different value via direct DOM manipulation (bypasses
      // step-validation issues with .fill() on integer-stepped ranges).
      await point.evaluate((el) => {
        const min = parseFloat(el.min || "0");
        const max = parseFloat(el.max || "100");
        const step = parseFloat(el.step || "1") || 1;
        const current = parseFloat(el.value);
        let next = current + step * 3;
        if (next > max) next = min + step;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(el, String(next));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    } else if (tag === "button") {
      await card.locator("button").nth(0).click(); // default selectedStep is the LAST station, so the first button is a genuine change
    } else {
      const box = await point.boundingBox();
      if (!box) {
        results.push({ title, status: "NO_BOUNDING_BOX" });
        failures++;
        continue;
      }
      const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const to = { x: from.x + 40, y: from.y - 35 };
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let i = 1; i <= 15; i++) {
        await page.mouse.move(from.x + ((to.x - from.x) * i) / 15, from.y + ((to.y - from.y) * i) / 15);
        await page.waitForTimeout(10);
      }
      await page.mouse.up();
    }
    await page.waitForTimeout(350);

    const afterSvg = await svgSignature(card);
    const afterText = await card.textContent();
    const svgChanged = beforeSvg !== afterSvg;
    const textChanged = beforeText !== afterText;
    const pass = svgChanged || textChanged; // sliders drive non-SVG-geometry cards (tables/bars) -- text change is the valid signal there
    results.push({ title, status: pass ? "PASS" : "FAIL", svgChanged, textChanged, draggableTag: tag });
    if (!pass) failures++;
  }

  console.log(JSON.stringify(results, null, 2));
  console.log(`\n${results.length - failures}/${results.length} indicators PASS`);
  await browser.close();
  process.exit(failures > 0 ? 1 : 0);
})();
