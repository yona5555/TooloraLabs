type InvoiceRunningTotalWaterfallProps = {
  stages: { label: string; value: number }[];
  formatValue: (value: number) => string;
  caption: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 26;
const ROW_GAP = 18;

export default function InvoiceRunningTotalWaterfall({ stages, formatValue, caption }: InvoiceRunningTotalWaterfallProps) {
  const maxValue = Math.max(...stages.map((s) => s.value), 0.01);
  const height = stages.length * (BAR_HEIGHT + ROW_GAP) - ROW_GAP + 4;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          {stages.map((stage, i) => {
            const y = i * (BAR_HEIGHT + ROW_GAP);
            const width = Math.max((stage.value / maxValue) * WIDTH, 2);
            return (
              <g key={i}>
                <rect x={0} y={y} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
                <rect x={0} y={y} width={width} height={BAR_HEIGHT} rx={4} className={i === stages.length - 1 ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-400 dark:fill-zinc-600"} />
                <text x={8} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} className="fill-white">
                  {stage.label}
                </text>
                <text x={WIDTH - 8} y={y + BAR_HEIGHT / 2 + 4} textAnchor="end" fontSize={11} fontWeight={700} className="fill-white">
                  {formatValue(stage.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
