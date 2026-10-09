"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue } from "@tooloralabs/tools";

/** Drag the digits-kept slider to cut the live coefficient's precision down and watch exactly
 * what gets thrown away. */
export default function PrecisionCutoffCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.precisionCutoff");
  const { dims } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const [digitsKept, setDigitsKept] = useState(3);
  const rounded = Number(derivedA.coefficient.toFixed(digitsKept));
  const dropped = Number((derivedA.coefficient - rounded).toPrecision(6));

  return (
    <GlassIndicatorCard
      n={8}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { digits: digitsKept })}
      visual={
        <div className="flex w-52 flex-col items-center gap-2">
          <div dir="ltr" className="font-mono text-lg font-bold text-cyan-700">
            {rounded.toFixed(digitsKept)}×10^{formatSciValue(Math.round(derivedA.exponent))}
          </div>
          <input type="range" min={0} max={8} value={digitsKept} onChange={(e) => setDigitsKept(parseInt(e.target.value, 10))} className="w-40 accent-cyan-600" aria-label={t("digitsSliderAria")} />
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("fullCoefficient"), v: formatSciValue(derivedA.coefficient) },
            { k: t("roundedCoefficient"), v: rounded.toFixed(digitsKept) },
            { k: t("dropped"), v: formatSciValue(dropped) },
          ]}
        />
      }
    />
  );
}
