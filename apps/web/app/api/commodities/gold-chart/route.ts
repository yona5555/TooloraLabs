import { NextResponse } from "next/server";
import { getGoldPriceOnDate } from "@/lib/commodities/metalprice";

/** Fixed to the last 7 days — see ROADMAP.md §10 for why this can't be a wider, period-selectable window on the free plan. */
const HISTORY_DAYS = 7;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const today = new Date();
  const dates = Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (HISTORY_DAYS - 1 - i));
    return isoDate(d);
  });

  /**
   * `allSettled`, not `all`: today's rate (or a recent weekend/holiday with
   * no published fixing) can legitimately 404 while the rest of the week
   * succeeds — one missing day shouldn't blank out the whole chart.
   */
  const results = await Promise.allSettled(dates.map((date) => getGoldPriceOnDate(date)));
  const points = results
    .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof getGoldPriceOnDate>>> => result.status === "fulfilled")
    .map((result) => result.value);

  if (points.length === 0) {
    return NextResponse.json({ points: [], error: "fetch_failed" }, { status: 502 });
  }
  return NextResponse.json({ points });
}
