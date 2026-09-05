import { describe, it, expect } from "vitest";
import { TimeCalculator } from "../TimeCalculator";

const calc = new TimeCalculator();
const context = { locale: "en-US" };

describe("TimeCalculator", () => {
  it("adds two durations with second/minute carry-over", () => {
    const r = calc.execute(
      { time1: { hours: 1, minutes: 45, seconds: 30 }, time2: { hours: 0, minutes: 30, seconds: 40 }, operation: "add" },
      context,
    );
    expect(r.data.error).toBeNull();
    // 1:45:30 + 0:30:40 = 2:16:10
    expect(r.data.result).toEqual({ hours: 2, minutes: 16, seconds: 10 });
    expect(r.data.totalSeconds).toBe(2 * 3600 + 16 * 60 + 10);
  });

  it("subtracts a smaller duration from a larger one", () => {
    const r = calc.execute(
      { time1: { hours: 3, minutes: 0, seconds: 0 }, time2: { hours: 1, minutes: 15, seconds: 0 }, operation: "subtract" },
      context,
    );
    expect(r.data.result).toEqual({ hours: 1, minutes: 45, seconds: 0 });
    expect(r.data.isNegative).toBe(false);
  });

  it("returns a negative result when subtracting a larger duration from a smaller one", () => {
    const r = calc.execute(
      { time1: { hours: 1, minutes: 0, seconds: 0 }, time2: { hours: 2, minutes: 30, seconds: 0 }, operation: "subtract" },
      context,
    );
    expect(r.data.isNegative).toBe(true);
    expect(r.data.totalSeconds).toBe(-90 * 60);
    // magnitude broken down as 1h 30m
    expect(r.data.result).toEqual({ hours: 1, minutes: 30, seconds: 0 });
  });

  it("handles a zero result", () => {
    const r = calc.execute(
      { time1: { hours: 1, minutes: 0, seconds: 0 }, time2: { hours: 1, minutes: 0, seconds: 0 }, operation: "subtract" },
      context,
    );
    expect(r.data.result).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(r.data.isNegative).toBe(false);
  });

  it("rejects minutes or seconds out of the 0-59 range", () => {
    expect(calc.execute({ time1: { hours: 1, minutes: 60, seconds: 0 }, time2: { hours: 0, minutes: 0, seconds: 0 }, operation: "add" }, context).data.error).toBe("invalid-time");
    expect(calc.execute({ time1: { hours: 1, minutes: 0, seconds: 60 }, time2: { hours: 0, minutes: 0, seconds: 0 }, operation: "add" }, context).data.error).toBe("invalid-time");
  });

  it("rejects negative components", () => {
    expect(calc.execute({ time1: { hours: -1, minutes: 0, seconds: 0 }, time2: { hours: 0, minutes: 0, seconds: 0 }, operation: "add" }, context).data.error).toBe("invalid-time");
  });
});
