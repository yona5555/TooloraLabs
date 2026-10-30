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
// Approved images are LOCKED in public/tool-previews/approved.json (slug → "locale/theme" → {sha256, bg}):
// they are never regenerated or overwritten. Unapproved variants of the named tools are generated, and
// every image that passes all gates is added to approved.json. One tool at a time; never all tools.
//
// Usage (BASE = a prod server you started on a free port, e.g. 3110):
//   npm run previews -- <slug>            generate the unapproved variants of one tool
//   npm run previews -- --force <slug>    regenerate an approved tool (drops its approval first)
//   npm run previews -- --audit [slug..]  check the EXISTING images (DOM gates on the live page + pixel
//                                         gates on the file) and approve the ones that pass; writes no image
// Env: BASE (required, e.g. http://localhost:3110), RETRIES (default 3), CONCURRENCY (default 4), VARIANT, VERBOSE, OUT.
// Deterministic (same build -> byte-identical files): every page gets the desktop lock's fixed environment —
// clock 2026-10-20 12:00 UTC, timezone UTC, locale en-US, seeded Math.random and crypto.getRandomValues,
// animations and transitions off, viewport 1440×1600 at DPR 2, no request or WebSocket beyond BASE (run it
// against the fixture build: npm run build:desktop-lock, then a server on a free port), fonts loaded.
import { createHash } from "node:crypto";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type ElementHandle, type Page } from "playwright";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
// OUT=<dir> writes the images (and their approvals) under that folder instead: a byte-identity check or a trial
// run never touches public/tool-previews or its approved.json.
const outRoot = process.env.OUT ? path.resolve(process.env.OUT) : path.join(here, "../public/tool-previews");
const base = requireBase(process.env.BASE);
const retries = Number(process.env.RETRIES ?? 3);
const args = process.argv.slice(2);
const audit = args.includes("--audit");
const forced = new Set(args.flatMap((a, i) => (args[i - 1] === "--force" ? [a] : [])));
const only = args.filter((a) => !a.startsWith("-"));
const allSlugs = [...new Set([...readFileSync(path.join(here, "../data/tools.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]))];
for (const s of only) if (!allSlugs.includes(s)) throw new Error(`unknown tool slug: ${s}`);
// Never all tools in one generating run: an explicit tool list is required (an audit may cover all).
if (!audit && !only.length) {
  console.error("Name the tool(s) to generate: npm run previews -- <slug> (approved images are skipped; --force <slug> to redo one).");
  process.exit(2);
}
const slugs = only.length ? only : allSlugs;
const approvedFile = path.join(outRoot, "approved.json");
type Approval = { sha256: string; bg: string };
const approved: Record<string, Record<string, Approval>> = existsSync(approvedFile) ? JSON.parse(readFileSync(approvedFile, "utf8")) : {};
const sha256 = (f: string) => createHash("sha256").update(readFileSync(f)).digest("hex");
const saveApproved = () => {
  const sorted = Object.fromEntries(Object.keys(approved).sort().map((k) => [k, Object.fromEntries(Object.keys(approved[k]).sort().map((v) => [v, approved[k][v]]))]));
  writeFileSync(approvedFile, JSON.stringify(sorted, null, 2) + "\n");
};
const hex = (c: Rgb) => "#" + c.map((n) => n.toString(16).padStart(2, "0")).join("");
for (const s of forced) delete approved[s];
/** Tools with no drawing-only element: file tools (nothing before a file is added) and the colour
 * palette (its swatches are copy buttons). No image (neutral placeholder), reported. */
const NO_VISUAL = new Set<string>();
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
/** Final-image gate: no content within this many px of any edge of the 640×480 image. */
const EDGE = 8;
/** Never inside a preview: the capture is the drawing, not the tool's controls or tables. */
const FORBIDDEN = "input, select, textarea, button, label, table, form";

type Rgb = [number, number, number];
const dist = (a: ArrayLike<number>, i: number, c: Rgb) => Math.abs(a[i] - c[0]) + Math.abs(a[i + 1] - c[1]) + Math.abs(a[i + 2] - c[2]);

/** Pixel gates on a finished 640×480 card image: size, not blank, nothing within EDGE px of an edge, and
 * (when known) its background equals the live card background (a stale image fails). */
async function imageGates(file: string, liveBg?: Rgb): Promise<Rgb> {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== WIDTH || info.height !== HEIGHT) throw new Error(`image is ${info.width}×${info.height}, not ${WIDTH}×${HEIGHT}`);
  // Background = per-channel median of the 4 corners (lossy WebP can shift one corner pixel slightly).
  const corners = [0, (WIDTH - 1) * 3, (HEIGHT - 1) * WIDTH * 3, ((HEIGHT - 1) * WIDTH + WIDTH - 1) * 3];
  const med = (k: number) => corners.map((i) => data[i + k]).sort((x, y) => x - y).slice(1, 3).reduce((x, y) => x + y) / 2;
  const bg: Rgb = [med(0), med(1), med(2)].map(Math.round) as Rgb;
  if (corners.some((i) => dist(data, i, bg) > 12)) throw new Error("image corners differ (not letterboxed on one background)");
  if (liveBg && dist(bg, 0, liveBg) > 6) throw new Error(`image background ${hex(bg)} ≠ live card background ${hex(liveBg)} (stale image)`);
  let content = 0;
  let edge = 0;
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      if (dist(data, (y * WIDTH + x) * 3, bg) <= 30) continue;
      content++;
      if (x < EDGE || y < EDGE || x >= WIDTH - EDGE || y >= HEIGHT - EDGE) edge++;
    }
  if (edge) throw new Error(`content within ${EDGE}px of the image edge (${edge} px, clipped)`);
  if (content / (WIDTH * HEIGHT) < 0.02) throw new Error(`nearly blank (${((100 * content) / (WIDTH * HEIGHT)).toFixed(1)}% content)`);
  return bg;
}

/** DOM gates on the live visual: no controls/tables inside, every label fully visible. Returns the
 * card background (rgb) behind the visual. */
async function domGates(el: ElementHandle<Element>, forbidden: string): Promise<Rgb> {
  const r = await el.evaluate((e, sel) => {
    const shown = (x: Element) => {
      const b = x.getBoundingClientRect();
      const st = getComputedStyle(x);
      return b.width > 1 && b.height > 1 && st.visibility !== "hidden" && st.display !== "none" && st.clip === "auto" && st.clipPath === "none";
    };
    // lightweight-charts lays its canvases out in a text-free <table>: that table IS the chart.
    const chartLayout = (x: Element) => x.matches(".tv-lightweight-charts > table") && !(x as HTMLElement).innerText.trim();
    const bad = [...e.querySelectorAll(sel)].filter((x) => shown(x) && !chartLayout(x)).map((x) => x.tagName.toLowerCase());
    if (e.matches(sel)) bad.push(e.tagName.toLowerCase());
    const clipped: string[] = [];
    const mc = document.createElement("canvas").getContext("2d")!;
    // Cut = partly visible: a label wholly outside its clip box is simply not drawn (e.g. axis ticks
    // beyond a graph's viewport); a label straddling the edge shows half a number.
    const cut = (b: DOMRect, o: DOMRect) => {
      const inside = b.left >= o.left - 1 && b.right <= o.right + 1 && b.top >= o.top - 1 && b.bottom <= o.bottom + 1;
      const outside = b.right <= o.left + 1 || b.left >= o.right - 1 || b.bottom <= o.top + 1 || b.top >= o.bottom - 1;
      return !inside && !outside;
    };
    for (const d of [e, ...e.querySelectorAll("*")]) {
      const own = [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own || !shown(d)) continue;
      const b = d.getBoundingClientRect();
      const label = (d.textContent ?? "").trim().slice(0, 30);
      if (d instanceof SVGElement) {
        const svg = (d as SVGGraphicsElement).ownerSVGElement;
        if (svg && getComputedStyle(svg).overflow !== "visible") {
          // SVG text boxes are font boxes (ascent + descent); judge the glyph ink instead, so the empty
          // descent band under digits is not counted as a cut label.
          const st = getComputedStyle(d);
          mc.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
          const m = mc.measureText(d.textContent ?? "");
          const k = b.height / (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent || 1);
          const top = b.top + Math.max(0, m.fontBoundingBoxAscent - m.actualBoundingBoxAscent) * k;
          const bottom = b.bottom - Math.max(0, m.fontBoundingBoxDescent - m.actualBoundingBoxDescent) * k;
          const ink = new DOMRect(b.left, top, b.width, Math.max(1, bottom - top));
          if (cut(ink, svg.getBoundingClientRect())) clipped.push(label);
        }
        continue;
      }
      const st = getComputedStyle(d);
      if (st.overflow !== "visible" && (d.scrollWidth > d.clientWidth + 1 || d.scrollHeight > d.clientHeight + 1)) {
        clipped.push(label);
        continue;
      }
      for (let p = d.parentElement; p && p !== e.parentElement; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (o.overflowX === "visible" && o.overflowY === "visible") continue;
        const pr = p.getBoundingClientRect();
        if (cut(b, pr)) clipped.push(label);
        break;
      }
    }
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
    return { bad: [...new Set(bad)], clipped, bg: [px[0], px[1], px[2]] as Rgb };
  }, forbidden);
  if (r.bad.length) throw new Error(`controls/tables inside the visual: ${r.bad.join(", ")}`);
  if (r.clipped.length) throw new Error(`label(s) clipped: ${r.clipped.slice(0, 4).map((t) => JSON.stringify(t)).join(", ")}`);
  return r.bg;
}

async function capture(page: Page, slug: string, locale: string, theme: string, attempt: number): Promise<{ file: string; auto: boolean; bg: Rgb }> {
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
    let hero = marked.find((e) => e.hasAttribute("data-preview-hero")) ?? marked.find((e) => res?.contains(e)) ?? marked[0];
    // A wrapper holding exactly one marked drawing (e.g. a scene plus its Replay button): the drawing.
    for (let inner = hero && [...hero.querySelectorAll("[data-preview='visual']")].filter(big); inner?.length === 1; inner = [...hero.querySelectorAll("[data-preview='visual']")].filter(big)) hero = inner[0];
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
        // Charts: every finite CSS/Web animation inside the visual has finished.
        if (e.getAnimations({ subtree: true }).some((a) => a.playState === "running" && Number.isFinite(Number(a.effect?.getComputedTiming().endTime)))) return false;
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
  // Settled: two renders of the visual 400 ms apart are pixel-identical (3D intro animations and JS
  // chart tweens run outside CSS animations, past the 30-frame flag).
  for (let prev = "", n = 0; ; n++) {
    const cur = createHash("sha256").update(await el.screenshot({ animations: "disabled" })).digest("hex");
    if (cur === prev) break;
    if (n >= 25) throw new Error("visual never settled (still animating after 10 s)");
    prev = cur;
    await page.waitForTimeout(400);
  }
  const liveBg = await domGates(el, FORBIDDEN);
  const dir = path.join(outRoot, locale, theme);
  const file = path.join(dir, `${slug}.webp`);
  if (audit) {
    if (!existsSync(file)) throw new Error("no image file");
    if (info.auto) throw new Error('visual not marked with data-preview="visual"');
    await imageGates(file, liveBg);
    return { file, auto: info.auto, bg: liveBg };
  }

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
  // Letterbox: the whole drawing scaled into 640×480 minus PAD on every side (never cropped).
  const inner = await sharp(trimmed).resize({ width: WIDTH - 2 * PAD, height: HEIGHT - 2 * PAD, fit: "contain", background: bgObj }).png().toBuffer();
  const out = await sharp(inner).extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: bgObj }).webp({ quality: 82, effort: 5 }).toBuffer();
  mkdirSync(dir, { recursive: true });
  // Gate the encoded image before it replaces anything on disk.
  const tmp = `${file}.tmp.webp`;
  writeFileSync(tmp, out);
  try {
    await imageGates(tmp, geo.bg);
  } catch (err) {
    unlinkSync(tmp);
    throw err;
  }
  renameSync(tmp, file);
  return { file, auto: info.auto, bg: geo.bg };
}

/** Runs in every page before its scripts: seeded randomness (mulberry32) and no CSS motion. */
function freezePage() {
  let seed = 0x2f6b9a1d;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  crypto.getRandomValues = <T extends ArrayBufferView | null>(arr: T): T => {
    if (!arr) return arr;
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return arr;
  };
  document.addEventListener("DOMContentLoaded", () => {
    const st = document.createElement("style");
    st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}";
    document.head.appendChild(st);
  });
}

