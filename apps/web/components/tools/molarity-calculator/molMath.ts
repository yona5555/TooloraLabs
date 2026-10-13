/**
 * Pure helpers for the molarity Result scene and its 8 indicator cards. Every value is the
 * calculator's own relation (M = n / V, C₁V₁ = C₂V₂) or a published constant. No DOM, no colours.
 */
import { clamp } from "@/components/tool-ui/indicator-kit/format";

export const AVOGADRO = 6.02214076e23;

/** The calculator defaults (DEFAULTS in MolarityCalculator): every card is seeded from them once. */
export const SEED = { moles: 0.5, volume: 2, molarity: 0.25, c1: 2, v1: 0.5, c2: 1, v2: 1, molarMassNaCl: 58.44 } as const;

/** Volume range of the Result scene's scale (litres). */
export const V_MIN = 0.05;
export const V_MAX = 5;
export const V_STEP = 0.05;

/** 0..1 depth of a solution's tint: log scale from 1 mM (pale) to 10 M (deep). */
export const tintOf = (molarity: number) => (molarity > 0 ? clamp((Math.log10(molarity) + 3) / 4, 0, 1) : 0);

/** CSS colour of a solution at a molarity: solvent mixed with the solute tint. */
export function liquidCss(molarity: number): string {
  const p = Math.round(12 + tintOf(molarity) * 78);
  return `color-mix(in oklab, var(--chem-tint) ${p}%, var(--chem-solvent))`;
}

/** Shown particle count for an amount of solute: log-scaled and capped, never 0 for n > 0. */
export function shownParticles(moles: number, cap = 48): number {
  if (!(moles > 0)) return 0;
  return clamp(Math.round(10 + 9 * Math.log10(moles * 10)), 1, cap);
}

/** Numbers without float dust: 3 significant figures, plain below 10 000, else scientific. */
export function g3(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-3) return sciText(v, 2);
  const d = a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : a >= 0.1 ? 3 : 4;
  return String(Number(v.toFixed(d)));
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export function sciText(v: number, digits = 2): string {
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  if (Number(m.toFixed(digits)) >= 10) {
    m /= 10;
    e += 1;
  }
  return `${m.toFixed(digits)} × 10${String(e).split("").map((c) => SUP[c] ?? c).join("")}`;
}

// ── Reference solutions (typical published concentrations) ───────────────────────────
export const REFERENCE: { key: string; molarity: number; formula: string }[] = [
  { key: "bloodGlucose", molarity: 0.0055, formula: "C₆H₁₂O₆" },
  { key: "stomachAcid", molarity: 0.1, formula: "HCl" },
  { key: "saline", molarity: 0.154, formula: "NaCl" },
  { key: "seawater", molarity: 0.6, formula: "NaCl" },
  { key: "vinegar", molarity: 0.83, formula: "CH₃COOH" },
  { key: "labNaOH", molarity: 6, formula: "NaOH" },
  { key: "sulfuric", molarity: 18.4, formula: "H₂SO₄" },
];
export function referenceSeedIndex(m = SEED.molarity): number {
  let best = 0;
  REFERENCE.forEach((r, i) => {
    if (Math.abs(Math.log10(r.molarity / m)) < Math.abs(Math.log10(REFERENCE[best].molarity / m))) best = i;
  });
  return best;
}

// ── Common solutes (IUPAC standard atomic weights) ─────────────────────────────────────
export const SOLUTES: { key: string; formula: string; molarMass: number }[] = [
  { key: "naoh", formula: "NaOH", molarMass: 40.0 },
  { key: "nacl", formula: "NaCl", molarMass: 58.44 },
  { key: "kmno4", formula: "KMnO₄", molarMass: 158.03 },
  { key: "glucose", formula: "C₆H₁₂O₆", molarMass: 180.16 },
  { key: "cuso4", formula: "CuSO₄·5H₂O", molarMass: 249.69 },
  { key: "sucrose", formula: "C₁₂H₂₂O₁₁", molarMass: 342.3 },
];
export const SOLUTE_SEED_INDEX = 1; // NaCl, the calculator's default molar mass

// ── Serial dilution: 1 mL into 9 mL of water per step ──────────────────────────────────
export const SERIAL_MAX = 6;
