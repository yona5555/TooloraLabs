import { describe, it, expect } from "vitest";
import {
  addDateSpan,
  addMonthsClamped,
  calendarDiffYmd,
  computeDateSpan,
  hijriDiffYmd,
  hijriFieldsToCivil,
  parseHolidayList,
  weekdayCountsInRange,
} from "../DateCalculatorEngine";
import { DateCalculator } from "../DateCalculator";
import { formatIsoDate, parseCivilDate, type CivilDate } from "../DateTimeCore";

const d = (iso: string): CivilDate => parseCivilDate(iso)!;
const iso = formatIsoDate;

// October 2026 starts on a Thursday: Thu, Fri and Sat occur five times.
const OCT1 = d("2026-10-01");
const OCT31 = d("2026-10-31");

describe("business days with each weekend", () => {
  it("counts October 2026 (end included) with a Sat–Sun weekend", () => {
    const r = computeDateSpan({ start: OCT1, end: OCT31, includeEnd: true, weekend: "sat-sun" });
    expect(r.totalDays).toBe(31);
    expect(r.business).toEqual({ calendarDays: 31, businessDays: 22, weekendDays: 9, holidays: 0 });
  });

  it("counts October 2026 (end included) with a Fri–Sat weekend", () => {
    const r = computeDateSpan({ start: OCT1, end: OCT31, includeEnd: true, weekend: "fri-sat" });
    expect(r.business.businessDays).toBe(21);
    expect(r.business.weekendDays).toBe(10);
  });

  it("a Friday is a workday for Sat–Sun but not for Fri–Sat", () => {
    const fri = d("2026-10-02");
    const sun = d("2026-10-04");
    expect(computeDateSpan({ start: fri, end: sun, includeEnd: false, weekend: "sat-sun" }).business.businessDays).toBe(1);
    expect(computeDateSpan({ start: fri, end: sun, includeEnd: false, weekend: "fri-sat" }).business.businessDays).toBe(0);
  });

  it("is symmetric when the end date is before the start date", () => {
    const r = computeDateSpan({ start: OCT31, end: OCT1, includeEnd: true, weekend: "sat-sun" });
    expect(r.isEndBeforeStart).toBe(true);
    expect(r.business.businessDays).toBe(22);
  });

  it("returns weekday counts for the range", () => {
    expect(weekdayCountsInRange(OCT1, d("2026-11-01"))).toEqual([4, 4, 4, 4, 5, 5, 5]);
  });
});

describe("holidays", () => {
  const holidays = ["2026-10-06", "2026-10-09"]; // Tuesday, Friday

  it("deducts holidays on workdays (Sat–Sun weekend)", () => {
    const r = computeDateSpan({ start: OCT1, end: OCT31, includeEnd: true, weekend: "sat-sun", holidays });
    expect(r.business.holidays).toBe(2);
    expect(r.business.businessDays).toBe(20);
    expect(r.holidaysOnWeekend).toBe(0);
  });

  it("does not deduct a holiday twice when it falls on the weekend (Fri–Sat)", () => {
    const r = computeDateSpan({ start: OCT1, end: OCT31, includeEnd: true, weekend: "fri-sat", holidays });
    expect(r.business.holidays).toBe(1);
    expect(r.business.businessDays).toBe(20);
    expect(r.holidaysOnWeekend).toBe(1);
  });

  it("skips holidays when adding business days", () => {
    const plain = addDateSpan({ start: OCT1, amount: 5, unit: "businessDays", operation: "add", weekend: "sat-sun" });
    expect(iso(plain.result)).toBe("2026-10-08");
    expect(plain.skippedWeekend).toBe(2);
    const withHoliday = addDateSpan({ start: OCT1, amount: 5, unit: "businessDays", operation: "add", weekend: "sat-sun", holidays: ["2026-10-06"] });
    expect(iso(withHoliday.result)).toBe("2026-10-09");
    expect(withHoliday.skippedHolidays).toBe(1);
  });

  it("adds one business day after a Thursday under each weekend", () => {
    expect(iso(addDateSpan({ start: OCT1, amount: 1, unit: "businessDays", operation: "add", weekend: "sat-sun" }).result)).toBe("2026-10-02");
    expect(iso(addDateSpan({ start: OCT1, amount: 1, unit: "businessDays", operation: "add", weekend: "fri-sat" }).result)).toBe("2026-10-04");
  });

  it("subtracts business days backwards over the weekend", () => {
    const r = addDateSpan({ start: d("2026-10-04"), amount: 1, unit: "businessDays", operation: "subtract", weekend: "sat-sun" });
    expect(iso(r.result)).toBe("2026-10-02");
    expect(r.skippedWeekend).toBe(1);
  });

  it("parses a free holiday list, de-duplicated and sorted", () => {
    expect(parseHolidayList("2026-10-09, 2026-10-06\n2026-10-06 nope 2026-02-30")).toEqual({
      valid: ["2026-10-06", "2026-10-09"],
      invalid: ["nope", "2026-02-30"],
    });
  });
});

