"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, euclidSteps } from "@tooloralabs/tools";

/** Euclid's algorithm, genuinely run on the live numerator/denominator of A: a rectangle tiled
 * with the largest squares that fit, one step at a time. Drag the step slider to scrub through
 * the real algorithm trace. Seeded with its own A = 8/12 (not the tool's default 1/2) -- the
 * default denominator/numerator pair (2,1) finishes Euclid's algorithm in a single step with
 * nothing to scrub through, so this card picks a pair with a genuinely multi-step trace instead
 * (§37: an indicator may seed its own starting values when that makes it more interesting). */
export default function FractionGcdTilingCard() {
  const t = useTranslations("tools.fraction-calculator.education.gcdTiling");
  const { dims } = useFractionCardState({ numeratorA: 8, denominatorA: 12 });
  const a = Math.max(1, Math.round(Math.abs(dims.denominatorA)));
  const b = Math.max(1, Math.round(Math.abs(dims.numeratorA)) || 1);
  const steps = euclidSteps(Math.max(a, b), Math.min(a, b));
  const [stepIdx, setStepIdx] = useState(0);
  const idx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const active = steps[idx];
  const gcdValue = steps.length ? steps[steps.length - 1].r === 0 ? steps[steps.length - 1].b : 1 : Math.max(a, b);

  const scale = 110 / Math.max(a, b, 1);

  return (
    <GlassIndicatorCard
      n={7}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { a: formatMathValue(Math.max(a, b)), b: formatMathValue(Math.min(a, b)) })}
      visual={
        <div className="flex w-full flex-col items-center justify-center gap-3">
          <svg width={120} height={120} viewBox="0 0 120 120" className="h-auto w-full max-w-[220px]">
            <rect x="2" y="2" width={Math.max(a, b) * scale} height={Math.min(a, b) * scale} fill="none" stroke="var(--glass-accent-4-strong)" strokeWidth="2" />
            {active &&
              Array.from({ length: active.q }, (_, i) => (
                <rect key={i} x={2 + i * active.b * scale} y="2" width={active.b * scale - 1} height={active.b * scale - 1} fill="var(--glass-accent-4-strong)" opacity={0.25 + (i / Math.max(1, active.q)) * 0.5} />
              ))}
          </svg>
          {steps.length > 1 && <input type="range" min={0} max={steps.length - 1} value={idx} onChange={(e) => setStepIdx(parseInt(e.target.value, 10))} className="w-full max-w-[220px]" style={{ accentColor: "var(--glass-accent-4-strong)" }} aria-label={t("stepSliderAria")} />}
          <p className="text-sm font-bold" style={{ color: "var(--glass-accent-4-strong)" }}>
            {t("gcdEquals", { value: formatMathValue(gcdValue) })}
          </p>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("gcd", { a: formatMathValue(a), b: formatMathValue(b) }), v: formatMathValue(gcdValue) },
            { k: t("euclidSteps"), v: formatMathValue(steps.length) },
            { k: t("numerator"), v: formatMathValue(b) },
            { k: t("denominator"), v: formatMathValue(a) },
          ]}
        />
      }
    />
  );
}
