import { NextRequest, NextResponse } from "next/server";
import { getCommodityHistory, type CommodityHistoryId } from "@/lib/commodities/history";

const IDS = new Set<CommodityHistoryId>(["wti", "brent", "silver", "gold"]);

/** Free public history for one commodity (see lib/commodities/history.ts for sources and limits). */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") as CommodityHistoryId;
  if (!IDS.has(id)) return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  try {
    const history = await getCommodityHistory(id);
    return NextResponse.json(history, { headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ points: [], error: "fetch_failed" }, { status: 502 });
  }
}
