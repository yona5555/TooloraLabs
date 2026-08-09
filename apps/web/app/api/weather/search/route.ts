import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/weather/open-meteo";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const cities = await searchCities(query);
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [], error: "search_failed" }, { status: 502 });
  }
}
