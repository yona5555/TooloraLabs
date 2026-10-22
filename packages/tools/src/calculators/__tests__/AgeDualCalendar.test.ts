import { describe, expect, it } from "vitest";
import {
  birthdayWeekdayCounts,
  computeDualAge,
  gregorianAge,
  gregorianBirthdayInYear,
  hijriAge,
  hijriMonthDays,
  leapDaysBetween,
  lifeStageDays,
  upcomingAgeEvents,
  validateAgeInput,
} from "../AgeDualCalendar";
import { gregorianToHijri, hijriToGregorian, type CivilDate } from "../DateTimeCore";

const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const dayDiff = (a: CivilDate, b: CivilDate) =>
  Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000);

describe("Hijri (Umm al-Qura) age", () => {
  it("uses the Umm al-Qura calendar (1 Ramadan 1445 = 2024-03-11)", () => {
    expect(gregorianToHijri(d(2024, 3, 11))).toEqual({ year: 1445, month: 9, day: 1 });
  });

  it("reaches a full Hijri year 11 days before the Gregorian one", () => {
    // 1 Ramadan 1445 → 1 Ramadan 1446 (2025-03-01): one lunar year, still 11 months in Gregorian.
    const r = computeDualAge(d(2024, 3, 11), d(2025, 3, 1));
    expect(r.hijri).not.toBeNull();
    expect([r.hijri!.years, r.hijri!.months, r.hijri!.days]).toEqual([1, 0, 0]);
    expect(r.hijri!.isBirthdayToday).toBe(true);
    expect(r.totalDays).toBe(355);
    expect([r.gregorian.years, r.gregorian.months, r.gregorian.days]).toEqual([0, 11, 18]);
    expect(r.gregorian.daysUntilNext).toBe(10);
  });

  it("is higher than the Gregorian age by about 3% of a lifetime", () => {
    const r = computeDualAge(d(1994, 6, 15), d(2026, 10, 17));
    expect(r.gregorian.years).toBe(32);
    expect(r.hijri!.years).toBe(33);
    expect(r.hijriYearsAhead).toBeGreaterThan(0.9);
    expect(r.hijriYearsAhead).toBeLessThan(1.1);
  });

  it("gives the next Hijri birthday with its Gregorian date", () => {
    const r = computeDualAge(d(1994, 6, 15), d(2026, 10, 17));
    const next = r.hijri!.nextBirthdayGregorian;
    expect(gregorianToHijri(next)).toEqual({ year: 1449, month: r.hijri!.birth.month, day: r.hijri!.birth.day });
    expect(r.hijri!.daysUntilNext).toBe(dayDiff(d(2026, 10, 17), next));
    expect(r.hijri!.turning).toBe(34);
  });

  it("resolves a day-30 Hijri birthday in a 29-day month by the chosen rule", () => {
    // Find a 30-day Hijri month whose same month a year later has only 29 days.
    let birthH = { year: 0, month: 0, day: 30 };
    outer: for (let y = 1420; y < 1440; y++) {
      for (let m = 1; m <= 12; m++) {
        if (hijriMonthDays(y, m) === 30 && hijriMonthDays(y + 1, m) === 29) {
          birthH = { year: y, month: m, day: 30 };
          break outer;
        }
      }
    }
    expect(birthH.year).toBeGreaterThan(0);
    const birth = hijriToGregorian(birthH)!;
    const nextYear29 = hijriToGregorian({ year: birthH.year + 1, month: birthH.month, day: 29 })!;
    const clamp = hijriAge(birth, nextYear29, "feb28");
    expect([clamp.years, clamp.months, clamp.days]).toEqual([1, 0, 0]);
    const roll = hijriAge(birth, nextYear29, "mar1");
    expect(roll.years).toBe(0);
    expect(roll.daysUntilNext).toBe(1);
  });
});

