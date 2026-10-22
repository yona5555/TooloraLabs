/**
 * Age in both calendars (Gregorian and Hijri Umm al-Qura) for the age-calculator tool.
 *
 * One month-stepping algorithm serves both calendars: the age is the largest number of whole
 * months n such that "birth + n months" (anchored on the birth day, never compounding) is on or
 * before the reference date; years = n div 12, months = n mod 12, days = the remaining day count.
 * When the birth day does not exist in a target month (Feb 29 in a common year, the 31st in a
 * 30-day month, day 30 of a 29-day Hijri month) the leap-day rule decides: "feb28" keeps the last
 * day of that month, "mar1" rolls to the first day of the next month. Pure logic, no clock read.
 */
import {
  civilToUtcMs,
  civilWeekday,
  daysInMonth,
  gregorianToHijri,
  hijriToGregorian,
  isHijriSupported,
  isLeapYear,
  utcMsToCivil,
  type CivilDate,
  type HijriDate,
} from "./DateTimeCore";

export type LeapDayRule = "feb28" | "mar1";
type Ymd = { year: number; month: number; day: number };

const DAY_MS = 86_400_000;
const MEAN_GREGORIAN_YEAR = 365.2425;
const MEAN_HIJRI_YEAR = 354.367;

export const AGE_YEAR_LENGTHS = { gregorian: MEAN_GREGORIAN_YEAR, hijri: MEAN_HIJRI_YEAR } as const;

/** Days since 1970-01-01 for a Gregorian civil date. */
export function civilDayNumber(d: CivilDate): number {
  return Math.round(civilToUtcMs(d) / DAY_MS);
}

export function civilFromDayNumber(n: number): CivilDate {
  return utcMsToCivil(n * DAY_MS);
}

type CalendarAdapter = {
  monthLength: (year: number, month: number) => number;
  toDayNumber: (d: Ymd) => number;
};

const gregorianAdapter: CalendarAdapter = {
  monthLength: daysInMonth,
  toDayNumber: civilDayNumber,
};

// Hijri conversions go through Intl and an iterative search, so cache them.
const hijriDayCache = new Map<string, number | null>();
function hijriDayNumber(h: Ymd): number | null {
  const key = `${h.year}-${h.month}-${h.day}`;
  if (!hijriDayCache.has(key)) {
    const g = hijriToGregorian(h);
    hijriDayCache.set(key, g ? civilDayNumber(g) : null);
  }
  return hijriDayCache.get(key) ?? null;
}

/** Length (29 or 30) of a Hijri Umm al-Qura month, cached. */
export function hijriMonthDays(year: number, month: number): number {
  return hijriDayNumber({ year, month, day: 30 }) === null ? 29 : 30;
}

const hijriAdapter: CalendarAdapter = {
  monthLength: hijriMonthDays,
  toDayNumber: (d) => {
    const n = hijriDayNumber(d);
    if (n === null) throw new RangeError(`Invalid Hijri date ${d.year}-${d.month}-${d.day}`);
    return n;
  },
};

/** "birth + n months" in a calendar, anchored on the birth day and resolved by the leap-day rule. */
function addMonthsAnchored(cal: CalendarAdapter, birth: Ymd, n: number, rule: LeapDayRule): Ymd {
  const idx = birth.month - 1 + n;
  const year = birth.year + Math.floor(idx / 12);
  const month = (((idx % 12) + 12) % 12) + 1;
  const len = cal.monthLength(year, month);
  if (birth.day <= len) return { year, month, day: birth.day };
  if (rule === "feb28") return { year, month, day: len };
  return month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
}

/** The Gregorian birthday (anniversary) in a given year, honouring the Feb 29 rule. */
export function gregorianBirthdayInYear(birth: CivilDate, year: number, rule: LeapDayRule = "feb28"): CivilDate {
  return addMonthsAnchored(gregorianAdapter, birth, (year - birth.year) * 12, rule);
}

export type CalendarAge = {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  /** Birth and reference dates expressed in this calendar. */
  birth: Ymd;
  reference: Ymd;
  /** Last and next birthdays in this calendar, and their Gregorian equivalents. */
  lastBirthday: Ymd;
  nextBirthday: Ymd;
  lastBirthdayGregorian: CivilDate;
  nextBirthdayGregorian: CivilDate;
  isBirthdayToday: boolean;
  /** Age reached at the next birthday (or today, when it is the birthday). */
  turning: number;
  daysUntilNext: number;
  /** Length in days of the current year of life in this calendar (last → next birthday). */
  yearLengthDays: number;
  daysIntoYear: number;
  /** 0..1 progress through the current year of life. */
  yearProgress: number;
  /** Fractional years: whole years + days into this year / its length. */
  decimalYears: number;
};

