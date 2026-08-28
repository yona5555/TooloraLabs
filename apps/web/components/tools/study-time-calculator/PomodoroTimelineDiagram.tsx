type PomodoroTimelineDiagramProps = {
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  leftoverMinutes: number;
  workLabel: string;
  breakLabel: string;
  leftoverLabel: string;
  caption: string;
};

const WIDTH = 300;
const HEIGHT = 56;
const BAR_HEIGHT = 28;
const BAR_Y = (HEIGHT - BAR_HEIGHT) / 2;

/**
 * A proportional single-row timeline — segment widths are computed directly
 * from the calculator's actual work/break/leftover minutes, not a decorative
 * fixed-ratio illustration.
 */
export default function PomodoroTimelineDiagram({
  totalWorkMinutes,
  totalBreakMinutes,
  leftoverMinutes,
  workLabel,
  breakLabel,
  leftoverLabel,
  caption,
}: PomodoroTimelineDiagramProps) {
  const total = Math.max(totalWorkMinutes + totalBreakMinutes + leftoverMinutes, 1e-6);

  const segments = [
    { minutes: totalWorkMinutes, className: "fill-blue-600 dark:fill-blue-400", label: workLabel },
    { minutes: totalBreakMinutes, className: "fill-emerald-500 dark:fill-emerald-400", label: breakLabel },
    { minutes: leftoverMinutes, className: "fill-zinc-300 dark:fill-zinc-700", label: leftoverLabel },
  ].filter((segment) => segment.minutes > 0);

  let cursor = 0;
  const bars = segments.map((segment) => {
    const width = (segment.minutes / total) * WIDTH;
    const x = cursor;
    cursor += width;
    return { ...segment, x, width };
  });

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <rect x={0} y={BAR_Y} width={WIDTH} height={BAR_HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
          {bars.map((bar) => (
            <rect
              key={bar.label}
              x={bar.x}
              y={BAR_Y}
              width={Math.max(bar.width, 0)}
              height={BAR_HEIGHT}
              className={bar.className}
            />
          ))}
        </svg>
      </div>
      <div dir="ltr" className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${segment.className}`} />
            {segment.label}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
