/// <reference path="./qrcode-internals.d.ts" />
/**
 * Structure of the QR symbol the generator produces, read from the qrcode library's own encoder:
 * version and size, every module classified (finder, timing, alignment, format/version info, data),
 * codeword budget (data vs Reed–Solomon error correction), capacity per error-correction level and
 * version, the minimum version each level needs, the encoder's segments and the payload's bytes.
 */
import QRCode from "qrcode";
import { getCapacity } from "qrcode/lib/core/version.js";
import { getBlocksCount, getTotalCodewordsCount } from "qrcode/lib/core/error-correction-code.js";
import * as ECLevel from "qrcode/lib/core/error-correction-level.js";
import { getSymbolTotalCodewords } from "qrcode/lib/core/utils.js";
import { BYTE } from "qrcode/lib/core/mode.js";
import { getPositions } from "qrcode/lib/core/alignment-pattern.js";
import type { QRErrorCorrectionLevel } from "./QRCodeGenerator";

export type QRRegion = "finder" | "timing" | "alignment" | "format" | "version" | "data";
export const QR_REGIONS: QRRegion[] = ["finder", "timing", "alignment", "format", "version", "data"];
export const QR_LEVELS: QRErrorCorrectionLevel[] = ["L", "M", "Q", "H"];
/** Share of codewords each level can restore (ISO/IEC 18004). */
export const QR_RECOVERY: Record<QRErrorCorrectionLevel, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };

export type QRAnalysis = {
  version: number;
  size: number;
  level: QRErrorCorrectionLevel;
  mask: number;
  /** size × size, row-major: true = dark. */
  dark: boolean[];
  /** size × size, row-major region of each module. */
  regions: QRRegion[];
  regionCounts: Record<QRRegion, number>;
  /** Dark modules per region. */
  regionDark: Record<QRRegion, number>;
  darkModules: number;
  totalCodewords: number;
  ecCodewords: number;
  dataCodewords: number;
  blocks: number;
  /** Bits the encoded segments use (mode + length headers + data). */
  usedBits: number;
  segments: { mode: string; length: number; bits: number }[];
  payloadBytes: number;
  payloadChars: number;
  /** Byte-mode capacity at this version for each level. */
  capacityAtVersion: Record<QRErrorCorrectionLevel, number>;
  /** Smallest version that fits this payload at each level (null if it does not fit version 40). */
  minVersion: Record<QRErrorCorrectionLevel, number | null>;
  /** Byte-mode capacity at the chosen level for versions 1–40. */
  capacityByVersion: number[];
  byteKinds: { letters: number; digits: number; spaces: number; punctuation: number; multibyte: number };
};

const LEVEL_OBJ = { L: ECLevel.L, M: ECLevel.M, Q: ECLevel.Q, H: ECLevel.H } as const;
const encoder = new TextEncoder();

function classify(size: number, version: number): QRRegion[] {
  const out: QRRegion[] = new Array(size * size).fill("data");
  const set = (r: number, c: number, region: QRRegion) => {
    if (r >= 0 && c >= 0 && r < size && c < size) out[r * size + c] = region;
  };
  // Finder patterns with their separators: three 8 × 8 corners.
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      set(r, c, "finder");
      set(r, size - 1 - c, "finder");
      set(size - 1 - r, c, "finder");
    }
  for (let i = 8; i < size - 8; i++) {
    set(6, i, "timing");
    set(i, 6, "timing");
  }
  for (const [r, c] of getPositions(version)) for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, "alignment");
  // Format information (15 bits, twice) and the always-dark module.
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      set(8, i, "format");
      set(i, 8, "format");
    }
  }
  for (let i = 0; i < 8; i++) {
    set(8, size - 1 - i, "format");
    set(size - 1 - i, 8, "format");
  }
  if (version >= 7)
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 3; j++) {
        set(i, size - 11 + j, "version");
        set(size - 11 + j, i, "version");
      }
  return out;
}

export function analyzeQR(payload: string, level: QRErrorCorrectionLevel): QRAnalysis {
  const qr = QRCode.create(payload, { errorCorrectionLevel: level });
  const { size, data } = qr.modules;
  const version = qr.version;
  const dark = Array.from(data as ArrayLike<number>, (v) => v === 1);
  const regions = classify(size, version);
  const regionCounts = Object.fromEntries(QR_REGIONS.map((r) => [r, 0])) as Record<QRRegion, number>;
  const regionDark = Object.fromEntries(QR_REGIONS.map((r) => [r, 0])) as Record<QRRegion, number>;
  regions.forEach((r, i) => {
    regionCounts[r]++;
    if (dark[i]) regionDark[r]++;
  });

  const lv = LEVEL_OBJ[level];
  const totalCodewords = getSymbolTotalCodewords(version);
  const ecCodewords = getTotalCodewordsCount(version, lv);
  const segments = (qr.segments as unknown as { mode: { id: string }; getLength(): number; getBitsLength(): number }[]).map((s) => ({ mode: s.mode.id, length: s.getLength(), bits: s.getBitsLength() }));
  // Each segment adds a 4-bit mode indicator and a character-count field (8–16 bits depending on mode and version).
  const countBits = (mode: string) => {
    const band = version < 10 ? 0 : version < 27 ? 1 : 2;
    const table: Record<string, number[]> = { Numeric: [10, 12, 14], Alphanumeric: [9, 11, 13], Byte: [8, 16, 16], Kanji: [8, 10, 12] };
    return (table[mode] ?? [8, 16, 16])[band];
  };
  const usedBits = segments.reduce((s, g) => s + 4 + countBits(g.mode) + g.bits, 0);

  const capacityAtVersion = Object.fromEntries(QR_LEVELS.map((l) => [l, getCapacity(version, LEVEL_OBJ[l], BYTE)])) as Record<QRErrorCorrectionLevel, number>;
  const minVersion = Object.fromEntries(
    QR_LEVELS.map((l) => {
      try {
        return [l, QRCode.create(payload, { errorCorrectionLevel: l }).version];
      } catch {
        return [l, null];
      }
    }),
  ) as Record<QRErrorCorrectionLevel, number | null>;

  const chars = [...payload];
  return {
    version,
    size,
    level,
    mask: qr.maskPattern ?? 0,
    dark,
    regions,
    regionCounts,
    regionDark,
    darkModules: dark.filter(Boolean).length,
    totalCodewords,
    ecCodewords,
    dataCodewords: totalCodewords - ecCodewords,
    blocks: getBlocksCount(version, lv),
    usedBits,
    segments,
    payloadBytes: encoder.encode(payload).length,
    payloadChars: chars.length,
    capacityAtVersion,
    minVersion,
    capacityByVersion: Array.from({ length: 40 }, (_, i) => getCapacity(i + 1, lv, BYTE)),
    byteKinds: {
      letters: chars.filter((c) => /^[A-Za-z]$/.test(c)).length,
      digits: chars.filter((c) => /^[0-9]$/.test(c)).length,
      spaces: chars.filter((c) => /^\s$/.test(c)).length,
      punctuation: chars.filter((c) => /^[!-/:-@[-`{-~]$/.test(c)).length,
      multibyte: chars.filter((c) => c.charCodeAt(0) > 127).reduce((s, c) => s + encoder.encode(c).length, 0),
    },
  };
}
