/** Pure data + math for the sidebar unit-circle panels -- no React here. */
export type CommonAngle = {
  deg: number;
  radLabel: string;
  sinExact: string;
  cosExact: string;
  tanExact: string;
};

export const COMMON_ANGLES: CommonAngle[] = [
  { deg: 0, radLabel: "0", sinExact: "0", cosExact: "1", tanExact: "0" },
  { deg: 30, radLabel: "π/6", sinExact: "1/2", cosExact: "√3/2", tanExact: "√3/3" },
  { deg: 45, radLabel: "π/4", sinExact: "√2/2", cosExact: "√2/2", tanExact: "1" },
  { deg: 60, radLabel: "π/3", sinExact: "√3/2", cosExact: "1/2", tanExact: "√3" },
  { deg: 90, radLabel: "π/2", sinExact: "1", cosExact: "0", tanExact: "∞" },
  { deg: 120, radLabel: "2π/3", sinExact: "√3/2", cosExact: "−1/2", tanExact: "−√3" },
  { deg: 135, radLabel: "3π/4", sinExact: "√2/2", cosExact: "−√2/2", tanExact: "−1" },
  { deg: 150, radLabel: "5π/6", sinExact: "1/2", cosExact: "−√3/2", tanExact: "−√3/3" },
  { deg: 180, radLabel: "π", sinExact: "0", cosExact: "−1", tanExact: "0" },
  { deg: 270, radLabel: "3π/2", sinExact: "−1", cosExact: "0", tanExact: "∞" },
  { deg: 360, radLabel: "2π", sinExact: "0", cosExact: "1", tanExact: "0" },
];

export function nearestCommonAngle(theta: number): number {
  const t = ((theta % 360) + 360) % 360;
  let best = COMMON_ANGLES[0].deg;
  let bestDist = Infinity;
  for (const a of COMMON_ANGLES) {
    const dist = Math.min(Math.abs(a.deg - t), 360 - Math.abs(a.deg - t));
    if (dist < bestDist) {
      bestDist = dist;
      best = a.deg;
    }
  }
  return best;
}

/** tan is undefined at 90/270 -- returns null there (callers render the infinity glyph), never
 * NaN or an astronomically large float from floating-point near-misses at those exact angles. */
export function safeTan(theta: number): number | null {
  const t = ((theta % 360) + 360) % 360;
  if (Math.abs(t - 90) < 0.0005 || Math.abs(t - 270) < 0.0005) return null;
  const rad = (theta * Math.PI) / 180;
  const value = Math.tan(rad);
  return Number.isFinite(value) ? value : null;
}

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
