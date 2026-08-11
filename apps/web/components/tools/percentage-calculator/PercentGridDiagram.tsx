type PercentGridDiagramProps = {
  shaded: number;
  caption: string;
};

const COLS = 10;
const ROWS = 10;
const CELL = 18;
const GAP = 2;
const STEP = CELL + GAP;
const WIDTH = COLS * STEP - GAP;
const HEIGHT = ROWS * STEP - GAP;

export default function PercentGridDiagram({ shaded, caption }: PercentGridDiagramProps) {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-56 text-current">
          {cells.map((i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const x = col * STEP;
            const y = row * STEP;
            const isShaded = i < shaded;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={2}
                fill={isShaded ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1}
                opacity={isShaded ? 0.85 : 0.35}
              />
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
