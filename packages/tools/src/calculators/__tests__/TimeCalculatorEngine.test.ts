import { describe, expect, it } from "vitest";
import {
  tcClockAdd,
  tcClockSpan,
  tcDefaultWorkDays,
  tcFormatClock,
  tcFormatHms,
  tcFromDecimalHours,
  tcHmsToSeconds,
  tcParseClock,
  tcParseHms,
  tcRoundDuration,
  tcSumEntries,
  tcToDecimalHours,
  tcWeekOrder,
  tcWorkWeek,
  type TcWorkDay,
} from "../TimeCalculatorEngine";

const H = 3600;
const d = (year: number, month: number, day: number) => ({ year, month, day });
const clock = (s: string) => tcParseClock(s)!;

describe("durations and parsing", () => {
  it("converts and formats h:m:s with carry and sign", () => {
    expect(tcHmsToSeconds(1, 75, 30)).toBe(2 * H + 15 * 60 + 30);
    expect(tcHmsToSeconds(-1, 0, 0)).toBeNaN();
    expect(tcFormatHms(-(7 * H + 5 * 60))).toBe("−7:05:00");
    expect(tcFormatHms(100 * H + 61, false)).toBe("100:01");
  });

  it("parses durations and clock times", () => {
    expect(tcParseHms("7:45")).toBe(7 * H + 45 * 60);
    expect(tcParseHms("-0:45:00")).toBe(-45 * 60);
    expect(tcParseHms("1:75")).toBeNull();
    expect(tcParseClock("23:59:59")).toBe(DAYS(1) - 1);
    expect(tcParseClock("24:00")).toBeNull();
  });

  it("formats 12 h and 24 h clocks", () => {
    expect(tcFormatClock(0, true)).toBe("12:00 AM");
    expect(tcFormatClock(13.5 * H, true)).toBe("1:30 PM");
    expect(tcFormatClock(12 * H, true)).toBe("12:00 PM");
    expect(tcFormatClock(6 * H + 5 * 60)).toBe("06:05");
  });
});

function DAYS(n: number) {
  return n * 86_400;
}

describe("timesheet sums", () => {
  it("sums signed entries with running totals", () => {
    const sheet = tcSumEntries([
      { sign: 1, seconds: 8 * H + 15 * 60 },
      { sign: 1, seconds: 7 * H + 50 * 60 },
      { sign: -1, seconds: 45 * 60 },
      { sign: 1, seconds: 90 * 60 },
    ]);
    expect(sheet.totalSeconds).toBe(16 * H + 50 * 60);
    expect(sheet.addedSeconds).toBe(17 * H + 35 * 60);
    expect(sheet.subtractedSeconds).toBe(45 * 60);
    expect(sheet.running).toEqual([8.25 * H, 16 * H + 5 * 60, 15 * H + 20 * 60, 16 * H + 50 * 60]);
  });

  it("goes negative when subtractions exceed additions", () => {
    expect(tcSumEntries([{ sign: 1, seconds: H }, { sign: -1, seconds: 2.5 * H }]).totalSeconds).toBe(-1.5 * H);
  });
});

describe("decimal hours (payroll)", () => {
  it("converts both directions", () => {
    expect(tcToDecimalHours(7 * H + 45 * 60)).toBe(7.75);
    expect(tcToDecimalHours(8 * H + 20 * 60)).toBe(8.33);
    expect(tcFromDecimalHours(7.75)).toBe(7 * H + 45 * 60);
    expect(tcFromDecimalHours(1.1)).toBe(H + 6 * 60);
    expect(tcFormatHms(tcFromDecimalHours(0.01))).toBe("0:00:36");
  });

  it("rounds with the 7-minute rule and up/down", () => {
    expect(tcRoundDuration(8 * H + 7 * 60, 15)).toBe(8 * H);
    expect(tcRoundDuration(8 * H + 8 * 60, 15)).toBe(8.25 * H);
    expect(tcRoundDuration(8 * H + 1 * 60, 15, "up")).toBe(8.25 * H);
    expect(tcRoundDuration(8 * H + 14 * 60, 15, "down")).toBe(8 * H);
    expect(tcRoundDuration(7 * H + 57 * 60, 6)).toBe(8 * H);
  });
});

