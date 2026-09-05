"use client";
import { useTranslations } from "next-intl";
import { DUE_DATE_METHODS, type DueDateMethod } from "./types";

type Props = {
  method: DueDateMethod;
  onMethodChange: (method: DueDateMethod) => void;
};

export default function DueDateModeTabs({ method, onMethodChange }: Props) {
  const t = useTranslations("tools.due-date-calculator.modes");

  return (
    <div role="tablist" aria-label={t("groupLabel")} className="flex flex-wrap gap-1.5">
      {DUE_DATE_METHODS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={method === value}
          onClick={() => onMethodChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            method === value
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
