"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, formatPercent } from "@tooloralabs/tools";

/** 100 cells, one whole — drag across the grid to set the live result's own numerator (holding
 * the current denominator), so the filled percentage always matches the real fraction. */
export default function FractionPercentWaffleCard() {
  const t = useTranslations("tools.fraction-calculator.education.percentWaffle");
  const { dims, setDim } = useFractionCardState();
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const pct = Math.max(0, Math.min(100, result * 100));
  const filled = Math.round(pct);

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.max(0, Math.min(9, Math.floor(((e.clientX - rect.left) / rect.width) * 10)));
    const row = Math.max(0, Math.min(9, Math.floor(((e.clientY - rect.top) / rect.height) * 10)));
    const n = row * 10 + col + 1;
    setDim("numeratorA", Math.round((n / 100) * denominatorA));
  }

  return (
    <GlassIndicatorCard
      n={6}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle", { pct: formatPercent(pct) })}
      visual={
        <div className="flex w-full flex-col items-center gap-2">
          <div className="grid aspect-square w-full max-w-[180px] touch-none grid-cols-10 gap-[1.5px]" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }} onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}>
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} className="rounded-[1px]" style={{ background: i < filled ? "var(--glass-accent-3-strong)" : "var(--glass-track)" }} />
            ))}
          </div>
          <p className="text-lg font-bold" style={{ color: "var(--glass-accent-3-strong)" }}>{`${formatPercent(pct)}%`}</p>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("result"), v: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}` },
            { k: t("percent"), v: `${formatPercent(pct)}%` },
            { k: t("cellsFilled"), v: `${filled} / 100` },
            { k: t("rounded"), v: `${Math.round(pct)}%` },
          ]}
        />
      }
    />
  );
}
