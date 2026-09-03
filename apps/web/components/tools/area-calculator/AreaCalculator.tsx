"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AreaCalculator as AreaCalculatorTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import AreaInputPanel from "./AreaInputPanel";
import AreaResult from "./AreaResult";
import AreaQuickReference from "./AreaQuickReference";
import { emptyAreaDraft, type AreaDraft } from "./types";

const tool = new AreaCalculatorTool();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function AreaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.area-calculator.nav");
  const [draft, setDraft] = useState<AreaDraft>({ ...emptyAreaDraft(), side: "4" });

  const digitStyle = resolveDigitStyle();

  const result = useMemo(() => {
    const output = tool.execute(
      {
        shape: draft.shape,
        side: toNum(draft.side),
        width: toNum(draft.width),
        height: toNum(draft.height),
        base: toNum(draft.base),
        radius: toNum(draft.radius),
        semiMajorAxis: toNum(draft.semiMajorAxis),
        semiMinorAxis: toNum(draft.semiMinorAxis),
        base1: toNum(draft.base1),
        base2: toNum(draft.base2),
        angleDegrees: toNum(draft.angleDegrees),
      },
      { locale: "en-US" }
    );
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
          input={<AreaInputPanel draft={draft} onChange={setDraft} />}
          result={<AreaResult result={result} digitStyle={digitStyle} draft={draft} />}
          sidebar={<RelatedToolsSidebar currentSlug="area-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <AreaQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
