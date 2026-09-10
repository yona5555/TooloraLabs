"use client";
import { useTranslations } from "next-intl";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import {
  emptyMeanMedianModeRangeDraft,
  emptyValueField,
  MEAN_MEDIAN_MODE_RANGE_SCENARIOS,
  type MeanMedianModeRangeDraft,
  type MeanMedianModeRangeScenario,
} from "./types";

type Props = {
  draft: MeanMedianModeRangeDraft;
  onChange: (draft: MeanMedianModeRangeDraft) => void;
};

const MAX_VALUES = 15;

export default function MeanMedianModeRangeInputPanel({ draft, onChange }: Props) {
  const t = useTranslations("tools.mean-median-mode-range-calculator.form");
  const tScenarios = useTranslations("tools.mean-median-mode-range-calculator.scenarios");

  function applyScenario(scenario: MeanMedianModeRangeScenario) {
    onChange({ values: [...scenario.values] });
  }

  function handleClear() {
    onChange(emptyMeanMedianModeRangeDraft());
  }

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
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {MEAN_MEDIAN_MODE_RANGE_SCENARIOS.map((scenario) => (
            <button
              key={scenario.key}
              type="button"
              onClick={() => applyScenario(scenario)}
              className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
            >
              {tScenarios(scenario.key)}
            </button>
          ))}
        </div>
      </div>
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

      <button
        type="button"
        onClick={handleClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
