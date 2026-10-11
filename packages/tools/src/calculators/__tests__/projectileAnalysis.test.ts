import { describe, expect, it } from "vitest";
import { ProjectileMotionCalculator } from "../ProjectileMotionCalculator";
import {
  analyzeProjectile,
  optimalLaunchAngle,
  projectileMaxRange,
  projectileRange,
  projectileStateAt,
  rangeAcrossWorlds,
  rangeAngleCurve,
  sampleTrajectory,
  speedSensitivity,
  trajectoryArcLength,
} from "../projectileAnalysis";

const launch = { speed: 20, angle: 45, height: 0, gravity: 9.8 };

describe("analyzeProjectile", () => {
  it("agrees with the calculator's own result", () => {
    const tool = new ProjectileMotionCalculator().execute({ speed: 25, angle: 30, height: 2, gravity: 9.8 }, { locale: "en-US" }).data;
    const a = analyzeProjectile({ speed: 25, angle: 30, height: 2, gravity: 9.8 })!;
    expect(a.timeOfFlight).toBeCloseTo(tool.timeOfFlight, 8);
    expect(a.maxHeight).toBeCloseTo(tool.maxHeight, 8);
    expect(a.range).toBeCloseTo(tool.range, 8);
    expect(a.impactSpeed).toBeCloseTo(tool.impactSpeed, 8);
    expect(a.impactAngle).toBeCloseTo(tool.impactAngle, 8);
  });

  it("level launch: symmetric rise/fall, 45° optimal, complementary angles share the range", () => {
    const a = analyzeProjectile(launch)!;
    expect(a.timeUp).toBeCloseTo(a.timeDown, 10);
    expect(a.apexX).toBeCloseTo(a.range / 2, 10);
    expect(a.optimalAngle).toBeCloseTo(45, 10);
    expect(a.rangeEfficiency).toBeCloseTo(1, 10);
    expect(a.range).toBeCloseTo((20 * 20) / 9.8, 10);
    expect(analyzeProjectile({ ...launch, angle: 30 })!.complementaryRange).toBeCloseTo(projectileRange(20, 30, 0, 9.8), 10);
    expect(a.impactSpeed).toBeCloseTo(20, 10);
  });

  it("conserves specific energy at launch, apex and impact", () => {
    const a = analyzeProjectile({ speed: 30, angle: 50, height: 12, gravity: 3.71 })!;
    expect(a.kineticLaunch + a.potentialLaunch).toBeCloseTo(a.energy, 9);
    expect(a.kineticApex + a.potentialApex).toBeCloseTo(a.energy, 9);
    expect(a.kineticImpact).toBeCloseTo(a.energy, 9);
  });

  it("rejects invalid launches", () => {
    expect(analyzeProjectile({ ...launch, gravity: 0 })).toBeNull();
    expect(analyzeProjectile({ ...launch, speed: -1 })).toBeNull();
    expect(analyzeProjectile({ ...launch, height: -1 })).toBeNull();
  });
});

describe("optimum, path and samples", () => {
  it("optimal angle from a height is below 45° and gives the max range", () => {
    const th = optimalLaunchAngle(20, 10, 9.8);
    expect(th).toBeLessThan(45);
    expect(projectileRange(20, th, 10, 9.8)).toBeCloseTo(projectileMaxRange(20, 10, 9.8), 8);
    expect(projectileRange(20, th + 2, 10, 9.8)).toBeLessThan(projectileMaxRange(20, 10, 9.8));
  });

  it("arc length matches the closed form for a level 45° launch", () => {
    const a = analyzeProjectile(launch)!;
    const s = trajectoryArcLength(launch);
    expect(s).toBeGreaterThan(a.range);
    expect(s / a.range).toBeCloseTo((Math.SQRT2 + Math.asinh(1)) / 2, 5);
  });

  it("samples run from launch to impact; state is clamped", () => {
    const pts = sampleTrajectory(launch, 6);
    expect(pts).toHaveLength(7);
    expect(pts[0].x).toBe(0);
    expect(pts[6].x).toBeCloseTo(analyzeProjectile(launch)!.range, 9);
    expect(projectileStateAt(launch, 999).y).toBe(0);
  });
});

describe("comparisons", () => {
  it("worlds are ranked by range, the current g is flagged, custom g is appended", () => {
    const w = rangeAcrossWorlds(launch);
    expect(w[0].key).toBe("pluto");
    expect(w[w.length - 1].key).toBe("jupiter");
    expect(w.find((x) => x.current)?.key).toBe("earth");
    expect(rangeAcrossWorlds({ ...launch, gravity: 5 }).some((x) => x.key === "custom" && x.current)).toBe(true);
  });

  it("range scales with v² on level ground", () => {
    const [lo, mid, hi] = speedSensitivity(launch, 0.1);
    expect(mid.change).toBe(0);
    expect(lo.change).toBeCloseTo(0.81 - 1, 10);
    expect(hi.change).toBeCloseTo(1.21 - 1, 10);
  });

  it("range–angle curve peaks at 45° from the ground", () => {
    const c = rangeAngleCurve(launch, 1);
    expect(c).toHaveLength(91);
    const best = c.reduce((b, p) => (p.range > b.range ? p : b));
    expect(best.angle).toBe(45);
  });
});
