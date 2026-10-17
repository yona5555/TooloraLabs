/**
 * Pure logic for the Date Calculator: calendar differences (Y/M/D, days, weeks), business days
 * with a selectable weekend and a holiday list, adding/subtracting calendar units or business
 * days with month-end clamping, and Hijri (Umm al-Qura) input/difference. Built on the shared
 * DateTimeCore helpers; all arithmetic is on UTC civil days (no local-time DST drift).
 */
import {
  addBusinessDays,
  civilToUtcMs,
  civilWeekday,
  countBusinessDays,
  countLeapDays,
  daysInMonth,
  formatIsoDate,
  gregorianToHijri,
  hijriMonthLength,
  hijriToGregorian,
  isLeapYear,
  parseCivilDate,
  utcMsToCivil,
  type BusinessDayCount,
  type CivilDate,
  type HijriDate,
  type WeekendPreset,
} from "./DateTimeCore";

const DAY_MS = 86_400_000;

export type DateSpanUnit = "days" | "weeks" | "months" | "years" | "businessDays";
export type YmdSpan = { years: number; months: number; days: number };

export function compareCivilDates(a: CivilDate, b: CivilDate): number {
  return civilToUtcMs(a) - civilToUtcMs(b);
}

/** Calendar days from a to b (negative when b is earlier). */
export function diffCivilDays(a: CivilDate, b: CivilDate): number {
  return Math.round((civilToUtcMs(b) - civilToUtcMs(a)) / DAY_MS);
}

export function addCivilDays(d: CivilDate, n: number): CivilDate {
  return utcMsToCivil(civilToUtcMs(d) + Math.trunc(n) * DAY_MS);
}

export type MonthAddResult = {
  date: CivilDate;
  /** True when the day did not exist in the target month and was moved to its last day. */
  clamped: boolean;
  /** The day number that was asked for (e.g. 31 for "Jan 31 + 1 month"). */
  requestedDay: number;
  /** Length of the target month (28, 29, 30 or 31). */
  monthLength: number;
};

/** Adds whole months, keeping the day number and clamping to the month's last day when needed. */
export function addMonthsClamped(d: CivilDate, n: number): MonthAddResult {
  const index = d.year * 12 + (d.month - 1) + Math.trunc(n);
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  const monthLength = daysInMonth(year, month);
  const day = Math.min(d.day, monthLength);
  return { date: { year, month, day }, clamped: day !== d.day, requestedDay: d.day, monthLength };
}

/**
 * Calendar difference in years, months and days from the earlier to the later date: the largest
 * whole number of months whose (clamped) anniversary does not pass the later date, then the days.
 */
export function calendarDiffYmd(a: CivilDate, b: CivilDate): YmdSpan {
  const [s, e] = compareCivilDates(a, b) <= 0 ? [a, b] : [b, a];
  let months = (e.year - s.year) * 12 + (e.month - s.month);
  if (months > 0 && compareCivilDates(addMonthsClamped(s, months).date, e) > 0) months--;
  const anchor = addMonthsClamped(s, months).date;
  return { years: Math.floor(months / 12), months: months % 12, days: diffCivilDays(anchor, e) };
}

