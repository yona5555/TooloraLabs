// Deterministic performance budgets: what a page ships, never how fast one machine ran it, so two runs on one build
// give identical numbers and a required PR check can compare them with zero tolerance (scripts/ratchet.mjs). Two CI
// runs of the same code differed by up to 1.7 s of Lighthouse LCP, which is why timing lives in the daily
// scripts/perf-budget.mjs (5 runs, median) and not on PRs. Per page of the served /sitemap.xml:
//   jsBytes     gzip bytes of the JavaScript the server HTML loads (scripts + preloads)
//   cssBytes    gzip bytes of its stylesheets
//   blocking    render-blocking resources: stylesheets, and head scripts without async/defer/module
//   requests    the document plus every distinct resource its HTML loads
//   lcpInHtml   the largest text block or image in the first 412x823 of the settled page is already in the server
//               HTML. Computed from the DOM: Chromium's own LCP entry names whichever candidate painted in time.
// Exits 1 on any page over BUDGET; with RATCHET_MEASURE=1 the results only go to OUT and the ratchet decides.
//   env BASE (required)  LOCALES=en,ar  SHARD=i/n  JOBS=3  PAGES=<file>  OUT=<file.json>
import { writeFileSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";
import { requireBase } from "../../../scripts/lib/require-base.mjs";
import { settle } from "../../../scripts/lib/settle.mjs";
import { sliceShard } from "../../../scripts/lib/shard-pages.mjs";

const BUDGET = { jsBytes: 350 * 1024, cssBytes: 60 * 1024, blocking: 3, requests: 60, lcpInHtml: true };
const OVER = {
  jsBytes: (v) => v > BUDGET.jsBytes,
  cssBytes: (v) => v > BUDGET.cssBytes,
  blocking: (v) => v > BUDGET.blocking,
  requests: (v) => v > BUDGET.requests,
  lcpInHtml: (v) => !v,
};

const base = requireBase(process.env.BASE);
const locales = (process.env.LOCALES ?? "en,ar").split(",");
const shard = process.env.SHARD ?? "1/1";
const jobs = Number(process.env.JOBS ?? 3);

const sitemap = await fetch(`${base}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`${base}/sitemap.xml answered ${sitemap.status}`);
const urls = [...new Set([...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => locales.includes(p.split("/")[1])))];
const listed = process.env.PAGES ? new Set(readFileSync(process.env.PAGES, "utf8").split("\n").filter(Boolean)) : null;
const selected = urls.filter((p) => !listed || listed.has(p));
if (!selected.length) throw new Error(`no page to measure (sitemap ${urls.length} pages)`);
const pages = sliceShard(selected, shard);

const decode = (s) => s.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&#39;", "'");
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].slice(1).map((m) => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? "")]));
const sizes = new Map(); // url -> gzip bytes, shared by the pages of a shard
function gzipBytes(url) {
  if (!sizes.has(url))
    sizes.set(url, fetch(url).then(async (r) => {
      if (!r.ok) throw new Error(`${url} answered ${r.status}`);
      return gzipSync(Buffer.from(await r.arrayBuffer()), { level: 9 }).length;
    }));
  return sizes.get(url);
}

/** What the server HTML loads, read from the HTML alone. */
async function fromHtml(html, pageUrl) {
  const headEnd = html.indexOf("</head>");
  const js = new Set(), css = new Set(), other = new Set();
  let blocking = 0;
  const abs = (u) => new URL(u, pageUrl).href;
  for (const m of html.matchAll(/<(script|link|img)\b[^>]*>/gi)) {
    const tag = m[1].toLowerCase(), a = attrs(m[0]);
    if (tag === "script" && a.src) {
      js.add(abs(a.src));
      if (m.index < headEnd && !("async" in a) && !("defer" in a) && a.type !== "module") blocking++;
    } else if (tag === "link" && a.href) {
      const rel = a.rel ?? "";
      if (rel === "stylesheet") {
        css.add(abs(a.href));
        if (!a.media || a.media === "all") blocking++;
      } else if (rel === "modulepreload" || (rel === "preload" && a.as === "script")) js.add(abs(a.href));
      else if (rel === "preload" && a.as === "style") css.add(abs(a.href));
      else if (rel === "preload") other.add(abs(a.href));
    } else if (tag === "img" && a.src && a.loading !== "lazy") other.add(abs(a.src));
  }
  const sum = async (set) => (await Promise.all([...set].map(gzipBytes))).reduce((n, b) => n + b, 0);
  return { jsBytes: await sum(js), cssBytes: await sum(css), blocking, requests: 1 + new Set([...js, ...css, ...other]).size };
}

/** The visible text of the server HTML (no script payloads: a client-rendered page must not pass on its RSC data). */
const serverText = (html) => decode(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");

/** The largest visible text block or image inside the viewport; on equal area the first in document order. */
function largestElement() {
  let best = null;
  for (const el of document.body.querySelectorAll("*")) {
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
    const style = getComputedStyle(el);
    if (style.visibility !== "visible" || style.opacity === "0") continue;
    const text = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
    const isImage = el.tagName === "IMG";
    if (!isImage && !text) continue;
    let rect = el.getBoundingClientRect();
    if (!isImage) {
      const range = document.createRange();
      range.selectNodeContents(el);
      rect = range.getBoundingClientRect();
    }
    const w = Math.min(rect.right, innerWidth) - Math.max(rect.left, 0);
    const h = Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0);
    if (w <= 0 || h <= 0 || (best && w * h <= best.area)) continue;
    best = { area: w * h, src: isImage ? el.getAttribute("src") : null, text: text.slice(0, 60) };
  }
  return best;
}

async function lcpInServerHtml(ctx, url, html) {
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: "load", timeout: 120000 });
    await settle(p);
    const lcp = await p.evaluate(largestElement);
    if (!lcp) return { inHtml: false, element: null };
    return lcp.src ? { inHtml: decode(html).includes(lcp.src), element: lcp.src } : { inHtml: serverText(html).includes(lcp.text), element: lcp.text };
  } finally {
    await p.close();
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
await ctx.routeWebSocket(/^wss?:\/\//, () => {}); // live price streams stay silent, as in the site audit
const results = new Map();
const queue = [...pages];
await Promise.all(
  Array.from({ length: jobs }, async () => {
    while (queue.length) {
      const page = queue.shift();
      const url = `${base}${page}`;
      let r;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`answered ${res.status}`);
        const html = await res.text();
        const lcp = await lcpInServerHtml(ctx, url, html);
        const values = { ...(await fromHtml(html, url)), lcpInHtml: lcp.inHtml };
        r = { page, values, over: Object.keys(OVER).filter((k) => OVER[k](values[k])), error: null, lcpElement: lcp.element };
      } catch (e) {
        r = { page, values: null, over: ["error"], error: e.message.split("\n")[0].slice(0, 200), lcpElement: null };
      }
      results.set(page, r);
      console.log(`[${results.size}/${pages.length}] ${page} ${r.values ? JSON.stringify(r.values) : `error: ${r.error}`}${r.over.length ? `  OVER: ${r.over.join(",")}` : ""}`);
    }
  }),
);
await browser.close();

const all = pages.map((p) => results.get(p));
const over = all.filter((r) => r.over.length);
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify({ budget: BUDGET, locales, total: all.length, overBudget: over.length, pages: all }, null, 1) + "\n");
console.log(`TOTAL pages=${all.length} over-budget=${over.length} errors=${all.filter((r) => r.error).length}`);
if (over.length && !process.env.RATCHET_MEASURE) {
  console.error(`::error title=perf-static::${over.length} of ${all.length} pages over their deterministic budget`);
  process.exitCode = 1;
}
