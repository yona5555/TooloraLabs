type Bar = { key: string; label: string; value: number };

type SalesTaxWorkedExamplesBarProps = {
  bars: Bar[];
  caption: string;
  title: string;
};

const WIDTH = 320;
const ROW_H = 30;
const ROW_GAP = 8;
const LABEL_W = 90;

export default function SalesTaxWorkedExamplesBar({ bars, caption, title }: SalesTaxWorkedExamplesBarProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const trackW = WIDTH - LABEL_W - 48;
  const height = bars.length * (ROW_H + ROW_GAP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
          {bars.map((b, i) => {
            const y = i * (ROW_H + ROW_GAP);
            const w = (b.value / max) * trackW;
            return (
              <g key={b.key}>
                <text x={0} y={y + ROW_H / 2 + 4} fontSize={9} className="fill-zinc-600 dark:fill-zinc-300">
                  {b.label}
                </text>
                <rect x={LABEL_W} y={y + 4} width={trackW} height={ROW_H - 8} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
                <rect x={LABEL_W} y={y + 4} width={w} height={ROW_H - 8} rx={4} className="fill-emerald-500 dark:fill-emerald-400" />
                <text x={LABEL_W + w + 6} y={y + ROW_H / 2 + 4} fontSize={10} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
                  ${b.value.toFixed(2)}
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
