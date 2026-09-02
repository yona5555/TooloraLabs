"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { PercentageCalculator as PercentageCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PercentageInputPanel from "./PercentageInputPanel";
import PercentageResult from "./PercentageResult";
import PercentageQuickReference from "./PercentageQuickReference";
import type { PercentageMode } from "./types";

const tool = new PercentageCalculatorTool();

const DEFAULTS: Record<PercentageMode, { first: string; second: string }> = {
  "percent-of-number": { first: "20", second: "150" },
  "what-percent": { first: "45", second: "180" },
  "percentage-change": { first: "80", second: "100" },
  "reverse-percentage": { first: "30", second: "12" },
  "percentage-difference": { first: "40", second: "60" },
};

export default function PercentageCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.percentage-calculator.nav");

  const [mode, setMode] = useState<PercentageMode>("percent-of-number");
  const [first, setFirst] = useState(DEFAULTS["percent-of-number"].first);
  const [second, setSecond] = useState(DEFAULTS["percent-of-number"].second);

  function handleModeChange(next: PercentageMode) {
    if (next === mode) return;
    setMode(next);
    setFirst(DEFAULTS[next].first);
    setSecond(DEFAULTS[next].second);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(first, second);

  const { result, computed } = useMemo(() => {
    const firstValue = parseLocalizedNumber(first) || 0;
    const secondValue = parseLocalizedNumber(second) || 0;
    const output = tool.execute({ mode, first: firstValue, second: secondValue }, { locale: "en-US" });
    return {
      result: output.data,
      computed: { mode, first: firstValue, second: secondValue, digitStyle },
    };
  }, [mode, first, second, digitStyle]);

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
            <PercentageInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              first={first}
              onFirstChange={setFirst}
              second={second}
              onSecondChange={setSecond}
            />
          }
          result={<PercentageResult result={result} computed={computed} />}
          sidebar={<RelatedToolsSidebar currentSlug="percentage-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <PercentageQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
