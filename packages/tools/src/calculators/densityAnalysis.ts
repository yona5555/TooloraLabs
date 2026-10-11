/**
 * Pure analysis behind the Density calculator's live table, 3D tank and indicators.
 * Inputs are the calculator's own units (g, cm³, g/cm³) and its own water reference
 * (1.0 g/cm³), so every visual agrees with the result; SI equivalents are derived here.
 * No DOM, no I/O.
 */
import { STANDARD_GRAVITY } from "./forceAnalysis";

/** Water reference used by DensityCalculator for specific gravity (g/cm³). */
export const DENSITY_WATER = 1.0;
/** 1 g/cm³ in lb/ft³ (453.59237 g/lb, 28 316.846592 cm³/ft³). */
export const LB_FT3_PER_G_CM3 = 62.427960576;

export type DensityReference = { key: string; density: number };

/** Typical densities (g/cm³) at room temperature, 1 atm (CRC Handbook of Chemistry and Physics). */
export const DENSITY_MATERIALS: DensityReference[] = [
  { key: "air", density: 0.0012 },
  { key: "cork", density: 0.24 },
  { key: "oak", density: 0.75 },
  { key: "ice", density: 0.917 },
  { key: "water", density: 1.0 },
  { key: "concrete", density: 2.4 },
  { key: "aluminum", density: 2.7 },
  { key: "iron", density: 7.874 },
  { key: "copper", density: 8.96 },
  { key: "lead", density: 11.34 },
  { key: "gold", density: 19.3 },
  { key: "osmium", density: 22.59 },
];

/** Real liquids (g/cm³ near 20 °C) used for the float/sink checks. */
export const DENSITY_FLUIDS: DensityReference[] = [
  { key: "gasoline", density: 0.74 },
  { key: "ethanol", density: 0.789 },
  { key: "water", density: 1.0 },
  { key: "seawater", density: 1.025 },
  { key: "glycerin", density: 1.26 },
  { key: "mercury", density: 13.53 },
];

/** Liquid water density (g/cm³) at 1 atm, 0–100 °C; maximum near 4 °C. */
export const WATER_DENSITY_BY_TEMPERATURE: { temp: number; density: number }[] = [
  { temp: 0, density: 0.9998 },
  { temp: 4, density: 1.0 },
  { temp: 10, density: 0.9997 },
  { temp: 20, density: 0.9982 },
  { temp: 30, density: 0.9957 },
  { temp: 40, density: 0.9922 },
  { temp: 50, density: 0.988 },
  { temp: 60, density: 0.9832 },
  { temp: 70, density: 0.9778 },
  { temp: 80, density: 0.9718 },
  { temp: 90, density: 0.9653 },
  { temp: 100, density: 0.9584 },
];

/** Linear interpolation in the water table (clamped to 0–100 °C). */
export function waterDensityAt(temp: number): number {
  const table = WATER_DENSITY_BY_TEMPERATURE;
  if (temp <= table[0].temp) return table[0].density;
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (temp <= b.temp) return a.density + ((temp - a.temp) / (b.temp - a.temp)) * (b.density - a.density);
  }
  return table[table.length - 1].density;
}

export type FloatState = {
  fluidDensity: number;
  floats: boolean;
  /** Fraction of the volume under the surface at rest (1 when it sinks). */
  submergedFraction: number;
  /** Buoyant force at rest (N): equals the weight when floating, ρ_f V g₀ when sunk. */
  buoyantForce: number;
  /** Net downward force on the bottom when sunk (N); 0 when floating. */
  apparentWeight: number;
};

/** Equilibrium of a body of density ρ (g/cm³), mass m (g) and volume V (cm³) in a fluid. */
export function floatIn(density: number, mass: number, volume: number, fluidDensity: number): FloatState {
  const weight = (mass / 1000) * STANDARD_GRAVITY;
  const fullBuoyancy = ((fluidDensity * volume) / 1000) * STANDARD_GRAVITY;
  const floats = fluidDensity > 0 && density < fluidDensity;
  return {
    fluidDensity,
    floats,
    submergedFraction: fluidDensity > 0 ? Math.min(1, Math.max(0, density / fluidDensity)) : 1,
    buoyantForce: floats ? weight : fullBuoyancy,
    apparentWeight: floats ? 0 : weight - fullBuoyancy,
  };
}

export type DensityAnalysis = {
  mass: number;
  volume: number;
  density: number;
  massKg: number;
  volumeM3: number;
  volumeL: number;
  densitySI: number;
  /** kg per litre (numerically equal to g/cm³). */
  kgPerL: number;
  lbPerFt3: number;
  specificGravity: number;
  /** Edge of a cube with this volume, ∛V (cm). */
  cubeEdge: number;
  /** Diameter of a sphere with this volume, ∛(6V/π) (cm). */
  sphereDiameter: number;
  /** Weight on Earth, m g₀ (N). */
  weight: number;
  /** Mass of the water the body displaces when fully under (g). */
  displacedWaterMass: number;
  water: FloatState;
  /** Waterline depth on the cube in water (cm). */
  waterlineDepth: number;
  fluids: (DensityReference & FloatState)[];
  /** Same mass in half / the same / double the volume → density. */
  volumeSensitivity: { factor: number; volume: number; density: number }[];
};

export function analyzeDensity(mass: number, volume: number, density: number): DensityAnalysis {
  const water = floatIn(density, mass, volume, DENSITY_WATER);
  const cubeEdge = Math.cbrt(Math.max(volume, 0));
  return {
    mass,
    volume,
    density,
    massKg: mass / 1000,
    volumeM3: volume * 1e-6,
    volumeL: volume / 1000,
    densitySI: density * 1000,
    kgPerL: density,
    lbPerFt3: density * LB_FT3_PER_G_CM3,
    specificGravity: density / DENSITY_WATER,
    cubeEdge,
    sphereDiameter: Math.cbrt((6 * Math.max(volume, 0)) / Math.PI),
    weight: (mass / 1000) * STANDARD_GRAVITY,
    displacedWaterMass: DENSITY_WATER * volume,
    water,
    waterlineDepth: water.submergedFraction * cubeEdge,
    fluids: DENSITY_FLUIDS.map((fl) => ({ ...fl, ...floatIn(density, mass, volume, fl.density) })),
    volumeSensitivity: [0.5, 1, 2].map((factor) => ({ factor, volume: volume * factor, density: volume !== 0 ? mass / (volume * factor) : 0 })),
  };
}

/** The reference materials plus the user's value (key "yours"), densest first. */
export function rankDensity(density: number): { key: string; density: number; yours: boolean }[] {
  return [...DENSITY_MATERIALS.map((m) => ({ ...m, yours: false })), { key: "yours", density, yours: true }].sort((a, b) => b.density - a.density || Number(a.yours) - Number(b.yours));
}

/** Smallest 1/2/5 × 10ⁿ value ≥ v (for a true-scale tank or ruler). */
export function niceCeil(v: number): number {
  if (!(v > 0) || !Number.isFinite(v)) return 1;
  const e = Math.floor(Math.log10(v));
  const base = 10 ** e;
  for (const k of [1, 2, 5, 10]) if (k * base >= v * (1 - 1e-12)) return k * base;
  return 10 * base;
}
