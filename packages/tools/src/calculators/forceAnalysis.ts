/**
 * Pure analysis behind the Force calculator's live table, 3D drawing and indicators.
 * Every visual on the page reads these numbers, so they always agree with the
 * calculator's own result (same G as ForceCalculator). No DOM, no I/O.
 */

/** Gravitational constant used by ForceCalculator (N·m²/kg²). */
export const FORCE_G = 6.674e-11;
/** Standard gravity g₀ (m/s², exact by definition, CGPM 1901). */
export const STANDARD_GRAVITY = 9.80665;
/** 1 pound-force in newtons (exact: 0.45359237 kg × g₀). */
export const NEWTONS_PER_LBF = 4.4482216152605;
/** 1 dyne = 10⁻⁵ N. */
export const DYNES_PER_NEWTON = 1e5;

export type SecondLawSnapshot = { t: number; x: number; v: number; p: number; ke: number; power: number };

export type SecondLawAnalysis = {
  force: number;
  mass: number;
  acceleration: number;
  /** a / g₀. */
  gForce: number;
  /** Mass whose weight on Earth equals F: F / g₀ (kg). */
  weightEquivalentKg: number;
  /** Weight of the mass itself on Earth: m·g₀ (N). */
  ownWeight: number;
  /** F / (m·g₀). */
  thrustToWeight: number;
  kN: number;
  lbf: number;
  kgf: number;
  dyn: number;
  /** Starting from rest, the motion at t = 0…4 s. */
  snapshots: SecondLawSnapshot[];
  /** Time to reach 100 km/h from rest (s). */
  timeTo100kmh: number;
  /** Distance covered while reaching 100 km/h (m). */
  distanceTo100kmh: number;
  /** Same force on half / the same / double the mass → acceleration. */
  massSensitivity: { factor: number; mass: number; acceleration: number }[];
};

export function kinematicsAt(force: number, mass: number, acceleration: number, t: number): SecondLawSnapshot {
  const v = acceleration * t;
  return { t, x: 0.5 * acceleration * t * t, v, p: force * t, ke: 0.5 * mass * v * v, power: force * v };
}

export function analyzeSecondLaw(force: number, mass: number, acceleration: number): SecondLawAnalysis {
  const v100 = 100 / 3.6;
  const t100 = acceleration !== 0 ? v100 / Math.abs(acceleration) : Infinity;
  return {
    force,
    mass,
    acceleration,
    gForce: acceleration / STANDARD_GRAVITY,
    weightEquivalentKg: force / STANDARD_GRAVITY,
    ownWeight: mass * STANDARD_GRAVITY,
    thrustToWeight: mass !== 0 ? force / (mass * STANDARD_GRAVITY) : 0,
    kN: force / 1000,
    lbf: force / NEWTONS_PER_LBF,
    kgf: force / STANDARD_GRAVITY,
    dyn: force * DYNES_PER_NEWTON,
    snapshots: [0, 1, 2, 3, 4].map((t) => kinematicsAt(force, mass, acceleration, t)),
    timeTo100kmh: t100,
    distanceTo100kmh: Number.isFinite(t100) ? 0.5 * Math.abs(acceleration) * t100 * t100 : Infinity,
    massSensitivity: [0.5, 1, 2].map((factor) => ({ factor, mass: mass * factor, acceleration: mass !== 0 ? force / (mass * factor) : 0 })),
  };
}

export type GravitationAnalysis = {
  force: number;
  mass1: number;
  mass2: number;
  distance: number;
  /** Field of m₁ at m₂'s position, Gm₁/r² (m/s²) — m₂'s acceleration. */
  field1: number;
  /** Field of m₂ at m₁'s position, Gm₂/r² (m/s²) — m₁'s acceleration. */
  field2: number;
  /** F / m₁ and F / m₂ (equal to field2 / field1). */
  accel1: number;
  accel2: number;
  /** Gravitational potential energy −Gm₁m₂/r (J). */
  potentialEnergy: number;
  /** Escape speed from m₁ at distance r: √(2Gm₁/r) (m/s). */
  escapeSpeed: number;
  /** Circular two-body orbital speed √(G(m₁+m₂)/r) (m/s). */
  orbitalSpeed: number;
  /** Two-body circular orbital period 2π√(r³/(G(m₁+m₂))) (s). */
  orbitalPeriod: number;
  /** Barycentre: distance from m₁ and from m₂ (m). */
  barycenterFrom1: number;
  barycenterFrom2: number;
  /** F at r/2, r, 2r, 3r (inverse square). */
  atMultiples: { k: number; distance: number; force: number }[];
  /** F expressed as the weight of a mass on Earth (kg). */
  weightEquivalentKg: number;
};

