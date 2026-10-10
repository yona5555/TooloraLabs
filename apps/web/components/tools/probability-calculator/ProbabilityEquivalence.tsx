"use client";
import { useTranslations } from "next-intl";
import { oddsFromProbability } from "@tooloralabs/tools";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

/** Best small fraction for p (continued fractions, denominator ≤ 1000). */
function toFraction(p: number): [number, number] {
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let x = p;
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(x);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > 1000) break;
    [h0, h1, k0, k1] = [h1, h2, k1, k2];
    if (Math.abs(x - a) < 1e-9 || Math.abs(h1 / k1 - p) < 1e-9) break;
    x = 1 / (x - a);
  }
  return [h1, k1];
}

/**
 * Type #11 (Side-by-Side Equivalence): the one calculated probability written six equal ways —
 * fraction, decimal, percentage, per-thousand, odds for and odds against.
 */
export default function ProbabilityEquivalence() {
  const t = useTranslations("tools.probability-calculator.education.lab.equivalence");
  const { r, single, symbol, f, pct } = useProbabilityModel();
  const [num, den] = single ? [single.k, single.n] : toFraction(r);
  const approx = !single && Math.abs(num / Math.max(1, den) - r) > 1e-9 ? "≈ " : "";
  const odds = oddsFromProbability(r);
  const forms = [
    { label: t("fraction"), value: `${approx}${f(num, 0)}/${f(den, 0)}` },
    { label: t("decimal"), value: f(r, 4) },
    { label: t("percent"), value: pct(r) },
    { label: t("perMille"), value: `${f(r * 1000, 1)}‰` },
    { label: t("oddsFor"), value: `${f(odds.oddsFor, 3)} : 1` },
    { label: t("oddsAgainst"), value: `${f(odds.oddsAgainst, 3)} : 1` },
  ];

  const grid = (
    <div className="grid w-full grid-cols-2 gap-2 lg:w-[320px]">
      {forms.map((form, i) => (
        <div key={i} className={`flex flex-col items-center rounded-xl border px-2 py-2.5 ${i === 2 ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/15" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"}`}>
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{form.label}</span>
          <span dir="ltr" className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{form.value}</span>
          <span aria-hidden className="text-[10px] font-bold text-blue-500">{i < forms.length - 1 ? "=" : "≡"}</span>
        </div>
      ))}
    </div>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={grid}
      rows={[
        { label: t("fraction"), value: `${f(num, 0)} ÷ ${f(den, 0)} = ${f(num / Math.max(1, den), 6)}` },
        { label: t("percent"), value: `${f(r, 6)} × 100 = ${pct(r, 4)}` },
        { label: t("perMille"), value: `${f(r, 6)} × 1000 = ${f(r * 1000, 2)}` },
        { label: t("oddsFor"), value: `${f(r, 4)} / ${f(1 - r, 4)} = ${f(odds.oddsFor, 4)}` },
        { label: t("oddsAgainst"), value: `${f(1 - r, 4)} / ${f(r, 4)} = ${f(odds.oddsAgainst, 4)}` },
        { label: symbol, value: pct(r), emphasize: true },
      ]}
    />
  );
}
