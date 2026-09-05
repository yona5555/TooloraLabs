"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { emptyValueField, type MeanMedianModeRangeDraft } from "./types";

type Props = {
  draft: MeanMedianModeRangeDraft;
  onChange: (draft: MeanMedianModeRangeDraft) => void;
};

const MAX_VALUES = 15;

export default function MeanMedianModeRangeInputPanel({ draft, onChange }: Props) {
  const t = useTranslations("tools.mean-median-mode-range-calculator.form");

  function updateValue(index: number, value: string) {
    onChange({ values: draft.values.map((n, i) => (i === index ? value : n)) });
  }
  function addValue() {
    if (draft.values.length < MAX_VALUES) onChange({ values: [...draft.values, emptyValueField()] });
  }
  function removeValue(index: number) {
    if (draft.values.length > 1) onChange({ values: draft.values.filter((_, i) => i !== index) });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
      <div className="space-y-3">
        {draft.values.map((value, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <ToolInput
                label={t("valueLabel", { position: index + 1 })}
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => updateValue(index, e.target.value)}
              />
            </div>
            {draft.values.length > 1 && (
              <button
                type="button"
                onClick={() => removeValue(index)}
                aria-label={t("removeValue")}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        {draft.values.length < MAX_VALUES && (
          <button
            type="button"
            onClick={addValue}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus size={16} />
            {t("addValue")}
          </button>
        )}
      </div>
    </SectionCard>
  );
}
