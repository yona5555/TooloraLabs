"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue } from "@tooloralabs/tools";

/** A×B shown as a grid of denominatorA × denominatorB cells; the overlap (numeratorA rows ×
 * numeratorB columns) is the product. Drag across the grid to move how many rows/columns are
 * shaded, writing the new numerators back live. */
export default function FractionAreaModelCard() {
  const t = useTranslations("tools.fraction-calculator.education.areaModel");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const rows = Math.max(1, Math.min(8, Math.round(denominatorA)));
  const cols = Math.max(1, Math.min(8, Math.round(denominatorB)));
  const product = (numeratorA / (denominatorA || 1)) * (numeratorB / (denominatorB || 1));

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.max(1, Math.min(cols, Math.ceil(((e.clientX - rect.left) / rect.width) * cols)));
    const row = Math.max(1, Math.min(rows, Math.ceil(((e.clientY - rect.top) / rect.height) * rows)));
    setDim("numeratorA", row);
    setDim("numeratorB", col);
  }

  return (
    <GlassIndicatorCard
      n={5}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div
          className="grid touch-none gap-0.5 rounded-md border border-zinc-200 p-1 dark:border-zinc-700"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: 140, height: 140 }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            handlePointer(e);
          }}
          onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
        >
          {Array.from({ length: rows * cols }, (_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const shaded = r < numeratorA && c < numeratorB;
            return <div key={i} className="rounded-[2px]" style={{ background: shaded ? "#1FC89C" : "#F1F2FA", opacity: shaded ? 0.85 : 1 }} />;
          })}
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: "A × B", v: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)} × ${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}` },
            { k: t("cells"), v: `${formatMathValue(numeratorA * numeratorB)} / ${formatMathValue(rows * cols)}` },
            { k: t("decimal"), v: formatMathValue(product) },
          ]}
        />
      }
    />
  );
}
