"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell shared by this tool's indicators: blue-header card (title only), one intro line, the indicator with its WORKED EXAMPLE table. */
export default function ZipIndicatorCard({ title, intro, indicator, rows }: { title: string; intro: string; indicator: ReactNode; rows: Row[] }) {
  const t = useTranslations("tools.zip-compressor.education.lab");
  return (
    <SectionCard title={title}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      <IndicatorWithTable className="mt-4" indicator={indicator} workedExampleTitle={t("worked")} rows={rows} />
    </SectionCard>
  );
}

/** Shown in an indicator card while the no archive has been built or opened yet. */
export function ZipIndicatorUnavailable({ title }: { title: string }) {
  const t = useTranslations("tools.zip-compressor.education.lab");
  return (
    <SectionCard title={title}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("unavailable")}</p>
    </SectionCard>
  );
}
