type MethodBar = { key: string; label: string; value: number; colorClass: string };

type InventoryThreeMethodCompareBarProps = {
  bars: MethodBar[];
  caption: string;
  title: string;
};

const WIDTH = 300;
const ROW_H = 30;
const ROW_GAP = 10;
const LABEL_W = 100;

export default function InventoryThreeMethodCompareBar({ bars, caption, title }: InventoryThreeMethodCompareBarProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const trackW = WIDTH - LABEL_W - 46;
  const height = bars.length * (ROW_H + ROW_GAP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 280 }}>
          {bars.map((b, i) => {
            const y = i * (ROW_H + ROW_GAP);
            const w = (b.value / max) * trackW;
            return (
              <g key={b.key}>
                <text x={0} y={y + ROW_H / 2 + 4} fontSize={9} className="fill-zinc-600 dark:fill-zinc-300">
                  {b.label}
                </text>
                <rect x={LABEL_W} y={y + 4} width={trackW} height={ROW_H - 8} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
                <rect x={LABEL_W} y={y + 4} width={w} height={ROW_H - 8} rx={4} className={b.colorClass} />
                <text x={LABEL_W + w + 6} y={y + ROW_H / 2 + 4} fontSize={10} fontWeight={700} className="fill-violet-700 dark:fill-violet-300">
                  ${b.value}
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
