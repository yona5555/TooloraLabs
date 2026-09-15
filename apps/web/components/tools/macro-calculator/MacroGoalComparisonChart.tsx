"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MacroCalculator as MacroTool } from "@tooloralabs/tools";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { MACRO_GOALS, type MacroGoal } from "./types";

const COLORS: Record<"protein" | "carbs" | "fat", string> = { protein: "#3b82f6", carbs: "#22c55e", fat: "#f59e0b" };
const REFERENCE_CALORIES = 2000;
const tool = new MacroTool();

export default function MacroGoalComparisonChart() {
  const t = useTranslations("tools.macro-calculator.education.goals.comparisonChart");
  const tGoals = useTranslations("tools.macro-calculator.goals");
  const tResult = useTranslations("tools.macro-calculator.result");
  const [selectedGoal, setSelectedGoal] = useState<MacroGoal>("maintain");

  const rows = useMemo(
    () =>
      MACRO_GOALS.map((goal) => {
        const output = tool.execute({ totalCalories: REFERENCE_CALORIES, goal }, { locale: "en-US" });
        return { goal, ...output.data };
      }),
    [],
  );

  const selectedRow = rows.find((row) => row.goal === selectedGoal) ?? rows[0];

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro", { calories: REFERENCE_CALORIES })}</p>

      <div role="tablist" className="mb-4 flex flex-wrap justify-center gap-2">
        {MACRO_GOALS.map((goal) => (
          <button
            key={goal}
            type="button"
            role="tab"
            aria-selected={selectedGoal === goal}
            onClick={() => setSelectedGoal(goal)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedGoal === goal
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tGoals(`labels.${goal}`)}
          </button>
        ))}
      </div>

      <div dir="ltr" className="space-y-3">
        {(["protein", "carbs", "fat"] as const).map((key) => {
          const macro = selectedRow[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[key] }} />
                  {tResult(key)}
                </span>
                <span className="tabular-nums opacity-80">
                  {Math.round(macro.percent)}% · {Math.round(macro.grams)}g
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-current/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${macro.percent}%`, backgroundColor: COLORS[key] }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm leading-6 opacity-80">{t("caption", { goal: tGoals(`labels.${selectedGoal}`) })}</p>
    </EncyclopediaLiveWidget>
  );
}