describe("time between two clock times", () => {
  it("handles an overnight shift without dates", () => {
    const r = tcClockSpan({ startDate: d(2026, 10, 17), startClock: clock("22:00"), endClock: clock("06:00"), breakSeconds: 30 * 60 });
    expect(r.elapsedSeconds).toBe(8 * H);
    expect(r.netSeconds).toBe(7.5 * H);
    expect(r.dayOffset).toBe(1);
    expect(r.endDate).toEqual(d(2026, 10, 18));
  });

  it("treats equal start and end as a 24 h span", () => {
    expect(tcClockSpan({ startDate: d(2026, 1, 5), startClock: clock("07:00"), endClock: clock("07:00") }).elapsedSeconds).toBe(24 * H);
  });

  it("spans several days with explicit dates", () => {
    const r = tcClockSpan({ startDate: d(2026, 10, 17), startClock: clock("09:00"), endDate: d(2026, 10, 19), endClock: clock("17:30") });
    expect(r.elapsedSeconds).toBe(56.5 * H);
    expect(r.dayOffset).toBe(2);
  });

  it("is negative when an explicit end is before the start", () => {
    const r = tcClockSpan({ startDate: d(2026, 10, 17), startClock: clock("09:00"), endDate: d(2026, 10, 17), endClock: clock("08:00") });
    expect(r.negative).toBe(true);
    expect(r.elapsedSeconds).toBe(-H);
  });

  it("counts the extra hour when clocks go back during a night shift (London, 25 Oct 2026)", () => {
    const r = tcClockSpan({ startDate: d(2026, 10, 24), startClock: clock("22:00"), endClock: clock("06:00"), zone: "Europe/London" });
    expect(r.wallSeconds).toBe(8 * H);
    expect(r.elapsedSeconds).toBe(9 * H);
    expect(r.dstDeltaSeconds).toBe(H);
    expect(r.transitions).toHaveLength(1);
    expect(r.startOffsetMinutes).toBe(60);
    expect(r.endOffsetMinutes).toBe(0);
  });

  it("loses an hour when clocks go forward (New York, 8 Mar 2026)", () => {
    const r = tcClockSpan({ startDate: d(2026, 3, 7), startClock: clock("22:00"), endClock: clock("06:00"), zone: "America/New_York" });
    expect(r.elapsedSeconds).toBe(7 * H);
    expect(r.dstDeltaSeconds).toBe(-H);
  });

  it("flags non-existent and repeated wall times", () => {
    const gap = tcClockSpan({ startDate: d(2026, 3, 29), startClock: clock("01:30"), endClock: clock("05:00"), zone: "Europe/London" });
    expect(gap.startStatus).toBe("gap");
    const overlap = tcClockSpan({ startDate: d(2026, 10, 25), startClock: clock("00:30"), endClock: clock("01:30"), zone: "Europe/London" });
    expect(overlap.endStatus).toBe("overlap");
  });

  it("has no DST effect in a zone without DST", () => {
    const r = tcClockSpan({ startDate: d(2026, 10, 24), startClock: clock("22:00"), endClock: clock("06:00"), zone: "Asia/Riyadh" });
    expect(r.elapsedSeconds).toBe(8 * H);
    expect(r.dstDeltaSeconds).toBe(0);
  });
});

