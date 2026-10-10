"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

/**
 * Type #16 (Side-by-Side Comparison Cards): mean, median and mode for the live data, each with
 * where it sits inside [min, max], what it is built from and whether one outlier can move it —
 * plus which centre this particular data set is best summarized by.
 */
export default function MmmCentreCards() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.centreCards");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const pos = (v: number) => (a.range > 0 ? ((v - a.min) / a.range) * 100 : 50);
  const modeV = a.modes.length ? a.modes[0] : null;
  const cards = [
    { key: "mean", value: f(a.mean), v: a.mean, uses: t("usesAll"), robust: false, bar: "bg-blue-600 dark:bg-blue-400", ring: "border-blue-400 dark:border-blue-500/50" },
    { key: "median", value: f(a.median), v: a.median, uses: t("usesMiddle"), robust: true, bar: "bg-emerald-600 dark:bg-emerald-400", ring: "border-emerald-400 dark:border-emerald-500/50" },
    {
      key: "mode",
      value: a.modes.length ? a.modes.map((m) => f(m)).join(", ") : tr("noMode"),
      v: modeV,
      uses: t("usesFrequent"),
      robust: true,
      bar: "bg-amber-500 dark:bg-amber-400",
      ring: "border-amber-400 dark:border-amber-500/50",
    },
  ];
  const skewed = a.outliers.length > 0 || Math.abs(a.pearsonSkew) >= 0.5;
  const best = skewed ? tr("median") : tr("mean");

  const grid = (
    <div className="grid w-full grid-cols-3 gap-2 lg:w-[380px]">
      {cards.map((c) => (
        <div key={c.key} className={`flex flex-col rounded-xl border-2 p-2.5 ${c.ring}`}>
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{tr(c.key)}</span>
          <span dir="ltr" className="mt-0.5 truncate font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{c.value}</span>
          <div dir="ltr" className="relative mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
            {c.v !== null && <span className={`absolute top-1/2 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded ${c.bar}`} style={{ left: `${pos(c.v)}%` }} />}
          </div>
          <div dir="ltr" className="mt-0.5 flex justify-between font-mono text-[9px] text-zinc-400">
            <span>{f(a.min)}</span>
            <span>{f(a.max)}</span>
          </div>
          <span className="mt-1.5 text-[11px] leading-4 text-zinc-600 dark:text-zinc-300">{c.uses}</span>
          <span className={`mt-1 text-[11px] font-semibold ${c.robust ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
            {c.robust ? t("robust") : t("sensitive")}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={grid}
      rows={[
        { label: `${tr("mean")} − ${tr("median")}`, value: f(a.mean - a.median) },
        { label: `${tr("mean")} − ${tr("mode")}`, value: modeV !== null ? f(a.mean - modeV) : tr("noMode") },
        { label: t("outlierCount"), value: String(a.outliers.length) },
        { label: t("best"), value: best, emphasize: true, note: skewed ? t("whySkewed") : t("whySymmetric") },
      ]}
    />
  );
}
