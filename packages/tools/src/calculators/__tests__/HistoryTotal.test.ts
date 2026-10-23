import { describe, it, expect } from "vitest";
import { sumHistoryResults } from "../HistoryTotal";

describe("sumHistoryResults", () => {
  it("returns zero for an empty list", () => {
    expect(sumHistoryResults([])).toEqual({ total: 0, included: 0, skipped: 0 });
  });

  it("adds whole numbers", () => {
    expect(sumHistoryResults([12, 30, 58])).toEqual({ total: 100, included: 3, skipped: 0 });
  });

  it("adds decimals exactly, without floating-point noise", () => {
    expect(sumHistoryResults([0.1, 0.2]).total).toBe(0.3);
    expect(sumHistoryResults([0.1, 0.2, 0.3]).total).toBe(0.6);
    expect(sumHistoryResults([1.005, 2.0001, 3]).total).toBe(6.0051);
  });

  it("handles negatives and cancellation to zero", () => {
    expect(sumHistoryResults([-5.5, 2.25, -0.75]).total).toBe(-4);
    expect(sumHistoryResults([0.3, -0.1, -0.2]).total).toBe(0);
    expect(Object.is(sumHistoryResults([-0]).total, 0)).toBe(true);
  });

  it("handles results printed in exponential notation", () => {
    expect(sumHistoryResults([1e-7, 2e-7]).total).toBe(3e-7);
    expect(sumHistoryResults([1.5e21, 2.5e21]).total).toBe(4e21);
    expect(sumHistoryResults([1e21, 0.5]).total).toBe(1e21 + 0.5);
  });

  it("skips errors, Infinity and NaN and counts them", () => {
    expect(sumHistoryResults([4, NaN, Infinity, -Infinity, 6])).toEqual({ total: 10, included: 2, skipped: 3 });
    expect(sumHistoryResults([NaN])).toEqual({ total: 0, included: 0, skipped: 1 });
  });
});
