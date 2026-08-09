export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindSpeedUnit = "kmh" | "mph";

export function celsiusToFahrenheit(celsius: number): number {
  if (!Number.isFinite(celsius)) return 0;
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  if (!Number.isFinite(fahrenheit)) return 0;
  return ((fahrenheit - 32) * 5) / 9;
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (!Number.isFinite(value)) return 0;
  if (from === to) return value;
  return from === "celsius" ? celsiusToFahrenheit(value) : fahrenheitToCelsius(value);
}

export function kmhToMph(kmh: number): number {
  if (!Number.isFinite(kmh)) return 0;
  return kmh / 1.609344;
}

export function mphToKmh(mph: number): number {
  if (!Number.isFinite(mph)) return 0;
  return mph * 1.609344;
}

export function convertWindSpeed(value: number, from: WindSpeedUnit, to: WindSpeedUnit): number {
  if (!Number.isFinite(value)) return 0;
  if (from === to) return value;
  return from === "kmh" ? kmhToMph(value) : mphToKmh(value);
}

/**
 * The WMO weather interpretation codes (table 4677) that Open-Meteo's API
 * returns as `weather_code` — grouped into the categories this tool actually
 * distinguishes in its UI and translations, so the data layer only ever
 * hands the UI a known key instead of a bare numeric code to interpret twice.
 */
export type WeatherCategory =
  | "clearSky"
  | "mainlyClear"
  | "partlyCloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "freezingDrizzle"
  | "rain"
  | "freezingRain"
  | "snow"
  | "snowGrains"
  | "rainShowers"
  | "snowShowers"
  | "thunderstorm"
  | "thunderstormHail"
  | "unknown";

const WMO_CODE_CATEGORIES: Record<number, WeatherCategory> = {
  0: "clearSky",
  1: "mainlyClear",
  2: "partlyCloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  56: "freezingDrizzle",
  57: "freezingDrizzle",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "freezingRain",
  67: "freezingRain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snowGrains",
  80: "rainShowers",
  81: "rainShowers",
  82: "rainShowers",
  85: "snowShowers",
  86: "snowShowers",
  95: "thunderstorm",
  96: "thunderstormHail",
  99: "thunderstormHail",
};

export function getWeatherCategory(wmoCode: number): WeatherCategory {
  return WMO_CODE_CATEGORIES[wmoCode] ?? "unknown";
}
