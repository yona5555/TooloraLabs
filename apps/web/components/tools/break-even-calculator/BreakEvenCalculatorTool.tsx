"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { BreakEvenCalculator } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import BreakEvenInputPanel from "./BreakEvenInputPanel";
import BreakEvenResult from "./BreakEvenResult";
import BreakEvenReference from "./BreakEvenReference";

const tool = new BreakEvenCalculator();

export default function BreakEvenCalculatorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.break-even-calculator.errors");
  const tNav = useTranslations("tools.break-even-calculator.nav");

  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [targetProfit, setTargetProfit] = useState("");

  const digitStyle: DigitStyle = resolveDigitStyle(fixedCosts, variableCostPerUnit, pricePerUnit, targetProfit);

  const { result, errorKey } = useMemo(() => {
    if (!fixedCosts.trim() && !variableCostPerUnit.trim() && !pricePerUnit.trim()) {
      return { result: null, errorKey: "" };
    }

    const parsedFixedCosts = parseLocalizedNumber(fixedCosts);
    const parsedVariableCost = parseLocalizedNumber(variableCostPerUnit);
    const parsedPrice = parseLocalizedNumber(pricePerUnit);
    const parsedTargetProfit = parseLocalizedNumber(targetProfit);

    if (Number.isNaN(parsedFixedCosts) || Number.isNaN(parsedVariableCost) || Number.isNaN(parsedPrice)) {
      return { result: null, errorKey: "required" };
    }

    const output = tool.execute(
      {
        fixedCosts: parsedFixedCosts,
        variableCostPerUnit: parsedVariableCost,
        pricePerUnit: parsedPrice,
        targetProfit: Number.isNaN(parsedTargetProfit) ? undefined : parsedTargetProfit,
      },
      { locale: "en-US" }
    );

    if (!output.success) {
      const key = output.metadata.error === "NO_BREAK_EVEN" ? "noBreakEven" : "invalidValues";
      return { result: null, errorKey: key };
    }

    return { result: output.data, errorKey: "" };
  }, [fixedCosts, variableCostPerUnit, pricePerUnit, targetProfit]);

  const errorMessage = errorKey ? t(errorKey) : "";

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
            <BreakEvenInputPanel
              fixedCosts={fixedCosts}
              onFixedCostsChange={setFixedCosts}
              variableCostPerUnit={variableCostPerUnit}
              onVariableCostPerUnitChange={setVariableCostPerUnit}
              pricePerUnit={pricePerUnit}
              onPricePerUnitChange={setPricePerUnit}
              targetProfit={targetProfit}
              onTargetProfitChange={setTargetProfit}
            />
          }
          result={
            <BreakEvenResult
              result={result}
              errorMessage={errorMessage}
              digitStyle={digitStyle}
              fixedCosts={parseLocalizedNumber(fixedCosts) || 0}
              variableCostPerUnit={parseLocalizedNumber(variableCostPerUnit) || 0}
              pricePerUnit={parseLocalizedNumber(pricePerUnit) || 0}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="break-even-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <BreakEvenReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
