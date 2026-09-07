"use client";
import { useTranslations } from "next-intl";
import { DENSITY_OPERATIONS, type DensityOperation } from "./types";

type DensityModeTabsProps = {
  operation: DensityOperation;
  onOperationChange: (operation: DensityOperation) => void;
};

export default function DensityModeTabs({ operation, onOperationChange }: DensityModeTabsProps) {
  const t = useTranslations("tools.density-calculator.tabs");

  return (
    <div role="tablist" aria-label={t("groupLabel")} className="flex flex-wrap gap-1.5">
      {DENSITY_OPERATIONS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={operation === value}
          onClick={() => onOperationChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            operation === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
          }`}
        >
          {t(value)}
        </button>
      ))}
    </div>
  );
}
