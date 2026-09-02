"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SignificantFiguresCalculator as SignificantFiguresCalculatorTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SignificantFiguresInputPanel from "./SignificantFiguresInputPanel";
import SignificantFiguresResult from "./SignificantFiguresResult";
import SignificantFiguresQuickReference from "./SignificantFiguresQuickReference";
import type { SignificantFiguresOperation } from "./types";

const tool = new SignificantFiguresCalculatorTool();

const DEFAULTS: Record<SignificantFiguresOperation, { valueA: string; valueB: string; roundToDigits: string }> = {
  count: { valueA: "0.00500", valueB: "", roundToDigits: "3" },
  round: { valueA: "12345", valueB: "", roundToDigits: "3" },
  add: { valueA: "12.5", valueB: "0.234", roundToDigits: "0" },
  subtract: { valueA: "18.0", valueB: "2.545", roundToDigits: "0" },
  multiply: { valueA: "4.5", valueB: "2.33", roundToDigits: "0" },
  divide: { valueA: "10.0", valueB: "3.0", roundToDigits: "0" },
};

export default function SignificantFiguresCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.significant-figures-calculator.nav");

  const [operation, setOperation] = useState<SignificantFiguresOperation>("count");
  const [valueA, setValueA] = useState(DEFAULTS.count.valueA);
  const [valueB, setValueB] = useState(DEFAULTS.count.valueB);
  const [roundToDigits, setRoundToDigits] = useState(DEFAULTS.count.roundToDigits);

  function handleOperationChange(next: SignificantFiguresOperation) {
    if (next === operation) return;
    setOperation(next);
    setValueA(DEFAULTS[next].valueA);
    setValueB(DEFAULTS[next].valueB);
    setRoundToDigits(DEFAULTS[next].roundToDigits);
  }

  const { result, computed } = useMemo(() => {
    const digits = Number(roundToDigits) || 1;
    const output = tool.execute(
      { operation, rawValueA: valueA, rawValueB: valueB, roundToDigits: digits },
      { locale: "en-US" }
    );
    return {
      result: output.data,
      computed: { operation, valueA, valueB },
    };
  }, [operation, valueA, valueB, roundToDigits]);

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
            <SignificantFiguresInputPanel
              operation={operation}
              onOperationChange={handleOperationChange}
              valueA={valueA}
              onValueAChange={setValueA}
              valueB={valueB}
              onValueBChange={setValueB}
              roundToDigits={roundToDigits}
              onRoundToDigitsChange={setRoundToDigits}
            />
          }
          result={<SignificantFiguresResult result={result} computed={computed} />}
          sidebar={<RelatedToolsSidebar currentSlug="significant-figures-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <SignificantFiguresQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
