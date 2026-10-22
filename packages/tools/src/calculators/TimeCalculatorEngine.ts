/**
 * Time calculator engine (pure, no DOM): timesheet sums of signed h:m:s durations, time between
 * two clock times (overnight shifts, multi-day spans, real DST-aware elapsed time in an IANA zone),
 * clock time ± duration with day offset, a work week with overtime, and decimal-hour payroll
 * conversion with rounding. Time-zone maths goes through DateTimeCore (Intl only, no offsets
 * hardcoded), so a night shift across a DST change comes out one hour longer or shorter.
 */
import {
  civilToUtcMs,
  findOffsetTransitions,
  isValidIanaZone,
  utcMsToCivil,
  weekendDays,
  zoneOffsetMinutes,
  zonedParts,
  zonedToUtc,
  type CivilDate,
  type DstTransition,
  type WeekendPreset,
  type ZonedParts,
} from "./DateTimeCore";

const DAY_S = 86_400;
const DAY_MS = 86_400_000;

/* ── Durations ───────────────────────────────────────────────────────────────────── */

export type TcSign = 1 | -1;
export type TcHms = { negative: boolean; hours: number; minutes: number; seconds: number };

/** h, m, s (any non-negative numbers; minutes/seconds above 59 carry) → whole seconds, or NaN. */
export function tcHmsToSeconds(hours: number, minutes: number, seconds: number): number {
  const parts = [hours, minutes, seconds];
  if (parts.some((v) => !Number.isFinite(v) || v < 0)) return NaN;
  return Math.round(hours * 3600 + minutes * 60 + seconds);
}

/** Whole seconds → sign + hours (unbounded) + minutes + seconds. */
export function tcSplit(totalSeconds: number): TcHms {
  const s = Math.round(totalSeconds);
  const abs = Math.abs(s);
  return { negative: s < 0, hours: Math.floor(abs / 3600), minutes: Math.floor((abs % 3600) / 60), seconds: abs % 60 };
}

/** "−7:05:00" / "7:05" (hours unbounded, minus sign U+2212). */
export function tcFormatHms(totalSeconds: number, withSeconds = true): string {
  const p = tcSplit(totalSeconds);
  const mm = String(p.minutes).padStart(2, "0");
  const ss = String(p.seconds).padStart(2, "0");
  return `${p.negative ? "−" : ""}${p.hours}:${mm}${withSeconds ? `:${ss}` : ""}`;
}

/** Parses "7:45", "7:45:30", "-1:30", "+0:45:00" (minutes/seconds 0–59) → signed seconds, or null. */
export function tcParseHms(text: string): number | null {
  const m = /^\s*([+\-−]?)\s*(\d{1,6})(?::([0-5]?\d))?(?::([0-5]?\d))?\s*$/.exec(text);
  if (!m) return null;
  const secs = Number(m[2]) * 3600 + Number(m[3] ?? 0) * 60 + Number(m[4] ?? 0);
  return m[1] === "-" || m[1] === "−" ? -secs : secs;
}

/** Parses a clock time "HH:MM" or "HH:MM:SS" (00:00–23:59:59) → seconds since midnight, or null. */
export function tcParseClock(text: string): number | null {
  const m = /^\s*([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\s*$/.exec(text);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] ?? 0);
}

