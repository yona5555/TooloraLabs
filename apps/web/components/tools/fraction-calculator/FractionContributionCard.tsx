"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, contributionShare } from "@tooloralabs/tools";

/** A stacked bar showing how much of the result each operand contributes — drag the divider to
 * rebalance A's own share of the result by changing A's numerator directly. */
export default function FractionContributionCard() {
  const t = useTranslations("tools.fraction-calculator.education.contribution");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const share = contributionShare(operation, valueA, valueB, result);
  const total = Math.max(0.0001, Math.abs(share.fromA) + Math.abs(share.fromB));
  const pctA = Math.max(0, Math.min(100, (Math.abs(share.fromA) / total) * 100));

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
    setDim("numeratorA", Math.round(frac * denominatorA));
  }

  return (
    <GlassIndicatorCard
      n={13}
      accent="pink"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-56 flex-col gap-2">
          <div
            className="relative flex h-8 touch-none overflow-hidden rounded-md"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            <div className="flex items-center justify-center text-[10px] font-bold" style={{ width: `${pctA}%`, background: "var(--glass-accent-1-strong)", color: "var(--color-white)" }}>
              A
            </div>
            <div className="flex flex-1 items-center justify-center text-[10px] font-bold" style={{ background: "var(--glass-accent-2-strong)", color: "var(--color-white)" }}>
              B
            </div>
          </div>
          <p className="text-center text-[11px]" style={{ color: "var(--glass-muted)" }}>
            {t("gapToOne", { gap: formatMathValue(share.gapToOne) })}
          </p>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colSource") },
            { key: "v", label: t("colContribution") },
          ]}
          rows={[
            { k: "A", v: formatMathValue(share.fromA) },
            { k: "B", v: formatMathValue(share.fromB) },
            { k: t("result"), v: formatMathValue(result) },
            { k: t("gap"), v: formatMathValue(share.gapToOne) },
          ]}
        />
      }
    />
  );
}
