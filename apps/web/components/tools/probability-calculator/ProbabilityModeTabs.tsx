"use client";
import { useTranslations } from "next-intl";
import { PROBABILITY_MODES, type ProbabilityMode } from "./types";

type Props = {
  mode: ProbabilityMode;
  onModeChange: (mode: ProbabilityMode) => void;
};

export default function ProbabilityModeTabs({ mode, onModeChange }: Props) {
  const t = useTranslations("tools.probability-calculator.modes");

  return (
    <div role="tablist" aria-label={t("groupLabel")} className="flex flex-wrap gap-1.5">
      {PROBABILITY_MODES.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => onModeChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            mode === value
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
