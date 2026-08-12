"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type RateRow = { place: string; rate: string };

export default function SalesTaxRatesReference() {
  const t = useTranslations("tools.sales-tax-calculator.aboveFold.ratesReference");
  const rows = t.raw("rows") as RateRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.place}
            className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60"
          >
            <span className="text-zinc-700 dark:text-zinc-300">{row.place}</span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {row.rate}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </SectionCard>
  );
}