/** Seconds since midnight → "HH:MM" (24 h) or "h:MM AM/PM" (12 h); seconds shown only when non-zero or asked. */
export function tcFormatClock(secondsOfDay: number, h12 = false, withSeconds = false): string {
  const s = ((Math.round(secondsOfDay) % DAY_S) + DAY_S) % DAY_S;
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = s % 60;
  const tail = withSeconds || sec ? `:${String(sec).padStart(2, "0")}` : "";
  if (!h12) return `${String(h).padStart(2, "0")}:${mm}${tail}`;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${mm}${tail} ${h < 12 ? "AM" : "PM"}`;
}

/* ── Timesheet (several signed entries summed) ───────────────────────────────────── */

export type TcEntry = { sign: TcSign; seconds: number };
export type TcSheet = {
  totalSeconds: number;
  addedSeconds: number;
  subtractedSeconds: number;
  /** Running total after each entry (same order as the input). */
  running: number[];
  count: number;
};

export function tcSumEntries(entries: readonly TcEntry[]): TcSheet {
  let total = 0;
  let added = 0;
  let subtracted = 0;
  const running: number[] = [];
  for (const e of entries) {
    const v = Number.isFinite(e.seconds) ? Math.max(0, Math.round(e.seconds)) : 0;
    if (e.sign === -1) subtracted += v;
    else added += v;
    total += e.sign * v;
    running.push(total);
  }
  return { totalSeconds: total, addedSeconds: added, subtractedSeconds: subtracted, running, count: entries.length };
}

/* ── Decimal hours (payroll) ─────────────────────────────────────────────────────── */

/** Seconds → decimal hours rounded to `places` (e.g. 7:45:00 → 7.75, 8:20 → 8.33). */
export function tcToDecimalHours(totalSeconds: number, places = 2): number {
  const f = 10 ** places;
  return Math.round((totalSeconds / 3600) * f) / f;
}

/** Decimal hours → whole seconds (e.g. 7.75 → 27 900 s = 7:45:00, 1.1 → 1:06:00). */
export function tcFromDecimalHours(decimalHours: number): number {
  return Number.isFinite(decimalHours) ? Math.round(decimalHours * 3600) : NaN;
}

export type TcRoundMode = "nearest" | "up" | "down";

/**
 * Payroll rounding of a duration to an increment in minutes (1, 5, 6 = 0.1 h, 15 = quarter hour).
 * "nearest" rounds half up — for 15 minutes this is the US "7-minute rule" (7 min down, 8 min up).
 */
export function tcRoundDuration(totalSeconds: number, incrementMinutes: number, mode: TcRoundMode = "nearest"): number {
  const inc = Math.max(1, Math.round(incrementMinutes)) * 60;
  const abs = Math.abs(totalSeconds);
  const q = abs / inc;
  const n = mode === "up" ? Math.ceil(q - 1e-9) : mode === "down" ? Math.floor(q + 1e-9) : Math.floor(q + 0.5);
  return Math.sign(totalSeconds || 1) * n * inc;
}

/* ── Zones ───────────────────────────────────────────────────────────────────────── */

export type TcZoneStatus = "ok" | "gap" | "overlap";

const clockParts = (date: CivilDate, clock: number): ZonedParts => ({
  ...date,
  hour: Math.floor(clock / 3600),
  minute: Math.floor((clock % 3600) / 60),
  second: clock % 60,
});

/** Wall time (date + seconds of day) → a UTC instant: in `zone` when it is a valid IANA zone, else as floating (UTC) time. */
function resolveWall(date: CivilDate, clock: number, zone: string | null | undefined) {
  const wallMs = civilToUtcMs(date) + clock * 1000;
  if (!zone || !isValidIanaZone(zone)) return { utcMs: wallMs, status: "ok" as TcZoneStatus, offsetMinutes: 0, zoned: false };
  const r = zonedToUtc(clockParts(date, clock), zone);
  return { utcMs: r.utcMs, status: r.status as TcZoneStatus, offsetMinutes: zoneOffsetMinutes(r.utcMs, zone), zoned: true };
}

/** Offset changes (DST or zone rule changes) in `zone` within [fromUtc, toUtc]. */
export function tcTransitionsBetween(zone: string | null | undefined, fromUtc: number, toUtc: number): DstTransition[] {
  if (!zone || !isValidIanaZone(zone)) return [];
  const lo = Math.min(fromUtc, toUtc);
  const hi = Math.max(fromUtc, toUtc);
  const y0 = new Date(lo).getUTCFullYear();
  const y1 = new Date(hi).getUTCFullYear();
  const out: DstTransition[] = [];
  for (let y = y0; y <= y1 && y - y0 < 5; y++) {
    for (const tr of findOffsetTransitions(zone, y)) if (tr.utcMs > lo && tr.utcMs <= hi) out.push(tr);
  }
  return out;
}

/* ── Time between two clock times ────────────────────────────────────────────────── */

export type TcSpanInput = {
  startDate: CivilDate;
  /** Seconds since midnight. */
  startClock: number;
  endClock: number;
  /** Explicit end date; when omitted the end is the same day, or the next day when the end clock is not after the start (overnight). */
  endDate?: CivilDate | null;
  /** IANA zone for real elapsed time across DST changes; omitted/invalid = floating clock time. */
  zone?: string | null;
  /** Unpaid break subtracted from the elapsed time. */
  breakSeconds?: number;
};

export type TcSpanResult = {
  endDate: CivilDate;
  /** Calendar days between the start and end dates (1 for an overnight shift). */
  dayOffset: number;
  /** Difference of the two wall-clock readings (what a naive clock subtraction gives). */
  wallSeconds: number;
  /** Real elapsed time in the zone (wall ± DST changes in between). */
  elapsedSeconds: number;
  /** elapsed − wall: +3600 when clocks went back during the span, −3600 when they went forward. */
  dstDeltaSeconds: number;
  /** Elapsed minus the break (never below zero for a forward span). */
  netSeconds: number;
  breakSeconds: number;
  startStatus: TcZoneStatus;
  endStatus: TcZoneStatus;
  startOffsetMinutes: number;
  endOffsetMinutes: number;
  startUtcMs: number;
  endUtcMs: number;
  transitions: DstTransition[];
  /** True when an explicit end lies before the start. */
  negative: boolean;
  zoned: boolean;
};

export function tcClockSpan(input: TcSpanInput): TcSpanResult {
  const { startDate, startClock, endClock } = input;
  const endDate = input.endDate ?? (endClock > startClock ? startDate : utcMsToCivil(civilToUtcMs(startDate) + DAY_MS));
  const breakSeconds = Math.max(0, Math.round(input.breakSeconds ?? 0));
  const a = resolveWall(startDate, startClock, input.zone);
  const b = resolveWall(endDate, endClock, input.zone);
  const wallSeconds = (civilToUtcMs(endDate) - civilToUtcMs(startDate)) / 1000 + endClock - startClock;
  const elapsedSeconds = Math.round((b.utcMs - a.utcMs) / 1000);
  const negative = elapsedSeconds < 0;
  return {
    endDate,
    dayOffset: Math.round((civilToUtcMs(endDate) - civilToUtcMs(startDate)) / DAY_MS),
    wallSeconds,
    elapsedSeconds,
    dstDeltaSeconds: elapsedSeconds - wallSeconds,
    netSeconds: negative ? elapsedSeconds : Math.max(0, elapsedSeconds - breakSeconds),
    breakSeconds,
    startStatus: a.status,
    endStatus: b.status,
    startOffsetMinutes: a.offsetMinutes,
    endOffsetMinutes: b.offsetMinutes,
    startUtcMs: a.utcMs,
    endUtcMs: b.utcMs,
    transitions: tcTransitionsBetween(input.zone, a.utcMs, b.utcMs),
    negative,
    zoned: a.zoned,
  };
}

/* ── Clock time ± duration ───────────────────────────────────────────────────────── */

export type TcClockAddInput = {
  date: CivilDate;
  clock: number;
  /** Signed duration in seconds (negative = subtract). */
  deltaSeconds: number;
  zone?: string | null;
};

export type TcClockAddResult = {
  resultDate: CivilDate;
  /** Seconds since midnight of the resulting wall-clock time. */
  resultClock: number;
  /** Calendar days from the start date (+1 = next day, −1 = previous day). */
  dayOffset: number;
  /** The naive wall-clock answer (start reading + duration, ignoring DST). */
  naiveDate: CivilDate;
  naiveClock: number;
  /** Real result − naive result: −3600 when clocks went back inside the interval, +3600 when they went forward. */
  dstDeltaSeconds: number;
  startStatus: TcZoneStatus;
  startOffsetMinutes: number;
  endOffsetMinutes: number;
  startUtcMs: number;
  endUtcMs: number;
  transitions: DstTransition[];
  zoned: boolean;
};

export function tcClockAdd(input: TcClockAddInput): TcClockAddResult {
  const a = resolveWall(input.date, input.clock, input.zone);
  const delta = Math.round(input.deltaSeconds);
  const endUtcMs = a.utcMs + delta * 1000;
  let resultDate: CivilDate;
  let resultClock: number;
  let endOffsetMinutes = 0;
  if (a.zoned && input.zone) {
    const p = zonedParts(endUtcMs, input.zone);
    resultDate = { year: p.year, month: p.month, day: p.day };
    resultClock = p.hour * 3600 + p.minute * 60 + p.second;
    endOffsetMinutes = zoneOffsetMinutes(endUtcMs, input.zone);
  } else {
    resultDate = utcMsToCivil(endUtcMs);
    resultClock = Math.round((endUtcMs - civilToUtcMs(resultDate)) / 1000);
  }
  const naiveMs = civilToUtcMs(input.date) + (input.clock + delta) * 1000;
  const naiveDate = utcMsToCivil(naiveMs);
  const naiveClock = Math.round((naiveMs - civilToUtcMs(naiveDate)) / 1000);
  const realWallMs = civilToUtcMs(resultDate) + resultClock * 1000;
  return {
    resultDate,
    resultClock,
    dayOffset: Math.round((civilToUtcMs(resultDate) - civilToUtcMs(input.date)) / DAY_MS),
    naiveDate,
    naiveClock,
    dstDeltaSeconds: Math.round((realWallMs - naiveMs) / 1000),
    startStatus: a.status,
    startOffsetMinutes: a.offsetMinutes,
    endOffsetMinutes,
    startUtcMs: a.utcMs,
    endUtcMs,
    transitions: tcTransitionsBetween(input.zone, a.utcMs, endUtcMs),
    zoned: a.zoned,
  };
}

/* ── Work week with overtime ─────────────────────────────────────────────────────── */

export type TcWorkDay = {
  on: boolean;
  /** Seconds since midnight; an end at or before the start is an overnight shift. */
  start: number;
  end: number;
  breakSeconds: number;
};

export type TcOvertimeBasis = "weekly" | "daily";

export type TcWeekInput = {
  /** Seven days indexed by weekday (0 = Sunday … 6 = Saturday). */
  days: readonly TcWorkDay[];
  /** Order in which days are counted (weekly overtime lands on the days after the threshold is crossed). */
  order?: readonly number[];
  basis: TcOvertimeBasis;
  weeklyThresholdSeconds: number;
  dailyThresholdSeconds: number;
  /** Pay multiplier for overtime hours (1.5 = time and a half). */
  overtimeMultiplier: number;
};

export type TcWeekDayResult = {
  weekday: number;
  on: boolean;
  spanSeconds: number;
  workedSeconds: number;
  overnight: boolean;
  regularSeconds: number;
  overtimeSeconds: number;
};

export type TcWeekResult = {
  /** In counting order. */
  days: TcWeekDayResult[];
  totalSeconds: number;
  regularSeconds: number;
  overtimeSeconds: number;
  workDays: number;
  averageSeconds: number;
  /** Regular + overtime × multiplier: the hours the week is paid as. */
  paidEquivalentSeconds: number;
  longestWeekday: number | null;
};

/** Counting order for a weekend preset: Fri–Sat weeks start on Sunday, Sat–Sun weeks on Monday. */
export function tcWeekOrder(preset: WeekendPreset): number[] {
  return preset === "fri-sat" ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];
}

/** Which weekdays are work days by default for a weekend preset. */
export function tcDefaultWorkDays(preset: WeekendPreset): boolean[] {
  const off = weekendDays(preset);
  return Array.from({ length: 7 }, (_, i) => !off.includes(i));
}

export function tcWorkWeek(input: TcWeekInput): TcWeekResult {
  const order = input.order && input.order.length === 7 ? input.order : [0, 1, 2, 3, 4, 5, 6];
  const weekly = Math.max(0, input.weeklyThresholdSeconds);
  const daily = Math.max(0, input.dailyThresholdSeconds);
  let cumulative = 0;
  const days: TcWeekDayResult[] = order.map((weekday) => {
    const d = input.days[weekday];
    if (!d || !d.on) return { weekday, on: false, spanSeconds: 0, workedSeconds: 0, overnight: false, regularSeconds: 0, overtimeSeconds: 0 };
    const overnight = d.end <= d.start;
    const spanSeconds = d.end - d.start + (overnight ? DAY_S : 0);
    const workedSeconds = Math.max(0, spanSeconds - Math.max(0, d.breakSeconds));
    let overtimeSeconds: number;
    if (input.basis === "daily") overtimeSeconds = Math.max(0, workedSeconds - daily);
    else overtimeSeconds = Math.max(0, cumulative + workedSeconds - Math.max(weekly, cumulative));
    cumulative += workedSeconds;
    return { weekday, on: true, spanSeconds, workedSeconds, overnight, regularSeconds: workedSeconds - overtimeSeconds, overtimeSeconds };
  });
  const totalSeconds = days.reduce((s, d) => s + d.workedSeconds, 0);
  const overtimeSeconds = days.reduce((s, d) => s + d.overtimeSeconds, 0);
  const regularSeconds = totalSeconds - overtimeSeconds;
  const workDays = days.filter((d) => d.on).length;
  const longest = days.reduce<TcWeekDayResult | null>((best, d) => (d.on && (!best || d.workedSeconds > best.workedSeconds) ? d : best), null);
  return {
    days,
    totalSeconds,
    regularSeconds,
    overtimeSeconds,
    workDays,
    averageSeconds: workDays ? Math.round(totalSeconds / workDays) : 0,
    paidEquivalentSeconds: Math.round(regularSeconds + overtimeSeconds * Math.max(1, input.overtimeMultiplier)),
    longestWeekday: longest ? longest.weekday : null,
  };
}
