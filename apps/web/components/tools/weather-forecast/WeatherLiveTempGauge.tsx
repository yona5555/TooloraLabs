"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { getWeatherCategory } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import { TEMP_GAUGE_CITIES } from "@/lib/weather/open-meteo";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import WeatherIcon from "./WeatherIcon";

const MIN_C = -20;
const MAX_C = 50;
const TICKS = [-20, 0, 20, 40, 50];

type ZoneKey = "freezing" | "cold" | "mild" | "warm" | "hot";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string; fillClass: string }[] = [
  { key: "freezing", from: MIN_C, to: 0, colorClass: "stroke-blue-600 dark:stroke-blue-400", fillClass: "fill-blue-600 dark:fill-blue-400" },
  { key: "cold", from: 0, to: 15, colorClass: "stroke-sky-500 dark:stroke-sky-400", fillClass: "fill-sky-500 dark:fill-sky-400" },
  { key: "mild", from: 15, to: 25, colorClass: "stroke-green-500 dark:stroke-green-400", fillClass: "fill-green-500 dark:fill-green-400" },
  { key: "warm", from: 25, to: 35, colorClass: "stroke-amber-500 dark:stroke-amber-400", fillClass: "fill-amber-500 dark:fill-amber-400" },
  { key: "hot", from: 35, to: MAX_C, colorClass: "stroke-red-600 dark:stroke-red-400", fillClass: "fill-red-600 dark:fill-red-400" },
];

function classify(temperatureC: number): ZoneKey {
  const zone = ZONES.find((z) => temperatureC >= z.from && temperatureC < z.to);
  return zone ? zone.key : temperatureC < MIN_C ? "freezing" : "hot";
}

type FetchState = "loading" | "idle" | "error";

export default function WeatherLiveTempGauge() {
  const t = useTranslations("tools.weather-forecast.education.intro.tempGauge");
  const tCities = useTranslations("tools.weather-forecast.aboveFold.priorityCity");
  const tCategory = useTranslations("tools.weather-forecast.category");
  const [selectedId, setSelectedId] = useState(TEMP_GAUGE_CITIES[0].id);
  const [status, setStatus] = useState<FetchState>("loading");
  const [data, setData] = useState<{ temperatureC: number; weatherCode: number } | null>(null);

  const selected = TEMP_GAUGE_CITIES.find((c) => c.id === selectedId) ?? TEMP_GAUGE_CITIES[0];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/weather/forecast?lat=${selected.latitude}&lon=${selected.longitude}`);
        if (!res.ok) throw new Error("fetch_failed");
        const json = (await res.json()) as { current: { temperatureC: number; weatherCode: number } };
        if (!cancelled) {
          setData({ temperatureC: json.current.temperatureC, weatherCode: json.current.weatherCode });
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selected.latitude, selected.longitude]);

  const digitStyle = resolveDigitStyle();
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  const zoneKey = data ? classify(data.temperatureC) : "mild";
  const zone = ZONES.find((z) => z.key === zoneKey) ?? ZONES[2];
  const classification = t(`zones.${zoneKey}`);
  const cityLabel = tCities(selected.nameKey);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      {status === "error" && <p className="py-6 text-center text-sm text-current/60">{t("error")}</p>}

      {status !== "error" && (
        <RatioGauge
          value={data?.temperatureC ?? 20}
          domainMin={MIN_C}
          domainMax={MAX_C}
          zones={ZONES.map((z) => ({ key: z.key, from: z.from, to: z.to, colorClass: z.colorClass }))}
          valueLabel={status === "loading" || !data ? "—" : `${fmt(data.temperatureC)}°C`}
          caption={status === "loading" || !data ? undefined : classification}
          captionColorClass={zone.fillClass}
          ticks={TICKS}
          tickFormatter={(tick) => `${tick}°`}
        />
      )}

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {TEMP_GAUGE_CITIES.map((city) => (
          <button
            key={city.id}
            type="button"
            role="tab"
            aria-selected={selectedId === city.id}
            onClick={() => setSelectedId(city.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedId === city.id
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tCities(city.nameKey)}
          </button>
        ))}
      </div>

      {status === "idle" && data && (
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm leading-6">
          <WeatherIcon category={getWeatherCategory(data.weatherCode)} size={18} className={zone.fillClass} />
          {t("verdict", { city: cityLabel, temperature: `${fmt(data.temperatureC)}°C`, condition: tCategory(getWeatherCategory(data.weatherCode)) })}
        </p>
      )}
    </EncyclopediaLiveWidget>
  );
}
