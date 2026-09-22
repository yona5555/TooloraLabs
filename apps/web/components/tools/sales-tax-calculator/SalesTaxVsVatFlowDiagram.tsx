type SalesTaxVsVatFlowDiagramProps = {
  title: string;
  salesTaxLabel: string;
  vatLabel: string;
  stageLabel: string;
  taxHereLabel: string;
  noTaxLabel: string;
  caption: string;
  /** When true, the stage sequence is laid out right-to-left (stage 1 on the
   * right) and the connecting arrows point left, matching RTL reading order
   * instead of forcing an LTR-looking flow inside an Arabic page. */
  isRtl?: boolean;
};

const WIDTH = 340;
const STAGE_W = 84;
const STAGE_GAP = 14;
const ROW_H = 46;
const ROW_GAP = 34;
const STAGE_COUNT = 3;

export default function SalesTaxVsVatFlowDiagram({
  title,
  salesTaxLabel,
  vatLabel,
  stageLabel,
  taxHereLabel,
  noTaxLabel,
  caption,
  isRtl = false,
}: SalesTaxVsVatFlowDiagramProps) {
  const height = ROW_H * 2 + ROW_GAP + 24;
  const arrow = isRtl ? "←" : "→";

  // Physical slot j (always left-to-right on screen) shows logical stage
  // `stageAt(j)`. In RTL, stage 1 sits in the rightmost slot so the sequence
  // still reads first-to-last in the page's natural reading direction.
  function stageAt(slot: number) {
    return isRtl ? STAGE_COUNT - 1 - slot : slot;
  }

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
          <text x={0} y={12} fontSize={10} fontWeight={700} className="fill-indigo-600 dark:fill-indigo-400">
            {salesTaxLabel}
          </text>
          {Array.from({ length: STAGE_COUNT }, (_, slot) => {
            const x = slot * (STAGE_W + STAGE_GAP);
            const stage = stageAt(slot);
            const isLast = stage === STAGE_COUNT - 1;
            return (
              <g key={`st-${slot}`}>
                <rect x={x} y={20} width={STAGE_W} height={ROW_H} rx={6} className={isLast ? "fill-indigo-100 stroke-indigo-500 dark:fill-indigo-500/20 dark:stroke-indigo-400" : "fill-zinc-50 stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600"} strokeWidth={1.5} />
                <text x={x + STAGE_W / 2} y={20 + ROW_H / 2 - 3} textAnchor="middle" fontSize={9} className="fill-zinc-600 dark:fill-zinc-300">
                  {stageLabel} {stage + 1}
                </text>
                <text x={x + STAGE_W / 2} y={20 + ROW_H / 2 + 12} textAnchor="middle" fontSize={9} fontWeight={700} className={isLast ? "fill-indigo-700 dark:fill-indigo-300" : "fill-zinc-400 dark:fill-zinc-500"}>
                  {isLast ? taxHereLabel : noTaxLabel}
                </text>
                {slot < STAGE_COUNT - 1 && (
                  <text x={x + STAGE_W + STAGE_GAP / 2} y={20 + ROW_H / 2 + 4} textAnchor="middle" fontSize={12} className="fill-zinc-400 dark:fill-zinc-500">
                    {arrow}
                  </text>
                )}
              </g>
            );
          })}

          <text x={0} y={ROW_H + ROW_GAP - 8} fontSize={10} fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
            {vatLabel}
          </text>
          {Array.from({ length: STAGE_COUNT }, (_, slot) => {
            const x = slot * (STAGE_W + STAGE_GAP);
            const y = ROW_H + ROW_GAP;
            const stage = stageAt(slot);
            return (
              <g key={`vat-${slot}`}>
                <rect x={x} y={y} width={STAGE_W} height={ROW_H} rx={6} className="fill-rose-50 stroke-rose-400 dark:fill-rose-500/10 dark:stroke-rose-400/60" strokeWidth={1.5} />
                <text x={x + STAGE_W / 2} y={y + ROW_H / 2 - 3} textAnchor="middle" fontSize={9} className="fill-zinc-600 dark:fill-zinc-300">
                  {stageLabel} {stage + 1}
                </text>
                <text x={x + STAGE_W / 2} y={y + ROW_H / 2 + 12} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
                  {taxHereLabel}
                </text>
                {slot < STAGE_COUNT - 1 && (
                  <text x={x + STAGE_W + STAGE_GAP / 2} y={y + ROW_H / 2 + 4} textAnchor="middle" fontSize={12} className="fill-zinc-400 dark:fill-zinc-500">
                    {arrow}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
