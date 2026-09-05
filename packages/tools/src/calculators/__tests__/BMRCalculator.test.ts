import { describe, it, expect } from "vitest";
import { BMRCalculator } from "../BMRCalculator";

const calc = new BMRCalculator();
const context = { locale: "en-US" };

describe("BMRCalculator", () => {
  it("computes Harris-Benedict (1919) BMR for a man", () => {
    // 80kg, 180cm, 30yo male
    const r = calc.execute({ gender: "male", weightKg: 80, heightCm: 180, age: 30, formula: "harrisBenedict" }, context);
    expect(r.data.error).toBeNull();
    // 66.473 + 13.7516*80 + 5.0033*180 - 6.755*30
    expect(r.data.harrisBenedict).toBeCloseTo(66.473 + 13.7516 * 80 + 5.0033 * 180 - 6.755 * 30, 4);
    expect(r.data.mifflinStJeor).toBeNull();
  });

  it("computes Harris-Benedict (1919) BMR for a woman", () => {
    const r = calc.execute({ gender: "female", weightKg: 65, heightCm: 165, age: 28, formula: "harrisBenedict" }, context);
    expect(r.data.harrisBenedict).toBeCloseTo(655.0955 + 9.5634 * 65 + 1.8496 * 165 - 4.6756 * 28, 4);
  });

  it("computes Mifflin-St Jeor (1990) BMR for a man", () => {
    const r = calc.execute({ gender: "male", weightKg: 80, heightCm: 180, age: 30, formula: "mifflinStJeor" }, context);
    expect(r.data.mifflinStJeor).toBeCloseTo(10 * 80 + 6.25 * 180 - 5 * 30 + 5, 10);
    expect(r.data.harrisBenedict).toBeNull();
  });

  it("computes Mifflin-St Jeor (1990) BMR for a woman", () => {
    const r = calc.execute({ gender: "female", weightKg: 65, heightCm: 165, age: 28, formula: "mifflinStJeor" }, context);
    expect(r.data.mifflinStJeor).toBeCloseTo(10 * 65 + 6.25 * 165 - 5 * 28 - 161, 10);
  });

  it("returns both formulas and their difference in compare mode", () => {
    const r = calc.execute({ gender: "male", weightKg: 80, heightCm: 180, age: 30, formula: "compare" }, context);
    expect(r.data.harrisBenedict).not.toBeNull();
    expect(r.data.mifflinStJeor).not.toBeNull();
    expect(r.data.differenceKcal).toBeCloseTo(r.data.harrisBenedict! - r.data.mifflinStJeor!, 10);
  });

  it("rejects non-positive or unrealistic measurements", () => {
    expect(calc.execute({ gender: "male", weightKg: 0, heightCm: 180, age: 30, formula: "compare" }, context).data.error).toBe("invalid-measurements");
    expect(calc.execute({ gender: "male", weightKg: 80, heightCm: 0, age: 30, formula: "compare" }, context).data.error).toBe("invalid-measurements");
    expect(calc.execute({ gender: "male", weightKg: 80, heightCm: 180, age: 0, formula: "compare" }, context).data.error).toBe("invalid-measurements");
    expect(calc.execute({ gender: "male", weightKg: 80, heightCm: 180, age: 200, formula: "compare" }, context).data.error).toBe("invalid-measurements");
  });
});
