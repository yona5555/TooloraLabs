// Converter follow-up checks: Result-card gauge two-way sync (unit), image sample/compare/upload,
// fonts, console errors, and the requested screenshots. Usage: node apps/web/scripts/converter-followup-check.mjs
import { chromium } from "playwright";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
const B = requireBase(process.env.BASE);
const b = await chromium.launch();
const out = {};
async function open(path, W, theme = "dark") {
  const ctx = await b.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 160)));
  await p.goto(B + path, { waitUntil: "load" });
  await p.evaluate((t) => localStorage.setItem("theme", t), theme);
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(2500);
  return { p, ctx, errs };
}
const fonts = (p) =>
  p.evaluate(() => {
    const bad = new Set();
    const root = document.querySelector("[data-kit-page]");
    for (const el of root.querySelectorAll("*")) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const f = getComputedStyle(el).fontFamily.toLowerCase();
      if (/serif|mono|courier|georgia|times/.test(f) && !/sans-serif/.test(f.replace(/^.*?,/, "")) && !f.startsWith("inter") && !f.includes("--glass")) bad.add(f.slice(0, 60));
      if (/(^|,)\s*(ui-monospace|monospace|ui-serif|serif|georgia|courier)/.test(f) && !f.startsWith("inter")) bad.add(f.slice(0, 60));
    }
    return [...bad];
  });
const dragBy = async (p, sel, dx, dy) => {
  const h = p.locator(sel);
  await h.scrollIntoViewIfNeeded();
  const bb = await h.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.mouse.down();
  await p.mouse.move(bb.x + bb.width / 2 + dx / 2, bb.y + bb.height / 2 + dy / 2, { steps: 5 });
  const mid = await p.evaluate(() => [document.querySelector("input[inputmode=decimal]")?.value, document.querySelector("[data-testid=unit-result-main]")?.textContent]);
  await p.mouse.move(bb.x + bb.width / 2 + dx, bb.y + bb.height / 2 + dy, { steps: 5 });
  await p.mouse.up();
  return mid;
};

// ── unit-converter: gauge in the Result card ──
{
  const { p, ctx, errs } = await open("/en/tools/unit-converter", 1440);
  const read = () => p.evaluate(() => ({ field: document.querySelector("input[inputmode=decimal]").value, result: document.querySelector("[data-testid=unit-result-main]").textContent, pill: document.querySelector("[data-testid=unit-hero-value]").textContent, handle: (() => { const r = document.querySelector("[data-testid=unit-hero-handle]").getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y)]; })() }));
  const r0 = await read();
  const mid = await dragBy(p, "[data-testid=unit-hero-handle]", 90, 90);
  const r1 = await read();
  await p.click("[data-testid=unit-hero-plus]");
  const r2 = await read();
  await p.click("[data-testid=unit-hero-reset]");
  const r3 = await read();
  await p.fill("input[inputmode=decimal]", "55");
  await p.waitForTimeout(300);
  const r4 = await read();
  out.unit = { start: r0, midDrag: mid, afterDrag: r1, afterPlus: r2, afterReset: r3, afterTyping55: r4, fonts: await fonts(p), errors: errs };
  await p.fill("input[inputmode=decimal]", "10");
  await p.waitForTimeout(300);
  const card = await p.locator("#unit-result").boundingBox();
  await p.screenshot({ path: "artifacts/unit-converter/result-gauge-dark-1440.png", clip: { x: card.x - 8, y: card.y - 8, width: card.width + 16, height: Math.min(card.height, 560) + 16 } });
  await ctx.close();
}

// ── roman: no-gap screenshot ──
{
  const { p, ctx, errs } = await open("/en/tools/roman-numeral-converter", 1440);
  const gb = await p.evaluate(() => document.querySelector("[data-tool-result]").parentElement.getBoundingClientRect().bottom + scrollY);
  await p.screenshot({ path: "artifacts/roman-numeral-converter/no-gap-dark-1440.png", fullPage: true, clip: { x: 0, y: 0, width: 1440, height: Math.round(gb) + 24 } });
  await p.click("[data-testid=roman-examples] button >> nth=0");
  out.roman = { afterExample: await p.evaluate(() => [document.querySelector("input[inputmode=numeric]").value, document.querySelector("[data-testid=roman-result-main]").textContent]), fonts: await fonts(p), errors: errs };
  await ctx.close();
}

// ── image-converter ──
{
  const { p, ctx, errs } = await open("/en/tools/image-converter", 1440);
  await p.waitForSelector("[data-testid=image-compare-after]", { timeout: 10000 });
  await p.waitForTimeout(600);
  const real = () =>
    p.evaluate(async () => {
      const after = document.querySelector("[data-testid=image-compare-after]");
      const before = document.querySelector("[data-testid=image-compare] img");
      const blobAfter = await (await fetch(after.src)).blob();
      const blobBefore = await (await fetch(before.src)).blob();
      const txt = (k) => document.querySelector(`[data-testid=image-stat-${k}]`).textContent;
      return { sampleLabel: !!document.querySelector("[data-testid=image-sample-label]"), origBytes: blobBefore.size, newBytes: blobAfter.size, origShown: txt("orig"), newShown: txt("new"), dimsIn: txt("dimsIn"), dimsOut: txt("dimsOut"), saving: document.querySelector("[data-testid=image-saving]").textContent, clip: after.style.clipPath, natural: [after.naturalWidth, after.naturalHeight] };
    });
  const first = await real();
  await dragBy(p, "[data-testid=image-compare] [role=slider]", -100, 0).catch(() => null);
  const clipAfterDrag = await p.evaluate(() => document.querySelector("[data-testid=image-compare-after]").style.clipPath);
  await p.click("[data-testid=image-compare-plus]");
  const clipAfterPlus = await p.evaluate(() => document.querySelector("[data-testid=image-compare-after]").style.clipPath);
  await p.click("[data-testid=image-gauge-minus]");
  await p.waitForTimeout(800);
  const qField = await p.locator("[data-testid=image-quality] [role=slider]").getAttribute("aria-valuenow");
  await p.click("[data-testid=image-gauge-reset]");
  await p.waitForTimeout(800);
  // Upload a real (generated) JPEG to replace the sample.
  const jpg = await p.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 300;
    c.height = 200;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 300, 200);
    g.addColorStop(0, "#c33");
    g.addColorStop(1, "#33c");
    x.fillStyle = g;
    x.fillRect(0, 0, 300, 200);
    const bl = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.95));
    return [...new Uint8Array(await bl.arrayBuffer())];
  });
  await p.setInputFiles("input[type=file]", { name: "upload.jpg", mimeType: "image/jpeg", buffer: Buffer.from(jpg) });
  await p.waitForTimeout(1500);
  const afterUpload = await real();
  out.image = { first, clipAfterDrag, clipAfterPlus, qFieldAfterGaugeMinus: qField, uploadBytes: jpg.length, afterUpload, fonts: await fonts(p), errors: errs };
  await ctx.close();
}
for (const [loc, W, name] of [["en", 1440, "dark-1440"], ["ar", 390, "dark-390-ar-rtl"]]) {
  const { p, ctx } = await open(`/${loc}/tools/image-converter`, W);
  await p.waitForSelector("[data-testid=image-compare-after]", { timeout: 10000 });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `artifacts/image-converter/${name}.png`, fullPage: true });
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
