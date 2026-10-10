"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell shared by this tool's indicators: blue-header card (title only), one intro line, the indicator with its WORKED EXAMPLE table beside it. */
export default function SdIndicatorCard({ title, intro, indicator, rows }: { title: string; intro: string; indicator: ReactNode; rows: Row[] }) {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab");
  return (
    <SectionCard title={title}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      <IndicatorWithTable className="mt-4" indicator={indicator} workedExampleTitle={t("worked")} rows={rows} />
    </SectionCard>
  );
}

/** Maps a value in [lo, hi] onto [x0, x1] pixels; a zero-width span maps to the middle. */
export function scaleX(lo: number, hi: number, x0: number, x1: number) {
  const span = hi - lo;
  return (v: number) => (span > 0 ? x0 + ((v - lo) / span) * (x1 - x0) : (x0 + x1) / 2);
}