/** Difference counted in the Umm al-Qura calendar (Hijri years, months, days). */
export function hijriDiffYmd(a: CivilDate, b: CivilDate): YmdSpan {
  const [s, e] = compareCivilDates(a, b) <= 0 ? [a, b] : [b, a];
  const hs = gregorianToHijri(s);
  const he = gregorianToHijri(e);
  let years = he.year - hs.year;
  let months = he.month - hs.month;
  let days = he.day - hs.day;
  if (days < 0) {
    months--;
    const pm = he.month === 1 ? 12 : he.month - 1;
    const py = he.month === 1 ? he.year - 1 : he.year;
    days += hijriMonthLength(py, pm);
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

/** Counts of each weekday (0 = Sunday … 6 = Saturday) in [start, endExclusive). */
export function weekdayCountsInRange(start: CivilDate, endExclusive: CivilDate): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const total = Math.max(0, diffCivilDays(start, endExclusive));
  const full = Math.floor(total / 7);
  for (let i = 0; i < 7; i++) counts[i] = full;
  const dow = civilWeekday(start);
  for (let i = 0; i < total % 7; i++) counts[(dow + i) % 7]++;
  return counts;
}

export type HolidayParse = { valid: string[]; invalid: string[] };

/** Parses a free list of ISO dates (commas, spaces, new lines), de-duplicated and sorted. */
export function parseHolidayList(text: string): HolidayParse {
  const valid = new Set<string>();
  const invalid: string[] = [];
  for (const token of text.split(/[\s,;]+/)) {
    if (!token) continue;
    const c = parseCivilDate(token);
    if (c) valid.add(formatIsoDate(c));
    else invalid.push(token);
  }
  return { valid: [...valid].sort(), invalid };
}

/** Hijri day/month/year fields to a Gregorian date, or null when the Hijri date does not exist. */
export function hijriFieldsToCivil(year: number, month: number, day: number): CivilDate | null {
  if (![year, month, day].every(Number.isInteger) || year < 1300 || year > 1600) return null;
  if (month < 1 || month > 12 || day < 1 || day > 30) return null;
  return hijriToGregorian({ year, month, day });
}

// ---------------------------------------------------------------------------
// Difference between two dates
// ---------------------------------------------------------------------------

export type DateSpanInput = {
  start: CivilDate;
  end: CivilDate;
  /** Count the end date itself (Jan 1 → Jan 31 = 31 days instead of 30). */
  includeEnd: boolean;
  weekend: WeekendPreset;
  holidays?: readonly string[];
};

export type DateSpanReport = {
  earlier: CivilDate;
  later: CivilDate;
  isEndBeforeStart: boolean;
  includeEnd: boolean;
  /** First day after the counted range (later, or later + 1 when the end date is included). */
  endExclusive: CivilDate;
  /** Last counted day, or null for an empty range. */
  lastCounted: CivilDate | null;
  totalDays: number;
  weeks: number;
  weekRemainderDays: number;
  ymd: YmdSpan;
  hijri: YmdSpan;
  business: BusinessDayCount;
  /** Listed holidays inside the range that fall on a weekend (not deducted twice). */
  holidaysOnWeekend: number;
  leapDays: number;
  weekdayCounts: number[];
};

export function computeDateSpan(input: DateSpanInput): DateSpanReport {
  const isEndBeforeStart = compareCivilDates(input.end, input.start) < 0;
  const [earlier, later] = isEndBeforeStart ? [input.end, input.start] : [input.start, input.end];
  const endExclusive = input.includeEnd ? addCivilDays(later, 1) : later;
  const totalDays = diffCivilDays(earlier, endExclusive);
  const lastCounted = totalDays > 0 ? addCivilDays(endExclusive, -1) : null;
  const holidays = input.holidays ?? [];
  const business = countBusinessDays(earlier, endExclusive, input.weekend, holidays);
  const weekendSet = new Set(input.weekend === "fri-sat" ? [5, 6] : [6, 0]);
  const lo = civilToUtcMs(earlier);
  const hi = civilToUtcMs(endExclusive);
  let holidaysOnWeekend = 0;
  for (const h of new Set(holidays)) {
    const c = parseCivilDate(h);
    if (!c) continue;
    const t = civilToUtcMs(c);
    if (t >= lo && t < hi && weekendSet.has(civilWeekday(c))) holidaysOnWeekend++;
  }
  return {
    earlier,
    later,
    isEndBeforeStart,
    includeEnd: input.includeEnd,
    endExclusive,
    lastCounted,
    totalDays,
    weeks: Math.floor(totalDays / 7),
    weekRemainderDays: totalDays % 7,
    ymd: calendarDiffYmd(earlier, endExclusive),
    hijri: hijriDiffYmd(earlier, endExclusive),
    business,
    holidaysOnWeekend,
    leapDays: lastCounted ? countLeapDays(earlier, lastCounted) : 0,
    weekdayCounts: weekdayCountsInRange(earlier, endExclusive),
  };
}

// ---------------------------------------------------------------------------
// Add / subtract
// ---------------------------------------------------------------------------

export type DateAddInput = {
  start: CivilDate;
  amount: number;
  unit: DateSpanUnit;
  operation: "add" | "subtract";
  weekend: WeekendPreset;
  holidays?: readonly string[];
};

export type DateAddReport = {
  start: CivilDate;
  result: CivilDate;
  /** Signed calendar days from start to result. */
  daysMoved: number;
  /** Month/year arithmetic details (null for day, week and business-day units). */
  month: (MonthAddResult & { leapTarget: boolean }) | null;
  /** Weekend days and holidays skipped when counting business days (0 otherwise). */
  skippedWeekend: number;
  skippedHolidays: number;
};

export function addDateSpan(input: DateAddInput): DateAddReport {
  const n = Math.trunc(input.amount) * (input.operation === "subtract" ? -1 : 1);
  let result: CivilDate;
  let month: DateAddReport["month"] = null;
  let skippedWeekend = 0;
  let skippedHolidays = 0;
  if (input.unit === "months" || input.unit === "years") {
    const r = addMonthsClamped(input.start, input.unit === "years" ? n * 12 : n);
    result = r.date;
    month = { ...r, leapTarget: isLeapYear(r.date.year) };
  } else if (input.unit === "businessDays") {
    result = addBusinessDays(input.start, n, input.weekend, input.holidays ?? []);
    // Days strictly between start and result (plus the result itself) that were not workdays.
    const [a, b] = n >= 0 ? [addCivilDays(input.start, 1), addCivilDays(result, 1)] : [result, input.start];
    const c = countBusinessDays(a, b, input.weekend, input.holidays ?? []);
    skippedWeekend = c.weekendDays;
    skippedHolidays = c.holidays;
  } else {
    result = addCivilDays(input.start, input.unit === "weeks" ? n * 7 : n);
  }
  return { start: input.start, result, daysMoved: diffCivilDays(input.start, result), month, skippedWeekend, skippedHolidays };
}

/** Both calendars for a Gregorian date. */
export function dualDate(d: CivilDate): { gregorian: CivilDate; hijri: HijriDate; weekday: number; iso: string } {
  return { gregorian: d, hijri: gregorianToHijri(d), weekday: civilWeekday(d), iso: formatIsoDate(d) };
}
