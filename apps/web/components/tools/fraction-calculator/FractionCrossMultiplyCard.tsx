"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, crossMultiplyCompare } from "@tooloralabs/tools";

/** Cross-multiplication as two real diagonal arrows between A and B — drag either numerator
 * stepper and watch which cross-product wins change live, without ever computing a decimal. */
export default function FractionCrossMultiplyCard() {
  const t = useTranslations("tools.fraction-calculator.education.crossMultiply");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const compare = crossMultiplyCompare(numeratorA, denominatorA, numeratorB, denominatorB);

  return (
    <GlassIndicatorCard
      n={15}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { winner: compare.larger === "equal" ? t("equal") : compare.larger })}
      visual={
        <div className="flex flex-col items-center gap-3">
          <svg width={160} height={90} viewBox="0 0 160 90">
            <text x="30" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5B6EF5">{formatMathValue(numeratorA)}</text>
            <text x="30" y="80" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5B6EF5">{formatMathValue(denominatorA)}</text>
            <text x="130" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F0507A">{formatMathValue(numeratorB)}</text>
            <text x="130" y="80" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F0507A">{formatMathValue(denominatorB)}</text>
            <line x1="38" y1="16" x2="122" y2="74" stroke={compare.larger === "A" ? "#1FC89C" : "#D4D6E8"} strokeWidth={compare.larger === "A" ? 3 : 1.5} />
            <line x1="38" y1="74" x2="122" y2="16" stroke={compare.larger === "B" ? "#1FC89C" : "#D4D6E8"} strokeWidth={compare.larger === "B" ? 3 : 1.5} />
            <text x="80" y="50" textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.6}>
              {compare.larger === "equal" ? "=" : compare.larger === "A" ? ">" : "<"}
            </text>
          </svg>
          <div className="flex gap-3">
            <button type="button" onClick={() => setDim("numeratorA", numeratorA + 1)} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {t("incrementA")}
            </button>
            <button type="button" onClick={() => setDim("numeratorB", numeratorB + 1)} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              {t("incrementB")}
            </button>
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("crossA"), v: `${formatMathValue(numeratorA)} × ${formatMathValue(denominatorB)} = ${formatMathValue(compare.crossA)}` },
            { k: t("crossB"), v: `${formatMathValue(numeratorB)} × ${formatMathValue(denominatorA)} = ${formatMathValue(compare.crossB)}` },
            { k: t("conclusion"), v: compare.larger === "equal" ? t("equalFractions") : t("larger", { which: compare.larger }) },
          ]}
        />
      }
    />
  );
}
