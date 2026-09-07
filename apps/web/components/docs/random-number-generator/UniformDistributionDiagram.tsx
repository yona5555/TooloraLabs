type UniformDistributionDiagramProps = {
  min: number;
  max: number;
  bandLabel: string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 90;
const MARGIN = { top: 10, right: 16, bottom: 30, left: 16 };
const BAR_HEIGHT = 32;

export default function UniformDistributionDiagram({ min, max, bandLabel, caption }: UniformDistributionDiagramProps) {
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <rect x={MARGIN.left} y={MARGIN.top} width={plotWidth} height={BAR_HEIGHT} rx={4} className="fill-blue-500/30 dark:fill-blue-400/30" stroke="currentColor" strokeWidth={1} />
          {Array.from({ length: 9 }, (_, i) => {
            const x = MARGIN.left + ((i + 1) / 10) * plotWidth;
            return <line key={i} x1={x} y1={MARGIN.top} x2={x} y2={MARGIN.top + BAR_HEIGHT} stroke="currentColor" strokeWidth={0.5} opacity={0.3} />;
          })}
          <text x={MARGIN.left} y={MARGIN.top + BAR_HEIGHT + 16} fontSize={11} fontWeight={700} fill="currentColor">
            {min}
          </text>
          <text x={WIDTH - MARGIN.right} y={MARGIN.top + BAR_HEIGHT + 16} textAnchor="end" fontSize={11} fontWeight={700} fill="currentColor">
            {max}
          </text>
          <text x={WIDTH / 2} y={MARGIN.top + BAR_HEIGHT / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
            {bandLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
