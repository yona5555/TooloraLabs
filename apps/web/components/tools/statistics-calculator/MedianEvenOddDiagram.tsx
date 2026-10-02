"use client";
import { useTranslations } from "next-intl";
import { StatisticsCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const tool = new StatisticsCalculator();
const MAX_SHOWN = 10;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #13 (Stepped Diagram): the live dataset's own real sorted order, with the median read off differently depending on whether the real count is odd (one middle value) or even (average of two middle values). */
export default function MedianEvenOddDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.medianEvenOdd");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;
  const output = tool.execute({ values }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { median, count } = output.data;
  const sorted = [...values].sort((a, b) => a - b).slice(0, MAX_SHOWN);
  const isOdd = count % 2 === 1;
  const midIndex = Math.floor((sorted.length - 1) / 2);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { count })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 font-mono text-sm">
          {sorted.map((v, i) => {
            const isMiddle = isOdd ? i === midIndex : i === midIndex || i === midIndex + 1;
            return (
              <span key={i} className={`rounded-lg px-2 py-1.5 transition-colors duration-300 ${isMiddle ? "bg-blue-600 font-bold text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                {round2(v)}
              </span>
            );
          })}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.parity"), value: isOdd ? t("worked.odd") : t("worked.even") },
            { label: t("worked.median"), value: `${round2(median)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
