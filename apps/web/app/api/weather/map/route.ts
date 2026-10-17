import { NextResponse } from "next/server";
import { currentStep, WX_CITIES } from "@tooloralabs/tools";
import { getForecast } from "@/lib/weather/met-norway";
import { cacheHeaders } from "@/lib/weather/upstream";

/** Current temperature and symbol for the world map's city layer (one cached MET request per city, rate-limited). */
export async function GET() {
  const cities = WX_CITIES.filter((c) => c.onMap);
  const now = Date.now();
  const results = await Promise.allSettled(cities.map((c) => getForecast(c.lat, c.lon)));
  const points: { id: string; tempC: number; symbol: string | null }[] = [];
  let expires = now + 30 * 60_000;
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    const s = currentStep(r.value.forecast.steps, now);
    if (!s) return;
    points.push({ id: cities[i].id, tempC: s.tempC, symbol: s.symbol });
    expires = Math.min(expires, r.value.expires);
  });
  if (points.length === 0) return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  return NextResponse.json({ points }, { headers: cacheHeaders(expires) });
}
