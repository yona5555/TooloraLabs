"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, normalizeSci } from "@tooloralabs/tools";

/** Unlike multiply/divide, adding two scientific numbers requires rewriting both to the SAME
 * exponent first -- a real computation, not a rule stated in words. Drag B's exponent stepper and
 * watch both numbers' "before adding" row update together. */
export default function AddingEqualExponentsCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.addingEqualExponents");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const expA = Math.round(derivedA.exponent);
  const expB = Math.round(dims.exponentB);
  const commonExponent = Math.min(expA, expB);
  const shiftedCoeffA = derivedA.coefficient * 10 ** (expA - commonExponent);
  const shiftedCoeffB = dims.coefficientB * 10 ** (expB - commonExponent);
  const sum = normalizeSci(shiftedCoeffA + shiftedCoeffB, commonExponent);

  return (
    <GlassIndicatorCard
      n={15}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div dir="ltr" className="flex flex-col items-center gap-1 font-mono text-xs">
            <span className="text-[#5B6EF5]">{formatSciValue(derivedA.coefficient)}×10^{expA} = {formatSciValue(shiftedCoeffA)}×10^{commonExponent}</span>
            <span className="text-[#F0507A]">{formatSciValue(dims.coefficientB)}×10^{expB} = {formatSciValue(shiftedCoeffB)}×10^{commonExponent}</span>
            <span className="font-bold text-emerald-600">= {formatSciValue(sum.coefficient)}×10^{sum.exponent}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDim("exponentB", expB - 1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("decreaseExponentB")}>
              −
            </button>
            <span className="text-[11px] text-zinc-500">{t("adjustExponentB")}</span>
            <button type="button" onClick={() => setDim("exponentB", expB + 1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("increaseExponentB")}>
              +
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
            { k: t("commonExponent"), v: formatSciValue(commonExponent) },
            { k: t("shiftedA"), v: formatSciValue(shiftedCoeffA) },
            { k: t("shiftedB"), v: formatSciValue(shiftedCoeffB) },
            { k: t("sum"), v: `${formatSciValue(sum.coefficient)}×10^${formatSciValue(sum.exponent)}` },
          ]}
        />
      }
    />
  );
}
