"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const W = 260;
const H = 186;
const CX = W / 2;
const CY = 130;
const R = 100;

/** Point on the gauge for an angle θ in degrees: 0° at the left end, 180° at the right end. */
function at(thetaDeg: number, radius: number): [number, number] {
  const phi = Math.PI - (thetaDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(phi), CY - radius * Math.sin(phi)];
}

/** §31 #8 Gradient Gauge: θ between A and B from 0° (same direction) to 180° (opposite). */
export default function VectorAngleGauge() {
  const t = useTranslations("tools.vector-calculator.indicators.angleGauge");
  const tr = useTranslations("tools.vector-calculator.live3d");
  const { r, f, n, deg, opt } = useVectorAnalysis();
  const gid = useId().replace(/:/g, "");
  const theta = r.angleDeg ?? 0;
  const [nx, ny] = at(theta, R - 14);
  const [l0x, l0y] = at(0, R);
  const [l1x, l1y] = at(180, R);

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div dir="ltr">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="block">
            <defs>
              <linearGradient id={`g${gid}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path d={`M ${l0x} ${l0y} A ${R} ${R} 0 0 1 ${l1x} ${l1y}`} fill="none" stroke={`url(#g${gid})`} strokeWidth={18} strokeLinecap="round" />
            {[0, 45, 90, 135, 180].map((d) => {
              const [tx, ty] = at(d, R + 18);
              const [a1, b1] = at(d, R - 12);
              const [a2, b2] = at(d, R + 9);
              return (
                <g key={d}>
                  <line x1={a1} y1={b1} x2={a2} y2={b2} className="stroke-white dark:stroke-zinc-900" strokeWidth={2} />
                  <text x={tx} y={ty + 4} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{d}°</text>
                </g>
              );
            })}
            {r.angleDeg !== null && (
              <>
                <line x1={CX} y1={CY} x2={nx} y2={ny} className="stroke-zinc-800 dark:stroke-zinc-100" strokeWidth={3} strokeLinecap="round" />
                <circle cx={CX} cy={CY} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
              </>
            )}
            {/* Readout below the pivot, so the needle never crosses it at any angle. */}
            <text x={CX} y={CY + 28} textAnchor="middle" className="fill-zinc-900 text-[18px] font-bold dark:fill-zinc-50">{r.angleDeg === null ? tr("notApplicable") : `θ = ${n(theta, 1)}°`}</text>
            <text x={CX} y={CY + 48} textAnchor="middle" className="fill-blue-700 text-[11px] font-semibold dark:fill-blue-300">{tr(`relation.${r.relation}`)}</text>
          </svg>
        </div>
      }
      rows={[
        { label: tr("rows.dot"), value: f(r.dot) },
        { label: "|A| × |B|", value: f(r.magA * r.magB) },
        { label: tr("rows.cos"), value: opt(r.cos, 4) },
        { label: t("sin"), value: opt(r.sin, 4) },
        { label: tr("rows.angleRad"), value: opt(r.angleRad, 4) },
        { label: tr("rows.angleDeg"), value: deg(r.angleDeg), emphasize: true },
      ]}
    />
  );
}
