import { NextRequest, NextResponse } from "next/server";
import { getWeatherSnapshot } from "@/lib/weather/open-meteo";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  try {
    const snapshot = await getWeatherSnapshot(latitude, longitude);
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
