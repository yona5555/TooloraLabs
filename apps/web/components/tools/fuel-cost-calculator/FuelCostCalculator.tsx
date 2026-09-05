"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { FuelCostCalculator as FuelCostTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import FuelInputPanel from "./FuelInputPanel";
import FuelResult from "./FuelResult";
import FuelQuickReference from "./FuelQuickReference";
import type { FuelRateMode } from "./types";

const tool = new FuelCostTool();

export default function FuelCostCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.fuel-cost-calculator.nav");

  const [distance, setDistance] = useState("500");
  const [rateMode, setRateMode] = useState<FuelRateMode>("consumption");
  const [rateValue, setRateValue] = useState("8");
  const [pricePerUnit, setPricePerUnit] = useState("1.5");

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
              <FuelQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
