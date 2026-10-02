"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();
const MAX_BARS = 8;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #15 (Stacked Segmented Bar): each live value's own real signed deviation from the dataset's mean — the bars that variance itself is built from. */
export default function DeviationFromMeanBarChart() {
  const t = useTranslations("tools.statistics-calculator.education.deviationFromMean");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const mean = output.data.mean;
  const shown = values.slice(0, MAX_BARS);
  const maxAbsDev = Math.max(...shown.map((v) => Math.abs(v - mean)), 1);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { mean: round2(mean) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full space-y-1.5 lg:flex-1">
          {shown.map((v, i) => {
            const dev = v - mean;
            const pct = (Math.abs(dev) / maxAbsDev) * 50;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-10 shrink-0 font-mono text-zinc-500 dark:text-zinc-400">{round2(v)}</span>
                <div className="relative h-4 flex-1 bg-zinc-100 dark:bg-zinc-800">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-300 dark:bg-zinc-600" />
                  <div
                    className={`absolute inset-y-0 transition-all duration-300 ${dev >= 0 ? "bg-blue-600" : "bg-rose-600"}`}
                    style={dev >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-end font-mono text-zinc-500 dark:text-zinc-400">{dev >= 0 ? `+${round2(dev)}` : round2(dev)}</span>
              </div>
            );
          })}
          {values.length > MAX_BARS && <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">{t("overflowNote", { count: values.length - MAX_BARS })}</p>}
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.sumOfDeviations"), value: `${round2(values.reduce((s, v) => s + (v - mean), 0))}`, emphasize: true, note: t("worked.note") }]} />
      </div>
    </SectionCard>
  );
}
