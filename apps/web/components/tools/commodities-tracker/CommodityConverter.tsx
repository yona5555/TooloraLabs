"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateMetalValue, calculateOilValue } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import CommodityInputPanel from "./CommodityInputPanel";
import CommodityResult from "./CommodityResult";
import CommodityDisclaimer from "./CommodityDisclaimer";
import CommodityHistoricalChart from "./CommodityHistoricalChart";
import CommodityNews from "./CommodityNews";
import CommodityLearningResources from "./CommodityLearningResources";
import type { CommodityId, DisplayCurrency, MetalWeightUnit } from "./types";
import type { ReactNode } from "react";

type CommodityConverterProps = {
  goldUsdPerOunce: number;
  silverUsdPerOunce: number;
  wtiUsdPerBarrel: number;
  usdToSarRate: number;
  /** Unix seconds — the more stale of the metals/oil provider timestamps, so "last updated" never overclaims freshness for the pair as a whole. */
  lastUpdatedUnix: number;
  education: ReactNode;
};

export default function CommodityConverter({
  goldUsdPerOunce,
  silverUsdPerOunce,
  wtiUsdPerBarrel,
  usdToSarRate,
  lastUpdatedUnix,
  education,
}: CommodityConverterProps) {
  const tNav = useTranslations("tools.commodities-tracker.nav");
  const [commodity, setCommodity] = useState<CommodityId>("gold");
  const [amount, setAmount] = useState("1");
  const [weightUnit, setWeightUnit] = useState<MetalWeightUnit>("gram");
  const [currency, setCurrency] = useState<DisplayCurrency>("usd");

  const digitStyle: DigitStyle = resolveDigitStyle(amount);
  const fxRate = currency === "sar" ? usdToSarRate : 1;

  const convertedValue = useMemo(() => {
    const amountValue = parseLocalizedNumber(amount);
    if (Number.isNaN(amountValue)) return 0;
    if (commodity === "gold") return calculateMetalValue(amountValue, weightUnit, goldUsdPerOunce, fxRate);
    if (commodity === "silver") return calculateMetalValue(amountValue, weightUnit, silverUsdPerOunce, fxRate);
    return calculateOilValue(amountValue, wtiUsdPerBarrel, fxRate);
  }, [amount, commodity, weightUnit, goldUsdPerOunce, silverUsdPerOunce, wtiUsdPerBarrel, fxRate]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "news", label: tNav("news") },
    { id: "learning-resources", label: tNav("education") },
    { id: "faq", label: tNav("faq") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <CommodityInputPanel
              commodity={commodity}
              onCommodityChange={setCommodity}
              amount={amount}
              onAmountChange={setAmount}
              weightUnit={weightUnit}
              onWeightUnitChange={setWeightUnit}
            />
          }
          result={
            <CommodityResult
              commodity={commodity}
              convertedValue={convertedValue}
              goldUsdPerOunce={goldUsdPerOunce}
              silverUsdPerOunce={silverUsdPerOunce}
              wtiUsdPerBarrel={wtiUsdPerBarrel}
              currency={currency}
              onCurrencyChange={setCurrency}
              usdToSarRate={usdToSarRate}
              lastUpdatedUnix={lastUpdatedUnix}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="commodities-tracker" category="financial-markets" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <CommodityDisclaimer />
              <CommodityHistoricalChart digitStyle={digitStyle} />
              <CommodityNews />
              <CommodityLearningResources />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
