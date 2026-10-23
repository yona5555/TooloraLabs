import CommodityConverter from "@/components/tools/commodities-tracker/CommodityConverter";
import CommodityEducation from "@/components/tools/commodities-tracker/CommodityEducation";
import { getForexSnapshot } from "@/lib/forex/exchangerate";
import { getMetalSnapshot } from "@/lib/commodities/metalprice";
import { getOilSnapshot } from "@/lib/commodities/oilprice";
import { getCandles } from "@/lib/crypto/candles";
import { getFetchTimestamp } from "@/lib/crypto/coingecko";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  const now = Math.floor(getFetchTimestamp() / 1000);
  // Phone top card trend: the PAXG/USD daily candles the tracker's gold chart and /tools already use
  // (same arguments, same cache entry); a failed fetch only hides the line and change.
  const [metals, oil, forex, paxg] = await Promise.all([
    getMetalSnapshot(),
    getOilSnapshot(),
    getForexSnapshot(),
    getCandles("paxg", "1D", now).catch(() => null),
  ]);
  const goldTrend = paxg?.candles.map((c) => c.close).slice(-30) ?? null;
  const lastUpdatedUnix =
    metals && oil ? Math.min(metals.timestamp, oil.timestamp) : (metals?.timestamp ?? oil?.timestamp ?? null);
  const spot = {
    gold: metals?.goldUsdPerOunce ?? null,
    silver: metals?.silverUsdPerOunce ?? null,
    wti: oil?.wtiUsdPerBarrel ?? null,
    brent: oil?.brentUsdPerBarrel ?? null,
  };
  // Every currency the rate provider quotes can be the display currency.
  const fiatRates = (forex?.currencies ?? []).map((c) => ({ code: c.code, name: c.name, perUsd: c.ratePerUsd }));
  return (
    <CommodityConverter
      spot={spot}
      fiatRates={fiatRates}
      lastUpdatedUnix={lastUpdatedUnix}
      goldTrend={goldTrend}
      education={<CommodityEducation examples={{ gold: spot.gold, silver: spot.silver, brent: spot.brent, lastUpdatedUnix, locale }} />}
    />
  );
}
