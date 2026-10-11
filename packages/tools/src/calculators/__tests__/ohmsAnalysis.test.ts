import { describe, expect, it } from "vitest";
import { analyzeOhms, dimmerCircuit, ELEMENTARY_CHARGE, fuseFor, viLine } from "../ohmsAnalysis";
import { OhmsLawCalculator } from "../OhmsLawCalculator";

describe("analyzeOhms", () => {
  const out = new OhmsLawCalculator().execute({ knownPair: "VI", voltage: 12, current: 2, resistance: 0, power: 0 }, { locale: "en-US" }).data;
  const a = analyzeOhms(out.voltage, out.current, out.resistance, out.power);

  it("agrees with the calculator on all three power formulas", () => {
    expect(out.resistance).toBe(6);
    expect(a.powerViaVI).toBe(24);
    expect(a.powerViaI2R).toBe(24);
    expect(a.powerViaV2R).toBe(24);
  });

  it("derives conductance, units, charge and energy", () => {
    expect(a.conductance).toBeCloseTo(1 / 6, 12);
    expect(a.milliamps).toBe(2000);
    expect(a.kilohms).toBe(0.006);
    expect(a.chargePerMinute).toBe(120);
    expect(a.electronsPerSecond).toBeCloseTo(2 / ELEMENTARY_CHARGE, -5);
    expect(a.joulesPerMinute).toBe(1440);
    expect(a.kWhPerDay).toBeCloseTo(0.576, 12);
  });

  it("halves the current when R doubles at the same voltage", () => {
    expect(a.sensitivity.map((s) => s.current)).toEqual([4, 2, 1]);
    expect(a.sensitivity.map((s) => s.power)).toEqual([48, 24, 12]);
  });

  it("picks fuse, resistor rating and E12 value", () => {
    expect(a.fuse).toBe(2);
    expect(fuseFor(2.1).rating).toBe(3);
    expect(fuseFor(40)).toEqual({ rating: 30, exceeded: true });
    expect(a.resistorRating).toBeNull();
    expect(analyzeOhms(5, 0.05, 100, 0.25).resistorRating).toBe(0.5);
    expect(a.e12).toBe(5.6);
    expect(analyzeOhms(1, 1, 4700, 1).e12).toBe(4700);
  });
});

describe("dimmerCircuit", () => {
  it("splits voltage and power between load and rheostat", () => {
    const d = dimmerCircuit(12, 6, 6);
    expect(d.current).toBe(1);
    expect(d.loadVoltage).toBe(6);
    expect(d.dimmerVoltage).toBe(6);
    expect(d.loadPower).toBe(6);
    expect(d.brightness).toBe(0.25);
    expect(dimmerCircuit(12, 6, 0).brightness).toBe(1);
  });
});

describe("viLine", () => {
  it("is a straight line through the origin with slope R", () => {
    expect(viLine(6, 4)).toEqual([
      { current: 0, voltage: 0 },
      { current: 2, voltage: 12 },
      { current: 4, voltage: 24 },
    ]);
  });
});
