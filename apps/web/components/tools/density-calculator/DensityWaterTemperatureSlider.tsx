"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

// Real, documented liquid water density values (g/cm³) at standard
// atmospheric pressure, from standard physics/engineering reference
// tables. Density peaks at 4°C (water's point of maximum density) and
// decreases toward both 0°C and 100°C — the anomalous behavior that
// makes ice float.
const WATER_DENSITY_TABLE: { temp: number; density: number }[] = [
  { temp: 0, density: 0.9998 },
  { temp: 4, density: 1.0 },
  { temp: 10, density: 0.9997 },
  { temp: 20, density: 0.9982 },
  { temp: 30, density: 0.9957 },
  { temp: 40, density: 0.9922 },
  { temp: 50, density: 0.988 },
  { temp: 60, density: 0.9832 },
  { temp: 70, density: 0.9778 },
  { temp: 80, density: 0.9718 },
  { temp: 90, density: 0.9653 },
  { temp: 100, density: 0.9584 },
];

const PEAK_DENSITY = 1.0;
// Solid ice's density (g/cm³) — always less than liquid water at any
// temperature on this table, which is why ice floats.
const ICE_DENSITY = 0.917;

function densityAtTemp(temp: number): number {
  for (let i = 0; i < WATER_DENSITY_TABLE.length - 1; i++) {
    const a = WATER_DENSITY_TABLE[i];
    const b = WATER_DENSITY_TABLE[i + 1];
    if (temp >= a.temp && temp <= b.temp) {
      const t = (temp - a.temp) / (b.temp - a.temp);
      return a.density + t * (b.density - a.density);
    }
  }
  return WATER_DENSITY_TABLE[WATER_DENSITY_TABLE.length - 1].density;
}

const WIDTH = 320;
const HEIGHT = 150;
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 16;
const MARGIN_TOP = 26;
const PLOT_HEIGHT = 76;
const MIN_DENSITY = 0.955;
const MAX_DENSITY = 1.0005;
const Y_TICKS = [0.96, 0.98, 1.0];

function xForTemp(temp: number): number {
  return MARGIN_LEFT + (temp / 100) * (WIDTH - MARGIN_LEFT - MARGIN_RIGHT);
}

function yForDensity(density: number): number {
  const t = (density - MIN_DENSITY) / (MAX_DENSITY - MIN_DENSITY);
  return MARGIN_TOP + (1 - t) * PLOT_HEIGHT;
}

const CURVE_PATH = WATER_DENSITY_TABLE.map((p, i) => `${i === 0 ? "M" : "L"}${xForTemp(p.temp)},${yForDensity(p.density)}`).join(" ");

export default function DensityWaterTemperatureSlider() {
  const t = useTranslations("tools.density-calculator.education.faq.temperatureSlider");
  const [temp, setTemp] = useState(20);

  const density = densityAtTemp(temp);
  const digitStyle = resolveDigitStyle(String(temp));
  const fmt = (value: number, maximumFractionDigits = 4) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits });

  const percentBelowPeak = ((PEAK_DENSITY - density) / PEAK_DENSITY) * 100;
  const markerX = xForTemp(temp);
  const markerY = yForDensity(density);
  // Keeps the live value label from running past the plot's left/right
  // edges when the marker sits near either end of the slider.
  const labelAnchor: "start" | "middle" | "end" = temp < 10 ? "start" : temp > 90 ? "end" : "middle";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr" className="flex justify-center">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="h-auto w-full max-w-sm">
          <text x={MARGIN_LEFT - 6} y={MARGIN_TOP - 12} fontSize={8} textAnchor="end" className="fill-current opacity-50">
            g/cm³
          </text>
          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN_LEFT}
                y1={yForDensity(tick)}
                x2={WIDTH - MARGIN_RIGHT}
                y2={yForDensity(tick)}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.15}
              />
              <text x={MARGIN_LEFT - 6} y={yForDensity(tick) + 3} fontSize={8} textAnchor="end" className="fill-current opacity-60">
                {tick.toFixed(2)}
              </text>
            </g>
          ))}

          <line x1={MARGIN_LEFT} y1={MARGIN_TOP + PLOT_HEIGHT} x2={WIDTH - MARGIN_RIGHT} y2={MARGIN_TOP + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <path d={CURVE_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />

          <circle cx={markerX} cy={markerY} r={5} className="fill-blue-600 dark:fill-blue-400" />
          <text x={markerX} y={Math.max(10, markerY - 10)} fontSize={10} fontWeight={700} textAnchor={labelAnchor} className="fill-blue-700 dark:fill-blue-400">
            {fmt(density)}
          </text>

          <text x={MARGIN_LEFT} y={MARGIN_TOP + PLOT_HEIGHT + 20} fontSize={9} className="fill-current opacity-60">
            0°C
          </text>
          <text x={WIDTH - MARGIN_RIGHT} y={MARGIN_TOP + PLOT_HEIGHT + 20} fontSize={9} textAnchor="end" className="fill-current opacity-60">
            100°C
          </text>
        </svg>
      </div>

      <div dir="ltr" className="mx-auto mt-2 max-w-sm">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full accent-blue-600 dark:accent-blue-400"
          aria-label={t("sliderLabel")}
        />
      </div>

      <div className="mt-4 space-y-1.5 border-t border-current/10 pt-4 text-center text-sm leading-6">
        <p>{t("result", { temp: fmt(temp, 0), density: fmt(density) })}</p>
        <p className="opacity-80">{percentBelowPeak > 0.001 ? t("percentBelowPeak", { percent: fmt(percentBelowPeak, 3) }) : t("atPeak")}</p>
        <p className="opacity-80">{t("iceComparison", { iceDensity: fmt(ICE_DENSITY) })}</p>
      </div>
    </EncyclopediaLiveWidget>
  );
}
