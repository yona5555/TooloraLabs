/**
 * Pure analysis behind the Energy, Work & Power calculator's live table, 3D drawing and
 * indicators. Every visual reads these numbers, so they always agree with the calculator's own
 * result (same g = 9.8 m/s² as EnergyWorkPowerCalculator). No DOM, no I/O.
 */

/** Gravitational acceleration used by EnergyWorkPowerCalculator (m/s²). */
export const ENERGY_GRAVITY = 9.8;
/** 1 thermochemical calorie in joules (exact). */
export const JOULES_PER_CALORIE = 4.184;
/** 1 watt-hour in joules (exact). */
export const JOULES_PER_WATT_HOUR = 3600;
/** 1 electronvolt in joules (exact since the 2019 SI redefinition). */
export const JOULES_PER_EV = 1.602176634e-19;
/** 1 foot-pound-force in joules. */
export const JOULES_PER_FOOT_POUND = 1.3558179483314;
/** 1 mechanical horsepower in watts (550 ft·lbf/s). */
export const WATTS_PER_HORSEPOWER = 745.69987158227;
/** Reference incandescent bulb (W). */
export const BULB_WATTS = 60;

export type EnergyUnits = { kJ: number; kcal: number; wh: number; kwh: number; ev: number; ftlbf: number };

/** One energy in joules expressed in the other common units. */
export function energyUnits(joules: number): EnergyUnits {
  return {
    kJ: joules / 1000,
    kcal: joules / (JOULES_PER_CALORIE * 1000),
    wh: joules / JOULES_PER_WATT_HOUR,
    kwh: joules / (JOULES_PER_WATT_HOUR * 1000),
    ev: joules / JOULES_PER_EV,
    ftlbf: joules / JOULES_PER_FOOT_POUND,
  };
}

/** Everyday equivalents of an energy (J). */
export function energyEquivalents(joules: number): { bulbSeconds: number; liftOneKgMetres: number; appleLifts: number; kcal: number } {
  return {
    bulbSeconds: joules / BULB_WATTS,
    liftOneKgMetres: joules / ENERGY_GRAVITY,
    // A 100 g apple lifted 1 m takes 0.98 J.
    appleLifts: joules / (0.1 * ENERGY_GRAVITY),
    kcal: joules / (JOULES_PER_CALORIE * 1000),
  };
}

export type WorkAnalysis = {
  force: number;
  distance: number;
  angleDegrees: number;
  work: number;
  /** Component of F along the displacement, F·cosθ (N) — the part that does work. */
  parallel: number;
  /** Component of F across the displacement, F·sinθ (N) — does no work. */
  perpendicular: number;
  /** Work if the force were fully aligned, F·d (J). */
  alignedWork: number;
  /** cosθ: share of the aligned work actually done. */
  share: number;
  sign: "positive" | "zero" | "negative";
  /** W at reference angles. */
  atAngles: { angle: number; work: number }[];
};

const rad = (deg: number) => (deg * Math.PI) / 180;
/** cos that returns an exact 0 at odd multiples of 90° (avoids 6e-17). */
function cosDeg(deg: number): number {
  const c = Math.cos(rad(deg));
  return Math.abs(c) < 1e-12 ? 0 : c;
}
function sinDeg(deg: number): number {
  const s = Math.sin(rad(deg));
  return Math.abs(s) < 1e-12 ? 0 : s;
}

export function analyzeWork(force: number, distance: number, angleDegrees: number): WorkAnalysis {
  const share = cosDeg(angleDegrees);
  const work = force * distance * share;
  const eps = Math.abs(force * distance) * 1e-12;
  return {
    force,
    distance,
    angleDegrees,
    work,
    parallel: force * share,
    perpendicular: force * sinDeg(angleDegrees),
    alignedWork: force * distance,
    share,
    sign: work > eps ? "positive" : work < -eps ? "negative" : "zero",
    atAngles: [0, 30, 45, 60, 90, 120, 180].map((angle) => ({ angle, work: force * distance * cosDeg(angle) })),
  };
}

/** W(θ) = F·d·cosθ sampled on [0°, 180°]. */
export function workAngleCurve(force: number, distance: number, samples = 61): { angle: number; work: number }[] {
  const out: { angle: number; work: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const angle = (180 * i) / (samples - 1);
    out.push({ angle, work: force * distance * cosDeg(angle) });
  }
  return out;
}

export type KineticAnalysis = {
  mass: number;
  velocity: number;
  kineticEnergy: number;
  /** p = m·v (kg·m/s). */
  momentum: number;
  kmh: number;
  /** Height a free fall needs to reach this speed: v² / 2g (m). */
  equivalentDropHeight: number;
  /** Average force that stops the body within 10 m: KE / 10 (N). */
  stopForce10m: number;
  /** Same mass at half / the same / double the speed. */
  speedSensitivity: { factor: number; velocity: number; kineticEnergy: number }[];
  /** Double the mass at the same speed. */
  doubleMassEnergy: number;
};

export function analyzeKinetic(mass: number, velocity: number): KineticAnalysis {
  const ke = 0.5 * mass * velocity * velocity;
  return {
    mass,
    velocity,
    kineticEnergy: ke,
    momentum: mass * velocity,
    kmh: velocity * 3.6,
    equivalentDropHeight: (velocity * velocity) / (2 * ENERGY_GRAVITY),
    stopForce10m: ke / 10,
    speedSensitivity: [0.5, 1, 2].map((factor) => ({ factor, velocity: velocity * factor, kineticEnergy: 0.5 * mass * (velocity * factor) ** 2 })),
    doubleMassEnergy: 2 * ke,
  };
}

