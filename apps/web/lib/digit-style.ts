import { detectDigitStyle, type DigitStyle } from "@tooloralabs/core";

export function resolveDigitStyle(...values: string[]): DigitStyle {
  return values.some((value) => value && detectDigitStyle(value) === "eastern")
    ? "eastern"
    : "western";
}
