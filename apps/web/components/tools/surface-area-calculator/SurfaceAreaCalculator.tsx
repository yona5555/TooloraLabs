"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SurfaceAreaCalculator as SurfaceAreaCalculatorTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SurfaceAreaInputPanel from "./SurfaceAreaInputPanel";
import SurfaceAreaResult from "./SurfaceAreaResult";
import SurfaceAreaQuickReference from "./SurfaceAreaQuickReference";
import { emptySolid3DDraft, type Solid3DDraft } from "./types";

const tool = new SurfaceAreaCalculatorTool();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function SurfaceAreaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.surface-area-calculator.nav");
  const [draft, setDraft] = useState<Solid3DDraft>({ ...emptySolid3DDraft(), side: "3" });

  const digitStyle = resolveDigitStyle();

  const result = useMemo(() => {
    const output = tool.execute(
      {
        shape: draft.shape,
        side: toNum(draft.side),
        length: toNum(draft.length),
        width: toNum(draft.width),
        height: toNum(draft.height),
        radius: toNum(draft.radius),
        baseSide: toNum(draft.baseSide),
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
          input={<SurfaceAreaInputPanel draft={draft} onChange={setDraft} />}
          result={<SurfaceAreaResult result={result} digitStyle={digitStyle} draft={draft} />}
          sidebar={<RelatedToolsSidebar currentSlug="surface-area-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <SurfaceAreaQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
