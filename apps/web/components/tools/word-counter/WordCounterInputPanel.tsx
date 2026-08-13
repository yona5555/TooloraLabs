"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type WordCounterInputPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
};

export default function WordCounterInputPanel({ text, onTextChange }: WordCounterInputPanelProps) {
  const t = useTranslations("tools.word-counter.form");

  return (
    <SectionCard title={t("inputTitle")}>
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
