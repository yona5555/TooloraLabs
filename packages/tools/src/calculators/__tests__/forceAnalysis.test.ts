import { describe, expect, it } from "vitest";
import {
  analyzeGravitation,
  analyzeSecondLaw,
  FORCE_REFERENCES,
  gravitationalForce,
  inverseSquareCurve,
  STANDARD_GRAVITY,
  surfaceWeights,
  toScientific,
} from "../forceAnalysis";
import { ForceCalculator } from "../ForceCalculator";

describe("analyzeSecondLaw", () => {
  const a = analyzeSecondLaw(10, 2, 5);

  it("derives weight, g-force and unit conversions", () => {
    expect(a.gForce).toBeCloseTo(5 / 9.80665, 12);
    expect(a.ownWeight).toBeCloseTo(19.6133, 9);
    expect(a.kN).toBe(0.01);
    expect(a.lbf).toBeCloseTo(2.248089431, 8);
    expect(a.kgf).toBeCloseTo(1.019716213, 8);
    expect(a.dyn).toBe(1e6);
  });

  it("integrates the motion from rest", () => {
    const s2 = a.snapshots[2];
    expect(s2.t).toBe(2);
    expect(s2.v).toBe(10);
    expect(s2.x).toBe(10);
    expect(s2.p).toBe(20);
    expect(s2.ke).toBe(100);
    expect(s2.power).toBe(100);
    expect(a.timeTo100kmh).toBeCloseTo(100 / 3.6 / 5, 12);
  });

  it("halves the acceleration when the mass doubles", () => {
    expect(a.massSensitivity.map((s) => s.acceleration)).toEqual([10, 5, 2.5]);
  });
});

describe("analyzeGravitation", () => {
  const F = gravitationalForce(5.972e24, 1, 6.371e6);
  const g = analyzeGravitation(5.972e24, 1, 6.371e6, F);

  it("agrees with ForceCalculator", () => {
    const out = new ForceCalculator().execute(
      { mode: "gravitation", secondLawSolveFor: "force", gravitationSolveFor: "force", force: 0, mass: 0, acceleration: 0, mass1: 5.972e24, mass2: 1, distance: 6.371e6 },
      { locale: "en-US" },
    );
    expect(out.data.force).toBeCloseTo(F, 6);
  });

  it("gives Earth's surface gravity and orbital numbers", () => {
    expect(g.field1).toBeCloseTo(9.82, 2);
    expect(g.accel2).toBeCloseTo(g.field1, 9);
    expect(g.escapeSpeed / 1000).toBeCloseTo(11.19, 1);
    expect(g.orbitalSpeed / 1000).toBeCloseTo(7.91, 1);
    expect(g.barycenterFrom1 + g.barycenterFrom2).toBeCloseTo(6.371e6, 3);
  });

  it("follows the inverse square law", () => {
    expect(g.atMultiples[2].force).toBeCloseTo(F / 4, 12);
    expect(g.atMultiples[0].force).toBeCloseTo(F * 4, 12);
    const c = inverseSquareCurve(F, 6.371e6, 8);
    expect(c[0].force).toBeCloseTo(F * 4, 9);
    expect(c[7].force).toBeCloseTo(F / 16, 12);
  });

  it("puts the Earth–Moon barycentre inside the Earth", () => {
    const em = analyzeGravitation(5.972e24, 7.342e22, 3.844e8, gravitationalForce(5.972e24, 7.342e22, 3.844e8));
    expect(em.barycenterFrom1 / 1000).toBeCloseTo(4668, -1);
    expect(em.orbitalPeriod / 86400).toBeCloseTo(27.3, 0);
  });
});

describe("surfaceWeights and references", () => {
  it("ranks the Sun first and the Moon last", () => {
    const w = surfaceWeights(1);
    expect(w[0].key).toBe("sun");
    expect(w[w.length - 1].key).toBe("moon");
    expect(w.find((b) => b.key === "earth")!.gravity).toBeCloseTo(9.82, 2);
  });

  it("lists real reference forces", () => {
    expect(FORCE_REFERENCES.find((r) => r.key === "adultWeight")!.force).toBeCloseTo(70 * STANDARD_GRAVITY, 9);
    expect(FORCE_REFERENCES.find((r) => r.key === "earthMoon")!.force).toBeCloseTo(1.98e20, -18);
  });

  it("splits numbers into scientific notation", () => {
    expect(toScientific(5.972e24)).toEqual({ mantissa: 5.972, exponent: 24 });
    expect(toScientific(0.000325)).toEqual({ mantissa: 3.25, exponent: -4 });
    expect(toScientific(9.99999, 3)).toEqual({ mantissa: 1, exponent: 1 });
  });
});
