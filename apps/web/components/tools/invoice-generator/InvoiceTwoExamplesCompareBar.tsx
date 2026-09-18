type ExampleBar = { key: string; label: string; taxable: number; tax: number };

type InvoiceTwoExamplesCompareBarProps = {
  examples: ExampleBar[];
  title: string;
  taxLabel: string;
  caption: string;
};

const WIDTH = 300;
const ROW_H = 34;
const ROW_GAP = 14;
const LABEL_W = 110;

export default function InvoiceTwoExamplesCompareBar({ examples, title, taxLabel, caption }: InvoiceTwoExamplesCompareBarProps) {
  const max = Math.max(...examples.map((e) => e.taxable + e.tax), 1);
  const trackW = WIDTH - LABEL_W - 10;
  const height = examples.length * (ROW_H + ROW_GAP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 280 }}>
          {examples.map((ex, i) => {
            const y = i * (ROW_H + ROW_GAP);
            const total = ex.taxable + ex.tax;
            const taxableW = (ex.taxable / max) * trackW;
            const taxW = (ex.tax / max) * trackW;
            return (
              <g key={ex.key}>
                <text x={0} y={y + ROW_H / 2 - 2} fontSize={9} className="fill-zinc-600 dark:fill-zinc-300">
                  {ex.label}
                </text>
                <rect x={LABEL_W} y={y} width={taxableW} height={ROW_H - 10} rx={3} className="fill-violet-500 dark:fill-violet-400" />
                <rect x={LABEL_W + taxableW} y={y} width={taxW} height={ROW_H - 10} rx={3} className="fill-violet-300 dark:fill-violet-600" />
                <text x={LABEL_W + taxableW + taxW + 6} y={y + (ROW_H - 10) / 2 + 4} fontSize={10} fontWeight={700} className="fill-violet-700 dark:fill-violet-300">
                  ${total.toFixed(2)}
                </text>
              </g>
            );
          })}
          <text x={LABEL_W} y={height - 2} fontSize={8} className="fill-zinc-400 dark:fill-zinc-500">
            {taxLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
