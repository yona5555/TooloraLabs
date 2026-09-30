"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const SMALL_SCALE = [4, 5, 6, 5, 5];
const LARGE_SCALE = [104, 105, 106, 105, 105];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #16 (Side-by-Side Comparison Cards): two data sets with the exact same standard deviation but very different means — the raw stddev alone makes them look equally spread out, but relative to their own mean (coefficient of variation) one is far more variable than the other. */
export default function CoefficientOfVariationCards() {
  const t = useTranslations("tools.statistics-calculator.education.coefficientOfVariation");
  const small = tool.execute({ values: SMALL_SCALE }, { locale: "en-US" });
  const large = tool.execute({ values: LARGE_SCALE }, { locale: "en-US" });
  if (!small.success || small.data.error || !large.success || large.data.error) return null;

  const cards = [
    { key: "small", values: SMALL_SCALE, mean: small.data.mean, stdDev: small.data.populationStdDev },
    { key: "large", values: LARGE_SCALE, mean: large.data.mean, stdDev: large.data.populationStdDev },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const cv = round2((c.stdDev / c.mean) * 100);
          return (
            <div key={c.key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(`${c.key}.title`)}</p>
              <p className="mt-1 font-mono text-xs text-zinc-400">{c.values.join(", ")}</p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{t("meanLabel")}</span>
                <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{round2(c.mean)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{t("stdDevLabel")}</span>
                <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{round2(c.stdDev)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-zinc-100 pt-2 text-sm dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">{t("cvLabel")}</span>
                <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{`${cv}%`}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
