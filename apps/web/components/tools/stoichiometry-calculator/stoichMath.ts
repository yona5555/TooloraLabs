/**
 * Pure helpers for the stoichiometry Result scene and its 8 indicator cards. Every value is the
 * calculator's own relation (n = m / M, n₂ = n₁ × b / a) with IUPAC molar masses. No DOM, no colours.
 */
import { clamp, snap } from "../ph-calculator/phMath";
import { atomsOf, balance, molarMassOf } from "../chemical-equation-balancer/chemMath";

export const AVOGADRO = 6.02214076e23;

/** Range of the Result scene's log scale (the known amount, g or mol): 0.01 … 10 000 000. */
export const LOG_MIN = -2;
export const LOG_MAX = 7;
export const LOG_STEP = 0.05;
/** Ticks under the Result scene's horizontal handle (exponents) and their labels. */
export const TICKS = [-2, 2, 7];
export const tickText = (e: number) => (e < 0 ? "0.01" : e === 2 ? "100" : "10 000 000");
export const toLog = (v: number) => (v > 0 ? clamp(Math.log10(v), LOG_MIN, LOG_MAX) : LOG_MIN);
/** A log-scale position back to a tidy amount (3 significant figures). */
export function fromLog(x: number): number {
  const v = 10 ** snap(x, LOG_STEP, LOG_MIN, LOG_MAX);
  return Number(v.toPrecision(3));
}

// Rounded: cos/sin/cbrt can differ in the last bit between server and browser (hydration).
export const rd = (v: number) => Math.round(v * 1e4) / 1e4;

// ── Result scene: the full balanced reaction ─────────────────────────────────────────

const DIATOMIC = new Set(["H", "N", "O", "F", "Cl", "Br", "I"]);
const elementForm = (el: string) => (DIATOMIC.has(el) ? `${el}2` : el);

export type StoTerm = { formula: string; coefficient: number; side: "reactant" | "product"; role: "known" | "co" | "target" | "side" };

/**
 * The balanced reaction behind "known → target": elements of the target missing from the known
 * substance come in as their elemental form (O₂, H₂ …); elements of the known substance missing
 * from the target leave as H₂O (when H and O are both present) or their elemental form. Kept only
 * when the solver balances it with the user's own known : target ratio; otherwise the two given
 * terms alone (same ratio as the calculator).
 */
export function inferReaction(known: string, a: number, target: string, b: number): StoTerm[] {
  const fallback: StoTerm[] = [
    { formula: known, coefficient: a, side: "reactant", role: "known" },
    { formula: target, coefficient: b, side: "product", role: "target" },
  ];
  const K = atomsOf(known);
  const T = atomsOf(target);
  if (!K || !T || !(a > 0) || !(b > 0)) return fallback;
  const co = Object.keys(T).filter((el) => !(el in K)).map(elementForm);
  const left = Object.keys(K).filter((el) => !(el in T));
  const hasO = "O" in K || co.includes("O2");
  const side = left.includes("H") && hasO ? ["H2O", ...left.filter((el) => el !== "H" && el !== "O").map(elementForm)] : left.map(elementForm);
  const terms = (list: string[]) => list.filter((f) => f !== known && f !== target);
  const reactants = [known, ...terms(co)];
  const products = [target, ...terms(side)];
  if (reactants.length + products.length === 2) return fallback;
  const r = balance(`${reactants.join(" + ")} -> ${products.join(" + ")}`);
  if (r.error || r.terms.length !== reactants.length + products.length) return fallback;
  const ka = r.terms[0].coefficient;
  const tb = r.terms[reactants.length].coefficient;
  if (r.terms.some((t) => !(t.coefficient > 0)) || Math.abs(ka * b - tb * a) > 1e-9 * ka * b) return fallback;
  return r.terms.map((t, i) => ({ ...t, role: i === 0 ? "known" : i < reactants.length ? "co" : i === reactants.length ? "target" : "side" }));
}

// ── Card data ─────────────────────────────────────────────────────────────────────────
export const M = {
  H2: molarMassOf("H2"),
  O2: molarMassOf("O2"),
  H2O: molarMassOf("H2O"),
  N2: molarMassOf("N2"),
  NH3: molarMassOf("NH3"),
  NaOH: molarMassOf("NaOH"),
};

/** Acids neutralised by NaOH (Richter's equivalent weights): moles of acid per mole of NaOH. */
export const ACIDS = [
  { formula: "HCl", perBase: 1 },
  { formula: "HNO3", perBase: 1 },
  { formula: "CH3COOH", perBase: 1 },
  { formula: "H2SO4", perBase: 0.5 },
].map((a) => ({ ...a, mm: molarMassOf(a.formula) }));

/** One mole of each: the mass of a mole changes with the substance. */
export const SUBSTANCES = ["H2", "H2O", "N2", "NH3", "O2", "CO2", "NaCl", "C6H12O6", "Fe2O3"].map((formula) => ({ formula, mm: molarMassOf(formula) }));
export const SUBSTANCE_SEED = 1; // H₂O, the calculator's default target
