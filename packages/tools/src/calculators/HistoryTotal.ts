/**
 * Grand total of a calculator history list, summed exactly in decimal.
 *
 * Each result is taken as the shortest decimal string that round-trips to
 * that double (what String(x) prints, the same digits the display shows),
 * scaled to a common power of ten as a BigInt and added exactly, then turned
 * back into a single number. So 0.1 + 0.2 totals 0.3, not
 * 0.30000000000000004, and only the final conversion can round.
 * Non-finite results (errors, Infinity, NaN) are skipped and counted.
 */
export type HistoryTotal = {
  /** Exact sum of every finite result, as a number (0 when none). */
  total: number;
  /** How many finite results were added. */
  included: number;
  /** How many results were skipped because they were not finite numbers. */
  skipped: number;
};

type ScaledDecimal = { digits: bigint; scale: number };

function toScaledDecimal(value: number): ScaledDecimal {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/.exec(String(value));
  if (!match) throw new Error(`Unexpected number format: ${value}`);
  const [, sign, intPart, fracPart = "", exp = "0"] = match;
  let scale = fracPart.length - Number(exp);
  let digits = BigInt(`${sign}${intPart}${fracPart}`);
  if (scale < 0) {
    digits *= BigInt(10) ** BigInt(-scale);
    scale = 0;
  }
  return { digits, scale };
}

function scaledToNumber({ digits, scale }: ScaledDecimal): number {
  if (scale === 0) return Number(digits);
  const negative = digits < BigInt(0);
  const abs = (negative ? -digits : digits).toString().padStart(scale + 1, "0");
  return Number(`${negative ? "-" : ""}${abs.slice(0, -scale)}.${abs.slice(-scale)}`);
}

export function sumHistoryResults(results: readonly number[]): HistoryTotal {
  const finite = results.filter((value) => Number.isFinite(value));
  const scaled = finite.map(toScaledDecimal);
  const scale = scaled.reduce((max, s) => Math.max(max, s.scale), 0);
  const digits = scaled.reduce((sum, s) => sum + s.digits * BigInt(10) ** BigInt(scale - s.scale), BigInt(0));
  return { total: scaledToNumber({ digits, scale }) || 0, included: finite.length, skipped: results.length - finite.length };
}
