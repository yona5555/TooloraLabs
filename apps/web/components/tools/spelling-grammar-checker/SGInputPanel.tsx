"use client";
import { useTranslations } from "next-intl";
import { Eraser } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  onClear: () => void;
};

export default function SGInputPanel({ text, onTextChange, onClear }: Props) {
  const t = useTranslations("tools.spelling-grammar-checker.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="sr-only">{t("textLabel")}</span>
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("textPlaceholder")}
          rows={10}
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("disclaimer")}</p>

      <button
        type="button"
        onClick={onClear}
        disabled={!text}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <Eraser size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
