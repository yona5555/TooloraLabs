"use client";
import { useTranslations } from "next-intl";
import { projectileRange, rangeAngleCurve } from "@tooloralabs/tools";
import PmIndicatorCard from "./PmIndicatorCard";
import { r2, usePmModel } from "./PmLiveContext";
import { niceCeil } from "./PmLaunchLab";

const W = 400;
const H = 240;
const L = 44;
const R = 388;
const T = 40;
const B = 206;

/**
 * Type #20 (Annotated Reference Point within a distribution): the range R(θ) for every launch
 * angle 0–90° at the live v₀, h₀ and g, with the current angle, the optimal angle θ* and the
 * complementary angle 90° − θ annotated on the curve.
 */
export default function PmRangeAngleCurve() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.curve");
  const { a, f, pct } = usePmModel();
  if (!a) return null;

  const curve = rangeAngleCurve(a, 1);
  const yMax = niceCeil(Math.max(a.maxRange, 1e-6) * 1.12);
  const px = (deg: number) => r2(L + (deg / 90) * (R - L));
  const py = (v: number) => r2(B - (v / yMax) * (B - T));
  const d = curve.map((q, i) => `${i ? "L" : "M"}${px(q.angle)},${py(q.range)}`).join(" ");
  const area = `${d} L${px(90)},${B} L${px(0)},${B} Z`;
  const cur = { x: px(Math.min(90, Math.max(0, a.angle))), y: py(a.range) };
  const comp = 90 - a.angle;
  const compR = projectileRange(a.speed, comp, a.height, a.gravity);
  const showComp = comp >= 0 && comp <= 90 && Math.abs(comp - a.angle) > 3;
  const opt = { x: px(a.optimalAngle), y: py(a.maxRange) };

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {[0, 15, 30, 45, 60, 75, 90].map((deg) => (
        <g key={deg}>
          <line x1={px(deg)} y1={T} x2={px(deg)} y2={B} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text x={px(deg)} y={B + 14} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{`${deg}°`}</text>
        </g>
      ))}
      {[0, 0.5, 1].map((s) => (
        <text key={s} x={L - 5} y={py(s * yMax) + 3} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{f(s * yMax, 1)}</text>
      ))}
      <text x={R} y={B + 28} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">θ</text>
      <text x={L + 4} y={T - 6} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">R (m)</text>
      <path d={area} className="fill-blue-500/10 dark:fill-blue-400/10" />
      <path d={d} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {/* optimal angle, complementary angle and the current angle on the curve */}
      <line x1={opt.x} y1={opt.y} x2={opt.x} y2={B} strokeDasharray="4 3" className="stroke-emerald-600 dark:stroke-emerald-400" />
      <circle cx={opt.x} cy={opt.y} r={5} className="fill-emerald-600 dark:fill-emerald-400" />
      {showComp && <circle cx={px(comp)} cy={py(compR)} r={4.5} strokeWidth={2} className="fill-white stroke-violet-600 dark:fill-zinc-900 dark:stroke-violet-400" />}
      <circle cx={cur.x} cy={cur.y} r={6.5} strokeWidth={2} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" />
      {/* legend band above the plot, so the annotations never overlap whatever the angle */}
      <circle cx={10} cy={12} r={4.5} className="fill-blue-600 dark:fill-blue-400" />
      <text x={18} y={15.5} fontSize={10} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">{`θ ${f(a.angle, 1)}° → ${f(a.range, 1)} m`}</text>
      <circle cx={146} cy={12} r={4.5} className="fill-emerald-600 dark:fill-emerald-400" />
      <text x={154} y={15.5} fontSize={10} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">{`θ* ${f(a.optimalAngle, 1)}° → ${f(a.maxRange, 1)} m`}</text>
      <circle cx={284} cy={12} r={4} strokeWidth={2} className="fill-white stroke-violet-600 dark:fill-zinc-900 dark:stroke-violet-400" />
      <text x={292} y={15.5} fontSize={10} fontWeight={700} className="fill-violet-700 dark:fill-violet-300">{`${f(comp, 1)}° → ${f(compR, 1)} m`}</text>
    </svg>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("current"), value: `R(${f(a.angle, 1)}°) = ${f(a.range)} m` },
        { label: t("optimal"), value: `θ* = ${f(a.optimalAngle, 2)}°` },
        { label: t("max"), value: `R_max = ${f(a.maxRange)} m` },
        { label: t("complementary"), value: `R(${f(comp, 1)}°) = ${f(compR)} m` },
        { label: t("efficiency"), value: pct(a.rangeEfficiency), emphasize: true, note: t("efficiencyNote") },
      ]}
    />
  );
}
