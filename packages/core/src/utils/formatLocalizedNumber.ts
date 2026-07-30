import type { DigitStyle } from "./detectDigitStyle";

const DIGIT_STYLE_LOCALES: Record<DigitStyle, string> = {
  western: "en-US",
  eastern: "ar-SA-u-nu-arab",
};

export function formatLocalizedNumber(
  value: number,
  style: DigitStyle,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DIGIT_STYLE_LOCALES[style], options).format(value);
}
