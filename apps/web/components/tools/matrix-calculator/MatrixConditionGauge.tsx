"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { conditionNumber2, singularValues2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

const W = 300;
const H = 190;
const CX = W / 2;
const CY = 160;
const R = 118;
const MAX_LOG = 4;

const polar = (frac: number, r = R): [number, number] => {
  const a = Math.PI * (1 - frac);
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};

/**
 * Type #8 (Gradient Gauge): A's condition number κ = σ₁/σ₂ on a log scale from 1 (perfectly
 * conditioned, a rotation) to 10⁴ and beyond — roughly how many decimal digits solving Ax = b
 * can lose to rounding.
 */
export default function MatrixConditionGauge() {
  const t = useTranslations("tools.matrix-calculator.education.lab.condition");
  const gid = useId().replace(/:/g, "");
  const { A, f } = useMatrixModel();
  const [s1, s2] = singularValues2(A);
  const k = conditionNumber2(A);
  const logK = Number.isFinite(k) ? Math.log10(k) : MAX_LOG;
  const frac = Math.min(1, logK / MAX_LOG);
  const band = !Number.isFinite(k) ? "singular" : logK < 1 ? "well" : logK < 2 ? "moderate" : "ill";
  const [nx, ny] = polar(frac, R - 22);
  const [ax, ay] = polar(0);
  const [bx, by] = polar(1);

  const gauge = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d={`M${ax},${ay} A${R},${R} 0 0 1 ${bx},${by}`} fill="none" stroke={`url(#${gid})`} strokeWidth={18} strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((p) => {
        const [tx, ty] = polar(p / MAX_LOG, R + 18);
        return (
          <text key={p} x={tx} y={ty} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">
            {p === 0 ? "1" : `10${["", "¹", "²", "³", "⁴"][p]}`}
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 34} textAnchor="middle" className="fill-zinc-800 font-mono text-[18px] font-bold dark:fill-zinc-100">{`κ = ${f(k, 2)}`}</text>
      <text x={CX} y={CY - 16} textAnchor="middle" className="fill-zinc-500 text-[11px] font-semibold dark:fill-zinc-400">{t(`bands.${band}`)}</text>
    </svg>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={gauge}
      rows={[
        { label: "σ₁", value: f(s1) },
        { label: "σ₂", value: f(s2) },
        { label: "κ = σ₁ / σ₂", value: Number.isFinite(k) ? `${f(s1)} / ${f(s2)} = ${f(k, 2)}` : "∞", emphasize: true },
        { label: t("digits"), value: Number.isFinite(k) ? `≈ ${f(logK, 1)}` : "∞" },
        { label: t("band"), value: t(`bands.${band}`) },
      ]}
    />
  );
}
