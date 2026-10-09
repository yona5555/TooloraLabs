import type { DailyRate, UsdRateTable } from "@tooloralabs/tools";
import { ECB_CURRENCIES } from "./ecb";

export { hasEcbHistory } from "./ecb";

const FRANKFURTER_BASE = "https://api.frankfurter.dev/v1";
/** ECB reference rates (which Frankfurter mirrors) publish once per TARGET business day; 6 hours catches the ~16:00 CET fixing without refetching all day. */
const REVALIDATE_SECONDS = 21600;
/** The euro's first ECB fixing; the full pair history starts here. */
const HISTORY_START = "1999-01-04";

/**
 * Historical rates are the one piece of forex data ExchangeRate-API's free plan cannot provide (its
 * `/history` endpoint is paid only). Frankfurter (ECB reference rates, no API key, no quota) covers
 * the ~30 currencies the ECB fixes, daily since 1999; it never feeds the live converter itself.
 */
export type HistoricalRatePoint = DailyRate;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

type SeriesResponse = { rates: Record<string, Record<string, number>> };

/** Every daily fixing of `target` per 1 `base` since 1999 (~7,000 points, ~200 KB). */
export async function getPairHistory(base: string, target: string): Promise<DailyRate[]> {
  const url = `${FRANKFURTER_BASE}/${HISTORY_START}..?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(target)}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Frankfurter time-series request failed: ${res.status}`);
  const json = (await res.json()) as SeriesResponse;
  return Object.entries(json.rates)
    .map(([date, values]) => ({ date, rate: values[target] }))
    .filter((p): p is DailyRate => typeof p.rate === "number")
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The last `days` calendar days of fixings for every ECB currency against USD, on shared dates. */
export async function getUsdRateTable(days: number): Promise<UsdRateTable> {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  const res = await fetch(`${FRANKFURTER_BASE}/${isoDate(start)}..?base=USD`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Frankfurter table request failed: ${res.status}`);
  const json = (await res.json()) as SeriesResponse;
  const dates = Object.keys(json.rates).sort();
  const codes = ECB_CURRENCIES.filter((c) => c !== "USD");
  const rates: Record<string, number[]> = {};
  for (const code of codes) rates[code] = dates.map((d) => json.rates[d][code] ?? NaN);
  return { dates, rates };
}
