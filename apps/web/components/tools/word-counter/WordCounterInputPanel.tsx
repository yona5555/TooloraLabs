"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. Writing is a craft that improves with steady practice, and counting words helps you stay within the limits a platform, an editor, or an assignment sets for you. A short paragraph like this one is a useful way to see word counter results at a glance.";

type WordCounterInputPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
};

export default function WordCounterInputPanel({ text, onTextChange }: WordCounterInputPanelProps) {
  const t = useTranslations("tools.word-counter.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onTextChange(SAMPLE_TEXT)}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
        >
          {t("loadSampleText")}
        </button>
        <button
          type="button"
          onClick={() => onTextChange("")}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:text-sm"
        >
          <RotateCcw size={14} />
          {t("clear")}
        </button>
      </div>
      <label className="block space-y-2">
        <span className="sr-only">{t("inputLabel")}</span>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={14}
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>
    </SectionCard>
  );
}
