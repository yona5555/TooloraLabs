"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type NormRow = { region: string; norm: string };

export default function TipInternationalNorms() {
  const t = useTranslations("tools.tip-calculator.aboveFold");
  const rows = t.raw("internationalNorms.rows") as NormRow[];

  return (
    <SectionCard title={t("internationalNorms.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("internationalNorms.intro")}</p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.region}
            className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-zinc-800/60"
          >
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{row.region}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{row.norm}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("internationalNorms.disclaimer")}</p>
    </SectionCard>
  );
}