function calendarAge(cal: CalendarAdapter, birth: Ymd, reference: Ymd, rule: LeapDayRule): CalendarAge {
  const refN = cal.toDayNumber(reference);
  const at = (n: number) => cal.toDayNumber(addMonthsAnchored(cal, birth, n, rule));
  let n = Math.max(0, (reference.year - birth.year) * 12 + (reference.month - birth.month));
  while (n > 0 && at(n) > refN) n--;
  while (at(n + 1) <= refN) n++;
  const anchor = addMonthsAnchored(cal, birth, n, rule);
  const years = Math.floor(n / 12);
  const months = n % 12;
  const days = refN - cal.toDayNumber(anchor);

  const last = addMonthsAnchored(cal, birth, years * 12, rule);
  const next = addMonthsAnchored(cal, birth, (years + 1) * 12, rule);
  const lastN = cal.toDayNumber(last);
  const nextN = cal.toDayNumber(next);
  const isBirthdayToday = lastN === refN && years > 0;
  const yearLengthDays = nextN - lastN;
  const daysIntoYear = refN - lastN;

  return {
    years,
    months,
    days,
    totalMonths: n,
    birth,
    reference,
    lastBirthday: last,
    nextBirthday: isBirthdayToday ? last : next,
    lastBirthdayGregorian: civilFromDayNumber(lastN),
    nextBirthdayGregorian: civilFromDayNumber(isBirthdayToday ? lastN : nextN),
    isBirthdayToday,
    turning: isBirthdayToday ? years : years + 1,
    daysUntilNext: isBirthdayToday ? 0 : nextN - refN,
    yearLengthDays,
    daysIntoYear,
    yearProgress: yearLengthDays > 0 ? daysIntoYear / yearLengthDays : 0,
    decimalYears: years + (yearLengthDays > 0 ? daysIntoYear / yearLengthDays : 0),
  };
}

/** Gregorian age between two civil dates (reference must be on/after birth). */
export function gregorianAge(birth: CivilDate, reference: CivilDate, rule: LeapDayRule = "feb28"): CalendarAge {
  return calendarAge(gregorianAdapter, birth, reference, rule);
}

/** Hijri (Umm al-Qura) age between two Gregorian civil dates. */
export function hijriAge(birth: CivilDate, reference: CivilDate, rule: LeapDayRule = "feb28"): CalendarAge {
  return calendarAge(hijriAdapter, gregorianToHijri(birth), gregorianToHijri(reference), rule);
}

export type DualAgeReport = {
  birth: CivilDate;
  reference: CivilDate;
  leapRule: LeapDayRule;
  gregorian: CalendarAge;
  /** Null when the runtime has no Umm al-Qura calendar. */
  hijri: CalendarAge | null;
  birthHijri: HijriDate | null;
  totalDays: number;
  totalWeeks: number;
  weekRemainderDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  /** 0 = Sunday … 6 = Saturday. */
  birthWeekday: number;
  referenceWeekday: number;
  isLeapDayBirth: boolean;
  /** Feb 29 dates strictly after birth, up to and including the reference date. */
  leapDaysLived: number;
  /** Hijri years minus Gregorian years, both fractional. */
  hijriYearsAhead: number;
};

export type AgeValidation = "ok" | "referenceBeforeBirth" | "outOfRange";

/** Supported span: the Umm al-Qura table covers 1300–1600 AH (≈1882–2174 CE). */
export const AGE_MIN_YEAR = 1900;
export const AGE_MAX_YEAR = 2150;

export function validateAgeInput(birth: CivilDate, reference: CivilDate): AgeValidation {
  if (birth.year < AGE_MIN_YEAR || reference.year > AGE_MAX_YEAR) return "outOfRange";
  if (civilDayNumber(reference) < civilDayNumber(birth)) return "referenceBeforeBirth";
  return "ok";
}

/** Feb 29 dates in (after, upTo] — strictly after the first date, inclusive of the second. */
export function leapDaysBetween(after: CivilDate, upTo: CivilDate): number {
  const a = civilDayNumber(after);
  const b = civilDayNumber(upTo);
  let count = 0;
  for (let y = after.year; y <= upTo.year; y++) {
    if (!isLeapYear(y)) continue;
    const t = civilDayNumber({ year: y, month: 2, day: 29 });
    if (t > a && t <= b) count++;
  }
  return count;
}

