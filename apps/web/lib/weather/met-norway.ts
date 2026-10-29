import { parseMetForecast, type MetLocationforecast, type WxForecast } from "@tooloralabs/tools";
import { cachedJson } from "./upstream";
import { dataNow } from "@/lib/data-clock";

/**
 * MET Norway Locationforecast 2.0 ("complete": adds dew point, fog and clear-sky UV).
 * Licence CC BY 4.0 — credited on the page with a licence link and a note that values are
 * converted and aggregated (docs/legal/data-sources.md).
 */
const LOCATIONFORECAST = "https://api.met.no/weatherapi/locationforecast/2.0/complete";

/** MET asks for at most 4 decimals; 2 decimals (~1 km) also lets nearby visitors share one cached response. */
export function roundCoord(v: number): number {
  return Math.round(v * 100) / 100;
}

export async function getForecast(lat: number, lon: number): Promise<{ forecast: WxForecast; expires: number; servedAt: number }> {
  const url = `${LOCATIONFORECAST}?lat=${roundCoord(lat)}&lon=${roundCoord(lon)}`;
  const { data, expires } = await cachedJson<MetLocationforecast>(url, { minTtlMs: 5 * 60_000, fallbackTtlMs: 30 * 60_000 });
  return { forecast: parseMetForecast(data), expires, servedAt: dataNow() };
}
