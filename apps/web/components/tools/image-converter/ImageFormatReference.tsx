"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type FormatRow = { format: string; bestFor: string };

export default function ImageFormatReference() {
  const t = useTranslations("tools.image-converter.aboveFold.formatGuide");
  const rows = t.raw("rows") as FormatRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.format} className="rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <p dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {row.format}
            </p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">{row.bestFor}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
