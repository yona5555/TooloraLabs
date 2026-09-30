"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const SYMMETRIC = [10, 12, 14, 16, 18];
const SKEWED = [10, 11, 12, 13, 45];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #16 (Side-by-Side Comparison Cards): two real 5-point data sets, same card structure — in the symmetric set mean and median coincide; in the skewed set they genuinely diverge, the real signature of a skewed distribution. */
export default function SkewedVsSymmetricComparison() {
  const t = useTranslations("tools.statistics-calculator.education.skewComparison");
  const sym = tool.execute({ values: SYMMETRIC }, { locale: "en-US" });
  const skew = tool.execute({ values: SKEWED }, { locale: "en-US" });
  if (!sym.success || sym.data.error || !skew.success || skew.data.error) return null;

  const cards = [
    { key: "symmetric", values: SYMMETRIC, mean: sym.data.mean, median: sym.data.median },
    { key: "skewed", values: SKEWED, mean: skew.data.mean, median: skew.data.median },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(`${c.key}.title`)}</p>
            <p className="mt-1 font-mono text-xs text-zinc-400">{c.values.join(", ")}</p>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("meanLabel")}</span>
              <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{round2(c.mean)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("medianLabel")}</span>
              <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{round2(c.median)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
