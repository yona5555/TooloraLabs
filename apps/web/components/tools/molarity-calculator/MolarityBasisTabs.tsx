"use client";
import { useTranslations } from "next-intl";
import { CONCENTRATION_BASES, type ConcentrationBasis } from "./types";

type MolarityBasisTabsProps = {
  basis: ConcentrationBasis;
  onBasisChange: (basis: ConcentrationBasis) => void;
};

export default function MolarityBasisTabs({ basis, onBasisChange }: MolarityBasisTabsProps) {
  const t = useTranslations("tools.molarity-calculator.form");

  return (
    <div role="tablist" aria-label={t("basisLabel")} className="flex flex-wrap gap-1.5">
      {CONCENTRATION_BASES.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={basis === value}
          onClick={() => onBasisChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            basis === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
          }`}
        >
          {t(`basis.${value}`)}
        </button>
      ))}
    </div>
  );
}
