"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { FractionCalculator as FractionCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import FractionInputPanel from "./FractionInputPanel";
import FractionResult from "./FractionResult";
import FractionQuickReference from "./FractionQuickReference";
import type { FractionOperation } from "./types";

const tool = new FractionCalculatorTool();

const DEFAULTS: Record<FractionOperation, { numeratorA: string; denominatorA: string; numeratorB: string; denominatorB: string }> = {
  add: { numeratorA: "1", denominatorA: "2", numeratorB: "1", denominatorB: "3" },
  subtract: { numeratorA: "3", denominatorA: "4", numeratorB: "1", denominatorB: "4" },
  multiply: { numeratorA: "2", denominatorA: "3", numeratorB: "3", denominatorB: "4" },
  divide: { numeratorA: "1", denominatorA: "2", numeratorB: "1", denominatorB: "4" },
};

export default function FractionCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.fraction-calculator.nav");

  const [operation, setOperation] = useState<FractionOperation>("add");
  const [numeratorA, setNumeratorA] = useState(DEFAULTS.add.numeratorA);
  const [denominatorA, setDenominatorA] = useState(DEFAULTS.add.denominatorA);
  const [numeratorB, setNumeratorB] = useState(DEFAULTS.add.numeratorB);
  const [denominatorB, setDenominatorB] = useState(DEFAULTS.add.denominatorB);

  function handleOperationChange(next: FractionOperation) {
    if (next === operation) return;
    setOperation(next);
    setNumeratorA(DEFAULTS[next].numeratorA);
    setDenominatorA(DEFAULTS[next].denominatorA);
    setNumeratorB(DEFAULTS[next].numeratorB);
    setDenominatorB(DEFAULTS[next].denominatorB);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(numeratorA, denominatorA, numeratorB, denominatorB);

  const { result, computed } = useMemo(() => {
    const nA = parseLocalizedNumber(numeratorA) || 0;
    const dA = parseLocalizedNumber(denominatorA) || 0;
    const nB = parseLocalizedNumber(numeratorB) || 0;
    const dB = parseLocalizedNumber(denominatorB) || 0;
    const output = tool.execute(
      { operation, numeratorA: nA, denominatorA: dA, numeratorB: nB, denominatorB: dB },
      { locale: "en-US" }
    );
    return {
      result: output.data,
      computed: { operation, numeratorA: nA, denominatorA: dA, numeratorB: nB, denominatorB: dB, digitStyle },
    };
  }, [operation, numeratorA, denominatorA, numeratorB, denominatorB, digitStyle]);

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
            <FractionInputPanel
              operation={operation}
              onOperationChange={handleOperationChange}
              numeratorA={numeratorA}
              onNumeratorAChange={setNumeratorA}
              denominatorA={denominatorA}
              onDenominatorAChange={setDenominatorA}
              numeratorB={numeratorB}
              onNumeratorBChange={setNumeratorB}
              denominatorB={denominatorB}
              onDenominatorBChange={setDenominatorB}
            />
          }
          result={<FractionResult result={result} computed={computed} />}
          sidebar={<RelatedToolsSidebar currentSlug="fraction-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="fraction-calculator" />
              <FractionQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
