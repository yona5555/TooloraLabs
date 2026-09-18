type InventoryLowStockThresholdDiagramProps = {
  currentLabel: string;
  thresholdLabel: string;
  caption: string;
};

const WIDTH = 280;
const HEIGHT = 72;
const LINE_Y = 36;
const MAX_UNITS = 20;
const CURRENT_UNITS = 8;
const THRESHOLD_UNITS = 10;

export default function InventoryLowStockThresholdDiagram({ currentLabel, thresholdLabel, caption }: InventoryLowStockThresholdDiagramProps) {
  const scaleX = (units: number) => 20 + (units / MAX_UNITS) * (WIDTH - 40);
  const currentX = scaleX(CURRENT_UNITS);
  const thresholdX = scaleX(THRESHOLD_UNITS);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${currentLabel} / ${thresholdLabel}`} className="h-auto w-full" style={{ minWidth: 260 }}>
          <line x1={20} y1={LINE_Y} x2={WIDTH - 20} y2={LINE_Y} stroke="currentColor" strokeWidth={2} opacity={0.2} />
          <rect x={20} y={LINE_Y - 1} width={thresholdX - 20} height={2} className="fill-rose-400 dark:fill-rose-400/70" opacity={0.6} />

          <line x1={thresholdX} y1={LINE_Y - 10} x2={thresholdX} y2={LINE_Y + 10} className="stroke-cyan-600 dark:stroke-cyan-400" strokeWidth={2} strokeDasharray="3 2" />
          <text x={thresholdX} y={LINE_Y - 16} textAnchor="middle" fontSize={8.5} fontWeight={700} className="fill-cyan-700 dark:fill-cyan-300">
            {thresholdLabel} (10)
          </text>

          <circle cx={currentX} cy={LINE_Y} r={6} className="fill-cyan-500 dark:fill-cyan-400" />
          <text x={currentX} y={LINE_Y + 22} textAnchor="middle" fontSize={8.5} fontWeight={700} className="fill-cyan-700 dark:fill-cyan-300">
            {currentLabel} (8)
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
