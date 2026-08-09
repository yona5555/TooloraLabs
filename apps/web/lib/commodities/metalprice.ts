const METALPRICE_API_BASE = "https://api.metalpriceapi.com/v1";

/**
 * The free plan only allows 100 requests/month and refreshes once daily —
 * far tighter than ExchangeRate-API's 1,500/month. A daily window keeps
 * this comfortably under budget (~30 fetches/month) even with the ISR
 * revalidation overhead of a live site, where the naive 24h-since-first-hit
 * math undercounts slightly on high-traffic days.
 */
const REVALIDATE_SECONDS = 86400;

function requireApiKey(): string {
  const key = process.env.METALPRICE_API_KEY;
  if (!key) {
    throw new Error("Missing METALPRICE_API_KEY environment variable");
  }
  return key;
}

type LatestResponse = {
  success: boolean;
  timestamp: number;
  rates: {
    /** USD per one troy ounce — the directly useful field, not its reciprocal (`rates.XAU`). */
    USDXAU: number;
    USDXAG: number;
  };
};

export type MetalSnapshot = {
  goldUsdPerOunce: number;
  silverUsdPerOunce: number;
  /** Unix seconds — the provider's own data timestamp, not our fetch time. */
  timestamp: number;
};

export async function getMetalSnapshot(): Promise<MetalSnapshot> {
  const url = `${METALPRICE_API_BASE}/latest?api_key=${requireApiKey()}&base=USD&currencies=XAU,XAG`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`MetalpriceAPI latest request failed: ${res.status}`);
  }
  const json = (await res.json()) as LatestResponse;
  if (!json.success) {
    throw new Error("MetalpriceAPI latest request did not succeed");
  }

  return {
    goldUsdPerOunce: json.rates.USDXAU,
    silverUsdPerOunce: json.rates.USDXAG,
    timestamp: json.timestamp,
  };
}

export type GoldPricePoint = { date: string; priceUsdPerOunce: number };

/**
 * The free plan's Timeframe (date-range) endpoint is paid-only, and even
 * this single-date fallback costs one request per call — so callers must
 * cache each date's result for a long time. A past date's closing price
 * never changes once published, which is exactly what makes that safe: this
 * is correctness-driven caching, not just quota conservation.
 */
const HISTORY_REVALIDATE_SECONDS = 2592000; // 30 days

export async function getGoldPriceOnDate(date: string): Promise<GoldPricePoint> {
  const url = `${METALPRICE_API_BASE}/${date}?api_key=${requireApiKey()}&base=USD&currencies=XAU`;
  const res = await fetch(url, { next: { revalidate: HISTORY_REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`MetalpriceAPI historical request failed for ${date}: ${res.status}`);
  }
  const json = (await res.json()) as LatestResponse;
  if (!json.success) {
    throw new Error(`MetalpriceAPI historical request for ${date} did not succeed`);
  }
  return { date, priceUsdPerOunce: json.rates.USDXAU };
}
