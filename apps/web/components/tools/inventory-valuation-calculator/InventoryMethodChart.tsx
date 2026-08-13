type InventoryMethodChartProps = {
  fifo: number;
  lifo: number;
  weightedAverage: number;
  fifoLabel: string;
  lifoLabel: string;
  weightedAverageLabel: string;
  chartLabel: string;
  formatValue: (value: number) => string;
};

const WIDTH = 320;
const BAR_HEIGHT = 26;
const GAP = 14;
const PAD = 6;
const LABEL_W = 86;

export default function InventoryMethodChart({
  fifo,
  lifo,
  weightedAverage,
  fifoLabel,
  lifoLabel,
  weightedAverageLabel,
  chartLabel,
  formatValue,
}: InventoryMethodChartProps) {
  const rows = [
    { label: fifoLabel, value: fifo },
    { label: lifoLabel, value: lifo },
    { label: weightedAverageLabel, value: weightedAverage },
  ];
  const max = Math.max(fifo, lifo, weightedAverage, 1);
  const barAreaW = WIDTH - LABEL_W - PAD * 2;
  const height = PAD * 2 + rows.length * (BAR_HEIGHT + GAP) - GAP;

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={chartLabel}
        className="h-auto w-full text-current"
        style={{ minWidth: 280 }}
      >
        {rows.map((row, i) => {
          const y = PAD + i * (BAR_HEIGHT + GAP);
          const w = (row.value / max) * barAreaW;
          return (
            <g key={row.label}>
              <text x={0} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fill="currentColor">
                {row.label}
              </text>
              <rect x={LABEL_W} y={y} width={barAreaW} height={BAR_HEIGHT} fill="currentColor" opacity={0.08} rx={4} />
              <rect x={LABEL_W} y={y} width={w} height={BAR_HEIGHT} fill="currentColor" opacity={0.75} rx={4} />
              <text
                x={LABEL_W + barAreaW - 4}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fontWeight={700}
                fill="currentColor"
                style={{ unicodeBidi: "bidi-override", direction: "ltr" }}
              >
                {formatValue(row.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
