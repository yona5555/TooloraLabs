"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

/**
 * Type #11 (Side-by-Side Equivalence): the same data measured from the mean and from the median.
 * The mean makes the squared distances smallest (Σ(x − m)² = Σ(x − x̄)² + n(x̄ − m)²); the
 * median makes the absolute distances smallest — each centre wins its own contest.
 */
export default function MmmCentreEquivalence() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.equivalence");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const ssMedian = a.sorted.reduce((s, v) => s + (v - a.median) ** 2, 0);
  const gap = a.mean - a.median;
  const maxAbs = Math.max(1e-9, a.sumAbsDevMean, a.sumAbsDevMedian);
  const maxSq = Math.max(1e-9, a.sumSquares, ssMedian);

  const metrics = [
    { label: "Σ|x − c|", mean: a.sumAbsDevMean, median: a.sumAbsDevMedian, max: maxAbs, winner: "median" as const },
    { label: "Σ(x − c)²", mean: a.sumSquares, median: ssMedian, max: maxSq, winner: "mean" as const },
  ];

  const panel = (
    <div className="grid w-full grid-cols-2 gap-2 lg:w-[360px]">
      {(["mean", "median"] as const).map((side) => (
        <div key={side} className={`rounded-xl border-2 p-3 ${side === "mean" ? "border-blue-400 dark:border-blue-500/50" : "border-emerald-400 dark:border-emerald-500/50"}`}>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{`c = ${tr(side)}`}</p>
          <p dir="ltr" className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{f(side === "mean" ? a.mean : a.median)}</p>
          {metrics.map((m) => {
            const v = side === "mean" ? m.mean : m.median;
            const win = m.winner === side;
            return (
              <div key={m.label} className="mt-2">
                <div dir="ltr" className="flex justify-between font-mono text-[11px]">
                  <span className="text-zinc-500 dark:text-zinc-400">{m.label}</span>
                  <span className={`font-bold ${win ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-200"}`}>{f(v)}</span>
                </div>
                <div className="mt-0.5 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className={`h-2 rounded-full ${win ? "bg-emerald-500 dark:bg-emerald-400" : "bg-zinc-400 dark:bg-zinc-500"}`} style={{ width: `${Math.max(2, (v / m.max) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={panel}
      rows={[
        { label: t("absMean"), value: f(a.sumAbsDevMean) },
        { label: t("absMedian"), value: f(a.sumAbsDevMedian) },
        { label: t("sqMean"), value: f(a.sumSquares) },
        { label: t("sqMedian"), value: `${f(a.sumSquares)} + ${a.n} × ${f(gap)}² = ${f(ssMedian)}` },
        { label: t("verdict"), value: t("verdictValue"), emphasize: true },
      ]}
    />
  );
}
