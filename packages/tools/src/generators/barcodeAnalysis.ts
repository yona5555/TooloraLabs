/**
 * Symbol-by-symbol analysis of a UPC-A, EAN-13 or Code 128 (set B) barcode, feeding every indicator
 * of the Barcode Generator: the encoded symbols with their parity and bit patterns, the check-digit
 * arithmetic, module and bar-width statistics, standard quiet zones, GS1 prefix, physical size and a
 * brute-force count of the single-character errors the check digit catches.
 */
import type { BarcodeSymbology } from "./BarcodeGenerator";
import { CODE128_BARS, CODE128_MODULO, CODE128_START_B, CODE128_STOP, EAN_CENTER_GUARD, EAN_FIRST_DIGIT_PARITY, EAN_G_CODE, EAN_GUARD, EAN_L_CODE, EAN_R_CODE } from "./barcodeTables";

export type BarcodeRole = "guard" | "center" | "left" | "right" | "check" | "start" | "data" | "checksum" | "stop";

export type BarcodeSymbol = {
  label: string;
  role: BarcodeRole;
  parity: "L" | "G" | "R" | null;
  bits: string;
  /** First module of the symbol, counted from the start of the first bar (quiet zone excluded). */
  start: number;
  /** Run lengths of alternating bars and spaces, starting with whichever the pattern starts with. */
  widths: number[];
};

export type BarcodeCheckStep = { char: string; value: number; weight: number; product: number };

export type BarcodeSizeScenario = { key: string; x: number; widthMm: number; heightMm: number };

export type BarcodeGs1Issuer =
  | "usCanada"
  | "restricted"
  | "coupons"
  | "france"
  | "germany"
  | "japan"
  | "uk"
  | "poland"
  | "southAfrica"
  | "egypt"
  | "jordan"
  | "saudi"
  | "uae"
  | "china"
  | "switzerland"
  | "italy"
  | "spain"
  | "netherlands"
  | "india"
  | "bookland"
  | "other";

export type BarcodeAnalysis = {
  symbology: BarcodeSymbology;
  /** Every character carried, check digit included (13 for EAN-13, 12 for UPC-A). */
  fullText: string;
  symbols: BarcodeSymbol[];
  /** Modules from the first bar to the last (quiet zones excluded). */
  modules: number;
  darkModules: number;
  bars: number;
  spaces: number;
  /** barWidths[i] / spaceWidths[i] = number of bars / spaces that are i + 1 modules wide. */
  barWidths: number[];
  spaceWidths: number[];
  check: { steps: BarcodeCheckStep[]; base: number; sum: number; modulo: number; remainder: number; check: number };
  /** Quiet zones the standard requires, in modules (EAN-13 11/7, UPC-A 9/9, Code 128 10/10). */
  quietZone: { left: number; right: number };
  /** EAN-13 left-half parity chosen by the first digit (UPC-A is always LLLLLL); null for Code 128. */
  parityPattern: string | null;
  gs1: { prefix: string; issuer: BarcodeGs1Issuer } | null;
  errors: { substitutions: { total: number; detected: number }; transpositions: { total: number; detected: number } };
  sizes: BarcodeSizeScenario[];
};

/** GS1 company prefix ranges (first three digits of the 13-digit GTIN) and the GS1 office that issued them. */
const GS1_RANGES: [number, number, BarcodeGs1Issuer][] = [
  [0, 19, "usCanada"],
  [20, 29, "restricted"],
  [30, 39, "usCanada"],
  [40, 49, "restricted"],
  [50, 59, "coupons"],
  [60, 139, "usCanada"],
  [200, 299, "restricted"],
  [300, 379, "france"],
  [400, 440, "germany"],
  [450, 459, "japan"],
  [490, 499, "japan"],
  [500, 509, "uk"],
  [590, 590, "poland"],
  [600, 601, "southAfrica"],
  [622, 622, "egypt"],
  [625, 625, "jordan"],
  [628, 628, "saudi"],
  [629, 629, "uae"],
  [690, 699, "china"],
  [760, 769, "switzerland"],
  [800, 839, "italy"],
  [840, 849, "spain"],
  [870, 879, "netherlands"],
  [890, 890, "india"],
  [978, 979, "bookland"],
  [981, 984, "coupons"],
  [990, 999, "coupons"],
];

