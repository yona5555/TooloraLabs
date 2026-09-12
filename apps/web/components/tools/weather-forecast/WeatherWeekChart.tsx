"use client";
import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertTemperature } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { DailyForecast } from "./types";

type WeatherWeekChartProps = {
  daily: DailyForecast[];
  unitSystem: "metric" | "us";
  digitStyle: DigitStyle;
};

const WIDTH = 560;
const HEIGHT = 200;
const PAD_LEFT = 34;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export default function WeatherWeekChart({ daily, unitSystem, digitStyle }: WeatherWeekChartProps) {
  const t = useTranslations("tools.weather-forecast.weekChart");
  const locale = useLocale();
  const gradientId = useId();

  const toUnit = (celsius: number) => (unitSystem === "us" ? convertTemperature(celsius, "celsius", "fahrenheit") : celsius);
  const highs = daily.map((d) => toUnit(d.temperatureMaxC));
  const lows = daily.map((d) => toUnit(d.temperatureMinC));
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const span = max - min || 1;

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = daily.length > 1 ? plotW / (daily.length - 1) : 0;
  const yFor = (value: number) => PAD_TOP + plotH - ((value - min) / span) * plotH;
  const xFor = (i: number) => PAD_LEFT + i * stepX;

  const highPoints = highs.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");
  const lowPoints = lows.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");
  const areaPoints = `${highPoints} ${lowPoints.split(" ").reverse().join(" ")}`;

  const dayLabel = (dateIso: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
      weekday: "short",
      numberingSystem: digitStyle === "eastern" ? "arab" : "latn",
    }).format(new Date(`${dateIso}T00:00:00`));

  const fmt = (value: number) => formatLocalizedNumber(Math.round(value), digitStyle);

  return (
    <SectionCard title={t("title")}>
      <div dir="ltr" className="w-full">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="w-full">
          <defs>
            <linearGradient id={`${gradientId}-high`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={PAD_TOP + plotH * f}
              y2={PAD_TOP + plotH * f}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth={1}
            />
          ))}

          <polygon points={areaPoints} fill={`url(#${gradientId}-high)`} />
          <polyline points={highPoints} fill="none" strokeWidth={2.5} className="stroke-orange-500 dark:stroke-orange-400" />
          <polyline points={lowPoints} fill="none" strokeWidth={2.5} strokeDasharray="4 3" className="stroke-blue-500 dark:stroke-blue-400" />

          {daily.map((day, i) => (
            <g key={day.date}>
              <circle cx={xFor(i)} cy={yFor(highs[i])} r={3.5} className="fill-orange-500 dark:fill-orange-400" />
              <circle cx={xFor(i)} cy={yFor(lows[i])} r={3.5} className="fill-blue-500 dark:fill-blue-400" />
              <text x={xFor(i)} y={yFor(highs[i]) - 8} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
                {fmt(highs[i])}°
              </text>
              <text x={xFor(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
                {dayLabel(day.date)}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-1 flex items-center justify-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 dark:bg-orange-400" />
            {t("highLabel")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            {t("lowLabel")}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
