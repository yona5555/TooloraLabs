"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();
const MAX_ROWS = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #5 (Ranked Horizontal Bar List): the live dataset's own values ranked by real distance from the mean — the point furthest from center contributes the most to the variance. */
export default function DataSpreadRankedComparison() {
  const t = useTranslations("tools.statistics-calculator.education.dataSpreadRanked");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const mean = output.data.mean;

  const ranked = values
    .map((v) => ({ value: v, distance: Math.abs(v - mean) }))
    .sort((a, b) => b.distance - a.distance)
    .slice(0, MAX_ROWS);
  const maxDistance = Math.max(...ranked.map((r) => r.distance), 1);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full space-y-2 lg:flex-1">
          {ranked.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-12 shrink-0 font-mono text-sm font-semibold text-zinc-600 dark:text-zinc-300">{round2(r.value)}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <div className={`flex h-full items-center justify-end pe-2 text-xs font-bold text-white transition-all duration-300 ${i === 0 ? "bg-blue-600" : "bg-zinc-400 dark:bg-zinc-600"}`} style={{ width: `${(r.distance / maxDistance) * 100}%` }}>
                  {round2(r.distance)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.furthest"), value: `${round2(ranked[0].value)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
