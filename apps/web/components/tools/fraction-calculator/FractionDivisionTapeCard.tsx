"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

/** How many copies of B fit inside A — a real tape-diagram division. Drag the handle along A's
 * own tape to change A's numerator and watch the chunk count recompute live. */
export default function FractionDivisionTapeCard() {
  const t = useTranslations("tools.fraction-calculator.education.divisionTape");
  const { dims, setDim } = useFractionCardState();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1) || 1;
  const quotient = valueA / valueB;
  const whole = Math.floor(quotient);
  const remainder = quotient - whole;

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDim("numeratorA", Math.round(frac * denominatorA));
  }

  return (
    <GlassIndicatorCard
      n={8}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle", { den: formatMathValue(denominatorA) })}
      visual={
        <div className="flex w-full flex-col justify-center gap-4">
          <div
            className="relative h-16 touch-none rounded-md"
            style={{ background: "var(--glass-track)" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            <div className="h-full rounded-md" style={{ width: `${Math.max(0, Math.min(1, valueA)) * 100}%`, background: "var(--glass-accent-1-strong)" }} />
          </div>
          <div className="flex h-14 gap-1">
            {Array.from({ length: Math.max(1, whole + (remainder > 0.01 ? 1 : 0)) }, (_, i) => (
              <div key={i} className="h-full flex-1 rounded-sm" style={{ background: "var(--glass-accent-2-strong)", opacity: i < whole ? 0.8 : 0.3 }} />
            ))}
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "step", label: t("colStep") },
            { key: "form", label: t("colForm") },
            { key: "value", label: t("colValue") },
          ]}
          rows={[
            { step: t("flip"), form: `${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)} → ${formatMathValue(denominatorB)}/${formatMathValue(numeratorB)}`, value: "" },
            { step: t("multiply"), form: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)} × ${formatMathValue(denominatorB)}/${formatMathValue(numeratorB)}`, value: formatMathValue(quotient) },
            { step: t("whole"), form: t("fitsFully"), value: formatMathValue(whole) },
            { step: t("remainderLabel"), form: t("halfChunk"), value: formatMathValue(remainder) },
          ]}
        />
      }
    />
  );
}
