import { describe, expect, it } from "vitest";
import { clipGridLines, countGridCells, planeMetrics, planeOutline, unitGridStep } from "../PlaneShapeGeometry";

describe("planeMetrics", () => {
  it("computes a rectangle's area, perimeter and diagonal", () => {
    const m = planeMetrics({ shape: "rectangle", width: 6, height: 8 })!;
    expect(m.area).toBe(48);
    expect(m.perimeter).toBe(28);
    expect(m.diagonal).toBe(10);
    expect(m.fillRatio).toBe(1);
  });

  it("gives a circle compactness 1", () => {
    const m = planeMetrics({ shape: "circle", radius: 3 })!;
    expect(m.compactness).toBeCloseTo(1, 9);
    expect(m.boundingArea).toBe(36);
  });

  it("computes sector arc and chord", () => {
    const m = planeMetrics({ shape: "sector", radius: 2, angleDegrees: 180 })!;
    expect(m.area).toBeCloseTo(2 * Math.PI, 9);
    expect(m.arcLength).toBeCloseTo(2 * Math.PI, 9);
    expect(m.chord).toBeCloseTo(4, 9);
  });

  it("uses the midsegment for a trapezoid", () => {
    const m = planeMetrics({ shape: "trapezoid", base1: 7, base2: 3, height: 2 })!;
    expect(m.midsegment).toBe(5);
    expect(m.area).toBe(10);
    expect(m.perimeter).toBeNull();
  });

  it("approximates an ellipse perimeter and eccentricity", () => {
    const m = planeMetrics({ shape: "ellipse", semiMajorAxis: 5, semiMinorAxis: 3 })!;
    expect(m.perimeter).toBeCloseTo(25.527, 2);
    expect(m.eccentricity).toBeCloseTo(0.8, 9);
  });

  it("rejects invalid input", () => {
    expect(planeMetrics({ shape: "sector", radius: 2, angleDegrees: 400 })).toBeNull();
    expect(planeMetrics({ shape: "square" })).toBeNull();
  });
});

describe("planeOutline", () => {
  it("centers a square on the origin", () => {
    expect(planeOutline({ shape: "square", side: 4 })).toEqual([[-2, -2], [2, -2], [2, 2], [-2, 2]]);
  });
});

describe("unit grid", () => {
  it("keeps 1-unit spacing until the line cap and then steps up", () => {
    expect(unitGridStep(6)).toBe(1);
    expect(unitGridStep(24)).toBe(1);
    expect(unitGridStep(30)).toBe(2);
    expect(unitGridStep(1000)).toBe(50);
    expect(unitGridStep(0.8)).toBe(0.1);
  });

  it("counts the whole unit squares of a rectangle", () => {
    const poly = planeOutline({ shape: "rectangle", width: 6, height: 3.5 });
    expect(countGridCells(poly, 1)).toEqual({ full: 18, partial: 6 });
    expect(clipGridLines(poly, 1)).toHaveLength(3 + 5);
  });

  it("clips grid lines to a triangle", () => {
    const poly = planeOutline({ shape: "triangle", base: 4, height: 4 });
    const segs = clipGridLines(poly, 1);
    expect(segs).toHaveLength(6);
    for (const [a, b] of segs) expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(4);
  });
});
