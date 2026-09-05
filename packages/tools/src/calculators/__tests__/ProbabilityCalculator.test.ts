import { describe, it, expect } from "vitest";
import { calculateSingleEventProbability, calculateIndependentAnd, calculateOr, calculateConditional } from "../ProbabilityCalculator";

describe("ProbabilityCalculator", () => {
  describe("calculateSingleEventProbability", () => {
    it("computes probability, percentage, and odds for a fair die roll", () => {
      const r = calculateSingleEventProbability(1, 6);
      expect(r.valid).toBe(true);
      expect(r.probability).toBeCloseTo(1 / 6, 10);
      expect(r.percentage).toBeCloseTo(16.6667, 3);
      expect(r.oddsFor).toBeCloseTo(1 / 5, 10);
      expect(r.oddsAgainst).toBeCloseTo(5, 10);
    });

    it("rejects favorable outcomes greater than the total", () => {
      expect(calculateSingleEventProbability(7, 6).valid).toBe(false);
    });

    it("rejects a non-positive total", () => {
      expect(calculateSingleEventProbability(1, 0).valid).toBe(false);
    });
  });

  describe("calculateIndependentAnd", () => {
    it("multiplies two independent probabilities", () => {
      const r = calculateIndependentAnd(0.5, 0.5);
      expect(r.valid).toBe(true);
      expect(r.probability).toBeCloseTo(0.25, 10);
    });

    it("rejects probabilities outside [0, 1]", () => {
      expect(calculateIndependentAnd(1.5, 0.5).valid).toBe(false);
      expect(calculateIndependentAnd(-0.1, 0.5).valid).toBe(false);
    });
  });

  describe("calculateOr", () => {
    it("adds probabilities for mutually exclusive events (no overlap)", () => {
      const r = calculateOr(0.3, 0.2, 0);
      expect(r.probability).toBeCloseTo(0.5, 10);
    });

    it("subtracts the overlap for non-mutually-exclusive events", () => {
      const r = calculateOr(0.5, 0.5, 0.25);
      expect(r.probability).toBeCloseTo(0.75, 10);
    });

    it("rejects an overlap larger than either individual probability", () => {
      expect(calculateOr(0.2, 0.3, 0.25).valid).toBe(false);
    });
  });

  describe("calculateConditional", () => {
    it("computes P(A|B) = P(A and B) / P(B)", () => {
      const r = calculateConditional(0.2, 0.4);
      expect(r.valid).toBe(true);
      expect(r.probability).toBeCloseTo(0.5, 10);
    });

    it("rejects a zero P(B) (division by zero)", () => {
      expect(calculateConditional(0.1, 0).valid).toBe(false);
    });

    it("rejects P(A and B) greater than P(B)", () => {
      expect(calculateConditional(0.5, 0.3).valid).toBe(false);
    });
  });
});
