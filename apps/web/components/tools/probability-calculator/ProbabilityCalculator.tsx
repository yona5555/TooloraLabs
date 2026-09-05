"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { calculateSingleEventProbability, calculateIndependentAnd, calculateOr, calculateConditional } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ProbabilityInputPanel, { type ProbabilityFields } from "./ProbabilityInputPanel";
import ProbabilityResult from "./ProbabilityResult";
import ProbabilityQuickReference from "./ProbabilityQuickReference";
import { EMPTY_SINGLE, EMPTY_COMPOUND, type ProbabilityMode } from "./types";

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
}

function toProbability(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n / 100;
}

const DEFAULTS: Record<ProbabilityMode, ProbabilityFields> = {
  single: { favorable: "1", total: "6", pA: "50", pB: "50", pBoth: "0", pAAndB: "20" },
  and: { favorable: "1", total: "6", pA: "50", pB: "50", pBoth: "0", pAAndB: "20" },
  or: { favorable: "1", total: "6", pA: "30", pB: "40", pBoth: "10", pAAndB: "20" },
  conditional: { favorable: "1", total: "6", pA: "50", pB: "50", pBoth: "0", pAAndB: "20" },
};

export default function ProbabilityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.probability-calculator.nav");
  const [mode, setMode] = useState<ProbabilityMode>("single");
  const [fields, setFields] = useState<Record<ProbabilityMode, ProbabilityFields>>(DEFAULTS);

  const current = fields[mode];
  const digitStyle = resolveDigitStyle(current.favorable, current.total, current.pA, current.pB, current.pBoth, current.pAAndB);

  const singleResult = useMemo(() => {
    if (mode !== "single") return EMPTY_SINGLE;
    return calculateSingleEventProbability(toNum(current.favorable), toNum(current.total));
  }, [mode, current.favorable, current.total]);

  const compoundResult = useMemo(() => {
    if (mode === "and") return calculateIndependentAnd(toProbability(current.pA), toProbability(current.pB));
    if (mode === "or") return calculateOr(toProbability(current.pA), toProbability(current.pB), toProbability(current.pBoth));
    if (mode === "conditional") return calculateConditional(toProbability(current.pAAndB), toProbability(current.pB));
    return EMPTY_COMPOUND;
  }, [mode, current.pA, current.pB, current.pBoth, current.pAAndB]);

  function updateField(field: keyof ProbabilityFields, value: string) {
    setFields((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<ProbabilityInputPanel mode={mode} onModeChange={setMode} fields={current} onFieldChange={updateField} />}
          result={<ProbabilityResult mode={mode} singleResult={singleResult} compoundResult={compoundResult} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="probability-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ProbabilityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
