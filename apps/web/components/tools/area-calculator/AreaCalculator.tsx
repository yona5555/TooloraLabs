"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AreaCalculator as AreaCalculatorTool, type AreaCalculatorOutput } from "@tooloralabs/tools";
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

const DEFAULT_DRAFT: AreaDraft = { ...emptyAreaDraft(), side: "4" };
const RELATED_TOOLS = ["surface-area-calculator", "volume-calculator", "scientific-calculator"];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeArea(draft: AreaDraft): AreaCalculatorOutput {
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
}

export default function AreaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.area-calculator.nav");
  const t = useTranslations("tools.area-calculator");
  const [draft, setDraft] = useState<AreaDraft>(DEFAULT_DRAFT);
  // Computed once as a lazy useState initializer so a real result is present on the very first
  // render (including SSR) from the default dimensions — no empty-state flash on load.
  const [result, setResult] = useState<AreaCalculatorOutput>(() => computeArea(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<AreaDraft>(DEFAULT_DRAFT);

  const digitStyle = resolveDigitStyle();

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeArea(draft));
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
          input={<AreaInputPanel draft={draft} onChange={setDraft} onCalculate={handleCalculate} onClear={handleClear} />}
          result={
            <AreaResult
              result={result}
              digitStyle={digitStyle}
              draft={committedDraft}
              hasCalculated={hasCalculated}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="area-calculator" category="math" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />}
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
