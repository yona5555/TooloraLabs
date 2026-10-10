import { describe, expect, it } from "vitest";
import { unitCircleFacts, radiansAsPi } from "../UnitCircleMath";

describe("unitCircleFacts", () => {
  it("quadrant II at 150°", () => {
    const f = unitCircleFacts(150);
    expect(f.quadrant).toBe(2);
    expect(f.referenceDeg).toBe(30);
    expect(f.sin).toBeCloseTo(0.5, 10);
    expect(f.cos).toBeCloseTo(-Math.sqrt(3) / 2, 10);
    expect(f.signs).toEqual({ sin: "+", cos: "−", tan: "−" });
    expect(f.radiansPi).toBe("5π/6");
  });
  it("axis angles and undefined tan", () => {
    const f = unitCircleFacts(270);
    expect(f.quadrant).toBe("axis");
    expect(f.tan).toBeNull();
    expect(f.signs).toEqual({ sin: "−", cos: "0", tan: "undef" });
    expect(unitCircleFacts(180).signs.sin).toBe("0");
  });
  it("normalizes and reference angles in III/IV", () => {
    expect(unitCircleFacts(-30).degrees).toBe(330);
    expect(unitCircleFacts(-30).referenceDeg).toBe(30);
    expect(unitCircleFacts(225).referenceDeg).toBe(45);
    expect(unitCircleFacts(225).signs.tan).toBe("+");
  });
  it("π labels", () => {
    expect(radiansAsPi(0)).toBe("0");
    expect(radiansAsPi(180)).toBe("π");
    expect(radiansAsPi(45)).toBe("π/4");
    expect(radiansAsPi(17)).toBeNull();
  });
});
