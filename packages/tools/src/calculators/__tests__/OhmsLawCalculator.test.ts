import { describe, it, expect } from "vitest";
import { OhmsLawCalculator } from "../OhmsLawCalculator";

const context = { locale: "en-US" };
const calc = new OhmsLawCalculator();
const base = { knownPair: "VI" as const, voltage: 0, current: 0, resistance: 0, power: 0 };

describe("OhmsLawCalculator", () => {
  it("solves resistance and power from voltage and current", () => {
    const r = calc.execute({ ...base, knownPair: "VI", voltage: 12, current: 2 }, context);
    expect(r.data.resistance).toBe(6);
    expect(r.data.power).toBe(24);
  });

  it("solves current and power from voltage and resistance", () => {
    const r = calc.execute({ ...base, knownPair: "VR", voltage: 12, resistance: 6 }, context);
    expect(r.data.current).toBe(2);
    expect(r.data.power).toBe(24);
  });

  it("solves voltage and power from current and resistance", () => {
    const r = calc.execute({ ...base, knownPair: "IR", current: 2, resistance: 6 }, context);
    expect(r.data.voltage).toBe(12);
    expect(r.data.power).toBe(24);
  });

  it("solves current and resistance from voltage and power", () => {
    const r = calc.execute({ ...base, knownPair: "VP", voltage: 12, power: 24 }, context);
    expect(r.data.current).toBe(2);
    expect(r.data.resistance).toBe(6);
  });

  it("solves voltage and resistance from current and power", () => {
    const r = calc.execute({ ...base, knownPair: "IP", current: 2, power: 24 }, context);
    expect(r.data.voltage).toBe(12);
    expect(r.data.resistance).toBe(6);
  });

  it("solves voltage and current from resistance and power", () => {
    const r = calc.execute({ ...base, knownPair: "RP", resistance: 6, power: 24 }, context);
    expect(r.data.voltage).toBe(12);
    expect(r.data.current).toBe(2);
  });

  it("flags zero current when solving from voltage and current", () => {
    const r = calc.execute({ ...base, knownPair: "VI", voltage: 12, current: 0 }, context);
    expect(r.data.error).toBe("zero-current");
  });

  it("flags zero resistance when solving from voltage and resistance", () => {
    const r = calc.execute({ ...base, knownPair: "VR", voltage: 12, resistance: 0 }, context);
    expect(r.data.error).toBe("zero-resistance");
  });

  it("flags zero voltage when solving from voltage and power", () => {
    const r = calc.execute({ ...base, knownPair: "VP", voltage: 0, power: 24 }, context);
    expect(r.data.error).toBe("zero-voltage");
  });

  it("flags zero power when solving from current and power", () => {
    const r = calc.execute({ ...base, knownPair: "IP", current: 2, power: 0 }, context);
    expect(r.data.error).toBe("zero-power");
  });

  it("flags zero resistance when solving from resistance and power", () => {
    const r = calc.execute({ ...base, knownPair: "RP", resistance: 0, power: 24 }, context);
    expect(r.data.error).toBe("zero-resistance");
  });
});
