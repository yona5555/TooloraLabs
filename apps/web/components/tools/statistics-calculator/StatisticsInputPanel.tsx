"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type StatisticsInputPanelProps = {
  rawData: string;
  onRawDataChange: (value: string) => void;
};

export default function StatisticsInputPanel({ rawData, onRawDataChange }: StatisticsInputPanelProps) {
  const t = useTranslations("tools.statistics-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("inputLabel")}</span>
        <textarea
          value={rawData}
          onChange={(e) => onRawDataChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={8}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("inputHint")}</p>
    </SectionCard>
  );
}
