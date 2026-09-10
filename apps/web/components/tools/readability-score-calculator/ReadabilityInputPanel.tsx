"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

type ReadabilityInputPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
  onClear: () => void;
};

export default function ReadabilityInputPanel({ text, onTextChange, onClear }: ReadabilityInputPanelProps) {
  const t = useTranslations("tools.readability-score-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("inputLabel")}</span>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={14}
          dir="ltr"
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("inputHint")}</p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
