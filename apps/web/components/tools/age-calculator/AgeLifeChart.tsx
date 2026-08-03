type AgeLifeChartProps = {
  label: string;
  livedLabel: string;
  remainingLabel: string;
};

const YEARS = 90;
const MONTHS_PER_YEAR = 12;
const CELL = 6;
const GAP = 1.5;
const ILLUSTRATIVE_YEARS_LIVED = 30;

export default function AgeLifeChart({ label, livedLabel, remainingLabel }: AgeLifeChartProps) {
  const livedMonths = ILLUSTRATIVE_YEARS_LIVED * MONTHS_PER_YEAR;
  const step = CELL + GAP;
  const width = MONTHS_PER_YEAR * step;
  const height = YEARS * step;

  const cells = [];
  for (let year = 0; year < YEARS; year++) {
    for (let month = 0; month < MONTHS_PER_YEAR; month++) {
      const index = year * MONTHS_PER_YEAR + month;
      const isLived = index < livedMonths;
      cells.push(
        <rect
          key={index}
          x={month * step}
          y={year * step}
          width={CELL}
          height={CELL}
          className={isLived ? "fill-zinc-900 dark:fill-zinc-100" : "fill-none stroke-zinc-300 dark:stroke-zinc-700"}
          strokeWidth={isLived ? 0 : 0.5}
        />
      );
    }
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="mx-auto w-full max-w-xs">
        {cells}
      </svg>
      <div className="mt-3 flex justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-zinc-900 dark:bg-zinc-100" />
          {livedLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 border border-zinc-400" />
          {remainingLabel}
        </span>
      </div>
    </div>
  );
}
