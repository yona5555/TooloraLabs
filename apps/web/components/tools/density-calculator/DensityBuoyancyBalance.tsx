"use client";
import { useTranslations } from "next-intl";
import { DENSITY_WATER, STANDARD_GRAVITY } from "@tooloralabs/tools";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";

const W = 320;
const H = 210;
const CX = W / 2;
const PIVOT = 78;
const ARM = 110;
const MAX_TILT = 18;

/**
 * Type #14 (Balance): the body's weight W = m g₀ on one pan against the most buoyancy water can
 * give it, F_max = ρ_w V g₀ (fully under). The beam tips toward the larger force — W wins, it
 * sinks; F_max wins, it floats with W / F_max of its volume under.
 */
export default function DensityBuoyancyBalance() {
  const t = useTranslations("tools.density-calculator.education.lab.balance");
  const { a, f } = useDensityModel();
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const weight = a.weight;
  const fMax = ((DENSITY_WATER * a.volume) / 1000) * STANDARD_GRAVITY;
  const diff = (weight - fMax) / Math.max(weight, fMax, 1e-30);
  const tilt = MAX_TILT * Math.max(-1, Math.min(1, diff));
  const rad = (tilt * Math.PI) / 180;
  const lx = CX - ARM * Math.cos(rad);
  const ly = PIVOT + ARM * Math.sin(rad);
  const rx = CX + ARM * Math.cos(rad);
  const ry = PIVOT - ARM * Math.sin(rad);
  const sinks = !a.water.floats;

  const pan = (x: number, y: number, label: string, value: string, cls: string) => (
    <g>
      <line x1={x} y1={y} x2={x - 30} y2={y + 34} strokeWidth={1.2} className="stroke-zinc-400 dark:stroke-zinc-500" />
      <line x1={x} y1={y} x2={x + 30} y2={y + 34} strokeWidth={1.2} className="stroke-zinc-400 dark:stroke-zinc-500" />
      <path d={`M${x - 36},${y + 34} Q${x},${y + 52} ${x + 36},${y + 34} Z`} className={cls} />
      <text x={x} y={y + 68} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
        {label}
      </text>
      <text x={x} y={y + 83} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
        {value}
      </text>
    </g>
  );

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={CX} y={18} textAnchor="middle" fontSize={12} fontWeight={700} className={sinks ? "fill-red-600 dark:fill-red-400" : "fill-emerald-600 dark:fill-emerald-400"}>
        {sinks ? t("sinks") : t("floats")}
      </text>
      <path d={`M${CX - 22},${H - 8} L${CX},${PIVOT} L${CX + 22},${H - 8} Z`} className="fill-zinc-200 dark:fill-zinc-700" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} strokeWidth={5} strokeLinecap="round" className="stroke-zinc-600 dark:stroke-zinc-300" />
      <circle cx={CX} cy={PIVOT} r={5} className="fill-zinc-700 dark:fill-zinc-200" />
      {pan(lx, ly, t("weight"), `${f(weight, 3)} N`, "fill-red-500/80 dark:fill-red-400/80")}
      {pan(rx, ry, t("buoyancy"), `${f(fMax, 3)} N`, "fill-emerald-500/80 dark:fill-emerald-400/80")}
    </svg>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "W = m g₀", value: `${f(a.massKg)} × ${STANDARD_GRAVITY} = ${f(weight, 3)} N` },
        { label: "F_max = ρ_w V g₀", value: `${f(a.volumeM3)} × 1000 × ${STANDARD_GRAVITY} = ${f(fMax, 3)} N` },
        { label: "W / F_max", value: `${f(weight / fMax, 3)} = ρ / ρ_w`, emphasize: true },
        sinks
          ? { label: t("apparent"), value: `${f(weight, 3)} − ${f(fMax, 3)} = ${f(a.water.apparentWeight, 3)} N`, note: t("apparentNote") }
          : { label: t("underWater"), value: `${f(a.water.submergedFraction * 100, 1)} %`, note: t("underNote") },
      ]}
    />
  );
}
