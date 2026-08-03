export type HijriDate = { year: number; month: number; day: number };

/**
 * Tabular (civil) Islamic calendar — the same fixed 30-year/354-355-day
 * scheme used by ICU and most calendar libraries for approximate Hijri
 * dates. It does not track real lunar sightings, so results can differ
 * from the observational calendar (e.g. Umm al-Qura) by up to a day or two.
 */
const ISLAMIC_EPOCH_JDN = 1948440;

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  let l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l) / 2447);
  const day = l - Math.floor((2447 * j) / 80);
  l = Math.floor(j / 11);
  const month = j + 2 - 12 * l;
  const year = 100 * (n - 49) + i + l;

  return { year, month, day };
}

function hijriToJdn(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH_JDN -
    1
  );
}

function jdnToHijri(jdn: number): HijriDate {
  let l = jdn - ISLAMIC_EPOCH_JDN + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month, day };
}

export function gregorianToHijri(date: Date): HijriDate {
  return jdnToHijri(gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

export function hijriToGregorian(hijri: HijriDate): Date {
  const { year, month, day } = jdnToGregorian(hijriToJdn(hijri.year, hijri.month, hijri.day));
  return new Date(year, month - 1, day);
}

export function daysInHijriMonth(year: number, month: number): number {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return hijriToJdn(nextYear, nextMonth, 1) - hijriToJdn(year, month, 1);
}

export function hijriDateDifference(
  start: HijriDate,
  end: HijriDate
): { years: number; months: number; days: number } {
  let years = end.year - start.year;
  let months = end.month - start.month;
  let days = end.day - start.day;

  if (days < 0) {
    months -= 1;
    const borrowMonth = end.month === 1 ? 12 : end.month - 1;
    const borrowYear = end.month === 1 ? end.year - 1 : end.year;
    days += daysInHijriMonth(borrowYear, borrowMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}
