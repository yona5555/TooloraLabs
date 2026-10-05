"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, toMathValueFraction, gcd } from "@tooloralabs/tools";

/** The same value A, scaled by ×1 through ×6 — one tile per scale, all equal to the identical
 * point on the number line. Drag the dot along the line to move A itself; every tile recomputes. */
export default function FractionEquivalentLineCard() {
  const t = useTranslations("tools.fraction-calculator.education.equivalentLine");
  const { dims, setDim } = useFractionLive();
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
        <div className="flex w-56 flex-col gap-2">
          <div
            className="relative h-8 touch-none rounded-full bg-zinc-100 dark:bg-zinc-800"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B6EF5] ring-2 ring-white dark:ring-zinc-900" style={{ left: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scales.map((s) => (
              <span key={s} className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
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
