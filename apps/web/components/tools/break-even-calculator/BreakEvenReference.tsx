"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type ReferenceRow = { term: string; meaning: string };

export default function BreakEvenReference() {
  const t = useTranslations("tools.break-even-calculator.aboveFold.glossary");
  const rows = t.raw("rows") as ReferenceRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.term} className="rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.term}</p>
            <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{row.meaning}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
