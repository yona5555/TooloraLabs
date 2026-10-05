"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

const N_RANGE = Array.from({ length: 10 }, (_, i) => i + 1);

/** A real curve of 1/2 + 1/n as n runs 1..10, with the live denominator B marked on it — drag
 * along the curve to set B's own denominator directly. */
export default function FractionSensitivityCard() {
  const t = useTranslations("tools.fraction-calculator.education.sensitivity");
  const { dims, setDim } = useFractionCardState();
  const { denominatorB } = dims;
  const n = Math.max(1, Math.min(10, Math.round(Math.abs(denominatorB)) || 1));
  const points = N_RANGE.map((k) => ({ n: k, value: 0.5 + 1 / k }));
  const maxV = Math.max(...points.map((p) => p.value));
  const minV = Math.min(...points.map((p) => p.value));
  const w = 320;
  const h = 150;
  const toX = (k: number) => 10 + ((k - 1) / 9) * (w - 20);
  const toY = (v: number) => h - 10 - ((v - minV) / (maxV - minV || 1)) * (h - 20);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.n)} ${toY(p.value)}`).join(" ");
  const active = points.find((p) => p.n === n) ?? points[0];

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const k = Math.max(1, Math.min(10, Math.round(1 + ((x - 10) / (w - 20)) * 9)));
    setDim("denominatorB", k);
    setDim("numeratorB", 1);
  }

  return (
    <GlassIndicatorCard
      n={16}
      accent="purple"
      title={t("title")}
      subtitle={t("subtitle", { n: formatMathValue(n), value: formatMathValue(active.value) })}
      visual={
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-[560px] touch-none" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }} onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}>
          <path d={path} fill="none" stroke="var(--glass-accent-5-strong)" strokeWidth={2} />
          {points.map((p) => (
            <circle key={p.n} cx={toX(p.n)} cy={toY(p.value)} r={p.n === n ? 4 : 2} fill={p.n === n ? "var(--glass-accent-5-strong)" : "var(--glass-accent-5-soft)"} />
          ))}
        </svg>
      }
      table={
        <GlassTable
          columns={[
            { key: "n", label: "n" },
            { key: "value", label: t("colValue") },
          ]}
          rows={points.map((p) => ({ n: formatMathValue(p.n), value: `${p.n === n ? "→ " : ""}${formatMathValue(p.value)}` }))}
        />
      }
    />
  );
}
