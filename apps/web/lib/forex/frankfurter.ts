const FRANKFURTER_BASE = "https://api.frankfurter.dev/v1";
/** ECB reference rates (which Frankfurter mirrors) publish once per TARGET business day — a daily window avoids re-fetching identical data. */
const CHART_REVALIDATE_SECONDS = 86400;

/**
 * Historical rates are the one piece of forex data ExchangeRate-API's free
 * plan cannot provide at all (its `/history` endpoint is Pro/Business/Volume
 * only) — Frankfurter (ECB reference rates, no API key, no quota) is used
 * exclusively for this chart's date range, never for the live converter or
 * the rates list, which stay fully on ExchangeRate-API as intended.
 */
export type HistoricalRatePoint = { date: string; rate: number };

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getHistoricalRates(
  base: string,
  target: string,
  days: number
): Promise<HistoricalRatePoint[]> {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);

  const url = `${FRANKFURTER_BASE}/${toIsoDate(start)}..${toIsoDate(end)}?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(target)}`;
  const res = await fetch(url, { next: { revalidate: CHART_REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Frankfurter time-series request failed: ${res.status}`);
  }
  const json = (await res.json()) as { rates: Record<string, Record<string, number>> };

  return Object.entries(json.rates)
    .map(([date, values]) => ({ date, rate: values[target] }))
    .filter((point): point is HistoricalRatePoint => typeof point.rate === "number")
    .sort((a, b) => a.date.localeCompare(b.date));
}
