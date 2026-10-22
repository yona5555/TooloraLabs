/** Word positions on a helix: twelve words per turn, rising a little per word, centred on the origin. */
export const PER_TURN = 12;
export function helix(n: number): [number, number, number][] {
  const rise = 0.07;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / PER_TURN) * 2 * Math.PI;
    return [1.9 * Math.sin(a), i * rise - 1.6, 1.9 * Math.cos(a)];
  });
}
