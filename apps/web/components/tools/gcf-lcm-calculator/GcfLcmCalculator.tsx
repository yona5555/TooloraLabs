"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import GcfLcmInputPanel from "./GcfLcmInputPanel";
import GcfLcmResult from "./GcfLcmResult";
import GcfLcmQuickReference from "./GcfLcmQuickReference";
import { GcfLcmLiveProvider, computeGcfLcm, parseGcfLcmNumbers, type GcfLcmLiveDims } from "./GcfLcmLiveContext";
import { emptyGcfLcmDraft, GCF_LCM_SCENARIOS } from "./types";

function dimsFor(numbers: string[], prevValid: number[]): GcfLcmLiveDims {
  const parsed = parseGcfLcmNumbers(numbers);
  return { numbers, valid: computeGcfLcm(parsed).error ? prevValid : parsed };
}

export default function GcfLcmCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.gcf-lcm-calculator.nav");
  const tScenarios = useTranslations("tools.gcf-lcm-calculator.scenarios");
  const tCommon = useTranslations("common.live3d");
  // One live source: the typed strings plus the last valid parsed set, so the Result, the 3D towers
  // and every indicator follow each keystroke (and each slider move) and never fall to an empty state.
  const [dims, setDims] = useState<GcfLcmLiveDims>(() => dimsFor(emptyGcfLcmDraft().numbers, [12, 18]));
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const error = computeGcfLcm(parseGcfLcmNumbers(dims.numbers)).error;

  function setNumbers(numbers: string[], exampleId: string | null = null) {
    setDims((prev) => dimsFor(numbers, prev.valid));
    setActiveExample(exampleId);
  }

  function handlePick(id: string) {
    const ex = GCF_LCM_SCENARIOS.find((e) => e.key === id);
    if (ex) setNumbers([...ex.numbers], id);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GcfLcmLiveProvider value={{ dims, setDim: (key, value) => key === "numbers" && setNumbers(value as string[]) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <GcfLcmInputPanel draft={{ numbers: dims.numbers }} onChange={(d) => setNumbers(d.numbers)} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={GCF_LCM_SCENARIOS.map((e) => ({ id: e.key, label: tScenarios(e.key), detail: e.numbers.join(", ") }))}
              />
            </div>
          }
          result={<GcfLcmResult error={error} />}
          sidebar={<RelatedToolsSidebar currentSlug="gcf-lcm-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="gcf-lcm-calculator" />
              <GcfLcmQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </GcfLcmLiveProvider>
  );
}
