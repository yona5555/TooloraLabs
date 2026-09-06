type BreakEvenCostStructureBarProps = {
  fixedCosts: number;
  variableCosts: number;
  fixedLabel: string;
  variableLabel: string;
  fixedFormatted: string;
  variableFormatted: string;
  caption: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 32;
const HEIGHT = BAR_HEIGHT + 22;

export default function BreakEvenCostStructureBar({
  fixedCosts,
  variableCosts,
  fixedLabel,
  variableLabel,
  fixedFormatted,
  variableFormatted,
  caption,
}: BreakEvenCostStructureBarProps) {
  const total = Math.max(fixedCosts + variableCosts, 0.01);
  const fixedWidth = Math.min(Math.max((fixedCosts / total) * WIDTH, 2), WIDTH);
  const variableWidth = WIDTH - fixedWidth;

  return (
    <figure className="my-1">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${fixedLabel}: ${fixedFormatted}, ${variableLabel}: ${variableFormatted}`}
          className="h-auto w-full text-current"
          style={{ minWidth: 260 }}
        >
          <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
          <rect x={0} y={0} width={fixedWidth} height={BAR_HEIGHT} rx={6} className="fill-zinc-500 dark:fill-zinc-500" />
          <rect x={fixedWidth} y={0} width={variableWidth} height={BAR_HEIGHT} rx={6} className="fill-purple-600 dark:fill-purple-400" />
          {fixedWidth > 50 && (
            <text x={10} y={BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} className="fill-white">
              {fixedFormatted}
            </text>
          )}
          {variableWidth > 50 && (
            <text x={fixedWidth + variableWidth / 2} y={BAR_HEIGHT / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-white">
              {variableFormatted}
            </text>
          )}

          <text x={0} y={BAR_HEIGHT + 16} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {fixedLabel}
          </text>
          <text x={WIDTH} y={BAR_HEIGHT + 16} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {variableLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
