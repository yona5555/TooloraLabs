/**
 * Pure helpers shared by the equation balancer and the stoichiometry calculator: formula markup,
 * atom counts, ball-and-stick layouts and element colours (token names only, no DOM, no hex).
 */
import { ChemicalEquationBalancer, computeMolarMass, parseFormula, type BalancedTerm } from "@tooloralabs/tools";
import { clamp } from "@/components/tool-ui/indicator-kit/format";

/** "Fe2O3" → "Fe₂O₃" (digits after a symbol or ")" become subscripts; RichText renders them as <sub>). */
const SUBS = "₀₁₂₃₄₅₆₇₈₉";
export const uniFormula = (f: string) => f.replace(/([A-Za-z)\]])(\d+)/g, (_, a: string, d: string) => a + d.replace(/\d/g, (c) => SUBS[Number(c)]));

/** "Fe2O3" → "Fe_{2}O_{3}" for Label3D (its own subscript syntax). */
export const labelFormula = (f: string) => f.replace(/([A-Za-z])(\d+)/g, "$1_{$2}");

/** Atom counts of a formula, or null when it does not parse. */
export function atomsOf(formula: string): Record<string, number> | null {
  try {
    return parseFormula(formula);
  } catch {
    return null;
  }
}

/** Molar mass in g/mol, or 0 when the formula does not parse. */
export function molarMassOf(formula: string): number {
  const r = computeMolarMass(formula);
  return r.error ? 0 : r.totalMass;
}

/** CSS token of an element's ball colour (CPK convention, glass-tokens.css). */
const EL_TOKEN: Record<string, string> = { H: "--chem-el-h", C: "--chem-el-c", O: "--chem-el-o", N: "--chem-el-n", S: "--chem-el-s", Cl: "--chem-el-cl", Fe: "--chem-el-fe", Na: "--chem-el-na", Mg: "--chem-el-mg" };
export const elToken = (el: string) => EL_TOKEN[el] ?? "--chem-el-other";
export const EL_TOKENS = [...Object.values(EL_TOKEN), "--chem-el-other"];
/** Relative ball radius (H small, heavier atoms larger). */
export const elRadius = (el: string) => (el === "H" ? 0.62 : el === "Fe" || el === "Na" || el === "Cl" || el === "S" || el === "Mg" ? 1.08 : 0.9);

/** Equation as balanced text with real subscripts: "4Fe + 3O₂ → 2Fe₂O₃". */
export function balancedText(terms: BalancedTerm[]): string {
  const side = (s: "reactant" | "product") =>
    terms
      .filter((t) => t.side === s)
      .map((t) => `${t.coefficient > 1 ? t.coefficient : ""}${uniFormula(t.formula)}`)
      .join(" + ");
  return `${side("reactant")} → ${side("product")}`;
}

/** Per element: atoms on each side (coefficient × count), sorted by symbol. */
export function atomLedger(terms: { formula: string; coefficient: number; side: "reactant" | "product" }[]) {
  const tot: Record<string, { l: number; r: number }> = {};
  for (const t of terms) {
    const a = atomsOf(t.formula);
    if (!a) continue;
    for (const [el, n] of Object.entries(a)) {
      tot[el] ??= { l: 0, r: 0 };
      if (t.side === "reactant") tot[el].l += n * t.coefficient;
      else tot[el].r += n * t.coefficient;
    }
  }
  return Object.entries(tot)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([el, { l, r }]) => ({ el, l, r }));
}

/** Balances an equation with the calculator's own solver (cards reuse it for their presets). */
const solver = new ChemicalEquationBalancer();
export const balance = (equation: string) => solver.execute({ equation }, { locale: "en-US" }).data;

/**
 * Ball-and-stick layout of one molecule (unit size): atoms sorted heavy-first, the first at the
 * centre, the rest on a Fibonacci shell; big molecules (glucose) grow a second shell.
 */
export type Atom = { el: string; p: [number, number, number] };
export function moleculeLayout(formula: string, cap = 26): Atom[] {
  const a = atomsOf(formula);
  if (!a) return [];
  const list: string[] = [];
  const order = Object.keys(a).sort((x, y) => (x === "H" ? 1 : 0) - (y === "H" ? 1 : 0) || elRadius(y) - elRadius(x));
  for (const el of order) for (let i = 0; i < a[el]; i++) list.push(el);
  const atoms = list.slice(0, cap);
  const n = atoms.length;
  if (n === 1) return [{ el: atoms[0], p: [0, 0, 0] }];
  if (n === 2) return atoms.map((el, i) => ({ el, p: [i === 0 ? -0.32 : 0.32, 0, 0] }));
  const inner = Math.min(n - 1, 8);
  const out: Atom[] = [{ el: atoms[0], p: [0, 0, 0] }];
  const shell = (from: number, count: number, r: number, twist: number) => {
    for (let i = 0; i < count; i++) {
      const y = count === 1 ? 0 : 1 - (2 * (i + 0.5)) / count;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.39996 + twist;
      // Rounded: cos/sin can differ in the last bit between server and browser (hydration).
      out.push({ el: atoms[from + i], p: [Math.round(Math.cos(th) * rad * r * 1e4) / 1e4, Math.round(y * r * 0.85 * 1e4) / 1e4, Math.round(Math.sin(th) * rad * r * 1e4) / 1e4] });
    }
  };
  // Two neighbours: a bent shape (water-like), drawn flat so it reads from the front.
  if (n === 3) {
    out.push({ el: atoms[1], p: [-0.36, -0.26, 0] }, { el: atoms[2], p: [0.36, -0.26, 0] });
    return out;
  }
  shell(1, inner, 0.42, 0.3);
  if (n - 1 > inner) shell(1 + inner, n - 1 - inner, 0.78, 1.1);
  return out;
}

/** Shown molecule count for a coefficient × batches, capped so the scene stays light. */
export const shownMolecules = (n: number, cap = 24) => clamp(Math.round(n), 0, cap);

/** Six reactions the Result card's handle steps through (the calculator default + its presets). */
export const REACTIONS: { key: string; equation: string }[] = [
  { key: "ironRusting", equation: "Fe + O2 -> Fe2O3" },
  { key: "methaneCombustion", equation: "CH4 + O2 -> CO2 + H2O" },
  { key: "ammoniaSynthesis", equation: "N2 + H2 -> NH3" },
  { key: "photosynthesis", equation: "CO2 + H2O -> C6H12O6 + O2" },
  { key: "neutralization", equation: "NaOH + H2SO4 -> Na2SO4 + H2O" },
  { key: "glucoseCombustion", equation: "C6H12O6 + O2 -> CO2 + H2O" },
];
const norm = (s: string) => s.replace(/\s+/g, "").replace(/-->|→|=/g, "->");
export const reactionIndex = (equation: string) => REACTIONS.findIndex((r) => norm(r.equation) === norm(equation));

/** 2H₂ + O₂ → 2H₂O, the smallest whole-number set (the coefficient-columns card multiplies it). */
export const COLUMN_TERMS = [
  { formula: "H2", base: 2, side: "reactant" as const },
  { formula: "O2", base: 1, side: "reactant" as const },
  { formula: "H2O", base: 2, side: "product" as const },
];
