type BreakEvenBusinessTypeDiagramProps = {
  softwareLabel: string;
  lowMarginLabel: string;
  softwareTraits: string[];
  lowMarginTraits: string[];
  caption: string;
};

const WIDTH = 300;
const BOX_W = 134;
const BOX_GAP = 16;

export default function BreakEvenBusinessTypeDiagram({ softwareLabel, lowMarginLabel, softwareTraits, lowMarginTraits, caption }: BreakEvenBusinessTypeDiagramProps) {
  const rowH = 15;
  const boxH = 40 + Math.max(softwareTraits.length, lowMarginTraits.length) * rowH;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${boxH + 12}`} role="img" aria-label={`${softwareLabel} vs ${lowMarginLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          <rect x={0} y={0} width={BOX_W} height={boxH} rx={8} className="fill-violet-50 stroke-violet-400 dark:fill-violet-500/10 dark:stroke-violet-400/60" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={20} textAnchor="middle" fontSize={10.5} fontWeight={700} className="fill-violet-700 dark:fill-violet-300">
            {softwareLabel}
          </text>
          {softwareTraits.map((tItem, i) => (
            <text key={tItem} x={12} y={38 + i * rowH} fontSize={8.5} className="fill-violet-700 dark:fill-violet-300">
              • {tItem}
            </text>
          ))}

          <rect x={BOX_W + BOX_GAP} y={0} width={BOX_W} height={boxH} rx={8} className="fill-violet-100 stroke-violet-600 dark:fill-violet-500/20 dark:stroke-violet-400" strokeWidth={1.5} />
          <text x={BOX_W + BOX_GAP + BOX_W / 2} y={20} textAnchor="middle" fontSize={10.5} fontWeight={700} className="fill-violet-800 dark:fill-violet-200">
            {lowMarginLabel}
          </text>
          {lowMarginTraits.map((tItem, i) => (
            <text key={tItem} x={BOX_W + BOX_GAP + 12} y={38 + i * rowH} fontSize={8.5} className="fill-violet-800 dark:fill-violet-200">
              • {tItem}
            </text>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
