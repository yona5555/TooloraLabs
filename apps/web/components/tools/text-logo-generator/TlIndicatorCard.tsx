"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { useTlLive } from "./TlLiveContext";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** §32 shell for this tool's indicators: title-only blue header, one intro line, indicator + adjacent WORKED EXAMPLE. */
export default function TlIndicatorCard({ title, intro, indicator, rows }: { title: string; intro: string; indicator: ReactNode; rows: Row[] }) {
  const t = useTranslations("tools.text-logo-generator.live");
  const { ok } = useTlLive();
  return (
    <SectionCard title={title}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      {ok ? (
        <IndicatorWithTable className="mt-4" indicator={indicator} workedExampleTitle={t("worked")} rows={rows} />
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">{t("empty")}</p>
      )}
    </SectionCard>
  );
}
