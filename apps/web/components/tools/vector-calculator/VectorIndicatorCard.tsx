"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 template: one indicator in its own blue-header SectionCard with its WORKED EXAMPLE table beside it. */
export default function VectorIndicatorCard({ title, intro, indicator: visual, rows, mini }: { title: string; intro: string; indicator: ReactNode; rows: Row[]; /** Rule 2: this card's visual is the page's top mini card 0 or 1 on phone. */ mini?: 0 | 1 }) {
  const indicator = mini === undefined ? visual : <PhoneMini slot={mini} title={title}>{visual}</PhoneMini>;
  const t = useTranslations("tools.vector-calculator.indicators");
  return (
    <SectionCard title={title}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      <div className="mt-4">
        <IndicatorWithTable indicator={indicator} workedExampleTitle={t("workedExample")} rows={rows} />
      </div>
    </SectionCard>
  );
}