describe("clock time ± duration", () => {
  it("rolls over midnight with a day offset", () => {
    const r = tcClockAdd({ date: d(2026, 10, 17), clock: clock("21:30"), deltaSeconds: 10 * H + 45 * 60 });
    expect(tcFormatClock(r.resultClock)).toBe("08:15");
    expect(r.dayOffset).toBe(1);
    expect(r.dstDeltaSeconds).toBe(0);
  });

  it("goes back to the previous day when subtracting", () => {
    const r = tcClockAdd({ date: d(2026, 10, 17), clock: clock("01:00"), deltaSeconds: -2 * H });
    expect(tcFormatClock(r.resultClock)).toBe("23:00");
    expect(r.dayOffset).toBe(-1);
    expect(r.resultDate).toEqual(d(2026, 10, 16));
  });

  it("shows the wall clock one hour earlier after clocks go back", () => {
    const r = tcClockAdd({ date: d(2026, 10, 24), clock: clock("23:00"), deltaSeconds: 9 * H, zone: "Europe/London" });
    expect(tcFormatClock(r.resultClock)).toBe("07:00");
    expect(tcFormatClock(r.naiveClock)).toBe("08:00");
    expect(r.dstDeltaSeconds).toBe(-H);
    expect(r.dayOffset).toBe(1);
  });

  it("shows the wall clock one hour later after clocks go forward", () => {
    const r = tcClockAdd({ date: d(2026, 3, 7), clock: clock("23:00"), deltaSeconds: 8 * H, zone: "America/New_York" });
    expect(tcFormatClock(r.resultClock)).toBe("08:00");
    expect(r.dstDeltaSeconds).toBe(H);
  });
});

describe("work week and overtime", () => {
  const day = (start: string, end: string, breakMin: number, on = true): TcWorkDay => ({ on, start: clock(start), end: clock(end), breakSeconds: breakMin * 60 });
  const off = day("00:00", "00:00", 0, false);
  // Sun–Thu work week (Fri–Sat weekend).
  const days = [day("08:00", "17:00", 60), day("08:00", "17:30", 60), day("08:30", "19:00", 45), day("08:00", "17:00", 60), day("07:30", "16:00", 30), off, off];

  it("puts weekly overtime on the days after the threshold is crossed", () => {
    const r = tcWorkWeek({ days, order: tcWeekOrder("fri-sat"), basis: "weekly", weeklyThresholdSeconds: 40 * H, dailyThresholdSeconds: 8 * H, overtimeMultiplier: 1.5 });
    expect(r.totalSeconds).toBe(42.25 * H);
    expect(r.overtimeSeconds).toBe(2.25 * H);
    expect(r.regularSeconds).toBe(40 * H);
    expect(r.days[4].overtimeSeconds).toBe(2.25 * H);
    expect(r.days[3].overtimeSeconds).toBe(0);
    expect(r.workDays).toBe(5);
    expect(r.paidEquivalentSeconds).toBe(40 * H + 3.375 * H);
    expect(r.longestWeekday).toBe(2);
  });

  it("computes daily overtime per day", () => {
    const r = tcWorkWeek({ days, basis: "daily", weeklyThresholdSeconds: 40 * H, dailyThresholdSeconds: 8 * H, overtimeMultiplier: 1.5 });
    expect(r.overtimeSeconds).toBe(0.5 * H + 1.75 * H);
  });

  it("counts an overnight work day", () => {
    const night = [day("22:00", "06:00", 30), off, off, off, off, off, off];
    const r = tcWorkWeek({ days: night, basis: "weekly", weeklyThresholdSeconds: 40 * H, dailyThresholdSeconds: 8 * H, overtimeMultiplier: 1.5 });
    expect(r.days[0].overnight).toBe(true);
    expect(r.totalSeconds).toBe(7.5 * H);
    expect(r.overtimeSeconds).toBe(0);
  });

  it("derives work days and counting order from the weekend preset", () => {
    expect(tcDefaultWorkDays("fri-sat")).toEqual([true, true, true, true, true, false, false]);
    expect(tcDefaultWorkDays("sat-sun")).toEqual([false, true, true, true, true, true, false]);
    expect(tcWeekOrder("sat-sun")[0]).toBe(1);
  });
});
