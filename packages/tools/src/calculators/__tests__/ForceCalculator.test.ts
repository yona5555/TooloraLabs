import { describe, it, expect } from "vitest";
import { ForceCalculator } from "../ForceCalculator";

const context = { locale: "en-US" };
const calc = new ForceCalculator();
const base = {
  mode: "secondLaw" as const,
  secondLawSolveFor: "force" as const,
  gravitationSolveFor: "force" as const,
  force: 0,
  mass: 0,
  acceleration: 0,
  mass1: 0,
  mass2: 0,
  distance: 0,
};

describe("ForceCalculator", () => {
  it("computes force from mass and acceleration (F = ma)", () => {
    const r = calc.execute({ ...base, mode: "secondLaw", secondLawSolveFor: "force", mass: 2, acceleration: 3 }, context);
    expect(r.data.force).toBe(6);
  });

  it("computes mass from force and acceleration", () => {
    const r = calc.execute({ ...base, mode: "secondLaw", secondLawSolveFor: "mass", force: 10, acceleration: 2 }, context);
    expect(r.data.mass).toBe(5);
  });

  it("computes acceleration from force and mass", () => {
    const r = calc.execute({ ...base, mode: "secondLaw", secondLawSolveFor: "acceleration", force: 10, mass: 2 }, context);
    expect(r.data.acceleration).toBe(5);
  });

  it("flags zero acceleration when solving mass", () => {
    const r = calc.execute({ ...base, mode: "secondLaw", secondLawSolveFor: "mass", force: 10, acceleration: 0 }, context);
    expect(r.data.error).toBe("zero-acceleration");
  });

  it("flags zero mass when solving acceleration", () => {
    const r = calc.execute({ ...base, mode: "secondLaw", secondLawSolveFor: "acceleration", force: 10, mass: 0 }, context);
    expect(r.data.error).toBe("zero-mass");
  });

  it("computes gravitational force between two masses", () => {
    const r = calc.execute({ ...base, mode: "gravitation", gravitationSolveFor: "force", mass1: 1e10, mass2: 1e10, distance: 1e5 }, context);
    expect(r.data.force).toBeCloseTo(0.6674, 6);
  });

  it("solves mass1 from gravitational force", () => {
    const r = calc.execute({ ...base, mode: "gravitation", gravitationSolveFor: "mass1", force: 0.6674, mass2: 1e10, distance: 1e5 }, context);
    expect(r.data.mass1).toBeCloseTo(1e10, -4);
  });

  it("solves distance from gravitational force", () => {
    const r = calc.execute({ ...base, mode: "gravitation", gravitationSolveFor: "distance", force: 0.6674, mass1: 1e10, mass2: 1e10 }, context);
    expect(r.data.distance).toBeCloseTo(1e5, -1);
  });

  it("approximates Earth's surface gravity for a 1 kg mass", () => {
    const r = calc.execute(
      { ...base, mode: "gravitation", gravitationSolveFor: "force", mass1: 5.972e24, mass2: 1, distance: 6.371e6 },
      context
    );
    expect(r.data.force).toBeCloseTo(9.8, 0);
  });

  it("flags zero distance when computing gravitational force", () => {
    const r = calc.execute({ ...base, mode: "gravitation", gravitationSolveFor: "force", mass1: 1e10, mass2: 1e10, distance: 0 }, context);
    expect(r.data.error).toBe("zero-distance");
  });

  it("flags zero force when solving distance", () => {
    const r = calc.execute({ ...base, mode: "gravitation", gravitationSolveFor: "distance", force: 0, mass1: 1e10, mass2: 1e10 }, context);
    expect(r.data.error).toBe("zero-force");
  });
});
