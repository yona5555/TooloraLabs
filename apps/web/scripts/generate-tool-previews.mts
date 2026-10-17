// Tool-card preview images: the REAL top interface (input column + result column) of every tool,
// in ar/en × light/dark, saved as ~640px WebP to public/tool-previews/{ar|en}/{light|dark}/{slug}.webp.
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
    const resultBox = document.querySelector<HTMLElement>("[data-tool-result]")!;
    const grid = resultBox.parentElement!;
    // Related-tools sidebar + ads: the grid's out-of-flow third column.
    [...grid.children].forEach((c) => {
      const el = c as HTMLElement;
      if (el !== resultBox && el.className.includes("lg:absolute")) el.style.visibility = "hidden";
    });
    document.querySelectorAll<HTMLElement>("ins, iframe, [data-ad]").forEach((el) => (el.style.visibility = "hidden"));
    const input = resultBox.previousElementSibling as HTMLElement | null;
    const boxes = [resultBox, input].filter(Boolean).map((e) => e!.getBoundingClientRect());
    const left = Math.min(...boxes.map((b) => b.left));
    const right = Math.max(...boxes.map((b) => b.right));
    const top = Math.min(...boxes.map((b) => b.top)) + window.scrollY;
    const bottom = Math.max(...boxes.map((b) => b.bottom)) + window.scrollY;
    return { x: Math.max(0, left - 8), y: Math.max(0, top - 8), width: right - left + 16, height: Math.min(bottom - top + 16, 1400) };
  });
  if (clip.width < 300 || clip.height < 150) throw new Error(`top section too small (${Math.round(clip.width)}×${Math.round(clip.height)})`);
  const png = await page.screenshot({ clip, fullPage: true, animations: "disabled" });
  const dir = path.join(outRoot, locale, theme);
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.webp`);
  await sharp(png).resize({ width: WIDTH }).webp({ quality: 78, effort: 5 }).toFile(file);
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
