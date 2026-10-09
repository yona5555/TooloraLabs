"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, normalizeSci } from "@tooloralabs/tools";

/** A real divide: coefficients divide, exponents subtract, then (only if needed) one renormalize
 * step -- drag either exponent stepper and watch the raw quotient and renormalized result both
 * recompute live. */
export default function DivideTapeCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.divideTape");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const safeB = dims.coefficientB === 0 ? 1 : dims.coefficientB;
  const rawCoefficient = derivedA.coefficient / safeB;
  const rawExponent = Math.round(derivedA.exponent) - Math.round(dims.exponentB);
  const result = normalizeSci(rawCoefficient, rawExponent);
  const needsRenormalize = Math.abs(rawCoefficient) >= 10 || Math.abs(rawCoefficient) < 1;

  return (
    <GlassIndicatorCard
      n={7}
      accent="pink"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div dir="ltr" className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-[#5B6EF5]">{formatSciValue(derivedA.coefficient)}×10^{formatSciValue(Math.round(derivedA.exponent))}</span>
            <span className="text-zinc-400">÷</span>
            <span className="text-[#F0507A]">{formatSciValue(dims.coefficientB)}×10^{formatSciValue(Math.round(dims.exponentB))}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDim("exponentB", Math.round(dims.exponentB) - 1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("decreaseExponentB")}>
              −
            </button>
            <span className="text-[11px] text-zinc-500">{t("adjustExponentB")}</span>
            <button type="button" onClick={() => setDim("exponentB", Math.round(dims.exponentB) + 1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("increaseExponentB")}>
              +
            </button>
          </div>
          <p className={`text-xs font-semibold ${needsRenormalize ? "text-amber-600" : "text-emerald-600"}`}>{needsRenormalize ? t("renormalizeNeeded") : t("alreadyNormalized")}</p>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "step", label: t("colStep") },
            { key: "value", label: t("colValue") },
          ]}
          rows={[
            { step: t("rawQuotient"), value: `${formatSciValue(rawCoefficient)}×10^${formatSciValue(rawExponent)}` },
            { step: t("normalized"), value: `${formatSciValue(result.coefficient)}×10^${formatSciValue(result.exponent)}` },
          ]}
        />
      }
    />
  );
}
