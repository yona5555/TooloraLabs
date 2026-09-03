import { describe, expect, it } from "vitest";
import { SurfaceAreaCalculator, type SurfaceAreaCalculatorInput } from "../SurfaceAreaCalculator";

const tool = new SurfaceAreaCalculator();
function run(input: SurfaceAreaCalculatorInput) {
  return tool.execute(input, { locale: "en-US" }).data;
}

describe("SurfaceAreaCalculator", () => {
  it("computes a cube's surface area", () => {
    expect(run({ shape: "cube", side: 3 }).surfaceArea).toBe(54);
  });

  it("computes a rectangular prism's surface area", () => {
    expect(run({ shape: "rectangular-prism", length: 2, width: 3, height: 4 }).surfaceArea).toBe(52);
  });

  it("computes a sphere's surface area", () => {
    expect(run({ shape: "sphere", radius: 3 }).surfaceArea).toBeCloseTo(113.097336, 5);
  });

  it("computes a cylinder's surface area", () => {
    expect(run({ shape: "cylinder", radius: 2, height: 5 }).surfaceArea).toBeCloseTo(87.9645943, 5);
  });

  it("computes a cone's surface area from radius and perpendicular height", () => {
    // radius 3, height 4 -> slant height 5 (3-4-5 triangle)
    const result = run({ shape: "cone", radius: 3, height: 4 });
    expect(result.surfaceArea).toBeCloseTo(Math.PI * 3 * (3 + 5), 5);
  });

  it("computes a square pyramid's surface area from base side and perpendicular height", () => {
    const result = run({ shape: "square-pyramid", baseSide: 6, height: 4 });
    const slant = Math.sqrt(4 * 4 + 3 * 3);
    expect(result.surfaceArea).toBeCloseTo(36 + 2 * 6 * slant, 5);
  });

  it("flags missing dimensions", () => {
    expect(run({ shape: "cube" }).error).toBe("missing-dimension");
  });

  it("flags non-positive dimensions", () => {
    expect(run({ shape: "sphere", radius: 0 }).error).toBe("invalid-dimension");
  });
});