describe("month-end clamping", () => {
  it("Jan 31 + 1 month clamps to Feb 28 in a common year", () => {
    const r = addMonthsClamped(d("2026-01-31"), 1);
    expect(iso(r.date)).toBe("2026-02-28");
    expect(r).toMatchObject({ clamped: true, requestedDay: 31, monthLength: 28 });
  });

  it("Jan 31 + 2 months keeps day 31 (no clamping)", () => {
    expect(addMonthsClamped(d("2026-01-31"), 2)).toMatchObject({ clamped: false, date: { year: 2026, month: 3, day: 31 } });
  });

  it("subtracting a month from Mar 31 clamps to Feb 28", () => {
    const r = addDateSpan({ start: d("2026-03-31"), amount: 1, unit: "months", operation: "subtract", weekend: "sat-sun" });
    expect(iso(r.result)).toBe("2026-02-28");
    expect(r.month?.clamped).toBe(true);
  });

  it("crosses year boundaries when adding months", () => {
    expect(iso(addMonthsClamped(d("2026-11-30"), 3).date)).toBe("2027-02-28");
    expect(iso(addMonthsClamped(d("2026-01-15"), -1).date)).toBe("2025-12-15");
  });

  it("Y/M/D difference uses the clamped anniversary", () => {
    expect(calendarDiffYmd(d("2026-01-31"), d("2026-03-01"))).toEqual({ years: 0, months: 1, days: 1 });
    expect(calendarDiffYmd(d("2020-01-01"), d("2025-06-15"))).toEqual({ years: 5, months: 5, days: 14 });
  });
});

describe("leap years", () => {
  it("Jan 31 + 1 month lands on Feb 29 in a leap year", () => {
    const r = addDateSpan({ start: d("2024-01-31"), amount: 1, unit: "months", operation: "add", weekend: "sat-sun" });
    expect(iso(r.result)).toBe("2024-02-29");
    expect(r.month?.leapTarget).toBe(true);
  });

  it("Feb 29 + 1 year clamps to Feb 28, + 4 years keeps Feb 29", () => {
    const one = addDateSpan({ start: d("2024-02-29"), amount: 1, unit: "years", operation: "add", weekend: "sat-sun" });
    expect(iso(one.result)).toBe("2025-02-28");
    expect(one.month?.clamped).toBe(true);
    const four = addDateSpan({ start: d("2024-02-29"), amount: 4, unit: "years", operation: "add", weekend: "sat-sun" });
    expect(iso(four.result)).toBe("2028-02-29");
    expect(four.month?.clamped).toBe(false);
  });

  it("a whole leap year with the end date included is 366 days and 1 year", () => {
    const r = computeDateSpan({ start: d("2024-01-01"), end: d("2024-12-31"), includeEnd: true, weekend: "sat-sun" });
    expect(r.totalDays).toBe(366);
    expect(r.leapDays).toBe(1);
    expect(r.ymd).toEqual({ years: 1, months: 0, days: 0 });
  });

  it("counts Feb 29 only when it is inside the counted range", () => {
    expect(computeDateSpan({ start: d("2024-02-28"), end: d("2024-03-01"), includeEnd: false, weekend: "sat-sun" }).leapDays).toBe(1);
    expect(computeDateSpan({ start: d("2023-01-01"), end: d("2024-01-01"), includeEnd: false, weekend: "sat-sun" }).leapDays).toBe(0);
  });

  it("include end date adds exactly one day", () => {
    const a = computeDateSpan({ start: d("2026-01-01"), end: d("2026-01-31"), includeEnd: false, weekend: "sat-sun" });
    const b = computeDateSpan({ start: d("2026-01-01"), end: d("2026-01-31"), includeEnd: true, weekend: "sat-sun" });
    expect(a.totalDays).toBe(30);
    expect(b.totalDays).toBe(31);
    expect(b.ymd).toEqual({ years: 0, months: 1, days: 0 });
  });
});

describe("Hijri (Umm al-Qura) input", () => {
  it("converts 1 Ramadan 1446 to 2025-03-01", () => {
    expect(iso(hijriFieldsToCivil(1446, 9, 1)!)).toBe("2025-03-01");
  });

  it("rejects day 30 of a 29-day month and out-of-range years", () => {
    expect(hijriFieldsToCivil(1446, 9, 30)).toBeNull();
    expect(hijriFieldsToCivil(1200, 1, 1)).toBeNull();
    expect(hijriFieldsToCivil(1446, 13, 1)).toBeNull();
  });

  it("Ramadan 1446 → 1 Shawwal 1446 is 29 days and one Hijri month", () => {
    const start = hijriFieldsToCivil(1446, 9, 1)!;
    const end = hijriFieldsToCivil(1446, 10, 1)!;
    expect(iso(end)).toBe("2025-03-30");
    const r = computeDateSpan({ start, end, includeEnd: false, weekend: "fri-sat" });
    expect(r.totalDays).toBe(29);
    expect(r.hijri).toEqual({ years: 0, months: 1, days: 0 });
  });

  it("a Hijri year is shorter than a Gregorian year", () => {
    const start = hijriFieldsToCivil(1446, 1, 1)!;
    const end = hijriFieldsToCivil(1447, 1, 1)!;
    const days = computeDateSpan({ start, end, includeEnd: false, weekend: "sat-sun" }).totalDays;
    expect(days === 354 || days === 355).toBe(true);
    expect(hijriDiffYmd(start, end)).toEqual({ years: 1, months: 0, days: 0 });
  });

  it("adds business days from a Hijri start date", () => {
    const start = hijriFieldsToCivil(1446, 9, 1)!; // Saturday 2025-03-01
    const r = addDateSpan({ start, amount: 5, unit: "businessDays", operation: "add", weekend: "fri-sat" });
    expect(iso(r.result)).toBe("2025-03-06");
  });
});

describe("DateCalculator tool (new options)", () => {
  const calc = new DateCalculator();
  it("reports business days and honours includeEnd", () => {
    const r = calc.execute({ mode: "difference", startDate: "2026-10-01", endDate: "2026-10-31", includeEnd: true, weekend: "fri-sat" }, { locale: "ar" });
    expect(r.data.difference).toMatchObject({ totalDays: 31, businessDays: 21 });
  });
  it("adds business days", () => {
    const r = calc.execute({ mode: "addSubtract", startDate: "2026-10-01", amount: 5, unit: "businessDays", operation: "add" }, { locale: "en" });
    expect(r.data.resultDateISO).toBe("2026-10-08");
  });
});
