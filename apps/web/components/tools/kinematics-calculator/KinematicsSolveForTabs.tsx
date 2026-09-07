"use client";
import { useTranslations } from "next-intl";

type KinematicsSolveForTabsProps<T extends string> = {
  values: T[];
  active: T;
  onChange: (value: T) => void;
  translationKey: "solveForTime" | "solveForDistance";
};

export default function KinematicsSolveForTabs<T extends string>({ values, active, onChange, translationKey }: KinematicsSolveForTabsProps<T>) {
  const t = useTranslations("tools.kinematics-calculator.form");

  return (
    <div role="tablist" aria-label={t("solveForLabel")} className="flex flex-wrap gap-1.5">
      {values.map((value) => (
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
          {t(`${translationKey}.${value}` as "solveForTime.v")}
        </button>
      ))}
    </div>
  );
}
