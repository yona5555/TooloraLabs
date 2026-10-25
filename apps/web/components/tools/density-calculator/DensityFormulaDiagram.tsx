"use client";
import { useTranslations } from "next-intl";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 200;
const BOX_W = 92;
const BOX_H = 58;
const TOP = 30;

/**
 * Type #18 (Formula Diagram): ρ = m ÷ V as three boxes with the live values and units, the solved
 * box outlined, the SI identity 1 g/cm³ = 1000 kg/m³ and the two rearrangements underneath.
 */
export default function DensityFormulaDiagram() {
  const t = useTranslations("tools.density-calculator.education.lab.formula");
  const { draft, a, f } = useDensityModel();
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const solved = draft.operation;
  const boxes = [
    { key: "solveDensity", sym: "ρ", value: f(a.density), unit: "g/cm³", x: 10, cls: "stroke-amber-500 dark:stroke-amber-400", txt: "fill-amber-600 dark:fill-amber-400" },
    { key: "solveMass", sym: "m", value: f(a.mass), unit: "g", x: 124, cls: "stroke-blue-500 dark:stroke-blue-400", txt: "fill-blue-700 dark:fill-blue-300" },
    { key: "solveVolume", sym: "V", value: f(a.volume), unit: "cm³", x: 238, cls: "stroke-emerald-500 dark:stroke-emerald-400", txt: "fill-emerald-700 dark:fill-emerald-300" },
  ];
  const rearr = [
    { key: "solveDensity", text: `ρ = m / V = ${f(a.mass)} / ${f(a.volume)}` },
    { key: "solveMass", text: `m = ρ × V = ${f(a.density)} × ${f(a.volume)}` },
    { key: "solveVolume", text: `V = m / ρ = ${f(a.mass)} / ${f(a.density)}` },
  ].filter((r) => r.key !== solved);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {boxes.map((b) => {
        const on = b.key === solved;
        return (
          <g key={b.key}>
            <rect x={b.x} y={TOP} width={BOX_W} height={BOX_H} rx={10} strokeWidth={on ? 3.5 : 1.5} className={`fill-white dark:fill-zinc-900 ${b.cls}`} />
            <text style={{ fontSize: svgPx(16) }} x={b.x + BOX_W / 2} y={TOP + 22} textAnchor="middle" fontWeight={700} className={b.txt}>
              {b.sym}
            </text>
            <text style={{ fontSize: svgPx(12.5) }} x={b.x + BOX_W / 2} y={TOP + 43} textAnchor="middle" fontWeight={600} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {b.value}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={b.x + BOX_W / 2} y={TOP + BOX_H + 14} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
              {b.unit}
            </text>
            {on && (
              <text style={{ fontSize: svgPx(12) }} x={b.x + BOX_W / 2} y={TOP - 8} textAnchor="middle" fontWeight={700} className={b.txt}>
                {t("solved")}
              </text>
            )}
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(20) }} x={113} y={TOP + 35} textAnchor="middle" fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        =
      </text>
      <text style={{ fontSize: svgPx(20) }} x={227} y={TOP + 35} textAnchor="middle" fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        ÷
      </text>
      <line x1={10} y1={124} x2={W - 10} y2={124} className="stroke-zinc-200 dark:stroke-zinc-700" />
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={143} textAnchor="middle" fontWeight={600} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
        {`${f(a.density)} g/cm³ = ${f(a.densitySI)} kg/m³`}
      </text>
      {rearr.map((r, i) => (
        <text style={{ fontSize: svgPx(12) }} key={r.key} x={W / 2} y={165 + i * 18} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {r.text}
        </text>
      ))}
    </svg>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "m", value: `${f(a.mass)} g = ${f(a.massKg)} kg` },
        { label: "V", value: `${f(a.volume)} cm³ = ${f(a.volumeM3)} m³` },
        { label: "m / V", value: `${f(a.massKg)} kg / ${f(a.volumeM3)} m³` },
        { label: "ρ", value: `${f(a.densitySI)} kg/m³ = ${f(a.density)} g/cm³`, emphasize: true },
        { label: t("check"), value: `${f(a.density)} × ${f(a.volume)} = ${f(a.mass)} g` },
      ]}
    />
  );
}
