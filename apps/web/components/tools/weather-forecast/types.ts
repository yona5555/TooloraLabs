import type { TemperatureUnit, WindSpeedUnit, WeatherCategory } from "@tooloralabs/tools";
import type { CitySearchResult, DailyForecast, WeatherSnapshot } from "@/lib/weather/open-meteo";

export type SelectedCity = {
  label: string;
  latitude: number;
  longitude: number;
};

export type { TemperatureUnit, WindSpeedUnit, WeatherCategory, CitySearchResult, DailyForecast, WeatherSnapshot };
