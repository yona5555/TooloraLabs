"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LoveCalculator as LoveTool, type LoveCalculatorOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import LoveInputPanel from "./LoveInputPanel";
import LoveResult from "./LoveResult";
import LoveQuickReference from "./LoveQuickReference";

const tool = new LoveTool();

const INITIAL_RESULT: LoveCalculatorOutput = { error: null, percentage: 0 };

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
            />
          }
          result={
            hasCalculated ? (
              <LoveResult result={displayResult} />
            ) : (
              <LoveResult result={{ error: "empty-name", percentage: 0 }} />
            )
          }
          sidebar={<RelatedToolsSidebar currentSlug="love-calculator" category="fun-entertainment" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <LoveQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
