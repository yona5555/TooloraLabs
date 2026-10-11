import { describe, expect, it } from "vitest";
import {
  analyzeKinetic,
  analyzePotential,
  analyzePower,
  analyzeWork,
  energyEquivalents,
  energyUnits,
  ENERGY_REFERENCES,
  fallAtTime,
  rankPower,
  workAngleCurve,
} from "../energyAnalysis";
import { EnergyWorkPowerCalculator, type EnergyWorkPowerCalculatorInput } from "../EnergyWorkPowerCalculator";

const calc = new EnergyWorkPowerCalculator();
const run = (input: Partial<EnergyWorkPowerCalculatorInput>) =>
  calc.execute({ mode: "work", force: 0, distance: 0, angleDegrees: 0, mass: 0, velocity: 0, height: 0, workValue: 0, time: 0, ...input }, { locale: "en-US" }).data;

describe("analyzeWork", () => {
  it("matches the calculator and splits the force", () => {
    const a = analyzeWork(80, 5, 30);
    expect(a.work).toBeCloseTo(run({ mode: "work", force: 80, distance: 5, angleDegrees: 30 }).work, 6);
    expect(a.parallel).toBeCloseTo(69.2820323, 6);
    expect(a.perpendicular).toBeCloseTo(40, 9);
    expect(a.alignedWork).toBe(400);
    expect(a.sign).toBe("positive");
  });

  it("gives exactly zero work at 90° and negative work past it", () => {
    expect(analyzeWork(20, 5, 90).work).toBe(0);
    expect(analyzeWork(20, 5, 90).sign).toBe("zero");
    expect(analyzeWork(20, 5, 180).work).toBe(-100);
    expect(analyzeWork(20, 5, 180).sign).toBe("negative");
  });

  it("samples W(θ) from 0° to 180°", () => {
    const c = workAngleCurve(10, 2, 7);
    expect(c[0]).toEqual({ angle: 0, work: 20 });
    expect(c[3].work).toBe(0);
    expect(c[6].work).toBe(-20);
  });
});

describe("analyzeKinetic", () => {
  it("matches the calculator and quadruples with double speed", () => {
    const k = analyzeKinetic(10, 4);
    expect(k.kineticEnergy).toBe(run({ mode: "kineticEnergy", mass: 10, velocity: 4 }).kineticEnergy);
    expect(k.momentum).toBe(40);
    expect(k.kmh).toBeCloseTo(14.4, 12);
    expect(k.equivalentDropHeight).toBeCloseTo(16 / 19.6, 12);
    expect(k.speedSensitivity[2].kineticEnergy / k.kineticEnergy).toBe(4);
    expect(k.speedSensitivity[0].kineticEnergy / k.kineticEnergy).toBe(0.25);
  });
});

describe("analyzePotential", () => {
  it("matches the calculator and conserves energy while falling", () => {
    const p = analyzePotential(10, 3);
    expect(p.potentialEnergy).toBeCloseTo(run({ mode: "potentialEnergy", mass: 10, height: 3 }).potentialEnergy, 9);
    expect(p.impactSpeed).toBeCloseTo(Math.sqrt(58.8), 12);
    expect(p.fallTime).toBeCloseTo(Math.sqrt(6 / 9.8), 12);
    for (const s of p.stages) expect(s.potential + s.kinetic).toBeCloseTo(p.potentialEnergy, 9);
    expect(p.stages[4].kinetic).toBeCloseTo(0.5 * 10 * p.impactSpeed ** 2, 9);
  });

  it("follows the fall in time and stops at the ground", () => {
    const mid = fallAtTime(1, 19.6, 1);
    expect(mid.height).toBeCloseTo(14.7, 12);
    expect(mid.speed).toBeCloseTo(9.8, 12);
    expect(fallAtTime(1, 19.6, 99).height).toBe(0);
  });
});

describe("analyzePower", () => {
  it("matches the calculator and converts units", () => {
    const p = analyzePower(100, 5);
    expect(p.power).toBe(run({ mode: "power", workValue: 100, time: 5 }).power);
    expect(p.kW).toBe(0.02);
    expect(p.horsepower).toBeCloseTo(0.0268204, 6);
    expect(p.timeSteps.map((s) => s.power)).toEqual([80, 40, 20, 10, 5]);
  });

  it("ranks the computed power among real devices", () => {
    const r = rankPower(500);
    expect(r[0].key).toBe("carEngine");
    expect(r.findIndex((x) => x.key === "yours")).toBe(3);
  });
});

describe("energy units", () => {
  it("converts joules", () => {
    const u = energyUnits(3600);
    expect(u.wh).toBe(1);
    expect(u.kwh).toBe(0.001);
    expect(u.kcal).toBeCloseTo(0.86042065, 8);
    expect(u.ev / 2.24694e22).toBeCloseTo(1, 4);
    expect(energyEquivalents(60).bulbSeconds).toBe(1);
  });

  it("keeps the references in increasing order", () => {
    const e = ENERGY_REFERENCES.map((r) => r.energy);
    expect([...e].sort((a, b) => a - b)).toEqual(e);
  });
});
