"use client";
import { useTranslations } from "next-intl";

/**
 * Fixed illustrative example (2/3 × 3/4 = 6/12 = 1/2) using the classic "area
 * model": a grid of 3 columns × 4 rows (denominatorA × denominatorB = 12
 * cells total) where 2 columns are shaded one direction and 3 rows the other
 * — the overlap (2 × 3 = 6 cells) is exactly the product's numerator, and the
 * grid's total cell count (3 × 4 = 12) is the product's denominator. This is
 * the actual arithmetic the tool's multiply operation performs
 * (numeratorA×numeratorB / denominatorA×denominatorB), made visible.
 */
const COLS = 3;
const ROWS = 4;
const SHADED_COLS = 2;
const SHADED_ROWS = 3;
const CELL = 32;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;

export default function FractionMultiplicationGridDiagram() {
  const t = useTranslations("tools.fraction-calculator.multiplicationDiagram");

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("gridAriaLabel")} className="h-auto w-48 text-current">
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const inOverlap = c < SHADED_COLS && r < SHADED_ROWS;
              const inColOnly = c < SHADED_COLS && r >= SHADED_ROWS;
              const inRowOnly = c >= SHADED_COLS && r < SHADED_ROWS;
              const fillOpacity = inOverlap ? 0.85 : inColOnly || inRowOnly ? 0.35 : 0;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * CELL}
                  y={r * CELL}
                  width={CELL}
                  height={CELL}
                  fill="currentColor"
                  fillOpacity={fillOpacity}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />
              );
            }),
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
