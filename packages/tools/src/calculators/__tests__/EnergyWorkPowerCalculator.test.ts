import { describe, it, expect } from "vitest";
import { EnergyWorkPowerCalculator } from "../EnergyWorkPowerCalculator";

const context = { locale: "en-US" };
const calc = new EnergyWorkPowerCalculator();
const base = {
  mode: "work" as const,
  force: 0,
  distance: 0,
  angleDegrees: 0,
  mass: 0,
  velocity: 0,
  height: 0,
  workValue: 0,
  time: 0,
};

describe("EnergyWorkPowerCalculator", () => {
  it("computes work with a force parallel to displacement", () => {
    const r = calc.execute({ ...base, mode: "work", force: 10, distance: 5, angleDegrees: 0 }, context);
    expect(r.data.work).toBe(50);
  });

  it("computes work with a force at an angle", () => {
    const r = calc.execute({ ...base, mode: "work", force: 10, distance: 5, angleDegrees: 60 }, context);
    expect(r.data.work).toBeCloseTo(25, 5);
  });

  it("computes zero work for a force perpendicular to displacement", () => {
    const r = calc.execute({ ...base, mode: "work", force: 10, distance: 5, angleDegrees: 90 }, context);
    expect(r.data.work).toBeCloseTo(0, 10);
  });

  it("computes kinetic energy", () => {
    const r = calc.execute({ ...base, mode: "kineticEnergy", mass: 2, velocity: 3 }, context);
    expect(r.data.kineticEnergy).toBe(9);
  });

  it("computes gravitational potential energy", () => {
    const r = calc.execute({ ...base, mode: "potentialEnergy", mass: 2, height: 5 }, context);
    expect(r.data.potentialEnergy).toBeCloseTo(98, 5);
  });

  it("computes power from work and time", () => {
    const r = calc.execute({ ...base, mode: "power", workValue: 100, time: 10 }, context);
    expect(r.data.power).toBe(10);
  });

  it("flags zero time when computing power", () => {
    const r = calc.execute({ ...base, mode: "power", workValue: 100, time: 0 }, context);
    expect(r.data.error).toBe("zero-time");
  });

  it("doubles kinetic energy correctly when velocity increases (quadratic relationship)", () => {
    const r1 = calc.execute({ ...base, mode: "kineticEnergy", mass: 1, velocity: 2 }, context);
    const r2 = calc.execute({ ...base, mode: "kineticEnergy", mass: 1, velocity: 4 }, context);
    expect(r2.data.kineticEnergy).toBeCloseTo(r1.data.kineticEnergy * 4, 5);
  });
});
