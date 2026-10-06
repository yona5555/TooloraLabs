"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, euclidSteps } from "@tooloralabs/tools";

/** §38: Euclid's algorithm as a ladder of shrinking continuous TAPE bars -- never a rectangle
 * tiled with squares. Each rung is one step's own `a`-length tape, divided by hairline separators
 * into `q` equal-width (but never near-square -- each is wide and short) segments of length `b`,
 * with the leftover remainder tape drawn as the next, shorter rung underneath. Drag the step
 * slider to scrub through the real algorithm trace on the live numerator/denominator of A.
 * Seeded with its own A = 8/12 (not the tool's default 1/2) -- the default pair (2,1) finishes
 * Euclid's algorithm in a single step with nothing to scrub through, so this card picks a pair
 * with a genuinely multi-step trace instead (§37: an indicator may seed its own starting values
 * when that makes it more interesting). */
export default function FractionGcdTilingCard() {
  const t = useTranslations("tools.fraction-calculator.education.gcdTiling");
  const { dims } = useFractionCardState({ numeratorA: 8, denominatorA: 12 });
  const a = Math.max(1, Math.round(Math.abs(dims.denominatorA)));
  const b = Math.max(1, Math.round(Math.abs(dims.numeratorA)) || 1);
  const steps = euclidSteps(Math.max(a, b), Math.min(a, b));
  const [stepIdx, setStepIdx] = useState(0);
  const idx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const gcdValue = steps.length ? (steps[steps.length - 1].r === 0 ? steps[steps.length - 1].b : 1) : Math.max(a, b);
  const maxA = steps.length ? steps[0].a : Math.max(a, b);

  return (
    <GlassIndicatorCard
      n={7}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { a: formatMathValue(Math.max(a, b)), b: formatMathValue(Math.min(a, b)) })}
      visual={
        <div className="flex w-full flex-col items-stretch justify-center gap-2.5">
          {steps.map((s, i) => {
            const active = i === idx;
            const widthPct = (s.a / maxA) * 100;
            return (
              <div key={i} className="flex items-center gap-2" style={{ opacity: active ? 1 : 0.35 }}>
                <span className="w-10 shrink-0 text-end text-[10px] font-semibold" style={{ color: "var(--glass-muted)" }}>
                  {formatMathValue(s.a)}
                </span>
                <div className="flex h-5 overflow-hidden rounded-sm" style={{ width: `${widthPct}%` }}>
                  {Array.from({ length: s.q }, (_, seg) => (
                    <div
                      key={seg}
                      className="h-full flex-1"
                      style={{
                        background: "var(--glass-accent-4-strong)",
                        borderInlineStart: seg === 0 ? "none" : "1px solid color-mix(in oklab, var(--color-white) 45%, transparent)",
                      }}
                    />
                  ))}
                  {s.r > 0 && <div className="h-full" style={{ width: `${(s.r / s.a) * 100}%`, background: "var(--glass-track)" }} />}
                </div>
              </div>
            );
          })}
          {steps.length > 1 && (
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={idx}
              onChange={(e) => setStepIdx(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
              style={{ accentColor: "var(--glass-accent-4-strong)" }}
              aria-label={t("stepSliderAria")}
              data-role="handle"
            />
          )}
          <p className="text-center text-sm font-bold" style={{ color: "var(--glass-accent-4-strong)" }}>
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
            { k: t("gcd", { a: formatMathValue(a), b: formatMathValue(b) }), v: formatMathValue(gcdValue), isKeyResult: true },
            { k: t("euclidSteps"), v: formatMathValue(steps.length) },
            { k: t("numerator"), v: formatMathValue(b) },
            { k: t("denominator"), v: formatMathValue(a) },
          ]}
        />
      }
    />
  );
}
