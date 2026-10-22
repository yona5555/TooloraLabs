/**
 * Shared pure date/time logic for the date-time tools: Hijri (Umm al-Qura)
 * conversion via the built-in Intl calendar, IANA time-zone offsets and DST
 * transitions via Intl (never hardcoded offsets), business-day counting with a
 * selectable weekend, and leap-year helpers. No DOM, no clocks read here.
 */

export type HijriDate = { year: number; month: number; day: number };
export type CivilDate = { year: number; month: number; day: number };
export type WeekendPreset = "fri-sat" | "sat-sun";

const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// Gregorian helpers
// ---------------------------------------------------------------------------

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/** Leap days (Feb 29) falling within [start, end] inclusive, UTC calendar days. */
export function countLeapDays(start: CivilDate, end: CivilDate): number {
  let count = 0;
  for (let y = start.year; y <= end.year; y++) {
    if (!isLeapYear(y)) continue;
    const t = Date.UTC(y, 1, 29);
    if (t >= civilToUtcMs(start) && t <= civilToUtcMs(end)) count++;
  }
  return count;
}

export function civilToUtcMs(d: CivilDate): number {
  return Date.UTC(d.year, d.month - 1, d.day);
}

export function utcMsToCivil(ms: number): CivilDate {
  const d = new Date(ms);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** Parse "YYYY-MM-DD" into a civil date, or null when invalid. */
export function parseCivilDate(value: string): CivilDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function formatIsoDate(d: CivilDate): string {
  return `${String(d.year).padStart(4, "0")}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

/** 0 = Sunday … 6 = Saturday. */
export function civilWeekday(d: CivilDate): number {
  return new Date(civilToUtcMs(d)).getUTCDay();
}

// ---------------------------------------------------------------------------
// Hijri (Umm al-Qura) via Intl
// ---------------------------------------------------------------------------

let hijriFormatter: Intl.DateTimeFormat | null = null;

function getHijriFormatter(): Intl.DateTimeFormat {
  if (!hijriFormatter) {
    hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }
  return hijriFormatter;
}

/** True when the runtime's Intl supports the Umm al-Qura calendar. */
export function isHijriSupported(): boolean {
  try {
    const parts = getHijriFormatter().formatToParts(new Date(Date.UTC(2026, 9, 17)));
    return parts.some((p) => p.type === "year" && p.value.startsWith("1448"));
  } catch {
    return false;
  }
}

export function gregorianToHijri(d: CivilDate): HijriDate {
  const parts = getHijriFormatter().formatToParts(new Date(civilToUtcMs(d)));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value.replace(/\D/g, ""));
  return { year: get("year"), month: get("month"), day: get("day") };
}

function compareHijri(a: HijriDate, b: HijriDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/**
 * Converts an Umm al-Qura date to Gregorian, or null when the Hijri date does
 * not exist (e.g. day 30 of a 29-day month).
 */
export function hijriToGregorian(h: HijriDate): CivilDate | null {
  if (h.month < 1 || h.month > 12 || h.day < 1 || h.day > 30) return null;
  // Mean-month estimate (epoch 1 Muharram 1 AH ≈ 622-07-19 UTC), then walk.
  const epoch = Date.UTC(622, 6, 19);
  const meanMonth = 29.530588853;
  const estimate = epoch + Math.round(((h.year - 1) * 12 + (h.month - 1)) * meanMonth + (h.day - 1)) * DAY_MS;
  let ms = estimate;
  for (let i = 0; i < 40; i++) {
    const cur = gregorianToHijri(utcMsToCivil(ms));
    const cmp = compareHijri(cur, h);
    if (cmp === 0) return utcMsToCivil(ms);
    // Step by the estimated day distance, at least one day.
    const diff =
      (h.year - cur.year) * 354 + (h.month - cur.month) * 29.5 + (h.day - cur.day);
    const step = Math.sign(diff) * Math.max(1, Math.floor(Math.abs(diff)));
    ms += step * DAY_MS;
  }
  // Fine scan around the estimate (handles invalid day 30).
  for (let off = -3; off <= 3; off++) {
    const t = ms + off * DAY_MS;
    if (compareHijri(gregorianToHijri(utcMsToCivil(t)), h) === 0) return utcMsToCivil(t);
  }
  return null;
}

/** Length (29 or 30) of a Hijri month in the Umm al-Qura calendar. */
export function hijriMonthLength(year: number, month: number): number {
  return hijriToGregorian({ year, month, day: 30 }) ? 30 : 29;
}

// ---------------------------------------------------------------------------
// Time zones and DST via Intl
// ---------------------------------------------------------------------------

const zoneFormatters = new Map<string, Intl.DateTimeFormat>();

function getZoneFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = zoneFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    zoneFormatters.set(timeZone, f);
  }
  return f;
}

export function isValidIanaZone(timeZone: string): boolean {
  try {
    getZoneFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

export type ZonedParts = CivilDate & { hour: number; minute: number; second: number };

/** Wall-clock parts of an instant in a zone. */
export function zonedParts(utcMs: number, timeZone: string): ZonedParts {
  const parts = getZoneFormatter(timeZone).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** UTC offset of a zone at an instant, in minutes (e.g. +180 for Riyadh). */
export function zoneOffsetMinutes(utcMs: number, timeZone: string): number {
  const p = zonedParts(utcMs, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const floored = Math.floor(utcMs / 1000) * 1000;
  return Math.round((asUtc - floored) / 60_000);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

export type ZonedResolution = {
  utcMs: number;
  /** "ok" exact; "gap" wall time skipped by DST (shifted forward); "overlap" ambiguous (earlier instant chosen). */
  status: "ok" | "gap" | "overlap";
};

/** Converts a wall-clock time in a zone to a UTC instant, handling DST gaps and overlaps. */
export function zonedToUtc(local: ZonedParts, timeZone: string): ZonedResolution {
  const wall = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
  const candidates = new Set<number>();
  for (const probe of [wall - DAY_MS, wall, wall + DAY_MS]) {
    candidates.add(wall - zoneOffsetMinutes(probe, timeZone) * 60_000);
  }
  const matches = [...candidates]
    .filter((t) => {
      const p = zonedParts(t, timeZone);
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) === wall;
    })
    .sort((a, b) => a - b);
  if (matches.length === 1) return { utcMs: matches[0], status: "ok" };
  if (matches.length > 1) return { utcMs: matches[0], status: "overlap" };
  // Gap: use the offset in effect before the transition, which lands after it.
  const before = zoneOffsetMinutes(wall - DAY_MS, timeZone);
  return { utcMs: wall - before * 60_000, status: "gap" };
}

export type DstTransition = { utcMs: number; offsetBefore: number; offsetAfter: number };

/** DST/offset transitions of a zone within a Gregorian year (empty when none). */
export function findOffsetTransitions(timeZone: string, year: number): DstTransition[] {
  const out: DstTransition[] = [];
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  let t = start;
  let prev = zoneOffsetMinutes(t, timeZone);
  while (t < end) {
    const next = Math.min(t + DAY_MS, end);
    const off = zoneOffsetMinutes(next, timeZone);
    if (off !== prev) {
      let lo = t;
      let hi = next;
      while (hi - lo > 60_000) {
        const mid = Math.floor((lo + hi) / 2 / 60_000) * 60_000;
        if (zoneOffsetMinutes(mid, timeZone) === prev) lo = mid;
        else hi = mid;
      }
      out.push({ utcMs: hi, offsetBefore: prev, offsetAfter: off });
      prev = off;
    }
    t = next;
  }
  return out;
}

export function isDstActive(utcMs: number, timeZone: string): boolean {
  const year = zonedParts(utcMs, timeZone).year;
  const jan = zoneOffsetMinutes(Date.UTC(year, 0, 1), timeZone);
  const jul = zoneOffsetMinutes(Date.UTC(year, 6, 1), timeZone);
  if (jan === jul) return false;
  return zoneOffsetMinutes(utcMs, timeZone) === Math.max(jan, jul);
}

// ---------------------------------------------------------------------------
// Business days
// ---------------------------------------------------------------------------

export function weekendDays(preset: WeekendPreset): readonly number[] {
  return preset === "fri-sat" ? [5, 6] : [6, 0];
}

export function defaultWeekendForLocale(locale: string): WeekendPreset {
  return locale.startsWith("ar") ? "fri-sat" : "sat-sun";
}

export type BusinessDayCount = {
  calendarDays: number;
  businessDays: number;
  weekendDays: number;
  holidays: number;
};

/**
 * Counts days in [start, end) (end exclusive, like a difference) split into
 * business days, weekend days and listed holidays that fall on workdays.
 * Order of inputs does not matter.
 */
export function countBusinessDays(
  a: CivilDate,
  b: CivilDate,
  weekend: WeekendPreset,
  holidays: readonly string[] = [],
): BusinessDayCount {
  const [s, e] = civilToUtcMs(a) <= civilToUtcMs(b) ? [a, b] : [b, a];
  const startMs = civilToUtcMs(s);
  const total = Math.round((civilToUtcMs(e) - startMs) / DAY_MS);
  const off = new Set(weekendDays(weekend));
  const holidaySet = new Set(holidays);
  let business = 0;
  let weekendCount = 0;
  let holidayCount = 0;
  const startDow = civilWeekday(s);
  for (let i = 0; i < total; i++) {
    const dow = (startDow + i) % 7;
    if (off.has(dow)) {
      weekendCount++;
      continue;
    }
    if (holidaySet.size && holidaySet.has(formatIsoDate(utcMsToCivil(startMs + i * DAY_MS)))) {
      holidayCount++;
      continue;
    }
    business++;
  }
  return { calendarDays: total, businessDays: business, weekendDays: weekendCount, holidays: holidayCount };
}

/** Adds (or subtracts, when n < 0) business days, skipping weekends and holidays. */
export function addBusinessDays(
  start: CivilDate,
  n: number,
  weekend: WeekendPreset,
  holidays: readonly string[] = [],
): CivilDate {
  const off = new Set(weekendDays(weekend));
  const holidaySet = new Set(holidays);
  const dir = n < 0 ? -1 : 1;
  let remaining = Math.abs(Math.trunc(n));
  let ms = civilToUtcMs(start);
  while (remaining > 0) {
    ms += dir * DAY_MS;
    const d = utcMsToCivil(ms);
    if (off.has(civilWeekday(d)) || holidaySet.has(formatIsoDate(d))) continue;
    remaining--;
  }
  return utcMsToCivil(ms);
}
