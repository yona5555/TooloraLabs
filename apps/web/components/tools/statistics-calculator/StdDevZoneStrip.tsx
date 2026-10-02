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

/** Type #19 (Zone Strip): the live dataset's own real share of points within one standard deviation of the mean — compared against the ~68% the normal distribution predicts, with however much (or little) this particular small dataset actually matches it. */
export default function StdDevZoneStrip() {
  const t = useTranslations("tools.statistics-calculator.education.stdDevZone");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean, populationStdDev } = output.data;
  const within1 = values.filter((v) => Math.abs(v - mean) <= populationStdDev).length;
  const pctWithin = round2((within1 / values.length) * 100);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-6 w-full">
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 w-[16%] bg-amber-300/70 dark:bg-amber-500/50" />
          <div className="absolute inset-y-0 left-[16%] w-[68%] bg-emerald-300/70 dark:bg-emerald-500/50" />
          <div className="absolute inset-y-0 right-0 w-[16%] bg-amber-300/70 dark:bg-amber-500/50" />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span>{"−σ"}</span>
          <span>{t("zones.within1")}</span>
          <span>{"+σ"}</span>
        </div>
      </div>
      <div className="mt-6">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.actualShare"), value: `${pctWithin}%`, emphasize: true },
            { label: t("worked.normalPrediction"), value: "68%", note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
