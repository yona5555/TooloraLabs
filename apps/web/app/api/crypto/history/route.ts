import { NextRequest, NextResponse } from "next/server";
import { isWithinSupportedHistory } from "@tooloralabs/tools";
import { getCoinPriceOnDate } from "@/lib/crypto/coingecko";

export async function GET(request: NextRequest) {
  const coinId = request.nextUrl.searchParams.get("coin") ?? "";
  const dateParam = request.nextUrl.searchParams.get("date") ?? "";
  const date = new Date(`${dateParam}T00:00:00Z`);

  if (!coinId.trim() || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }
  if (!isWithinSupportedHistory(date)) {
    return NextResponse.json({ error: "unsupported_date_range" }, { status: 400 });
  }

  try {
    const priceUsd = await getCoinPriceOnDate(coinId.trim(), date);
    if (priceUsd === null) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ priceUsd });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
