"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  civilToUtcMs,
  wtLocalizedCityName,
  formatOffset,
  parseCivilDate,
  utcMsToCivil,
  wtConvertWallTime,
  wtFindCity,
  wtNextTransition,
  wtPlanMeeting,
  wtStandardOffset,
  wtWeekendDays,
  zonedParts,
  type WtCity,
} from "@tooloralabs/tools";

/* ── State ──────────────────────────────────────────────────────────────────────── */

export type WtState = {
  v: 1;
  /** Home city (IANA zone id): the wall time is entered here. */
  from: string;
  /** Chosen cities: conversion targets, live clocks, meeting planner and map dots. */
  cities: string[];
  mode: "now" | "custom";
  /** Gregorian YYYY-MM-DD and HH:MM in the home city (custom mode). */
  date: string;
  time: string;
  /** Calendar used to type the date (the stored date is always Gregorian). */
  cal: "greg" | "hijri";
  /** Work hours, local minutes of day. */
  ws: number;
  we: number;
};

export const MAX_CITIES = 10;
const STORAGE_KEY = "tooloralabs:world-time:v1";

export const DEFAULT_STATE: WtState = {
  v: 1,
  from: "America/New_York",
  cities: ["Europe/London", "Asia/Riyadh", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"],
  mode: "now",
  date: "2026-10-17",
  time: "09:00",
  cal: "greg",
  ws: 9 * 60,
  we: 17 * 60,
};

export const PRESETS: { key: string; from: string; cities: string[] }[] = [
  { key: "usGlobal", from: "America/New_York", cities: DEFAULT_STATE.cities },
  { key: "gulfEurope", from: "Asia/Riyadh", cities: ["Europe/London", "Asia/Dubai", "Africa/Cairo", "Europe/Paris", "America/New_York"] },
  { key: "asiaPacific", from: "Asia/Singapore", cities: ["Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland", "Asia/Kolkata", "America/Los_Angeles"] },
];

const isZone = (z: unknown): z is string => typeof z === "string" && !!wtFindCity(z);
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function sanitize(x: Partial<WtState>): WtState {
  const from = isZone(x.from) ? x.from : DEFAULT_STATE.from;
  const cities = Array.isArray(x.cities) ? [...new Set(x.cities.filter(isZone))].filter((c) => c !== from).slice(0, MAX_CITIES) : DEFAULT_STATE.cities;
  const ws = Number.isFinite(x.ws) ? Math.max(0, Math.min(1410, Math.round(Number(x.ws) / 30) * 30)) : DEFAULT_STATE.ws;
  const we0 = Number.isFinite(x.we) ? Math.max(30, Math.min(1440, Math.round(Number(x.we) / 30) * 30)) : DEFAULT_STATE.we;
  return {
    v: 1,
    from,
    cities,
    mode: x.mode === "custom" ? "custom" : "now",
    date: typeof x.date === "string" && parseCivilDate(x.date) ? x.date : DEFAULT_STATE.date,
    time: typeof x.time === "string" && HHMM.test(x.time) ? x.time : DEFAULT_STATE.time,
    cal: x.cal === "hijri" ? "hijri" : "greg",
    ws,
    we: we0 > ws ? we0 : Math.min(1440, ws + 480),
  };
}

const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const fromHHMM = (s: string | null) => {
  const m = s ? /^(\d{1,2}):(\d{2})$/.exec(s) : null;
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

/** Share link: home city, chosen cities, the entered time (custom mode) and work hours. */
export function buildShareUrl(s: WtState, base: string): string {
  const u = new URL(base);
  u.search = "";
  u.hash = "";
  u.searchParams.set("from", s.from);
  u.searchParams.set("cities", s.cities.join(","));
  if (s.mode === "custom") u.searchParams.set("t", `${s.date}T${s.time}`);
  u.searchParams.set("work", `${toHHMM(s.ws)}-${toHHMM(s.we)}`);
  return u.toString();
}

export function parseShareParams(search: string): WtState | null {
  const p = new URLSearchParams(search);
  if (!p.has("from") && !p.has("cities")) return null;
  const t = p.get("t");
  const [date, time] = t ? t.split("T") : [];
  const [ws, we] = (p.get("work") ?? "").split("-");
  return sanitize({
    from: p.get("from") ?? undefined,
    cities: p.get("cities")?.split(",").filter(Boolean),
    mode: t ? "custom" : "now",
    date,
    time,
    ws: fromHHMM(ws ?? null),
    we: fromHHMM(we ?? null),
  });
}

/** URL parameters first, then the visitor's saved state (localStorage in try/catch), else the sample. */
export function useWorldTimeState() {
  const [state, setState] = useState<WtState>(DEFAULT_STATE);
  const loaded = useRef(false);

  useEffect(() => {
    let next: WtState | null = null;
    try {
      next = parseShareParams(window.location.search);
      if (!next) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) next = sanitize(JSON.parse(raw) as Partial<WtState>);
      }
    } catch {
      /* storage unavailable: keep the sample */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from the URL / saved state
    if (next) setState(next);
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable or full */
    }
  }, [state]);

  return [state, setState] as const;
}

/* ── Live clock ─────────────────────────────────────────────────────────────────── */

/** Server/first-paint instant (a fixed realistic moment); the live clock takes over on hydration. */
export const SAMPLE_NOW = Date.UTC(2026, 9, 17, 13, 0, 0);
let nowMs = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
const tick = () => {
  nowMs = Math.floor(Date.now() / 1000) * 1000;
  listeners.forEach((l) => l());
};
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    tick();
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
const getSnapshot = () => nowMs || (nowMs = Math.floor(Date.now() / 1000) * 1000);
const getServerSnapshot = () => SAMPLE_NOW;

