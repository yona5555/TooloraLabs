"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type CompareRow = { aspect: string; csv: string; json: string };

export default function CsvVsJsonReference() {
  const t = useTranslations("tools.csv-json-converter.aboveFold.comparison");
  const rows = t.raw("rows") as CompareRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.aspect} className="rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{row.aspect}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400">CSV</span> — {row.csv}
            </p>
            <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">JSON</span> — {row.json}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
