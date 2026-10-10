import { describe, it, expect } from "vitest";
import { buildCurvePlot, realPolyRoots } from "../StepByStepMathSolverCurve";

describe("realPolyRoots", () => {
  it("solves linear, quadratic and cubic", () => {
    expect(realPolyRoots([-6, 2])).toEqual([3]);
    expect(realPolyRoots([-6, -4, 2])).toEqual([-1, 3]);
    expect(realPolyRoots([1, 0, 1])).toEqual([]);
    const cubic = realPolyRoots([0, -1, 0, 1]);
    expect(cubic.length).toBe(3);
    expect(cubic[0]).toBeCloseTo(-1);
    expect(cubic[2]).toBeCloseTo(1);
    expect(realPolyRoots([5])).toEqual([]);
  });
});

describe("buildCurvePlot", () => {
  it("frames roots, vertex and y-intercept of a quadratic", () => {
    const p = buildCurvePlot([-6, -4, 2], 40);
    expect(p.keyPoints.map((k) => k.kind)).toEqual(["root", "root", "vertex", "y-intercept"]);
    expect(p.keyPoints[2]).toEqual({ kind: "vertex", x: 1, y: -8 });
    expect(p.xRange[0]).toBeLessThan(-1);
    expect(p.xRange[1]).toBeGreaterThan(3);
    expect(p.samples.length).toBe(41);
    expect(p.yRange[0]).toBeLessThanOrEqual(-8);
  });
  it("marks critical points for degree 3 and keeps a minimum window", () => {
    const p = buildCurvePlot([0, -3, 0, 1]);
    expect(p.keyPoints.filter((k) => k.kind === "critical").length).toBe(2);
    expect(p.xRange[1] - p.xRange[0]).toBeGreaterThanOrEqual(6);
    expect(p.derivativeSamples.length).toBe(p.samples.length);
  });
  it("handles a constant function", () => {
    const p = buildCurvePlot([4]);
    expect(p.realRoots).toEqual([]);
    expect(p.yRange[1]).toBeGreaterThan(p.yRange[0]);
  });
});
