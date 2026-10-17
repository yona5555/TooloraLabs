export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindSpeedUnit = "kmh" | "mph";
/** Display unit system for the weather tool: metric (°C, km/h, hPa, mm) or US (°F, mph, inHg, in). */
export type WeatherUnitSystem = "metric" | "us";

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

/** MET Norway reports wind in m/s; 1 m/s = 3.6 km/h exactly. */
export function msToKmh(ms: number): number {
  if (!Number.isFinite(ms)) return 0;
  return ms * 3.6;
}

/** 1 inHg = 33.8638866667 hPa (conventional value at 0 °C). */
export function hpaToInHg(hpa: number): number {
  if (!Number.isFinite(hpa)) return 0;
  return hpa / 33.8638866667;
}

export function mmToInches(mm: number): number {
  if (!Number.isFinite(mm)) return 0;
  return mm / 25.4;
}

/** One display value in the chosen unit system. */
export function weatherTemp(celsius: number, units: WeatherUnitSystem): number {
  return units === "us" ? celsiusToFahrenheit(celsius) : celsius;
}
export function weatherWind(kmh: number, units: WeatherUnitSystem): number {
  return units === "us" ? kmhToMph(kmh) : kmh;
}
export function weatherPressure(hpa: number, units: WeatherUnitSystem): number {
  return units === "us" ? hpaToInHg(hpa) : hpa;
}
export function weatherPrecip(mm: number, units: WeatherUnitSystem): number {
  return units === "us" ? mmToInches(mm) : mm;
}

/**
 * Conditions this tool distinguishes, derived from MET Norway's `symbol_code`
 * (e.g. "partlycloudy_day", "heavyrainshowersandthunder_night"). The day/night
 * suffix is handled separately by `isNightSymbol`.
 */
export type WeatherCategory =
  | "clearSky"
  | "fair"
  | "partlyCloudy"
  | "cloudy"
  | "fog"
  | "lightRain"
  | "rain"
  | "heavyRain"
  | "rainShowers"
  | "sleet"
  | "snow"
  | "snowShowers"
  | "thunderstorm"
  | "unknown";

export const WEATHER_CATEGORIES: readonly WeatherCategory[] = [
  "clearSky",
  "fair",
  "partlyCloudy",
  "cloudy",
  "fog",
  "lightRain",
  "rain",
  "heavyRain",
  "rainShowers",
  "sleet",
  "snow",
  "snowShowers",
  "thunderstorm",
  "unknown",
];

function symbolBase(symbol: string): string {
  return symbol.toLowerCase().replace(/_(day|night|polartwilight)$/, "");
}

export function metSymbolCategory(symbol: string | null | undefined): WeatherCategory {
  if (!symbol) return "unknown";
  const s = symbolBase(symbol);
  if (s === "clearsky") return "clearSky";
  if (s === "fair") return "fair";
  if (s === "partlycloudy") return "partlyCloudy";
  if (s === "cloudy") return "cloudy";
  if (s === "fog") return "fog";
  if (s.includes("thunder")) return "thunderstorm";
  if (s.includes("sleet")) return "sleet";
  if (s.includes("snow")) return s.includes("showers") ? "snowShowers" : "snow";
  if (s.includes("rain")) {
    if (s.includes("showers")) return "rainShowers";
    if (s.startsWith("light")) return "lightRain";
    if (s.startsWith("heavy")) return "heavyRain";
    return "rain";
  }
  return "unknown";
}

export function isNightSymbol(symbol: string | null | undefined): boolean {
  return Boolean(symbol && /_night$/.test(symbol));
}

/** True for categories that bring falling precipitation (used by the sky scene's particles). */
export function precipitationKind(category: WeatherCategory): "rain" | "snow" | "sleet" | null {
  if (category === "snow" || category === "snowShowers") return "snow";
  if (category === "sleet") return "sleet";
  if (["lightRain", "rain", "heavyRain", "rainShowers", "thunderstorm"].includes(category)) return "rain";
  return null;
}
