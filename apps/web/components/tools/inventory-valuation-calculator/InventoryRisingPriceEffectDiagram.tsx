type InventoryRisingPriceEffectDiagramProps = {
  fifoLabel: string;
  lifoLabel: string;
  fifoTraits: string[];
  lifoTraits: string[];
  caption: string;
};

const WIDTH = 300;
const BOX_W = 134;
const BOX_GAP = 16;

export default function InventoryRisingPriceEffectDiagram({ fifoLabel, lifoLabel, fifoTraits, lifoTraits, caption }: InventoryRisingPriceEffectDiagramProps) {
  const rowH = 15;
  const boxH = 40 + Math.max(fifoTraits.length, lifoTraits.length) * rowH;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${boxH + 12}`} role="img" aria-label={`${fifoLabel} vs ${lifoLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          <rect x={0} y={0} width={BOX_W} height={boxH} rx={8} className="fill-rose-50 stroke-rose-400 dark:fill-rose-500/10 dark:stroke-rose-400/60" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-rose-700 dark:fill-rose-300">
            {fifoLabel}
          </text>
          {fifoTraits.map((tItem, i) => (
            <text key={tItem} x={12} y={38 + i * rowH} fontSize={8.5} className="fill-rose-700 dark:fill-rose-300">
              • {tItem}
            </text>
          ))}

          <rect x={BOX_W + BOX_GAP} y={0} width={BOX_W} height={boxH} rx={8} className="fill-rose-100 stroke-rose-600 dark:fill-rose-500/20 dark:stroke-rose-400" strokeWidth={1.5} />
          <text x={BOX_W + BOX_GAP + BOX_W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-rose-800 dark:fill-rose-200">
            {lifoLabel}
          </text>
          {lifoTraits.map((tItem, i) => (
            <text key={tItem} x={BOX_W + BOX_GAP + 12} y={38 + i * rowH} fontSize={8.5} className="fill-rose-800 dark:fill-rose-200">
              • {tItem}
            </text>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
