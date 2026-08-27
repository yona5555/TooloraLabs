import { describe, it, expect } from "vitest";
import { KinematicsCalculator } from "../KinematicsCalculator";

const context = { locale: "en-US" };
const calc = new KinematicsCalculator();
const base = {
  mode: "timeBased" as const,
  solveForTime: "v" as const,
  solveForDistance: "v" as const,
  v0: 0,
  v: 0,
  a: 0,
  t: 0,
  dx: 0,
};

describe("KinematicsCalculator", () => {
  it("solves final velocity from initial velocity, acceleration, and time", () => {
    const r = calc.execute({ ...base, mode: "timeBased", solveForTime: "v", v0: 0, a: 2, t: 5 }, context);
    expect(r.data.v).toBe(10);
    expect(r.data.dx).toBe(25);
  });

  it("solves initial velocity", () => {
    const r = calc.execute({ ...base, mode: "timeBased", solveForTime: "v0", v: 20, a: 2, t: 5 }, context);
    expect(r.data.v0).toBe(10);
  });

  it("solves acceleration", () => {
    const r = calc.execute({ ...base, mode: "timeBased", solveForTime: "a", v0: 0, v: 20, t: 5 }, context);
    expect(r.data.a).toBe(4);
  });

  it("solves time", () => {
    const r = calc.execute({ ...base, mode: "timeBased", solveForTime: "t", v0: 0, v: 20, a: 4 }, context);
    expect(r.data.t).toBe(5);
  });

  it("flags zero time when solving acceleration", () => {
    const r = calc.execute({ ...base, mode: "timeBased", solveForTime: "a", v0: 0, v: 20, t: 0 }, context);
    expect(r.data.error).toBe("zero-time");
  });

  it("flags zero acceleration when solving time", () => {
    const r = calc.execute({ ...base, mode: "timeBased", solveForTime: "t", v0: 0, v: 20, a: 0 }, context);
    expect(r.data.error).toBe("zero-acceleration");
  });

  it("solves final velocity from displacement (distance-based)", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "v", v0: 0, a: 2, dx: 25 }, context);
    expect(r.data.v).toBe(10);
    expect(r.data.t).toBe(5);
  });

  it("solves initial velocity (distance-based)", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "v0", v: 10, a: 2, dx: 25 }, context);
    expect(r.data.v0).toBe(0);
  });

  it("solves acceleration (distance-based, braking distance style)", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "a", v0: 0, v: 10, dx: 25 }, context);
    expect(r.data.a).toBe(2);
  });

  it("solves displacement (distance-based)", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "dx", v0: 0, v: 10, a: 2 }, context);
    expect(r.data.dx).toBe(25);
  });

  it("flags a negative discriminant when solving velocity with decelerating motion beyond stop", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "v", v0: 0, a: -2, dx: 25 }, context);
    expect(r.data.error).toBe("negative-discriminant");
  });

  it("flags zero displacement when solving acceleration (distance-based)", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "a", v0: 0, v: 10, dx: 0 }, context);
    expect(r.data.error).toBe("zero-displacement");
  });

  it("flags zero acceleration when solving displacement (distance-based)", () => {
    const r = calc.execute({ ...base, mode: "distanceBased", solveForDistance: "dx", v0: 0, v: 10, a: 0 }, context);
    expect(r.data.error).toBe("zero-acceleration");
  });
});
