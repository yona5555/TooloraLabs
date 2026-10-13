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
          // Rims use the shared line token so every tab keeps ≥3:1 against the card in light and dark.
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            solveFor === value
              ? "border-blue-700 bg-blue-600 text-white dark:border-blue-300"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
          }`}
          style={solveFor === value ? undefined : { borderColor: "var(--ph-line)" }}
        >
          {t(`solveFor.${value}`)}
        </button>
      ))}
    </div>
  );
}
