import { NextResponse } from "next/server";
import { getHazards } from "@/lib/weather/hazards";
import { cacheHeaders } from "@/lib/weather/upstream";

export async function GET() {
  const snap = await getHazards();
  if (!snap.quakesOk && !snap.eventsOk) return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  return NextResponse.json(snap, { headers: cacheHeaders(snap.expires) });
}
