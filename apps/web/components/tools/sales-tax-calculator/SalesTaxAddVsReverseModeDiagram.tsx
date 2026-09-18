type SalesTaxAddVsReverseModeDiagramProps = {
  addModeLabel: string;
  reverseModeLabel: string;
  priceLabel: string;
  totalLabel: string;
  caption: string;
};

const WIDTH = 320;
const BOX_W = 92;
const BOX_H = 40;
const GAP = 26;
const ROW_GAP = 30;

export default function SalesTaxAddVsReverseModeDiagram({ addModeLabel, reverseModeLabel, priceLabel, totalLabel, caption }: SalesTaxAddVsReverseModeDiagramProps) {
  const height = BOX_H * 2 + ROW_GAP + 24;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`${addModeLabel} / ${reverseModeLabel}`} className="h-auto w-full" style={{ minWidth: 300 }}>
          <text x={0} y={12} fontSize={10} fontWeight={700} className="fill-teal-600 dark:fill-teal-400">
            {addModeLabel}
          </text>
          <rect x={0} y={20} width={BOX_W} height={BOX_H} rx={6} className="fill-teal-50 stroke-teal-400 dark:fill-teal-500/10 dark:stroke-teal-400/60" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={20 + BOX_H / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-teal-700 dark:fill-teal-300">
            {priceLabel}
          </text>
          <text x={BOX_W + GAP / 2} y={20 + BOX_H / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-400 dark:fill-zinc-500">
            ×(1+r)
          </text>
          <text x={BOX_W + GAP + 10} y={20 + BOX_H / 2 - 6} fontSize={12} className="fill-zinc-400 dark:fill-zinc-500">
            →
          </text>
          <rect x={BOX_W + GAP + 26} y={20} width={BOX_W} height={BOX_H} rx={6} className="fill-teal-100 stroke-teal-600 dark:fill-teal-500/20 dark:stroke-teal-400" strokeWidth={1.5} />
          <text x={BOX_W + GAP + 26 + BOX_W / 2} y={20 + BOX_H / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-teal-800 dark:fill-teal-200">
            {totalLabel}
          </text>

          <text x={0} y={20 + BOX_H + ROW_GAP - 10} fontSize={10} fontWeight={700} className="fill-sky-600 dark:fill-sky-400">
            {reverseModeLabel}
          </text>
          <rect x={0} y={BOX_H + ROW_GAP} width={BOX_W} height={BOX_H} rx={6} className="fill-sky-100 stroke-sky-600 dark:fill-sky-500/20 dark:stroke-sky-400" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={BOX_H + ROW_GAP + BOX_H / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-sky-800 dark:fill-sky-200">
            {totalLabel}
          </text>
          <text x={BOX_W + GAP / 2} y={BOX_H + ROW_GAP + BOX_H / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-400 dark:fill-zinc-500">
            ÷(1+r)
          </text>
          <text x={BOX_W + GAP + 10} y={BOX_H + ROW_GAP + BOX_H / 2 - 6} fontSize={12} className="fill-zinc-400 dark:fill-zinc-500">
            →
          </text>
          <rect x={BOX_W + GAP + 26} y={BOX_H + ROW_GAP} width={BOX_W} height={BOX_H} rx={6} className="fill-sky-50 stroke-sky-400 dark:fill-sky-500/10 dark:stroke-sky-400/60" strokeWidth={1.5} />
          <text x={BOX_W + GAP + 26 + BOX_W / 2} y={BOX_H + ROW_GAP + BOX_H / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-sky-700 dark:fill-sky-300">
            {priceLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
