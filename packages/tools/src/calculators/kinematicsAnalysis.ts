/**
 * Pure analysis behind the Kinematics calculator's live table, 3D drawing and indicators.
 * It only reads the calculator's own solved v₀, v, a, t and Δx, so every visual agrees with
 * the result. Constant acceleration throughout. No DOM, no I/O.
 */

/** Standard gravity g₀ (m/s², exact by definition, CGPM 1901). */
export const KINEMATICS_G0 = 9.80665;
/** 100 km/h in m/s. */
export const KMH_100 = 100 / 3.6;

/** Real reference speeds (m/s), matching the calculator's "Common Speeds" table. */
export const KINEMATICS_REFERENCE_SPEEDS: { key: string; speed: number }[] = [
  { key: "walking", speed: 1.4 },
  { key: "usainBolt", speed: 12.4 },
  { key: "highwayCar", speed: 27.8 },
  { key: "commercialJet", speed: 250 },
  { key: "speedOfSound", speed: 343 },
];

export type KinematicsState = { t: number; v: number; x: number };

/** Position and velocity at time t from x = 0: v = v₀ + at, x = v₀t + ½at². */
export function kinematicsStateAt(v0: number, a: number, t: number): KinematicsState {
  return { t, v: v0 + a * t, x: v0 * t + 0.5 * a * t * t };
}

export type KinematicsSolved = { v0: number; v: number; a: number; t: number; dx: number; tAvailable: boolean };

export type EquationCheck = {
  key: "velocity" | "displacementTime" | "velocitySquared" | "displacementAvg";
  lhs: number;
  rhs: number;
  holds: boolean;
};

export type KinematicsAnalysis = KinematicsSolved & {
  /** Time span the visuals run over: t, or Δx / v₀ for uniform motion when t is undefined; 0 when there is no forward interval. */
  span: number;
  /** Equally spaced states from 0 to span (inclusive). */
  steps: KinematicsState[];
  dv: number;
  /** ½(v₀ + v). */
  averageVelocity: number;
  /** a / g₀. */
  gForce: number;
  v0Kmh: number;
  vKmh: number;
  /** Displacement carried by the initial velocity alone, v₀t (the rectangle under v–t). */
  dxFromV0: number;
  /** Extra displacement from the acceleration, ½at² (the triangle under v–t). */
  dxFromA: number;
  /** Instant the velocity crosses zero inside (0, span), with the position there; null when it never reverses. */
  turning: KinematicsState | null;
  /** Total path length (≥ |Δx|; larger when the motion reverses). */
  pathLength: number;
  /** Time to reach 100 km/h from rest at |a| (s); Infinity when a = 0. */
  timeTo100kmh: number;
  /** Stopping distance from the larger of |v₀|, |v| at |a| (m); Infinity when a = 0. */
  stoppingDistance: number;
  /** The four standard equations evaluated with the solved values. */
  checks: EquationCheck[];
  /** Same v₀ and a at half, the same and double the time. */
  timeSensitivity: { factor: number; t: number; v: number; x: number }[];
  /** Displacement covered in each equal interval of the span (Galileo's odd-number rule from rest). */
  intervalDx: number[];
};

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));

export function equationChecks(s: KinematicsSolved): EquationCheck[] {
  const { v0, v, a, t, dx, tAvailable } = s;
  const out: EquationCheck[] = [{ key: "velocitySquared", lhs: v * v, rhs: v0 * v0 + 2 * a * dx, holds: false }];
  if (tAvailable) {
    out.unshift(
      { key: "velocity", lhs: v, rhs: v0 + a * t, holds: false },
      { key: "displacementTime", lhs: dx, rhs: v0 * t + 0.5 * a * t * t, holds: false },
    );
    out.push({ key: "displacementAvg", lhs: dx, rhs: 0.5 * (v0 + v) * t, holds: false });
  }
  return out.map((c) => ({ ...c, holds: close(c.lhs, c.rhs) }));
}

export function analyzeKinematics(s: KinematicsSolved, intervals = 8): KinematicsAnalysis {
  const { v0, v, a, t, dx, tAvailable } = s;
  let span = 0;
  if (tAvailable) span = t > 0 && Number.isFinite(t) ? t : 0;
  else if (v0 !== 0 && dx / v0 > 0) span = dx / v0;

  const n = Math.max(1, Math.round(intervals));
  const steps = Array.from({ length: n + 1 }, (_, i) => kinematicsStateAt(v0, a, (span * i) / n));

  const tz = a !== 0 ? -v0 / a : NaN;
  const turning = Number.isFinite(tz) && tz > 0 && tz < span ? kinematicsStateAt(v0, a, tz) : null;
  const end = kinematicsStateAt(v0, a, span);
  const pathLength = turning ? Math.abs(turning.x) + Math.abs(end.x - turning.x) : Math.abs(end.x);

  const peak = Math.max(Math.abs(v0), Math.abs(v));
  const absA = Math.abs(a);

  return {
    ...s,
    span,
    steps,
    dv: v - v0,
    averageVelocity: 0.5 * (v0 + v),
    gForce: a / KINEMATICS_G0,
    v0Kmh: v0 * 3.6,
    vKmh: v * 3.6,
    dxFromV0: v0 * span,
    dxFromA: 0.5 * a * span * span,
    turning,
    pathLength,
    timeTo100kmh: absA > 0 ? KMH_100 / absA : Infinity,
    stoppingDistance: absA > 0 ? (peak * peak) / (2 * absA) : Infinity,
    checks: equationChecks(s),
    timeSensitivity: [0.5, 1, 2].map((factor) => {
      const st = kinematicsStateAt(v0, a, span * factor);
      return { factor, t: st.t, v: st.v, x: st.x };
    }),
    intervalDx: steps.slice(1).map((st, i) => st.x - steps[i].x),
  };
}

/** |a| classified on the calculator's own zones: below g, up to 20 m/s², beyond. */
export function accelerationZone(a: number, g = 9.8): "gentle" | "strong" | "extreme" {
  const m = Math.abs(a);
  return m < g ? "gentle" : m < 20 ? "strong" : "extreme";
}
