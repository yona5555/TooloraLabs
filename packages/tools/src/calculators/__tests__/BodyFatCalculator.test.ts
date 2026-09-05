import { describe, it, expect } from "vitest";
import { BodyFatCalculator } from "../BodyFatCalculator";

const context = { locale: "en-US" };
const calc = new BodyFatCalculator();

describe("BodyFatCalculator", () => {
  it("computes body fat percent for a man using the US Navy formula", () => {
    // height=180cm, neck=38cm, waist=85cm
    const r = calc.execute({ gender: "male", heightCm: 180, neckCm: 38, waistCm: 85 }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.bodyFatPercent).toBeGreaterThan(10);
    expect(r.data.bodyFatPercent).toBeLessThan(25);
  });

  it("computes body fat percent for a woman using the US Navy formula", () => {
    // height=165cm, neck=32cm, waist=70cm, hip=95cm
    const r = calc.execute({ gender: "female", heightCm: 165, neckCm: 32, waistCm: 70, hipCm: 95 }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.bodyFatPercent).toBeGreaterThan(15);
    expect(r.data.bodyFatPercent).toBeLessThan(35);
  });

  it("categorizes a low body fat percent as athletes for men", () => {
    const r = calc.execute({ gender: "male", heightCm: 190, neckCm: 40, waistCm: 78 }, context);
    expect(["essential", "athletes"]).toContain(r.data.category);
  });

  it("requires hip measurement for women", () => {
    const r = calc.execute({ gender: "female", heightCm: 165, neckCm: 32, waistCm: 70 }, context);
    expect(r.data.error).toBe("invalid-measurements");
  });

  it("rejects a waist measurement not greater than the neck", () => {
    const r = calc.execute({ gender: "male", heightCm: 180, neckCm: 40, waistCm: 35 }, context);
    expect(r.data.error).toBe("invalid-measurements");
  });

  it("rejects non-positive measurements", () => {
    expect(calc.execute({ gender: "male", heightCm: 0, neckCm: 38, waistCm: 85 }, context).data.error).toBe("invalid-measurements");
    expect(calc.execute({ gender: "male", heightCm: 180, neckCm: -5, waistCm: 85 }, context).data.error).toBe("invalid-measurements");
  });
});
