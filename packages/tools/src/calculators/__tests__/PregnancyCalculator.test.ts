import { describe, it, expect } from "vitest";
import { PregnancyCalculator } from "../PregnancyCalculator";

const calc = new PregnancyCalculator();
const context = { locale: "en-US" };

describe("PregnancyCalculator", () => {
  it("computes gestational age of 0 weeks 0 days on the LMP date itself", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.gestationalAgeWeeks).toBe(0);
    expect(r.data.gestationalAgeDays).toBe(0);
    expect(r.data.trimester).toBe(1);
  });

  it("computes the due date as 280 days after LMP", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-01-01" }, context);
    expect(r.data.dueDateISO).toBe("2026-10-08");
    expect(r.data.daysUntilDue).toBe(280);
  });

  // ACOG: 1st 0w0d–13w6d, 2nd 14w0d–27w6d, 3rd 28w0d onwards (LMP 2026-01-01).
  it.each([
    ["2026-04-08", 13, 6, 1], // day 97
    ["2026-04-09", 14, 0, 2], // day 98
    ["2026-07-15", 27, 6, 2], // day 195
    ["2026-07-16", 28, 0, 3], // day 196
  ])("on %s (%iw%id) reports trimester %i", (referenceDate, weeks, days, trimester) => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate }, context);
    expect(r.data.gestationalAgeWeeks).toBe(weeks);
    expect(r.data.gestationalAgeDays).toBe(days);
    expect(r.data.trimester).toBe(trimester);
  });

  it("returns a size-comparison milestone once past week 4", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-02-01" }, context); // ~4-5 weeks
    expect(r.data.currentWeekMilestone).not.toBeNull();
    expect(r.data.currentWeekMilestone!.week).toBeGreaterThanOrEqual(4);
  });

  it("returns no milestone before week 4", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-01-10" }, context); // 9 days ~ 1 week
    expect(r.data.currentWeekMilestone).toBeNull();
  });

  it("computes percent complete relative to 280 days", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-10-08" }, context); // exactly due date
    expect(r.data.percentComplete).toBe(100);
  });

  it("rejects a date in the future relative to the reference date", () => {
    const r = calc.execute({ lastPeriodDate: "2026-06-01", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBe("date-in-future");
  });

  it("rejects an invalid date string", () => {
    const r = calc.execute({ lastPeriodDate: "not-a-date", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBe("invalid-date");
  });

  it("rejects a pregnancy far beyond full term", () => {
    const r = calc.execute({ lastPeriodDate: "2025-01-01", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBe("beyond-full-term");
  });
});
