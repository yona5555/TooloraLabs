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
          <div className="rounded-lg bg-zinc-50 px-3 py-2 font-mono text-base dark:bg-zinc-900">
            0.
            {expansion.kind === "terminates" ? (
              <span className="text-violet-600">{expansion.digits}</span>
            ) : (
              <>
                {expansion.nonRepeating}
                <span className="rounded bg-violet-100 text-violet-700 underline decoration-2 dark:bg-violet-900/40">{expansion.repeating}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => adjustDen(-1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("decrease")}>
              −
            </button>
            <span className="text-[11px] text-zinc-500">{t("denominatorLabel", { den: formatMathValue(denominatorA) })}</span>
            <button type="button" onClick={() => adjustDen(1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("increase")}>
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
