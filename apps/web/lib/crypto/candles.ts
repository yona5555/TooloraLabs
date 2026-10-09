import { aggregateCandles, clampBadWicks, aggregateCandlesByCalendar, type Candle, type CandleTimeframe } from "@tooloralabs/tools";

/**
 * OHLC candles from free, keyless exchange endpoints. Coinbase Exchange is the primary source
 * because it is US-based and not geo-blocked from US deploy regions (Binance/Bybit are);
 * Kraken is the fallback for coins Coinbase doesn't list against USD. Neither offers a native
 * 10-minute candle, so 10m is always built from 5-minute candles.
 */
const COINBASE_BASE = "https://api.exchange.coinbase.com";
const KRAKEN_BASE = "https://api.kraken.com/0/public";
const COINBASE_PAGE = 300;
const MAX_CANDLES = 300;

type Plan = {
  coinbaseGranularity: number;
  krakenInterval: number;
  pages: number;
  bucketSeconds?: number;
  calendar?: "month" | "year";
  revalidate: number;
};

const PLANS: Record<CandleTimeframe, Plan> = {
  "10m": { coinbaseGranularity: 300, krakenInterval: 5, pages: 2, bucketSeconds: 600, revalidate: 60 },
  "15m": { coinbaseGranularity: 900, krakenInterval: 15, pages: 1, revalidate: 60 },
  "30m": { coinbaseGranularity: 900, krakenInterval: 30, pages: 2, bucketSeconds: 1800, revalidate: 120 },
  "1h": { coinbaseGranularity: 3600, krakenInterval: 60, pages: 1, revalidate: 300 },
  "4h": { coinbaseGranularity: 3600, krakenInterval: 240, pages: 4, bucketSeconds: 14400, revalidate: 600 },
  "6h": { coinbaseGranularity: 21600, krakenInterval: 60, pages: 1, bucketSeconds: 21600, revalidate: 900 },
  "1D": { coinbaseGranularity: 86400, krakenInterval: 1440, pages: 1, revalidate: 1800 },
  "1M": { coinbaseGranularity: 86400, krakenInterval: 1440, pages: 13, calendar: "month", revalidate: 21600 },
  "1Y": { coinbaseGranularity: 86400, krakenInterval: 1440, pages: 13, calendar: "year", revalidate: 21600 },
};

export type CandleSource = "coinbase" | "kraken";
export type CandleResult = { candles: Candle[]; source: CandleSource; pair: string };

function finish(raw: Candle[], plan: Plan): Candle[] {
  const unique = new Map<number, Candle>();
  for (const c of raw) unique.set(c.time, c);
  let candles = clampBadWicks([...unique.values()].sort((a, b) => a.time - b.time));
  if (plan.calendar) candles = aggregateCandlesByCalendar(candles, plan.calendar);
  else if (plan.bucketSeconds && plan.bucketSeconds !== plan.coinbaseGranularity) candles = aggregateCandles(candles, plan.bucketSeconds);
  return candles.slice(-MAX_CANDLES);
}

async function fetchCoinbasePage(pair: string, granularity: number, end: number, revalidate: number): Promise<Candle[] | null> {
  const start = end - COINBASE_PAGE * granularity;
  const url = `${COINBASE_BASE}/products/${pair}/candles?granularity=${granularity}&start=${new Date(start * 1000).toISOString()}&end=${new Date(end * 1000).toISOString()}`;
  const res = await fetch(url, { next: { revalidate }, headers: { "User-Agent": "TooloraLabs/1.0" } });
  if (!res.ok) return null;
  const rows = (await res.json()) as [number, number, number, number, number, number][];
  if (!Array.isArray(rows)) return null;
  return rows.map(([time, low, high, open, close, volume]) => ({ time, open, high, low, close, volume }));
}

async function fromCoinbase(symbol: string, plan: Plan, nowSeconds: number): Promise<Candle[] | null> {
  const pair = `${symbol.toUpperCase()}-USD`;
  const g = plan.coinbaseGranularity;
  // Anchor page ends to the granularity so repeated requests share the same cache keys.
  const anchor = Math.floor(nowSeconds / g) * g + g;
  const all: Candle[] = [];
  // Small sequential batches keep long daily histories under Coinbase's public rate limit.
  for (let first = 0; first < plan.pages; first += 4) {
    const batch = Array.from({ length: Math.min(4, plan.pages - first) }, (_, i) =>
      fetchCoinbasePage(pair, g, anchor - (first + i) * COINBASE_PAGE * g, plan.revalidate)
    );
    const pages = await Promise.all(batch);
    if (first === 0 && (pages[0] === null || pages[0].length === 0)) return null;
    let exhausted = false;
    for (const page of pages) {
      if (!page || page.length === 0) exhausted = true;
      else all.push(...page);
    }
    if (exhausted) break;
  }
  return all;
}

async function fromKraken(symbol: string, plan: Plan): Promise<Candle[] | null> {
  const base = symbol.toUpperCase() === "BTC" ? "XBT" : symbol.toUpperCase();
  const res = await fetch(`${KRAKEN_BASE}/OHLC?pair=${base}USD&interval=${plan.krakenInterval}`, { next: { revalidate: plan.revalidate } });
  if (!res.ok) return null;
  const json = (await res.json()) as { error: string[]; result?: Record<string, unknown> };
  if (json.error?.length || !json.result) return null;
  const key = Object.keys(json.result).find((k) => k !== "last");
  const rows = key ? (json.result[key] as [number, string, string, string, string, string, string, number][]) : [];
  if (!rows.length) return null;
  return rows.map(([time, o, h, l, c, , v]) => ({ time, open: +o, high: +h, low: +l, close: +c, volume: +v }));
}

export async function getCandles(symbol: string, timeframe: CandleTimeframe, nowSeconds: number): Promise<CandleResult | null> {
  const plan = PLANS[timeframe];
  const cb = await fromCoinbase(symbol, plan, nowSeconds).catch(() => null);
  if (cb && cb.length > 0) return { candles: finish(cb, plan), source: "coinbase", pair: `${symbol.toUpperCase()}-USD` };
  const kr = await fromKraken(symbol, plan).catch(() => null);
  if (kr && kr.length > 0) {
    const krPlan = { ...plan, coinbaseGranularity: plan.krakenInterval * 60 };
    return { candles: finish(kr, krPlan), source: "kraken", pair: `${symbol.toUpperCase()}/USD` };
  }
  return null;
}
