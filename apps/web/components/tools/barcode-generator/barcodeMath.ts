import {
  BarcodeGenerator,
  CODE128_BARS,
  CODE128_MODULO,
  CODE128_START_B,
  EAN_FIRST_DIGIT_PARITY,
  EAN_G_CODE,
  EAN_L_CODE,
  EAN_R_CODE,
  type BarcodeOutput,
  type BarcodeSegment,
  type BarcodeSymbology,
} from "@tooloralabs/tools";

/**
 * Pure helpers for the barcode page's Result scene and indicator cards. Everything is re-derived
 * from the real encoder (`BarcodeGenerator`) or the real ISO/IEC 15420 / 15417 tables it uses —
 * never a hand-picked pattern.
 */
export const SYMBOLOGIES: BarcodeSymbology[] = ["upc-a", "ean-13", "code128"];

/** The tool's own default (sample) values, one per symbology. */
export const SAMPLE_VALUES: Record<BarcodeSymbology, string> = {
  "upc-a": "03600029145",
  "ean-13": "590123412345",
  code128: "TOOLORA-2026",
};

/** GS1 General Specifications: nominal X-dimension (one module) for EAN/UPC at 100 % magnification, in mm. */
export const GS1_X_MM = 0.33;

const encoder = new BarcodeGenerator();
export function encode(symbology: BarcodeSymbology, value: string): BarcodeOutput | null {
  const out = encoder.execute({ symbology, value }, { locale: "en-US" });
  return out.success ? out.data : null;
}

export type Module = { index: number; dark: boolean; tall: boolean; runStart: number; runWidth: number };

/** One entry per module (bar or space unit), quiet zones excluded. */
export function modulesOf(segments: BarcodeSegment[]): Module[] {
  const out: Module[] = [];
  let i = 0;
  for (const seg of segments) {
    for (let k = 0; k < seg.width; k++) out.push({ index: i + k, dark: seg.filled, tall: !!seg.tall, runStart: i, runWidth: seg.width });
    i += seg.width;
  }
  return out;
}

export const totalModules = (segments: BarcodeSegment[]) => segments.reduce((s, x) => s + x.width, 0);

/** Which part of an EAN/UPC symbol a module belongs to, and which digit it carries (if any). */
export type ModuleRole = { zone: "guard" | "left" | "center" | "right" | "data"; digitPos: number | null; digit: string | null; pattern: string | null };

export function fullDigits(symbology: BarcodeSymbology, value: string): string {
  const d = value.replace(/\D/g, "");
  if (symbology === "upc-a") return d + upcCheck(d);
  if (symbology === "ean-13") return d + eanCheck(d);
  return value;
}

export function roleOfModule(symbology: BarcodeSymbology, value: string, m: number): ModuleRole {
  if (symbology === "code128") {
    const sym = Math.floor(m / 11);
    const chars = Array.from(value);
    const n = chars.length;
    if (sym === 0) return { zone: "guard", digitPos: null, digit: null, pattern: null };
    if (sym <= n) return { zone: "data", digitPos: sym, digit: chars[sym - 1], pattern: null };
    if (sym === n + 1) return { zone: "data", digitPos: null, digit: null, pattern: null };
    return { zone: "guard", digitPos: null, digit: null, pattern: null };
  }
  const full = fullDigits(symbology, value);
  if (m < 3 || m >= 92) return { zone: "guard", digitPos: null, digit: null, pattern: null };
  if (m >= 45 && m < 50) return { zone: "center", digitPos: null, digit: null, pattern: null };
  const left = m < 45;
  const k = left ? Math.floor((m - 3) / 7) : Math.floor((m - 50) / 7);
  // UPC-A: 6 + 6 digits. EAN-13: first digit is implied by parity, bars carry digits 2–13.
  const pos = symbology === "upc-a" ? (left ? k : 6 + k) : left ? 1 + k : 7 + k;
  const digit = full[pos];
  let pattern: string;
  if (!left) pattern = EAN_R_CODE[Number(digit)];
  else if (symbology === "upc-a") pattern = EAN_L_CODE[Number(digit)];
  else pattern = EAN_FIRST_DIGIT_PARITY[Number(full[0])][k] === "L" ? EAN_L_CODE[Number(digit)] : EAN_G_CODE[Number(digit)];
  return { zone: left ? "left" : "right", digitPos: pos + 1, digit, pattern };
}