export function gravitationalForce(mass1: number, mass2: number, distance: number): number {
  return distance !== 0 ? (FORCE_G * mass1 * mass2) / (distance * distance) : Infinity;
}

export function analyzeGravitation(mass1: number, mass2: number, distance: number, force: number): GravitationAnalysis {
  const r = distance;
  const r2 = r * r;
  const total = mass1 + mass2;
  return {
    force,
    mass1,
    mass2,
    distance: r,
    field1: r !== 0 ? (FORCE_G * mass1) / r2 : 0,
    field2: r !== 0 ? (FORCE_G * mass2) / r2 : 0,
    accel1: mass1 !== 0 ? force / mass1 : 0,
    accel2: mass2 !== 0 ? force / mass2 : 0,
    potentialEnergy: r !== 0 ? -(FORCE_G * mass1 * mass2) / r : 0,
    escapeSpeed: r > 0 ? Math.sqrt((2 * FORCE_G * Math.abs(mass1)) / r) : 0,
    orbitalSpeed: r > 0 ? Math.sqrt((FORCE_G * Math.abs(total)) / r) : 0,
    orbitalPeriod: r > 0 && total > 0 ? 2 * Math.PI * Math.sqrt((r * r2) / (FORCE_G * total)) : 0,
    barycenterFrom1: total !== 0 ? (r * mass2) / total : 0,
    barycenterFrom2: total !== 0 ? (r * mass1) / total : 0,
    atMultiples: [0.5, 1, 2, 3].map((k) => ({ k, distance: r * k, force: force / (k * k) })),
    weightEquivalentKg: force / STANDARD_GRAVITY,
  };
}

/** F(r) on [r/2, 4r] sampled for the inverse-square trend line. */
export function inverseSquareCurve(force: number, distance: number, samples = 48): { distance: number; force: number }[] {
  const out: { distance: number; force: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const k = 0.5 + (3.5 * i) / (samples - 1);
    out.push({ distance: distance * k, force: force / (k * k) });
  }
  return out;
}

export type CelestialBody = { key: string; mass: number; radius: number };

/** Mass (kg) and volumetric mean radius (m), NASA Planetary Fact Sheet. */
export const CELESTIAL_BODIES: CelestialBody[] = [
  { key: "sun", mass: 1.9885e30, radius: 6.957e8 },
  { key: "mercury", mass: 3.3011e23, radius: 2.4397e6 },
  { key: "venus", mass: 4.8675e24, radius: 6.0518e6 },
  { key: "earth", mass: 5.972e24, radius: 6.371e6 },
  { key: "moon", mass: 7.342e22, radius: 1.7374e6 },
  { key: "mars", mass: 6.4171e23, radius: 3.3895e6 },
  { key: "jupiter", mass: 1.8982e27, radius: 6.9911e7 },
  { key: "saturn", mass: 5.6834e26, radius: 5.8232e7 },
  { key: "uranus", mass: 8.681e25, radius: 2.5362e7 },
  { key: "neptune", mass: 1.02413e26, radius: 2.4622e7 },
];

/** Weight of `mass` at the surface of each body (F = GMm/R²), heaviest first. */
export function surfaceWeights(mass: number): { key: string; gravity: number; weight: number }[] {
  return CELESTIAL_BODIES.map((b) => {
    const gravity = (FORCE_G * b.mass) / (b.radius * b.radius);
    return { key: b.key, gravity, weight: gravity * mass };
  }).sort((p, q) => q.weight - p.weight || q.gravity - p.gravity);
}

/** Real reference forces (N) for the log-scale magnitude bar. */
export const FORCE_REFERENCES: { key: string; force: number }[] = [
  { key: "twoPeople", force: gravitationalForce(70, 70, 1) },
  { key: "apple", force: 1 },
  { key: "adultWeight", force: 70 * STANDARD_GRAVITY },
  { key: "smallCarWeight", force: 1200 * STANDARD_GRAVITY },
  { key: "saturnVThrust", force: 3.4e7 },
  { key: "earthMoon", force: gravitationalForce(5.972e24, 7.342e22, 3.844e8) },
];

/** Splits a positive finite number into mantissa and power of ten (5.972e24 → [5.972, 24]). */
export function toScientific(value: number, digits = 4): { mantissa: number; exponent: number } {
  if (value === 0 || !Number.isFinite(value)) return { mantissa: value, exponent: 0 };
  let exponent = Math.floor(Math.log10(Math.abs(value)));
  let mantissa = Number((value / 10 ** exponent).toPrecision(digits));
  if (Math.abs(mantissa) >= 10) {
    mantissa /= 10;
    exponent += 1;
  }
  return { mantissa, exponent };
}
