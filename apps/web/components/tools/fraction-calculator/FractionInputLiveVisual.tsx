"use client";
import { useTranslations } from "next-intl";
import { GlassHandle, usePrefersReducedMotion } from "@/components/tool-ui/glass/GlassPrimitives";
import "@/components/tool-ui/glass/glass-tokens.css";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue } from "@tooloralabs/tools";

const COLOR_A = "var(--glass-accent-1-strong)";
const COLOR_B = "var(--glass-accent-2-strong)";

/**
 * §41/§3e: a live continuous visual bound to the real input fields (part of the hero group, §37.6
 * -- two-way synced with the fields, never an independent indicator with its own state). Sits
 * inside the input card and flexes to fill the column's remaining height, so the column no longer
 * ends in a bare empty area under "Clear" whenever the result column runs taller. Each bar is a
 * single continuous proportional fill, never a cell grid (§38).
 */
export default function FractionInputLiveVisual() {
  const t = useTranslations("tools.fraction-calculator.form");
  const tCommon = useTranslations("common");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const reducedMotion = usePrefersReducedMotion();
  const valueA = Math.max(0, Math.min(1, denominatorA !== 0 ? numeratorA / denominatorA : 0));
  const valueB = Math.max(0, Math.min(1, denominatorB !== 0 ? numeratorB / denominatorB : 0));

  function dragA(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDim("numeratorA", Math.round(frac * (denominatorA || 1)));
  }
  function dragB(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDim("numeratorB", Math.round(frac * (denominatorB || 1)));
  }

  return (
    <div dir="ltr" data-input-live-visual className="mt-5 flex min-h-[120px] flex-1 flex-col justify-center gap-4 rounded-xl p-3" style={{ background: "var(--glass-table-wrap-bg)" }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--glass-muted)" }}>
        {t("liveVisualLabel")}
      </p>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: COLOR_A }}>{`A = ${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}`}</span>
        <div
          className="relative h-8 touch-none rounded-md"
          style={{ background: "var(--glass-track)" }}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragA(e); }}
          onPointerMove={(e) => e.buttons === 1 && dragA(e)}
        >
          <div className={reducedMotion ? "h-full rounded-md" : "h-full rounded-md transition-[width] duration-300 ease-out"} style={{ width: `${valueA * 100}%`, background: COLOR_A }} />
          <GlassHandle direction="horizontal" ariaLabel={tCommon("dragToChange")} style={{ left: `${valueA * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: COLOR_B }}>{`B = ${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}`}</span>
        <div
          className="relative h-8 touch-none rounded-md"
          style={{ background: "var(--glass-track)" }}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragB(e); }}
          onPointerMove={(e) => e.buttons === 1 && dragB(e)}
        >
          <div className={reducedMotion ? "h-full rounded-md" : "h-full rounded-md transition-[width] duration-300 ease-out"} style={{ width: `${valueB * 100}%`, background: COLOR_B }} />
          <GlassHandle direction="horizontal" ariaLabel={tCommon("dragToChange")} style={{ left: `${valueB * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }} />
        </div>
      </div>
    </div>
  );
}
