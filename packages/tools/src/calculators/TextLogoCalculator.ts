import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TextLogoStyle = "bold" | "italic" | "boldItalic" | "doubleStruck" | "monospace" | "fullwidth" | "circled";

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

const STYLE_MAPS: Record<TextLogoStyle, CharMap> = {
  bold: buildMap(0x1d400, 0x1d41a, 0x1d7ce),
  italic: buildMap(0x1d434, 0x1d44e, null, { h: "ℎ" }),
  boldItalic: buildMap(0x1d468, 0x1d482, null),
  doubleStruck: buildMap(0x1d538, 0x1d552, 0x1d7d8, {
    C: "ℂ",
    H: "ℍ",
    N: "ℕ",
    P: "ℙ",
    Q: "ℚ",
    R: "ℝ",
    Z: "ℤ",
  }),
  monospace: buildMap(0x1d670, 0x1d68a, 0x1d7f6),
  fullwidth: buildMap(0xff21, 0xff41, 0xff10),
  circled: buildMap(0x24b6, 0x24d0, 0x245f, { "0": "⓪" }),
};

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
