const FORECAST_API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_BASE = "https://geocoding-api.open-meteo.com/v1/search";

/** Matches the underlying models' real refresh cadence (hourly for the fastest-updating ones) rather than an arbitrary daily window like the financial tools — see SECURITY-NOTES.md for the free-tier usage terms this relies on. */
const FORECAST_REVALIDATE_SECONDS = 3600;
/** A city's coordinates never change, so geocoding results are safe to cache far longer than the weather data itself. */
const GEOCODING_REVALIDATE_SECONDS = 604800;

export type CitySearchResult = {
  id: number;
  name: string;
  country: string;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type PriorityCity = {
  id: string;
  nameKey: string;
  latitude: number;
  longitude: number;
};

/**
 * Fixed above-the-fold quick-pick set, ordered by international audience
 * priority per §14 in the project instructions file — not by population or
 * geography, and deliberately excluding any Arab city from this specific
 * "highest ad value" shortlist (Arab cities remain fully reachable through
 * the search box like any other city worldwide).
 */
export const PRIORITY_CITIES: PriorityCity[] = [
  { id: "new-york", nameKey: "newYork", latitude: 40.7128, longitude: -74.006 },
  { id: "london", nameKey: "london", latitude: 51.5072, longitude: -0.1276 },
  { id: "tokyo", nameKey: "tokyo", latitude: 35.6762, longitude: 139.6503 },
  { id: "sydney", nameKey: "sydney", latitude: -33.8688, longitude: 151.2093 },
  { id: "toronto", nameKey: "toronto", latitude: 43.6532, longitude: -79.3832 },
];

type GeocodingResponse = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
    timezone: string;
  }[];
};

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({ name: query.trim(), count: "8", language: "en", format: "json" });
  const res = await fetch(`${GEOCODING_API_BASE}?${params.toString()}`, {
    next: { revalidate: GEOCODING_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Open-Meteo geocoding request failed: ${res.status}`);
  }
  const json = (await res.json()) as GeocodingResponse;
  return (json.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    admin1: result.admin1 ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }));
}

export type DailyForecast = {
  date: string;
  weatherCode: number;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationProbabilityMax: number;
};

export type WeatherSnapshot = {
  current: {
    temperatureC: number;
    apparentTemperatureC: number;
    relativeHumidity: number;
    windSpeedKmh: number;
    precipitationMm: number;
    weatherCode: number;
    /** ISO-8601 in the location's own local time, as Open-Meteo returns it. */
    time: string;
  };
  daily: DailyForecast[];
  timezone: string;
};

type ForecastResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    weather_code: number;
    precipitation: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

export async function getWeatherSnapshot(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,precipitation",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });
  const res = await fetch(`${FORECAST_API_BASE}?${params.toString()}`, {
    next: { revalidate: FORECAST_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Open-Meteo forecast request failed: ${res.status}`);
  }
  const json = (await res.json()) as ForecastResponse;

  return {
    current: {
      temperatureC: json.current.temperature_2m,
      apparentTemperatureC: json.current.apparent_temperature,
      relativeHumidity: json.current.relative_humidity_2m,
      windSpeedKmh: json.current.wind_speed_10m,
      precipitationMm: json.current.precipitation,
      weatherCode: json.current.weather_code,
      time: json.current.time,
    },
    daily: json.daily.time.map((date, i) => ({
      date,
      weatherCode: json.daily.weather_code[i],
      temperatureMaxC: json.daily.temperature_2m_max[i],
      temperatureMinC: json.daily.temperature_2m_min[i],
      precipitationProbabilityMax: json.daily.precipitation_probability_max[i],
    })),
    timezone: json.timezone,
  };
}
