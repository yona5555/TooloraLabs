/**
 * Weather science computed locally from raw forecast values: feels-like temperature (NWS heat
 * index / Environment Canada wind chill), dew point (Magnus), pressure tendency, UV and wind
 * scales, and the Moon's phase. Pure functions; no DOM.
 */
import { celsiusToFahrenheit, fahrenheitToCelsius } from "../converters/WeatherConverter";

/** Dew point in °C (Magnus formula, Alduchov & Eskridge 1996 coefficients). */
export function dewPointC(tempC: number, relativeHumidity: number): number {
  const rh = Math.min(100, Math.max(1, relativeHumidity));
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(rh / 100) + (a * tempC) / (b + tempC);
  return (b * gamma) / (a - gamma);
}

/** NWS heat index (Rothfusz regression with its low/high humidity adjustments), in °C. */
export function heatIndexC(tempC: number, relativeHumidity: number): number {
  const T = celsiusToFahrenheit(tempC);
  const RH = relativeHumidity;
  const simple = 0.5 * (T + 61 + (T - 68) * 1.2 + RH * 0.094);
  if ((simple + T) / 2 < 80) return fahrenheitToCelsius(simple);
  let hi =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;
  if (RH < 13 && T >= 80 && T <= 112) hi -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  if (RH > 85 && T >= 80 && T <= 87) hi += ((RH - 85) / 10) * ((87 - T) / 5);
  return fahrenheitToCelsius(hi);
}

/** Wind chill (Environment Canada / NWS 2001 formula), in °C; wind in km/h at 10 m. */
export function windChillC(tempC: number, windKmh: number): number {
  const v = Math.pow(Math.max(windKmh, 0), 0.16);
  return 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
}

export type FeelsLikeMethod = "heatIndex" | "windChill" | "air";

/**
 * Feels-like temperature: wind chill at ≤ 10 °C with wind above 4.8 km/h, the heat index at
 * ≥ 26.7 °C (80 °F), otherwise the air temperature itself — the same split the US NWS uses.
 */
export function feelsLike(tempC: number, relativeHumidity: number, windKmh: number): { valueC: number; method: FeelsLikeMethod } {
  if (tempC <= 10 && windKmh > 4.8) return { valueC: windChillC(tempC, windKmh), method: "windChill" };
  if (tempC >= 26.7) return { valueC: heatIndexC(tempC, relativeHumidity), method: "heatIndex" };
  return { valueC: tempC, method: "air" };
}

export type DewComfort = "dry" | "comfortable" | "sticky" | "oppressive" | "severe";
/** Comfort bands by dew point (°C): < 10, 10–16, 16–21, 21–24, ≥ 24. */
export const DEW_COMFORT_BANDS: readonly { key: DewComfort; from: number; to: number }[] = [
  { key: "dry", from: -40, to: 10 },
  { key: "comfortable", from: 10, to: 16 },
  { key: "sticky", from: 16, to: 21 },
  { key: "oppressive", from: 21, to: 24 },
  { key: "severe", from: 24, to: 40 },
];
export function dewComfort(dewC: number): DewComfort {
  return (DEW_COMFORT_BANDS.find((b) => dewC < b.to) ?? DEW_COMFORT_BANDS[DEW_COMFORT_BANDS.length - 1]).key;
}

export type PressureTrend = "rising" | "falling" | "steady";
/** Tendency from a change over 3 hours; ±1 hPa is treated as steady. */
export function pressureTrend(deltaHpa3h: number): PressureTrend {
  if (deltaHpa3h > 1) return "rising";
  if (deltaHpa3h < -1) return "falling";
  return "steady";
}

export type UvLevel = "low" | "moderate" | "high" | "veryHigh" | "extreme";
/** WHO UV index categories: 0–2, 3–5, 6–7, 8–10, 11+. */
export const UV_BANDS: readonly { key: UvLevel; from: number; to: number }[] = [
  { key: "low", from: 0, to: 3 },
  { key: "moderate", from: 3, to: 6 },
  { key: "high", from: 6, to: 8 },
  { key: "veryHigh", from: 8, to: 11 },
  { key: "extreme", from: 11, to: 14 },
];
export function uvLevel(uv: number): UvLevel {
  const r = Math.round(Math.max(0, uv));
  return (UV_BANDS.find((b) => r < b.to) ?? UV_BANDS[UV_BANDS.length - 1]).key;
}

/** Beaufort force 0–12 from wind speed in m/s (upper bounds of forces 0–11). */
const BEAUFORT_MS = [0.5, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
export function beaufort(windMs: number): number {
  const i = BEAUFORT_MS.findIndex((limit) => windMs < limit);
  return i === -1 ? 12 : i;
}

export const COMPASS_16 = ["n", "nne", "ne", "ene", "e", "ese", "se", "sse", "s", "ssw", "sw", "wsw", "w", "wnw", "nw", "nnw"] as const;
export type Compass16 = (typeof COMPASS_16)[number];
export function compass16(deg: number): Compass16 {
  const d = ((deg % 360) + 360) % 360;
  return COMPASS_16[Math.round(d / 22.5) % 16];
}

/** Mean synodic month and a reference new moon (2000-01-06 18:14 UTC). */
export const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

export const MOON_PHASES = [
  "newMoon",
  "waxingCrescent",
  "firstQuarter",
  "waxingGibbous",
  "fullMoon",
  "waningGibbous",
  "lastQuarter",
  "waningCrescent",
] as const;
export type MoonPhaseKey = (typeof MOON_PHASES)[number];

export type MoonPhase = {
  /** Days since the last new moon (0 … 29.53). */
  ageDays: number;
  /** Illuminated fraction of the disc, 0 … 1. */
  illumination: number;
  phase: MoonPhaseKey;
  waxing: boolean;
  nextNewMoonMs: number;
  nextFullMoonMs: number;
};

/** Moon phase from the mean synodic month (accurate to within about a day). */
export function moonPhase(utcMs: number): MoonPhase {
  const days = (utcMs - REFERENCE_NEW_MOON_MS) / DAY_MS;
  const age = ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const frac = age / SYNODIC_MONTH_DAYS;
  const half = SYNODIC_MONTH_DAYS / 2;
  return {
    ageDays: age,
    illumination: (1 - Math.cos(2 * Math.PI * frac)) / 2,
    phase: MOON_PHASES[Math.round(frac * 8) % 8],
    waxing: age < half,
    nextNewMoonMs: utcMs + (SYNODIC_MONTH_DAYS - age) * DAY_MS,
    nextFullMoonMs: utcMs + (age < half ? half - age : SYNODIC_MONTH_DAYS + half - age) * DAY_MS,
  };
}

/** Great-circle distance in km (haversine, mean Earth radius 6371 km). */
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
