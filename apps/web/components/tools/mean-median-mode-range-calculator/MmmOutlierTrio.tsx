"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

/**
 * Type #12 (Sensitivity Trio): the mean and median with the smallest value removed, for the full
 * data set, and with the largest value removed — side by side, so how far each centre moves when
 * one extreme value goes away is visible at a glance.
 */
export default function MmmOutlierTrio() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.trio");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const cols = [
    { key: "dropMin", label: t("dropMin", { value: f(a.min) }), c: a.dropMin, current: false },
    { key: "full", label: t("full"), c: { mean: a.mean, median: a.median }, current: true },
    { key: "dropMax", label: t("dropMax", { value: f(a.max) }), c: a.dropMax, current: false },
  ];
  const all = cols.flatMap((c) => [c.c.mean, c.c.median]);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const h = (v: number) => (hi > lo ? 18 + ((v - lo) / (hi - lo)) * 82 : 60);

  const trio = (
    <div dir="ltr" className="grid w-full grid-cols-3 gap-2 lg:w-[360px]">
      {cols.map((col) => (
        <div key={col.key} className={`flex flex-col items-center rounded-xl border p-2 ${col.current ? "border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}>
          <div className="flex h-[110px] items-end gap-2">
            {[
              { v: col.c.mean, cls: "bg-blue-600 dark:bg-blue-400" },
              { v: col.c.median, cls: "bg-emerald-600 dark:bg-emerald-400" },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{f(b.v, 2)}</span>
                <div className={`w-6 rounded-t ${b.cls}`} style={{ height: `${h(b.v)}px` }} />
              </div>
            ))}
          </div>
          <span className="mt-1.5 text-center text-[11px] leading-4 font-semibold text-zinc-600 dark:text-zinc-300">{col.label}</span>
        </div>
      ))}
      <div className="col-span-3 flex justify-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-blue-600 dark:bg-blue-400" />{tr("mean")}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-emerald-600 dark:bg-emerald-400" />{tr("median")}</span>
      </div>
    </div>
  );

  const dMeanMax = a.dropMax.mean - a.mean;
  const dMedMax = a.dropMax.median - a.median;
  const moreSensitive = Math.abs(dMeanMax) + Math.abs(a.dropMin.mean - a.mean) >= Math.abs(dMedMax) + Math.abs(a.dropMin.median - a.median) ? tr("mean") : tr("median");

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={trio}
      rows={[
        { label: t("meanShiftMax"), value: f(dMeanMax) },
        { label: t("medianShiftMax"), value: f(dMedMax) },
        { label: t("meanShiftMin"), value: f(a.dropMin.mean - a.mean) },
        { label: t("medianShiftMin"), value: f(a.dropMin.median - a.median) },
        { label: t("moreSensitive"), value: moreSensitive, emphasize: true },
      ]}
    />
  );
}