export function upcCheck(d11: string): number {
  let sum = 0;
  for (let i = 0; i < 11; i++) sum += Number(d11[i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10;
}

export function eanCheck(d12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(d12[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10;
}

/** UPC-A check-digit working: each digit × its weight, the weighted sum, and the check digit. */
export function upcSteps(d11: string) {
  const terms = d11.split("").map((c, i) => ({ digit: Number(c), weight: i % 2 === 0 ? 3 : 1, product: Number(c) * (i % 2 === 0 ? 3 : 1) }));
  const sum = terms.reduce((s, t) => s + t.product, 0);
  return { terms, sum, check: (10 - (sum % 10)) % 10 };
}

/** Run-length histogram: how many bars and how many spaces of each width (in modules). */
export function widthHistogram(segments: BarcodeSegment[]) {
  const bars = [0, 0, 0, 0];
  const spaces = [0, 0, 0, 0];
  for (const s of segments) {
    const w = Math.min(4, s.width) - 1;
    if (s.filled) bars[w]++;
    else spaces[w]++;
  }
  return { bars, spaces };
}

/** Code 128 (subset B) checksum working for a printable-ASCII string. */
export function code128Steps(text: string) {
  const chars = Array.from(text);
  let running = CODE128_START_B;
  const steps = chars.map((ch, i) => {
    const value = ch.charCodeAt(0) - 32;
    const product = value * (i + 1);
    running += product;
    return { ch, value, weight: i + 1, product, running };
  });
  return { steps, sum: running, checksum: running % CODE128_MODULO, start: CODE128_START_B };
}

/** Code 128 width in modules for an n-character subset-B string: start + n + checksum (11 each) + stop (13). */
export const code128Modules = (n: number) => 11 * (n + 2) + 13;

/** Whether swapping the adjacent digits at (i, i+1) of a UPC-A body changes the check digit (i.e. is detected). */
export function upcTranspositionDetected(d11: string, i: number): boolean {
  const a = d11[i];
  const b = d11[i + 1];
  if (a === b) return false;
  const swapped = d11.slice(0, i) + b + a + d11.slice(i + 2);
  return upcCheck(swapped) !== upcCheck(d11);
}

/** The real bar pattern of every encoded symbol, one line each (what the scanner decodes). */
export function symbolPatterns(symbology: BarcodeSymbology, value: string): string[] {
  const v = value.trim();
  if (symbology === "code128") {
    // Data characters only, like the EAN/UPC list (which leaves out its guard patterns too).
    return code128Steps(v).steps.map((st) => `${st.ch === " " ? "SPACE" : st.ch} ${st.value} ${CODE128_BARS[st.value]}`);
  }
  const full = fullDigits(symbology, v);
  const out: string[] = [];
  const from = symbology === "upc-a" ? 0 : 1;
  for (let pos = from; pos < full.length; pos++) {
    const k = pos - from;
    const d = Number(full[pos]);
    let set: "L" | "G" | "R";
    if (k >= 6) set = "R";
    else if (symbology === "upc-a") set = "L";
    else set = EAN_FIRST_DIGIT_PARITY[Number(full[0])][k] === "L" ? "L" : "G";
    const pattern = set === "L" ? EAN_L_CODE[d] : set === "G" ? EAN_G_CODE[d] : EAN_R_CODE[d];
    out.push(`${d} ${set} ${pattern}`);
  }
  return out;
}
