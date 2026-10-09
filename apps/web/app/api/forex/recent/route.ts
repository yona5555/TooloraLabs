import { NextResponse } from "next/server";
import { getUsdRateTable } from "@/lib/forex/frankfurter";

/** About 13 months of daily ECB fixings for every covered currency against USD (strength, volatility, movers). */
export async function GET() {
  try {
    const table = await getUsdRateTable(400);
    return NextResponse.json(table, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
