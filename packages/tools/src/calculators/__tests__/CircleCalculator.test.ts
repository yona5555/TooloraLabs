import { describe, it, expect } from "vitest";
import { CircleCalculator } from "../CircleCalculator";

const context = { locale: "en-US" };
const calc = new CircleCalculator();

describe("CircleCalculator", () => {
  it("derives diameter, circumference, and area from a given radius", () => {
    const r = calc.execute({ knownField: "radius", value: 5 }, context);
    expect(r.data.radius).toBe(5);
    expect(r.data.diameter).toBe(10);
    expect(r.data.circumference).toBeCloseTo(2 * Math.PI * 5, 10);
    expect(r.data.area).toBeCloseTo(Math.PI * 25, 10);
  });

  it("derives radius, circumference, and area from a given diameter", () => {
    const r = calc.execute({ knownField: "diameter", value: 10 }, context);
    expect(r.data.radius).toBe(5);
    expect(r.data.diameter).toBe(10);
  });

  it("derives radius from a given circumference", () => {
    const r = calc.execute({ knownField: "circumference", value: 2 * Math.PI * 3 }, context);
    expect(r.data.radius).toBeCloseTo(3, 10);
    expect(r.data.area).toBeCloseTo(Math.PI * 9, 10);
  });

  it("derives radius from a given area", () => {
    const r = calc.execute({ knownField: "area", value: Math.PI * 16 }, context);
    expect(r.data.radius).toBeCloseTo(4, 10);
    expect(r.data.diameter).toBeCloseTo(8, 10);
  });

  it("round-trips consistently regardless of which field was the input", () => {
    const fromRadius = calc.execute({ knownField: "radius", value: 7 }, context).data;
    const fromArea = calc.execute({ knownField: "area", value: fromRadius.area }, context).data;
    expect(fromArea.radius).toBeCloseTo(fromRadius.radius, 8);
    expect(fromArea.circumference).toBeCloseTo(fromRadius.circumference, 8);
  });

  it("flags non-positive or non-finite values as invalid", () => {
    expect(calc.execute({ knownField: "radius", value: 0 }, context).data.error).toBe("invalid-value");
    expect(calc.execute({ knownField: "radius", value: -2 }, context).data.error).toBe("invalid-value");
    expect(calc.execute({ knownField: "area", value: NaN }, context).data.error).toBe("invalid-value");
  });
});
