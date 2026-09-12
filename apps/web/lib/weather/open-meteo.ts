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

/**
 * Fixed set for the live temperature-gauge "Try It" widget in the encyclopedia
 * section — deliberately spans very different climates (desert, temperate,
 * humid subtropical, continental, arid, tropical) so clicking through them
 * visibly moves the gauge needle across its whole range.
 */
export const TEMP_GAUGE_CITIES: PriorityCity[] = [
  { id: "riyadh", nameKey: "riyadh", latitude: 24.7136, longitude: 46.6753 },
  { id: "london-gauge", nameKey: "london", latitude: 51.5072, longitude: -0.1276 },
  { id: "tokyo-gauge", nameKey: "tokyo", latitude: 35.6762, longitude: 139.6503 },
  { id: "moscow", nameKey: "moscow", latitude: 55.7558, longitude: 37.6173 },
  { id: "cairo", nameKey: "cairo", latitude: 30.0444, longitude: 31.2357 },
  { id: "rio-de-janeiro", nameKey: "rioDeJaneiro", latitude: -22.9068, longitude: -43.1729 },
];

export type WorldMapCity = {
  id: string;
  nameKey: string;
  latitude: number;
  longitude: number;
};

/**
 * Capitals/major cities for the interactive world weather map — chosen for
 * geographic spread across every inhabited continent rather than population,
 * so the map reads as a genuine world overview rather than clustering in one
 * region.
 */
export const WORLD_MAP_CITIES: WorldMapCity[] = [
  { id: "riyadh", nameKey: "riyadh", latitude: 24.7136, longitude: 46.6753 },
  { id: "cairo", nameKey: "cairo", latitude: 30.0444, longitude: 31.2357 },
  { id: "london", nameKey: "london", latitude: 51.5072, longitude: -0.1276 },
  { id: "paris", nameKey: "paris", latitude: 48.8566, longitude: 2.3522 },
  { id: "berlin", nameKey: "berlin", latitude: 52.52, longitude: 13.405 },
  { id: "madrid", nameKey: "madrid", latitude: 40.4168, longitude: -3.7038 },
  { id: "rome", nameKey: "rome", latitude: 41.9028, longitude: 12.4964 },
  { id: "moscow", nameKey: "moscow", latitude: 55.7558, longitude: 37.6173 },
  { id: "istanbul", nameKey: "istanbul", latitude: 41.0082, longitude: 28.9784 },
  { id: "dubai", nameKey: "dubai", latitude: 25.2048, longitude: 55.2708 },
  { id: "new-delhi", nameKey: "newDelhi", latitude: 28.6139, longitude: 77.209 },
  { id: "beijing", nameKey: "beijing", latitude: 39.9042, longitude: 116.4074 },
  { id: "tokyo", nameKey: "tokyo", latitude: 35.6762, longitude: 139.6503 },
  { id: "seoul", nameKey: "seoul", latitude: 37.5665, longitude: 126.978 },
  { id: "bangkok", nameKey: "bangkok", latitude: 13.7563, longitude: 100.5018 },
  { id: "jakarta", nameKey: "jakarta", latitude: -6.2088, longitude: 106.8456 },
  { id: "sydney", nameKey: "sydney", latitude: -33.8688, longitude: 151.2093 },
  { id: "nairobi", nameKey: "nairobi", latitude: -1.2921, longitude: 36.8219 },
  { id: "lagos", nameKey: "lagos", latitude: 6.5244, longitude: 3.3792 },
  { id: "cape-town", nameKey: "capeTown", latitude: -33.9249, longitude: 18.4241 },
  { id: "new-york", nameKey: "newYork", latitude: 40.7128, longitude: -74.006 },
  { id: "mexico-city", nameKey: "mexicoCity", latitude: 19.4326, longitude: -99.1332 },
  { id: "rio-de-janeiro", nameKey: "rioDeJaneiro", latitude: -22.9068, longitude: -43.1729 },
  { id: "buenos-aires", nameKey: "buenosAires", latitude: -34.6037, longitude: -58.3816 },
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
  uvIndexMax: number;
  /** ISO-8601 in the location's own local time. */
  sunrise: string;
  sunset: string;
};

export type WeatherSnapshot = {
  current: {
    temperatureC: number;
    apparentTemperatureC: number;
    relativeHumidity: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    precipitationMm: number;
    weatherCode: number;
    visibilityM: number;
    pressureHpa: number;
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
    wind_direction_10m: number;
    weather_code: number;
    precipitation: number;
    visibility: number;
    surface_pressure: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export async function getWeatherSnapshot(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,precipitation,visibility,surface_pressure",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
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
      windDirectionDeg: json.current.wind_direction_10m,
      precipitationMm: json.current.precipitation,
      weatherCode: json.current.weather_code,
      visibilityM: json.current.visibility,
      pressureHpa: json.current.surface_pressure,
      time: json.current.time,
    },
    daily: json.daily.time.map((date, i) => ({
      date,
      weatherCode: json.daily.weather_code[i],
      temperatureMaxC: json.daily.temperature_2m_max[i],
      temperatureMinC: json.daily.temperature_2m_min[i],
      precipitationProbabilityMax: json.daily.precipitation_probability_max[i],
      uvIndexMax: json.daily.uv_index_max[i],
      sunrise: json.daily.sunrise[i],
      sunset: json.daily.sunset[i],
    })),
    timezone: json.timezone,
  };
}

export type WorldMapWeather = {
  id: string;
  nameKey: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  weatherCode: number;
};

type BatchForecastResponse = {
  current: { temperature_2m: number; weather_code: number };
}[];

/**
 * One batched Open-Meteo request for every world-map city (comma-separated
 * lat/lon lists return one result object per pair, in the same order) rather
 * than N separate requests — keeps the interactive map to a single network
 * round trip and a single cache entry.
 */
export async function getWorldMapSnapshot(cities: WorldMapCity[]): Promise<WorldMapWeather[]> {
  const params = new URLSearchParams({
    latitude: cities.map((c) => c.latitude).join(","),
    longitude: cities.map((c) => c.longitude).join(","),
    current: "temperature_2m,weather_code",
    timezone: "auto",
  });
  const res = await fetch(`${FORECAST_API_BASE}?${params.toString()}`, {
    next: { revalidate: FORECAST_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Open-Meteo world-map request failed: ${res.status}`);
  }
  const json = (await res.json()) as BatchForecastResponse;

  return cities.map((city, i) => ({
    id: city.id,
    nameKey: city.nameKey,
    latitude: city.latitude,
    longitude: city.longitude,
    temperatureC: json[i].current.temperature_2m,
    weatherCode: json[i].current.weather_code,
  }));
}
