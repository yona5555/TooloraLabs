"use client";
import { useTranslations } from "next-intl";
import { BMR_FORMULAS, type BMRFormula } from "./types";

type Props = {
  formula: BMRFormula;
  onFormulaChange: (formula: BMRFormula) => void;
};

export default function BMRFormulaTabs({ formula, onFormulaChange }: Props) {
  const t = useTranslations("tools.bmr-calculator.formulas");

  return (
    <div role="tablist" aria-label={t("groupLabel")} className="flex flex-wrap gap-1.5">
      {BMR_FORMULAS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={formula === value}
          onClick={() => onFormulaChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            formula === value
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
