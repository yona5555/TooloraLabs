// Served tool-card previews, checked as a visitor gets them (no screenshots: DOM values + fetched bytes).
// Opens /tools and every category page in ar and en, light and dark; for every tool card:
//  - the image shown is the approved one: the served bytes' sha256 equals approved.json and the URL
//    carries that hash (?v=), so a stale image can never be shown;
//  - object-fit is contain (never cover) in a 4:3 box on the image's own background;
//  - the image box lies fully inside its preview box and the card (nothing cropped);
//  - a card without an image is a tool with no approved image for that variant.
// Usage (prod server on 3001): npm run test:cards --workspace=apps/web   Env: BASE.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE ?? "http://localhost:3001";
const approved = JSON.parse(readFileSync(path.join(here, "../public/tool-previews/approved.json"), "utf8"));
const categories = [...readFileSync(path.join(here, "../data/categories.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
const pages = ["/tools", ...categories.map((c) => `/categories/${c}`)];
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

const browser = await chromium.launch();
const fails = [];
let total = 0;
let cardFails = 0;
let placeholders = 0;
let pagesWithCards = 0;
for (const locale of ["ar", "en"])
  for (const theme of ["light", "dark"]) {
    const set = locale === "ar" ? "ar" : "en";
    const variant = `${set}/${theme}`;
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: theme });
    await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
    const page = await context.newPage();
    for (const p of pages) {
      const url = `${base}/${locale}${p}`;
      const res = await page.goto(url, { waitUntil: "load", timeout: 90_000 });
      const where = `${locale}/${theme} ${p}`;
      if (!res || res.status() >= 400) {
        fails.push(`${where}: HTTP ${res?.status()}`);
        continue;
      }
      // A section with fewer than 3 live tools has no page; next.config.ts 301-redirects it elsewhere.
      if (res.request().redirectedFrom()) continue;
      if ((await page.evaluate(() => document.documentElement.classList.contains("dark"))) !== (theme === "dark")) {
        fails.push(`${where}: theme is not ${theme}`);
        continue;
      }
      const n = await page.locator("[data-card-preview]").count();
      if (n) pagesWithCards++;
      for (let i = 0; i < n; i++) {
        const box = page.locator("[data-card-preview]").nth(i);
        await box.scrollIntoViewIfNeeded();
        const slug = await box.evaluate((b) => b.closest("a")?.getAttribute("href")?.split("/tools/")[1]?.split(/[?#]/)[0] ?? "");
        const a = approved[slug]?.[variant];
        const img = box.locator("img").filter({ visible: true });
        if (!(await img.count())) {
          if (a) fails.push(`${where} ${slug}: approved image not shown (placeholder instead)`);
          else placeholders++;
          continue;
        }
        total++;
        const tag = `${where} ${slug}`;
        if (!a) {
          fails.push(`${tag}: shows an image that is not approved`);
          cardFails++;
          continue;
        }
        await img.evaluate((im) => (im.complete && im.naturalWidth ? null : new Promise((r) => im.addEventListener("load", r, { once: true }))));
        const m = await img.evaluate((im) => {
          const card = im.closest("a").getBoundingClientRect();
          const col = im.closest("[data-card-preview]").getBoundingClientRect();
          const r = im.getBoundingClientRect();
          const inside = (o) => r.left >= o.left - 0.5 && r.right <= o.right + 0.5 && r.top >= o.top - 0.5 && r.bottom <= o.bottom + 0.5;
          return {
            src: im.currentSrc || im.src,
            fit: getComputedStyle(im).objectFit,
            bg: getComputedStyle(im).backgroundColor,
            colBg: getComputedStyle(im.closest("[data-card-preview]")).backgroundColor,
            w: r.width,
            h: r.height,
            nw: im.naturalWidth,
            nh: im.naturalHeight,
            inCol: inside(col),
            inCard: inside(card),
          };
        });
        const body = await page.request.get(m.src);
        const servedHash = sha(await body.body());
        const err = [];
        if (body.status() !== 200) err.push(`HTTP ${body.status()} for ${m.src}`);
        if (servedHash !== a.sha256) err.push(`served hash ${servedHash.slice(0, 12)} ≠ approved ${a.sha256.slice(0, 12)}`);
        if (new URL(m.src).searchParams.get("v") !== a.sha256.slice(0, 16)) err.push(`URL has no content hash (${m.src})`);
        if (m.fit !== "contain") err.push(`object-fit is ${m.fit}`);
        if (m.nw !== 640 || m.nh !== 480) err.push(`natural size ${m.nw}×${m.nh}`);
        if (!m.w || Math.abs(m.w / m.h - 4 / 3) > 0.01) err.push(`box is ${m.w.toFixed(1)}×${m.h.toFixed(1)}, not 4:3`);
        if (!m.inCol || !m.inCard) err.push("image box cut by its container");
        if (m.bg !== rgb(a.bg) || m.colBg !== rgb(a.bg)) err.push(`background ${m.bg}/${m.colBg} ≠ image ${a.bg}`);
        if (err.length) {
          fails.push(`${tag}: ${err.join("; ")}`);
          cardFails++;
        }
      }
    }
    await context.close();
  }
await browser.close();
console.log(`served tool cards: ${total - cardFails}/${total} passed on ${pagesWithCards} pages (ar, en × light, dark); ${placeholders} placeholder cards (no approved image)`);
for (const f of fails) console.log(`FAIL ${f}`);
process.exit(fails.length || !total ? 1 : 0);
