/**
 * Full analysis of an ideal projectile (uniform gravity, no air resistance), shared by the
 * projectile-motion-calculator's live table, 3D drawing and indicators so every visual agrees
 * with the calculator's own result. Pure math only (no DOM).
 */

export type ProjectileLaunch = {
  /** Launch speed v₀ in m/s. */
  speed: number;
  /** Launch angle θ in degrees above horizontal. */
  angle: number;
  /** Launch height h₀ in m. */
  height: number;
  /** Gravitational acceleration g in m/s². */
  gravity: number;
};

export type ProjectileSample = { t: number; x: number; y: number; vx: number; vy: number; speed: number };

export type ProjectileAnalysis = ProjectileLaunch & {
  vx: number;
  vy: number;
  /** Time to the apex (0 when launched level or downward). */
  timeUp: number;
  /** Time from the apex down to the ground. */
  timeDown: number;
  timeOfFlight: number;
  /** Rise above the launch point, vy² / 2g. */
  rise: number;
  maxHeight: number;
  /** Horizontal distance of the apex from the launch point. */
  apexX: number;
  range: number;
  impactVy: number;
  impactSpeed: number;
  /** Impact angle below horizontal, degrees. */
  impactAngle: number;
  /** Specific (per kg) energies, J/kg. */
  kineticLaunch: number;
  potentialLaunch: number;
  kineticApex: number;
  potentialApex: number;
  kineticImpact: number;
  /** Total specific energy ½v₀² + g·h₀ (conserved), J/kg. */
  energy: number;
  /** Angle giving the longest range from this height and speed, degrees. */
  optimalAngle: number;
  maxRange: number;
  /** range / maxRange in [0, 1]. */
  rangeEfficiency: number;
  /** Range at 90° − θ (equal to range when h₀ = 0). */
  complementaryRange: number;
  /** Length of the curved path, m. */
  arcLength: number;
  /** arcLength / timeOfFlight, m/s. */
  averageSpeed: number;
  /** Speed at the apex (= vx), m/s. */
  minSpeed: number;
};

const RAD = Math.PI / 180;

function isValid(l: ProjectileLaunch): boolean {
  return Number.isFinite(l.speed) && Number.isFinite(l.angle) && Number.isFinite(l.height) && Number.isFinite(l.gravity) && l.gravity > 0 && l.speed >= 0 && l.height >= 0;
}

/** Time of flight, same root the calculator uses: t = [vy + √(vy² + 2g·h₀)] / g. */
export function projectileFlightTime(speed: number, angle: number, height: number, gravity: number): number {
  const vy = speed * Math.sin(angle * RAD);
  return (vy + Math.sqrt(Math.max(0, vy * vy + 2 * gravity * height))) / gravity;
}

/** Horizontal range R = v₀·cosθ · t. */
export function projectileRange(speed: number, angle: number, height: number, gravity: number): number {
  return speed * Math.cos(angle * RAD) * projectileFlightTime(speed, angle, height, gravity);
}

/** Angle for the longest range from height h₀: θ* = atan(v₀ / √(v₀² + 2g·h₀)) (45° from the ground). */
export function optimalLaunchAngle(speed: number, height: number, gravity: number): number {
  if (speed <= 0) return 45;
  return Math.atan(speed / Math.sqrt(speed * speed + 2 * gravity * height)) / RAD;
}

/** Longest reachable range: R_max = (v₀ / g)·√(v₀² + 2g·h₀). */
export function projectileMaxRange(speed: number, height: number, gravity: number): number {
  return (speed / gravity) * Math.sqrt(speed * speed + 2 * gravity * height);
}

/** Position and velocity at time t (clamped to the flight). */
export function projectileStateAt(l: ProjectileLaunch, t: number): ProjectileSample {
  const vx = l.speed * Math.cos(l.angle * RAD);
  const vy0 = l.speed * Math.sin(l.angle * RAD);
  const T = projectileFlightTime(l.speed, l.angle, l.height, l.gravity);
  const tt = Math.max(0, Math.min(T, t));
  const vy = vy0 - l.gravity * tt;
  return { t: tt, x: vx * tt, y: Math.max(0, l.height + vy0 * tt - 0.5 * l.gravity * tt * tt), vx, vy, speed: Math.hypot(vx, vy) };
}

/** `count` + 1 equally spaced instants from launch to impact (strobe samples). */
export function sampleTrajectory(l: ProjectileLaunch, count: number): ProjectileSample[] {
  const T = projectileFlightTime(l.speed, l.angle, l.height, l.gravity);
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n + 1 }, (_, i) => projectileStateAt(l, (T * i) / n));
}

/** Arc length of the path, by Simpson's rule on |v(t)|. */
export function trajectoryArcLength(l: ProjectileLaunch, steps = 400): number {
  const T = projectileFlightTime(l.speed, l.angle, l.height, l.gravity);
  if (T <= 0) return 0;
  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = T / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const w = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    sum += w * projectileStateAt(l, i * h).speed;
  }
  return (sum * h) / 3;
}

