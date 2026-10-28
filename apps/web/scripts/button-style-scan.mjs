// Phone button-style scan (.claude/rules/visuals.md §9): every clickable action on a tool page must
// look like a button — a non-transparent background or a visible border, no text decoration, no
// underline-bar active indicator (a lone bottom border or a thin ::after bar), and a hit area of at
// least 44×44 (its own box, or an absolutely positioned ::before around it).
// Real navigation links are not actions and are not checked.
// Usage: node apps/web/scripts/button-style-scan.mjs --base http://localhost:3110 [--locales ar,en]
//        [--widths 360,390] [--slugs a,b] [--paths "",/tools] [--jobs 1] [--out file] [--details]
// --paths checks extra non-tool pages (path after the locale; "" = home). The home page is always included.
// Exit code 1 when any element fails.
import { writeFileSync } from "node:fs";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { chromium } from "playwright";

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const BASE = requireBase(arg("base"));
const LOCALES = arg("locales", "ar,en").split(",");
const WIDTHS = arg("widths", "360,390").split(",").map(Number);
// One page at a time by default: parallel loads against `next dev` compile routes concurrently,
// which once corrupted .next/dev/prerender-manifest.json (see patches/next+16.3.8.patch).
// Use --jobs N only against `next start`.
const JOBS = Number(arg("jobs", "1"));
const OUT = arg("out", "");
const DETAILS = process.argv.includes("--details");

let slugs = arg("slugs", "");
if (!slugs) {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  slugs = [...new Set([...xml.matchAll(/\/en\/tools\/([a-z0-9-]+)</g)].map((m) => m[1]))].join(",");
}
const SLUGS = slugs.split(",");
const PATHS = ["", ...arg("paths", "").split(",").filter(Boolean)].filter((p, i, a) => a.indexOf(p) === i);

// Runs in the page.
function measure() {
  const SELECTOR = 'button, [role="tab"], [role="button"], [role="switch"], summary, input[type="button"], input[type="submit"], input[type="reset"]';
  const transparent = (c) => c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    // sr-only / clipped
    if (s.clip === "rect(0px, 0px, 0px, 0px)" || s.clipPath === "inset(50%)") return false;
    return true;
  };
  const label = (el) => (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
  const sides = ["Top", "Right", "Bottom", "Left"];
  const fails = [];
  const main = document.querySelector("main") ?? document.body;
  for (const el of main.querySelectorAll(SELECTOR)) {
    if (!visible(el) || el.closest('[aria-hidden="true"], nextjs-portal, [data-scan-skip]')) continue;
    const s = getComputedStyle(el);
    const problems = [];
    const widths = sides.map((d) => (transparent(s[`border${d}Color`]) || s[`border${d}Style`] === "none" ? 0 : parseFloat(s[`border${d}Width`])));
    const hasBorder = widths.some((w) => w > 0);
    const hasBg = !transparent(s.backgroundColor) || s.backgroundImage !== "none";
    if (!hasBg && !hasBorder) problems.push("no background or border");
    if (s.textDecorationLine !== "none") problems.push(`text-decoration ${s.textDecorationLine}`);
    if (widths[2] > 0 && widths[0] === 0 && widths[1] === 0 && widths[3] === 0) problems.push("bottom-border underline indicator");
    const after = getComputedStyle(el, "::after");
    if (after.content !== "none" && after.position === "absolute" && !transparent(after.backgroundColor) && parseFloat(after.height) <= 4) problems.push("::after underline bar");
    const r = el.getBoundingClientRect();
    let w = r.width, h = r.height;
    const before = getComputedStyle(el, "::before");
    if (before.content !== "none" && before.position === "absolute") {
      w = Math.max(w, parseFloat(before.width) || 0);
      h = Math.max(h, parseFloat(before.height) || 0);
    }
    if (w < 43.5 || h < 43.5) problems.push(`hit area ${w.toFixed(0)}×${h.toFixed(0)}`);
    if (problems.length) fails.push({ label: label(el), tag: el.tagName.toLowerCase(), problems });
  }
  return { fails, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
}

const browser = await chromium.launch();
const jobs = [];
for (const slug of SLUGS) for (const locale of LOCALES) for (const width of WIDTHS) jobs.push({ slug, path: `/tools/${slug}`, locale, width });
for (const path of PATHS) for (const locale of LOCALES) for (const width of WIDTHS) jobs.push({ slug: path || "(home)", path, locale, width });
const results = [];
let next = 0;
async function worker() {
  const ctx = await browser.newContext({ isMobile: true, hasTouch: true, deviceScaleFactor: 2, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  while (next < jobs.length) {
    const job = jobs[next++];
    await page.setViewportSize({ width: job.width, height: 844 });
    try {
      await page.goto(`${BASE}/${job.locale}${job.path}`, { waitUntil: "networkidle", timeout: 120000 });
      results.push({ ...job, ...(await page.evaluate(measure)) });
    } catch (e) {
      results.push({ ...job, error: String(e).slice(0, 200), fails: [] });
    }
  }
  await ctx.close();
}
await Promise.all(Array.from({ length: JOBS }, worker));
await browser.close();

results.sort((a, b) => a.slug.localeCompare(b.slug) || a.locale.localeCompare(b.locale) || a.width - b.width);
const lines = [];
let total = 0;
for (const r of results) {
  if (r.error) { lines.push(`ERROR ${r.locale}${r.path} @${r.width}: ${r.error}`); total++; continue; }
  total += r.fails.length;
  for (const f of r.fails) lines.push(`${r.locale}${r.path || "/"} @${r.width}: <${f.tag}> "${f.label}" — ${f.problems.join("; ")}`);
}
lines.push(`TOTAL FAILURES: ${total} (${results.length} page loads)`);
if (OUT) writeFileSync(OUT, lines.join("\n") + "\n");
console.log(DETAILS ? lines.join("\n") : lines.at(-1));
process.exit(total ? 1 : 0);
