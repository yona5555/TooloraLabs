import { describe, expect, it } from "vitest";
import { analyzeDensity, DENSITY_MATERIALS, floatIn, niceCeil, rankDensity, waterDensityAt } from "../densityAnalysis";
import { STANDARD_GRAVITY } from "../forceAnalysis";
import { DensityCalculator } from "../DensityCalculator";

describe("analyzeDensity", () => {
  // Aluminium sample matching the calculator default: 100 g in 50 cm³ → 2 g/cm³.
  const a = analyzeDensity(100, 50, 2);

  it("converts to SI and other units", () => {
    expect(a.massKg).toBe(0.1);
    expect(a.volumeM3).toBeCloseTo(5e-5, 15);
    expect(a.volumeL).toBe(0.05);
    expect(a.densitySI).toBe(2000);
    expect(a.lbPerFt3).toBeCloseTo(124.855921, 5);
    expect(a.specificGravity).toBe(2);
  });

  it("derives the cube, sphere and weight", () => {
    expect(a.cubeEdge ** 3).toBeCloseTo(50, 10);
    expect((Math.PI / 6) * a.sphereDiameter ** 3).toBeCloseTo(50, 10);
    expect(a.weight).toBeCloseTo(0.1 * STANDARD_GRAVITY, 12);
    expect(a.displacedWaterMass).toBe(50);
  });

  it("sinks in water with the right apparent weight", () => {
    expect(a.water.floats).toBe(false);
    expect(a.water.submergedFraction).toBe(1);
    expect(a.water.buoyantForce).toBeCloseTo(0.05 * STANDARD_GRAVITY, 12);
    expect(a.water.apparentWeight).toBeCloseTo(0.05 * STANDARD_GRAVITY, 12);
    expect(a.fluids.find((f) => f.key === "mercury")?.floats).toBe(true);
  });

  it("halving or doubling the volume doubles or halves the density", () => {
    expect(a.volumeSensitivity.map((s) => s.density)).toEqual([4, 2, 1]);
  });

  it("agrees with the calculator's own result", () => {
    const out = new DensityCalculator().execute({ operation: "solveDensity", mass: 100, volume: 50, density: 0 }, { locale: "en-US" }).data;
    expect(analyzeDensity(out.mass, out.volume, out.density).densitySI).toBe(out.densitySI);
  });
});

describe("floatIn", () => {
  it("floats ice with ~92% under water and buoyancy equal to weight", () => {
    const s = floatIn(0.917, 91.7, 100, 1);
    expect(s.floats).toBe(true);
    expect(s.submergedFraction).toBeCloseTo(0.917, 12);
    expect(s.buoyantForce).toBeCloseTo(0.0917 * STANDARD_GRAVITY, 12);
    expect(s.apparentWeight).toBe(0);
  });
});

describe("helpers", () => {
  it("interpolates water density with its 4 °C maximum", () => {
    expect(waterDensityAt(4)).toBe(1);
    expect(waterDensityAt(25)).toBeCloseTo((0.9982 + 0.9957) / 2, 10);
    expect(waterDensityAt(-5)).toBe(0.9998);
    expect(waterDensityAt(150)).toBe(0.9584);
  });

  it("ranks the user's value among the references", () => {
    const r = rankDensity(2);
    expect(r).toHaveLength(DENSITY_MATERIALS.length + 1);
    expect(r[0].key).toBe("osmium");
    const i = r.findIndex((x) => x.yours);
    expect(r[i - 1].density).toBeGreaterThanOrEqual(2);
    expect(r[i + 1].density).toBeLessThanOrEqual(2);
  });

  it("rounds up to 1/2/5 × 10ⁿ", () => {
    expect(niceCeil(3.7)).toBe(5);
    expect(niceCeil(11)).toBe(20);
    expect(niceCeil(0.03)).toBeCloseTo(0.05, 15);
    expect(niceCeil(100)).toBe(100);
    expect(niceCeil(0)).toBe(1);
  });
});
