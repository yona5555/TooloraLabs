type PercentageComparisonChartProps = {
  leftLabel: string;
  leftValue: number;
  leftFormatted: string;
  rightLabel: string;
  rightValue: number;
  rightFormatted: string;
  percentageLabel: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 28;
const GAP = 14;
const HEIGHT = BAR_HEIGHT * 2 + GAP + 20;
const LABEL_WIDTH = 96;
const TRACK_WIDTH = WIDTH - LABEL_WIDTH;

export default function PercentageComparisonChart({
  leftLabel,
  leftValue,
  leftFormatted,
  rightLabel,
  rightValue,
  rightFormatted,
  percentageLabel,
}: PercentageComparisonChartProps) {
  const maxMagnitude = Math.max(Math.abs(leftValue), Math.abs(rightValue), 1);
  const leftWidth = (Math.abs(leftValue) / maxMagnitude) * TRACK_WIDTH;
  const rightWidth = (Math.abs(rightValue) / maxMagnitude) * TRACK_WIDTH;

  return (
    <figure className="my-1">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={percentageLabel}
          className="h-auto w-full text-current"
          style={{ minWidth: 260 }}
        >
          <text x={0} y={12} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {leftLabel}
          </text>
          <rect x={LABEL_WIDTH} y={4} width={TRACK_WIDTH} height={BAR_HEIGHT} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
          <rect
            x={LABEL_WIDTH}
            y={4}
            width={Math.max(leftWidth, 2)}
            height={BAR_HEIGHT}
            rx={4}
            className="fill-zinc-400 dark:fill-zinc-500"
          />
          <text
            x={LABEL_WIDTH + 8}
            y={4 + BAR_HEIGHT / 2 + 4}
            fontSize={12}
            fontWeight={700}
            className="fill-zinc-900 dark:fill-zinc-50"
          >
            {leftFormatted}
          </text>

          <text x={0} y={4 + BAR_HEIGHT + GAP + 8} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {rightLabel}
          </text>
          <rect
            x={LABEL_WIDTH}
            y={4 + BAR_HEIGHT + GAP}
            width={TRACK_WIDTH}
            height={BAR_HEIGHT}
            rx={4}
            className="fill-zinc-100 dark:fill-zinc-800"
          />
          <rect
            x={LABEL_WIDTH}
            y={4 + BAR_HEIGHT + GAP}
            width={Math.max(rightWidth, 2)}
            height={BAR_HEIGHT}
            rx={4}
            className="fill-blue-600 dark:fill-blue-400"
          />
          <text
            x={LABEL_WIDTH + 8}
            y={4 + BAR_HEIGHT + GAP + BAR_HEIGHT / 2 + 4}
            fontSize={12}
            fontWeight={700}
            className="fill-white dark:fill-zinc-950"
          >
            {rightFormatted}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{percentageLabel}</figcaption>
    </figure>
  );
}
