import { SITE_URL } from "@/lib/site";

/**
 * Shared fetch layer for the weather tool's upstream sources (docs/legal/data-sources.md):
 * - an identifying User-Agent on every request (MET Norway terms);
 * - an in-memory cache that honours each response's Expires header, revalidated with
 *   If-Modified-Since (MET Norway: "Web servers and mobile apps should cache all API responses");
 * - a process-wide limiter of 10 requests/second, half of MET Norway's 20 req/s application cap;
 * - de-duplication of identical in-flight requests.
 * A stale copy is served if a refresh fails, so a brief upstream outage never blanks the page.
 */
export const WEATHER_USER_AGENT = `TooloraLabs/1.0 (+${SITE_URL}; info@tooloralabs.com)`;

const MAX_PER_SECOND = 10;
const MAX_ENTRIES = 400;

type Entry = { data: unknown; expires: number; lastModified: string | null };
const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<Entry>>();
let windowStarts: number[] = [];

async function acquireSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    windowStarts = windowStarts.filter((t) => now - t < 1000);
    if (windowStarts.length < MAX_PER_SECOND) {
      windowStarts.push(now);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000 - (now - windowStarts[0]) + 5));
  }
}

function expiresFrom(res: Response, minTtlMs: number, fallbackTtlMs: number): number {
  const now = Date.now();
  const header = Date.parse(res.headers.get("expires") ?? "");
  const exp = Number.isFinite(header) ? header : now + fallbackTtlMs;
  return Math.max(exp, now + minTtlMs);
}

function remember(url: string, entry: Entry) {
  cache.delete(url);
  cache.set(url, entry);
  if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
}

async function refresh(url: string, stale: Entry | undefined, minTtlMs: number, fallbackTtlMs: number): Promise<Entry> {
  await acquireSlot();
  const headers: Record<string, string> = { "User-Agent": WEATHER_USER_AGENT, Accept: "application/json" };
  if (stale?.lastModified) headers["If-Modified-Since"] = stale.lastModified;
  try {
    // A Next data-cache window equal to the minimum TTL keeps ISR pages static between refreshes.
    const res = await fetch(url, { headers, next: { revalidate: Math.round(minTtlMs / 1000) } });
    if (res.status === 304 && stale) {
      const entry = { ...stale, expires: expiresFrom(res, minTtlMs, fallbackTtlMs) };
      remember(url, entry);
      return entry;
    }
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const entry: Entry = { data: await res.json(), expires: expiresFrom(res, minTtlMs, fallbackTtlMs), lastModified: res.headers.get("last-modified") };
    remember(url, entry);
    return entry;
  } catch (err) {
    if (stale) return stale;
    throw err;
  }
}

/** JSON from `url`, cached until the upstream Expires time (bounded below by `minTtlMs`). */
export async function cachedJson<T>(url: string, opts: { minTtlMs?: number; fallbackTtlMs?: number } = {}): Promise<{ data: T; expires: number }> {
  const minTtlMs = opts.minTtlMs ?? 60_000;
  const fallbackTtlMs = opts.fallbackTtlMs ?? 15 * 60_000;
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return { data: hit.data as T, expires: hit.expires };
  let p = inflight.get(url);
  if (!p) {
    p = refresh(url, hit, minTtlMs, fallbackTtlMs).finally(() => inflight.delete(url));
    inflight.set(url, p);
  }
  const entry = await p;
  return { data: entry.data as T, expires: entry.expires };
}

/** Cache-Control for our own API responses, so the CDN also holds them until the upstream expiry. */
export function cacheHeaders(expires: number): Record<string, string> {
  const s = Math.max(30, Math.floor((expires - Date.now()) / 1000));
  return { "Cache-Control": `public, max-age=0, s-maxage=${s}, stale-while-revalidate=60` };
}
