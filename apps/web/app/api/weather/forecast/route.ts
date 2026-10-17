import { NextRequest, NextResponse } from "next/server";
import { getForecast } from "@/lib/weather/met-norway";
import { cacheHeaders } from "@/lib/weather/upstream";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  try {
    const { forecast, expires } = await getForecast(latitude, longitude);
    return NextResponse.json(forecast, { headers: cacheHeaders(expires) });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
