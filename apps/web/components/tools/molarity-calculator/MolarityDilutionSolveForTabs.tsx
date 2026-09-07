"use client";
import { useTranslations } from "next-intl";
import { DILUTION_SOLVE_FOR, type DilutionSolveFor } from "./types";

type MolarityDilutionSolveForTabsProps = {
  active: DilutionSolveFor;
  onChange: (value: DilutionSolveFor) => void;
};

export default function MolarityDilutionSolveForTabs({ active, onChange }: MolarityDilutionSolveForTabsProps) {
  const t = useTranslations("tools.molarity-calculator.form");

  return (
    <div role="tablist" aria-label={t("solveForLabel")} className="flex flex-wrap gap-1.5">
      {DILUTION_SOLVE_FOR.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={active === value}
          onClick={() => onChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            active === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
          }`}
        >
          {t(`solveFor.${value}`)}
        </button>
      ))}
    </div>
  );
}
