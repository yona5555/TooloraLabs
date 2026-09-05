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

  it("reports trimester 2 starting at week 13", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-04-02" }, context); // 91 days = 13 weeks
    expect(r.data.gestationalAgeWeeks).toBe(13);
    expect(r.data.trimester).toBe(2);
  });

  it("reports trimester 3 starting at week 27", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", referenceDate: "2026-07-09" }, context); // 189 days = 27 weeks
    expect(r.data.gestationalAgeWeeks).toBe(27);
    expect(r.data.trimester).toBe(3);
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
