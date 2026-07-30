import { describe, it, expect } from "vitest";
import { BMICalculator } from "../BMICalculator";

const context = { locale: "en-US" };

describe("BMICalculator", () => {
  it("classifies underweight correctly", () => {
    const result = new BMICalculator().execute(
      { heightCm: 180, weightKg: 55 },
      context
    );
    expect(result.data.category).toBe("Underweight");
  });

  it("classifies normal weight correctly", () => {
    const result = new BMICalculator().execute(
      { heightCm: 180, weightKg: 75 },
      context
    );
    expect(result.data.category).toBe("Normal weight");
  });

  it("classifies overweight correctly", () => {
    const result = new BMICalculator().execute(
      { heightCm: 180, weightKg: 85 },
      context
    );
    expect(result.data.category).toBe("Overweight");
  });

  it("classifies obesity correctly", () => {
    const result = new BMICalculator().execute(
      { heightCm: 180, weightKg: 100 },
      context
    );
    expect(result.data.category).toBe("Obesity");
  });
});
