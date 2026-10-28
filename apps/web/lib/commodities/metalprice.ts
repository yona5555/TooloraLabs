import { apiKey } from "@/lib/api-key";

const METALPRICE_API_BASE = "https://api.metalpriceapi.com/v1";

/**
 * The free plan only allows 100 requests/month and refreshes once daily —
 * far tighter than ExchangeRate-API's 1,500/month. A daily window keeps
 * this comfortably under budget (~30 fetches/month) even with the ISR
 * revalidation overhead of a live site, where the naive 24h-since-first-hit
 * math undercounts slightly on high-traffic days.
 */
const REVALIDATE_SECONDS = 86400;

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

/**
 * Returns `null` instead of throwing on any failure (network error, non-ok response, `success: false`) — this is awaited directly in a page component with no error boundary of its own, so an uncaught throw here previously crashed the whole page with a 500. The caller renders a clear "data unavailable" state instead. With no key configured it returns `null` at once (no request, no log; see apiKey).
 */
export async function getMetalSnapshot(): Promise<MetalSnapshot | null> {
  const key = apiKey("METALPRICE_API_KEY");
  if (!key) return null;
  try {
    const url = `${METALPRICE_API_BASE}/latest?api_key=${key}&base=USD&currencies=XAU,XAG`;
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
  } catch (error) {
    console.error("[commodities-tracker] getMetalSnapshot failed:", error);
    return null;
  }
}
