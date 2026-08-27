type FractionBarDiagramProps = {
  numerator: number;
  denominator: number;
  caption: string;
};

const CELL = 26;
const GAP = 3;
const STEP = CELL + GAP;
const MAX_LITERAL_DENOMINATOR = 24;
const MAX_BARS = 4;

/**
 * A real, mathematically accurate rendering of the actual computed result —
 * not a decorative static image. Each bar is split into `denominator` equal
 * cells; a whole number of fully-shaded bars plus one partially-shaded bar
 * represents an improper result (e.g. 7/4 draws one full bar of 4 cells
 * plus a second bar with 3 of 4 cells shaded), the same way a student would
 * draw it by hand.
 */
export default function FractionBarDiagram({ numerator, denominator, caption }: FractionBarDiagramProps) {
  const den = Math.max(1, Math.trunc(denominator));
  const absNum = Math.abs(Math.trunc(numerator));

  if (den > MAX_LITERAL_DENOMINATOR) {
    const ratio = Math.min(1, absNum / den);
    const width = 280;
    const height = 40;
    return (
      <figure className="my-2">
        <div dir="ltr" className="flex justify-center overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={caption} className="h-auto w-64 text-current">
            <rect x={0} y={4} width={width} height={height - 8} rx={6} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
            <rect x={0} y={4} width={width * ratio} height={height - 8} rx={6} fill="currentColor" opacity={0.85} />
          </svg>
        </div>
        <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
      </figure>
    );
  }

  const wholeBars = Math.floor(absNum / den);
  const remainder = absNum - wholeBars * den;
  const barsToShow = Math.min(MAX_BARS, Math.max(1, wholeBars + (remainder > 0 ? 1 : 0)));
  const width = den * STEP - GAP;
  const height = barsToShow * STEP - GAP;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          {Array.from({ length: barsToShow }, (_, barIndex) => {
            const shadedInThisBar = barIndex < wholeBars ? den : remainder;
            return Array.from({ length: den }, (_, cellIndex) => {
              const x = cellIndex * STEP;
              const y = barIndex * STEP;
              const isShaded = cellIndex < shadedInThisBar;
              return (
                <rect
                  key={`${barIndex}-${cellIndex}`}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={4}
                  fill={isShaded ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  opacity={isShaded ? 0.85 : 0.35}
                />
              );
            });
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
