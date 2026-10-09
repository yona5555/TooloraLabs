import { NextRequest, NextResponse } from "next/server";
import { isCandleTimeframe } from "@tooloralabs/tools";
import { getCandles } from "@/lib/crypto/candles";

export async function GET(request: NextRequest) {
  const symbol = (request.nextUrl.searchParams.get("symbol") ?? "").trim();
  const tf = request.nextUrl.searchParams.get("tf") ?? "";

  if (!/^[a-z0-9]{1,15}$/i.test(symbol) || !isCandleTimeframe(tf)) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const result = await getCandles(symbol, tf, Math.floor(Date.now() / 1000));
  if (!result) return NextResponse.json({ candles: [], error: "no_market" }, { status: 404 });
  return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
