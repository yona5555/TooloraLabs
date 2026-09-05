import { describe, it, expect } from "vitest";
import { DateCalculator } from "../DateCalculator";

const calc = new DateCalculator();
const context = { locale: "en-US" };

describe("DateCalculator", () => {
  describe("difference mode", () => {
    it("computes the total days and years/months/days breakdown between two dates", () => {
      const r = calc.execute({ mode: "difference", startDate: "2020-01-01", endDate: "2025-06-15" }, context);
      expect(r.data.error).toBeNull();
      expect(r.data.difference!.years).toBe(5);
      expect(r.data.difference!.months).toBe(5);
      expect(r.data.difference!.days).toBe(14);
      expect(r.data.difference!.isEndBeforeStart).toBe(false);
    });

    it("computes total days and weeks correctly", () => {
      const r = calc.execute({ mode: "difference", startDate: "2026-01-01", endDate: "2026-01-15" }, context);
      expect(r.data.difference!.totalDays).toBe(14);
      expect(r.data.difference!.totalWeeks).toBe(2);
    });

    it("handles an end date before the start date by treating the span as absolute", () => {
      const r = calc.execute({ mode: "difference", startDate: "2026-01-15", endDate: "2026-01-01" }, context);
      expect(r.data.difference!.totalDays).toBe(14);
      expect(r.data.difference!.isEndBeforeStart).toBe(true);
    });

    it("returns zero difference for the same date", () => {
      const r = calc.execute({ mode: "difference", startDate: "2026-03-01", endDate: "2026-03-01" }, context);
      expect(r.data.difference!.totalDays).toBe(0);
    });

    it("rejects an invalid end date", () => {
      const r = calc.execute({ mode: "difference", startDate: "2026-01-01", endDate: "nope" }, context);
      expect(r.data.error).toBe("invalid-date");
    });
  });

  describe("addSubtract mode", () => {
    it("adds days to a date", () => {
      const r = calc.execute({ mode: "addSubtract", startDate: "2026-01-01", amount: 10, unit: "days", operation: "add" }, context);
      expect(r.data.resultDateISO).toBe("2026-01-11");
    });

    it("subtracts weeks from a date", () => {
      const r = calc.execute({ mode: "addSubtract", startDate: "2026-01-15", amount: 2, unit: "weeks", operation: "subtract" }, context);
      expect(r.data.resultDateISO).toBe("2026-01-01");
    });

    it("adds months to a date", () => {
      const r = calc.execute({ mode: "addSubtract", startDate: "2026-01-31", amount: 1, unit: "months", operation: "add" }, context);
      expect(r.data.resultDateISO).toBe("2026-02-28");
    });

    it("adds years to a date", () => {
      const r = calc.execute({ mode: "addSubtract", startDate: "2020-02-29", amount: 1, unit: "years", operation: "add" }, context);
      expect(r.data.resultDateISO).toBe("2021-02-28");
    });

    it("rejects a negative amount", () => {
      const r = calc.execute({ mode: "addSubtract", startDate: "2026-01-01", amount: -5, unit: "days", operation: "add" }, context);
      expect(r.data.error).toBe("invalid-amount");
    });

    it("rejects an invalid start date", () => {
      const r = calc.execute({ mode: "addSubtract", startDate: "nope", amount: 5, unit: "days", operation: "add" }, context);
      expect(r.data.error).toBe("invalid-date");
    });
  });
});
