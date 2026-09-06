type PercentGridDiagramProps = {
  percent: number;
  caption: string;
};

const COLS = 10;
const ROWS = 10;
const CELL = 20;
const GAP = 2;
const WIDTH = COLS * (CELL + GAP) - GAP;
const HEIGHT = ROWS * (CELL + GAP) - GAP;

export default function PercentGridDiagram({ percent, caption }: PercentGridDiagramProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const cells = Array.from({ length: 100 }, (_, i) => i < clamped);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-56 text-current" style={{ minWidth: 200 }}>
          {cells.map((filled, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const x = col * (CELL + GAP);
            const y = row * (CELL + GAP);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={2}
                className={filled ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-100 dark:fill-zinc-800"}
              />
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
