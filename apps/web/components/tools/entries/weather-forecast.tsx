import WeatherEducation from "@/components/tools/weather-forecast/WeatherEducation";
import WeatherTracker from "@/components/tools/weather-forecast/WeatherTracker";
import { getForecast } from "@/lib/weather/met-norway";
import { wxDefaultCity } from "@tooloralabs/tools";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  const defaultCity = wxDefaultCity(locale);
  const initial = await getForecast(defaultCity.lat, defaultCity.lon).catch(() => null);
  return (
    <WeatherTracker
      initialCityId={defaultCity.id}
      initialForecast={initial?.forecast ?? null}
      renderedAt={initial?.servedAt ?? 0}
      education={<WeatherEducation />}
    />
  );
}
