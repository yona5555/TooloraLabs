"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 template: one indicator in its own blue-header SectionCard with its WORKED EXAMPLE table beside it. */
export default function VectorIndicatorCard({ title, intro, indicator, rows }: { title: string; intro: string; indicator: ReactNode; rows: Row[] }) {
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
