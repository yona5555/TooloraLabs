"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

/**
 * Type #11 (Side-by-Side Equivalence): the same sum of squares divided by N (population) and by
 * n − 1 (sample, Bessel's correction), linked by the factor √(n / (n − 1)) that turns σ into s.
 */
export default function SdPopSampleEquivalence() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.equivalence");
  const tr = useTranslations("tools.standard-deviation-calculator.result");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, f } = useSdModel();
  if (!a) return null;
  const n = a.n;

  const column = (title: string, divisor: string, variance: number, sd: number, sym: string, tone: string) => (
    <div className={`flex w-[132px] flex-col items-center gap-1.5 rounded-xl border-2 p-3 ${tone}`}>
      <p className="text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">{title}</p>
      <p dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{`${f(a.sumSquares)} ÷ ${divisor}`}</p>
      <p dir="ltr" className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100">{`${sym}² = ${f(variance)}`}</p>
      <span className="text-zinc-400" aria-hidden>
        ↓ √
      </span>
      <p dir="ltr" className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${sym} = ${f(sd)}`}</p>
    </div>
  );

  const indicator = (
    <div className="flex items-center justify-center gap-2">
      {column(t("population"), `${n}`, a.populationVariance, a.populationStdDev, "σ", "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10")}
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-2xl font-bold text-zinc-400" aria-hidden>
          ⇄
        </span>
        <span dir="ltr" className="font-mono text-xs font-semibold text-violet-700 dark:text-violet-300">{`× ${f(a.besselFactor, 4)}`}</span>
        <span dir="ltr" className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{`√(${n}/${Math.max(1, n - 1)})`}</span>
      </div>
      {column(t("sample"), n > 1 ? `${n - 1}` : "—", a.sampleVariance, a.sampleStdDev, "s", "border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10")}
    </div>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: tl("ss"), value: f(a.sumSquares, 4) },
        { label: tr("populationStdDev"), value: `√(${f(a.sumSquares)} / ${n}) = ${f(a.populationStdDev, 4)}` },
        { label: tr("sampleStdDev"), value: n > 1 ? `√(${f(a.sumSquares)} / ${n - 1}) = ${f(a.sampleStdDev, 4)}` : tl("needTwo") },
        { label: tl("bessel"), value: f(a.besselFactor, 4), emphasize: true },
        { label: t("gap"), value: pctGap(a.sampleStdDev, a.populationStdDev, f) },
      ]}
    />
  );
}

function pctGap(s: number, sigma: number, f: (v: number, max?: number) => string): string {
  return sigma > 0 ? `+${f(((s - sigma) / sigma) * 100, 2)}%` : `+${f(0)}%`;
}
