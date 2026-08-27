import { describe, it, expect } from "vitest";
import { IdealGasLawCalculator } from "../IdealGasLawCalculator";

const context = { locale: "en-US" };
const calc = new IdealGasLawCalculator();
const base = { solveFor: "volume" as const, pressureAtm: 0, volumeLiters: 0, moles: 0, temperatureKelvin: 0 };

describe("IdealGasLawCalculator", () => {
  it("computes the molar volume of a gas at STP (approximately 22.4 L)", () => {
    const r = calc.execute({ ...base, solveFor: "volume", pressureAtm: 1, moles: 1, temperatureKelvin: 273.15 }, context);
    expect(r.data.volumeLiters).toBeCloseTo(22.414, 1);
  });

  it("solves for pressure", () => {
    const r = calc.execute({ ...base, solveFor: "pressure", volumeLiters: 22.414, moles: 1, temperatureKelvin: 273.15 }, context);
    expect(r.data.pressureAtm).toBeCloseTo(1, 2);
  });

  it("solves for moles", () => {
    const r = calc.execute({ ...base, solveFor: "moles", pressureAtm: 1, volumeLiters: 22.414, temperatureKelvin: 273.15 }, context);
    expect(r.data.moles).toBeCloseTo(1, 2);
  });

  it("solves for temperature", () => {
    const r = calc.execute({ ...base, solveFor: "temperature", pressureAtm: 1, volumeLiters: 22.414, moles: 1 }, context);
    expect(r.data.temperatureKelvin).toBeCloseTo(273.15, 0);
  });

  it("flags zero volume when solving for pressure", () => {
    const r = calc.execute({ ...base, solveFor: "pressure", volumeLiters: 0, moles: 1, temperatureKelvin: 273.15 }, context);
    expect(r.data.error).toBe("zero-volume");
  });

  it("flags zero pressure when solving for volume", () => {
    const r = calc.execute({ ...base, solveFor: "volume", pressureAtm: 0, moles: 1, temperatureKelvin: 273.15 }, context);
    expect(r.data.error).toBe("zero-pressure");
  });

  it("flags zero temperature when solving for moles", () => {
    const r = calc.execute({ ...base, solveFor: "moles", pressureAtm: 1, volumeLiters: 22.414, temperatureKelvin: 0 }, context);
    expect(r.data.error).toBe("zero-temperature");
  });

  it("flags zero moles when solving for temperature", () => {
    const r = calc.execute({ ...base, solveFor: "temperature", pressureAtm: 1, volumeLiters: 22.414, moles: 0 }, context);
    expect(r.data.error).toBe("zero-moles");
  });

  it("doubles pressure when volume is halved at constant temperature and moles (Boyle's law check)", () => {
    const r1 = calc.execute({ ...base, solveFor: "pressure", volumeLiters: 10, moles: 1, temperatureKelvin: 300 }, context);
    const r2 = calc.execute({ ...base, solveFor: "pressure", volumeLiters: 5, moles: 1, temperatureKelvin: 300 }, context);
    expect(r2.data.pressureAtm).toBeCloseTo(r1.data.pressureAtm * 2, 5);
  });
});
