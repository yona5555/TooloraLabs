"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, normalizeSci } from "@tooloralabs/tools";

/** A real multiply: coefficients multiply, exponents add, then (only if needed) one renormalize
 * step -- drag either coefficient stepper to watch the raw product and the renormalized result
 * both recompute live. */
export default function MultiplyTapeCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.multiplyTape");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const rawCoefficient = derivedA.coefficient * dims.coefficientB;
  const rawExponent = Math.round(derivedA.exponent) + Math.round(dims.exponentB);
  const result = normalizeSci(rawCoefficient, rawExponent);
  const needsRenormalize = Math.abs(rawCoefficient) >= 10 || Math.abs(rawCoefficient) < 1;

  return (
    <GlassIndicatorCard
      n={6}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div dir="ltr" className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-[#5B6EF5]">{formatSciValue(derivedA.coefficient)}×10^{formatSciValue(Math.round(derivedA.exponent))}</span>
            <span className="text-zinc-400">×</span>
            <span className="text-[#F0507A]">{formatSciValue(dims.coefficientB)}×10^{formatSciValue(Math.round(dims.exponentB))}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDim("coefficientB", Math.max(1, Math.round((dims.coefficientB - 0.5) * 10) / 10))} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("decreaseB")}>
              −
            </button>
            <span className="text-[11px] text-zinc-500">{t("adjustB")}</span>
            <button type="button" onClick={() => setDim("coefficientB", Math.min(9.9, Math.round((dims.coefficientB + 0.5) * 10) / 10))} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("increaseB")}>
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
            { step: t("rawProduct"), value: `${formatSciValue(rawCoefficient)}×10^${formatSciValue(rawExponent)}` },
            { step: t("normalized"), value: `${formatSciValue(result.coefficient)}×10^${formatSciValue(result.exponent)}` },
          ]}
        />
      }
    />
  );
}
