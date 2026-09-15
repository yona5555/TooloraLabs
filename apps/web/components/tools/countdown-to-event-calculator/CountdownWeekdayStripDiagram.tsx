type CountdownWeekdayStripDiagramProps = {
  /** 0 = Sunday .. 6 = Saturday, matching JS Date#getDay() for the actual target date. */
  targetDayIndex: number;
  dayLabels: string[];
  caption: string;
};

const CELL = 40;
const GAP = 6;
const WIDTH = CELL * 7 + GAP * 6;
const HEIGHT = CELL + 4;

export default function CountdownWeekdayStripDiagram({ targetDayIndex, dayLabels, caption }: CountdownWeekdayStripDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 260 }}>
          {dayLabels.map((label, i) => {
            const x = i * (CELL + GAP);
            const isTarget = i === targetDayIndex;
            return (
              <g key={label} transform={`translate(${x}, 0)`}>
                <rect
                  width={CELL}
                  height={CELL}
                  rx={8}
                  className={isTarget ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-100 dark:fill-zinc-800"}
                />
                <text
                  x={CELL / 2}
                  y={CELL / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  className={isTarget ? "fill-white" : "fill-zinc-500 dark:fill-zinc-400"}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
