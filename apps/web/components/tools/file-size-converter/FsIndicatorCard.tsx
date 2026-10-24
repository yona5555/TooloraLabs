"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell shared by this tool's indicators: blue-header card (title only), one intro line, the indicator with its WORKED EXAMPLE table. */
export default function FsIndicatorCard({ title, intro, indicator, rows, mini }: { title: string; intro: string; indicator: ReactNode; rows: Row[]; mini?: 0 | 1 }) {
  const t = useTranslations("tools.file-size-converter.education.lab");
  return (
    <SectionCard title={title}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      <IndicatorWithTable className="mt-4" indicator={mini === undefined ? indicator : <PhoneMini slot={mini} title={title}>{indicator}</PhoneMini>} workedExampleTitle={t("worked")} rows={rows} />
    </SectionCard>
  );
}

/** Shown in an indicator card while the value is empty or negative. */
export function FsIndicatorUnavailable({ title }: { title: string }) {
  const t = useTranslations("tools.file-size-converter.education.lab");
  return (
    <SectionCard title={title}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("unavailable")}</p>
    </SectionCard>
  );
}
