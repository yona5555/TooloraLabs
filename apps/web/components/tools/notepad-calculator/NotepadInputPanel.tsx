"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { SNIPPET_KEYS, type SnippetKey } from "./types";

type Props = {
  text: string;
  onChange: (text: string) => void;
  onSnippet: (key: SnippetKey) => void;
  onClear: () => void;
};

export default function NotepadInputPanel({ text, onChange, onSnippet, onClear }: Props) {
  const t = useTranslations("tools.notepad-calculator.form");

  return (
    <SectionCard title={t("inputTitle")} className="flex flex-1 flex-col" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
      <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("samples")}</p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {SNIPPET_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSnippet(key)}
            className="rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            data-testid={`snippet-${key}`}
          >
            {t(`snippet.${key}`)}
          </button>
        ))}
      </div>
      <label className="flex min-h-[17rem] flex-1 flex-col">
        <span className="sr-only">{t("inputLabel")}</span>
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          spellCheck={false}
          wrap="off"
          className="w-full flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm leading-7 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          data-testid="notepad-input"
        />
      </label>

      <button
        type="button"
        onClick={onClear}
        className="mt-3 rounded-xl border border-zinc-300 px-6 py-2.5 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {t("clear")}
      </button>
    </SectionCard>
  );
}
