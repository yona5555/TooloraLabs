"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** One colour per disjoint region [A∩B, A only, B only, neither], shared by every indicator and the 3D grid. */
export const REGION_FILL = ["fill-violet-500 dark:fill-violet-400", "fill-blue-500 dark:fill-blue-400", "fill-emerald-500 dark:fill-emerald-400", "fill-zinc-300 dark:fill-zinc-600"];
export const REGION_BG = ["bg-violet-500 dark:bg-violet-400", "bg-blue-500 dark:bg-blue-400", "bg-emerald-500 dark:bg-emerald-400", "bg-zinc-300 dark:bg-zinc-600"];

/** §32 shell: blue-header card (title only), one intro line, the indicator with its WORKED EXAMPLE table beside it. */
export default function ProbabilityIndicatorCard({ title, intro, indicator, rows }: { title: string; intro: string; indicator: ReactNode; rows: Row[] }) {
  const t = useTranslations("tools.probability-calculator.education.lab");
  return (
    <SectionCard title={title}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      <IndicatorWithTable className="mt-4" indicator={indicator} workedExampleTitle={t("worked")} rows={rows} />
    </SectionCard>
  );
}
