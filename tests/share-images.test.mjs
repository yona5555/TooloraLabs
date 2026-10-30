// Every sitemap URL carries og:image and twitter:image, both pointing at its own share image
// (/share/{locale}/{key}.png, lib/indexable-pages.ts), and that image answers 200 image/png.
// The page list is the served sitemap itself, so a page added to the registry is checked with no edit here.
//   BASE=http://localhost:<port> npm run test:share-images     (a server you started on a free port)
//   OUT=<file> also writes the sha256 of every image (two builds' files must be identical: determinism).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { requireBase } from "../scripts/lib/require-base.mjs";

const BASE = requireBase(process.env.BASE);
const CONCURRENCY = 8;

const meta = (html, attr, name) => {
  const tag = html.match(new RegExp(`<meta[^>]*${attr}="${name.replace(":", "\\:")}"[^>]*>`))?.[0];
  return tag?.match(/content="([^"]*)"/)?.[1]?.replaceAll("&amp;", "&");
};
const local = (url) => BASE + new URL(url).pathname;

async function pool(items, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

test("every sitemap URL has og:image and twitter:image that answer 200 image/png", async () => {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(urls.length > 0, "the sitemap lists no URL");
  const failures = [];
  const hashes = {};
  const perLocale = {};
  await pool(urls, async (url) => {
    const page = local(url);
    const res = await fetch(page);
    if (res.status !== 200) return failures.push(`${page}: page answered ${res.status}`);
    const html = await res.text();
    const og = meta(html, "property", "og:image");
    const tw = meta(html, "name", "twitter:image");
    if (!og) return failures.push(`${page}: no og:image`);
    if (!tw) return failures.push(`${page}: no twitter:image`);
    if (local(og) !== local(tw)) failures.push(`${page}: og:image ${og} and twitter:image ${tw} differ`);
    const locale = new URL(url).pathname.split("/")[1];
    if (!new URL(og).pathname.startsWith(`/share/${locale}/`)) failures.push(`${page}: og:image ${og} is not this locale's share image`);
    const img = await fetch(local(og));
    const type = img.headers.get("content-type");
    if (img.status !== 200 || type !== "image/png") return failures.push(`${page}: ${og} answered ${img.status} ${type}`);
    hashes[new URL(og).pathname] = createHash("sha256").update(Buffer.from(await img.arrayBuffer())).digest("hex");
    perLocale[locale] = (perLocale[locale] ?? 0) + 1;
  });
  console.log(`share images: ${urls.length} sitemap URLs, per locale ${JSON.stringify(perLocale)}, ${Object.keys(hashes).length} distinct images`);
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(Object.fromEntries(Object.entries(hashes).sort()), null, 1) + "\n");
  assert.deepEqual(failures, [], failures.join("\n"));
});
