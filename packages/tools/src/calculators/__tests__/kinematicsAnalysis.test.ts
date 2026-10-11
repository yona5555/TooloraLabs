import { describe, expect, it } from "vitest";
import { accelerationZone, analyzeKinematics, equationChecks, kinematicsStateAt } from "../kinematicsAnalysis";
import { KinematicsCalculator } from "../KinematicsCalculator";

const tool = new KinematicsCalculator();
const solve = (input: Partial<Parameters<KinematicsCalculator["execute"]>[0]>) =>
  tool.execute({ mode: "timeBased", solveForTime: "v", solveForDistance: "v", v0: 0, v: 0, a: 0, t: 0, dx: 0, ...input }, { locale: "en-US" }).data;

describe("kinematicsStateAt", () => {
  it("applies v = v₀ + at and x = v₀t + ½at²", () => {
    expect(kinematicsStateAt(3, 2, 4)).toEqual({ t: 4, v: 11, x: 28 });
  });
});

describe("analyzeKinematics (default 0 → 10 m/s in 5 s)", () => {
  const r = solve({ v0: 0, a: 2, t: 5 });
  const k = analyzeKinematics(r);

  it("agrees with the calculator", () => {
    expect(k.span).toBe(5);
    expect(k.steps).toHaveLength(9);
    expect(k.steps[8].v).toBeCloseTo(r.v, 12);
    expect(k.steps[8].x).toBeCloseTo(r.dx, 12);
    expect(k.dxFromV0 + k.dxFromA).toBeCloseTo(r.dx, 12);
    expect(k.averageVelocity).toBe(5);
  });

  it("follows Galileo's odd-number rule from rest", () => {
    const first = k.intervalDx[0];
    k.intervalDx.forEach((d, i) => expect(d / first).toBeCloseTo(2 * i + 1, 9));
  });

  it("satisfies all four equations", () => {
    expect(k.checks).toHaveLength(4);
    expect(k.checks.every((c) => c.holds)).toBe(true);
  });

  it("scales v linearly and x quadratically with time", () => {
    const [half, , dbl] = k.timeSensitivity;
    expect(half.v).toBe(5);
    expect(dbl.v).toBe(20);
    expect(dbl.x / k.timeSensitivity[1].x).toBe(4);
  });

  it("derives g-force, 0–100 km/h and stopping distance", () => {
    expect(k.gForce).toBeCloseTo(2 / 9.80665, 12);
    expect(k.timeTo100kmh).toBeCloseTo(100 / 3.6 / 2, 12);
    expect(k.stoppingDistance).toBe(25);
    expect(accelerationZone(2)).toBe("gentle");
    expect(accelerationZone(-15)).toBe("strong");
    expect(accelerationZone(25)).toBe("extreme");
  });
});

describe("analyzeKinematics edge cases", () => {
  it("finds the turning point and the full path length when the motion reverses", () => {
    const k = analyzeKinematics(solve({ v0: 10, a: -2, t: 8 }));
    expect(k.turning?.t).toBe(5);
    expect(k.turning?.x).toBe(25);
    expect(k.dx).toBe(16);
    expect(k.pathLength).toBe(34);
  });

  it("uses Δx / v₀ for uniform motion when time is undefined", () => {
    const r = tool.execute({ mode: "distanceBased", solveForTime: "v", solveForDistance: "v", v0: 5, v: 0, a: 0, t: 0, dx: 50 }, { locale: "en-US" }).data;
    expect(r.tAvailable).toBe(false);
    const k = analyzeKinematics(r);
    expect(k.span).toBe(10);
    expect(k.checks.map((c) => c.key)).toEqual(["velocitySquared"]);
    expect(k.checks[0].holds).toBe(true);
    expect(k.timeTo100kmh).toBe(Infinity);
  });

  it("has no forward interval for a negative time", () => {
    const k = analyzeKinematics(solve({ solveForTime: "t", v0: 10, v: 0, a: 2 }));
    expect(k.span).toBe(0);
    expect(k.steps.every((s) => s.x === 0)).toBe(true);
  });

  it("flags an inconsistent set", () => {
    const c = equationChecks({ v0: 0, v: 10, a: 2, t: 5, dx: 30, tAvailable: true });
    expect(c.find((x) => x.key === "velocity")?.holds).toBe(true);
    expect(c.find((x) => x.key === "displacementTime")?.holds).toBe(false);
  });
});
