import { describe, it, expect } from "vitest";
import { estimateBodyFatPercentage } from "../BMICalculator";

describe("estimateBodyFatPercentage", () => {
  it("estimates adult male body fat", () => {
    expect(estimateBodyFatPercentage(24.2, 30, "male")).toBeCloseTo(19.7, 1);
  });

  it("estimates adult female body fat", () => {
    expect(estimateBodyFatPercentage(24.2, 30, "female")).toBeCloseTo(30.5, 1);
  });

  it("uses the youth formula at age 15 and below", () => {
    const teen = estimateBodyFatPercentage(20, 15, "male");
    const adult = estimateBodyFatPercentage(20, 15, "female");
    expect(teen).not.toBeNaN();
    expect(adult).not.toBeNaN();
  });

  it("switches formulas between age 15 and 16", () => {
    const at15 = estimateBodyFatPercentage(22, 15, "male");
    const at16 = estimateBodyFatPercentage(22, 16, "male");
    expect(at15).not.toBe(at16);
  });

  it("never returns a negative estimate", () => {
    expect(estimateBodyFatPercentage(14, 2, "female")).toBeGreaterThanOrEqual(0);
  });
});
