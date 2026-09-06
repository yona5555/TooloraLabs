type FractionBarModelDiagramProps = {
  numerator: number;
  denominator: number;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 48;

export default function FractionBarModelDiagram({ numerator, denominator, caption }: FractionBarModelDiagramProps) {
  const safeDenominator = Math.max(Math.round(Math.abs(denominator)), 1);
  const safeNumerator = Math.max(Math.min(Math.round(Math.abs(numerator)), safeDenominator), 0);
  const segmentWidth = WIDTH / safeDenominator;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          {Array.from({ length: safeDenominator }, (_, i) => {
            const x = i * segmentWidth;
            const filled = i < safeNumerator;
            return (
              <rect
                key={i}
                x={x + 1}
                y={4}
                width={segmentWidth - 2}
                height={HEIGHT - 8}
                rx={3}
                className={filled ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-100 dark:fill-zinc-800"}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.2}
              />
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
