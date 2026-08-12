"use client";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import type { UnitCategory } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { UNIT_CATEGORIES, UNITS_BY_CATEGORY } from "./units";

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type UnitInputPanelProps = {
  category: UnitCategory;
  onCategoryChange: (category: UnitCategory) => void;
  value: string;
  onValueChange: (value: string) => void;
  from: string;
  onFromChange: (unit: string) => void;
  to: string;
  onSwap: () => void;
};

export default function UnitInputPanel({
  category,
  onCategoryChange,
  value,
  onValueChange,
  from,
  onFromChange,
  to,
  onSwap,
}: UnitInputPanelProps) {
  const t = useTranslations("tools.unit-converter");

  return (
    <SectionCard title={t("form.inputTitle")}>
      <div className="flex flex-wrap gap-2">
        {UNIT_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              category === item
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t(`categories.${item}`)}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        <ToolInput
          label={t("form.valueLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.valuePlaceholder")}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />

        <div className="flex items-end gap-2">
          <label className="block flex-1 space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.from")}</span>
            <select value={from} onChange={(e) => onFromChange(e.target.value)} className={selectClass}>
              {UNITS_BY_CATEGORY[category].map((unit) => (
                <option key={unit} value={unit}>
                  {t(`units.${unit}`)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onSwap}
            aria-label={t("form.swap")}
            className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        <p dir="ltr" className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("form.toHint", { unit: t(`units.${to}`) })}
        </p>
      </div>
    </SectionCard>
  );
}
