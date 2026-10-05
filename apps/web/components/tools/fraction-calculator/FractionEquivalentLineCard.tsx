"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, toMathValueFraction, gcd } from "@tooloralabs/tools";

/** The same value A, scaled by ×1 through ×6 — one tile per scale, all equal to the identical
 * point on the number line. Drag the dot along the line to move A itself; every tile recomputes. */
export default function FractionEquivalentLineCard() {
  const t = useTranslations("tools.fraction-calculator.education.equivalentLine");
  const { dims, setDim } = useFractionCardState();
  const { numeratorA, denominatorA } = dims;
  const value = numeratorA / (denominatorA || 1);
  const scales = [1, 2, 3, 4, 5, 6];

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const frac = toMathValueFraction(x, 12) ?? { num: Math.round(x * 12), den: 12 };
    const d = frac.den || 1;
    const divisor = gcd(frac.num, d) || 1;
    setDim("numeratorA", frac.num / divisor);
    setDim("denominatorA", d / divisor);
  }

  return (
    <GlassIndicatorCard
      n={12}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle", { value: formatMathValue(value) })}
      visual={
        <div className="flex w-full flex-col justify-center gap-6">
          <div
            className="relative h-20 touch-none rounded-full"
            style={{ background: "var(--glass-track)" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            <div
              className="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${Math.max(0, Math.min(1, value)) * 100}%`, background: "var(--glass-accent-1-strong)", boxShadow: "0 0 0 3px var(--glass-handle-ring)" }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {scales.map((s) => (
              <span key={s} className="rounded-lg px-4 py-3 text-base font-semibold" style={{ background: "var(--glass-accent-1-soft)", color: "var(--glass-accent-1-strong)" }}>
                {formatMathValue(numeratorA * s)}/{formatMathValue(denominatorA * s)}
              </span>
            ))}
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "scale", label: t("colScale") },
            { key: "frac", label: t("colFraction") },
            { key: "value", label: t("colValue") },
          ]}
          rows={scales.map((s) => ({
            scale: `×${s}`,
            frac: `${formatMathValue(numeratorA * s)}/${formatMathValue(denominatorA * s)}`,
            value: formatMathValue(value),
          }))}
        />
      }
    />
  );
}
