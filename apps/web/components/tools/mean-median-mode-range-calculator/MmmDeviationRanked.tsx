"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

/** Type #5 (Ranked Horizontal Bar List): every value's distance from the mean, largest first, colored by side. */
export default function MmmDeviationRanked() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.deviations");
  const tl = useTranslations("tools.mean-median-mode-range-calculator.live3d");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const ranked = [...a.deviations].sort((p, q) => Math.abs(q.deviation) - Math.abs(p.deviation));
  const max = Math.max(1e-9, ...ranked.map((d) => Math.abs(d.deviation)));
  const above = a.deviations.filter((d) => d.deviation > 0).reduce((s, d) => s + d.deviation, 0);
  const below = a.deviations.filter((d) => d.deviation < 0).reduce((s, d) => s + d.deviation, 0);

  const list = (
    <ol className="w-full space-y-1.5 lg:w-[360px]">
      {ranked.map((d, rank) => (
        <li key={rank}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="text-zinc-600 dark:text-zinc-300">{`${rank + 1}. x = ${f(d.value)}`}</span>
            <span dir="ltr" className={`font-mono font-bold ${d.deviation >= 0 ? "text-sky-700 dark:text-sky-300" : "text-rose-700 dark:text-rose-300"}`}>
              {`${d.deviation > 0 ? "+" : ""}${f(d.deviation)}`}
            </span>
          </div>
          <div className="mt-0.5 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-2.5 rounded-full ${d.deviation >= 0 ? "bg-sky-500 dark:bg-sky-400" : "bg-rose-500 dark:bg-rose-400"}`}
              style={{ width: `${Math.max(1.5, (Math.abs(d.deviation) / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: t("largest"), value: `x = ${f(ranked[0].value)} · ${f(ranked[0].deviation)}` },
        { label: t("aboveSum"), value: `+${f(above)}` },
        { label: t("belowSum"), value: f(below) },
        { label: tl("sumDev"), value: `${f(above)} + (${f(below)}) = ${f(a.sumDeviations)}` },
        { label: tl("mad"), value: f(a.meanAbsDeviation), emphasize: true },
      ]}
    />
  );
}
