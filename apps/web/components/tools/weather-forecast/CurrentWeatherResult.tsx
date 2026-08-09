"use client";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertTemperature, convertWindSpeed, getWeatherCategory } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WeatherIcon from "./WeatherIcon";
import WeatherDataSourceNote from "./WeatherDataSourceNote";
import type { WeatherSnapshot } from "./types";

type UnitSystem = "metric" | "us";

type CurrentWeatherResultProps = {
  cityLabel: string;
  snapshot: WeatherSnapshot | null;
  status: "loading" | "idle" | "error";
  unitSystem: UnitSystem;
  onUnitSystemChange: (unit: UnitSystem) => void;
  digitStyle: DigitStyle;
};

export default function CurrentWeatherResult({
  cityLabel,
  snapshot,
  status,
  unitSystem,
  onUnitSystemChange,
  digitStyle,
}: CurrentWeatherResultProps) {
  const t = useTranslations("tools.weather-forecast.aboveFold");
  const tCategory = useTranslations("tools.weather-forecast.category");
  const locale = useLocale();

  const temperature = (celsius: number) => {
    const value = unitSystem === "us" ? convertTemperature(celsius, "celsius", "fahrenheit") : celsius;
    return `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 })}°${unitSystem === "us" ? "F" : "C"}`;
  };

  const windSpeed = (kmh: number) => {
    const value = unitSystem === "us" ? convertWindSpeed(kmh, "kmh", "mph") : kmh;
    return `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 })} ${unitSystem === "us" ? t("mph") : t("kmh")}`;
  };

  const updatedLabel = snapshot
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        numberingSystem: digitStyle === "eastern" ? "arab" : "latn",
      }).format(new Date(snapshot.current.time))
    : "";

  return (
    <SectionCard
      title={cityLabel}
      action={
        <div className="inline-flex rounded-lg border border-white/30 p-0.5">
          {(["metric", "us"] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => onUnitSystemChange(unit)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                unitSystem === unit ? "bg-white text-blue-700" : "text-white/80 hover:text-white"
              }`}
            >
              {unit === "metric" ? "°C" : "°F"}
            </button>
          ))}
        </div>
      }
    >
      {status === "loading" && <p className="py-10 text-center text-sm text-zinc-400">{t("loading")}</p>}
      {status === "error" && <p className="py-10 text-center text-sm text-red-500">{t("error")}</p>}

      {status === "idle" && snapshot && (
        <>
          <div className="flex items-center justify-center gap-4">
            <WeatherIcon category={getWeatherCategory(snapshot.current.weatherCode)} size={56} className="shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-center">
              <p dir="ltr" className="font-mono text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {temperature(snapshot.current.temperatureC)}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {tCategory(getWeatherCategory(snapshot.current.weatherCode))}
              </p>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("lastUpdated", { time: updatedLabel })}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("feelsLikeLabel")}</dt>
              <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {temperature(snapshot.current.apparentTemperatureC)}
              </dd>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("humidityLabel")}</dt>
              <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {formatLocalizedNumber(snapshot.current.relativeHumidity, digitStyle, { maximumFractionDigits: 0 })}%
              </dd>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("windLabel")}</dt>
              <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {windSpeed(snapshot.current.windSpeedKmh)}
              </dd>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("precipChanceLabel")}</dt>
              <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {formatLocalizedNumber(snapshot.daily[0]?.precipitationProbabilityMax ?? 0, digitStyle, { maximumFractionDigits: 0 })}%
              </dd>
            </div>
          </dl>

          <WeatherDataSourceNote className="mt-4" />
        </>
      )}
    </SectionCard>
  );
}
