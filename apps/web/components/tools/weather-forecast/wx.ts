"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  buildDailyForecast,
  currentStep,
  dewPointC,
  feelsLike,
  metSymbolCategory,
  moonPhase,
  nextHours,
  pressureTendency,
  weatherPrecip,
  weatherPressure,
  weatherTemp,
  weatherWind,
  wtSolarElevation,
  wtSolarPosition,
  wtSunTimes,
  zonedParts,
  zoneOffsetMinutes,
  type WeatherUnitSystem,
  type WxForecast,
  type WxStep,
} from "@tooloralabs/tools";

/** The place being shown: a curated city, or the visitor's own position ("geo"). */
export type WxPlace = { id: string; name: string; lat: number; lon: number; zone: string };

/**
 * Chart width in real pixels (the container's width), so SVG text sizes are true pixel sizes and
 * axis labels stay ≥ 12px at any screen width instead of shrinking with a scaled viewBox.
 */
export function useChartWidth(initial: number, min = 300) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(min, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return [ref, width] as const;
}

/** Arabic is the site's only right-to-left locale; charts with a time axis mirror for it. */
export function useIsRtl() {
  return useLocale() === "ar";
}

export function useWxT() {
  return useTranslations("tools.weather-forecast.wx");
}

export function makeWxFmt(locale: string, units: WeatherUnitSystem) {
  const loc = `${locale}-u-nu-latn`;
  const nf = new Map<number, Intl.NumberFormat>();
  const num = (n: number, digits = 0) => {
    let f = nf.get(digits);
    if (!f) {
      f = new Intl.NumberFormat(loc, { maximumFractionDigits: digits, minimumFractionDigits: digits });
      nf.set(digits, f);
    }
    return f.format(Object.is(Math.round(n * 10 ** digits), -0) ? 0 : n).replace("-", "−");
  };
  const dtf = new Map<string, Intl.DateTimeFormat>();
  const fmt = (key: string, zone: string, opts: Intl.DateTimeFormatOptions) => {
    const k = `${key}|${zone}`;
    let f = dtf.get(k);
    if (!f) {
      f = new Intl.DateTimeFormat(loc, { timeZone: zone, ...opts });
      dtf.set(k, f);
    }
    return f;
  };
  const us = units === "us";
  return {
    units,
    num,
    tempUnit: us ? "°F" : "°C",
    windUnit: us ? "mph" : "km/h",
    pressureUnit: us ? "inHg" : "hPa",
    precipUnit: us ? "in" : "mm",
    /** "23°" in the chosen unit. */
    deg: (c: number) => `${num(weatherTemp(c, units))}°`,
    temp: (c: number, digits = 0) => `${num(weatherTemp(c, units), digits)} ${us ? "°F" : "°C"}`,
    wind: (kmh: number) => `${num(weatherWind(kmh, units))} ${us ? "mph" : "km/h"}`,
    pressure: (hpa: number) => `${num(weatherPressure(hpa, units), us ? 2 : 0)} ${us ? "inHg" : "hPa"}`,
    pressureDelta: (hpa: number) => `${hpa > 0 ? "+" : ""}${num(weatherPressure(hpa, units), us ? 2 : 1)} ${us ? "inHg" : "hPa"}`,
    precip: (mm: number) => `${num(weatherPrecip(mm, units), us ? 2 : 1)} ${us ? "in" : "mm"}`,
    time: (ms: number, zone: string) => fmt("t", zone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(ms),
    hour: (ms: number, zone: string) => fmt("h", zone, { hour: "2-digit", hourCycle: "h23" }).format(ms),
    weekday: (ms: number, zone: string) => fmt("w", zone, { weekday: "short" }).format(ms),
    dayMonth: (ms: number, zone: string) => fmt("dm", zone, { day: "numeric", month: "short" }).format(ms),
    dateTime: (ms: number, zone: string) => fmt("dt", zone, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(ms),
    /** Local minutes of day → "06:12". */
    hhmm: (m: number) => {
      const v = ((Math.round(m) % 1440) + 1440) % 1440;
      return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
    },
  };
}
export type WxFmt = ReturnType<typeof makeWxFmt>;

/** Noon UTC of a local YYYY-MM-DD, for weekday/date labels in any zone. */
export function dateKeyMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 12);
}

export function deriveWeather(place: WxPlace, forecast: WxForecast, now: number) {
  const cur: WxStep | null = currentStep(forecast.steps, now);
  const hours48 = nextHours(forecast.steps, now, 48);
  const days = buildDailyForecast(forecast.steps, place.zone);
  const tendency = pressureTendency(forecast.steps, now);
  const local = zonedParts(now, place.zone);
  const sun = wtSunTimes(place.lat, place.lon, local, zoneOffsetMinutes(now, place.zone));
  const sp = wtSolarPosition(now);
  const sunElevation = wtSolarElevation({ lat: place.lat, lon: place.lon }, { lat: sp.subsolarLatDeg, lon: sp.subsolarLonDeg });
  const moon = moonPhase(now);
  const feels = cur ? feelsLike(cur.tempC, cur.rh, cur.windKmh) : null;
  const dew = cur ? (cur.dewC ?? dewPointC(cur.tempC, cur.rh)) : null;
  const dewComputed = cur ? dewPointC(cur.tempC, cur.rh) : null;
  const todayUv = hours48.filter((h) => zonedParts(h.t, place.zone).day === local.day).map((h) => h.uv ?? 0);
  return {
    place,
    now,
    updatedAt: forecast.updatedAt,
    cur,
    hours48,
    days,
    tendency,
    localMinutes: local.hour * 60 + local.minute,
    sun,
    sunElevation,
    moon,
    feels,
    dew,
    dewComputed,
    category: metSymbolCategory(cur?.symbol),
    uvMaxToday: todayUv.length ? Math.max(...todayUv) : (days[0]?.uvMax ?? null),
  };
}
export type WxDerived = ReturnType<typeof deriveWeather>;

export function useWeatherDerived(place: WxPlace, forecast: WxForecast | null, now: number): WxDerived | null {
  const minute = Math.floor(now / 60_000);
  return useMemo(
    () => (forecast && forecast.steps.length ? deriveWeather(place, forecast, minute * 60_000) : null),
    [place, forecast, minute],
  );
}

/** Props every indicator card receives. */
export type WxCardProps = { d: WxDerived; f: WxFmt };

/** Temperature → colour ramp used by the map layer, the chart and the range bars. */
export const TEMP_STOPS: [number, string][] = [
  [-20, "#6d28d9"],
  [-5, "#2563eb"],
  [5, "#0ea5e9"],
  [15, "#10b981"],
  [22, "#eab308"],
  [30, "#f97316"],
  [38, "#dc2626"],
  [46, "#7f1d1d"],
];
export function tempColor(c: number): string {
  if (c <= TEMP_STOPS[0][0]) return TEMP_STOPS[0][1];
  for (let i = 1; i < TEMP_STOPS.length; i++) if (c < TEMP_STOPS[i][0]) return TEMP_STOPS[i - 1][1];
  return TEMP_STOPS[TEMP_STOPS.length - 1][1];
}

export type MapCity = { id: string; name: string; lat: number; lon: number; tempC: number; label: string };
export type MapLayers = { temperature: boolean; earthquake: boolean; wildfire: boolean; storm: boolean; volcano: boolean };
export const EVENT_COLORS = { earthquake: "#dc2626", wildfire: "#ea580c", storm: "#0891b2", volcano: "#7c2d12" } as const;