describe("Feb 29 birthdays", () => {
  const leap = d(2000, 2, 29);

  it("places the birthday on Feb 28 or Mar 1 in common years", () => {
    expect(gregorianBirthdayInYear(leap, 2025, "feb28")).toEqual(d(2025, 2, 28));
    expect(gregorianBirthdayInYear(leap, 2025, "mar1")).toEqual(d(2025, 3, 1));
    expect(gregorianBirthdayInYear(leap, 2028, "mar1")).toEqual(d(2028, 2, 29));
  });

  it("turns a year older on Feb 28 under the feb28 rule", () => {
    const r = gregorianAge(leap, d(2023, 2, 28), "feb28");
    expect([r.years, r.months, r.days]).toEqual([23, 0, 0]);
    expect(r.isBirthdayToday).toBe(true);
  });

  it("waits until Mar 1 under the mar1 rule", () => {
    const before = gregorianAge(leap, d(2023, 2, 28), "mar1");
    expect([before.years, before.months, before.days]).toEqual([22, 11, 30]);
    expect(before.daysUntilNext).toBe(1);
    const on = gregorianAge(leap, d(2023, 3, 1), "mar1");
    expect([on.years, on.months, on.days, on.isBirthdayToday]).toEqual([23, 0, 0, true]);
  });

  it("celebrates on the real date in leap years", () => {
    const r = gregorianAge(leap, d(2024, 2, 29), "mar1");
    expect([r.years, r.months, r.days, r.isBirthdayToday]).toEqual([24, 0, 0, true]);
  });

  it("counts leap days lived and the next real Feb 29 birthday", () => {
    const r = computeDualAge(leap, d(2023, 2, 28));
    expect(r.isLeapDayBirth).toBe(true);
    expect(r.leapDaysLived).toBe(5); // 2004, 2008, 2012, 2016, 2020
    const real = upcomingAgeEvents(r).find((e) => e.key === "leapBirthday");
    expect(real?.date).toEqual(d(2024, 2, 29));
    expect(real?.daysUntil).toBe(366);
  });

  it("excludes the birth day itself from leap days lived", () => {
    expect(leapDaysBetween(leap, d(2000, 3, 1))).toBe(0);
    expect(leapDaysBetween(d(1999, 12, 31), d(2000, 2, 29))).toBe(1);
  });
});

describe("reference-date edge cases", () => {
  it("returns zero age when the reference is the birth date", () => {
    const r = computeDualAge(d(1990, 1, 15), d(1990, 1, 15));
    expect([r.gregorian.years, r.gregorian.months, r.gregorian.days, r.totalDays]).toEqual([0, 0, 0, 0]);
    expect(r.gregorian.isBirthdayToday).toBe(false);
    expect(r.gregorian.turning).toBe(1);
    expect(r.gregorian.nextBirthdayGregorian).toEqual(d(1991, 1, 15));
  });

  it("is one day short of a birthday the day before", () => {
    const r = gregorianAge(d(1990, 6, 15), d(2026, 6, 14));
    expect([r.years, r.months, r.days]).toEqual([35, 11, 30]);
    expect(r.daysUntilNext).toBe(1);
  });

  it("anchors months on the birth day at month ends", () => {
    expect(gregorianAge(d(2000, 1, 31), d(2000, 2, 29), "feb28")).toMatchObject({ months: 1, days: 0 });
    expect(gregorianAge(d(2000, 1, 31), d(2000, 2, 29), "mar1")).toMatchObject({ months: 0, days: 29 });
    // No compounding: Jan 31 → Mar 31 is exactly two months.
    expect(gregorianAge(d(2001, 1, 31), d(2001, 3, 31), "feb28")).toMatchObject({ months: 2, days: 0 });
  });

  it("crosses a year boundary correctly", () => {
    const r = gregorianAge(d(1999, 12, 31), d(2000, 1, 1));
    expect([r.years, r.months, r.days]).toEqual([0, 0, 1]);
    expect(r.nextBirthdayGregorian).toEqual(d(2000, 12, 31));
    expect(r.daysUntilNext).toBe(365);
  });

  it("supports a future reference date (age on a specific date)", () => {
    const r = computeDualAge(d(2010, 9, 1), d(2028, 9, 1));
    expect(r.gregorian.years).toBe(18);
    expect(r.gregorian.isBirthdayToday).toBe(true);
  });

  it("validates order and supported range", () => {
    expect(validateAgeInput(d(2000, 1, 2), d(2000, 1, 1))).toBe("referenceBeforeBirth");
    expect(validateAgeInput(d(1899, 1, 1), d(2000, 1, 1))).toBe("outOfRange");
    expect(validateAgeInput(d(2000, 1, 1), d(2000, 1, 1))).toBe("ok");
  });

  it("derives totals and weekdays from the day count", () => {
    const r = computeDualAge(d(1994, 6, 15), d(2026, 10, 17));
    expect(r.totalDays).toBe(dayDiff(d(1994, 6, 15), d(2026, 10, 17)));
    expect(r.totalWeeks * 7 + r.weekRemainderDays).toBe(r.totalDays);
    expect(r.totalHours).toBe(r.totalDays * 24);
    expect(r.birthWeekday).toBe(3); // 15 June 1994 was a Wednesday
  });

  it("splits birthdays by weekday and days by life stage consistently", () => {
    const birth = d(1994, 6, 15);
    const ref = d(2026, 10, 17);
    const counts = birthdayWeekdayCounts(birth, ref);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(32);
    const stages = lifeStageDays(birth, ref);
    expect(stages.reduce((s, x) => s + x.days, 0)).toBe(computeDualAge(birth, ref).totalDays);
    expect(stages[0].complete && stages[1].complete && !stages[2].complete).toBe(true);
  });
});
