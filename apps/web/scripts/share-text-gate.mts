// Share-image text gate: the HarfBuzz-shaped title (lib/share-image/shape.ts, rendered through next/og exactly
// like the share route) must match Chromium's own rendering of the same text in the same font file and size.
// Both are rasterised to pixel buffers (never saved, never reviewed), cropped to their ink, and compared:
// ink IoU >= MIN_IOU and ink width within 3% for every locale, else exit 1.
//   node apps/web/scripts/share-text-gate.mts            (run from anywhere; reads the percentage-calculator titles)
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { ImageResponse } from "next/og.js";
import { chromium } from "playwright";
import sharp from "sharp";

const web = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(web);
const { shapeTitle, shareFontFiles } = await import("../lib/share-image/shape.ts");
const MIN_IOU = 0.8;
const W = 1000, H = 200, FS = 64;
// percentage-calculator in every script, plus ph-calculator in ar and hi (Latin "pH" inside an RTL / Devanagari
// title: bidi runs and the face fallback chain).
const title = (l: string, slug: string) => JSON.parse(readFileSync(`messages/${l}.json`, "utf8")).tools[slug].title as string;
const cases = [
  ...["en", "ar", "hi"].map((l) => [l, title(l, "percentage-calculator")]),
  ...["ar", "hi"].map((l) => [l, title(l, "ph-calculator")]),
];

async function viaShaper(locale: string, text: string) {
  const t = shapeTitle(text, locale, { fontSize: FS, maxWidth: W - 40, maxLines: 1, color: "#000" });
  const src = `data:image/svg+xml;base64,${Buffer.from(t.svg).toString("base64")}`;
  const el = createElement("div", { style: { width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" } },
    createElement("img", { src, width: t.width, height: t.height }));
  return Buffer.from(await new ImageResponse(el, { width: W, height: H }).arrayBuffer());
}

async function ink(buf: Buffer) {
  const { data, info } = await sharp(buf).flatten({ background: "#fff" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[y * info.width + x] < 128) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return { data, w: info.width, x0, y0, x1, y1 };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
let failed = false;
for (const [locale, text] of cases) {
  // The same face chain as the shaper, as a CSS font stack.
  const faces = shareFontFiles(locale).map((f, i) => `@font-face{font-family:F${i};src:url(data:font/ttf;base64,${readFileSync(f).toString("base64")})}`);
  const dir = locale === "ar" ? "rtl" : "ltr";
  await page.setContent(`<style>${faces.join("")}html,body{margin:0}div{width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center;background:#fff;color:#000;font:700 ${FS}px ${faces.map((_, i) => `F${i}`).join(",")}}</style><div dir="${dir}" lang="${locale}"></div>`);
  await page.locator("div").evaluate((d, t) => (d.textContent = t), text);
  await page.evaluate(() => document.fonts.ready);
  const a = await ink(await viaShaper(locale, text));
  const c = await ink(await page.screenshot({ type: "png" }));
  let inter = 0, uni = 0;
  const bw = Math.max(a.x1 - a.x0, c.x1 - c.x0), bh = Math.max(a.y1 - a.y0, c.y1 - c.y0);
  for (let y = 0; y <= bh; y++) for (let x = 0; x <= bw; x++) {
    const pa = a.data[(a.y0 + y) * a.w + a.x0 + x] < 128, pc = c.data[(c.y0 + y) * c.w + c.x0 + x] < 128;
    if (pa && pc) inter++;
    if (pa || pc) uni++;
  }
  const iou = inter / uni, wa = a.x1 - a.x0 + 1, wc = c.x1 - c.x0 + 1, dw = Math.abs(wa - wc) / wc;
  const ok = iou >= MIN_IOU && dw <= 0.03;
  failed ||= !ok;
  console.log(JSON.stringify({ locale, text, shaperInk: [wa, a.y1 - a.y0 + 1], chromiumInk: [wc, c.y1 - c.y0 + 1], inkIoU: +iou.toFixed(3), widthDiff: +dw.toFixed(3), ok }));
}
await browser.close();
process.exit(failed ? 1 : 0);
