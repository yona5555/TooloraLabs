/**
 * Formats a raw calculator result for display: rounds away floating-point
 * noise (e.g. 0.1+0.2 -> 0.30000000000000004) to 10 significant digits and
 * strips trailing zeros, falling back to exponential notation for values
 * too large or small to show plainly. Chaining after "=" still continues
 * from the exact, unrounded value (kept separately in state.expression), so
 * repeated operations never accumulate this display-only rounding.
 */
export function formatCalculatorNumber(value: number): string {
  if (!Number.isFinite(value)) return Number.isNaN(value) ? "NaN" : value > 0 ? "∞" : "-∞";
  if (value === 0) return "0";
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);

  const rounded = Number(value.toPrecision(10));
  if (Math.abs(rounded) >= 1e15 || Math.abs(rounded) < 1e-9) {
    return value.toExponential(6);
  }
  return String(rounded);
}
