"use client";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const W = 320;
const H = 190;
const CX = W / 2;
const PIVOT_Y = 92;
const ARM = 118;

/** §31 #14 Balance Indicator: |A+B| (direct) against |A|+|B| (the path) — level only when A ∥ B. */
export default function VectorTriangleBalance() {
  const t = useTranslations("tools.vector-calculator.indicators.balance");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, f, n } = useVectorAnalysis();
  const path = r.magA + r.magB;
  const direct = r.magSum;
  const slack = path - direct;
  const ratio = path > 0 ? slack / path : 0;
  // Heavier side (the path, right pan) drops; up to 18° at full slack.
  const tilt = (ratio * 18 * Math.PI) / 180;
  const lx = CX - ARM * Math.cos(tilt);
  const ly = PIVOT_Y - ARM * Math.sin(tilt);
  const rx = CX + ARM * Math.cos(tilt);
  const ry = PIVOT_Y + ARM * Math.sin(tilt);
  const balanced = ratio < 1e-6;

  const pan = (x: number, y: number, label: string, value: string, cls: string) => (
    <g>
      <line x1={x} y1={y} x2={x - 26} y2={y + 34} className="stroke-zinc-400 dark:stroke-zinc-500" />
      <line x1={x} y1={y} x2={x + 26} y2={y + 34} className="stroke-zinc-400 dark:stroke-zinc-500" />
      <rect x={x - 38} y={y + 34} width={76} height={36} rx={8} className={cls} />
      <text x={x} y={y + 49} textAnchor="middle" className="fill-white text-[10px] font-semibold">{label}</text>
      <text x={x} y={y + 64} textAnchor="middle" className="fill-white text-[12px] font-bold">{value}</text>
    </g>
  );

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div dir="ltr" className="max-w-full">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="block h-auto max-w-full">
            <path d={`M ${CX} ${PIVOT_Y} L ${CX - 22} ${H - 10} L ${CX + 22} ${H - 10} Z`} className="fill-zinc-300 dark:fill-zinc-600" />
            <line x1={lx} y1={ly} x2={rx} y2={ry} strokeWidth={5} strokeLinecap="round" className="stroke-zinc-700 dark:stroke-zinc-200" />
            <circle cx={CX} cy={PIVOT_Y} r={6} className="fill-zinc-700 dark:fill-zinc-200" />
            {pan(lx, ly, t("direct"), n(direct, 2), "fill-violet-500 dark:fill-violet-500")}
            {pan(rx, ry, t("path"), n(path, 2), "fill-blue-600 dark:fill-blue-500")}
            <text x={CX} y={16} textAnchor="middle" className={`text-[12px] font-bold ${balanced ? "fill-emerald-600 dark:fill-emerald-400" : "fill-zinc-700 dark:fill-zinc-200"}`}>
              {balanced ? t("balanced") : `${n(direct, 2)} < ${n(path, 2)}`}
            </text>
          </svg>
        </div>
      }
      rows={[
        { label: tr("magA"), value: f(r.magA) },
        { label: tr("magB"), value: f(r.magB) },
        { label: t("path"), value: f(path) },
        { label: t("direct"), value: f(direct) },
        { label: t("slack"), value: f(slack), emphasize: true },
        { label: tr("magDiff"), value: f(r.magDiff) },
      ]}
    />
  );
}
