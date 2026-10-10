const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };

/** 8 → "⁸", -15 → "⁻¹⁵" (readable exponent inside SVG text and table cells). */
export function sup(n: number): string {
  return String(n).split("").map((c) => SUP[c] ?? c).join("");
}

/** Short coefficient text: up to `sig` significant digits, trailing zeros trimmed. */
export function coef(n: number, sig = 10): string {
  return String(Number(n.toPrecision(sig))).replace("-", "−");
}
