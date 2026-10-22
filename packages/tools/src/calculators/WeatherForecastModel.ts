/**
 * Normalises a MET Norway Locationforecast 2.0 "complete" response into compact steps, then
 * derives the 48-hour hourly series and local-calendar daily summaries. Pure; no DOM.
 * Timestamps from MET are UTC; days are grouped in the city's IANA time zone.
 */
import { metSymbolCategory, msToKmh, type WeatherCategory } from "../converters/WeatherConverter";
import { zonedParts } from "./DateTimeCore";
import { pressureTrend, type PressureTrend } from "./WeatherScience";

type MetDetails = Record<string, number | undefined>;
type MetPeriod = { summary?: { symbol_code?: string }; details?: MetDetails };
export type MetTimeStep = {
  time: string;
  data: { instant: { details: MetDetails }; next_1_hours?: MetPeriod; next_6_hours?: MetPeriod; next_12_hours?: MetPeriod };
};
export type MetLocationforecast = {
  properties: { meta: { updated_at: string }; timeseries: MetTimeStep[] };
};

/** One forecast step: the instant values at `t` plus the period that starts at `t`. */
export type WxStep = {
  t: number;
  /** Length of the period this step summarises: 1 h in the first ~2.5 days, 6 h after. */
  stepHours: 1 | 6;
  tempC: number;
  rh: number;
  dewC: number | null;
  windKmh: number;
  windDir: number;
  /** Wind gust in km/h, when MET provides it for the location. */
  gustKmh: number | null;
  pressureHpa: number;
  cloud: number;
  fog: number | null;
  /** Clear-sky UV index as MET provides it (no cloud attenuation), or null when absent. */
  uv: number | null;
  /** Precipitation over the step's period, mm. */
  precipMm: number;
  /** Highest/lowest temperature in the following 6 h, when MET gives them. */
  max6C: number | null;
  min6C: number | null;
  symbol: string | null;
};

export type WxForecast = { updatedAt: number; steps: WxStep[] };

const num = (v: number | undefined, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const opt = (v: number | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function parseMetForecast(json: MetLocationforecast): WxForecast {
  const series = json?.properties?.timeseries ?? [];
  const steps: WxStep[] = [];
  for (let i = 0; i < series.length; i++) {
    const s = series[i];
    const d = s.data?.instant?.details;
    if (!d || typeof d.air_temperature !== "number") continue;
    const t = Date.parse(s.time);
    const next = series[i + 1] ? Date.parse(series[i + 1].time) : t + 6 * 3_600_000;
    const hourly = Boolean(s.data.next_1_hours) && next - t <= 3_600_000;
    const period = hourly ? s.data.next_1_hours : s.data.next_6_hours;
    steps.push({
      t,
      stepHours: hourly ? 1 : 6,
      tempC: d.air_temperature,
      rh: num(d.relative_humidity),
      dewC: opt(d.dew_point_temperature),
      windKmh: msToKmh(num(d.wind_speed)),
      windDir: num(d.wind_from_direction),
      gustKmh: typeof d.wind_speed_of_gust === "number" ? msToKmh(d.wind_speed_of_gust) : null,
      pressureHpa: num(d.air_pressure_at_sea_level),
      cloud: num(d.cloud_area_fraction),
      fog: opt(d.fog_area_fraction),
      uv: opt(d.ultraviolet_index_clear_sky),
      precipMm: num(period?.details?.precipitation_amount),
      max6C: opt(s.data.next_6_hours?.details?.air_temperature_max),
      min6C: opt(s.data.next_6_hours?.details?.air_temperature_min),
      symbol:
        s.data.next_1_hours?.summary?.symbol_code ??
        s.data.next_6_hours?.summary?.symbol_code ??
        s.data.next_12_hours?.summary?.symbol_code ??
        null,
    });
  }
  const updated = Date.parse(json?.properties?.meta?.updated_at ?? "");
  return { updatedAt: Number.isFinite(updated) ? updated : steps[0]?.t ?? 0, steps };
}

/** The step covering `nowMs` (the latest one that has started), or the first step. */
export function currentStep(steps: WxStep[], nowMs: number): WxStep | null {
  if (steps.length === 0) return null;
  let cur = steps[0];
  for (const s of steps) {
    if (s.t <= nowMs) cur = s;
    else break;
  }
  return cur;
}

/** Up to `hours` hourly steps starting at the current hour. */
export function nextHours(steps: WxStep[], nowMs: number, hours = 48): WxStep[] {
  const start = nowMs - 3_600_000;
  return steps.filter((s) => s.stepHours === 1 && s.t > start).slice(0, hours);
}

/** Change in sea-level pressure over the next 3 forecast hours, with its tendency. */
export function pressureTendency(steps: WxStep[], nowMs: number): { deltaHpa: number; trend: PressureTrend } {
  const h = nextHours(steps, nowMs, 4);
  const delta = h.length >= 4 ? h[3].pressureHpa - h[0].pressureHpa : 0;
  return { deltaHpa: delta, trend: pressureTrend(delta) };
}

export type WxDay = {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  minC: number;
  maxC: number;
  precipMm: number;
  symbol: string | null;
  category: WeatherCategory;
  uvMax: number | null;
  windMaxKmh: number;
  /** Hours of the day covered by forecast steps. */
  coveredHours: number;
};

/**
 * Daily summaries in `timeZone`. Min/max come from every instant temperature in the day plus the
 * 6-hour extremes of 6-hourly steps; precipitation sums each step's own period; the day's symbol is
 * the step nearest local noon. The first day is kept even if partial; later days need ≥ 12 h.
 */
export function buildDailyForecast(steps: WxStep[], timeZone: string): WxDay[] {
  const groups = new Map<string, { s: WxStep; hour: number }[]>();
  for (const s of steps) {
    const p = zonedParts(s.t, timeZone);
    const key = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
    const list = groups.get(key) ?? [];
    list.push({ s, hour: p.hour + p.minute / 60 });
    groups.set(key, list);
  }
  const days: WxDay[] = [];
  let first = true;
  for (const [date, list] of groups) {
    const covered = list.reduce((a, x) => a + x.s.stepHours, 0);
    if (!first && covered < 12) continue;
    first = false;
    const temps: number[] = [];
    for (const { s } of list) {
      temps.push(s.tempC);
      if (s.stepHours === 6) {
        if (s.max6C !== null) temps.push(s.max6C);
        if (s.min6C !== null) temps.push(s.min6C);
      }
    }
    const noon = list.reduce((best, x) => (x.s.symbol && Math.abs(x.hour - 12) < Math.abs(best.hour - 12) ? x : best), list[0]);
    const uvs = list.map((x) => x.s.uv).filter((v): v is number => v !== null);
    const symbol = noon.s.symbol ?? list.find((x) => x.s.symbol)?.s.symbol ?? null;
    days.push({
      date,
      minC: Math.min(...temps),
      maxC: Math.max(...temps),
      precipMm: Math.round(list.reduce((a, x) => a + x.s.precipMm, 0) * 10) / 10,
      symbol,
      category: metSymbolCategory(symbol),
      uvMax: uvs.length ? Math.max(...uvs) : null,
      windMaxKmh: Math.max(...list.map((x) => x.s.windKmh)),
      coveredHours: Math.min(24, covered),
    });
  }
  return days;
}
