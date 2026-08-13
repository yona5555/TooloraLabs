import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";
import {
  EAN_L_CODE,
  EAN_G_CODE,
  EAN_R_CODE,
  EAN_FIRST_DIGIT_PARITY,
  EAN_GUARD,
  EAN_CENTER_GUARD,
  CODE128_BARS,
  CODE128_START_B,
  CODE128_STOP,
  CODE128_MODULO,
} from "./barcodeTables";

export type BarcodeSymbology = "upc-a" | "ean-13" | "code128";

export type BarcodeInput = {
  symbology: BarcodeSymbology;
  value: string;
};

export type BarcodeSegment = { width: number; filled: boolean; tall?: boolean };

export type BarcodeOutput = {
  segments: BarcodeSegment[];
  displayText: string;
  quietZoneModules: number;
};

const QUIET_ZONE_MODULES = 10;

/** Run-length-encodes a binary bar/space string ("1"=dark, "0"=light) into segments. */
function binaryToSegments(bits: string, tall = false): BarcodeSegment[] {
  const segments: BarcodeSegment[] = [];
  let i = 0;
  while (i < bits.length) {
    const char = bits[i];
    let width = 1;
    while (bits[i + width] === char) width++;
    segments.push({ width, filled: char === "1", tall });
    i += width;
  }
  return segments;
}

/** EAN-13's own check-digit weighting: 1-indexed odd positions weight 1, even weight 3. */
function eanCheckDigit(data12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(data12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

/** UPC-A's own check-digit weighting: 1-indexed odd positions weight 3, even weight 1. */
function upcCheckDigit(data11: string): number {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += Number(data11[i]) * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

function encodeEan13(digits12: string): BarcodeOutput {
  const checkDigit = eanCheckDigit(digits12);
  const full = digits12 + checkDigit;
  const firstDigit = Number(full[0]);
  const parity = EAN_FIRST_DIGIT_PARITY[firstDigit];

  const left = full
    .slice(1, 7)
    .split("")
    .map((d, i) => (parity[i] === "L" ? EAN_L_CODE[Number(d)] : EAN_G_CODE[Number(d)]))
    .join("");
  const right = full
    .slice(7, 13)
    .split("")
    .map((d) => EAN_R_CODE[Number(d)])
    .join("");

  const bits = EAN_GUARD + left + EAN_CENTER_GUARD + right + EAN_GUARD;
  const segments = [
    ...binaryToSegments(EAN_GUARD, true),
    ...binaryToSegments(left),
    ...binaryToSegments(EAN_CENTER_GUARD, true),
    ...binaryToSegments(right),
    ...binaryToSegments(EAN_GUARD, true),
  ];
  void bits;

  return {
    segments,
    displayText: `${full[0]} ${full.slice(1, 7)} ${full.slice(7, 13)}`,
    quietZoneModules: QUIET_ZONE_MODULES,
  };
}

function encodeUpcA(digits11: string): BarcodeOutput {
  const checkDigit = upcCheckDigit(digits11);
  const full = digits11 + checkDigit;

  const left = full
    .slice(0, 6)
    .split("")
    .map((d) => EAN_L_CODE[Number(d)])
    .join("");
  const right = full
    .slice(6, 12)
    .split("")
    .map((d) => EAN_R_CODE[Number(d)])
    .join("");

  const segments = [
    ...binaryToSegments(EAN_GUARD, true),
    ...binaryToSegments(left),
    ...binaryToSegments(EAN_CENTER_GUARD, true),
    ...binaryToSegments(right),
    ...binaryToSegments(EAN_GUARD, true),
  ];

  return {
    segments,
    displayText: `${full[0]} ${full.slice(1, 6)} ${full.slice(6, 11)} ${full[11]}`,
    quietZoneModules: QUIET_ZONE_MODULES,
  };
}

function encodeCode128(text: string): BarcodeOutput {
  const values = Array.from(text).map((ch) => ch.charCodeAt(0) - 32);
  let checksum = CODE128_START_B;
  values.forEach((v, i) => {
    checksum += v * (i + 1);
  });
  checksum %= CODE128_MODULO;

  const symbolValues = [CODE128_START_B, ...values, checksum, CODE128_STOP];
  const bits = symbolValues.map((v) => CODE128_BARS[v]).join("");

  return {
    segments: binaryToSegments(bits),
    displayText: text,
    quietZoneModules: QUIET_ZONE_MODULES,
  };
}

export class BarcodeGenerator extends BaseTool<BarcodeInput, BarcodeOutput> {
  metadata = {
    id: "barcode-generator",
    slug: "barcode-generator",
    name: "Barcode Generator",
    category: "developer-tools",
    description: "Generate UPC-A, EAN-13, and Code 128 barcodes for educational and design use.",
    version: "1.0.0",
  };

  execute(input: BarcodeInput, _context: ToolContext): ToolResult<BarcodeOutput> {
    const raw = input.value.trim();
    if (!raw) {
      return this.fail("EMPTY_INPUT");
    }

    if (input.symbology === "upc-a") {
      const digits = raw.replace(/\D/g, "");
      if (!/^\d+$/.test(raw.replace(/\s/g, "")) ) {
        return this.fail("NON_DIGIT");
      }
      if (digits.length !== 11) {
        return this.fail("INVALID_LENGTH_UPC");
      }
      return { success: true, data: encodeUpcA(digits), metadata: {} };
    }

    if (input.symbology === "ean-13") {
      const digits = raw.replace(/\D/g, "");
      if (!/^\d+$/.test(raw.replace(/\s/g, ""))) {
        return this.fail("NON_DIGIT");
      }
      if (digits.length !== 12) {
        return this.fail("INVALID_LENGTH_EAN");
      }
      return { success: true, data: encodeEan13(digits), metadata: {} };
    }

    if (raw.length > 48) {
      return this.fail("TOO_LONG");
    }
    if (!/^[\x20-\x7e]+$/.test(raw)) {
      return this.fail("UNSUPPORTED_CHARACTER");
    }
    return { success: true, data: encodeCode128(raw), metadata: {} };
  }

  private fail(error: string): ToolResult<BarcodeOutput> {
    return { success: false, data: { segments: [], displayText: "", quietZoneModules: 0 }, metadata: { error } };
  }
}
