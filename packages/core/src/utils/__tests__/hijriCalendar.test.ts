import { describe, it, expect } from "vitest";
import {
  gregorianToHijri,
  hijriToGregorian,
  daysInHijriMonth,
  hijriDateDifference,
} from "../hijriCalendar";

describe("gregorianToHijri", () => {
  it("maps the tabular Islamic epoch to 1 Muharram 1 AH", () => {
    expect(gregorianToHijri(new Date(622, 6, 19))).toEqual({ year: 1, month: 1, day: 1 });
  });

  it("matches a hand-verified modern date", () => {
    expect(gregorianToHijri(new Date(2026, 7, 3))).toEqual({ year: 1448, month: 2, day: 18 });
  });
});

describe("hijriToGregorian", () => {
  it("is the inverse of gregorianToHijri at the epoch", () => {
    expect(hijriToGregorian({ year: 1, month: 1, day: 1 })).toEqual(new Date(622, 6, 19));
  });

  it("round-trips across a range of dates", () => {
    for (let year = 1950; year <= 2100; year += 3) {
      for (const [month, day] of [
        [1, 1],
        [6, 15],
        [12, 31],
      ] as const) {
        const original = new Date(year, month - 1, day);
        const roundTripped = hijriToGregorian(gregorianToHijri(original));
        expect(roundTripped).toEqual(original);
      }
    }
  });
});

describe("daysInHijriMonth", () => {
  it("only ever returns 29 or 30 days", () => {
    for (let year = 1400; year <= 1500; year++) {
      for (let month = 1; month <= 12; month++) {
        expect(daysInHijriMonth(year, month)).toBeGreaterThanOrEqual(29);
        expect(daysInHijriMonth(year, month)).toBeLessThanOrEqual(30);
      }
    }
  });

  it("wraps correctly from Dhu al-Hijjah into the next year", () => {
    expect(daysInHijriMonth(1447, 12)).toBeGreaterThanOrEqual(29);
  });
});

describe("hijriDateDifference", () => {
  it("computes a simple same-month difference", () => {
    expect(hijriDateDifference({ year: 1440, month: 3, day: 5 }, { year: 1440, month: 3, day: 20 })).toEqual({
      years: 0,
      months: 0,
      days: 15,
    });
  });

  function reconstruct(start: { year: number; month: number; day: number }, diff: { years: number; months: number; days: number }) {
    let year = start.year + diff.years;
    let month = start.month + diff.months;
    let day = start.day + diff.days;
    if (month > 12) {
      month -= 12;
      year += 1;
    }
    if (day > daysInHijriMonth(year, month)) {
      day -= daysInHijriMonth(year, month);
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return { year, month, day };
  }

  it("reconstructing start + diff lands exactly on end, including across year boundaries", () => {
    const pairs: [
      { year: number; month: number; day: number },
      { year: number; month: number; day: number },
    ][] = [
      [{ year: 1435, month: 8, day: 25 }, { year: 1448, month: 2, day: 18 }],
      [{ year: 1440, month: 11, day: 20 }, { year: 1441, month: 1, day: 10 }],
      [{ year: 1400, month: 1, day: 1 }, { year: 1400, month: 12, day: 29 }],
      [{ year: 1420, month: 6, day: 10 }, { year: 1423, month: 6, day: 5 }],
    ];

    for (const [start, end] of pairs) {
      const diff = hijriDateDifference(start, end);
      expect(reconstruct(start, diff)).toEqual(end);
    }
  });
});
