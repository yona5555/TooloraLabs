export type DigitStyle = "western" | "eastern";

const EASTERN_DIGITS = /[٠-٩۰-۹]/;

export function detectDigitStyle(value: string): DigitStyle {
  return EASTERN_DIGITS.test(value) ? "eastern" : "western";
}
