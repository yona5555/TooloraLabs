import { describe, it, expect } from "vitest";
import { solveSSS, solveSAS, solveASA, solveAAS } from "../TriangleCalculator";

const ANGLE_A = 36.869897645844; // acos(0.8), the non-right angle opposite side 3 in a 3-4-5 triangle
const ANGLE_B = 53.130102354156; // acos(0.6), opposite side 4

describe("TriangleCalculator", () => {
  describe("solveSSS", () => {
    it("solves a classic 3-4-5 right triangle", () => {
      const r = solveSSS(3, 4, 5);
      expect(r.valid).toBe(true);
      expect(r.angleA).toBeCloseTo(ANGLE_A, 6);
      expect(r.angleB).toBeCloseTo(ANGLE_B, 6);
      expect(r.angleC).toBeCloseTo(90, 6);
      expect(r.area).toBeCloseTo(6, 10);
      expect(r.perimeter).toBe(12);
    });

    it("solves an equilateral triangle with all 60-degree angles", () => {
      const r = solveSSS(5, 5, 5);
      expect(r.angleA).toBeCloseTo(60, 8);
      expect(r.angleB).toBeCloseTo(60, 8);
      expect(r.angleC).toBeCloseTo(60, 8);
      expect(r.area).toBeCloseTo((Math.sqrt(3) / 4) * 25, 8);
    });

    it("rejects sides that violate the triangle inequality", () => {
      const r = solveSSS(1, 1, 5);
      expect(r.valid).toBe(false);
      expect(r.error).toBe("triangle-inequality-violated");
    });

    it("rejects non-positive sides", () => {
      expect(solveSSS(0, 4, 5).valid).toBe(false);
      expect(solveSSS(-3, 4, 5).valid).toBe(false);
    });
  });

  describe("solveSAS", () => {
    it("solves the same 3-4-5 triangle from two sides and the included right angle", () => {
      const r = solveSAS(3, 90, 4);
      expect(r.valid).toBe(true);
      expect(r.c).toBeCloseTo(5, 8);
      expect(r.angleA).toBeCloseTo(ANGLE_A, 6);
      expect(r.angleB).toBeCloseTo(ANGLE_B, 6);
      expect(r.area).toBeCloseTo(6, 8);
    });

    it("rejects an included angle of 180 degrees or more", () => {
      expect(solveSAS(3, 180, 4).valid).toBe(false);
      expect(solveSAS(3, 200, 4).valid).toBe(false);
    });
  });

  describe("solveASA", () => {
    it("solves the same 3-4-5 triangle from two angles and the included side", () => {
      const r = solveASA(ANGLE_A, 5, ANGLE_B);
      expect(r.valid).toBe(true);
      expect(r.a).toBeCloseTo(3, 6);
      expect(r.b).toBeCloseTo(4, 6);
      expect(r.angleC).toBeCloseTo(90, 6);
    });

    it("rejects angles that sum to 180 or more", () => {
      expect(solveASA(90, 5, 90).valid).toBe(false);
      expect(solveASA(100, 5, 90).valid).toBe(false);
    });
  });

  describe("solveAAS", () => {
    it("solves the same 3-4-5 triangle from two angles and a non-included side", () => {
      const r = solveAAS(ANGLE_A, ANGLE_B, 3);
      expect(r.valid).toBe(true);
      expect(r.b).toBeCloseTo(4, 6);
      expect(r.c).toBeCloseTo(5, 6);
      expect(r.angleC).toBeCloseTo(90, 6);
    });
  });

  it("produces vertices that reconstruct the same side lengths (consistent with the solved triangle)", () => {
    const r = solveSSS(3, 4, 5);
    const [A, B, C] = r.vertices;
    const dist = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y);
    expect(dist(A, B)).toBeCloseTo(r.c, 8); // side c = AB
    expect(dist(A, C)).toBeCloseTo(r.b, 8); // side b = AC
    expect(dist(B, C)).toBeCloseTo(r.a, 8); // side a = BC
  });
});
