import { NextRequest, NextResponse } from "next/server";
import { getHistoricalRates } from "@/lib/forex/frankfurter";

const ALLOWED_DAYS = new Set([7, 30, 365]);
const CODE_PATTERN = /^[A-Z]{3}$/;

export async function GET(request: NextRequest) {
  const base = (request.nextUrl.searchParams.get("base") ?? "").toUpperCase();
  const target = (request.nextUrl.searchParams.get("target") ?? "").toUpperCase();
  const days = Number(request.nextUrl.searchParams.get("days"));

  if (!CODE_PATTERN.test(base) || !CODE_PATTERN.test(target) || !ALLOWED_DAYS.has(days)) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  try {
    const points = await getHistoricalRates(base, target, days);
    return NextResponse.json({ points });
  } catch {
    return NextResponse.json({ points: [], error: "fetch_failed" }, { status: 502 });
  }
}