export type FallStage = { fraction: number; height: number; potential: number; kinetic: number; speed: number; time: number };

export type PotentialAnalysis = {
  mass: number;
  height: number;
  potentialEnergy: number;
  /** Weight m·g (N). */
  weight: number;
  /** Speed on reaching the ground from rest, √(2gh) (m/s), air resistance ignored. */
  impactSpeed: number;
  /** Fall time from rest, √(2h/g) (s). */
  fallTime: number;
  /** Energy split while falling, from the top (fraction 0) to the ground (fraction 1). */
  stages: FallStage[];
  /** PE at half / double the height. */
  heightSensitivity: { factor: number; height: number; potentialEnergy: number }[];
};

/** State of a body dropped from rest at height h after falling a fraction of the way (0…1). */
export function fallStage(mass: number, height: number, fraction: number): FallStage {
  const h = Math.max(0, height);
  const dropped = h * fraction;
  const left = h - dropped;
  const speed = Math.sqrt(2 * ENERGY_GRAVITY * dropped);
  return {
    fraction,
    height: left,
    potential: mass * ENERGY_GRAVITY * left,
    kinetic: mass * ENERGY_GRAVITY * dropped,
    speed,
    time: Math.sqrt((2 * dropped) / ENERGY_GRAVITY),
  };
}

/** Falling-body state at time t (clamped to the fall time). */
export function fallAtTime(mass: number, height: number, t: number): FallStage {
  const h = Math.max(0, height);
  const tf = Math.sqrt((2 * h) / ENERGY_GRAVITY);
  const tt = Math.max(0, Math.min(tf, t));
  const dropped = 0.5 * ENERGY_GRAVITY * tt * tt;
  return fallStage(mass, h, h > 0 ? Math.min(1, dropped / h) : 1);
}

export function analyzePotential(mass: number, height: number): PotentialAnalysis {
  const h = Math.max(0, height);
  return {
    mass,
    height,
    potentialEnergy: mass * ENERGY_GRAVITY * height,
    weight: mass * ENERGY_GRAVITY,
    impactSpeed: Math.sqrt(2 * ENERGY_GRAVITY * h),
    fallTime: Math.sqrt((2 * h) / ENERGY_GRAVITY),
    stages: [0, 0.25, 0.5, 0.75, 1].map((f) => fallStage(mass, h, f)),
    heightSensitivity: [0.5, 1, 2].map((factor) => ({ factor, height: height * factor, potentialEnergy: mass * ENERGY_GRAVITY * height * factor })),
  };
}

export type PowerAnalysis = {
  work: number;
  time: number;
  power: number;
  kW: number;
  horsepower: number;
  /** Energy used if this power ran for one hour (kWh). */
  kwhPerHour: number;
  /** Number of 60 W bulbs this power could run. */
  bulbs: number;
  /** Same work over t/4 … 4t. */
  timeSteps: { factor: number; time: number; power: number }[];
};

export function analyzePower(work: number, time: number): PowerAnalysis {
  const power = time > 0 ? work / time : 0;
  return {
    work,
    time,
    power,
    kW: power / 1000,
    horsepower: power / WATTS_PER_HORSEPOWER,
    kwhPerHour: power / 1000,
    bulbs: power / BULB_WATTS,
    timeSteps: [0.25, 0.5, 1, 2, 4].map((factor) => ({ factor, time: time * factor, power: time > 0 ? work / (time * factor) : 0 })),
  };
}

/** Real reference energies (J) for the log-scale magnitude bar. */
export const ENERGY_REFERENCES: { key: string; energy: number }[] = [
  // 100 g apple lifted 1 m.
  { key: "appleLift", energy: 0.1 * ENERGY_GRAVITY * 1 },
  // 1 food Calorie (kcal).
  { key: "foodCalorie", energy: 4184 },
  // AA alkaline cell ≈ 2.8 Wh.
  { key: "aaBattery", energy: 2.8 * JOULES_PER_WATT_HOUR },
  // 1500 kg car at 100 km/h.
  { key: "carAt100", energy: 0.5 * 1500 * (100 / 3.6) ** 2 },
  // 1 litre of petrol ≈ 34.2 MJ (lower heating value).
  { key: "petrolLitre", energy: 3.42e7 },
  // Typical lightning flash ≈ 1 GJ.
  { key: "lightning", energy: 1e9 },
];

/** Typical power draws (W) for the ranked power list. */
export const POWER_REFERENCES: { key: string; power: number }[] = [
  { key: "ledBulb", power: 10 },
  { key: "incandescentBulb", power: 60 },
  { key: "laptop", power: 65 },
  { key: "humanResting", power: 100 },
  { key: "microwave", power: 1000 },
  { key: "hairDryer", power: 1500 },
  { key: "carEngine", power: 100000 },
];

/** Power references plus the computed power, highest first; `key: "yours"` marks the computed one. */
export function rankPower(power: number): { key: string; power: number }[] {
  return [...POWER_REFERENCES, { key: "yours", power }].sort((a, b) => b.power - a.power);
}
