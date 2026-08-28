import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MolarMassCalculatorInput = {
  formula: string;
};

export type MolarMassCalculatorError = "empty-formula" | "unknown-element" | "unbalanced-parentheses" | "invalid-formula";

export type ElementBreakdownRow = {
  symbol: string;
  count: number;
  atomicMass: number;
  subtotal: number;
};

export type MolarMassCalculatorOutput = {
  error: MolarMassCalculatorError | null;
  errorDetail: string | null;
  totalMass: number;
  breakdown: ElementBreakdownRow[];
};

// Standard atomic weights (IUPAC conventional values); bracketed mass numbers
// (the most stable known isotope) are used for elements with no stable
// isotopes and thus no standard atomic weight.
const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18,
  Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.95, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.63, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 97, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
  Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.5, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
  Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04,
  Pa: 231.04, U: 238.03, Np: 237, Pu: 244, Am: 243, Cm: 247, Bk: 247, Cf: 251, Es: 252, Fm: 257,
  Md: 258, No: 259, Lr: 266, Rf: 267, Db: 268, Sg: 267, Bh: 270, Hs: 271, Mt: 278, Ds: 281,
  Rg: 282, Cn: 285, Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294,
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class FormulaParseError extends Error {
  code: MolarMassCalculatorError;
  constructor(code: MolarMassCalculatorError, message: string) {
    super(message);
    this.code = code;
  }
}

function mergeCounts(target: Record<string, number>, source: Record<string, number>, multiplier: number) {
  for (const [symbol, count] of Object.entries(source)) {
    target[symbol] = (target[symbol] ?? 0) + count * multiplier;
  }
}

/**
 * Recursive-descent parser for chemical formulas: element symbols with
 * optional integer counts, and (...)N / [...]N groups with an optional
 * integer multiplier. Throws FormulaParseError on any malformed input.
 */
function parseGroup(formula: string, startIndex: number, closingChar: string | null): { counts: Record<string, number>; nextIndex: number } {
  const counts: Record<string, number> = {};
  let i = startIndex;

  while (i < formula.length) {
    const char = formula[i];

    if (char === ")" || char === "]") {
      if (char !== closingChar) {
        throw new FormulaParseError("unbalanced-parentheses", `Unexpected "${char}" at position ${i + 1}.`);
      }
      return { counts, nextIndex: i + 1 };
    }

    if (char === "(" || char === "[") {
      const expectedClose = char === "(" ? ")" : "]";
      const inner = parseGroup(formula, i + 1, expectedClose);
      i = inner.nextIndex;
      const { count, nextIndex } = readNumber(formula, i, 1);
      i = nextIndex;
      mergeCounts(counts, inner.counts, count);
      continue;
    }

    if (/[A-Z]/.test(char)) {
      const symbolMatch = formula.slice(i).match(/^[A-Z][a-z]?[a-z]?/);
      const candidate = symbolMatch ? symbolMatch[0] : char;
      let symbol: string | null = null;
      for (let len = candidate.length; len >= 1; len--) {
        const attempt = candidate.slice(0, len);
        if (ATOMIC_WEIGHTS[attempt] !== undefined) {
          symbol = attempt;
          break;
        }
      }
      if (!symbol) {
        throw new FormulaParseError("unknown-element", `"${candidate}" is not a recognized element symbol.`);
      }
      i += symbol.length;
      const { count, nextIndex } = readNumber(formula, i, 1);
      i = nextIndex;
      counts[symbol] = (counts[symbol] ?? 0) + count;
      continue;
    }

    throw new FormulaParseError("invalid-formula", `Unexpected character "${char}" at position ${i + 1}.`);
  }

  if (closingChar !== null) {
    throw new FormulaParseError("unbalanced-parentheses", `Missing closing "${closingChar}".`);
  }

  return { counts, nextIndex: i };
}

