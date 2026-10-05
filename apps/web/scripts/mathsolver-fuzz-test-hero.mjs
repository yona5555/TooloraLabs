// 500-drag fuzz test: random drags on every hero handle across all 4 modes, checking after EVERY
// single drag that the displayed equation label and every WORKED EXAMPLE value on the page never
// shows a raw long decimal, NaN, Infinity, -0, or "undefined" -- the exact bug class the rebuild
// was commissioned to fix.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const TOTAL_DRAGS = 500;
// A value is "clean" if it's a short integer, a simple a/b fraction, or a decimal with <=4
// significant digits after rounding -- anything wildly long (raw float noise) fails this.
const BAD_WORD = /\bNaN\b|\bInfinity\b|\bundefined\b/;

function allNumberLikeTextNodes(page) {
  return page.evaluate(() => {
    const paper = document.querySelector("[data-encyclopedia-paper]");
    if (!paper) return [];
    const walker = document.createTreeWalker(paper, NodeFilter.SHOW_TEXT);
    const out = [];
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim();
      if (t && /[-\d]/.test(t)) out.push(t);
    }
    return out;
  });
}

function significantDigitCount(numStr) {
  // Count significant figures properly: leading zeros (both the integer "0" and any zeros right
  // after the decimal point before the first nonzero digit) don't count -- "0.000001412" is 4
  // significant figures (1,4,1,2), not 9 decimal places of noise.
  const digitsOnly = numStr.replace(/^-/, "").replace(".", "");
  const firstNonZero = digitsOnly.search(/[1-9]/);
  if (firstNonZero === -1) return 0;
  return digitsOnly.slice(firstNonZero).length;
}

function checkToken(tok) {
  // Extract number-shaped substrings from a label like "2x² - 13/2x + 28 = 0" and check each:
  // flag a literal negative-zero token, or a genuinely raw/unrounded value (more than 4 true
  // significant figures -- not just many decimal places, which small magnitudes legitimately need).
  const matches = tok.match(/-?\d+(\.\d+)?(\/\d+)?/g) || [];
  for (const m of matches) {
    if (m === "-0") return `literal -0 token`;
    const withoutFraction = m.split("/")[0];
    const sig = significantDigitCount(withoutFraction);
    if (sig > 4) return `more than 4 significant figures: ${m} (${sig} sig figs)`;
  }
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  await page.goto(`${BASE}/en/tools/step-by-step-math-solver`, { waitUntil: "networkidle" });
  const hero = page.locator(".mafs-canvas").first();
  await hero.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const modes = ["quadratic-equation", "linear-equation", "fraction-operation", "derivative"];
  let violations = [];
  let dragsDone = 0;
  const dragsPerMode = Math.ceil(TOTAL_DRAGS / modes.length);

  for (const mode of modes) {
    await page.locator("#tool select").first().selectOption(mode);
    await page.waitForTimeout(300);
    await hero.scrollIntoViewIfNeeded();

    for (let i = 0; i < dragsPerMode && dragsDone < TOTAL_DRAGS; i++) {
      const points = hero.locator("svg g.mafs-movable-point");
      const count = await points.count();
      if (count === 0) break;
      const idx = Math.floor(Math.random() * count);
      const box = await points.nth(idx).boundingBox().catch(() => null);
      if (!box) continue;
      const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const dx = (Math.random() - 0.5) * 300;
      const dy = (Math.random() - 0.5) * 300;
      const to = { x: from.x + dx, y: from.y + dy };
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      const steps = 6;
      for (let s = 1; s <= steps; s++) {
        await page.mouse.move(from.x + ((to.x - from.x) * s) / steps, from.y + ((to.y - from.y) * s) / steps);
      }
      await page.mouse.up();
      await page.waitForTimeout(60);
      dragsDone++;

      const texts = await allNumberLikeTextNodes(page);
      for (const t of texts) {
        if (BAD_WORD.test(t)) {
          violations.push({ mode, drag: dragsDone, text: t, reason: "bad word (NaN/Infinity/undefined)" });
          continue;
        }
        const reason = checkToken(t);
        if (reason) violations.push({ mode, drag: dragsDone, text: t, reason });
      }
      if (violations.length > 20) break; // stop early, we have enough evidence
    }
    if (violations.length > 20) break;
  }

  console.log(`Total drags performed: ${dragsDone}`);
  console.log(`Violations found: ${violations.length}`);
  if (violations.length > 0) {
    console.log(JSON.stringify(violations.slice(0, 20), null, 2));
  }
  await browser.close();
  process.exit(violations.length > 0 ? 1 : 0);
})();
