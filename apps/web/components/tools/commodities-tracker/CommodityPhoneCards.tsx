"use client";
import { useLocale, useTranslations } from "next-intl";
import PhoneMiniCards, { type PhoneMiniCard } from "@/components/tool-ui/PhoneMiniCards";
import type { Spot } from "./types";

/**
 * Phone top cards: gold and silver spot (MetalpriceAPI, the tracker's own snapshot). Gold's 1-day
 * change and 30-day line are the PAXG/USD daily closes; silver has no free daily history (only
 * INSEE monthly averages), so its card shows the spot price alone.
 */
export default function CommodityPhoneCards({ spot, goldTrend }: { spot: Spot; goldTrend: number[] | null }) {
  const t = useTranslations("common.phoneTicker");
  const locale = useLocale();
  const usd = (n: number, digits: number) =>
    `$${new Intl.NumberFormat(`${locale}-u-nu-latn`, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)}`;
  const trend = goldTrend && goldTrend.length >= 2 ? goldTrend : null;
  const cards: PhoneMiniCard[] = [];
  if (spot.gold !== null && Number.isFinite(spot.gold)) {
    cards.push({
      key: "gold",
      label: t("gold"),
      value: usd(spot.gold, 0),
      change: trend ? ((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 100 : null,
      changeLabel: t("change1d"),
      trend,
    });
  }
  if (spot.silver !== null && Number.isFinite(spot.silver)) {
    cards.push({ key: "silver", label: t("silver"), value: usd(spot.silver, 2) });
  }
  return <PhoneMiniCards label={t("label")} cards={cards} />;
}
