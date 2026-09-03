"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type Props = {
  text: string;
  onChange: (text: string) => void;
};

export default function NotepadInputPanel({ text, onChange }: Props) {
  const t = useTranslations("tools.notepad-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
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
