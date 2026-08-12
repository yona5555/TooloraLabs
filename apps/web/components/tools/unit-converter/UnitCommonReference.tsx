"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type ReferenceRow = { from: string; to: string };

export default function UnitCommonReference() {
  const t = useTranslations("tools.unit-converter.aboveFold.commonReference");
  const rows = t.raw("rows") as ReferenceRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.from}
            className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60"
          >
            <span dir="ltr" className="font-mono text-zinc-700 dark:text-zinc-300">
              {row.from}
            </span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {row.to}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
