import { describe, it, expect } from "vitest";
import { ProjectileMotionCalculator } from "../ProjectileMotionCalculator";

const context = { locale: "en-US" };
const calc = new ProjectileMotionCalculator();
const base = {
  speed: 0,
  angle: 0,
  height: 0,
  gravity: 9.81,
};

describe("ProjectileMotionCalculator", () => {
  it("computes level-ground trajectory (h0 = 0)", () => {
    // v0 = 20 m/s at 30 degrees, g = 9.81 m/s^2
    const r = calc.execute({ ...base, speed: 20, angle: 30, height: 0, gravity: 9.81 }, context);
    expect(r.data.error).toBeNull();
    // t = 2*v0*sin(theta)/g
    expect(r.data.timeOfFlight).toBeCloseTo(2.039, 2);
    // maxHeight = (v0*sin(theta))^2 / (2g)
    expect(r.data.maxHeight).toBeCloseTo(5.097, 2);
    // range = v0^2*sin(2*theta)/g
    expect(r.data.range).toBeCloseTo(35.33, 1);
    // level ground: impact speed equals launch speed
    expect(r.data.impactSpeed).toBeCloseTo(20, 3);
    // level ground: impact angle equals launch angle
    expect(r.data.impactAngle).toBeCloseTo(30, 2);
  });

  it("computes elevated launch trajectory (h0 > 0)", () => {
    const r = calc.execute({ ...base, speed: 15, angle: 40, height: 10, gravity: 9.81 }, context);
    expect(r.data.error).toBeNull();
    // impact speed must exceed launch speed since it falls further than it rises
    expect(r.data.impactSpeed).toBeGreaterThan(15);
    // time of flight should be longer than the level-ground case at the same speed/angle
    const level = calc.execute({ ...base, speed: 15, angle: 40, height: 0, gravity: 9.81 }, context);
    expect(r.data.timeOfFlight).toBeGreaterThan(level.data.timeOfFlight);
    // max height includes the launch height
    expect(r.data.maxHeight).toBeGreaterThan(10);
    expect(r.data.range).toBeGreaterThan(0);
  });

  it("handles straight-up launch (theta = 90 degrees, range = 0)", () => {
    const r = calc.execute({ ...base, speed: 10, angle: 90, height: 0, gravity: 9.81 }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.range).toBeCloseTo(0, 5);
    // t = 2*v0/g
    expect(r.data.timeOfFlight).toBeCloseTo((2 * 10) / 9.81, 3);
    expect(r.data.maxHeight).toBeCloseTo((10 * 10) / (2 * 9.81), 3);
    expect(r.data.impactSpeed).toBeCloseTo(10, 3);
  });

  it("handles horizontal launch from height (theta = 0 degrees)", () => {
    const r = calc.execute({ ...base, speed: 8, angle: 0, height: 20, gravity: 9.81 }, context);
    expect(r.data.error).toBeNull();
    // t = sqrt(2*h0/g)
    const expectedT = Math.sqrt((2 * 20) / 9.81);
    expect(r.data.timeOfFlight).toBeCloseTo(expectedT, 3);
    // range = v0 * t
    expect(r.data.range).toBeCloseTo(8 * expectedT, 3);
    // max height equals the launch height for a horizontal launch
    expect(r.data.maxHeight).toBeCloseTo(20, 5);
    // impact speed from energy: sqrt(v0^2 + 2*g*h0)
    expect(r.data.impactSpeed).toBeCloseTo(Math.sqrt(8 * 8 + 2 * 9.81 * 20), 3);
  });

  it("flags non-positive gravity as invalid", () => {
    const r = calc.execute({ ...base, speed: 10, angle: 45, height: 0, gravity: 0 }, context);
    expect(r.data.error).toBe("invalid-gravity");

    const rNeg = calc.execute({ ...base, speed: 10, angle: 45, height: 0, gravity: -9.81 }, context);
    expect(rNeg.data.error).toBe("invalid-gravity");
  });

  it("flags negative launch speed as invalid", () => {
    const r = calc.execute({ ...base, speed: -5, angle: 45, height: 0, gravity: 9.81 }, context);
    expect(r.data.error).toBe("invalid-speed");
  });

  it("flags negative launch height as invalid", () => {
    const r = calc.execute({ ...base, speed: 10, angle: 45, height: -1, gravity: 9.81 }, context);
    expect(r.data.error).toBe("invalid-height");
  });

  it("handles zero speed (projectile stays put or drops straight down)", () => {
    const r = calc.execute({ ...base, speed: 0, angle: 45, height: 5, gravity: 9.81 }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.range).toBeCloseTo(0, 5);
    expect(r.data.maxHeight).toBeCloseTo(5, 5);
  });
});
