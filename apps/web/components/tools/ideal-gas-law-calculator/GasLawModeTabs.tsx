"use client";
import { useTranslations } from "next-intl";
import { GAS_LAW_SOLVE_FOR, type GasLawSolveFor } from "./types";

type GasLawModeTabsProps = {
  solveFor: GasLawSolveFor;
  onSolveForChange: (value: GasLawSolveFor) => void;
};

export default function GasLawModeTabs({ solveFor, onSolveForChange }: GasLawModeTabsProps) {
  const t = useTranslations("tools.ideal-gas-law-calculator.form");

  return (
    <div role="tablist" aria-label={t("solveForLabel")} className="flex flex-wrap gap-1.5">
      {GAS_LAW_SOLVE_FOR.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={solveFor === value}
          onClick={() => onSolveForChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            solveFor === value
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
