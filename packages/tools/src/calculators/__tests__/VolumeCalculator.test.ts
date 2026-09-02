import { describe, expect, it } from "vitest";
import { VolumeCalculator, type VolumeCalculatorInput } from "../VolumeCalculator";

const tool = new VolumeCalculator();
function run(input: VolumeCalculatorInput) {
  return tool.execute(input, { locale: "en-US" }).data;
}

describe("VolumeCalculator", () => {
  it("computes a cube's volume", () => {
    expect(run({ shape: "cube", side: 3 }).volume).toBe(27);
  });

  it("computes a rectangular prism's volume", () => {
    expect(run({ shape: "rectangular-prism", length: 2, width: 3, height: 4 }).volume).toBe(24);
  });

  it("computes a sphere's volume", () => {
    expect(run({ shape: "sphere", radius: 3 }).volume).toBeCloseTo(113.097336, 5);
  });

  it("computes a cylinder's volume", () => {
    expect(run({ shape: "cylinder", radius: 2, height: 5 }).volume).toBeCloseTo(62.8318531, 5);
  });

  it("computes a cone's volume", () => {
    expect(run({ shape: "cone", radius: 3, height: 4 }).volume).toBeCloseTo(37.6991118, 5);
  });

  it("computes a square pyramid's volume", () => {
    expect(run({ shape: "square-pyramid", baseSide: 6, height: 4 }).volume).toBe(48);
  });

  it("flags missing dimensions", () => {
    expect(run({ shape: "cylinder", radius: 2 }).error).toBe("missing-dimension");
  });

  it("flags non-positive dimensions", () => {
    expect(run({ shape: "cube", side: -1 }).error).toBe("invalid-dimension");
  });
});
