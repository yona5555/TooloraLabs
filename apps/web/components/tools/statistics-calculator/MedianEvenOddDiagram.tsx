"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const ODD = [3, 7, 9, 12, 21];
const EVEN = [3, 7, 9, 12, 21, 25];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): the median rule genuinely branches on count parity — an odd-count set has one real middle value, an even-count set averages its two real middle values — shown for the same data with and without one more point. */
export default function MedianEvenOddDiagram() {
  const t = useTranslations("tools.statistics-calculator.education.medianParity");
  const oddOut = tool.execute({ values: ODD }, { locale: "en-US" });
  const evenOut = tool.execute({ values: EVEN }, { locale: "en-US" });
  if (!oddOut.success || oddOut.data.error || !evenOut.success || evenOut.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("oddTitle", { n: ODD.length })}</p>
          <p className="mt-1 font-mono text-xs text-zinc-400">{`3, 7, [9], 12, 21`}</p>
          <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{round2(oddOut.data.median)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("evenTitle", { n: EVEN.length })}</p>
          <p className="mt-1 font-mono text-xs text-zinc-400">{`3, 7, [9, 12], 21, 25`}</p>
          <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{round2(evenOut.data.median)}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.odd"), value: t("worked.oddRule") },
            { label: t("worked.even"), value: `(9 + 12) / 2 = ${round2(evenOut.data.median)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
