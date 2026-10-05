"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, decimalExpansion } from "@tooloralabs/tools";

/** A real long-division trace of A, classified as terminating or repeating (with the true repeat
 * cycle, not a heuristic). Drag the denominator stepper to see the classification flip live. */
export default function FractionDecimalExpansionCard() {
  const t = useTranslations("tools.fraction-calculator.education.decimalExpansion");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA } = dims;
  const expansion = decimalExpansion(Math.round(numeratorA), Math.max(1, Math.round(denominatorA)), 12);

  function adjustDen(delta: number) {
    setDim("denominatorA", Math.max(1, Math.round(denominatorA) + delta));
  }

  return (
    <GlassIndicatorCard
      n={11}
      accent="purple"
      title={t("title")}
      subtitle={t("subtitle", { kind: expansion.kind === "terminates" ? t("terminating") : t("repeating") })}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg px-3 py-2 font-mono text-base" style={{ background: "var(--glass-table-wrap-bg)", color: "var(--glass-title)" }}>
            0.
            {expansion.kind === "terminates" ? (
              <span style={{ color: "var(--glass-accent-5-strong)" }}>{expansion.digits}</span>
            ) : (
              <>
                {expansion.nonRepeating}
                <span className="rounded underline decoration-2" style={{ background: "var(--glass-accent-5-soft)", color: "var(--glass-accent-5-strong)" }}>
                  {expansion.repeating}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => adjustDen(-1)} className="h-6 w-6 rounded-full text-xs font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }} aria-label={t("decrease")}>
              −
            </button>
            <span className="text-[11px]" style={{ color: "var(--glass-muted)" }}>
              {t("denominatorLabel", { den: formatMathValue(denominatorA) })}
            </span>
            <button type="button" onClick={() => adjustDen(1)} className="h-6 w-6 rounded-full text-xs font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }} aria-label={t("increase")}>
              +
            </button>
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("fraction"), v: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}` },
            { k: t("classification"), v: expansion.kind === "terminates" ? t("terminating") : t("repeating") },
            { k: t("cycleLength"), v: expansion.kind === "repeats" ? formatMathValue(expansion.repeating.length) : "0" },
            { k: t("decimal"), v: formatMathValue(numeratorA / (denominatorA || 1)) },
          ]}
        />
      }
    />
  );
}
