import CommodityConverter from "@/components/tools/commodities-tracker/CommodityConverter";
import CommodityEducation from "@/components/tools/commodities-tracker/CommodityEducation";
import { getForexSnapshot } from "@/lib/forex/exchangerate";
import { getMetalSnapshot } from "@/lib/commodities/metalprice";
import { getOilSnapshot } from "@/lib/commodities/oilprice";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  const [metals, oil, forex] = await Promise.all([getMetalSnapshot(), getOilSnapshot(), getForexSnapshot()]);
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
      education={<CommodityEducation examples={{ gold: spot.gold, silver: spot.silver, brent: spot.brent, lastUpdatedUnix, locale }} />}
    />
  );
}
