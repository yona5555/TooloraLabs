"use client";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertTemperature, getWeatherCategory } from "@tooloralabs/tools";
import { Droplet } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import WeatherIcon from "./WeatherIcon";
import WeatherDataSourceNote from "./WeatherDataSourceNote";
import type { DailyForecast } from "./types";

type SevenDayForecastPanelProps = {
  daily: DailyForecast[];
  unitSystem: "metric" | "us";
  digitStyle: DigitStyle;
};

export default function SevenDayForecastPanel({ daily, unitSystem, digitStyle }: SevenDayForecastPanelProps) {
  const t = useTranslations("tools.weather-forecast.forecast");
  const tCategory = useTranslations("tools.weather-forecast.category");
  const locale = useLocale();

  const temperature = (celsius: number) => {
    const value = unitSystem === "us" ? convertTemperature(celsius, "celsius", "fahrenheit") : celsius;
    return `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 })}°`;
  };

  const dayLabel = (dateIso: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      numberingSystem: digitStyle === "eastern" ? "arab" : "latn",
    }).format(new Date(`${dateIso}T00:00:00`));

  return (
    <SectionCard id="forecast" title={t("title")} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <div className="flex min-w-max divide-x divide-zinc-100 rtl:divide-x-reverse dark:divide-zinc-800">
          {daily.map((day) => {
            const category = getWeatherCategory(day.weatherCode);
            return (
              <div key={day.date} className="flex w-32 flex-col items-center gap-2 px-3 py-4 text-center">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{dayLabel(day.date)}</p>
                <WeatherIcon category={category} size={28} className="text-blue-600 dark:text-blue-400" />
                <p className="text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">{tCategory(category)}</p>
                <p dir="ltr" className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {temperature(day.temperatureMaxC)} / {temperature(day.temperatureMinC)}
                </p>
                <p dir="ltr" className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Droplet size={11} aria-hidden="true" />
                  {formatLocalizedNumber(day.precipitationProbabilityMax, digitStyle, { maximumFractionDigits: 0 })}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-4 pt-3 lg:px-6">
        <WeatherDataSourceNote />
      </div>
    </SectionCard>
  );
}
