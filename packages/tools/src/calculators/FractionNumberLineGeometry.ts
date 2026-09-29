import type { SimpleFraction } from "./FractionCalculator";

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

/**
 * Snaps a continuous drag position (e.g. a point's x-coordinate on a number line) to the
 * nearest multiple of 1/denominator, and returns it as a simplified fraction — the constraint
 * a draggable "fraction on a number line" indicator needs so a freely dragged point always
 * lands on a clean fraction instead of an arbitrary decimal.
 */
export function snapToFraction(value: number, denominator: number): SimpleFraction {
  const snappedNumerator = Math.round(value * denominator);
  const divisor = gcd(snappedNumerator, denominator);
  const sign = denominator < 0 ? -1 : 1;
  return { numerator: (sign * snappedNumerator) / divisor, denominator: (sign * denominator) / divisor };
}

/** The decimal value of a fraction — denominator 0 treated as 0 rather than throwing, since a mid-drag snap can transiently pass through it. */
export function fractionToDecimal(f: SimpleFraction): number {
  return f.denominator === 0 ? 0 : f.numerator / f.denominator;
}
