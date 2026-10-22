"use client";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import MacroInputPanel from "./MacroInputPanel";
import MacroResult from "./MacroResult";
import MacroGoalSplits from "./MacroGoalSplits";
import { MacroLiveContext, type MacroLive, type MacroSnapshot } from "./MacroLiveContext";
import { splitFor } from "./macros";
import { type MacroGoal, type MacroScenario } from "./types";

const DEFAULTS = { totalCalories: "2000", goal: "maintain" as MacroGoal };

export default function MacroCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.macro-calculator.nav");
  const tv = useTranslations("tools.macro-calculator.visuals");
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

  // Live: every valid edit updates the result at once; an invalid or half-typed total keeps the
  // last good result on screen (with the calculator's own note in the Result card).
  const liveSnap = useMemo<MacroSnapshot | null>(() => {
    const kcal = parseLocalizedNumber(totalCalories);
    const split = splitFor(Number.isNaN(kcal) ? -1 : kcal, goal);
    return split ? { calories: kcal, goal, ...split } : null;
  }, [totalCalories, goal]);
  const [good, setGood] = useState<MacroSnapshot>(() => ({ calories: 2000, goal: DEFAULTS.goal, ...splitFor(2000, DEFAULTS.goal)! }));
  if (liveSnap && good !== liveSnap) setGood(liveSnap);
  const shown = liveSnap ?? good;

  const setCalories = useCallback((kcal: number) => setTotalCalories(String(Math.round(kcal))), []);
  const liveCtx = useMemo<MacroLive>(() => ({ snap: shown, setGoal, setCalories }), [shown, setCalories]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tv("notices.title") },
  ];

  return (
    <MacroLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <MacroInputPanel
                totalCalories={totalCalories}
                onTotalCaloriesChange={setTotalCalories}
                goal={goal}
                onGoalChange={setGoal}
                onScenarioPreset={handleScenarioPreset}
                onClear={handleClear}
              />
              <MacroGoalSplits />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <MacroResult fill snap={shown} invalid={!liveSnap} digitStyle={digitStyle} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="macro-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="macro-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </MacroLiveContext.Provider>
  );
}
