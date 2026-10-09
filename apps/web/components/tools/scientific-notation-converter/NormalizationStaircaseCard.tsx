"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, normalizationSteps, standardValueOf } from "@tooloralabs/tools";

/** A real digit-shift trace from the raw standard value down to its normalized [1,10) form, one
 * step at a time -- drag the step slider to scrub through the actual algorithm, not a canned list. */
export default function NormalizationStaircaseCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.normalizationStaircase");
  const { dims } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const standard = standardValueOf(derivedA.coefficient, derivedA.exponent);
  const steps = normalizationSteps(standard);
  const [stepIdx, setStepIdx] = useState(0);
  const idx = Math.min(stepIdx, steps.length - 1);
  const active = steps[idx];

  return (
    <GlassIndicatorCard
      n={2}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col-reverse gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-mono" style={{ background: i === idx ? "#EEF0FE" : "transparent", opacity: i === idx ? 1 : 0.5 }}>
                <span className="w-24 text-end">{formatSciValue(s.coefficient)}</span>
                <span className="text-zinc-400">× 10^</span>
                <span className="w-6">{formatSciValue(s.exponent)}</span>
              </div>
            ))}
          </div>
          {steps.length > 1 && <input type="range" min={0} max={steps.length - 1} value={idx} onChange={(e) => setStepIdx(parseInt(e.target.value, 10))} className="w-40 accent-blue-600" aria-label={t("stepSliderAria")} />}
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("step"), v: `${idx + 1} / ${steps.length}` },
            { k: t("coefficient"), v: formatSciValue(active.coefficient) },
            { k: t("exponent"), v: formatSciValue(active.exponent) },
            { k: t("normalized"), v: Math.abs(active.coefficient) >= 1 && Math.abs(active.coefficient) < 10 ? t("yes") : t("no") },
          ]}
        />
      }
    />
  );
}
