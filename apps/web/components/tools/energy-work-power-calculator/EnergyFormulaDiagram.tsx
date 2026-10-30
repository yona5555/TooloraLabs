"use client";
import { useTranslations } from "next-intl";
import { ENERGY_GRAVITY } from "@tooloralabs/tools";
import EnergyIndicatorCard from "./EnergyIndicatorCard";
import { useEnergyModel } from "./EnergyLiveContext";
import type { EnergyWorkPowerMode } from "./types";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 380;
const ROW = 52;
const TOP = 8;
const H = TOP + ROW * 4 + 4;

/**
 * Type #18 (Formula Diagram): the calculator's four formulas, each with the live inputs substituted
 * and its result, the active one outlined. They share inputs — m feeds both KE and PE — so the
 * whole set moves together as you type.
 */
export default function EnergyFormulaDiagram() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.formula");
  const tForm = useTranslations("tools.energy-work-power-calculator.form");
  const { draft, work, kinetic, potential, power, outputs, f } = useEnergyModel();

  const rows: { mode: EnergyWorkPowerMode; sym: string; formula: string; sub: string; value: string; cls: string; stroke: string }[] = [
    {
      mode: "work",
      sym: "W",
      formula: "W = F · d · cos θ",
      sub: `${f(work.force)} × ${f(work.distance)} × cos ${f(work.angleDegrees)}°`,
      value: `${f(outputs.work.work)} J`,
      cls: "fill-red-600 dark:fill-red-400",
      stroke: "stroke-red-500 dark:stroke-red-400",
    },
    {
      mode: "kineticEnergy",
      sym: "KE",
      formula: "KE = ½ · m · v²",
      sub: `½ × ${f(kinetic.mass)} × ${f(kinetic.velocity)}²`,
      value: `${f(outputs.kineticEnergy.kineticEnergy)} J`,
      cls: "fill-emerald-600 dark:fill-emerald-400",
      stroke: "stroke-emerald-500 dark:stroke-emerald-400",
    },
    {
      mode: "potentialEnergy",
      sym: "PE",
      formula: "PE = m · g · h",
      sub: `${f(potential.mass)} × ${ENERGY_GRAVITY} × ${f(potential.height)}`,
      value: `${f(outputs.potentialEnergy.potentialEnergy)} J`,
      cls: "fill-blue-700 dark:fill-blue-300",
      stroke: "stroke-blue-500 dark:stroke-blue-400",
    },
    {
      mode: "power",
      sym: "P",
      formula: "P = W / t",
      sub: power ? `${f(power.work)} / ${f(power.time)}` : "t ≤ 0",
      value: power ? `${f(power.power)} W` : "—",
      cls: "fill-amber-600 dark:fill-amber-400",
      stroke: "stroke-amber-500 dark:stroke-amber-400",
    },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = TOP + i * ROW;
        const on = r.mode === draft.mode;
        return (
          <g key={r.mode}>
            <rect x={2} y={y} width={W - 4} height={ROW - 8} rx={10} strokeWidth={on ? 3 : 1.2} className={`fill-white dark:fill-zinc-900 ${r.stroke}`} />
            <rect x={2} y={y} width={46} height={ROW - 8} rx={10} className={r.cls} opacity={0.15} />
            <text style={{ fontSize: svgPx(15) }} x={25} y={y + 28} textAnchor="middle" fontWeight={800} className={r.cls}>
              {r.sym}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={58} y={y + 18} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {r.formula}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={58} y={y + 35} fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {r.sub}
            </text>
            <text style={{ fontSize: svgPx(12.5) }} x={W - 12} y={y + 18} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className={r.cls}>
              {`= ${r.value}`}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("active"), value: tForm(`mode.${draft.mode}`) },
        { label: "1 J", value: "1 N · 1 m = 1 kg·m²/s²" },
        { label: "1 W", value: "1 J / 1 s" },
        { label: "g", value: `${ENERGY_GRAVITY} m/s²`, note: t("gNote") },
        { label: t("shared"), value: `m = ${f(kinetic.mass)} kg`, emphasize: true, note: t("sharedNote") },
      ]}
    />
  );
}
