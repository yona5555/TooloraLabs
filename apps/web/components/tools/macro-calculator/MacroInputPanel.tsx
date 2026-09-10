"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import MacroGoalTabs from "./MacroGoalTabs";
import { MACRO_SCENARIOS, readStoredTdeeResult, type MacroGoal, type MacroScenario } from "./types";

type Props = {
  totalCalories: string;
  onTotalCaloriesChange: (value: string) => void;
  goal: MacroGoal;
  onGoalChange: (goal: MacroGoal) => void;
  onScenarioPreset: (scenario: MacroScenario) => void;
  onClear: () => void;
};

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot() {
  return null;
}

export default function MacroInputPanel({ totalCalories, onTotalCaloriesChange, goal, onGoalChange, onScenarioPreset, onClear }: Props) {
  const t = useTranslations("tools.macro-calculator.form");
  const tScenarios = useTranslations("tools.macro-calculator.scenarios");
  // Reads the TDEE Calculator's last saved result as an external store (localStorage), rather
  // than setState-in-an-effect, since the value can also change in another tab.
  const storedTdee = useSyncExternalStore(subscribeToStorage, readStoredTdeeResult, getServerSnapshot);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {MACRO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.key}
              type="button"
              onClick={() => onScenarioPreset(scenario)}
              className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
            >
              {tScenarios(scenario.key)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <ToolInput label={t("totalCalories")} type="text" inputMode="numeric" value={totalCalories} onChange={(e) => onTotalCaloriesChange(e.target.value)} />

        {storedTdee && (
          <button
            type="button"
            onClick={() => onTotalCaloriesChange(String(storedTdee.dailyCalorieTarget))}
            className="w-full rounded-lg border border-dashed border-blue-300 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-400 dark:hover:bg-blue-500/10"
          >
            {t("useTdeeCalories", { calories: storedTdee.dailyCalorieTarget })}
          </button>
        )}

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("goalLabel")}</span>
          <MacroGoalTabs goal={goal} onGoalChange={onGoalChange} />
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(`hints.${goal}`)}</p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
