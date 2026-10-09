import { NextRequest, NextResponse } from "next/server";
import { getCoinDetails } from "@/lib/crypto/coingecko";

export async function GET(request: NextRequest) {
  const id = (request.nextUrl.searchParams.get("id") ?? "").trim();
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const details = await getCoinDetails(id).catch(() => null);
  if (!details) return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  return NextResponse.json(details, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
