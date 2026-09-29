import { describe, expect, it } from "vitest";
import { angleFromPoint, constrainToCircle, pointOnCircle } from "../UnitCircleGeometry";

describe("angleFromPoint", () => {
  it("reads 0deg at (1,0), 90deg at (0,1), 180deg at (-1,0), 270deg at (0,-1)", () => {
    expect(angleFromPoint({ x: 1, y: 0 })).toBeCloseTo(0, 9);
    expect(angleFromPoint({ x: 0, y: 1 })).toBeCloseTo(90, 9);
    expect(angleFromPoint({ x: -1, y: 0 })).toBeCloseTo(180, 9);
    expect(angleFromPoint({ x: 0, y: -1 })).toBeCloseTo(270, 9);
  });

  it("wraps negative atan2 results into 0-360", () => {
    const angle = angleFromPoint({ x: 0, y: -5 });
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(360);
  });

  it("is relative to a non-origin center", () => {
    expect(angleFromPoint({ x: 6, y: 5 }, { x: 5, y: 5 })).toBeCloseTo(0, 9);
  });
});

describe("pointOnCircle", () => {
  it("matches sin/cos exactly for a known 3-4-5-style angle", () => {
    // cos(36.8698...) = 0.8, sin(...) = 0.6 (the 3-4-5 triangle angle)
    const angle = (Math.acos(0.8) * 180) / Math.PI;
    const p = pointOnCircle(angle, 5);
    expect(p.x).toBeCloseTo(4, 6);
    expect(p.y).toBeCloseTo(3, 6);
  });

  it("round-trips through angleFromPoint", () => {
    for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const p = pointOnCircle(deg, 1);
      expect(angleFromPoint(p)).toBeCloseTo(deg, 6);
    }
  });
});

describe("constrainToCircle", () => {
  it("snaps an off-circle point back onto the circle at the same angle", () => {
    const dragged = { x: 3, y: 3 }; // 45 degrees, but off the unit circle
    const snapped = constrainToCircle(dragged, 1);
    expect(Math.hypot(snapped.x, snapped.y)).toBeCloseTo(1, 9);
    expect(angleFromPoint(snapped)).toBeCloseTo(45, 6);
  });

  it("preserves a point already exactly on the circle", () => {
    const onCircle = { x: 0, y: 2 };
    const snapped = constrainToCircle(onCircle, 2);
    expect(snapped.x).toBeCloseTo(0, 9);
    expect(snapped.y).toBeCloseTo(2, 9);
  });
});
