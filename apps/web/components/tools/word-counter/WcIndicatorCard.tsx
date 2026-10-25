"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard, { type PhoneRole } from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { useWcLive } from "./WcLiveContext";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell for this tool's indicators: title-only blue header, one intro line, indicator + adjacent WORKED EXAMPLE. */
export default function WcIndicatorCard({ title, intro, indicator: visual, rows, mini, phoneRole }: { title: string; intro: string; indicator: ReactNode; rows: Row[]; /** Rule 2: this card's visual is the page's top mini card 0 or 1 on phone. */ mini?: 0 | 1; /** SectionCard `phoneRole`. */ phoneRole?: PhoneRole }) {
  const indicator = mini === undefined ? visual : <PhoneMini slot={mini} title={title}>{visual}</PhoneMini>;
  const t = useTranslations("tools.word-counter.live");
  const { stats } = useWcLive();
  return (
    <SectionCard title={title} phoneRole={phoneRole}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      {stats.words > 0 ? (
        <IndicatorWithTable className="mt-4" indicator={indicator} workedExampleTitle={t("worked")} rows={rows} />
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">{t("empty")}</p>
      )}
    </SectionCard>
  );
}
