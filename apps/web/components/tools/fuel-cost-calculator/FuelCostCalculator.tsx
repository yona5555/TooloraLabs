"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { FuelCostCalculator as FuelCostTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import FuelInputPanel from "./FuelInputPanel";
import FuelResult from "./FuelResult";
import FuelQuickReference from "./FuelQuickReference";
import FuelReferenceTable from "./FuelReferenceTable";
import { FuelLiveInputsProvider } from "./FuelLiveInputsContext";
import { FUEL_DEFAULTS, type FuelRateMode, type FuelScenario } from "./types";

const tool = new FuelCostTool();
const RELATED_TOOLS = ["break-even-calculator", "inventory-valuation-calculator", "invoice-generator"];

export default function FuelCostCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.fuel-cost-calculator.nav");
  const t = useTranslations("tools.fuel-cost-calculator");

  const [distance, setDistance] = useState(FUEL_DEFAULTS.distance);
  const [rateMode, setRateMode] = useState<FuelRateMode>(FUEL_DEFAULTS.rateMode);
  const [rateValue, setRateValue] = useState(FUEL_DEFAULTS.rateValue);
  const [pricePerUnit, setPricePerUnit] = useState(FUEL_DEFAULTS.pricePerUnit);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  function handleScenarioPreset(scenario: FuelScenario) {
    setDistance(scenario.distance);
    setRateMode(scenario.rateMode);
    setRateValue(scenario.rateValue);
    // Scenario presets are authored in USD — convert to whatever currency is
    // currently selected so picking a preset never silently reverts the price
    // display back to USD-denominated numbers under a non-USD symbol.
    setPricePerUnit(convertAmountString(scenario.pricePerUnit, "USD", currency, (raw) => parseLocalizedNumber(raw) || 0));
  }

  function handleClear() {
    setDistance(FUEL_DEFAULTS.distance);
    setRateMode(FUEL_DEFAULTS.rateMode);
    setRateValue(FUEL_DEFAULTS.rateValue);
    setPricePerUnit(FUEL_DEFAULTS.pricePerUnit);
    setCurrency(DEFAULT_CURRENCY);
  }

  // Currency is a pure unit conversion on the already-entered price, not a new
  // calculation — it takes effect immediately, matching every other
  // currency-aware tool on the site (see Break-Even/Compound Interest Calculator).
  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    setPricePerUnit((prev) => convertAmountString(prev, currency, next, (raw) => parseLocalizedNumber(raw) || 0));
    setCurrency(next);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(distance, rateValue, pricePerUnit);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        distance: parseLocalizedNumber(distance) || 0,
        rateMode,
        rateValue: parseLocalizedNumber(rateValue) || 0,
        pricePerUnit: parseLocalizedNumber(pricePerUnit) || 0,
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [distance, rateMode, rateValue, pricePerUnit]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    // Only linkable once the Notices section actually renders something —
    // it's conditional on currency !== "USD" (see FuelNoticesSection.tsx).
    ...(currency !== "USD" ? [{ id: "notices", label: tNav("notices") }] : []),
  ];

  return (
    <FuelLiveInputsProvider value={{ currency, digitStyle }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <div className="flex flex-col gap-4">
              <FuelInputPanel
                distance={distance}
                onDistanceChange={setDistance}
                rateMode={rateMode}
                onRateModeChange={setRateMode}
                rateValue={rateValue}
                onRateValueChange={setRateValue}
                pricePerUnit={pricePerUnit}
                onPricePerUnitChange={setPricePerUnit}
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
                onScenarioPreset={handleScenarioPreset}
                onClear={handleClear}
              />
              <FuelQuickReference />
            </div>
          }
          result={
            <div className="flex flex-col gap-4">
              <FuelResult
                result={result}
                distance={parseLocalizedNumber(distance) || 0}
                pricePerUnit={parseLocalizedNumber(pricePerUnit) || 0}
                digitStyle={digitStyle}
                currency={currency}
              />
              <FuelReferenceTable />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="fuel-cost-calculator"
              category="business-finance"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="fuel-cost-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </FuelLiveInputsProvider>
  );
}
