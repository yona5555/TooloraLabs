"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { VolumeCalculator as VolumeCalculatorTool, type VolumeCalculatorOutput } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import VolumeInputPanel from "./VolumeInputPanel";
import VolumeResult from "./VolumeResult";
import VolumeQuickReference from "./VolumeQuickReference";
import { emptySolid3DDraft, type Solid3DDraft } from "./types";

const tool = new VolumeCalculatorTool();

const DEFAULT_DRAFT: Solid3DDraft = { ...emptySolid3DDraft(), side: "3" };
const RELATED_TOOLS = ["surface-area-calculator", "area-calculator", "scientific-calculator"];

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function computeVolume(draft: Solid3DDraft): VolumeCalculatorOutput {
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

export default function VolumeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.volume-calculator.nav");
  const t = useTranslations("tools.volume-calculator");
  const [draft, setDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);
  const [result, setResult] = useState<VolumeCalculatorOutput>(() => computeVolume(DEFAULT_DRAFT));
  const [hasCalculated, setHasCalculated] = useState(true);
  const [committedDraft, setCommittedDraft] = useState<Solid3DDraft>(DEFAULT_DRAFT);

  const digitStyle = resolveDigitStyle();

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(computeVolume(draft));
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
          input={<VolumeInputPanel draft={draft} onChange={setDraft} onCalculate={handleCalculate} onClear={handleClear} />}
          result={<VolumeResult result={result} digitStyle={digitStyle} draft={committedDraft} hasCalculated={hasCalculated} />}
          sidebar={
            <RelatedToolsSidebar
              currentSlug="volume-calculator"
              category="math"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="volume-calculator" />
              <VolumeQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
