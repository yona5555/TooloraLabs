import { NextRequest, NextResponse } from "next/server";
import { getChainTip, getFearGreed, getFees, getLatestBlocks } from "@/lib/crypto/network";

const LOADERS = {
  blocks: { load: getLatestBlocks, maxAge: 30 },
  fees: { load: getFees, maxAge: 30 },
  tip: { load: getChainTip, maxAge: 30 },
  fng: { load: getFearGreed, maxAge: 3600 },
} as const;

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind") ?? "";
  if (!(kind in LOADERS)) return NextResponse.json({ error: "invalid_kind" }, { status: 400 });

  const { load, maxAge } = LOADERS[kind as keyof typeof LOADERS];
  const data = await load();
  if (!data) return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 });
  return NextResponse.json(
    { data, fetchedAt: Date.now() },
    { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 4}` } }
  );
}
