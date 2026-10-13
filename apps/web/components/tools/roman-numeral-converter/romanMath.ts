/**
 * Pure Roman-numeral helpers for the Result board and the indicator cards: the same standard
 * form the converter writes (1–3999, subtractive pairs IV IX XL XC CD CM only). No DOM.
 */
export const ROMAN_MIN = 1;
export const ROMAN_MAX = 3999;
/** The calculator's own default (1994 = MCMXCIV); the board's reset returns to it. */
export const ROMAN_SEED = 1994;

export const SYMBOL_VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
export const SYMBOLS = ["I", "V", "X", "L", "C", "D", "M"] as const;

const TABLE: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function toRoman(n: number): string {
  let v = Math.round(n);
  let out = "";
  for (const [k, s] of TABLE) while (v >= k) {
    out += s;
    v -= k;
  }
  return out;
}

/** Each symbol of a numeral with its signed contribution (− when a larger symbol follows). */
export function terms(numeral: string): { sym: string; value: number }[] {
  return [...numeral].map((c, i) => {
    const v = SYMBOL_VALUE[c];
    const next = SYMBOL_VALUE[numeral[i + 1]] ?? 0;
    return { sym: c, value: next > v ? -v : v };
  });
}

/** Place chunks (thousands → units): digit, its numeral piece and its value. */
export function places(n: number) {
  const ones = ["I", "X", "C", "M"];
  const fives = ["V", "L", "D", ""];
  const tens = ["X", "C", "M", ""];
  return [3, 2, 1, 0].map((p) => {
    const d = Math.floor(n / 10 ** p) % 10;
    const o = ones[p];
    const f = fives[p];
    const piece = d === 9 ? o + tens[p] : d >= 5 ? f + o.repeat(d - 5) : d === 4 ? o + f : o.repeat(d);
    return { p, d, piece, value: d * 10 ** p };
  });
}

/** Purely additive spelling (no subtractive pairs): 4 → IIII, 1994 → MDCCCCLXXXXIIII. */
export function additive(n: number): string {
  let v = Math.round(n);
  let out = "";
  for (const s of ["M", "D", "C", "L", "X", "V", "I"]) {
    const k = SYMBOL_VALUE[s];
    while (v >= k) {
      out += s;
      v -= k;
    }
  }
  return out;
}

/** Numeral length for every n in [1, 3999] (index n). */
export const LENGTHS: number[] = Array.from({ length: ROMAN_MAX + 1 }, (_, n) => (n === 0 ? 0 : toRoman(n).length));
