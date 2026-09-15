type CountdownWeeksAheadBarProps = {
  totalDays: number;
  fullWeeks: number;
  extraDays: number;
  weeksLabel: string;
  extraDaysLabel: string;
  caption: string;
};

const WIDTH = 320;
const CELL = 12;
const GAP = 2;
const MAX_CELLS = 24;
const HEIGHT = CELL + 22;

export default function CountdownWeeksAheadBar({ totalDays, fullWeeks, extraDays, weeksLabel, extraDaysLabel, caption }: CountdownWeeksAheadBarProps) {
  const cellsToShow = Math.min(fullWeeks, MAX_CELLS);
  const overflow = fullWeeks - cellsToShow;
  const stride = WIDTH / Math.max(cellsToShow + (overflow > 0 ? 1 : 0), 1);
  const w = Math.min(stride - GAP, CELL);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 260 }}>
          {Array.from({ length: cellsToShow }).map((_, i) => (
            <rect
              key={i}
              x={i * stride}
              y={0}
              width={w}
              height={CELL}
              rx={2}
              className="fill-blue-600 dark:fill-blue-400"
            />
          ))}
          {overflow > 0 && (
            <text x={cellsToShow * stride} y={CELL - 2} fontSize={11} fontWeight={700} className="fill-blue-600 dark:fill-blue-400">
              +{overflow}
            </text>
          )}
          <text x={0} y={CELL + 16} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {totalDays > 0 ? `${fullWeeks} ${weeksLabel}${extraDays > 0 ? ` + ${extraDays} ${extraDaysLabel}` : ""}` : ""}
          </text>
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
