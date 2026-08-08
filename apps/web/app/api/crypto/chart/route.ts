import { NextRequest, NextResponse } from "next/server";
import { getCoinMarketChart } from "@/lib/crypto/coingecko";

const ALLOWED_DAYS = new Set([7, 30, 365]);

export async function GET(request: NextRequest) {
  const coinId = request.nextUrl.searchParams.get("coin") ?? "";
  const days = Number(request.nextUrl.searchParams.get("days"));

  if (!coinId.trim() || !ALLOWED_DAYS.has(days)) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  try {
    const points = await getCoinMarketChart(coinId.trim(), days);
    return NextResponse.json({ points });
  } catch {
    return NextResponse.json({ points: [], error: "fetch_failed" }, { status: 502 });
  }
}
