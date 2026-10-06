"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassHandle, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

/** §38: multiplication as "take B of A" on a continuous unit bar -- never a row×column grid of
 * cells. The outer bar is the whole unit [0,1]; the A-segment is a continuous proportional fill;
 * the nested B-of-A segment (the real product) is drawn directly inside it, to the same scale, so
 * its width IS the product, not a count of shaded squares. Drag either handle to move that
 * fraction's own numerator and watch the nested segment rescale live. */
export default function FractionAreaModelCard() {
  const t = useTranslations("tools.fraction-calculator.education.areaModel");
  const tCommon = useTranslations("common");
  const { dims, setDim } = useFractionCardState();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const valueA = Math.max(0, Math.min(1, numeratorA / (denominatorA || 1)));
  const valueB = Math.max(0, Math.min(1, numeratorB / (denominatorB || 1)));
  const product = valueA * valueB;

  function dragTo(setKey: "numeratorA" | "numeratorB", den: number) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setDim(setKey, Math.round(frac * den));
    };
  }
  function stepA(delta: 1 | -1) {
    setDim("numeratorA", Math.max(0, Math.min(denominatorA, numeratorA + delta)));
  }
  function stepB(delta: 1 | -1) {
    setDim("numeratorB", Math.max(0, Math.min(denominatorB, numeratorB + delta)));
  }

  return (
    <GlassIndicatorCard
      n={5}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-full flex-col gap-5 py-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase" style={{ color: "var(--glass-accent-1-strong)" }}>
              {t("rowA", { num: formatMathValue(numeratorA), den: formatMathValue(denominatorA) })}
            </span>
            <div
              className="relative h-10 touch-none rounded-md"
              style={{ background: "var(--glass-track)" }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragTo("numeratorA", denominatorA)(e); }}
              onPointerMove={(e) => e.buttons === 1 && dragTo("numeratorA", denominatorA)(e)}
            >
              <div className="h-full rounded-md" style={{ width: `${valueA * 100}%`, background: "var(--glass-accent-1-strong)" }} />
              <GlassHandle direction="horizontal" ariaLabel={tCommon("dragToChange")} onStep={stepA} style={{ left: `${valueA * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase" style={{ color: "var(--glass-accent-2-strong)" }}>
              {t("rowB", { num: formatMathValue(numeratorB), den: formatMathValue(denominatorB) })}
            </span>
            {/* The nested segment is drawn to the SAME scale as row A directly above, so its own
                width already IS numeratorA/denominatorA × numeratorB/denominatorB -- the product
                is a geometric fact here, not a square count. */}
            <div
              className="relative h-10 touch-none overflow-hidden rounded-md"
              style={{ background: "var(--glass-track)", width: `${Math.max(valueA, 0.02) * 100}%` }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragTo("numeratorB", denominatorB)(e); }}
              onPointerMove={(e) => e.buttons === 1 && dragTo("numeratorB", denominatorB)(e)}
            >
              <div className="h-full rounded-md" style={{ width: `${valueB * 100}%`, background: "var(--glass-accent-3-strong)" }} />
              <GlassHandle direction="horizontal" ariaLabel={tCommon("dragToChange")} onStep={stepB} style={{ left: `${valueB * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }} />
            </div>
          </div>

          <p className="text-center text-sm font-bold" style={{ color: "var(--glass-accent-3-strong)" }}>
            {t("productCallout", { value: formatMathValue(product) })}
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
            { k: "A × B", v: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)} × ${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}` },
            { k: t("product"), v: formatMathValue(product), isKeyResult: true },
          ]}
        />
      }
    />
  );
}
