"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { countDecimalPlaces, countSignificantFigures } from "@tooloralabs/tools";

const VALUES = ["0.008", "125.40"];

/** Type #16 (Side-by-Side Comparison Cards): the same two numbers, same card structure, but counted by two genuinely different rules — decimal places (digits after the point) and significant figures (measured precision) — a common source of confusion this makes concrete. */
export default function DecimalPlacesVsSigFigsComparison() {
  const t = useTranslations("tools.significant-figures-calculator.education.decimalVsSigFigs");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="font-mono text-2xl font-bold text-zinc-800 dark:text-zinc-100">{v}</p>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("decimalPlacesLabel")}</span>
              <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{countDecimalPlaces(v)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("sigFigsLabel")}</span>
              <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{countSignificantFigures(v)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
