"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { DebtToIncomeCategory } from "@tooloralabs/tools";

type DtiCategoryReferenceCardProps = {
  activeCategory: DebtToIncomeCategory;
};

const ROWS: { key: DebtToIncomeCategory; range: string; dotClass: string }[] = [
  { key: "healthy", range: "< 36%", dotClass: "bg-green-500" },
  { key: "manageable", range: "36% – 43%", dotClass: "bg-amber-500" },
  { key: "high", range: "43% – 50%", dotClass: "bg-orange-500" },
  { key: "veryHigh", range: "50%+", dotClass: "bg-red-500" },
];

/**
 * Reference table for the back-end-ratio categories the gauge above buckets results into, with
 * the active result's category highlighted. Fills the gap that otherwise opens up below the mode
 * tabs once the (longer) input column runs past the result card, and directly explains the same
 * thresholds the gauge just visualized rather than being unrelated filler.
 */
export default function DtiCategoryReferenceCard({ activeCategory }: DtiCategoryReferenceCardProps) {
  const t = useTranslations("tools.debt-to-income-calculator.aboveFold");

  return (
    <SectionCard title={t("categoryReferenceTitle")}>
      <ul className="flex flex-col gap-2">
        {ROWS.map((row) => {
          const active = row.key === activeCategory;
          return (
            <li
              key={row.key}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${row.dotClass}`} />
                {t(`category.${row.key}`)}
              </span>
              <span dir="ltr" className="font-mono font-semibold">
                {row.range}
              </span>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
