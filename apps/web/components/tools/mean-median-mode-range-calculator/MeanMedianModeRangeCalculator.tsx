"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MeanMedianModeRangeCalculator as MeanMedianModeRangeTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MeanMedianModeRangeInputPanel from "./MeanMedianModeRangeInputPanel";
import MeanMedianModeRangeResult from "./MeanMedianModeRangeResult";
import MeanMedianModeRangeQuickReference from "./MeanMedianModeRangeQuickReference";
import { emptyMeanMedianModeRangeDraft, type MeanMedianModeRangeDraft } from "./types";

const tool = new MeanMedianModeRangeTool();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function MeanMedianModeRangeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.mean-median-mode-range-calculator.nav");
  const [draft, setDraft] = useState<MeanMedianModeRangeDraft>(emptyMeanMedianModeRangeDraft());

  const digitStyle = resolveDigitStyle();

  const result = useMemo(() => {
    const values = draft.values.map((n) => toNum(n)).filter((n): n is number => n !== undefined);
    const output = tool.execute({ values }, { locale: "en-US" });
    return output.data;
  }, [draft]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<MeanMedianModeRangeInputPanel draft={draft} onChange={setDraft} />}
          result={<MeanMedianModeRangeResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="mean-median-mode-range-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MeanMedianModeRangeQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
