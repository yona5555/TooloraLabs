import { NextRequest, NextResponse } from "next/server";
import { getPairHistory, hasEcbHistory } from "@/lib/forex/frankfurter";

const CODE_PATTERN = /^[A-Z]{3}$/;

/** Full daily history of one pair since 1999 (ECB fixings); the client builds lines and weekly/monthly candles from it. */
export async function GET(request: NextRequest) {
  const base = (request.nextUrl.searchParams.get("base") ?? "").toUpperCase();
  const target = (request.nextUrl.searchParams.get("target") ?? "").toUpperCase();

  if (!CODE_PATTERN.test(base) || !CODE_PATTERN.test(target) || base === target) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }
  if (!hasEcbHistory(base) || !hasEcbHistory(target)) {
    return NextResponse.json({ points: [], error: "not_covered" }, { status: 404 });
  }

  try {
    const points = await getPairHistory(base, target);
    return NextResponse.json({ points }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ points: [], error: "fetch_failed" }, { status: 502 });
  }
}
