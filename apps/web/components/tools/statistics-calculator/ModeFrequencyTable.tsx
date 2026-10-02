"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

const MAX_ROWS = 10;

/** Type #17 (Tagged Reference Table): every distinct value in the live dataset and how many times it actually appears — the mode is whichever row (or rows) has the highest real count. */
export default function ModeFrequencyTable() {
  const t = useTranslations("tools.statistics-calculator.education.modeFrequency");
  const { dims } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);
  if (values.length === 0) return null;

  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  const rows = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, MAX_ROWS);
  const maxFreq = Math.max(...rows.map((r) => r[1]));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[240px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-start dark:border-zinc-700">
              <th className="px-3 py-2 text-start font-semibold">{t("columnValue")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("columnFrequency")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([value, count]) => (
              <tr key={value} className={`border-b border-zinc-100 dark:border-zinc-800 ${count === maxFreq && maxFreq > 1 ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                <td className={`px-3 py-2 font-mono ${count === maxFreq && maxFreq > 1 ? "font-bold text-blue-700 dark:text-blue-300" : ""}`}>{round2(value)}</td>
                <td className="px-3 py-2 font-mono">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.highestFrequency"), value: `${maxFreq}`, emphasize: true, note: maxFreq <= 1 ? t("worked.noMode") : undefined }]} />
      </div>
    </SectionCard>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
