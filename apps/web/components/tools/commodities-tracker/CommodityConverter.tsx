"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { OIL_UNIT_BARRELS, metalValueUsd } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import SidebarFillList from "@/components/tools/markets/SidebarFillList";
import { FiatContext, marketFormatters, useFiatPreference, type FiatRate } from "@/components/tools/markets/fiat";
import CommodityInputPanel from "./CommodityInputPanel";
import CommodityLiveFlow from "./CommodityLiveFlow";
import CommodityTerminal from "./CommodityTerminal";
import {
  CommodityComparisonCards,
  CommodityPurityTable,
  CommodityRatioGauge,
  CommodityRatioHistory,
  CommodityReturns,
  CommoditySensitivityTrio,
  CommoditySilverHistory,
  CommoditySpreadBalance,
  CommodityUnitEquivalence,
  CommodityVolatilityGauge,
} from "./CommodityIndicators";
import CommodityNews from "./CommodityNews";
import CommodityLearningResources from "./CommodityLearningResources";
import { CommodityContext } from "./commodityContext";
import { useCommodityHistory } from "./useCommodityData";
import { type CommodityId, type MetalUnit, type OilUnit, type Spot } from "./types";
import type { ReactNode } from "react";

type CommodityConverterProps = {
  spot: Spot;
  fiatRates: FiatRate[];
  /** Unix seconds — the older of the metals/oil provider timestamps, so "last updated" never overclaims freshness. */
  lastUpdatedUnix: number | null;
  education: ReactNode;
};

const FIAT_STORAGE_KEY = "commodities-tracker:fiat";
const SIDEBAR_UNITS: MetalUnit[] = ["gram", "troyOunce", "kilogram", "tola", "tael"];

export default function CommodityConverter({ spot, fiatRates, lastUpdatedUnix, education }: CommodityConverterProps) {
  const t = useTranslations("tools.commodities-tracker");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const tNav = useTranslations("tools.commodities-tracker.nav");
  const dataUnavailable = Object.values(spot).some((v) => v === null);
  const [commodity, setCommodity] = useState<CommodityId>("gold");
  const [chartId, setChartId] = useState<CommodityId>("gold");
  const [amount, setAmount] = useState("1");
  const [metalUnit, setMetalUnit] = useState<MetalUnit>("gram");
  const [oilUnit, setOilUnit] = useState<OilUnit>("barrel");
  const [fiat, handleFiatChange] = useFiatPreference(FIAT_STORAGE_KEY, fiatRates);
  const digitStyle: DigitStyle = resolveDigitStyle(amount);
  const amountValue = parseLocalizedNumber(amount);
  const history = useCommodityHistory(commodity);
  // Returns need years of data: gold uses its monthly London series rather than ~300 days of PAXG.
  const returnsHistory = useCommodityHistory(commodity === "gold" ? "goldMonthly" : commodity);

  function handleClear() {
    setCommodity("gold");
    setAmount("1");
    setMetalUnit("gram");
    setOilUnit("barrel");
  }

  /** Picking a commodity from a card makes it the converter's commodity too. */
  function handlePick(id: CommodityId) {
    setCommodity(id);
    setChartId(id);
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
  }

  const sel = { commodity, amount: amountValue, metalUnit, oilUnit, spot, digitStyle };

  // Every metal and oil unit priced in the display currency fills the column under the related tools.
  const f = marketFormatters(digitStyle, fiat);
  const sidebarRows = [
      ...(["gold", "silver"] as const).flatMap((m) =>
        spot[m] === null
          ? []
          : [
              ...SIDEBAR_UNITS.map((u) => ({ id: `${m}-${u}`, label: tA(`commodity.${m}`), sub: tA(`unitsShort.${u}`), value: f.money(metalValueUsd(1, u, spot[m]!)) })),
              ...(m === "gold" ? [22, 21, 18].map((k) => ({ id: `gold-${k}k`, label: `${tA("commodity.gold")} ${k}K`, sub: "g", value: f.money(metalValueUsd(1, "gram", spot.gold!, k / 24)) })) : []),
            ]
      ),
      ...(["wti", "brent"] as const).flatMap((o) =>
        spot[o] === null
          ? []
          : (Object.keys(OIL_UNIT_BARRELS) as OilUnit[]).map((u) => ({ id: `${o}-${u}`, label: tA(`commodity.${o}`), sub: tA(`unitsShort.${u}`), value: f.money(spot[o]! * OIL_UNIT_BARRELS[u]) }))
      ),
  ];

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "chart", label: tNav("chart") },
    { id: "ratio", label: tNav("metals") },
    { id: "spread", label: tNav("oil") },
    { id: "news", label: tNav("news") },
    { id: "learning-resources", label: tNav("education") },
    { id: "faq", label: tNav("faq") },
    { id: "notices", label: tNav("notices") },
  ];

  return (
    <FiatContext.Provider value={fiat}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <CommodityInputPanel
              commodity={commodity}
              onCommodityChange={(c) => {
                setCommodity(c);
                setChartId(c);
              }}
              amount={amount}
              onAmountChange={setAmount}
              metalUnit={metalUnit}
              onMetalUnitChange={setMetalUnit}
              oilUnit={oilUnit}
              onOilUnitChange={setOilUnit}
              onClear={handleClear}
              spot={spot[commodity]}
              dataUnavailable={dataUnavailable}
              fiatRates={fiatRates}
              fiatCode={fiat.code}
              onFiatChange={handleFiatChange}
              digitStyle={digitStyle}
            />
          }
          result={
            <div className="flex flex-col gap-6">
              <CommodityLiveFlow
                commodity={commodity}
                amountText={amount}
                amount={amountValue}
                metalUnit={metalUnit}
                oilUnit={oilUnit}
                spot={spot[commodity]}
                history={history}
                lastUpdatedUnix={lastUpdatedUnix}
                digitStyle={digitStyle}
              />
              <CommodityUnitEquivalence {...sel} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="commodities-tracker"
              category="financial-markets"
              relatedList={["forex-converter", "crypto-converter", "compound-interest-calculator", "retirement-calculator"]}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          sidebarFill={<SidebarFillList title={t("sidebarPrices.title", { currency: fiat.code })} note={t("sidebarPrices.note")} rows={sidebarRows} />}
        />
      </div>

      {/* Below the fold every card spans the full content width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="commodities-tracker" />

        {/* Group 1 — price action */}
        <CommodityTerminal instrument={chartId} onSelect={setChartId} spot={spot} digitStyle={digitStyle} />
        <CommodityVolatilityGauge commodity={commodity} history={history} digitStyle={digitStyle} />
        <CommoditySensitivityTrio {...sel} />
        <CommodityReturns commodity={commodity} history={returnsHistory} digitStyle={digitStyle} />
        <AdSpace variant="leaderboard" />

        {/* Group 2 — precious metals */}
        <CommodityRatioGauge {...sel} />
        <CommodityRatioHistory spot={spot} digitStyle={digitStyle} />
        <CommodityPurityTable {...sel} />
        <CommoditySilverHistory {...sel} />
        <AdSpace variant="leaderboard" />

        {/* Group 3 — oil and the whole basket */}
        <CommoditySpreadBalance {...sel} />
        <CommodityComparisonCards spot={spot} commodity={commodity} onPick={handlePick} digitStyle={digitStyle} />
        <AdSpace variant="leaderboard" />

        <CommodityNews />
        <CommodityLearningResources />
      </div>

      <CommodityContext.Provider value={commodity}>{education}</CommodityContext.Provider>
    </FiatContext.Provider>
  );
}
