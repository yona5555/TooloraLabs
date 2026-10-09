/** Pure math for the sidebar unit-circle card -- no React here. */

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
