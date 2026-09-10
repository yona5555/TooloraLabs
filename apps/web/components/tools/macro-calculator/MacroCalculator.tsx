"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MacroCalculator as MacroTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import MacroInputPanel from "./MacroInputPanel";
import MacroResult from "./MacroResult";
import MacroQuickReference from "./MacroQuickReference";
import MacroDisclaimer from "./MacroDisclaimer";
import { type MacroGoal, type MacroScenario } from "./types";

const tool = new MacroTool();

const DEFAULTS = { totalCalories: "2000", goal: "maintain" as MacroGoal };

export default function MacroCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.macro-calculator.nav");
  const [totalCalories, setTotalCalories] = useState(DEFAULTS.totalCalories);
  const [goal, setGoal] = useState<MacroGoal>(DEFAULTS.goal);

  function handleScenarioPreset(scenario: MacroScenario) {
    setTotalCalories(scenario.totalCalories);
    setGoal(scenario.goal);
  }

  function handleClear() {
    setTotalCalories(DEFAULTS.totalCalories);
    setGoal(DEFAULTS.goal);
  }

  const digitStyle = resolveDigitStyle(totalCalories);

  const result = useMemo(() => {
    const caloriesNum = parseLocalizedNumber(totalCalories);
    const output = tool.execute({ totalCalories: Number.isNaN(caloriesNum) ? -1 : caloriesNum, goal }, { locale: "en-US" });
    return output.data;
  }, [totalCalories, goal]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <MacroInputPanel
              totalCalories={totalCalories}
              onTotalCaloriesChange={setTotalCalories}
              goal={goal}
              onGoalChange={setGoal}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<MacroResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="macro-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="macro-calculator" />
              <MacroQuickReference />
              <MacroDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
