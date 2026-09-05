"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertPaceSeconds, formatClock, type DistanceUnit, type MultipointSegment } from "@tooloralabs/tools";
import PaceGauge from "./PaceGauge";

type MultipointResultProps = {
  segments: MultipointSegment[];
  unit: DistanceUnit;
  digitStyle: DigitStyle;
};

export default function MultipointResult({ segments, unit, digitStyle }: MultipointResultProps) {
  const t = useTranslations("tools.pace-calculator.multipoint");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });
  const unitLabel = unit === "km" ? t("unitKm") : t("unitMi");

  const totalDistance = segments.reduce((sum, s) => sum + s.segmentDistance, 0);
  const totalTime = segments.reduce((sum, s) => sum + s.segmentTimeSeconds, 0);
  const overallPaceSecondsPerKm = totalDistance > 0 ? convertPaceSeconds(totalTime / totalDistance, unit, "km") : undefined;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("resultHeading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        {segments.length === 0 ? (
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("noSegments")}</p>
        ) : (
          <>
            <PaceGauge paceSecondsPerKm={overallPaceSecondsPerKm} />

            <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{t("overallDistance")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {fmt(totalDistance)} {unitLabel}
                </span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{t("overallTime")}</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{formatClock(totalTime)}</span>
              </div>

              <div dir="ltr" className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-start text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      <th className="px-1.5 py-2 text-start">{t("columnSegment")}</th>
                      <th className="px-1.5 py-2 text-start">{t("columnDistanceShort")}</th>
                      <th className="px-1.5 py-2 text-start">{t("columnSplitTime")}</th>
                      <th className="px-1.5 py-2 text-start">{t("columnPace")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((seg) => (
                      <tr key={`${seg.fromIndex}-${seg.toIndex}`} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="px-1.5 py-2.5 font-medium text-zinc-700 dark:text-zinc-200">
                          {seg.fromIndex + 1} → {seg.toIndex + 1}
                        </td>
                        <td className="px-1.5 py-2.5">
                          {fmt(seg.segmentDistance)} {unitLabel}
                        </td>
                        <td className="px-1.5 py-2.5">{formatClock(seg.segmentTimeSeconds)}</td>
                        <td className="px-1.5 py-2.5 font-semibold text-blue-600 dark:text-blue-400">
                          {formatClock(seg.paceSecondsPerUnit)} /{unitLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
