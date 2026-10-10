import { describe, expect, it } from "vitest";
import { solidMetrics } from "../SolidGeometry";

describe("solidMetrics", () => {
  it("breaks a cube into six equal faces", () => {
    const m = solidMetrics({ shape: "cube", side: 3 })!;
    expect(m.volume).toBe(27);
    expect(m.faces).toHaveLength(6);
    expect(m.surfaceArea).toBe(54);
    expect(m.spaceDiagonal).toBeCloseTo(3 * Math.sqrt(3), 9);
    expect(m.fillRatio).toBe(1);
    expect(m.equivalentCubeSide).toBeCloseTo(3, 9);
  });

  it("gives a rectangular prism three pairs of faces", () => {
    const m = solidMetrics({ shape: "rectangular-prism", length: 5, width: 3, height: 4 })!;
    expect(m.volume).toBe(60);
    expect(m.surfaceArea).toBe(94);
    expect(m.faces.map((f) => f.area)).toEqual([15, 15, 20, 20, 12, 12]);
    expect(m.lateralArea).toBe(64);
    expect(m.extents).toEqual({ x: 5, y: 4, z: 3 });
  });

  it("has sphericity 1 for a sphere", () => {
    const m = solidMetrics({ shape: "sphere", radius: 2 })!;
    expect(m.surfaceArea).toBeCloseTo(16 * Math.PI, 9);
    expect(m.sphericity).toBeCloseTo(1, 9);
    expect(m.fillRatio).toBeCloseTo(Math.PI / 6, 9);
  });

  it("splits a cylinder into two caps and a lateral face", () => {
    const m = solidMetrics({ shape: "cylinder", radius: 1, height: 2 })!;
    expect(m.faces.map((f) => f.key)).toEqual(["top", "bottom", "lateral"]);
    expect(m.surfaceArea).toBeCloseTo(6 * Math.PI, 9);
  });

  it("uses the slant height for a cone's lateral area", () => {
    const m = solidMetrics({ shape: "cone", radius: 3, height: 4 })!;
    expect(m.slantHeight).toBe(5);
    expect(m.lateralArea).toBeCloseTo(15 * Math.PI, 9);
    expect(m.volume).toBeCloseTo(12 * Math.PI, 9);
  });

  it("gives a square pyramid four equal triangles", () => {
    const m = solidMetrics({ shape: "square-pyramid", baseSide: 6, height: 4 })!;
    expect(m.slantHeight).toBe(5);
    expect(m.faces.filter((f) => f.area === 15)).toHaveLength(4);
    expect(m.surfaceArea).toBe(96);
    expect(m.volume).toBe(48);
  });

  it("returns null for missing or non-positive dimensions", () => {
    expect(solidMetrics({ shape: "cube" })).toBeNull();
    expect(solidMetrics({ shape: "cone", radius: 2, height: -1 })).toBeNull();
  });
});
