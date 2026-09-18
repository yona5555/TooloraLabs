type BreakEvenFixedCostAdditionDiagramProps = {
  beforeLabel: string;
  afterLabel: string;
  caption: string;
};

const WIDTH = 300;
const BOX_W = 100;
const BOX_H = 54;
const GAP = 40;

export default function BreakEvenFixedCostAdditionDiagram({ beforeLabel, afterLabel, caption }: BreakEvenFixedCostAdditionDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${BOX_H + 20}`} role="img" aria-label={`${beforeLabel} → ${afterLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          <rect x={0} y={10} width={BOX_W} height={BOX_H} rx={8} className="fill-fuchsia-50 stroke-fuchsia-400 dark:fill-fuchsia-500/10 dark:stroke-fuchsia-400/60" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={10 + BOX_H / 2 - 8} textAnchor="middle" fontSize={9} className="fill-fuchsia-600 dark:fill-fuchsia-400">
            {beforeLabel}
          </text>
          <text x={BOX_W / 2} y={10 + BOX_H / 2 + 10} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-fuchsia-700 dark:fill-fuchsia-300">
            334 units
          </text>

          <text x={BOX_W + GAP / 2} y={10 + BOX_H / 2 - 6} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
            +$2,000
          </text>
          <text x={BOX_W + GAP / 2} y={10 + BOX_H / 2 + 10} textAnchor="middle" fontSize={16} className="fill-zinc-400 dark:fill-zinc-500">
            →
          </text>

          <rect x={BOX_W + GAP} y={10} width={BOX_W + 20} height={BOX_H} rx={8} className="fill-fuchsia-500 dark:fill-fuchsia-400" />
          <text x={BOX_W + GAP + (BOX_W + 20) / 2} y={10 + BOX_H / 2 - 8} textAnchor="middle" fontSize={9} fill="white">
            {afterLabel}
          </text>
          <text x={BOX_W + GAP + (BOX_W + 20) / 2} y={10 + BOX_H / 2 + 10} textAnchor="middle" fontSize={13} fontWeight={700} fill="white">
            400 units
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
