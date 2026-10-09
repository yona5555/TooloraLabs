"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, reciprocalSci } from "@tooloralabs/tools";

/** The live value mirrored against its own real reciprocal -- 1/(c x 10^e), renormalized -- drag
 * the coefficient stepper and watch both sides of the mirror move together. */
export default function ReciprocalMirrorCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.reciprocalMirror");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const recip = reciprocalSci(derivedA.coefficient, Math.round(derivedA.exponent));

  function adjustCoefficient(delta: number) {
    const c = Math.max(1, Math.min(9.9, Math.round((derivedA.coefficient + delta) * 10) / 10));
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(c * 10 ** Math.round(derivedA.exponent) * 100) / 100);
    } else {
      setDim("coefficientA", c);
    }
  }

  return (
    <GlassIndicatorCard
      n={12}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div dir="ltr" className="flex items-center gap-3 font-mono text-sm">
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {formatSciValue(derivedA.coefficient)}×10^{formatSciValue(Math.round(derivedA.exponent))}
            </span>
            <span className="text-zinc-400">⇄</span>
            <span className="rounded-lg bg-teal-50 px-2.5 py-1.5 font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
              {formatSciValue(recip.coefficient)}×10^{formatSciValue(recip.exponent)}
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => adjustCoefficient(-0.5)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("decrease")}>
              −
            </button>
            <button type="button" onClick={() => adjustCoefficient(0.5)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("increase")}>
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
            { k: t("value"), v: `${formatSciValue(derivedA.coefficient)}×10^${formatSciValue(Math.round(derivedA.exponent))}` },
            { k: t("reciprocal"), v: `${formatSciValue(recip.coefficient)}×10^${formatSciValue(recip.exponent)}` },
            { k: t("product"), v: formatSciValue(derivedA.coefficient * recip.coefficient * 10 ** (Math.round(derivedA.exponent) + recip.exponent)) },
          ]}
        />
      }
    />
  );
}
