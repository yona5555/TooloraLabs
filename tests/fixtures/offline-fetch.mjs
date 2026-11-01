// Test-mode data source for the desktop lock: preloaded into the Next.js server (and its build) with
// NODE_OPTIONS=--import, it answers every external fetch from recorded fixtures in tests/fixtures/live/,
// so no page waits on the network and live prices, rates and weather never change the layout or the values.
//   LIVE_FIXTURES=replay (default)  -> answer from fixtures; an unrecorded URL gets 503 at once (logged)
//   LIVE_FIXTURES=record            -> fetch for real and save each response (needs the API keys)
// Fixture names never hold secrets: the API key values are replaced by KEY before hashing, and in replay
// the keys are set to a dummy so the keyed code paths (forex, metals, oil) render as they do in production.
// Timestamps and dates in URLs (candle windows, history ranges) are normalised so a fixture recorded
// on one day answers on every day.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "live");
const MODE = process.env.LIVE_FIXTURES === "record" ? "record" : "replay";
const KEYS = ["EXCHANGE_RATE_API_KEY", "METALPRICE_API_KEY", "OILPRICE_API_KEY", "FRED_API_KEY"];
if (MODE === "replay") for (const k of KEYS) process.env[k] = "fixture";
// Replay also fixes the server's data clock (apps/web/lib/data-clock.ts) at the locks' page clock
// (tests/desktop-lock.mjs, 2026-10-20 12:00 UTC): the fixtures are fixed, and so is the hour, candle window and
// "today" the server picks from them, so two fixture builds render the same values (New York temperature included).
// Date itself is pinned too, so everything the build renders from `new Date()` agrees with the audit's browser clock.
if (MODE === "replay") {
  process.env.TOOLORA_FIXED_NOW = "2026-10-20T12:00:00Z";
  const fixed = Date.parse(process.env.TOOLORA_FIXED_NOW);
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...args) {
      if (args.length) super(...args);
      else super(fixed);
    }
    static now = () => fixed;
    static parse = RealDate.parse; // named here: Next's render sandbox does not see inherited statics
    static UTC = RealDate.UTC;
  };
}

const realFetch = globalThis.fetch;
const missed = new Set();

function fixtureName(url) {
  let u = url;
  for (const k of KEYS) if (process.env[k]) u = u.split(process.env[k]).join("KEY");
  u = u.replace(/\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?/g, "DATE").replace(/\b\d{9,13}\b/g, "TS");
  const host = new URL(url).hostname.replace(/[^a-z0-9.-]/gi, "_");
  return `${host}-${createHash("sha256").update(u).digest("hex").slice(0, 16)}.json`;
}

globalThis.fetch = async function fixtureFetch(input, init) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!/^https?:/.test(url) || /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url)) return realFetch(input, init);
  const file = join(DIR, fixtureName(url));
  if (MODE === "record") {
    const res = await realFetch(input, init);
    const body = await res.clone().text();
    mkdirSync(DIR, { recursive: true });
    writeFileSync(file, JSON.stringify({ status: res.status, type: res.headers.get("content-type"), body }) + "\n");
    return res;
  }
  if (!existsSync(file)) {
    const shown = new URL(url).origin + new URL(url).pathname;
    if (!missed.has(shown)) console.error(`[live-fixtures] no fixture, answered 503: ${shown}`);
    missed.add(shown);
    return new Response("no fixture", { status: 503 });
  }
  const { status, type, body } = JSON.parse(readFileSync(file, "utf8"));
  return new Response(body, { status, headers: type ? { "content-type": type } : {} });
};
