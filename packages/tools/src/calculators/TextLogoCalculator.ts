import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TextLogoStyle = "bold" | "italic" | "boldItalic" | "doubleStruck" | "monospace" | "fullwidth" | "circled";

/** Every style, in display order. */
export const TEXT_LOGO_STYLES: readonly TextLogoStyle[] = ["bold", "italic", "boldItalic", "doubleStruck", "monospace", "fullwidth", "circled"];

export type TextLogoInput = {
  text: string;
  style: TextLogoStyle;
};

export type TextLogoError = "empty-text";

export type TextLogoOutput = {
  error: TextLogoError | null;
  styledText: string;
};

type CharMap = Record<string, string>;

/**
 * Builds a character map for a Unicode Mathematical Alphanumeric Symbols style (or similar
 * block-offset style) from its base code points, with per-character exceptions for the
 * documented gaps where Unicode reuses an existing legacy code point instead of allocating
 * a new one in the block (e.g. italic "h" reuses PLANCK CONSTANT, U+210E).
 */
function buildMap(upperBase: number, lowerBase: number, digitBase: number | null, exceptions: CharMap = {}): CharMap {
  const map: CharMap = { ...exceptions };
  for (let i = 0; i < 26; i++) {
    const upperChar = String.fromCharCode(65 + i);
    const lowerChar = String.fromCharCode(97 + i);
    if (!(upperChar in map)) map[upperChar] = String.fromCodePoint(upperBase + i);
    if (!(lowerChar in map)) map[lowerChar] = String.fromCodePoint(lowerBase + i);
  }
  if (digitBase !== null) {
    for (let d = 0; d <= 9; d++) {
      const digitChar = String(d);
      if (!(digitChar in map)) map[digitChar] = String.fromCodePoint(digitBase + d);
    }
  }
  return map;
}

/** Block base code points per style: A, a and 0 (null when the style has no digits). */
export type TextLogoBases = { upper: number; lower: number; digit: number | null };

const STYLE_BASES: Record<TextLogoStyle, TextLogoBases> = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  italic: { upper: 0x1d434, lower: 0x1d44e, digit: null },
  boldItalic: { upper: 0x1d468, lower: 0x1d482, digit: null },
  doubleStruck: { upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8 },
  monospace: { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
  fullwidth: { upper: 0xff21, lower: 0xff41, digit: 0xff10 },
  circled: { upper: 0x24b6, lower: 0x24d0, digit: 0x245f },
};

/** Characters where Unicode reuses an older code point instead of the block offset. */
const STYLE_EXCEPTIONS: Record<TextLogoStyle, CharMap> = {
  bold: {},
  italic: { h: "ℎ" },
  boldItalic: {},
  doubleStruck: { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" },
  monospace: {},
  fullwidth: {},
  circled: { "0": "⓪" },
};

const STYLE_MAPS = Object.fromEntries(
  TEXT_LOGO_STYLES.map((style) => {
    const b = STYLE_BASES[style];
    return [style, buildMap(b.upper, b.lower, b.digit, STYLE_EXCEPTIONS[style])];
  }),
) as Record<TextLogoStyle, CharMap>;

export function textLogoBases(style: TextLogoStyle): TextLogoBases {
  return STYLE_BASES[style];
}

/** The legacy-code-point exceptions of a style, as [source, styled] pairs. */
export function textLogoExceptions(style: TextLogoStyle): [string, string][] {
  return Object.entries(STYLE_EXCEPTIONS[style]);
}

export type TextLogoCharKind = "upper" | "lower" | "digit" | "other";

export type TextLogoGlyph = {
  source: string;
  styled: string;
  sourceCodePoint: number;
  styledCodePoint: number;
  kind: TextLogoCharKind;
  /** True when the style replaced the character. */
  mapped: boolean;
  /** True when the replacement is a legacy exception rather than base + offset. */
  exception: boolean;
  /** Offset from the block base (A, a or 0), or null for "other" characters. */
  offset: number | null;
  utf16Units: number;
  utf8Bytes: number;
};

/** UTF-8 byte length of a string (pure, no TextEncoder). */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
  }
  return bytes;
}

function kindOf(ch: string): TextLogoCharKind {
  if (ch >= "A" && ch <= "Z") return "upper";
  if (ch >= "a" && ch <= "z") return "lower";
  if (ch >= "0" && ch <= "9") return "digit";
  return "other";
}

/**
 * Per-character breakdown of the styled output (same trimming and mapping as `execute`), so a UI
 * can show code points, byte costs and which characters the style could not replace.
 */
export function textLogoGlyphs(text: string, style: TextLogoStyle): TextLogoGlyph[] {
  const map = STYLE_MAPS[style] ?? STYLE_MAPS.bold;
  const exceptions = STYLE_EXCEPTIONS[style] ?? {};
  return Array.from((text ?? "").trim()).map((source) => {
    const styled = map[source] ?? source;
    const kind = kindOf(source);
    const offset = kind === "upper" ? source.charCodeAt(0) - 65 : kind === "lower" ? source.charCodeAt(0) - 97 : kind === "digit" ? source.charCodeAt(0) - 48 : null;
    return {
      source,
      styled,
      sourceCodePoint: source.codePointAt(0) ?? 0,
      styledCodePoint: styled.codePointAt(0) ?? 0,
      kind,
      mapped: styled !== source,
      exception: source in exceptions,
      offset,
      utf16Units: styled.length,
      utf8Bytes: utf8ByteLength(styled),
    };
  });
}

/**
 * Compatibility (NFKC) normalization of styled text — the folding search indexes and many text
 * pipelines apply. Every style this tool produces folds back to the plain letters and digits.
 */
export function textLogoRecover(styled: string): string {
  return (styled ?? "").normalize("NFKC");
}

export type TextLogoBlock = "basicLatin" | "latinSupplement" | "letterlike" | "enclosed" | "fullwidth" | "mathAlphanumeric" | "other";

/** The Unicode block a code point belongs to (only the blocks this tool produces or keeps). */
export function textLogoBlockOf(codePoint: number): TextLogoBlock {
  if (codePoint < 0x80) return "basicLatin";
  if (codePoint < 0x250) return "latinSupplement";
  if (codePoint >= 0x2100 && codePoint <= 0x214f) return "letterlike";
  if (codePoint >= 0x2460 && codePoint <= 0x24ff) return "enclosed";
  if (codePoint >= 0xff00 && codePoint <= 0xffef) return "fullwidth";
  if (codePoint >= 0x1d400 && codePoint <= 0x1d7ff) return "mathAlphanumeric";
  return "other";
}

function applyStyle(text: string, map: CharMap): string {
  return Array.from(text)
    .map((ch) => map[ch] ?? ch)
    .join("");
}

export class TextLogoCalculator extends BaseCalculator<TextLogoInput, TextLogoOutput> {
  metadata = {
    id: "text-logo-generator",
    slug: "text-logo-generator",
    name: "Text Logo Generator",
    category: "text-tools",
    description: "Transform text into stylized Unicode text designs using bold, italic, double-struck, and other font-like styles.",
    version: "1.0.0",
  };

  execute(input: TextLogoInput, _context: ToolContext): ToolResult<TextLogoOutput> {
    const text = (input.text ?? "").trim();
    if (!text) {
      return { success: true, data: { error: "empty-text", styledText: "" }, metadata: {} };
    }

    const map = STYLE_MAPS[input.style] ?? STYLE_MAPS.bold;
    const styledText = applyStyle(text, map);

    return { success: true, data: { error: null, styledText }, metadata: {} };
  }
}
