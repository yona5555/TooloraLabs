// Tool-card preview images: the visual part of every tool's RESULT card (its drawing / chart / output,
// without the card's header bar and without the inputs), cropped to 4:3 so it reads at card size,
// in ar/en × light/dark, saved as 640×480 WebP to public/tool-previews/{ar|en}/{light|dark}/{slug}.webp.
// The capture area is the shared result column marked data-preview="result" (ToolAboveFold); inside it
// the visual is [data-preview-visual] if a tool marks one, else the drawing part, else the largest
// canvas/SVG, else the card body.
// These are generated site assets, not screenshots for review.
// Usage (prod or dev server running on 3001): npm run previews [-- slug ...]
// Env: BASE (default http://localhost:3001), RETRIES (default 3).
import { mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.join(here, "../public/tool-previews");
const base = process.env.BASE ?? "http://localhost:3001";
const retries = Number(process.env.RETRIES ?? 3);
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const allSlugs = [...new Set([...readFileSync(path.join(here, "../data/tools.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]))];
const slugs = only.length ? only : allSlugs;
const variants = [
  { locale: "ar", theme: "light" },
  { locale: "ar", theme: "dark" },
  { locale: "en", theme: "light" },
  { locale: "en", theme: "dark" },
] as const;
const WIDTH = 640;
const HEIGHT = 480;

async function capture(page: Page, slug: string, locale: string, theme: string): Promise<string> {
  const url = `${base}/${locale}/tools/${slug}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  if (isDark !== (theme === "dark")) {
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);
    await page.reload({ waitUntil: "networkidle", timeout: 90_000 });
  }
  // A page whose hydration falls back to client rendering can drop <html class="dark">; apply the
  // theme the same way the site's ThemeToggle does before capturing.
  await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), theme === "dark");
  await page.waitForTimeout(300);
  if ((await page.evaluate(() => document.documentElement.classList.contains("dark"))) !== (theme === "dark")) throw new Error(`theme did not switch to ${theme}`);
  const result = page.locator("[data-tool-result]").first();
  await result.waitFor({ state: "visible", timeout: 30_000 });
  // Instant result + drawing: wait for an SVG or canvas inside the result column (when the tool has one).
  await page
    .waitForFunction(() => {
      const r = document.querySelector("[data-tool-result]");
      return !!r && (r.querySelector("svg[viewBox], canvas") !== null || r.textContent!.trim().length > 20);
    }, null, { timeout: 30_000 })
    .catch(() => undefined);
  await page.waitForTimeout(1500);
  const clip = await page.evaluate(() => {
    for (const sel of ["header", "footer", "[data-ad-space]", "[class*='AdSpace']", "[aria-label*='cookie' i]", "[id*='cookie' i]"]) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => (el.style.visibility = "hidden"));
    }
    document.querySelectorAll<HTMLElement>("ins, iframe, [data-ad]").forEach((el) => (el.style.visibility = "hidden"));
    const root = document.querySelector<HTMLElement>("[data-preview='result']") ?? document.querySelector<HTMLElement>("[data-tool-result]")!;
    const big = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.width >= 160 && r.height >= 110 && getComputedStyle(el).visibility !== "hidden" ? r.width * r.height : 0;
    };
    const pick = (sel: string) =>
      [...root.querySelectorAll(sel)].map((el) => ({ el, a: big(el) })).filter((c) => c.a > 0).sort((a, b) => b.a - a.a)[0]?.el;
    const body = root.querySelector("[data-card-body]") ?? root;
    const visual = pick("[data-preview-visual]") ?? pick("[data-part='drawing']") ?? pick("canvas, svg") ?? body;
    // The drawing part also holds its caption/hint lines: crop to the drawing itself when it has one.
    const inner = visual.matches("[data-part='drawing']") ? (visual.firstElementChild ?? visual) : visual;
    const v = inner.getBoundingClientRect();
    const b = body.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    // Bounds: the result card below its header bar.
    const bound = { left: r.left, right: r.right, top: Math.max(r.top, b.top), bottom: r.bottom };
    const pad = 8;
    let x0 = v.left - pad, x1 = v.right + pad, y0 = v.top - pad, y1 = v.bottom + pad;
    const ratio = 4 / 3;
    let pad43: string | null = null;
    const grow = (a0: number, a1: number, len: number, lo: number, hi: number): [number, number] => {
      const c = (a0 + a1) / 2;
      let s0 = c - len / 2, s1 = c + len / 2;
      if (s0 < lo) [s0, s1] = [lo, lo + len];
      if (s1 > hi) [s0, s1] = [hi - len, hi];
      return [Math.max(lo, s0), Math.min(hi, s1)];
    };
    // A small visual (e.g. a drop-zone graphic) takes in more of its card so the crop stays readable.
    const minW = Math.min(360, bound.right - bound.left);
    if (x1 - x0 < minW) [x0, x1] = grow(x0, x1, minW, bound.left, bound.right);
    const w = x1 - x0, h = y1 - y0;
    if (w / h > ratio) {
      // Too wide: take more height from the card, else trim the sides.
      if (w / ratio <= bound.bottom - bound.top) [y0, y1] = grow(y0, y1, w / ratio, bound.top, bound.bottom);
      else if (h * ratio >= minW) [x0, x1] = grow(x0, x1, h * ratio, x0, x1);
      else {
        // A short card (e.g. a file tool before any file): keep the whole body, padded to 4:3 later.
        [x0, x1, y0, y1] = [bound.left, bound.right, bound.top, bound.bottom];
        // Resolve any CSS colour (lab(), oklch()…) to rgb through a 1px canvas, for sharp.
        const cx = document.createElement("canvas").getContext("2d")!;
        cx.fillStyle = getComputedStyle(root.querySelector("[data-bp-panel]") ?? document.body).backgroundColor;
        cx.fillRect(0, 0, 1, 1);
        const [r8, g8, b8] = cx.getImageData(0, 0, 1, 1).data;
        pad43 = `rgb(${r8}, ${g8}, ${b8})`;
      }
    } else {
      // Too tall: take more width from the card, else trim to the top of the visual.
      if (h * ratio <= bound.right - bound.left) [x0, x1] = grow(x0, x1, h * ratio, bound.left, bound.right);
      else {
        [x0, x1] = [bound.left, bound.right];
        y1 = y0 + (x1 - x0) / ratio;
      }
    }
    return { x: Math.max(0, x0), y: Math.max(0, y0 + window.scrollY), width: x1 - x0, height: y1 - y0, pad43 };
  });
  if (clip.width < 240 || clip.height < (clip.pad43 ? 100 : 160)) throw new Error(`result visual too small (${Math.round(clip.width)}×${Math.round(clip.height)})`);
  const { pad43, ...rect } = clip;
  const png = await page.screenshot({ clip: rect, fullPage: true, animations: "disabled" });
  const dir = path.join(outRoot, locale, theme);
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.webp`);
  await sharp(png).resize({ width: WIDTH, height: HEIGHT, fit: pad43 ? "contain" : "cover", background: pad43 ?? undefined }).webp({ quality: 78, effort: 5 }).toFile(file);
  return file;
}

const browser = await chromium.launch();
let jobs = slugs.flatMap((slug) => variants.map((v) => ({ slug, ...v })));
const done: string[] = [];
let failures: { slug: string; locale: string; theme: string; reason: string }[] = [];
for (let attempt = 1; attempt <= retries && jobs.length; attempt++) {
  failures = [];
  for (const job of jobs) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 1, colorScheme: job.theme, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      done.push(await capture(page, job.slug, job.locale, job.theme));
    } catch (e) {
      failures.push({ ...job, reason: String(e).split("\n")[0].slice(0, 160) });
    }
    await context.close();
  }
  if (failures.length) console.log(`attempt ${attempt}: ${failures.length} failed, retrying`);
  jobs = failures.map(({ slug, locale, theme }) => ({ slug, locale, theme }) as (typeof jobs)[number]);
}
await browser.close();
const bytes = done.reduce((a, f) => a + statSync(f).size, 0);
console.log(`previews: ${done.length} images for ${slugs.length} tools, ${(bytes / 1024 / 1024).toFixed(2)} MB, ${failures.length} failures`);
for (const f of failures) console.log(`FAILED ${f.locale}/${f.theme}/${f.slug}: ${f.reason}`);
process.exit(failures.length ? 1 : 0);
