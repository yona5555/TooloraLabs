"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { ScientificNotationConverter as ScientificNotationConverterTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ScientificNotationInputPanel from "./ScientificNotationInputPanel";
import ScientificNotationResult from "./ScientificNotationResult";
import ScientificNotationQuickReference from "./ScientificNotationQuickReference";
import type { ScientificNotationOperation } from "./types";

const tool = new ScientificNotationConverterTool();

const DEFAULTS: Record<
  ScientificNotationOperation,
  { standardValue: string; coefficientA: string; exponentA: string; coefficientB: string; exponentB: string }
> = {
  toScientific: { standardValue: "299792458", coefficientA: "0", exponentA: "0", coefficientB: "0", exponentB: "0" },
  toStandard: { standardValue: "0", coefficientA: "6.02", exponentA: "23", coefficientB: "0", exponentB: "0" },
  multiply: { standardValue: "0", coefficientA: "5", exponentA: "3", coefficientB: "3", exponentB: "4" },
  divide: { standardValue: "0", coefficientA: "6", exponentA: "7", coefficientB: "2", exponentB: "3" },
};

export default function ScientificNotationConverter({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.scientific-notation-converter.nav");

  const [operation, setOperation] = useState<ScientificNotationOperation>("toScientific");
  const [standardValue, setStandardValue] = useState(DEFAULTS.toScientific.standardValue);
  const [coefficientA, setCoefficientA] = useState(DEFAULTS.toScientific.coefficientA);
  const [exponentA, setExponentA] = useState(DEFAULTS.toScientific.exponentA);
  const [coefficientB, setCoefficientB] = useState(DEFAULTS.toScientific.coefficientB);
  const [exponentB, setExponentB] = useState(DEFAULTS.toScientific.exponentB);

  function handleOperationChange(next: ScientificNotationOperation) {
    if (next === operation) return;
    setOperation(next);
    setStandardValue(DEFAULTS[next].standardValue);
    setCoefficientA(DEFAULTS[next].coefficientA);
    setExponentA(DEFAULTS[next].exponentA);
    setCoefficientB(DEFAULTS[next].coefficientB);
    setExponentB(DEFAULTS[next].exponentB);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(standardValue, coefficientA, exponentA, coefficientB, exponentB);

  const { result, computed } = useMemo(() => {
    const sv = parseLocalizedNumber(standardValue) || 0;
    const cA = parseLocalizedNumber(coefficientA) || 0;
    const eA = parseLocalizedNumber(exponentA) || 0;
    const cB = parseLocalizedNumber(coefficientB) || 0;
    const eB = parseLocalizedNumber(exponentB) || 0;
    const output = tool.execute(
      { operation, standardValue: sv, coefficientA: cA, exponentA: eA, coefficientB: cB, exponentB: eB },
      { locale: "en-US" }
    );
    return {
      result: output.data,
      computed: { operation, standardValue: sv, coefficientA: cA, exponentA: eA, coefficientB: cB, exponentB: eB, digitStyle },
    };
  }, [operation, standardValue, coefficientA, exponentA, coefficientB, exponentB, digitStyle]);

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
            <ScientificNotationInputPanel
              operation={operation}
              onOperationChange={handleOperationChange}
              standardValue={standardValue}
              onStandardValueChange={setStandardValue}
              coefficientA={coefficientA}
              onCoefficientAChange={setCoefficientA}
              exponentA={exponentA}
              onExponentAChange={setExponentA}
              coefficientB={coefficientB}
              onCoefficientBChange={setCoefficientB}
              exponentB={exponentB}
              onExponentBChange={setExponentB}
            />
          }
          result={<ScientificNotationResult result={result} computed={computed} />}
          sidebar={<RelatedToolsSidebar currentSlug="scientific-notation-converter" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ScientificNotationQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