const browser = await chromium.launch();
// VARIANT=en/light limits a run to one variant (quick checks).
const pickVariants = variants.filter((v) => !process.env.VARIANT || process.env.VARIANT === `${v.locale}/${v.theme}`);
const key = (v: { locale: string; theme: string }) => `${v.locale}/${v.theme}`;
const fileOf = (slug: string, v: { locale: string; theme: string }) => path.join(outRoot, v.locale, v.theme, `${slug}.webp`);
const locked: string[] = [];
let failures: { slug: string; locale: string; theme: string; reason: string }[] = [];
let jobs = slugs
  .filter((s) => !NO_VISUAL.has(s))
  .flatMap((slug) => pickVariants.map((v) => ({ slug, ...v })))
  .filter((j) => {
    const a = approved[j.slug]?.[key(j)];
    if (!a) return true;
    // Approved = locked. A locked file that no longer matches its hash is reported, never rewritten.
    if (!existsSync(fileOf(j.slug, j)) || sha256(fileOf(j.slug, j)) !== a.sha256) failures.push({ ...j, reason: "approved image missing or modified (restore it from git; never overwritten)" });
    else locked.push(`${j.slug} ${key(j)}`);
    return false;
  });
const lockedFailures = [...failures];
const done: string[] = [];
for (let attempt = 1; attempt <= retries && jobs.length; attempt++) {
  failures = [];
  // A small worker pool (CONCURRENCY, default 4): each job still gets its own fresh context.
  const queue = [...jobs];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: DPR, colorScheme: job.theme, reducedMotion: "reduce", timezoneId: "UTC", locale: "en-US" });
      await context.addInitScript(freezePage);
      const page = await context.newPage();
      await page.route((url) => new URL(url.href).origin !== new URL(base).origin, (route) => route.abort());
      await page.routeWebSocket(/.*/, () => {});
      await page.clock.setFixedTime(new Date("2026-10-20T12:00:00Z"));
      try {
        const r = await capture(page, job.slug, job.locale, job.theme, attempt);
        if (r.auto) throw new Error('visual not marked with data-preview="visual"');
        done.push(r.file);
        (approved[job.slug] ??= {})[key(job)] = { sha256: sha256(r.file), bg: hex(r.bg) };
        saveApproved();
      } catch (e) {
        failures.push({ ...job, reason: String(e).split("\n")[0].replace(/^Error: /, "").slice(0, 160) });
      }
      await context.close();
    }
  };
  await Promise.all(Array.from({ length: Number(process.env.CONCURRENCY ?? 4) }, worker));
  // An audit judges the existing file: retrying cannot change it, except for slow renders.
  if (failures.length && attempt < retries) console.log(`attempt ${attempt}: ${failures.length} failed, retrying with a longer wait`);
  jobs = failures.map(({ slug, locale, theme }) => ({ slug, locale, theme }) as (typeof jobs)[number]);
}
await browser.close();
failures = [...lockedFailures, ...failures];
const bytes = done.reduce((a, f) => a + statSync(f).size, 0);
const noVisual = slugs.filter((s) => NO_VISUAL.has(s));
console.log(`${audit ? "audit: approved" : "previews: generated"} ${done.length} images (${(bytes / 1024 / 1024).toFixed(2)} MB); ${locked.length} already approved (locked, skipped); ${failures.length} failures`);
if (noVisual.length) console.log(`no visual (text/file-only, no image): ${noVisual.join(", ")}`);
for (const f of failures.sort((a, b) => a.slug.localeCompare(b.slug))) console.log(`FAILED ${f.locale}/${f.theme}/${f.slug}: ${f.reason}`);
process.exit(failures.length ? 1 : 0);
