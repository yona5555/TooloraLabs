/**
 * Picks a font-size class from `steps` (ordered largest-first, each paired
 * with the max character length it still comfortably fits) based on the
 * rendered text's actual length — not tuned to any one currency or value.
 * A long currency code ("EGP", "SAR") plus a big grouped number naturally
 * produces a longer string and drops to a smaller step; a short one ("$40")
 * keeps the largest step. Works the same for any symbol/number combination.
 */
export function pickFontSizeClass(text: string, steps: [maxLength: number, className: string][]): string {
  for (const [maxLength, className] of steps) {
    if (text.length <= maxLength) return className;
  }
  return steps[steps.length - 1][1];
}
