import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  countBusinessDays,
  countLeapDays,
  daysInMonth,
  defaultWeekendForLocale,
  findOffsetTransitions,
  formatOffset,
  gregorianToHijri,
  hijriMonthLength,
  hijriToGregorian,
  isDstActive,
  isHijriSupported,
  isLeapYear,
  parseCivilDate,
  zoneOffsetMinutes,
  zonedParts,
  zonedToUtc,
} from "../DateTimeCore";

describe("leap years", () => {
  it("follows the Gregorian 4/100/400 rule", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
  });
  it("counts Feb 29s in a range and rejects invalid ISO dates", () => {
    expect(countLeapDays({ year: 2020, month: 1, day: 1 }, { year: 2028, month: 2, day: 28 })).toBe(2);
    expect(countLeapDays({ year: 2020, month: 3, day: 1 }, { year: 2028, month: 2, day: 29 })).toBe(2);
    expect(parseCivilDate("2025-02-29")).toBeNull();
    expect(parseCivilDate("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
  });
});

describe("Hijri Umm al-Qura", () => {
  it("is supported by the runtime", () => {
    expect(isHijriSupported()).toBe(true);
  });
  it("converts known Gregorian dates", () => {
    expect(gregorianToHijri({ year: 2026, month: 10, day: 17 })).toEqual({ year: 1448, month: 5, day: 6 });
    expect(gregorianToHijri({ year: 2023, month: 7, day: 19 })).toEqual({ year: 1445, month: 1, day: 1 });
  });
  it("converts Hijri back to Gregorian", () => {
    expect(hijriToGregorian({ year: 1448, month: 5, day: 6 })).toEqual({ year: 2026, month: 10, day: 17 });
    expect(hijriToGregorian({ year: 1445, month: 1, day: 1 })).toEqual({ year: 2023, month: 7, day: 19 });
  });
  it("round-trips every day across several years", () => {
    let ms = Date.UTC(2019, 0, 1);
    const end = Date.UTC(2031, 0, 1);
    for (; ms < end; ms += 86_400_000 * 7) {
      const d = new Date(ms);
      const g = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
      expect(hijriToGregorian(gregorianToHijri(g))).toEqual(g);
    }
  });
  it("rejects day 30 of a 29-day month and reports month lengths", () => {
    for (let m = 1; m <= 12; m++) {
      const len = hijriMonthLength(1447, m);
      expect([29, 30]).toContain(len);
      if (len === 29) expect(hijriToGregorian({ year: 1447, month: m, day: 30 })).toBeNull();
    }
    expect(hijriToGregorian({ year: 1447, month: 13, day: 1 })).toBeNull();
  });
});

describe("time zones and DST", () => {
  it("reads fixed and fractional offsets", () => {
    const t = Date.UTC(2026, 9, 17, 12);
    expect(zoneOffsetMinutes(t, "Asia/Riyadh")).toBe(180);
    expect(zoneOffsetMinutes(t, "Asia/Kolkata")).toBe(330);
    expect(zoneOffsetMinutes(t, "Asia/Kathmandu")).toBe(345);
    expect(formatOffset(-210)).toBe("UTC-03:30");
  });
  it("finds New York 2026 transitions", () => {
    const tr = findOffsetTransitions("America/New_York", 2026);
    expect(tr).toHaveLength(2);
    expect(new Date(tr[0].utcMs).toISOString()).toBe("2026-03-08T07:00:00.000Z");
    expect(tr[0]).toMatchObject({ offsetBefore: -300, offsetAfter: -240 });
    expect(new Date(tr[1].utcMs).toISOString()).toBe("2026-11-01T06:00:00.000Z");
  });
  it("finds London transitions and none for Riyadh", () => {
    const tr = findOffsetTransitions("Europe/London", 2026);
    expect(tr.map((x) => new Date(x.utcMs).toISOString())).toEqual([
      "2026-03-29T01:00:00.000Z",
      "2026-10-25T01:00:00.000Z",
    ]);
    expect(findOffsetTransitions("Asia/Riyadh", 2026)).toEqual([]);
    expect(isDstActive(Date.UTC(2026, 6, 1), "Europe/London")).toBe(true);
    expect(isDstActive(Date.UTC(2026, 6, 1), "Asia/Riyadh")).toBe(false);
  });
  it("handles southern-hemisphere DST", () => {
    expect(isDstActive(Date.UTC(2026, 0, 15), "Australia/Sydney")).toBe(true);
    expect(isDstActive(Date.UTC(2026, 6, 15), "Australia/Sydney")).toBe(false);
  });
  it("resolves normal, gap and overlap wall times", () => {
    const ok = zonedToUtc({ year: 2026, month: 10, day: 17, hour: 9, minute: 0, second: 0 }, "Asia/Riyadh");
    expect(ok).toEqual({ utcMs: Date.UTC(2026, 9, 17, 6), status: "ok" });
    const gap = zonedToUtc({ year: 2026, month: 3, day: 8, hour: 2, minute: 30, second: 0 }, "America/New_York");
    expect(gap.status).toBe("gap");
    expect(zonedParts(gap.utcMs, "America/New_York")).toMatchObject({ hour: 3, minute: 30 });
    const overlap = zonedToUtc({ year: 2026, month: 11, day: 1, hour: 1, minute: 30, second: 0 }, "America/New_York");
    expect(overlap).toEqual({ utcMs: Date.UTC(2026, 10, 1, 5, 30), status: "overlap" });
  });
});

describe("business days", () => {
  const sun = { year: 2026, month: 10, day: 18 };
  const nextSun = { year: 2026, month: 10, day: 25 };
  it("counts a week with Saudi and Western weekends", () => {
    expect(countBusinessDays(sun, nextSun, "fri-sat")).toEqual({ calendarDays: 7, businessDays: 5, weekendDays: 2, holidays: 0 });
    expect(countBusinessDays(sun, nextSun, "sat-sun").businessDays).toBe(5);
    expect(countBusinessDays(sun, { year: 2026, month: 10, day: 23 }, "fri-sat").businessDays).toBe(5);
    expect(countBusinessDays(sun, { year: 2026, month: 10, day: 23 }, "sat-sun").businessDays).toBe(4);
  });
  it("ignores input order and excludes workday holidays", () => {
    expect(countBusinessDays(nextSun, sun, "fri-sat", ["2026-10-20"])).toMatchObject({ businessDays: 4, holidays: 1 });
  });
  it("adds and subtracts business days", () => {
    expect(addBusinessDays({ year: 2026, month: 10, day: 22 }, 1, "fri-sat")).toEqual({ year: 2026, month: 10, day: 25 });
    expect(addBusinessDays({ year: 2026, month: 10, day: 23 }, 1, "sat-sun")).toEqual({ year: 2026, month: 10, day: 26 });
    expect(addBusinessDays({ year: 2026, month: 10, day: 25 }, -1, "fri-sat")).toEqual({ year: 2026, month: 10, day: 22 });
  });
  it("defaults to Fri–Sat for Arabic", () => {
    expect(defaultWeekendForLocale("ar")).toBe("fri-sat");
    expect(defaultWeekendForLocale("en")).toBe("sat-sun");
  });
});
