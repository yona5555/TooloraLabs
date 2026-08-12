"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type StackRow = { stages: string; effective: string };

export default function DiscountStackingReference() {
  const t = useTranslations("tools.discount-calculator.aboveFold.stackingReference");
  const rows = t.raw("rows") as StackRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.stages}
            className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60"
          >
            <span dir="ltr" className="font-mono text-zinc-700 dark:text-zinc-300">
              {row.stages}
            </span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {row.effective}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