/** Current time, ticking every second (use only in the parts that show seconds). */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const getMinuteSnapshot = () => Math.floor(getSnapshot() / 60_000) * 60_000;
/** Current time floored to the minute: the page re-renders once a minute, not every second. */
export function useNowMinute(): number {
  return useSyncExternalStore(subscribe, getMinuteSnapshot, getServerSnapshot);
}

/* ── Derived ────────────────────────────────────────────────────────────────────── */

export function cityOf(id: string): WtCity {
  return wtFindCity(id) ?? wtFindCity(DEFAULT_STATE.from)!;
}

export function derive(s: WtState, nowMinute: number) {
  const from = cityOf(s.from);
  const all = [from, ...s.cities.map(cityOf)];
  const zones = all.map((c) => c.zone);
  const input =
    s.mode === "now"
      ? zonedParts(nowMinute, from.zone)
      : (() => {
          const d = parseCivilDate(s.date) ?? parseCivilDate(DEFAULT_STATE.date)!;
          const [h, m] = s.time.split(":").map(Number);
          return { ...d, hour: h, minute: m, second: 0 };
        })();
  const conv = wtConvertWallTime(input, from.zone, zones);
  const fromRow = conv.rows[0];
  const planDate = { year: fromRow.parts.year, month: fromRow.parts.month, day: fromRow.parts.day };
  const meetingCities = all.map((c) => ({ zone: c.zone, weekend: wtWeekendDays(c.weekend) }));
  const plan = wtPlanMeeting(meetingCities, from.zone, planDate, s.ws, s.we);
  // Seven days from the plan date: real weekly overlap (weekends and the date line respected).
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = utcMsToCivil(civilToUtcMs(planDate) + i * 86_400_000);
    return { date, minutes: i === 0 ? plan.allOverlapMinutes : wtPlanMeeting(meetingCities, from.zone, date, s.ws, s.we).allOverlapMinutes };
  });
  const year = fromRow.parts.year;
  const extra = all.map((c, i) => ({
    std: wtStandardOffset(c.zone, year),
    next: wtNextTransition(c.zone, conv.utcMs),
    row: conv.rows[i],
  }));
  const offsets = conv.rows.map((r) => r.offsetMinutes);
  const spread = Math.max(...offsets) - Math.min(...offsets);
  return { from, all, conv, plan, planDate, week, extra, spread, meetingCities };
}

export type Derived = ReturnType<typeof derive>;

export function useDerived(s: WtState, now: number) {
  const nowMinute = Math.floor(now / 60_000) * 60_000;
  const key = s.mode === "now" ? nowMinute : 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- custom mode does not depend on the clock
  return useMemo(() => derive(s, nowMinute), [s, key]);
}

/* ── Formatting ─────────────────────────────────────────────────────────────────── */

export function makeFmt(locale: string) {
  const loc = `${locale}-u-nu-latn`;
  const cache = new Map<string, Intl.DateTimeFormat>();
  const dtf = (key: string, opts: Intl.DateTimeFormatOptions, l = loc) => {
    const k = `${l}|${key}`;
    let f = cache.get(k);
    if (!f) {
      f = new Intl.DateTimeFormat(l, opts);
      cache.set(k, f);
    }
    return f;
  };
  let region: Intl.DisplayNames | null = null;
  try {
    region = new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    region = null;
  }
  const num = new Intl.NumberFormat(loc, { maximumFractionDigits: 1 });
  return {
    locale,
    time: (ms: number, zone: string) => dtf(`t${zone}`, { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(ms),
    timeSec: (ms: number, zone: string) =>
      dtf(`ts${zone}`, { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(ms),
    date: (ms: number, zone: string) => dtf(`d${zone}`, { timeZone: zone, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(ms),
    shortDate: (ms: number, zone: string) => dtf(`sd${zone}`, { timeZone: zone, day: "numeric", month: "short" }).format(ms),
    month: (ms: number) => dtf("mo", { timeZone: "UTC", month: "short" }).format(ms),
    weekday: (ms: number, zone: string) => dtf(`w${zone}`, { timeZone: zone, weekday: "short" }).format(ms),
    hijri: (ms: number, zone: string) =>
      dtf(`h${zone}`, { timeZone: zone, day: "numeric", month: "long", year: "numeric" }, `${locale}-u-ca-islamic-umalqura-nu-latn`).format(ms),
    hijriMonth: (ms: number) => dtf("hm", { timeZone: "UTC", month: "long" }, `${locale}-u-ca-islamic-umalqura-nu-latn`).format(ms),
    /** Weekday name for 0 = Sunday … 6 = Saturday. */
    dayName: (d: number) => dtf("dn", { timeZone: "UTC", weekday: "short" }).format(Date.UTC(2026, 0, 4 + d)),
    offset: (min: number) => formatOffset(min).replace("-", "−"),
    hhmm: (m: number) => toHHMM(((Math.round(m) % 1440) + 1440) % 1440),
    num: (n: number) => num.format(n),
    signed: (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${num.format(Math.abs(n))}`,
    city: (c: WtCity) => wtLocalizedCityName(c.name.en, c.name.ar, locale),
    country: (c: WtCity) => region?.of(c.country) ?? c.country,
  };
}

export type Fmt = ReturnType<typeof makeFmt>;

/** Props shared by the indicator cards. */
export type CardProps = { s: WtState; set: (patch: Partial<WtState>) => void; d: Derived; f: Fmt; now: number };

/** Slot status colours (shared by the planner grid, legends and the dial). */
export const STATUS_COLORS = { work: "#10b981", shoulder: "#f59e0b", night: "#475569", weekend: "#f43f5e" } as const;
