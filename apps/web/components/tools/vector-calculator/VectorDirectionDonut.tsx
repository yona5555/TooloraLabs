"use client";
import { useTranslations } from "next-intl";
import type { Vec3 } from "@tooloralabs/tools";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const SIZE = 180;
const C = SIZE / 2;
const AXIS_CLASSES = ["stroke-blue-500 dark:stroke-blue-400", "stroke-emerald-500 dark:stroke-emerald-400", "stroke-amber-500 dark:stroke-amber-400"];
const AXIS_DOT = ["bg-blue-500", "bg-emerald-500", "bg-amber-500"];

function Ring({ shares, radius, width, pct }: { shares: Vec3 | null; radius: number; width: number; pct: (v: number) => string }) {
  const circ = 2 * Math.PI * radius;
  if (!shares) return <circle cx={C} cy={C} r={radius} fill="none" strokeWidth={width} className="stroke-zinc-200 dark:stroke-zinc-700" />;
  // Cumulative start of each segment (as a fraction of the ring), computed up front.
  const starts = shares.map((_, i) => shares.slice(0, i).reduce((sum, v) => sum + v, 0));
  return (
    <g transform={`rotate(-90 ${C} ${C})`}>
      {shares.map((s, i) => {
        const len = s * circ;
        return <circle key={i} cx={C} cy={C} r={radius} fill="none" strokeWidth={width} className={AXIS_CLASSES[i]} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-starts[i] * circ} />;
      })}
      {shares.map((s, i) => {
        if (s < 0.09) return null;
        const mid = (starts[i] + s / 2) * 2 * Math.PI;
        const x = C + radius * Math.cos(mid);
        const y = C + radius * Math.sin(mid);
        return (
          <text key={`t${i}`} x={x} y={y + 3.5} textAnchor="middle" transform={`rotate(90 ${x} ${y})`} className="fill-white text-[9px] font-bold">
            {pct(s)}
          </text>
        );
      })}
    </g>
  );
}

/** §31 #6 Multi-Ring Donut: squared direction cosines of A (outer) and B (inner), each ring summing to 1. */
export default function VectorDirectionDonut() {
  const t = useTranslations("tools.vector-calculator.indicators.directionDonut");
  const { r, f, deg } = useVectorAnalysis();
  const pct = (v: number) => `${f(v * 100, 0)}%`;
  const dA = r.dirAnglesA;
  const dB = r.dirAnglesB;

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div className="flex flex-col items-center gap-2">
          <div dir="ltr">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("title")} className="block">
              <Ring shares={r.dirCos2A} radius={76} width={20} pct={pct} />
              <Ring shares={r.dirCos2B} radius={50} width={18} pct={pct} />
              <text x={C} y={C - 4} textAnchor="middle" className="fill-zinc-500 text-[9px] dark:fill-zinc-400">Σ cos²</text>
              <text x={C} y={C + 12} textAnchor="middle" className="fill-zinc-900 text-[15px] font-bold dark:fill-zinc-50">= 1</text>
            </svg>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            {(["axisX", "axisY", "axisZ"] as const).map((k, i) => (
              <span key={k} className="inline-flex items-center gap-1">
                <span className={`h-2.5 w-2.5 rounded-sm ${AXIS_DOT[i]}`} />
                {t(k)}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("outer")} · {t("inner")}</p>
        </div>
      }
      rows={[
        { label: t("alphaA"), value: deg(dA ? dA[0] : null, 1) },
        { label: t("betaA"), value: deg(dA ? dA[1] : null, 1) },
        { label: t("gammaA"), value: deg(dA ? dA[2] : null, 1) },
        { label: t("alphaB"), value: deg(dB ? dB[0] : null, 1) },
        { label: t("betaB"), value: deg(dB ? dB[1] : null, 1) },
        { label: t("gammaB"), value: deg(dB ? dB[2] : null, 1) },
        { label: "cos²α + cos²β + cos²γ", value: r.dirCos2A ? f(r.dirCos2A[0] + r.dirCos2A[1] + r.dirCos2A[2], 6) : "1", emphasize: true },
      ]}
    />
  );
}
