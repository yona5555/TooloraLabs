"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { emptyNumberField, type GcfLcmDraft } from "./types";

type Props = {
  draft: GcfLcmDraft;
  onChange: (draft: GcfLcmDraft) => void;
};

const MAX_NUMBERS = 5;

export default function GcfLcmInputPanel({ draft, onChange }: Props) {
  const t = useTranslations("tools.gcf-lcm-calculator.form");

  function updateNumber(index: number, value: string) {
    onChange({ numbers: draft.numbers.map((n, i) => (i === index ? value : n)) });
  }
  function addNumber() {
    if (draft.numbers.length < MAX_NUMBERS) onChange({ numbers: [...draft.numbers, emptyNumberField()] });
  }
  function removeNumber(index: number) {
    if (draft.numbers.length > 2) onChange({ numbers: draft.numbers.filter((_, i) => i !== index) });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
      <div className="space-y-3">
        {draft.numbers.map((value, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <ToolInput
                label={t("numberLabel", { position: index + 1 })}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => updateNumber(index, e.target.value)}
              />
            </div>
            {draft.numbers.length > 2 && (
              <button
                type="button"
                onClick={() => removeNumber(index)}
                aria-label={t("removeNumber")}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        {draft.numbers.length < MAX_NUMBERS && (
          <button
            type="button"
            onClick={addNumber}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus size={16} />
            {t("addNumber")}
          </button>
        )}
      </div>
    </SectionCard>
  );
}