export function analyzeProjectile(l: ProjectileLaunch): ProjectileAnalysis | null {
  if (!isValid(l)) return null;
  const { speed, angle, height, gravity: g } = l;
  const vx = speed * Math.cos(angle * RAD);
  const vy = speed * Math.sin(angle * RAD);
  const timeOfFlight = projectileFlightTime(speed, angle, height, g);
  const timeUp = Math.max(0, Math.min(timeOfFlight, vy / g));
  const rise = vy > 0 ? (vy * vy) / (2 * g) : 0;
  const maxHeight = height + rise;
  const range = vx * timeOfFlight;
  const impactVy = vy - g * timeOfFlight;
  const impactSpeed = Math.hypot(vx, impactVy);
  const optimalAngle = optimalLaunchAngle(speed, height, g);
  const maxRange = projectileMaxRange(speed, height, g);
  const arcLength = trajectoryArcLength(l);
  return {
    ...l,
    vx,
    vy,
    timeUp,
    timeDown: timeOfFlight - timeUp,
    timeOfFlight,
    rise,
    maxHeight,
    apexX: vx * timeUp,
    range,
    impactVy,
    impactSpeed,
    impactAngle: Math.atan2(-impactVy, vx) / RAD,
    kineticLaunch: 0.5 * speed * speed,
    potentialLaunch: g * height,
    kineticApex: 0.5 * (vx * vx + (vy > 0 ? 0 : vy * vy)),
    potentialApex: g * maxHeight,
    kineticImpact: 0.5 * impactSpeed * impactSpeed,
    energy: 0.5 * speed * speed + g * height,
    optimalAngle,
    maxRange,
    rangeEfficiency: maxRange > 0 ? range / maxRange : 0,
    complementaryRange: projectileRange(speed, 90 - angle, height, g),
    arcLength,
    averageSpeed: timeOfFlight > 0 ? arcLength / timeOfFlight : 0,
    minSpeed: vy > 0 ? Math.abs(vx) : speed,
  };
}

/** Surface gravity of real worlds (NASA Planetary Fact Sheet; Earth uses the calculator's 9.8 preset). */
export const WORLD_GRAVITY = [
  { key: "pluto", gravity: 0.62 },
  { key: "moon", gravity: 1.62 },
  { key: "mercury", gravity: 3.7 },
  { key: "mars", gravity: 3.71 },
  { key: "venus", gravity: 8.87 },
  { key: "earth", gravity: 9.8 },
  { key: "saturn", gravity: 10.44 },
  { key: "jupiter", gravity: 24.79 },
] as const;

export type WorldRange = { key: string; gravity: number; range: number; timeOfFlight: number; maxHeight: number; current: boolean };

/** The same launch on every world in WORLD_GRAVITY (plus the user's own g when it is not one of them), longest range first. */
export function rangeAcrossWorlds(l: ProjectileLaunch): WorldRange[] {
  const list: { key: string; gravity: number }[] = WORLD_GRAVITY.map((w) => ({ key: w.key, gravity: w.gravity }));
  if (l.gravity > 0 && !list.some((w) => Math.abs(w.gravity - l.gravity) < 1e-9)) list.push({ key: "custom", gravity: l.gravity });
  return list
    .map((w) => ({
      key: w.key,
      gravity: w.gravity,
      range: projectileRange(l.speed, l.angle, l.height, w.gravity),
      timeOfFlight: projectileFlightTime(l.speed, l.angle, l.height, w.gravity),
      maxHeight: l.height + (Math.sin(l.angle * RAD) > 0 ? (l.speed * Math.sin(l.angle * RAD)) ** 2 / (2 * w.gravity) : 0),
      current: Math.abs(w.gravity - l.gravity) < 1e-9,
    }))
    .sort((a, b) => b.range - a.range);
}

export type ProjectileSpeedPoint = { factor: number; speed: number; range: number; change: number };

/** Range at v₀·(1 − pct), v₀ and v₀·(1 + pct); `change` is relative to the current range. */
export function speedSensitivity(l: ProjectileLaunch, pct = 0.1): ProjectileSpeedPoint[] {
  const base = projectileRange(l.speed, l.angle, l.height, l.gravity);
  return [1 - pct, 1, 1 + pct].map((factor) => {
    const range = projectileRange(l.speed * factor, l.angle, l.height, l.gravity);
    return { factor, speed: l.speed * factor, range, change: base > 0 ? range / base - 1 : 0 };
  });
}

/** Range for every launch angle from 0° to 90° in `step` degrees. */
export function rangeAngleCurve(l: ProjectileLaunch, step = 1): { angle: number; range: number }[] {
  const out: { angle: number; range: number }[] = [];
  for (let a = 0; a <= 90 + 1e-9; a += step) out.push({ angle: a, range: projectileRange(l.speed, a, l.height, l.gravity) });
  return out;
}
