import { describe, it, expect } from "vitest";
import { VectorCalculator } from "../VectorCalculator";

const context = { locale: "en-US" };
const calc = new VectorCalculator();

describe("VectorCalculator", () => {
  it("computes magnitude for a classic 3-4-5 right triangle vector", () => {
    const r = calc.execute({ ax: 3, ay: 4, az: 0, bx: 0, by: 0, bz: 0 }, context);
    expect(r.data.magnitudeA).toBe(5);
  });

  it("computes magnitude for a 3D vector", () => {
    const r = calc.execute({ ax: 1, ay: 2, az: 2, bx: 0, by: 0, bz: 0 }, context);
    expect(r.data.magnitudeA).toBe(3);
  });

  it("computes vector sum and difference component-wise", () => {
    const r = calc.execute({ ax: 1, ay: 2, az: 3, bx: 4, by: 5, bz: 6 }, context);
    expect(r.data.sumX).toBe(5);
    expect(r.data.sumY).toBe(7);
    expect(r.data.sumZ).toBe(9);
    expect(r.data.differenceX).toBe(-3);
    expect(r.data.differenceY).toBe(-3);
    expect(r.data.differenceZ).toBe(-3);
  });

  it("computes the dot product", () => {
    const r = calc.execute({ ax: 1, ay: 2, az: 3, bx: 4, by: 5, bz: 6 }, context);
    // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    expect(r.data.dotProduct).toBe(32);
  });

  it("computes the cross product of the standard basis vectors i x j = k", () => {
    const r = calc.execute({ ax: 1, ay: 0, az: 0, bx: 0, by: 1, bz: 0 }, context);
    expect(r.data.crossX).toBe(0);
    expect(r.data.crossY).toBe(0);
    expect(r.data.crossZ).toBe(1);
  });

  it("computes a 90-degree angle between orthogonal vectors", () => {
    const r = calc.execute({ ax: 1, ay: 0, az: 0, bx: 0, by: 1, bz: 0 }, context);
    expect(r.data.angleBetweenDegrees).toBeCloseTo(90, 9);
  });

  it("computes a 0-degree angle between identical-direction vectors", () => {
    const r = calc.execute({ ax: 2, ay: 0, az: 0, bx: 5, by: 0, bz: 0 }, context);
    expect(r.data.angleBetweenDegrees).toBeCloseTo(0, 9);
  });

  it("computes a 180-degree angle between opposite vectors", () => {
    const r = calc.execute({ ax: 1, ay: 0, az: 0, bx: -1, by: 0, bz: 0 }, context);
    expect(r.data.angleBetweenDegrees).toBeCloseTo(180, 9);
  });

  it("computes the unit vector of A", () => {
    const r = calc.execute({ ax: 3, ay: 4, az: 0, bx: 1, by: 1, bz: 1 }, context);
    expect(r.data.unitAX).toBe(0.6);
    expect(r.data.unitAY).toBe(0.8);
    expect(r.data.unitAZ).toBe(0);
  });

  it("flags a zero vector A and leaves angle/unit vector null", () => {
    const r = calc.execute({ ax: 0, ay: 0, az: 0, bx: 1, by: 1, bz: 1 }, context);
    expect(r.data.error).toBe("zero-vector-a");
    expect(r.data.unitAX).toBeNull();
    expect(r.data.angleBetweenDegrees).toBeNull();
    // Non-length-dependent operations still compute normally.
    expect(r.data.sumX).toBe(1);
  });

  it("flags a zero vector B and leaves angle null while A's unit vector still computes", () => {
    const r = calc.execute({ ax: 1, ay: 0, az: 0, bx: 0, by: 0, bz: 0 }, context);
    expect(r.data.error).toBe("zero-vector-b");
    expect(r.data.angleBetweenDegrees).toBeNull();
    expect(r.data.unitAX).toBe(1);
  });

  it("prioritizes the zero-vector-a error when both vectors are zero", () => {
    const r = calc.execute({ ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0 }, context);
    expect(r.data.error).toBe("zero-vector-a");
  });

  it("computes the vector projection of A onto B", () => {
    // A = (3, 4, 0) onto B = (1, 0, 0): the projection is just A's x-component along B.
    const r = calc.execute({ ax: 3, ay: 4, az: 0, bx: 1, by: 0, bz: 0 }, context);
    expect(r.data.projectionScalar).toBe(3);
    expect(r.data.projectionX).toBe(3);
    expect(r.data.projectionY).toBe(0);
    expect(r.data.projectionZ).toBe(0);
  });

  it("computes a negative scalar projection when the angle is obtuse", () => {
    const r = calc.execute({ ax: 1, ay: 0, az: 0, bx: -1, by: 0, bz: 0 }, context);
    expect(r.data.projectionScalar).toBe(-1);
  });

  it("leaves the projection null when B is a zero vector", () => {
    const r = calc.execute({ ax: 1, ay: 2, az: 3, bx: 0, by: 0, bz: 0 }, context);
    expect(r.data.projectionScalar).toBeNull();
    expect(r.data.projectionX).toBeNull();
    expect(r.data.projectionY).toBeNull();
    expect(r.data.projectionZ).toBeNull();
  });
});
