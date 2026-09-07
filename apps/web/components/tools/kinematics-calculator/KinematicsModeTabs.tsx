"use client";
import { useTranslations } from "next-intl";
import { KINEMATICS_MODES, type KinematicsMode } from "./types";

type KinematicsModeTabsProps = {
  mode: KinematicsMode;
  onModeChange: (mode: KinematicsMode) => void;
};

export default function KinematicsModeTabs({ mode, onModeChange }: KinematicsModeTabsProps) {
  const t = useTranslations("tools.kinematics-calculator.form");

  return (
    <div role="tablist" aria-label={t("modeLabel")} className="flex flex-wrap gap-1.5">
      {KINEMATICS_MODES.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => onModeChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            mode === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
          }`}
        >
          {t(`mode.${value}`)}
        </button>
      ))}
    </div>
  );
}
