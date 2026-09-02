"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { StoichiometryCalculator as StoichiometryCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import StoichiometryInputPanel from "./StoichiometryInputPanel";
import StoichiometryResult from "./StoichiometryResult";
import StoichiometryQuickReference from "./StoichiometryQuickReference";
import type { AmountUnit } from "./types";

const tool = new StoichiometryCalculatorTool();

export default function StoichiometryCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.stoichiometry-calculator.nav");

  const [knownFormula, setKnownFormula] = useState("H2");
  const [knownCoefficient, setKnownCoefficient] = useState("2");
  const [knownAmount, setKnownAmount] = useState("4");
  const [knownUnit, setKnownUnit] = useState<AmountUnit>("grams");
  const [targetFormula, setTargetFormula] = useState("H2O");
  const [targetCoefficient, setTargetCoefficient] = useState("2");
  const [targetUnit, setTargetUnit] = useState<AmountUnit>("grams");

  const digitStyle: DigitStyle = resolveDigitStyle(knownCoefficient, knownAmount, targetCoefficient);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        knownFormula,
        knownCoefficient: parseLocalizedNumber(knownCoefficient) || 0,
        knownAmount: parseLocalizedNumber(knownAmount) || 0,
        knownUnit,
        targetFormula,
        targetCoefficient: parseLocalizedNumber(targetCoefficient) || 0,
        targetUnit,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [knownFormula, knownCoefficient, knownAmount, knownUnit, targetFormula, targetCoefficient, targetUnit]);

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
            <StoichiometryInputPanel
              knownFormula={knownFormula}
              onKnownFormulaChange={setKnownFormula}
              knownCoefficient={knownCoefficient}
              onKnownCoefficientChange={setKnownCoefficient}
              knownAmount={knownAmount}
              onKnownAmountChange={setKnownAmount}
              knownUnit={knownUnit}
              onKnownUnitChange={setKnownUnit}
              targetFormula={targetFormula}
              onTargetFormulaChange={setTargetFormula}
              targetCoefficient={targetCoefficient}
              onTargetCoefficientChange={setTargetCoefficient}
              targetUnit={targetUnit}
              onTargetUnitChange={setTargetUnit}
            />
          }
          result={<StoichiometryResult result={result} targetFormula={targetFormula} targetUnit={targetUnit} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="stoichiometry-calculator" category="chemistry" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <StoichiometryQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
