"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #16 (Side-by-Side Comparison Cards): the live dataset's own three real measures of center at once — they only all agree for a perfectly symmetric distribution. */
export default function MeanMedianModeComparison() {
  const t = useTranslations("tools.statistics-calculator.education.meanMedianMode");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, median, mode } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("meanLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{round2(mean)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">{t("medianLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round2(median)}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-400">{t("modeLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-rose-700 dark:text-rose-300">{mode.length > 0 ? mode.map((m) => round2(m)).join(", ") : t("noMode")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.allAgree"), value: mean === median && mode.length === 1 && mode[0] === mean ? t("worked.yes") : t("worked.no"), emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
