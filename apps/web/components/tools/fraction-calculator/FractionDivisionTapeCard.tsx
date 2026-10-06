"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassHandle, GlassIndicatorCard, GlassTable, useValueFlash } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

/** How many copies of B fit inside A — a real tape-diagram division. Drag the handle along A's
 * own tape to change A's numerator and watch the chunk count recompute live. One of the three
 * cards (§42.3/§42.4) wired to the shared value-flash + row-to-visual hover link. */
export default function FractionDivisionTapeCard() {
  const t = useTranslations("tools.fraction-calculator.education.divisionTape");
  const tCommon = useTranslations("common");
  const { dims, setDim } = useFractionCardState();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1) || 1;
  const quotient = valueA / valueB;
  const whole = Math.floor(quotient);
  const remainder = quotient - whole;
  const { flashing, trigger } = useValueFlash();
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDim("numeratorA", Math.round(frac * denominatorA));
    trigger();
  }
  function stepA(delta: 1 | -1) {
    setDim("numeratorA", Math.max(0, denominatorA ? numeratorA + delta : numeratorA));
    trigger();
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
            <GlassHandle
              direction="horizontal"
              ariaLabel={tCommon("dragToChange")}
              onStep={stepA}
              style={{ left: `${Math.max(0, Math.min(1, valueA)) * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }}
            />
          </div>
          {/* §38: one continuous tape divided by hairline separators, never separate gapped
              blocks -- a tall count of equal gapped chunks is exactly the "single row of
              near-square cells" shape the no-squares rule exists to rule out. */}
          <div className="flex h-14 overflow-hidden rounded-sm">
            {Array.from({ length: Math.max(1, whole + (remainder > 0.01 ? 1 : 0)) }, (_, i) => {
              const key = i < whole ? "whole" : "remainder";
              return (
                <div
                  key={i}
                  data-key={key}
                  onPointerEnter={() => setHoverKey(key)}
                  onPointerLeave={() => setHoverKey(null)}
                  className="h-full flex-1"
                  style={{
                    background: "var(--glass-accent-2-strong)",
                    opacity: i < whole ? (hoverKey === "whole" ? 1 : 0.85) : hoverKey === "remainder" ? 0.55 : 0.35,
                    outline: hoverKey === key ? "2px solid var(--glass-accent-2-strong)" : "none",
                    borderInlineStart: i === 0 ? "none" : "1px solid color-mix(in oklab, var(--color-white) 45%, transparent)",
                  }}
                />
              );
            })}
          </div>
        </div>
      }
      table={
        <GlassTable
          flashing={flashing}
          activeRowKey={hoverKey}
          onRowHover={setHoverKey}
          columns={[
            { key: "step", label: t("colStep") },
            { key: "form", label: t("colForm") },
            { key: "value", label: t("colValue") },
          ]}
          rows={[
            { step: t("flip"), form: `${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)} → ${formatMathValue(denominatorB)}/${formatMathValue(numeratorB)}`, value: "" },
            { step: t("multiply"), form: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)} × ${formatMathValue(denominatorB)}/${formatMathValue(numeratorB)}`, value: formatMathValue(quotient), isKeyResult: true },
            { step: t("whole"), form: t("fitsFully"), value: formatMathValue(whole), rowKey: "whole" },
            { step: t("remainderLabel"), form: t("halfChunk"), value: formatMathValue(remainder), rowKey: "remainder" },
          ]}
        />
      }
    />
  );
}
