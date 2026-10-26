"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard, { type PhoneRole } from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import type { GapLayout } from "@/components/tool-ui/useGapFreeSplit";
import { useRsLive } from "./RsLiveContext";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell for this tool's indicators: title-only blue header, one intro line, indicator + adjacent WORKED EXAMPLE. */
export default function RsIndicatorCard({ title, intro, indicator, rows, phoneRole, layout }: { title: string; intro: string; indicator: ReactNode; rows: Row[]; /** SectionCard `phoneRole`. */ phoneRole?: PhoneRole; /** Pins the IndicatorWithTable layout. */ layout?: GapLayout }) {
  const t = useTranslations("tools.readability-score-calculator.live");
  const { ok } = useRsLive();
  return (
    <SectionCard title={title} phoneRole={phoneRole}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      {ok ? (
        <IndicatorWithTable className="mt-4" indicator={indicator} workedExampleTitle={t("worked")} rows={rows} layout={layout} />
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">{t("empty")}</p>
      )}
    </SectionCard>
  );
}
