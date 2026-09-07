"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

// Real, documented water density values (g/cm³) at standard atmospheric
// pressure, from standard physics/engineering reference tables. Density
// peaks at 4°C (water's point of maximum density) and decreases toward
// both 0°C and 100°C — the anomalous behavior that makes ice float.
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

const WIDTH = 300;
const HEIGHT = 110;
const MARGIN_X = 20;
const MARGIN_TOP = 10;
const PLOT_HEIGHT = 70;
const MIN_DENSITY = 0.955;
const MAX_DENSITY = 1.0005;

function xForTemp(temp: number): number {
  return MARGIN_X + (temp / 100) * (WIDTH - MARGIN_X * 2);
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

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr" className="flex justify-center">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="h-auto w-full max-w-sm">
          <line x1={MARGIN_X} y1={MARGIN_TOP + PLOT_HEIGHT} x2={WIDTH - MARGIN_X} y2={MARGIN_TOP + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <path d={CURVE_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          <circle cx={xForTemp(temp)} cy={yForDensity(density)} r={5} className="fill-blue-600 dark:fill-blue-400" />
          <text x={MARGIN_X} y={MARGIN_TOP + PLOT_HEIGHT + 20} fontSize={9} className="fill-current opacity-60">
            0°C
          </text>
          <text x={WIDTH - MARGIN_X} y={MARGIN_TOP + PLOT_HEIGHT + 20} fontSize={9} textAnchor="end" className="fill-current opacity-60">
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

      <p className="mt-3 text-center text-sm leading-6">{t("result", { temp: fmt(temp, 0), density: fmt(density) })}</p>
    </EncyclopediaLiveWidget>
  );
}
