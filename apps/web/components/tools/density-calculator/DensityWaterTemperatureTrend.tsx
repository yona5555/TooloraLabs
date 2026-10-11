"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { WATER_DENSITY_BY_TEMPERATURE, waterDensityAt } from "@tooloralabs/tools";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";

const W = 330;
const H = 200;
const L = 46;
const R = 12;
const T = 22;
const PH = 128;
const MIN = 0.955;
const MAX = 1.0015;
const Y_TICKS = [0.96, 0.97, 0.98, 0.99, 1.0];

const x = (temp: number) => L + (temp / 100) * (W - L - R);
const y = (d: number) => T + (1 - (d - MIN) / (MAX - MIN)) * PH;
const CURVE = WATER_DENSITY_BY_TEMPERATURE.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.temp).toFixed(1)},${y(p.density).toFixed(1)}`).join(" ");

/**
 * Type #7 (Trend Line with Highlighted Reference Point): real liquid-water density from 0 to 100 °C
 * with its 4 °C maximum marked; the slider moves the highlighted point, and the table re-checks
 * your material against water at that temperature (its specific gravity and float/sink verdict).
 */
export default function DensityWaterTemperatureTrend() {
  const t = useTranslations("tools.density-calculator.education.lab.temperature");
  const { a, f } = useDensityModel();
  const [temp, setTemp] = useState(20);
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const rho = waterDensityAt(temp);
  const sg = a.density / rho;
  const floats = a.density < rho;
  const px = x(temp);
  const py = y(rho);
  const anchor = temp < 15 ? "start" : temp > 85 ? "end" : "middle";

  const indicator = (
    <div className="w-full max-w-[330px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <text x={L - 6} y={12} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
          g/cm³
        </text>
        {Y_TICKS.map((v) => (
          <g key={v}>
            <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {f(v, 2)}
            </text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100].map((c) => (
          <text key={c} x={x(c)} y={T + PH + 16} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {`${c} °C`}
          </text>
        ))}
        <path d={CURVE} fill="none" strokeWidth={2.5} className="stroke-sky-500 dark:stroke-sky-400" />
        {/* the 4 °C maximum */}
        <circle cx={x(4)} cy={y(1)} r={4} className="fill-white stroke-sky-600 dark:fill-zinc-900 dark:stroke-sky-300" strokeWidth={2} />
        <text x={x(4) + 7} y={y(1) + 12} fontSize={9.5} fontWeight={600} className="fill-sky-700 dark:fill-sky-300">
          {t("max")}
        </text>
        {/* the chosen temperature */}
        <line x1={px} y1={T} x2={px} y2={T + PH} strokeDasharray="3 3" className="stroke-blue-400 dark:stroke-blue-500" />
        <circle cx={px} cy={py} r={6} className="fill-blue-600 dark:fill-blue-400" />
        <text x={px} y={Math.max(T + 10, py - 10)} textAnchor={anchor} fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-blue-700 dark:fill-blue-300">
          {`${f(rho, 4)} · ${temp} °C`}
        </text>
      </svg>
      <input
        type="range"
        dir="ltr"
        min={0}
        max={100}
        step={1}
        value={temp}
        aria-label={t("slider")}
        onChange={(e) => setTemp(Number(e.target.value))}
        className="mt-1 h-2 w-full cursor-pointer accent-blue-600"
      />
    </div>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("waterAt", { t: temp }), value: `${f(rho, 4)} g/cm³ = ${f(rho * 1000, 1)} kg/m³` },
        { label: t("belowPeak"), value: `${f((1 - rho) * 100, 3)} %` },
        { label: t("sgAt"), value: `${f(a.density)} / ${f(rho, 4)} = ${f(sg, 4)}`, emphasize: true },
        { label: floats ? t("floats") : t("sinks"), value: floats ? `${f((a.density / rho) * 100, 2)} %` : `ρ ≥ ${f(rho, 4)}`, note: floats ? t("underNote") : undefined },
      ]}
    />
  );
}
