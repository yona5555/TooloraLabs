"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LoveCalculator as LoveTool, type LoveCalculatorOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import LoveInputPanel from "./LoveInputPanel";
import LoveResult from "./LoveResult";
import LoveQuickReference from "./LoveQuickReference";

const tool = new LoveTool();

const INITIAL_RESULT: LoveCalculatorOutput = { error: null, percentage: 0 };

const LOVE_SCENARIOS: { key: string; name1: string; name2: string }[] = [
  { key: "romeoJuliet", name1: "Romeo", name2: "Juliet" },
  { key: "jackRose", name1: "Jack", name2: "Rose" },
  { key: "mickeyMinnie", name1: "Mickey", name2: "Minnie" },
  { key: "batmanCatwoman", name1: "Batman", name2: "Catwoman" },
];

export default function LoveCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.love-calculator.nav");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<LoveCalculatorOutput>(INITIAL_RESULT);
  const [hasCalculated, setHasCalculated] = useState(false);

  function handleCalculate() {
    const output = tool.execute({ name1, name2 }, { locale: "en-US" });
    setResult(output.data);
    setHasCalculated(true);
  }

  function handleScenarioPreset(scenario: (typeof LOVE_SCENARIOS)[number]) {
    setName1(scenario.name1);
    setName2(scenario.name2);
    const output = tool.execute({ name1: scenario.name1, name2: scenario.name2 }, { locale: "en-US" });
    setResult(output.data);
    setHasCalculated(true);
  }

  function handleClear() {
    setName1("");
    setName2("");
    setResult(INITIAL_RESULT);
    setHasCalculated(false);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const displayResult: LoveCalculatorOutput = hasCalculated ? result : INITIAL_RESULT;

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <LoveInputPanel
              name1={name1}
              onName1Change={setName1}
              name2={name2}
              onName2Change={setName2}
              onCalculate={handleCalculate}
              onClear={handleClear}
              scenarios={LOVE_SCENARIOS}
              onScenarioPreset={handleScenarioPreset}
            />
          }
          result={
            hasCalculated ? (
              <LoveResult result={displayResult} name1={name1} name2={name2} />
            ) : (
              <LoveResult result={{ error: "empty-name", percentage: 0 }} name1={name1} name2={name2} />
            )
          }
          sidebar={<RelatedToolsSidebar currentSlug="love-calculator" category="fun-entertainment" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="love-calculator" />
              <LoveQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
