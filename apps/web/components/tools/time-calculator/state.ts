"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  civilToUtcMs,
  defaultWeekendForLocale,
  formatOffset,
  isValidIanaZone,
  parseCivilDate,
  tcClockAdd,
  tcClockSpan,
  tcDefaultWorkDays,
  tcFormatHms,
  tcFromDecimalHours,
  tcHmsToSeconds,
  tcParseClock,
  tcRoundDuration,
  tcSumEntries,
  tcToDecimalHours,
  tcWeekOrder,
  tcWorkWeek,
  type CivilDate,
  type TcOvertimeBasis,
  type TcRoundMode,
  type WeekendPreset,
} from "@tooloralabs/tools";

/* ── State ──────────────────────────────────────────────────────────────────────── */

export type Mode = "sum" | "span" | "add" | "week" | "dec";
export const MODES: Mode[] = ["sum", "span", "add", "week", "dec"];

export type SumRow = { id: string; label: string; sign: 1 | -1; h: string; m: string; s: string };
export type DayRow = { on: boolean; start: string; end: string; brk: string };

export type TcState = {
  v: 1;
  mode: Mode;
  h12: boolean;
  /** IANA zone for the span and clock modes; "" = floating clock time (no DST). */
  zone: string;
  rows: SumRow[];
  span: { date: string; start: string; end: string; endDate: string; brk: string };
  add: { date: string; time: string; h: string; m: string; s: string; op: 1 | -1 };
  week: { weekend: WeekendPreset; days: DayRow[]; basis: TcOvertimeBasis; weeklyH: string; dailyH: string; mult: string };
  dec: { dir: "toHms" | "toDec"; decimal: string; h: string; m: string; s: string; inc: number; round: TcRoundMode };
};

export const ZONES = [
  "",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Africa/Cairo",
  "Asia/Beirut",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
];

export const INCREMENTS = [1, 5, 6, 15];
const STORAGE_KEY = "tooloralabs:time-calculator:v1";

let idCounter = 0;
export const newRowId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const SAMPLE_ROWS: { sign: 1 | -1; h: string; m: string; s: string }[] = [
  { sign: 1, h: "8", m: "15", s: "0" },
  { sign: 1, h: "7", m: "50", s: "0" },
  { sign: 1, h: "8", m: "05", s: "30" },
  { sign: -1, h: "0", m: "45", s: "0" },
  { sign: 1, h: "1", m: "30", s: "0" },
];

/** Five-day sample week (start, end, break minutes) placed on the preset's work days. */
const SAMPLE_WEEK: [string, string, string][] = [
  ["08:00", "17:00", "60"],
  ["08:00", "17:30", "60"],
  ["08:30", "19:00", "45"],
  ["08:00", "17:00", "60"],
  ["07:30", "16:00", "30"],
];

export function weekDaysFor(preset: WeekendPreset, prev?: DayRow[]): DayRow[] {
  const work = tcDefaultWorkDays(preset);
  const order = tcWeekOrder(preset).filter((d) => work[d]);
  // Switching the weekend keeps the visitor's shifts, moved in order onto the new work days.
  const kept = prev ? prev.filter((r) => r.on) : [];
  const base: DayRow[] = Array.from({ length: 7 }, () => ({ on: false, start: "09:00", end: "17:00", brk: "60" }));
  order.forEach((wd, i) => {
    const [start, end, brk] = SAMPLE_WEEK[i];
    base[wd] = kept[i] ? { ...kept[i], on: true } : { on: true, start, end, brk };
  });
  return base;
}

/**
 * Realistic sample shown on load: a London night shift across the 25 Oct 2026 clock change
 * (8 h on the wall, 9 h worked), a timesheet with a break subtracted, a late start + 9 h, a
 * 42¼-hour week with overtime and 7.75 decimal hours. Labels come from translations.
 */