export function computeDualAge(birth: CivilDate, reference: CivilDate, rule: LeapDayRule = "feb28"): DualAgeReport {
  const totalDays = civilDayNumber(reference) - civilDayNumber(birth);
  const gregorian = gregorianAge(birth, reference, rule);
  const hijri = isHijriSupported() ? hijriAge(birth, reference, rule) : null;
  return {
    birth,
    reference,
    leapRule: rule,
    gregorian,
    hijri,
    birthHijri: hijri ? (hijri.birth as HijriDate) : null,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    weekRemainderDays: totalDays % 7,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 1440,
    totalSeconds: totalDays * 86_400,
    birthWeekday: civilWeekday(birth),
    referenceWeekday: civilWeekday(reference),
    isLeapDayBirth: birth.month === 2 && birth.day === 29,
    leapDaysLived: leapDaysBetween(birth, reference),
    hijriYearsAhead: hijri ? hijri.decimalYears - gregorian.decimalYears : 0,
  };
}

/** How many of the Gregorian birthdays (age 1 … current age) fell on each weekday (index 0 = Sunday). */
export function birthdayWeekdayCounts(birth: CivilDate, reference: CivilDate, rule: LeapDayRule = "feb28"): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const years = gregorianAge(birth, reference, rule).years;
  for (let k = 1; k <= years; k++) counts[civilWeekday(gregorianBirthdayInYear(birth, birth.year + k, rule))]++;
  return counts;
}

export type LifeStageKey = "childhood" | "adolescence" | "youth" | "middleAge" | "oldAge";
export type LifeStageSpan = { stage: LifeStageKey; fromAge: number; toAge: number | null; days: number; complete: boolean };

const STAGE_BOUNDS: { stage: LifeStageKey; from: number; to: number | null }[] = [
  { stage: "childhood", from: 0, to: 10 },
  { stage: "adolescence", from: 10, to: 20 },
  { stage: "youth", from: 20, to: 40 },
  { stage: "middleAge", from: 40, to: 60 },
  { stage: "oldAge", from: 60, to: null },
];

/** Days lived inside each life stage (same WHO/Erikson bands as getLifeStage), up to the reference date. */
export function lifeStageDays(birth: CivilDate, reference: CivilDate, rule: LeapDayRule = "feb28"): LifeStageSpan[] {
  const refN = civilDayNumber(reference);
  const ageStart = (age: number) => civilDayNumber(gregorianBirthdayInYear(birth, birth.year + age, rule));
  return STAGE_BOUNDS.map(({ stage, from, to }) => {
    const s = ageStart(from);
    const e = to === null ? Infinity : ageStart(to);
    const days = Math.max(0, Math.min(e, refN) - s);
    return { stage, fromAge: from, toAge: to, days, complete: e <= refN };
  });
}

export type AgeEventKey =
  | "gregorianBirthday"
  | "hijriBirthday"
  | "thousandDays"
  | "thousandWeeks"
  | "milestone"
  | "leapBirthday";

export type AgeEvent = { key: AgeEventKey; date: CivilDate; daysUntil: number; value: number };

const MILESTONE_AGES = [18, 21, 25, 30, 40, 50, 60, 65, 70, 80, 90, 100];

/** Upcoming events after the reference date, soonest first. */
export function upcomingAgeEvents(report: DualAgeReport): AgeEvent[] {
  const { birth, reference, gregorian, hijri, totalDays, leapRule } = report;
  const refN = civilDayNumber(reference);
  const birthN = civilDayNumber(birth);
  const ev = (key: AgeEventKey, date: CivilDate, value: number): AgeEvent => ({
    key,
    date,
    value,
    daysUntil: civilDayNumber(date) - refN,
  });
  const out: AgeEvent[] = [ev("gregorianBirthday", gregorian.nextBirthdayGregorian, gregorian.turning)];
  if (hijri) out.push(ev("hijriBirthday", hijri.nextBirthdayGregorian, hijri.turning));
  const nextK = Math.floor(totalDays / 1000) + 1;
  out.push(ev("thousandDays", civilFromDayNumber(birthN + nextK * 1000), nextK * 1000));
  const nextW = Math.floor(totalDays / 7000) + 1;
  out.push(ev("thousandWeeks", civilFromDayNumber(birthN + nextW * 7000), nextW * 1000));
  const milestone = MILESTONE_AGES.find((a) => a > gregorian.years || (a === gregorian.years && gregorian.isBirthdayToday));
  if (milestone !== undefined) out.push(ev("milestone", gregorianBirthdayInYear(birth, birth.year + milestone, leapRule), milestone));
  if (report.isLeapDayBirth) {
    let y = reference.year;
    while (!isLeapYear(y) || civilDayNumber({ year: y, month: 2, day: 29 }) < refN) y++;
    out.push(ev("leapBirthday", { year: y, month: 2, day: 29 }, y - birth.year));
  }
  return out.sort((a, b) => a.daysUntil - b.daysUntil);
}
