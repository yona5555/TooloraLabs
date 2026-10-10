import { describe, it, expect } from "vitest";
import {
  annulusBands,
  circleDisplayScale,
  circleSector,
  circleSensitivity,
  circleSolids,
  circleSquares,
  isoperimetricRanking,
  polygonApproximation,
  circleRoundSignificant,
  sectorAngleZone,
} from "../CircleMetrics";

describe("CircleMetrics", () => {
  it("computes sector, arc, chord and segment", () => {
    const s = circleSector(5, 90);
    expect(s.arcLength).toBeCloseTo((Math.PI * 5) / 2, 10);
    expect(s.sectorArea).toBeCloseTo((Math.PI * 25) / 4, 10);
    expect(s.chord).toBeCloseTo(5 * Math.SQRT2, 10);
    expect(s.segmentArea).toBeCloseTo((Math.PI * 25) / 4 - 12.5, 10);
    expect(circleSector(5, 60).chord).toBeCloseTo(5, 10);
    expect(circleSector(5, 360).sectorArea).toBeCloseTo(Math.PI * 25, 10);
  });

  it("splits the circumscribed square into inscribed square, segments and corners", () => {
    const q = circleSquares(3);
    expect(q.inscribedArea + q.segmentsArea + q.cornersArea).toBeCloseTo(q.circumscribedArea, 10);
    expect(q.inscribedArea + q.segmentsArea).toBeCloseTo(Math.PI * 9, 10);
    expect(q.inscribedSide).toBeCloseTo(3 * Math.SQRT2, 10);
  });

  it("relates sphere, cylinder and cone (Archimedes 2:3 and 1:3:2)", () => {
    const s = circleSolids(2);
    expect(s.sphereVolume / s.cylinderVolume).toBeCloseTo(2 / 3, 10);
    expect(s.coneVolume / s.sphereVolume).toBeCloseTo(0.5, 10);
    expect(s.sphereSurface).toBeCloseTo(16 * Math.PI, 10);
  });

  it("brackets π with inscribed and circumscribed polygons", () => {
    const p6 = polygonApproximation(1, 6);
    expect(p6.piLower).toBeCloseTo(3, 10);
    expect(p6.piUpper).toBeCloseTo(2 * Math.sqrt(3), 10);
    const p96 = polygonApproximation(1, 96);
    expect(p96.piLower).toBeLessThan(Math.PI);
    expect(p96.piUpper).toBeGreaterThan(Math.PI);
    expect(p96.perimeterShare).toBeGreaterThan(0.999);
    expect(polygonApproximation(1, 2).sides).toBe(3);
  });

  it("splits the disk into rings whose shares sum to 1", () => {
    const bands = annulusBands(4, 4);
    expect(bands.map((b) => b.share)).toEqual([1 / 16, 3 / 16, 5 / 16, 7 / 16].map((v) => expect.closeTo(v, 10)));
    expect(bands.reduce((s, b) => s + b.area, 0)).toBeCloseTo(Math.PI * 16, 10);
  });

  it("ranks same-perimeter shapes with the circle first", () => {
    const list = isoperimetricRanking(12);
    expect(list.map((e) => e.shape)).toEqual(["circle", "hexagon", "square", "triangle"]);
    expect(list[2].area).toBeCloseTo(9, 10);
    expect(list[2].shareOfCircle).toBeCloseTo(Math.PI / 4, 10);
  });

  it("scales circumference linearly and area quadratically", () => {
    const [lo, mid, hi] = circleSensitivity(10, 0.1);
    expect(hi.circumference / mid.circumference).toBeCloseTo(1.1, 10);
    expect(hi.area / mid.area).toBeCloseTo(1.21, 10);
    expect(lo.area / mid.area).toBeCloseTo(0.81, 10);
  });

  it("classifies central angles", () => {
    expect(sectorAngleZone(45)).toBe("acute");
    expect(sectorAngleZone(90)).toBe("right");
    expect(sectorAngleZone(120)).toBe("obtuse");
    expect(sectorAngleZone(180)).toBe("straight");
    expect(sectorAngleZone(270)).toBe("reflex");
    expect(sectorAngleZone(360)).toBe("full");
  });

  it("picks a readable 1/2/5 display scale and rounds drag values", () => {
    expect(circleDisplayScale(5)).toBe(5);
    expect(circleDisplayScale(33)).toBe(50);
    expect(circleDisplayScale(0.12)).toBeCloseTo(0.1, 12);
    for (const r of [0.37, 3, 7.9, 120, 6000]) {
      const ratio = r / circleDisplayScale(r);
      expect(ratio).toBeGreaterThanOrEqual(0.5);
      expect(ratio).toBeLessThan(1.26);
    }
    expect(circleRoundSignificant(3.14159, 3)).toBe(3.14);
    expect(circleRoundSignificant(1234.5, 3)).toBe(1230);
  });
});
