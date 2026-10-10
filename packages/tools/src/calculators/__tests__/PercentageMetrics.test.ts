import { describe, it, expect } from "vitest";
import {
  nearestBenchmark,
  percentComparisons,
  percentCompoundSeries,
  percentForms,
  percentMentalSteps,
  percentSensitivity,
  percentToUndo,
  percentUpThenDown,
  percentageFrame,
  percentageInputsForShare,
} from "../PercentageMetrics";
import type { PercentageMode } from "../PercentageCalculator";

describe("percentageFrame", () => {
  it("reduces every mode to base / percent / part", () => {
    expect(percentageFrame("percent-of-number", 20, 150)).toMatchObject({ base: 150, percent: 20, part: 30, share: 20, result: 30 });
    expect(percentageFrame("what-percent", 45, 180)).toMatchObject({ base: 180, percent: 25, part: 45 });
    expect(percentageFrame("percentage-change", 80, 100)).toMatchObject({ base: 80, percent: 25, part: 20, share: 125 });
    expect(percentageFrame("reverse-percentage", 30, 12)).toMatchObject({ base: 40, percent: 30, part: 12, result: 40 });
    const d = percentageFrame("percentage-difference", 80, 100);
    expect(d.base).toBe(90);
    expect(d.percent).toBeCloseTo(22.222, 3);
  });

  it("flags division by zero", () => {
    expect(percentageFrame("what-percent", 1, 0).valid).toBe(false);
    expect(percentageFrame("percentage-change", 0, 5).valid).toBe(false);
    expect(percentageFrame("reverse-percentage", 0, 5).valid).toBe(false);
    expect(percentageFrame("percentage-difference", 3, -3).valid).toBe(false);
  });
});

describe("percentageInputsForShare", () => {
  const cases: Array<[PercentageMode, number, number]> = [
    ["percent-of-number", 20, 150],
    ["what-percent", 45, 180],
    ["percentage-change", 80, 100],
    ["reverse-percentage", 30, 12],
    ["percentage-difference", 40, 60],
    ["percentage-difference", 60, 40],
  ];
  it.each(cases)("round-trips the share for %s", (mode, a, b) => {
    const next = percentageInputsForShare(mode, a, b, 37);
    expect(percentageFrame(mode, next.first, next.second).share).toBeCloseTo(37, 9);
  });
});

describe("percentForms", () => {
  it("gives decimal, reduced fraction, per mille and basis points", () => {
    const f = percentForms(12.5);
    expect(f.decimal).toBe(0.125);
    expect(f.fraction).toEqual({ num: 1, den: 8 });
    expect(f.perMille).toBe(125);
    expect(f.basisPoints).toBe(1250);
    expect(f.oneIn).toBe(8);
    expect(f.multiplierUp).toBe(1.125);
    expect(percentForms(20).fraction).toEqual({ num: 1, den: 5 });
    expect(percentForms(0).oneIn).toBe(Infinity);
  });
});

describe("helpers", () => {
  it("finds the nearest everyday fraction", () => {
    expect(nearestBenchmark(33)).toMatchObject({ num: 1, den: 3 });
    expect(nearestBenchmark(74)).toMatchObject({ num: 3, den: 4 });
  });

  it("compounds versus adds", () => {
    const s = percentCompoundSeries(100, 10, 2);
    expect(s[2].compound).toBeCloseTo(121, 9);
    expect(s[2].simple).toBeCloseTo(120, 9);
  });

  it("undoes a percent move asymmetrically", () => {
    expect(percentToUndo(25)).toBeCloseTo(-20, 9);
    expect(percentToUndo(-20)).toBeCloseTo(25, 9);
    const u = percentUpThenDown(100, 10);
    expect(u.upDown).toBeCloseTo(99, 9);
    expect(u.netPercent).toBeCloseTo(-1, 9);
  });

  it("compares two values four ways", () => {
    const c = percentComparisons(80, 100);
    expect(c.changeAB).toBeCloseTo(25, 9);
    expect(c.changeBA).toBeCloseTo(-20, 9);
    expect(c.difference).toBeCloseTo(22.2222, 3);
    expect(c.points).toBe(20);
    expect(percentComparisons(0, 5).changeAB).toBeNull();
  });

  it("builds a percent from 10% and 1% blocks", () => {
    const m = percentMentalSteps(150, 23.5);
    expect(m.tens).toBe(2);
    expect(m.ones).toBe(3);
    expect(m.total).toBeCloseTo(35.25, 9);
    expect(percentMentalSteps(80, -15).total).toBeCloseTo(-12, 9);
  });

  it("moves the part linearly with percentage points", () => {
    expect(percentSensitivity(200, 10, 5).map((x) => x.part)).toEqual([10, 20, 30]);
  });
});
