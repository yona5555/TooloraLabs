/**
 * Pure helpers for the molar mass Result scene and its 8 indicator cards. Every number comes from
 * the calculator's own parser and IUPAC atomic weights (computeMolarMass); isotope masses and
 * abundances are NIST values. No DOM, no colours.
 */
import { computeMolarMass } from "@tooloralabs/tools";
import { clamp } from "@/components/tool-ui/indicator-kit/format";

export const AVOGADRO = 6.02214076e23;

export type Part = { symbol: string; count: number; atomicMass: number; subtotal: number; pct: number };
/** Element rows of a formula (count, atomic weight, subtotal, mass %), or null when it does not parse. */
export function partsOf(formula: string): { total: number; parts: Part[] } | null {
  const r = computeMolarMass(formula);
  if (r.error || !(r.totalMass > 0)) return null;
  return { total: r.totalMass, parts: r.breakdown.map((b) => ({ ...b, pct: (100 * b.subtotal) / r.totalMass })) };
}
export const massOf = (formula: string) => partsOf(formula)?.total ?? 0;

/** Total atoms in a formula (for the ball-and-stick cap). */
export const atomTotal = (formula: string) => (partsOf(formula)?.parts ?? []).reduce((a, p) => a + p.count, 0);

// ── Result scene: the calculator's presets on a rail, ordered by molar mass ───────────
export const RAIL = ["H2O", "NaCl", "H2SO4", "C6H12O6", "C9H8O4", "C8H10N4O2"].map((formula) => ({ formula, mm: massOf(formula) }));
export const RAIL_SEED = 3; // C₆H₁₂O₆, the calculator's default
/** Rail position of any molar mass (between the two presets it falls between). */
export function railPos(mm: number, formula: string): number {
  const exact = RAIL.findIndex((r) => r.formula === formula);
  if (exact >= 0) return exact;
  if (mm <= RAIL[0].mm) return 0;
  for (let i = 1; i < RAIL.length; i++) if (mm <= RAIL[i].mm) return i - 1 + (mm - RAIL[i - 1].mm) / (RAIL[i].mm - RAIL[i - 1].mm || 1);
  return RAIL.length - 1;
}

// ── 1. Moles of water in a beaker ─────────────────────────────────────────────────────
/** Density of liquid water at 25 °C (g/mL). */
export const WATER_DENSITY = 0.997;
export const WATER_M = massOf("H2O");
/** Beaker capacity (mL): holds the card's 10 mol maximum (≈ 181 mL). */
export const BEAKER_ML = 200;

// ── 2. Chlorine isotopes (NIST): atomic weight = abundance-weighted mean ──────────────
export const CL35 = 34.96885268;
export const CL37 = 36.96590259;
export const CL35_NATURAL = 75.76;
export const clWeight = (pct35: number) => (pct35 / 100) * CL35 + (1 - pct35 / 100) * CL37;

// ── 3. Copper(II) sulfate hydrates ────────────────────────────────────────────────────
export const CUSO4_M = massOf("CuSO4");
export const hydrateFormula = (n: number) => (n > 0 ? `CuSO4·${n}H2O` : "CuSO4");
export const HYDRATE_MAX = 5;

// ── 4 & 5. Familiar compounds (the calculator's presets and default) ──────────────────
export const COMPOUNDS = [
  { key: "glucose", formula: "C6H12O6" },
  { key: "water", formula: "H2O" },
  { key: "tableSalt", formula: "NaCl" },
  { key: "aspirin", formula: "C9H8O4" },
  { key: "caffeine", formula: "C8H10N4O2" },
  { key: "sulfuricAcid", formula: "H2SO4" },
].map((c) => ({ ...c, mm: massOf(c.formula) }));

// ── 6. Particles on a log scale ───────────────────────────────────────────────────────
export const LOG_N_MIN = 20;
export const LOG_N_MAX = 26;
export const LOG_N_SEED = Math.log10(AVOGADRO);

// ── 7. Parenthesised groups ───────────────────────────────────────────────────────────
export const GROUPS = [
  { formula: "Ca(OH)2", outside: "Ca", group: "OH", mult: 2 },
  { formula: "Mg(NO3)2", outside: "Mg", group: "NO3", mult: 2 },
  { formula: "Al2(SO4)3", outside: "Al2", group: "SO4", mult: 3 },
  { formula: "Ca3(PO4)2", outside: "Ca3", group: "PO4", mult: 2 },
  { formula: "(NH4)3PO4", outside: "PO4", group: "NH4", mult: 3 },
];

// ── 8. The parser, one token at a time ────────────────────────────────────────────────
export const PARSE_FORMULA = "Al2(SO4)3";
export type ParseStep = { token: string; start: number; end: number; counts: Record<string, number>; note: "element" | "open" | "close" };
/** Every token the calculator's parser reads in PARSE_FORMULA, with the running atom counts after it. */
export function parseSteps(formula = PARSE_FORMULA): ParseStep[] {
  const out: ParseStep[] = [];
  const stack: Record<string, number>[] = [{}];
  let i = 0;
  const snapshot = () => {
    const all: Record<string, number> = {};
    for (const level of stack) for (const [el, n] of Object.entries(level)) all[el] = (all[el] ?? 0) + n;
    return all;
  };
  while (i < formula.length) {
    const ch = formula[i];
    if (ch === "(") {
      stack.push({});
      out.push({ token: "(", start: i, end: i + 1, counts: snapshot(), note: "open" });
      i++;
    } else if (ch === ")") {
      const m = /^\d+/.exec(formula.slice(i + 1));
      const k = m ? Number(m[0]) : 1;
      const inner = stack.pop() ?? {};
      const top = stack[stack.length - 1];
      for (const [el, n] of Object.entries(inner)) top[el] = (top[el] ?? 0) + n * k;
      const end = i + 1 + (m ? m[0].length : 0);
      out.push({ token: formula.slice(i, end), start: i, end, counts: snapshot(), note: "close" });
      i = end;
    } else {
      const m = /^([A-Z][a-z]?)(\d*)/.exec(formula.slice(i));
      if (!m) break;
      const top = stack[stack.length - 1];
      top[m[1]] = (top[m[1]] ?? 0) + (m[2] ? Number(m[2]) : 1);
      out.push({ token: m[0], start: i, end: i + m[0].length, counts: snapshot(), note: "element" });
      i += m[0].length;
    }
  }
  return out;
}
/** Running molar mass of partial counts, with the calculator's atomic weights. */
export function countsMass(counts: Record<string, number>): number {
  const f = Object.entries(counts)
    .map(([el, n]) => `${el}${n}`)
    .join("");
  return f ? massOf(f) : 0;
}

export const clampIndex = (v: number, n: number) => clamp(Math.round(v), 0, n - 1);
