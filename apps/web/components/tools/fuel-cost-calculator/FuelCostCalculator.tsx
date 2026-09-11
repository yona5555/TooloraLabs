"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { FuelCostCalculator as FuelCostTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import FuelInputPanel from "./FuelInputPanel";
import FuelResult from "./FuelResult";
import FuelQuickReference from "./FuelQuickReference";
import { FUEL_DEFAULTS, type FuelRateMode, type FuelScenario } from "./types";

const tool = new FuelCostTool();

export default function FuelCostCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.fuel-cost-calculator.nav");

  const [distance, setDistance] = useState(FUEL_DEFAULTS.distance);
  const [rateMode, setRateMode] = useState<FuelRateMode>(FUEL_DEFAULTS.rateMode);
  const [rateValue, setRateValue] = useState(FUEL_DEFAULTS.rateValue);
  const [pricePerUnit, setPricePerUnit] = useState(FUEL_DEFAULTS.pricePerUnit);

  function handleScenarioPreset(scenario: FuelScenario) {
    setDistance(scenario.distance);
    setRateMode(scenario.rateMode);
    setRateValue(scenario.rateValue);
    setPricePerUnit(scenario.pricePerUnit);
  }

  function handleClear() {
    setDistance(FUEL_DEFAULTS.distance);
    setRateMode(FUEL_DEFAULTS.rateMode);
    setRateValue(FUEL_DEFAULTS.rateValue);
    setPricePerUnit(FUEL_DEFAULTS.pricePerUnit);
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
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <FuelInputPanel
              distance={distance}
              onDistanceChange={setDistance}
              rateMode={rateMode}
              onRateModeChange={setRateMode}
              rateValue={rateValue}
              onRateValueChange={setRateValue}
              pricePerUnit={pricePerUnit}
              onPricePerUnitChange={setPricePerUnit}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={
            <FuelResult
              result={result}
              distance={parseLocalizedNumber(distance) || 0}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="fuel-cost-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="fuel-cost-calculator" />
              <FuelQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
