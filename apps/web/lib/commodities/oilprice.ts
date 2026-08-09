const OILPRICE_API_BASE = "https://api.oilpriceapi.com/v1";

/**
 * The free plan allows 200 requests/month with no contractually-guaranteed
 * refresh cadence (observed data was minutes old in testing, but the
 * provider's own `expected_max_age_seconds` allows up to ~1 day) — a daily
 * window matches the other two commodity providers' cadence and keeps
 * usage far under budget.
 */
const REVALIDATE_SECONDS = 86400;

function requireApiKey(): string {
  const key = process.env.OILPRICE_API_KEY;
  if (!key) {
    throw new Error("Missing OILPRICE_API_KEY environment variable");
  }
  return key;
}

type LatestPriceResponse = {
  status: string;
  data: {
    price: number;
    currency: string;
    code: string;
    unit: string;
    as_of: string;
  };
};

async function getLatestPrice(code: "WTI_USD" | "BRENT_CRUDE_USD"): Promise<{ priceUsdPerBarrel: number; asOf: string }> {
  const res = await fetch(`${OILPRICE_API_BASE}/prices/latest?by_code=${code}`, {
    headers: { Authorization: `Token ${requireApiKey()}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`OilPriceAPI latest request failed for ${code}: ${res.status}`);
  }
  const json = (await res.json()) as LatestPriceResponse;
  if (json.status !== "success") {
    throw new Error(`OilPriceAPI latest request for ${code} did not succeed`);
  }
  return { priceUsdPerBarrel: json.data.price, asOf: json.data.as_of };
}

export type OilSnapshot = {
  wtiUsdPerBarrel: number;
  brentUsdPerBarrel: number;
  /** Unix seconds — the provider's own data timestamp, not our fetch time. */
  timestamp: number;
};

export async function getOilSnapshot(): Promise<OilSnapshot> {
  const [wti, brent] = await Promise.all([getLatestPrice("WTI_USD"), getLatestPrice("BRENT_CRUDE_USD")]);
  return {
    wtiUsdPerBarrel: wti.priceUsdPerBarrel,
    brentUsdPerBarrel: brent.priceUsdPerBarrel,
    timestamp: Math.floor(new Date(wti.asOf).getTime() / 1000),
  };
}
