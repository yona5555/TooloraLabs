"use client";
import { useTranslations } from "next-intl";
import { TOP_MODES, type TopMode } from "./types";

type PaceModeTabsProps = {
  mode: TopMode;
  onModeChange: (mode: TopMode) => void;
};

export default function PaceModeTabs({ mode, onModeChange }: PaceModeTabsProps) {
  const t = useTranslations("tools.pace-calculator.topTabs");

  return (
    <div role="tablist" aria-label={t("groupLabel")} className="flex flex-wrap gap-2">
      {TOP_MODES.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => onModeChange(value)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            mode === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
          }`}
        >
          {t(value)}
        </button>
      ))}
    </div>
  );
}
