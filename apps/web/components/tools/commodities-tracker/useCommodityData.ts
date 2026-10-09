"use client";
import type { Candle, DailyRate } from "@tooloralabs/tools";
import { useJson, type Loaded } from "@/components/tools/markets/useJson";
import type { CommodityId } from "./types";

export type { Loaded };
export type History = { points: DailyRate[]; frequency: "daily" | "monthly" };

/**
 * The best free history per commodity: gold → PAXG/USD daily candles (real OHLC, 1 PAXG = 1 fine
 * troy oz); silver → monthly London averages (INSEE); WTI/Brent → EIA daily closes (FRED).
 */
export function useCommodityHistory(id: CommodityId | "goldMonthly", retry = 0): Loaded<History> {
  const isGoldDaily = id === "gold";
  const base = isGoldDaily ? "/api/crypto/candles?symbol=paxg&tf=1D" : `/api/commodities/history?id=${id === "goldMonthly" ? "gold" : id}`;
  const url = retry ? `${base}&r=${retry}` : base;
  return useJson(url, (j) => {
    if (isGoldDaily) {
      const candles = (j as { candles?: Candle[] }).candles;
      return candles && candles.length > 1
        ? { frequency: "daily", points: candles.map((c) => ({ date: new Date(c.time * 1000).toISOString().slice(0, 10), rate: c.close })) }
        : null;
    }
    const h = j as History;
    return h.points?.length > 1 ? { points: h.points, frequency: h.frequency } : null;
  });
}

/** Real OHLC candles of PAXG/USD for one interval. */
export function useGoldCandles(tf: string, retry: number): Loaded<{ candles: Candle[]; source: string; pair: string }> {
  return useJson(`/api/crypto/candles?symbol=paxg&tf=${tf}${retry ? `&r=${retry}` : ""}`, (j) => {
    const r = j as { candles?: Candle[]; source?: string; pair?: string };
    return r.candles && r.candles.length > 0 ? { candles: r.candles, source: r.source ?? "", pair: r.pair ?? "" } : null;
  });
}
