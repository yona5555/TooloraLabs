/**
 * Pure helpers for the ideal gas Result scene and its 8 indicator cards: PV = nRT with the
 * calculator's own R, CODATA constants, the ICAO standard atmosphere and IUPAC molar masses.
 * No DOM, no colours.
 */
import { clamp } from "../ph-calculator/phMath";

/** L·atm/(mol·K): the value the calculator uses. */
export const R_LATM = 0.0820574;
/** J/(mol·K) and J/K (CODATA 2018, exact). */
export const R_SI = 8.314462618;
export const K_B = 1.380649e-23;
export const AVOGADRO = 6.02214076e23;
export const ZERO_C = 273.15;

/** The calculator defaults (DEFAULTS in IdealGasLawCalculator): one mole at STP. */
export const SEED = { pressure: 1, volume: 22.414, moles: 1, temperature: 273.15 } as const;

/** Temperature range of the Result scene's thermometer (kelvin). */
export const T_MIN = 50;
export const T_MAX = 600;
export const T_STEP = 5;

/** 0..1 piston height for a volume: log scale 1 L → 2000 L (covers every scenario preset). */
export const pistonFrac = (v: number) => (v > 0 ? clamp(Math.log10(v) / Math.log10(2000), 0.06, 1) : 0.06);

/** Shown gas particles for an amount: log-scaled and capped, never 0 for n > 0. */
export const shownGas = (n: number, cap = 56) => (n > 0 ? clamp(Math.round(14 + 10 * Math.log10(n)), 3, cap) : 0);

/** CSS colour for a temperature (cold blue → hot orange), 0 K → 600 K. */
export function tempCss(tK: number): string {
  const p = Math.round(clamp(tK / T_MAX, 0, 1) * 100);
  return `color-mix(in oklab, var(--chem-hot) ${p}%, var(--chem-cold))`;
}

/** Plain number (273.15 stays 273.15, 22.414 stays 22.414), no float dust; scientific outside 0.001…99 999. */
export function g4(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return sciText(v, 2);
  const d = a >= 1000 ? 1 : a >= 100 ? 2 : a >= 1 ? 3 : 4;
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

// ── Gases (IUPAC standard atomic weights, g/mol) ──────────────────────────────────────
export const GASES: { key: string; formula: string; M: number }[] = [
  { key: "hydrogen", formula: "H₂", M: 2.016 },
  { key: "helium", formula: "He", M: 4.003 },
  { key: "methane", formula: "CH₄", M: 16.043 },
  { key: "nitrogen", formula: "N₂", M: 28.014 },
  { key: "oxygen", formula: "O₂", M: 31.998 },
  { key: "argon", formula: "Ar", M: 39.948 },
  { key: "carbonDioxide", formula: "CO₂", M: 44.009 },
];
export const GAS_SEED_INDEX = 3; // N₂, the main gas in air

/** Mean, most probable and rms speeds (m/s) of a gas of molar mass M (g/mol) at T (K). */
export function speeds(tK: number, M: number) {
  const m = M / 1000;
  return { mp: Math.sqrt((2 * R_SI * tK) / m), avg: Math.sqrt((8 * R_SI * tK) / (Math.PI * m)), rms: Math.sqrt((3 * R_SI * tK) / m) };
}

// ── ICAO standard atmosphere, troposphere (0–11 km) ────────────────────────────────────
export const ALT_MAX_KM = 11;
export function isa(hKm: number) {
  const T = 288.15 - 6.5 * hKm;
  const P = (T / 288.15) ** 5.25588; // atm (sea level 1 atm)
  return { T, P };
}

// ── Real pressures (atm) ───────────────────────────────────────────────────────────────
export const PRESSURES: { key: string; p: number }[] = [
  { key: "outerSpace", p: 1e-10 },
  { key: "everest", p: 0.33 },
  { key: "vacuumCleaner", p: 0.8 },
  { key: "atmosphere", p: 1 },
  { key: "carTire", p: 2.2 },
  { key: "scubaTank", p: 200 },
  { key: "hydraulicPress", p: 1000 },
];
export const PRESSURE_SEED_INDEX = 3;
