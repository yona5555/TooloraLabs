import { NextRequest, NextResponse } from "next/server";
import { getCoinsByIds } from "@/lib/crypto/coingecko";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  if (!id.trim()) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  try {
    const coins = await getCoinsByIds([id.trim()]);
    if (coins.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ coin: coins[0] });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
