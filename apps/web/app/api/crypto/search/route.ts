import { NextRequest, NextResponse } from "next/server";
import { searchCoins } from "@/lib/crypto/coingecko";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ coins: [] });
  }

  try {
    const coins = await searchCoins(query);
    return NextResponse.json({ coins });
  } catch {
    return NextResponse.json({ coins: [], error: "search_failed" }, { status: 502 });
  }
}
