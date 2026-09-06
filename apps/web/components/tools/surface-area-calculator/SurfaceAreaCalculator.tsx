"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SurfaceAreaCalculator as SurfaceAreaCalculatorTool, type SurfaceAreaCalculatorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import SurfaceAreaInputPanel from "./SurfaceAreaInputPanel";
import SurfaceAreaResult from "./SurfaceAreaResult";
import SurfaceAreaQuickReference from "./SurfaceAreaQuickReference";
import { emptySolid3DDraft, type Solid3DDraft } from "./types";

const tool = new SurfaceAreaCalculatorTool();

const DEFAULT_DRAFT: Solid3DDraft = { ...emptySolid3DDraft(), side: "3" };
const RELATED_TOOLS = ["volume-calculator", "area-calculator", "scientific-calculator"];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeSurfaceArea(draft: Solid3DDraft): SurfaceAreaCalculatorOutput {
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
}

export default function SurfaceAreaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.surface-area-calculator.nav");
  const t = useTranslations("tools.surface-area-calculator");
  const [draft, setDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);
  const [result, setResult] = useState<SurfaceAreaCalculatorOutput>(() => computeSurfaceArea(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);

  const digitStyle = resolveDigitStyle();

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeSurfaceArea(draft));
    setCommittedDraft(draft);
    setHasCalculated(true);
  }

  function handleClear() {
    setDraft(DEFAULT_DRAFT);
    setHasCalculated(false);
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
          input={<SurfaceAreaInputPanel draft={draft} onChange={setDraft} onCalculate={handleCalculate} onClear={handleClear} />}
          result={<SurfaceAreaResult result={result} digitStyle={digitStyle} draft={committedDraft} hasCalculated={hasCalculated} />}
          sidebar={
            <RelatedToolsSidebar
              currentSlug="surface-area-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="surface-area-calculator" />
              <SurfaceAreaQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
