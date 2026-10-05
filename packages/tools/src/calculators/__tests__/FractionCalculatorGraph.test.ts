import { describe, it, expect } from "vitest";
import { gcd, lcm, euclidSteps, decimalExpansion, multiplesUntil, contributionShare, crossMultiplyCompare, benchmarkPosition } from "../FractionCalculatorGraph";

describe("gcd / lcm", () => {
  it("default example: gcd(5,6)=1, lcm(2,3)=6", () => {
    expect(gcd(5, 6)).toBe(1);
    expect(lcm(2, 3)).toBe(6);
  });
  it("handles zero gracefully", () => {
    expect(gcd(0, 5)).toBe(5);
    expect(lcm(0, 5)).toBe(1); // guarded fallback, never 0/NaN
  });
});

describe("euclidSteps", () => {
  it("matches the default 6,5 example (gcd=1 after 2 Euclid steps)", () => {
    const steps = euclidSteps(6, 5);
    expect(steps.length).toBe(2);
    expect(steps[0]).toEqual({ a: 6, b: 5, q: 1, r: 1 });
    expect(steps[1]).toEqual({ a: 5, b: 1, q: 5, r: 0 });
  });
  it("terminates for any real pair (no infinite loop)", () => {
    expect(euclidSteps(123456, 789).length).toBeLessThan(50);
  });
});

describe("decimalExpansion", () => {
  it("1/2 terminates", () => {
    const r = decimalExpansion(1, 2);
    expect(r.kind).toBe("terminates");
  });
  it("1/3 repeats with cycle '3'", () => {
    const r = decimalExpansion(1, 3);
    expect(r.kind).toBe("repeats");
    if (r.kind === "repeats") expect(r.repeating).toBe("3");
  });
  it("5/6 repeats (0.8333...)", () => {
    const r = decimalExpansion(5, 6);
    expect(r.kind).toBe("repeats");
    if (r.kind === "repeats") {
      expect(r.nonRepeating).toBe("8");
      expect(r.repeating).toBe("3");
    }
  });
});

describe("multiplesUntil", () => {
  it("finds LCD(2,3)=6 as the first shared multiple", () => {
    const m2 = multiplesUntil(2, 6);
    const m3 = multiplesUntil(3, 6);
    const shared = m2.find((x) => m3.includes(x));
    expect(shared).toBe(6);
  });
});

describe("contributionShare", () => {
  it("add: 1/2+1/3=5/6 splits 60/40 between A and B", () => {
    const s = contributionShare("add", 0.5, 1 / 3, 5 / 6);
    expect(s.fromA).toBeCloseTo(0.6, 5);
    expect(s.fromB).toBeCloseTo(0.4, 5);
  });
});

describe("crossMultiplyCompare", () => {
  it("1/2 vs 1/3: 1*3=3 > 1*2=2, so A is larger", () => {
    const c = crossMultiplyCompare(1, 2, 1, 3);
    expect(c.crossA).toBe(3);
    expect(c.crossB).toBe(2);
    expect(c.larger).toBe("A");
  });
  it("detects equal fractions", () => {
    const c = crossMultiplyCompare(1, 2, 2, 4);
    expect(c.larger).toBe("equal");
  });
});

describe("benchmarkPosition", () => {
  it("clamps to [0,1]", () => {
    expect(benchmarkPosition(-0.5)).toBe(0);
    expect(benchmarkPosition(1.5)).toBe(1);
    expect(benchmarkPosition(5 / 6)).toBeCloseTo(5 / 6, 9);
  });
});
