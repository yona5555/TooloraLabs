"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import MacroGoalTabs from "./MacroGoalTabs";
import { readStoredTdeeResult, type MacroGoal, type StoredTdeeResult } from "./types";

type Props = {
  totalCalories: string;
  onTotalCaloriesChange: (value: string) => void;
  goal: MacroGoal;
  onGoalChange: (goal: MacroGoal) => void;
};

export default function MacroInputPanel({ totalCalories, onTotalCaloriesChange, goal, onGoalChange }: Props) {
  const t = useTranslations("tools.macro-calculator.form");
  const [storedTdee, setStoredTdee] = useState<StoredTdeeResult | null>(null);

  useEffect(() => {
    setStoredTdee(readStoredTdeeResult());
  }, []);

  return (
    <SectionCard title={t("inputTitle")}>
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
    </SectionCard>
  );
}
