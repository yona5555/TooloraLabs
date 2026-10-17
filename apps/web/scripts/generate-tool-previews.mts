// Tool-card preview images: each tool's MAIN VISUAL only (its chart, scene, gauge or diagram as it
// appears in the tool), never the whole card, tabs, toolbars, intro text or reference tables.
// Saved as 640×480 (4:3) WebP to public/tool-previews/{ar|en}/{light|dark}/{slug}.webp.
// These are generated site assets, not screenshots for review.
//
// Which element: the tool marks its main visual with data-preview="visual" (shared wrappers do it for
// their drawing part); when a page has several, data-preview-hero picks the hero, else the first one in
// the result column. Readiness: fonts loaded, network idle, no skeleton/loading placeholder inside,
// every three.js canvas flagged data-preview-ready="true" (set after 30 rendered frames), the element's
// own data-preview-ready not "false", and its box stable. The element is captured alone (everything
// else hidden, transparent page) with 16px padding, trimmed of empty margins (never the content),
// padded again and letterboxed into 640×480 on the card's own background colour.
// Quality gates (fail + retry with a longer wait): nearly blank, content touching an edge (clipped),
// 3D content cut by its canvas edge, skeleton placeholders.
//
// Usage (prod or dev server running on 3001): npm run previews [-- slug ...]
// Env: BASE (default http://localhost:3001), RETRIES (default 3), CONCURRENCY (default 4), VARIANT, VERBOSE.
import { mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type ElementHandle, type Page } from "playwright";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.join(here, "../public/tool-previews");
const base = process.env.BASE ?? "http://localhost:3001";
const retries = Number(process.env.RETRIES ?? 3);
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const allSlugs = [...new Set([...readFileSync(path.join(here, "../data/tools.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]))];
const slugs = only.length ? only : allSlugs;
/** Tools whose page has no visual at all (file tools before a file is added): no image, reported. */
const NO_VISUAL = new Set(["pdf-merge-split", "zip-compressor"]);
const variants = [
  { locale: "ar", theme: "light" },
  { locale: "ar", theme: "dark" },
  { locale: "en", theme: "light" },
  { locale: "en", theme: "dark" },
] as const;
const WIDTH = 640;
const HEIGHT = 480;
const PAD = 16;
const DPR = 2;

type Rgb = [number, number, number];
const dist = (a: ArrayLike<number>, i: number, c: Rgb) => Math.abs(a[i] - c[0]) + Math.abs(a[i + 1] - c[1]) + Math.abs(a[i + 2] - c[2]);

async function capture(page: Page, slug: string, locale: string, theme: string, attempt: number): Promise<{ file: string; auto: boolean }> {
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
  if ((await page.evaluate(() => document.documentElement.classList.contains("dark"))) !== (theme === "dark")) throw new Error(`theme did not switch to ${theme}`);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const picked = await page.evaluateHandle(() => {
    const big = (e: Element) => {
      const r = e.getBoundingClientRect();
      return r.width >= 120 && r.height >= 80 && getComputedStyle(e).visibility !== "hidden";
    };
    const res = document.querySelector("[data-preview='result']");
    const marked = [...document.querySelectorAll("[data-preview='visual']")].filter(big);
    const hero = marked.find((e) => e.hasAttribute("data-preview-hero")) ?? marked.find((e) => res?.contains(e)) ?? marked[0];
    if (hero) return { el: hero, auto: false };
    // Unmarked tool: largest SVG/canvas of the result column (reported as "auto" so it gets marked).
    const cands = res ? [...res.querySelectorAll("svg, canvas")].filter((e) => big(e) && e.getBoundingClientRect().width >= 140) : [];
    const area = (e: Element) => e.getBoundingClientRect().width * e.getBoundingClientRect().height;
    const top = cands.sort((a, b) => area(b) - area(a))[0];
    return top ? { el: top.parentElement ?? top, auto: true } : null;
  });
  const info = (await picked.jsonValue().catch(() => null)) as { auto: boolean } | null;
  if (!info) throw new Error("no visual found");
  const el = (await picked.evaluateHandle((p) => (p as unknown as { el: Element }).el)) as ElementHandle<Element>;
  await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
  if (process.env.VERBOSE)
    console.log(
      `  ${slug} ${locale}/${theme}: ` +
        (await el.evaluate((e) => {
          const r = e.getBoundingClientRect();
          const inner = [...e.querySelectorAll("svg, canvas")].map((x) => `${x.tagName.toLowerCase()}${x.getAttribute("aria-label") ? `[${x.getAttribute("aria-label")!.slice(0, 40)}]` : ""}`).slice(0, 3);
          return `${e.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} in-result=${!!e.closest("[data-preview='result']")} ${inner.join(",")} "${(e.textContent ?? "").trim().slice(0, 50)}"`;
        })),
    );

  // Real render: no placeholders, every three.js canvas past 30 frames, box stable for ~0.6 s.
  await page
    .waitForFunction(
      (e) => {
        const w = window as unknown as { __pv?: { k: string; n: number } };
        const visible = (x: Element) => {
          const r = x.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== "hidden";
        };
        if ((e as HTMLElement).dataset.previewReady === "false") return false;
        if ([...e.querySelectorAll(".animate-pulse, [aria-busy='true'], [class*='skeleton' i]")].some(visible)) return false;
        const gl = [...e.querySelectorAll("canvas[data-engine]")];
        if (gl.some((c) => (c as HTMLElement).dataset.previewReady !== "true")) return false;
        if (e.querySelector("[data-ph-mode]") && e.querySelector("[data-ph-mode='2d']")) return false;
        const r = e.getBoundingClientRect();
        const k = `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.top)}`;
        if (!w.__pv || w.__pv.k !== k) w.__pv = { k, n: 0 };
        return ++w.__pv.n >= 6;
      },
      el,
      { timeout: 15_000 * attempt, polling: 100 },
    )
    .catch(() => {
      throw new Error("visual never finished rendering (placeholder, 3D frames or layout still changing)");
    });
  await page.waitForTimeout(300 * attempt);

  // Isolate the visual: hide everything else, transparent page; clip = the visual and anything it
  // draws outside its own box (labels), plus padding.
  const geo = await el.evaluate((e, pad) => {
    e.setAttribute("data-preview-capture", "");
    const st = document.createElement("style");
    st.id = "pv-isolate";
    st.textContent = `html, body { background: transparent !important; background-image: none !important; }
      body * { visibility: hidden !important; }
      [data-preview-capture], [data-preview-capture] * { visibility: visible !important; }
      [data-preview-capture] [hidden], [data-preview-capture] [style*="visibility: hidden"] { visibility: hidden !important; }`;
    document.head.appendChild(st);
    const r0 = e.getBoundingClientRect();
    let [l, t, rr, b] = [r0.left, r0.top, r0.right, r0.bottom];
    for (const d of e.querySelectorAll("*")) {
      const r = d.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(d).visibility === "hidden") continue;
      // Ignore content scrolled/clipped away inside the visual (overflow hidden ancestors inside e).
      let clipped = false;
      for (let p = d.parentElement; p && p !== e.parentElement; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (o.overflow !== "visible" || o.overflowX !== "visible" || o.overflowY !== "visible") {
          const pr = p.getBoundingClientRect();
          if (r.left < pr.left - 1 || r.right > pr.right + 1 || r.top < pr.top - 1 || r.bottom > pr.bottom + 1) clipped = true;
          break;
        }
      }
      if (clipped) continue;
      [l, t, rr, b] = [Math.min(l, r.left), Math.min(t, r.top), Math.max(rr, r.right), Math.max(b, r.bottom)];
    }
    // Card background behind the visual, resolved to rgb through a 1px canvas (lab()/oklch() safe).
    const cx = document.createElement("canvas").getContext("2d")!;
    let bg = "";
    for (let p: Element | null = e; p; p = p.parentElement) {
      const c = getComputedStyle(p).backgroundColor;
      if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) {
        bg = c;
        break;
      }
    }
    cx.fillStyle = bg || (document.documentElement.classList.contains("dark") ? "#18181b" : "#ffffff");
    cx.fillRect(0, 0, 1, 1);
    const px = cx.getImageData(0, 0, 1, 1).data;
    const canvases = [...e.querySelectorAll("canvas[data-engine]")].map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const x = Math.max(0, l - pad);
    const y = Math.max(0, t - pad);
    return { clip: { x, y: y + window.scrollY, width: rr - l + 2 * pad, height: b - t + 2 * pad }, origin: { x, y }, bg: [px[0], px[1], px[2]] as Rgb, canvases };
    // Glows/strokes are not in DOM boxes: each retry captures with more room (the result is trimmed anyway).
  }, PAD + 24 * (attempt - 1));
  if (geo.clip.width < 100 || geo.clip.height < 70) throw new Error(`visual too small (${Math.round(geo.clip.width)}×${Math.round(geo.clip.height)})`);
  const png = await page.screenshot({ clip: geo.clip, fullPage: true, omitBackground: true, animations: "disabled" });
  await el.evaluate((e) => {
    e.removeAttribute("data-preview-capture");
    document.getElementById("pv-isolate")?.remove();
  });

  // ---- Quality gates ----
  const { data: raw, info: im } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = im.width;
  const H = im.height;
  const ring = Math.round(3 * DPR);
  let ringOn = 0;
  let ringN = 0;
  for (let yy = 0; yy < H; yy++)
    for (let xx = 0; xx < W; xx++) {
      if (xx >= ring && xx < W - ring && yy >= ring && yy < H - ring) continue;
      ringN++;
      if (raw[(yy * W + xx) * 4 + 3] > 24) ringOn++;
    }
  if (ringOn / ringN > 0.004) throw new Error(`content touches the image edge (clipped, ${((100 * ringOn) / ringN).toFixed(1)}% of border)`);
  const flat = await sharp(png).flatten({ background: { r: geo.bg[0], g: geo.bg[1], b: geo.bg[2] } }).raw().toBuffer();
  let content = 0;
  for (let i = 0; i < W * H; i++) if (dist(flat, i * 3, geo.bg) > 30) content++;
  if (content / (W * H) < 0.02) throw new Error(`nearly blank (${((100 * content) / (W * H)).toFixed(1)}% content)`);
  // 3D: the scene must not run off its canvas (camera not fitted to the whole object).
  for (const c of geo.canvases) {
    const x0 = Math.round((c.x - geo.origin.x) * DPR);
    const y0 = Math.round((c.y - geo.origin.y) * DPR);
    const cw = Math.round(c.w * DPR);
    const ch = Math.round(c.h * DPR);
    const at = (xx: number, yy: number) => ((Math.min(H - 1, Math.max(0, yy)) * W + Math.min(W - 1, Math.max(0, xx))) * 3);
    const cbg: Rgb = [flat[at(x0 + 3, y0 + 3)], flat[at(x0 + 3, y0 + 3) + 1], flat[at(x0 + 3, y0 + 3) + 2]];
    const strip = (fx: (k: number) => [number, number], n: number) => {
      let on = 0;
      for (let k = 0; k < n; k++) {
        const [xx, yy] = fx(k);
        if (dist(flat, at(xx, yy), cbg) > 60) on++;
      }
      return on / n;
    };
    const s = 2 * DPR;
    const sides = {
      top: strip((k) => [x0 + k, y0 + s], cw),
      bottom: strip((k) => [x0 + k, y0 + ch - 1 - s], cw),
      left: strip((k) => [x0 + s, y0 + k], ch),
      right: strip((k) => [x0 + cw - 1 - s, y0 + k], ch),
    };
    const cut = Object.entries(sides).filter(([, f]) => f > 0.15);
    if (cut.length) throw new Error(`3D content cut at the canvas ${cut.map(([k, f]) => `${k} (${Math.round(f * 100)}%)`).join(", ")}`);
  }

  // ---- Fit: trim empty margins, pad, letterbox into 640×480 on the card background ----
  const bgObj = { r: geo.bg[0], g: geo.bg[1], b: geo.bg[2], alpha: 1 };
  const flatPng = await sharp(png).flatten({ background: bgObj }).png().toBuffer();
  const trimmed = await sharp(flatPng).trim({ background: bgObj, threshold: 14 }).png().toBuffer().catch(() => flatPng);
  const padded = await sharp(trimmed).extend({ top: PAD * DPR, bottom: PAD * DPR, left: PAD * DPR, right: PAD * DPR, background: bgObj }).png().toBuffer();
  const dir = path.join(outRoot, locale, theme);
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.webp`);
  await sharp(padded).resize({ width: WIDTH, height: HEIGHT, fit: "contain", background: bgObj, withoutEnlargement: false }).webp({ quality: 82, effort: 5 }).toFile(file);
  return { file, auto: info.auto };
}

const browser = await chromium.launch();
// VARIANT=en/light limits a run to one variant (quick checks).
const pickVariants = variants.filter((v) => !process.env.VARIANT || process.env.VARIANT === `${v.locale}/${v.theme}`);
let jobs = slugs.filter((s) => !NO_VISUAL.has(s)).flatMap((slug) => pickVariants.map((v) => ({ slug, ...v })));
const done: string[] = [];
const autoPicked = new Set<string>();
let failures: { slug: string; locale: string; theme: string; reason: string }[] = [];
for (let attempt = 1; attempt <= retries && jobs.length; attempt++) {
  failures = [];
  // A small worker pool (CONCURRENCY, default 4): each job still gets its own fresh context.
  const queue = [...jobs];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: DPR, colorScheme: job.theme, reducedMotion: "reduce" });
      const page = await context.newPage();
      try {
        const r = await capture(page, job.slug, job.locale, job.theme, attempt);
        done.push(r.file);
        if (r.auto) autoPicked.add(job.slug);
      } catch (e) {
        failures.push({ ...job, reason: String(e).split("\n")[0].replace(/^Error: /, "").slice(0, 160) });
      }
      await context.close();
    }
  };
  await Promise.all(Array.from({ length: Number(process.env.CONCURRENCY ?? 4) }, worker));
  if (failures.length && attempt < retries) console.log(`attempt ${attempt}: ${failures.length} failed, retrying with a longer wait`);
  jobs = failures.map(({ slug, locale, theme }) => ({ slug, locale, theme }) as (typeof jobs)[number]);
}
await browser.close();
const bytes = done.reduce((a, f) => a + statSync(f).size, 0);
const noVisual = slugs.filter((s) => NO_VISUAL.has(s));
console.log(`previews: ${done.length} images for ${slugs.length - noVisual.length} tools, ${(bytes / 1024 / 1024).toFixed(2)} MB, ${failures.length} failures`);
if (noVisual.length) console.log(`no visual (skipped): ${noVisual.join(", ")}`);
if (autoPicked.size) console.log(`UNMARKED (auto-picked, add data-preview="visual"): ${[...autoPicked].join(", ")}`);
for (const f of failures) console.log(`FAILED ${f.locale}/${f.theme}/${f.slug}: ${f.reason}`);
process.exit(failures.length ? 1 : 0);
