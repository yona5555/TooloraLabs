"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import ProbabilityInputPanel from "./ProbabilityInputPanel";
import ProbabilityResult from "./ProbabilityResult";
import ProbabilityQuickReference from "./ProbabilityQuickReference";
import { PROBABILITY_DEFAULTS, ProbabilityLiveProvider, type ProbabilityFields } from "./ProbabilityLiveContext";
import type { ProbabilityMode, ProbabilityScenario } from "./types";

type QuickExample = { id: string; mode: ProbabilityMode; patch: Partial<ProbabilityFields>; detail: string };

/** Exact card/dice/coin cases, one click loads each into the inputs (column fill, visuals.md §27). */
const QUICK_EXAMPLES: QuickExample[] = [
  { id: "sevenTwoDice", mode: "single", patch: { favorable: "6", total: "36" }, detail: "6 / 36" },
  { id: "drawAce", mode: "single", patch: { favorable: "4", total: "52" }, detail: "4 / 52" },
  { id: "twoCoinsHeads", mode: "and", patch: { pA: "50", pB: "50" }, detail: "50% × 50%" },
  { id: "doubleSix", mode: "and", patch: { pA: "16.6667", pB: "16.6667" }, detail: "1/6 × 1/6" },
  { id: "heartOrFace", mode: "or", patch: { pA: "25", pB: "23.0769", pBoth: "5.7692" }, detail: "13/52 + 12/52 − 3/52" },
  { id: "kingGivenFace", mode: "conditional", patch: { pAAndB: "7.6923", pB: "23.0769", pA: "7.6923" }, detail: "(4/52) / (12/52)" },
  { id: "sumEightGivenFive", mode: "conditional", patch: { pAAndB: "2.7778", pB: "16.6667", pA: "13.8889" }, detail: "(1/36) / (6/36)" },
];

export default function ProbabilityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.probability-calculator.nav");
  const tLive = useTranslations("tools.probability-calculator.live3d");
  const tCommon = useTranslations("common.live3d");
  // One live source: the result, the 3D card and every indicator follow these fields on each
  // keystroke and each slider move; the defaults give a real result on load.
  const [mode, setMode] = useState<ProbabilityMode>("single");
  const [fields, setFields] = useState<Record<ProbabilityMode, ProbabilityFields>>(PROBABILITY_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const current = fields[mode];

  function updateField(field: keyof ProbabilityFields, value: string) {
    setFields((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
    setActiveExample(null);
  }

  function handleModeChange(next: ProbabilityMode) {
    setMode(next);
    setActiveExample(null);
  }

  function handleClear() {
    setFields((prev) => ({ ...prev, [mode]: PROBABILITY_DEFAULTS[mode] }));
    setActiveExample(null);
  }

  function handleScenarioPreset(scenario: ProbabilityScenario) {
    setMode("single");
    setFields((prev) => ({ ...prev, single: { ...prev.single, favorable: scenario.favorable, total: scenario.total } }));
    setActiveExample(null);
  }

  function handlePick(id: string) {
    const ex = QUICK_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setMode(ex.mode);
    setFields((prev) => ({ ...prev, [ex.mode]: { ...prev[ex.mode], ...ex.patch } }));
    setActiveExample(id);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <ProbabilityLiveProvider value={{ mode, fields: current, setField: updateField }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <ProbabilityInputPanel
                mode={mode}
                onModeChange={handleModeChange}
                fields={current}
                onFieldChange={updateField}
                onClear={handleClear}
                onScenarioPreset={handleScenarioPreset}
              />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={QUICK_EXAMPLES.map((e) => ({ id: e.id, label: tLive(`examples.${e.id}`), detail: e.detail }))}
              />
            </div>
          }
          result={<ProbabilityResult />}
          sidebar={<RelatedToolsSidebar currentSlug="probability-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="probability-calculator" />
              <ProbabilityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </ProbabilityLiveProvider>
  );
}
