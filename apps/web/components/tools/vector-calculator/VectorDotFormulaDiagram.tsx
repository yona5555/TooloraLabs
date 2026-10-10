"use client";
import { Fragment } from "react";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const TERM_STYLES = [
  "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200",
  "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
];

/** §31 #18 Formula Diagram: A·B = ax·bx + ay·by + az·bz with the live numbers in each box. */
export default function VectorDotFormulaDiagram() {
  const t = useTranslations("tools.vector-calculator.indicators.dotFormula");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, f, n } = useVectorAnalysis();
  const axes = ["x", "y", "z"] as const;

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div dir="ltr" className="flex w-[300px] flex-wrap items-center justify-center gap-2 sm:w-[420px]">
          {axes.map((ax, i) => (
            <Fragment key={ax}>
              <div className={`min-w-[78px] rounded-xl border px-2 py-2 text-center ${TERM_STYLES[i]}`}>
                <p className="font-mono text-[11px] opacity-80">a{ax}·b{ax}</p>
                <p className="font-mono text-xs">{n(r.a[i])} × {n(r.b[i])}</p>
                <p className="mt-0.5 font-mono text-base font-bold">{f(r.dotTerms[i])}</p>
              </div>
              <span className="font-mono text-lg font-bold text-zinc-400">{i < 2 ? "+" : "="}</span>
            </Fragment>
          ))}
          <div className="min-w-[78px] rounded-xl border-2 border-blue-600 bg-blue-600 px-2 py-2 text-center text-white">
            <p className="font-mono text-[11px] opacity-90">A·B</p>
            <p className="font-mono text-xs opacity-90">Σ</p>
            <p className="mt-0.5 font-mono text-base font-bold">{f(r.dot)}</p>
          </div>
        </div>
      }
      rows={[
        { label: t("termX"), value: `${n(r.a[0])} × ${n(r.b[0])} = ${f(r.dotTerms[0])}` },
        { label: t("termY"), value: `${n(r.a[1])} × ${n(r.b[1])} = ${f(r.dotTerms[1])}` },
        { label: t("termZ"), value: `${n(r.a[2])} × ${n(r.b[2])} = ${f(r.dotTerms[2])}` },
        { label: tr("dot"), value: f(r.dot), emphasize: true },
      ]}
    />
  );
}
