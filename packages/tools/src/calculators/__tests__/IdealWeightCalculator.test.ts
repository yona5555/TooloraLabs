import { describe, it, expect } from "vitest";
import { calculateIdealWeight } from "../IdealWeightCalculator";

describe("calculateIdealWeight", () => {
  it("matches known reference values for a male at 175cm", () => {
    const result = calculateIdealWeight("male", 175);
    expect(result.devine).toBeCloseTo(70.46, 1);
    expect(result.robinson).toBeCloseTo(68.91, 1);
    expect(result.miller).toBeCloseTo(68.75, 1);
    expect(result.hamwi).toBeCloseTo(72.02, 1);
    expect(result.average).toBeCloseTo(70.03, 1);
  });

  it("matches known reference values for a female at 165cm", () => {
    const result = calculateIdealWeight("female", 165);
    expect(result.devine).toBeCloseTo(56.91, 1);
    expect(result.robinson).toBeCloseTo(57.43, 1);
    expect(result.miller).toBeCloseTo(59.85, 1);
    expect(result.hamwi).toBeCloseTo(56.41, 1);
    expect(result.average).toBeCloseTo(57.65, 1);
  });

  it("produces a higher estimate for a taller person of the same gender", () => {
    const shorter = calculateIdealWeight("male", 170);
    const taller = calculateIdealWeight("male", 190);
    expect(taller.average).toBeGreaterThan(shorter.average);
  });

  it("produces different estimates for male and female at the same height", () => {
    const male = calculateIdealWeight("male", 170);
    const female = calculateIdealWeight("female", 170);
    expect(male.average).not.toBeCloseTo(female.average, 1);
  });

  it("returns a zeroed result for invalid inputs", () => {
    expect(calculateIdealWeight("male", 0)).toEqual({ devine: 0, robinson: 0, miller: 0, hamwi: 0, average: 0 });
    expect(calculateIdealWeight("male", -170).average).toBe(0);
    // @ts-expect-error testing invalid gender input
    expect(calculateIdealWeight("other", 170).average).toBe(0);
  });
});