export function gs1Issuer(gtin13: string): BarcodeGs1Issuer {
  const p = Number(gtin13.slice(0, 3));
  return GS1_RANGES.find(([lo, hi]) => p >= lo && p <= hi)?.[2] ?? "other";
}

function runs(bits: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < bits.length; ) {
    let w = 1;
    while (bits[i + w] === bits[i]) w++;
    out.push(w);
    i += w;
  }
  return out;
}

type Checker = { values: number[]; weights: number[]; base: number; modulo: number; checkOf: (sum: number) => number };

function eanLikeChecker(digits: string, firstWeight: number): Checker {
  const values = [...digits].map(Number);
  return {
    values,
    weights: values.map((_, i) => (i % 2 === 0 ? firstWeight : 4 - firstWeight)),
    base: 0,
    modulo: 10,
    checkOf: (sum) => (10 - (sum % 10)) % 10,
  };
}

function checkFor(c: Checker, values: number[]): number {
  return c.checkOf(values.reduce((s, v, i) => s + v * c.weights[i], c.base));
}

/** Brute force: every single-character substitution and every adjacent transposition of unequal characters. */
function errorDetection(c: Checker, alphabet: number) {
  const check = checkFor(c, c.values);
  const sub = { total: 0, detected: 0 };
  const tr = { total: 0, detected: 0 };
  c.values.forEach((v, i) => {
    for (let w = 0; w < alphabet; w++) {
      if (w === v) continue;
      const next = [...c.values];
      next[i] = w;
      sub.total++;
      if (checkFor(c, next) !== check) sub.detected++;
    }
    if (i < c.values.length - 1 && c.values[i + 1] !== v) {
      const next = [...c.values];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      tr.total++;
      if (checkFor(c, next) !== check) tr.detected++;
    }
  });
  return { substitutions: sub, transpositions: tr };
}

function stats(symbols: BarcodeSymbol[]) {
  const bits = symbols.map((s) => s.bits).join("");
  const barWidths = [0, 0, 0, 0];
  const spaceWidths = [0, 0, 0, 0];
  let bars = 0;
  let spaces = 0;
  for (let i = 0; i < bits.length; ) {
    let w = 1;
    while (bits[i + w] === bits[i]) w++;
    if (bits[i] === "1") {
      bars++;
      barWidths[Math.min(w, 4) - 1]++;
    } else {
      spaces++;
      spaceWidths[Math.min(w, 4) - 1]++;
    }
    i += w;
  }
  return { modules: bits.length, darkModules: [...bits].filter((b) => b === "1").length, bars, spaces, barWidths, spaceWidths };
}

function place(list: Omit<BarcodeSymbol, "start" | "widths">[]): BarcodeSymbol[] {
  let at = 0;
  return list.map((s) => {
    const placed = { ...s, start: at, widths: runs(s.bits) };
    at += s.bits.length;
    return placed;
  });
}

/** GS1 nominal X = 0.330 mm and bar height 22.85 mm at 100 %, allowed magnification 80 %–200 %. */
function eanSizes(modules: number): BarcodeSizeScenario[] {
  return [
    { key: "m80", f: 0.8 },
    { key: "m100", f: 1 },
    { key: "m200", f: 2 },
  ].map(({ key, f }) => ({ key, x: 0.33 * f, widthMm: modules * 0.33 * f, heightMm: 22.85 * f }));
}

/** Code 128 bar height: at least 15 % of the symbol width or 6.35 mm, whichever is greater (ISO/IEC 15417 guidance). */
function code128Sizes(modules: number): BarcodeSizeScenario[] {
  return [
    { key: "x025", x: 0.25 },
    { key: "x033", x: 0.33 },
    { key: "x050", x: 0.5 },
  ].map(({ key, x }) => ({ key, x, widthMm: modules * x, heightMm: Math.max(6.35, 0.15 * modules * x) }));
}

