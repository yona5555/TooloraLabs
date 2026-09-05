import { describe, it, expect } from "vitest";
import { OvulationCalculator } from "../OvulationCalculator";

const calc = new OvulationCalculator();
const context = { locale: "en-US" };

describe("OvulationCalculator", () => {
  it("estimates ovulation 14 days before the next period for a standard 28-day cycle", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01" }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.cycles).toHaveLength(3);
    const first = r.data.cycles[0];
    expect(first.nextPeriodDateISO).toBe("2026-01-29"); // +28 days
    expect(first.ovulationDateISO).toBe("2026-01-15"); // next period - 14
  });

  it("computes the fertile window as 5 days before through 1 day after ovulation", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01" }, context);
    const first = r.data.cycles[0];
    expect(first.fertileWindowStartISO).toBe("2026-01-10"); // ovulation - 5
    expect(first.fertileWindowEndISO).toBe("2026-01-16"); // ovulation + 1
  });

  it("projects three consecutive cycles", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01" }, context);
    expect(r.data.cycles.map((c) => c.nextPeriodDateISO)).toEqual(["2026-01-29", "2026-02-26", "2026-03-26"]);
  });

  it("adjusts ovulation timing for a custom luteal phase length", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", lutealPhaseDays: 12 }, context);
    const first = r.data.cycles[0];
    expect(first.ovulationDateISO).toBe("2026-01-17"); // next period (Jan 29) - 12
  });

  it("adjusts for a longer average cycle length", () => {
    const r = calc.execute({ lastPeriodDate: "2026-01-01", cycleLengthDays: 35 }, context);
    const first = r.data.cycles[0];
    expect(first.nextPeriodDateISO).toBe("2026-02-05"); // +35 days
    expect(first.ovulationDateISO).toBe("2026-01-22"); // next period - 14
  });

  it("rejects an invalid date", () => {
    expect(calc.execute({ lastPeriodDate: "nope" }, context).data.error).toBe("invalid-date");
  });

  it("rejects an out-of-range cycle length", () => {
    expect(calc.execute({ lastPeriodDate: "2026-01-01", cycleLengthDays: 10 }, context).data.error).toBe("invalid-cycle-length");
  });

  it("rejects an out-of-range luteal phase", () => {
    expect(calc.execute({ lastPeriodDate: "2026-01-01", lutealPhaseDays: 5 }, context).data.error).toBe("invalid-luteal-phase");
    expect(calc.execute({ lastPeriodDate: "2026-01-01", lutealPhaseDays: 20 }, context).data.error).toBe("invalid-luteal-phase");
  });
});
