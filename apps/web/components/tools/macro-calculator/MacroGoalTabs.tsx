"use client";
import { useTranslations } from "next-intl";
import { MACRO_GOALS, type MacroGoal } from "./types";

type Props = {
  goal: MacroGoal;
  onGoalChange: (goal: MacroGoal) => void;
};

export default function MacroGoalTabs({ goal, onGoalChange }: Props) {
  const t = useTranslations("tools.macro-calculator.goals");

  return (
    <div role="tablist" aria-label={t("groupLabel")} className="grid grid-cols-2 gap-1.5">
      {MACRO_GOALS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={goal === value}
          onClick={() => onGoalChange(value)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            goal === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t(`labels.${value}`)}
        </button>
      ))}
    </div>
  );
}
