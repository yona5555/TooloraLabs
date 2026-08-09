import type { CurrencyRate } from "@tooloralabs/tools";

const EXCHANGE_RATE_API_BASE = "https://v6.exchangerate-api.com/v6";

/** The free plan itself only refreshes rates once every 24 hours — matching that cadence (instead of a shorter one) avoids burning the 1,500-request monthly quota on redundant revalidations that would just return identical data. */
const RATES_REVALIDATE_SECONDS = 86400;
/** The ISO 4217 code/name list changes only when a currency is retired or introduced — a rare event. */
const CODES_REVALIDATE_SECONDS = 604800;

function requireApiKey(): string {
  const key = process.env.EXCHANGE_RATE_API_KEY;
  if (!key) {
    throw new Error("Missing EXCHANGE_RATE_API_KEY environment variable");
  }
  return key;
}

type LatestRatesResponse = {
  time_last_update_unix: number;
  time_next_update_unix: number;
  conversion_rates: Record<string, number>;
};

type SupportedCodesResponse = {
  supported_codes: [code: string, name: string][];
};

async function getCurrencyNames(): Promise<Map<string, string>> {
  const res = await fetch(`${EXCHANGE_RATE_API_BASE}/${requireApiKey()}/codes`, {
    next: { revalidate: CODES_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`ExchangeRate-API codes request failed: ${res.status}`);
  }
  const json = (await res.json()) as SupportedCodesResponse;
  return new Map(json.supported_codes);
}

export type ForexSnapshot = {
  currencies: CurrencyRate[];
  /** Unix seconds — when the provider itself last refreshed this data, not when we fetched it. Shown to visitors verbatim so "last updated" never implies a live feed. */
  lastUpdatedUnix: number;
  /** Unix seconds — when the provider expects to refresh next. */
  nextUpdateUnix: number;
};

/** Every ExchangeRate-API rate is already USD-per-unit-of-base, i.e. `conversion_rates[code]` is units of `code` per 1 USD — the pivot every conversion in this tool goes through, the same way crypto-converter pivots through each coin's USD price. */
export async function getForexSnapshot(): Promise<ForexSnapshot> {
  const [ratesRes, names] = await Promise.all([
    fetch(`${EXCHANGE_RATE_API_BASE}/${requireApiKey()}/latest/USD`, {
      next: { revalidate: RATES_REVALIDATE_SECONDS },
    }),
    getCurrencyNames(),
  ]);
  if (!ratesRes.ok) {
    throw new Error(`ExchangeRate-API latest request failed: ${ratesRes.status}`);
  }
  const json = (await ratesRes.json()) as LatestRatesResponse;

  const currencies: CurrencyRate[] = Object.entries(json.conversion_rates).map(([code, ratePerUsd]) => ({
    code,
    name: names.get(code) ?? code,
    ratePerUsd,
  }));

  return {
    currencies,
    lastUpdatedUnix: json.time_last_update_unix,
    nextUpdateUnix: json.time_next_update_unix,
  };
}
