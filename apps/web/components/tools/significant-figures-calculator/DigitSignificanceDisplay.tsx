type DigitSignificanceDisplayProps = {
  raw: string;
  caption: string;
};

/**
 * A real, dynamically computed breakdown of the actual digits typed in —
 * not a decorative graphic — highlighting exactly which digits count as
 * significant under the same rules the calculator itself applies.
 */
export function computeDigitSignificance(raw: string): Array<{ char: string; significant: boolean }> {
  const withoutSign = raw.trim().replace(/^[+-]/, "");
  const hasDecimal = withoutSign.includes(".");
  const digitIndices: number[] = [];
  for (let i = 0; i < withoutSign.length; i++) {
    if (/[0-9]/.test(withoutSign[i])) digitIndices.push(i);
  }

  const significant = new Set<number>();

  if (hasDecimal) {
    const firstNonZero = digitIndices.find((i) => withoutSign[i] !== "0");
    if (firstNonZero === undefined) {
      const decimalIndex = withoutSign.indexOf(".");
      digitIndices.forEach((i) => {
        if (i > decimalIndex) significant.add(i);
      });
    } else {
      digitIndices.forEach((i) => {
        if (i >= firstNonZero) significant.add(i);
      });
    }
  } else {
    const nonZero = digitIndices.filter((i) => withoutSign[i] !== "0");
    if (nonZero.length > 0) {
      const first = nonZero[0];
      const last = nonZero[nonZero.length - 1];
      digitIndices.forEach((i) => {
        if (i >= first && i <= last) significant.add(i);
      });
    }
  }

  return withoutSign.split("").map((char, i) => ({ char, significant: significant.has(i) }));
}

export default function DigitSignificanceDisplay({ raw, caption }: DigitSignificanceDisplayProps) {
  const mask = computeDigitSignificance(raw);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
        {mask.map((entry, i) => (
          <span
            key={i}
            className={`flex h-10 w-8 items-center justify-center rounded-lg font-mono text-lg font-bold ${
              entry.significant
                ? "bg-blue-600 text-white"
                : "border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
            }`}
          >
            {entry.char}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
