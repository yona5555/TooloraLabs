"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type Props = {
  text: string;
  onChange: (text: string) => void;
};

const SNIPPETS: Record<string, string> = {
  splitBill: "Rent\nrent = 1200\nutilities = 85\ntotal = rent + utilities\nsplit between 3 roommates:\ntotal / 3",
  tip: "Dinner bill\nbill = 64.50\ntip = bill * 0.18\ntotal = bill + tip",
  unitPrice: "Bulk grocery run\npack of 12 eggs = 4.20\nprice per egg = 4.20 / 12",
};

export default function NotepadInputPanel({ text, onChange }: Props) {
  const t = useTranslations("tools.notepad-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.keys(SNIPPETS).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(SNIPPETS[key])}
            className="rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t(`snippet.${key}`)}
          </button>
        ))}
      </div>
      <label className="block space-y-2">
        <span className="sr-only">{t("inputLabel")}</span>
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={14}
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>
    </SectionCard>
  );
}
