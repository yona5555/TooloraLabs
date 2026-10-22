/** SVG path of a ring segment between radii r0 < r1, angles in turns (0 = 12 o'clock, clockwise). */
export function ringPath(cx: number, cy: number, r0: number, r1: number, t0: number, t1: number): string {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const large = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
}

/** Cumulative [start, end] turns for a list of non-negative values. */
export function turns(values: number[]): [number, number][] {
  const total = values.reduce((s, v) => s + v, 0) || 1;
  let acc = 0;
  return values.map((v) => {
    const start = acc / total;
    acc += v;
    return [start, acc / total];
  });
}

/** Shortens a label to n characters with an ellipsis. */
export function clip(text: string, n: number): string {
  return [...text].length > n ? [...text].slice(0, n - 1).join("") + "…" : text;
}