/** Returns null when the value is not encodable in the symbology (the generator reports why). */
export function analyzeBarcode(symbology: BarcodeSymbology, value: string): BarcodeAnalysis | null {
  const raw = value.trim();
  if (symbology === "code128") {
    if (!raw || raw.length > 48 || !/^[\x20-\x7e]+$/.test(raw)) return null;
    const values = [...raw].map((ch) => ch.charCodeAt(0) - 32);
    const c: Checker = { values, weights: values.map((_, i) => i + 1), base: CODE128_START_B, modulo: CODE128_MODULO, checkOf: (sum) => sum % CODE128_MODULO };
    const sum = values.reduce((s, v, i) => s + v * (i + 1), CODE128_START_B);
    const checksum = sum % CODE128_MODULO;
    const symbols = place([
      { label: "Start B", role: "start", parity: null, bits: CODE128_BARS[CODE128_START_B] },
      ...[...raw].map((ch, i) => ({ label: ch, role: "data" as const, parity: null, bits: CODE128_BARS[values[i]] })),
      { label: String(checksum), role: "checksum", parity: null, bits: CODE128_BARS[checksum] },
      { label: "Stop", role: "stop", parity: null, bits: CODE128_BARS[CODE128_STOP] },
    ]);
    const st = stats(symbols);
    return {
      symbology,
      fullText: raw,
      symbols,
      ...st,
      check: { steps: [...raw].map((ch, i) => ({ char: ch, value: values[i], weight: i + 1, product: values[i] * (i + 1) })), base: CODE128_START_B, sum, modulo: CODE128_MODULO, remainder: checksum, check: checksum },
      quietZone: { left: 10, right: 10 },
      parityPattern: null,
      gs1: null,
      errors: errorDetection(c, 95),
      sizes: code128Sizes(st.modules + 20),
    };
  }

  const digits = raw.replace(/\s/g, "");
  const need = symbology === "upc-a" ? 11 : 12;
  if (!/^\d+$/.test(digits) || digits.length !== need) return null;
  const c = eanLikeChecker(digits, symbology === "upc-a" ? 3 : 1);
  const sum = c.values.reduce((s, v, i) => s + v * c.weights[i], 0);
  const check = c.checkOf(sum);
  const full = digits + check;
  const parity = symbology === "upc-a" ? "LLLLLL" : EAN_FIRST_DIGIT_PARITY[Number(full[0])];
  const leftDigits = symbology === "upc-a" ? full.slice(0, 6) : full.slice(1, 7);
  const rightDigits = symbology === "upc-a" ? full.slice(6, 12) : full.slice(7, 13);
  const symbols = place([
    { label: "", role: "guard", parity: null, bits: EAN_GUARD },
    ...[...leftDigits].map((d, i) => ({ label: d, role: "left" as const, parity: parity[i] as "L" | "G", bits: (parity[i] === "L" ? EAN_L_CODE : EAN_G_CODE)[Number(d)] })),
    { label: "", role: "center", parity: null, bits: EAN_CENTER_GUARD },
    ...[...rightDigits].map((d, i) => ({ label: d, role: i === 5 ? ("check" as const) : ("right" as const), parity: "R" as const, bits: EAN_R_CODE[Number(d)] })),
    { label: "", role: "guard", parity: null, bits: EAN_GUARD },
  ]);
  const st = stats(symbols);
  const quietZone = symbology === "upc-a" ? { left: 9, right: 9 } : { left: 11, right: 7 };
  const gtin13 = symbology === "upc-a" ? "0" + full : full;
  return {
    symbology,
    fullText: full,
    symbols,
    ...st,
    check: { steps: [...digits].map((d, i) => ({ char: d, value: Number(d), weight: c.weights[i], product: Number(d) * c.weights[i] })), base: 0, sum, modulo: 10, remainder: sum % 10, check },
    quietZone,
    parityPattern: parity,
    gs1: { prefix: gtin13.slice(0, 3), issuer: gs1Issuer(gtin13) },
    errors: errorDetection(c, 10),
    sizes: eanSizes(st.modules + quietZone.left + quietZone.right),
  };
}

/** Total modules of a Code 128 set-B symbol carrying n characters: start + n + checksum (11 each) + stop (13). */
export function code128Modules(n: number): number {
  return 11 * (n + 2) + 13;
}
