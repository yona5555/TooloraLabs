"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell shared by this tool's indicators: blue-header card (title only), one intro line, the indicator with its WORKED EXAMPLE table beside it. */
export default function SdIndicatorCard({ title, intro, indicator: visual, rows, mini }: { title: string; intro: string; indicator: ReactNode; rows: Row[]; /** Rule 2: this card's visual is the page's top mini card 0 or 1 on phone. */ mini?: 0 | 1 }) {
  const indicator = mini === undefined ? visual : <PhoneMini slot={mini} title={title}>{visual}</PhoneMini>;
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
