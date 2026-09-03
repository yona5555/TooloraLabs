import { describe, expect, it } from "vitest";
import { AreaCalculator, type AreaCalculatorInput } from "../AreaCalculator";

const tool = new AreaCalculator();
function run(input: AreaCalculatorInput) {
  return tool.execute(input, { locale: "en-US" }).data;
}

describe("AreaCalculator", () => {
  it("computes a square's area", () => {
    expect(run({ shape: "square", side: 4 }).area).toBe(16);
  });

  it("computes a rectangle's area", () => {
    expect(run({ shape: "rectangle", width: 5, height: 3 }).area).toBe(15);
  });

  it("computes a triangle's area", () => {
    expect(run({ shape: "triangle", base: 6, height: 4 }).area).toBe(12);
  });

  it("computes a circle's area", () => {
    expect(run({ shape: "circle", radius: 3 }).area).toBeCloseTo(28.2743339, 5);
  });

  it("computes an ellipse's area", () => {
    expect(run({ shape: "ellipse", semiMajorAxis: 5, semiMinorAxis: 2 }).area).toBeCloseTo(31.4159265, 5);
  });

  it("computes a trapezoid's area", () => {
    expect(run({ shape: "trapezoid", base1: 4, base2: 6, height: 3 }).area).toBe(15);
  });

  it("computes a parallelogram's area", () => {
    expect(run({ shape: "parallelogram", base: 8, height: 2.5 }).area).toBe(20);
  });

  it("computes a circular sector's area", () => {
    expect(run({ shape: "sector", radius: 4, angleDegrees: 90 }).area).toBeCloseTo(12.5663706, 5);
  });

  it("flags missing dimensions", () => {
    const result = run({ shape: "square" });
    expect(result.error).toBe("missing-dimension");
    expect(result.area).toBe(0);
  });

  it("flags non-positive dimensions", () => {
    const result = run({ shape: "rectangle", width: -2, height: 3 });
    expect(result.error).toBe("invalid-dimension");
  });

  it("flags a sector angle over 360 degrees", () => {
    const result = run({ shape: "sector", radius: 2, angleDegrees: 400 });
    expect(result.error).toBe("invalid-dimension");
  });
});
