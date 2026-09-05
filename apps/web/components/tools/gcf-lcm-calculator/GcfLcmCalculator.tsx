"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GcfLcmCalculator as GcfLcmCalculatorTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import GcfLcmInputPanel from "./GcfLcmInputPanel";
import GcfLcmResult from "./GcfLcmResult";
import GcfLcmQuickReference from "./GcfLcmQuickReference";
import { emptyGcfLcmDraft, type GcfLcmDraft } from "./types";

const tool = new GcfLcmCalculatorTool();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function GcfLcmCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.gcf-lcm-calculator.nav");
  const [draft, setDraft] = useState<GcfLcmDraft>(emptyGcfLcmDraft());

  const digitStyle = resolveDigitStyle();

  const result = useMemo(() => {
    const numbers = draft.numbers.map((n) => toNum(n) ?? -1);
    const output = tool.execute({ numbers }, { locale: "en-US" });
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
          input={<GcfLcmInputPanel draft={draft} onChange={setDraft} />}
          result={<GcfLcmResult result={result} digitStyle={digitStyle} draft={draft} />}
          sidebar={<RelatedToolsSidebar currentSlug="gcf-lcm-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <GcfLcmQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
