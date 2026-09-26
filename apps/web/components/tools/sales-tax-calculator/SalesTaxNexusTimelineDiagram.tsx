type SalesTaxNexusTimelineDiagramProps = {
  quillLabel: string;
  quillYear: string;
  wayfairLabel: string;
  wayfairYear: string;
  physicalLabel: string;
  economicLabel: string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 112;
const LINE_Y = 50;
const LABEL_W = 140;

export default function SalesTaxNexusTimelineDiagram({
  quillLabel,
  quillYear,
  wayfairLabel,
  wayfairYear,
  physicalLabel,
  economicLabel,
  caption,
}: SalesTaxNexusTimelineDiagramProps) {
  const midX = WIDTH * 0.55;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${quillLabel} / ${wayfairLabel}`} className="h-auto w-full" style={{ minWidth: 300 }}>
          <line x1={10} y1={LINE_Y} x2={WIDTH - 10} y2={LINE_Y} stroke="currentColor" strokeWidth={2} opacity={0.2} />
          <line x1={10} y1={LINE_Y} x2={midX} y2={LINE_Y} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={3} />
          <line x1={midX} y1={LINE_Y} x2={WIDTH - 10} y2={LINE_Y} className="stroke-fuchsia-500 dark:stroke-fuchsia-400" strokeWidth={3} />

          <circle cx={10} cy={LINE_Y} r={5} className="fill-zinc-400 dark:fill-zinc-500" />
          <text x={10} y={LINE_Y - 12} textAnchor="start" fontSize={9} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
            {quillYear}
          </text>
          <foreignObject x={0} y={LINE_Y + 10} width={LABEL_W} height={HEIGHT - LINE_Y - 10}>
            <div dir="ltr" className="text-[8px] leading-tight text-zinc-500 dark:text-zinc-400">
              {quillLabel}
              <div className="mt-0.5 font-bold text-zinc-600 dark:text-zinc-300">{physicalLabel}</div>
            </div>
          </foreignObject>

          <circle cx={midX} cy={LINE_Y} r={6} className="fill-fuchsia-500 dark:fill-fuchsia-400" />
          <text x={midX + 8} y={LINE_Y - 12} textAnchor="start" fontSize={9} fontWeight={700} className="fill-fuchsia-600 dark:fill-fuchsia-400">
            {wayfairYear}
          </text>
          <foreignObject x={midX + 8} y={LINE_Y + 10} width={WIDTH - midX - 8} height={HEIGHT - LINE_Y - 10}>
            <div dir="ltr" className="text-[8px] leading-tight text-zinc-500 dark:text-zinc-400">
              {wayfairLabel}
              <div className="mt-0.5 font-bold text-fuchsia-700 dark:text-fuchsia-300">{economicLabel}</div>
            </div>
          </foreignObject>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