export function sampleState(locale: string, rowLabels: string[]): TcState {
  const weekend = defaultWeekendForLocale(locale);
  return {
    v: 1,
    mode: "span",
    h12: locale === "en" || locale === "hi",
    zone: "Europe/London",
    rows: SAMPLE_ROWS.map((r, i) => ({ id: `r${i}`, label: rowLabels[i] ?? "", ...r })),
    span: { date: "2026-10-24", start: "22:00", end: "06:00", endDate: "", brk: "30" },
    add: { date: "2026-10-24", time: "23:00", h: "9", m: "0", s: "0", op: 1 },
    week: { weekend, days: weekDaysFor(weekend), basis: "weekly", weeklyH: "40", dailyH: "8", mult: "1.5" },
    dec: { dir: "toHms", decimal: "7.75", h: "8", m: "20", s: "0", inc: 15, round: "nearest" },
  };
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const okDate = (v: unknown): v is string => typeof v === "string" && !!parseCivilDate(v);
const okTime = (v: unknown): v is string => typeof v === "string" && HHMM.test(v);
const str = (v: unknown, fb: string, max = 12) => (typeof v === "string" ? v.slice(0, max) : fb);
const sign = (v: unknown): 1 | -1 => (v === -1 || v === "-1" || v === "-" ? -1 : 1);

export function sanitize(x: Partial<TcState> | null | undefined, base: TcState): TcState {
  if (!x || typeof x !== "object") return base;
  const sp: Partial<TcState["span"]> = x.span ?? {};
  const ad: Partial<TcState["add"]> = x.add ?? {};
  const wk: Partial<TcState["week"]> = x.week ?? {};
  const dc: Partial<TcState["dec"]> = x.dec ?? {};
  const weekend: WeekendPreset = wk.weekend === "fri-sat" || wk.weekend === "sat-sun" ? wk.weekend : base.week.weekend;
  const rows = Array.isArray(x.rows) && x.rows.length
    ? x.rows.slice(0, 40).map((r, i) => ({
        id: typeof r?.id === "string" ? r.id : `u${i}`,
        label: str(r?.label, "", 40),
        sign: sign(r?.sign),
        h: str(r?.h, "0", 6),
        m: str(r?.m, "0", 4),
        s: str(r?.s, "0", 4),
      }))
    : base.rows;
  const days =
    Array.isArray(wk.days) && wk.days.length === 7
      ? wk.days.map((d, i) => ({
          on: !!d?.on,
          start: okTime(d?.start) ? d.start : base.week.days[i].start,
          end: okTime(d?.end) ? d.end : base.week.days[i].end,
          brk: str(d?.brk, "0", 4),
        }))
      : weekend === base.week.weekend
        ? base.week.days
        : weekDaysFor(weekend);
  return {
    v: 1,
    mode: MODES.includes(x.mode as Mode) ? (x.mode as Mode) : base.mode,
    h12: typeof x.h12 === "boolean" ? x.h12 : base.h12,
    zone: typeof x.zone === "string" && (x.zone === "" || isValidIanaZone(x.zone)) ? x.zone : base.zone,
    rows,
    span: {
      date: okDate(sp.date) ? sp.date : base.span.date,
      start: okTime(sp.start) ? sp.start : base.span.start,
      end: okTime(sp.end) ? sp.end : base.span.end,
      endDate: okDate(sp.endDate) ? sp.endDate : "",
      brk: str(sp.brk, base.span.brk, 4),
    },
    add: {
      date: okDate(ad.date) ? ad.date : base.add.date,
      time: okTime(ad.time) ? ad.time : base.add.time,
      h: str(ad.h, base.add.h, 6),
      m: str(ad.m, base.add.m, 4),
      s: str(ad.s, base.add.s, 4),
      op: sign(ad.op),
    },
    week: {
      weekend,
      days,
      basis: wk.basis === "daily" ? "daily" : "weekly",
      weeklyH: str(wk.weeklyH, base.week.weeklyH, 5),
      dailyH: str(wk.dailyH, base.week.dailyH, 5),
      mult: str(wk.mult, base.week.mult, 4),
    },
    dec: {
      dir: dc.dir === "toDec" ? "toDec" : "toHms",
      decimal: str(dc.decimal, base.dec.decimal, 10),
      h: str(dc.h, base.dec.h, 6),
      m: str(dc.m, base.dec.m, 4),
      s: str(dc.s, base.dec.s, 4),
      inc: INCREMENTS.includes(Number(dc.inc)) ? Number(dc.inc) : base.dec.inc,
      round: dc.round === "up" || dc.round === "down" ? dc.round : "nearest",
    },
  };
}

/* ── Share link (inputs of the active mode in the URL) ──────────────────────────── */

const hms = (h: string, m: string, s: string) => `${h || 0}:${m || 0}:${s || 0}`;
const splitHms = (v: string | null) => {
  const [h = "0", m = "0", s = "0"] = (v ?? "").split(":");
  return { h, m, s };
};

export function buildShareUrl(s: TcState, href: string): string {
  const u = new URL(href);
  u.search = "";
  u.hash = "";
  const p = u.searchParams;
  p.set("mode", s.mode);
  if (s.h12) p.set("h12", "1");
  if (s.mode === "sum") {
    p.set("e", s.rows.map((r) => `${r.sign === -1 ? "-" : "+"}${hms(r.h, r.m, r.s)}~${r.label.replace(/[~,]/g, " ")}`).join(","));
  } else if (s.mode === "span") {
    p.set("d", s.span.date);
    p.set("s", s.span.start);
    p.set("e", s.span.end);
    if (s.span.endDate) p.set("ed", s.span.endDate);
    p.set("b", s.span.brk);
    p.set("z", s.zone);
  } else if (s.mode === "add") {
    p.set("d", s.add.date);
    p.set("t", s.add.time);
    p.set("dur", `${s.add.op === -1 ? "-" : "+"}${hms(s.add.h, s.add.m, s.add.s)}`);
    p.set("z", s.zone);
  } else if (s.mode === "week") {
    p.set("w", s.week.weekend);
    p.set("days", s.week.days.map((d) => (d.on ? `${d.start.replace(":", "")}-${d.end.replace(":", "")}-${d.brk || 0}` : "x")).join(","));
    p.set("ob", s.week.basis);
    p.set("th", s.week.weeklyH);
    p.set("dh", s.week.dailyH);
    p.set("x", s.week.mult);
  } else {
    p.set("dir", s.dec.dir);
    p.set("v", s.dec.dir === "toHms" ? s.dec.decimal : hms(s.dec.h, s.dec.m, s.dec.s));
    p.set("r", `${s.dec.inc}${s.dec.round === "nearest" ? "" : s.dec.round[0]}`);
  }
  return u.toString();
}

const t4 = (v: string) => (/^\d{4}$/.test(v) ? `${v.slice(0, 2)}:${v.slice(2)}` : "");

export function parseShareParams(search: string, base: TcState): TcState | null {
  const p = new URLSearchParams(search);
  const mode = p.get("mode") as Mode | null;
  if (!mode || !MODES.includes(mode)) return null;
  const next: Partial<TcState> = { ...base, mode, h12: p.get("h12") === "1" ? true : base.h12 };
  const z = p.get("z");
  if (z !== null) next.zone = z;
  if (mode === "sum" && p.get("e")) {
    next.rows = p
      .get("e")!
      .split(",")
      .filter(Boolean)
      .map((chunk, i) => {
        const [dur, label = ""] = chunk.split("~");
        const sg = dur.startsWith("-") ? -1 : 1;
        return { id: `q${i}`, label, sign: sg, ...splitHms(dur.replace(/^[+-]/, "")) };
      });
  } else if (mode === "span") {
    next.span = { date: p.get("d") ?? "", start: p.get("s") ?? "", end: p.get("e") ?? "", endDate: p.get("ed") ?? "", brk: p.get("b") ?? "0" };
  } else if (mode === "add") {
    const dur = p.get("dur") ?? "";
    next.add = { date: p.get("d") ?? "", time: p.get("t") ?? "", op: dur.startsWith("-") ? -1 : 1, ...splitHms(dur.replace(/^[+-]/, "")) };
  } else if (mode === "week") {
    const w = p.get("w") as WeekendPreset;
    const days = (p.get("days") ?? "").split(",");
    next.week = {
      weekend: w,
      days:
        days.length === 7
          ? days.map((c) => {
              const [a = "", b = "", brk = "0"] = c.split("-");
              return c === "x" ? { on: false, start: "09:00", end: "17:00", brk: "60" } : { on: true, start: t4(a), end: t4(b), brk };
            })
          : [],
      basis: p.get("ob") === "daily" ? "daily" : "weekly",
      weeklyH: p.get("th") ?? "",
      dailyH: p.get("dh") ?? "",
      mult: p.get("x") ?? "",
    };
  } else if (mode === "dec") {
    const dir = p.get("dir") === "toDec" ? "toDec" : "toHms";
    const v = p.get("v") ?? "";
    const r = p.get("r") ?? "15";
    const inc = parseInt(r, 10);
    const round: TcRoundMode = r.endsWith("u") ? "up" : r.endsWith("d") ? "down" : "nearest";
    next.dec = dir === "toHms" ? { ...base.dec, dir, decimal: v, inc, round } : { ...base.dec, dir, ...splitHms(v), inc, round };
  }
  return sanitize(next, base);
}

/** URL parameters first, then the visitor's saved state (localStorage in try/catch), else the sample. */
export function useTcState(initial: () => TcState) {
  const [state, setState] = useState<TcState>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    let next: TcState | null = null;
    try {
      next = parseShareParams(window.location.search, state);
      if (!next) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) next = sanitize(JSON.parse(raw) as Partial<TcState>, state);
      }
    } catch {
      /* storage unavailable: keep the sample */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from the URL / saved state
    if (next) setState(next);
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount
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

/* ── Derived ────────────────────────────────────────────────────────────────────── */

const n = (v: string) => {
  const x = Number(String(v).replace(",", ".").trim() || "0");
  return Number.isFinite(x) && x >= 0 ? x : 0;
};
export const secondsOf = (h: string, m: string, s: string) => {
  const v = tcHmsToSeconds(n(h), n(m), n(s));
  return Number.isFinite(v) ? v : 0;
};
const clockOf = (v: string, fb: number) => tcParseClock(v) ?? fb;
const dateOf = (v: string, fb: string): CivilDate => parseCivilDate(v) ?? parseCivilDate(fb)!;

export function derive(s: TcState) {
  const zone = s.zone || null;

  const rowSeconds = s.rows.map((r) => secondsOf(r.h, r.m, r.s));
  const sheet = tcSumEntries(s.rows.map((r, i) => ({ sign: r.sign, seconds: rowSeconds[i] })));

  const spanStartDate = dateOf(s.span.date, "2026-10-24");
  const spanStart = clockOf(s.span.start, 22 * 3600);
  const spanEnd = clockOf(s.span.end, 6 * 3600);
  const span = tcClockSpan({
    startDate: spanStartDate,
    startClock: spanStart,
    endClock: spanEnd,
    endDate: s.span.endDate ? dateOf(s.span.endDate, s.span.date) : null,
    zone,
    breakSeconds: n(s.span.brk) * 60,
  });

  const addDate = dateOf(s.add.date, "2026-10-24");
  const addClock = clockOf(s.add.time, 23 * 3600);
  const addDuration = secondsOf(s.add.h, s.add.m, s.add.s);
  const add = tcClockAdd({ date: addDate, clock: addClock, deltaSeconds: s.add.op * addDuration, zone });

  const order = tcWeekOrder(s.week.weekend);
  const weeklyThreshold = n(s.week.weeklyH) * 3600;
  const dailyThreshold = n(s.week.dailyH) * 3600;
  const multiplier = Math.max(1, n(s.week.mult) || 1);
  const week = tcWorkWeek({
    days: s.week.days.map((d) => ({ on: d.on, start: clockOf(d.start, 9 * 3600), end: clockOf(d.end, 17 * 3600), breakSeconds: n(d.brk) * 60 })),
    order,
    basis: s.week.basis,
    weeklyThresholdSeconds: weeklyThreshold,
    dailyThresholdSeconds: dailyThreshold,
    overtimeMultiplier: multiplier,
  });

  const decSeconds = s.dec.dir === "toHms" ? Math.max(0, tcFromDecimalHours(n(s.dec.decimal)) || 0) : secondsOf(s.dec.h, s.dec.m, s.dec.s);
  const dec = {
    seconds: decSeconds,
    decimal: tcToDecimalHours(decSeconds, 4),
    decimal2: tcToDecimalHours(decSeconds, 2),
    minutes: decSeconds / 60,
    rounded: {
      down: tcRoundDuration(decSeconds, s.dec.inc, "down"),
      nearest: tcRoundDuration(decSeconds, s.dec.inc, "nearest"),
      up: tcRoundDuration(decSeconds, s.dec.inc, "up"),
    },
  };

  const primarySeconds =
    s.mode === "sum" ? sheet.totalSeconds : s.mode === "span" ? span.netSeconds : s.mode === "add" ? addDuration * s.add.op : s.mode === "week" ? week.totalSeconds : dec.seconds;

  return {
    zone,
    rowSeconds,
    sheet,
    spanStartDate,
    spanStart,
    spanEnd,
    span,
    addDate,
    addClock,
    addDuration,
    add,
    order,
    weeklyThreshold,
    dailyThreshold,
    multiplier,
    week,
    dec,
    primarySeconds,
  };
}

export type Derived = ReturnType<typeof derive>;

export function useDerived(s: TcState) {
  return useMemo(() => derive(s), [s]);
}

/* ── Formatting ─────────────────────────────────────────────────────────────────── */

export function makeFmt(locale: string, h12: boolean) {
  const loc = `${locale}-u-nu-latn`;
  const clockFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", hour: "numeric", minute: "2-digit", hourCycle: h12 ? "h12" : "h23" });
  const clockSecFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", hour: "numeric", minute: "2-digit", second: "2-digit", hourCycle: h12 ? "h12" : "h23" });
  const dateFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const shortDateFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", day: "numeric", month: "short" });
  const wdFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", weekday: "short" });
  const monthFmt = new Intl.DateTimeFormat(loc, { timeZone: "UTC", month: "short" });
  const nf = (digits: number) => new Intl.NumberFormat(loc, { maximumFractionDigits: digits });
  const nf2 = nf(2);
  const zoneTime = (zone: string) => new Intl.DateTimeFormat(loc, { timeZone: zone, day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hourCycle: h12 ? "h12" : "h23" });
  const norm = (sec: number) => ((Math.round(sec) % 86400) + 86400) % 86400;
  return {
    locale,
    h12,
    /** Clock time of day (seconds since midnight), in the chosen 12 h / 24 h style. */
    clock: (sec: number) => (norm(sec) % 60 ? clockSecFmt : clockFmt).format(norm(sec) * 1000),
    date: (d: CivilDate) => dateFmt.format(civilToUtcMs(d)),
    shortDate: (d: CivilDate) => shortDateFmt.format(civilToUtcMs(d)),
    month: (m: number) => monthFmt.format(Date.UTC(2026, m, 1)),
    /** Instant in a zone (or floating UTC). */
    instant: (ms: number, zone: string | null) => zoneTime(zone || "UTC").format(ms),
    /** Weekday name for 0 = Sunday … 6 = Saturday. */
    weekday: (d: number) => wdFmt.format(Date.UTC(2026, 0, 4 + d)),
    dur: (sec: number) => tcFormatHms(sec),
    durHm: (sec: number) => tcFormatHms(sec, false),
    signedDur: (sec: number) => (sec > 0 ? `+${tcFormatHms(sec)}` : sec < 0 ? tcFormatHms(sec) : "±0:00:00"),
    hours: (sec: number, digits = 2) => nf(digits).format(sec / 3600),
    num: (v: number, digits = 2) => (digits === 2 ? nf2 : nf(digits)).format(v),
    offset: (min: number) => formatOffset(min).replace("-", "−"),
  };
}

export type Fmt = ReturnType<typeof makeFmt>;

/** Props shared by the indicator cards. */
export type CardProps = { s: TcState; set: (patch: Partial<TcState>) => void; d: Derived; f: Fmt };

/** Colours shared by the drawings (Blueprint-friendly, readable in light and dark). */
export const C = { add: "#10b981", sub: "#ef4444", main: "#2563eb", ot: "#f59e0b", dst: "#8b5cf6", night: "#475569" } as const;
