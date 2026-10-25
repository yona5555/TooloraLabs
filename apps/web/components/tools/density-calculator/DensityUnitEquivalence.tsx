"use client";
import { useTranslations } from "next-intl";
import { LB_FT3_PER_G_CM3 } from "@tooloralabs/tools";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 214;
const BOX_W = 140;
const BOX_H = 52;
const COLS = [20, 180];
const ROWS = [20, 84, 148];

/**
 * Type #11 (Side-by-Side Equivalence): one live density written six equal ways — g/cm³, the SI
 * kg/m³, g/mL, kg/L, lb/ft³ and the unitless specific gravity — each box with its factor.
 */
export default function DensityUnitEquivalence() {
  const t = useTranslations("tools.density-calculator.education.lab.units");
  const { a, f } = useDensityModel();
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const cells = [
    { value: f(a.density), unit: "g/cm³", factor: "× 1", cls: "stroke-amber-500 dark:stroke-amber-400" },
    { value: f(a.densitySI), unit: "kg/m³ (SI)", factor: "× 1000", cls: "stroke-blue-600 dark:stroke-blue-400", strong: true },
    { value: f(a.density), unit: "g/mL", factor: "1 mL = 1 cm³", cls: "stroke-zinc-400 dark:stroke-zinc-500" },
    { value: f(a.kgPerL), unit: "kg/L", factor: "× 1000 / 1000", cls: "stroke-zinc-400 dark:stroke-zinc-500" },
    { value: f(a.lbPerFt3), unit: "lb/ft³", factor: `× ${LB_FT3_PER_G_CM3.toFixed(2)}`, cls: "stroke-zinc-400 dark:stroke-zinc-500" },
    { value: f(a.specificGravity), unit: "SG", factor: "÷ 1 g/cm³", cls: "stroke-emerald-500 dark:stroke-emerald-400" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {cells.map((c, i) => {
        const x = COLS[i % 2];
        const y = ROWS[Math.floor(i / 2)];
        return (
          <g key={c.unit}>
            <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={10} strokeWidth={c.strong ? 3 : 1.5} className={`fill-white dark:fill-zinc-900 ${c.cls}`} />
            <text style={{ fontSize: svgPx(14) }} x={x + BOX_W / 2} y={y + 22} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {c.value}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x + BOX_W / 2} y={y + 38} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {c.unit}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x + BOX_W / 2} y={y + BOX_H + 10} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {c.factor}
            </text>
            {i % 2 === 0 && (
              <text style={{ fontSize: svgPx(18) }} x={W / 2} y={y + 32} textAnchor="middle" fontWeight={700} className="fill-zinc-400 dark:fill-zinc-500">
                =
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "g/cm³ → kg/m³", value: `${f(a.density)} × 1000 = ${f(a.densitySI)}`, emphasize: true },
        { label: "kg/m³ → kg/L", value: `${f(a.densitySI)} / 1000 = ${f(a.kgPerL)}` },
        { label: "g/cm³ → lb/ft³", value: `${f(a.density)} × ${LB_FT3_PER_G_CM3.toFixed(3)} = ${f(a.lbPerFt3)}` },
        { label: t("litre"), value: `${f(a.kgPerL)} kg`, note: t("litreNote") },
      ]}
    />
  );
}