function readNumber(formula: string, index: number, fallback: number): { count: number; nextIndex: number } {
  const match = formula.slice(index).match(/^\d+/);
  if (!match) return { count: fallback, nextIndex: index };
  return { count: parseInt(match[0], 10), nextIndex: index + match[0].length };
}

/**
 * Parses a chemical formula (including parenthesized/bracketed groups and
 * hydrate notation) into element -> count. Exported for reuse by other
 * calculators (e.g. ChemicalEquationBalancer) that need raw element counts
 * without duplicating this parser.
 */
export function parseFormula(rawFormula: string): Record<string, number> {
  const formula = rawFormula.replace(/\s+/g, "");
  if (formula.length === 0) {
    throw new FormulaParseError("empty-formula", "Enter a chemical formula.");
  }

  // Hydrate notation (e.g. CuSO4·5H2O): split once on a middle dot, bullet,
  // or plain period, and scale the second segment's counts by its leading
  // integer multiplier before merging with the first segment.
  const hydrateMatch = formula.match(/^(.+?)[·•.](\d*)(.+)$/);
  if (hydrateMatch) {
    const [, first, multiplierRaw, second] = hydrateMatch;
    const multiplier = multiplierRaw ? parseInt(multiplierRaw, 10) : 1;
    const firstCounts = parseGroup(first, 0, null).counts;
    const secondCounts = parseGroup(second, 0, null).counts;
    const combined: Record<string, number> = {};
    mergeCounts(combined, firstCounts, 1);
    mergeCounts(combined, secondCounts, multiplier);
    return combined;
  }

  return parseGroup(formula, 0, null).counts;
}

export type MolarMassLookup =
  | { error: null; totalMass: number; breakdown: ElementBreakdownRow[] }
  | { error: MolarMassCalculatorError; errorDetail: string };

/**
 * Parses a chemical formula and returns its molar mass and per-element
 * breakdown, or a typed error. Shared with other calculators (e.g.
 * StoichiometryCalculator) that need molar mass without duplicating the
 * formula parser or atomic-weight table.
 */
export function computeMolarMass(rawFormula: string): MolarMassLookup {
  try {
    const counts = parseFormula(rawFormula);
    const symbols = Object.keys(counts);
    if (symbols.length === 0) {
      return { error: "empty-formula", errorDetail: "Enter a chemical formula." };
    }

    const breakdown: ElementBreakdownRow[] = symbols.map((symbol) => {
      const atomicMass = ATOMIC_WEIGHTS[symbol];
      const count = counts[symbol];
      return { symbol, count, atomicMass: clean(atomicMass), subtotal: clean(atomicMass * count) };
    });

    const totalMass = breakdown.reduce((sum, row) => sum + row.subtotal, 0);
    return { error: null, totalMass: clean(totalMass), breakdown };
  } catch (err) {
    if (err instanceof FormulaParseError) {
      return { error: err.code, errorDetail: err.message };
    }
    return { error: "invalid-formula", errorDetail: "Could not parse this formula." };
  }
}

export class MolarMassCalculator extends BaseCalculator<MolarMassCalculatorInput, MolarMassCalculatorOutput> {
  metadata = {
    id: "molar-mass-calculator",
    slug: "molar-mass-calculator",
    name: "Molar Mass Calculator",
    category: "math-science",
    description: "Calculate the molar mass of a chemical compound from its formula, with a per-element breakdown.",
    version: "1.0.0",
  };

  execute(input: MolarMassCalculatorInput, _context: ToolContext): ToolResult<MolarMassCalculatorOutput> {
    const result = computeMolarMass(input.formula);
    if (result.error) {
      return {
        success: true,
        data: { error: result.error, errorDetail: result.errorDetail, totalMass: 0, breakdown: [] },
        metadata: {},
      };
    }
    return {
      success: true,
      data: { error: null, errorDetail: null, totalMass: result.totalMass, breakdown: result.breakdown },
      metadata: {},
    };
  }
}
