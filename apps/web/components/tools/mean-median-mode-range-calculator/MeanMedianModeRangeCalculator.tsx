"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MeanMedianModeRangeCalculator as MeanMedianModeRangeTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import MeanMedianModeRangeInputPanel from "./MeanMedianModeRangeInputPanel";
import MeanMedianModeRangeResult from "./MeanMedianModeRangeResult";
import MeanMedianModeRangeQuickReference from "./MeanMedianModeRangeQuickReference";
import { MmmLiveProvider, parseDraftValues } from "./MmmLiveContext";
import { emptyMeanMedianModeRangeDraft, MEAN_MEDIAN_MODE_RANGE_SCENARIOS, type MeanMedianModeRangeDraft } from "./types";

const tool = new MeanMedianModeRangeTool();

export default function MeanMedianModeRangeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.mean-median-mode-range-calculator.nav");
  const tScenarios = useTranslations("tools.mean-median-mode-range-calculator.scenarios");
  const tCommon = useTranslations("common.live3d");
  const [draft, setDraft] = useState<MeanMedianModeRangeDraft>(emptyMeanMedianModeRangeDraft());
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const digitStyle = resolveDigitStyle(...draft.values);

  const result = useMemo(() => {
    const { values } = parseDraftValues(draft.values);
    return tool.execute({ values }, { locale: "en-US" }).data;
  }, [draft]);

  function change(next: MeanMedianModeRangeDraft) {
    setDraft(next);
    setActiveExample(null);
  }

  function handlePick(id: string) {
    const scenario = MEAN_MEDIAN_MODE_RANGE_SCENARIOS.find((s) => s.key === id);
    if (!scenario) return;
    setDraft({ values: [...scenario.values] });
    setActiveExample(id);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <MmmLiveProvider value={{ dims: draft, setDim: (key, value) => key === "values" && change({ values: value as string[] }) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <MeanMedianModeRangeInputPanel draft={draft} onChange={change} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={MEAN_MEDIAN_MODE_RANGE_SCENARIOS.map((s) => ({ id: s.key, label: tScenarios(s.key), detail: `{${s.values.join(", ")}}` }))}
              />
            </div>
          }
          result={<MeanMedianModeRangeResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="mean-median-mode-range-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="mean-median-mode-range-calculator" />
              <MeanMedianModeRangeQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </MmmLiveProvider>
  );
}
