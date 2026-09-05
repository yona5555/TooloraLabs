import { describe, it, expect } from "vitest";
import { DueDateCalculator } from "../DueDateCalculator";

const calc = new DueDateCalculator();
const context = { locale: "en-US" };

describe("DueDateCalculator", () => {
  it("computes a due date 280 days after LMP for a standard 28-day cycle", () => {
    const r = calc.execute({ method: "lmp", date: "2026-01-01", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.dueDateISO).toBe("2026-10-08"); // 2026-01-01 + 280 days
    expect(r.data.conceptionDateISO).toBe("2026-01-15"); // LMP + 14
  });

  it("adjusts the due date forward for a longer-than-average cycle", () => {
    const r = calc.execute({ method: "lmp", date: "2026-01-01", cycleLengthDays: 35, referenceDate: "2026-01-01" }, context);
    // ovulation day 21 instead of 14 -> due date shifts 7 days later than the 28-day case
    expect(r.data.dueDateISO).toBe("2026-10-15");
  });

  it("computes a due date 266 days after a known conception date", () => {
    const r = calc.execute({ method: "conception", date: "2026-01-15", referenceDate: "2026-01-15" }, context);
    expect(r.data.dueDateISO).toBe("2026-10-08");
  });

  it("computes a due date for a 5-day IVF transfer", () => {
    const r = calc.execute({ method: "ivf5day", date: "2026-01-20", referenceDate: "2026-01-20" }, context);
    // conception = transfer - 5 days = 2026-01-15, due date = +266 = 2026-10-08
    expect(r.data.dueDateISO).toBe("2026-10-08");
  });

  it("computes gestational age and trimester as of the reference date", () => {
    const r = calc.execute({ method: "lmp", date: "2026-01-01", referenceDate: "2026-05-01" }, context);
    expect(r.data.gestationalAgeWeeks).toBeGreaterThan(13);
    expect(r.data.trimester).toBe(2);
  });

  it("reports trimester 1 near the start of pregnancy", () => {
    const r = calc.execute({ method: "lmp", date: "2026-01-01", referenceDate: "2026-01-08" }, context);
    expect(r.data.trimester).toBe(1);
  });

  it("rejects a date in the future relative to the reference date", () => {
    const r = calc.execute({ method: "lmp", date: "2026-06-01", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBe("date-in-future");
  });

  it("rejects an out-of-range cycle length", () => {
    const r = calc.execute({ method: "lmp", date: "2026-01-01", cycleLengthDays: 10, referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBe("invalid-cycle-length");
  });

  it("rejects an invalid date string", () => {
    const r = calc.execute({ method: "lmp", date: "not-a-date", referenceDate: "2026-01-01" }, context);
    expect(r.data.error).toBe("invalid-date");
  });
});
