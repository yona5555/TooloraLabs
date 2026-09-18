type Batch = { key: string; label: string; qty: number; unitCost: number };

type InventoryPurchaseBatchDiagramProps = {
  batches: Batch[];
  fifoLabel: string;
  lifoLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 260;
const BATCH_H = 44;
const GAP = 8;

export default function InventoryPurchaseBatchDiagram({ batches, fifoLabel, lifoLabel, caption, title }: InventoryPurchaseBatchDiagramProps) {
  const height = batches.length * (BATCH_H + GAP) + 20;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="mx-auto block h-auto" style={{ width: 260 }}>
          <text x={40} y={12} fontSize={8} fontWeight={700} className="fill-teal-600 dark:fill-teal-400">
            ↓ {fifoLabel}
          </text>
          <text x={WIDTH - 40} y={12} textAnchor="end" fontSize={8} fontWeight={700} className="fill-teal-800 dark:fill-teal-200">
            {lifoLabel} ↑
          </text>
          {batches.map((batch, i) => {
            const y = 18 + i * (BATCH_H + GAP);
            const opacity = 0.35 + (i / Math.max(batches.length - 1, 1)) * 0.5;
            return (
              <g key={batch.key}>
                <rect x={20} y={y} width={WIDTH - 40} height={BATCH_H} rx={6} className="fill-teal-500 dark:fill-teal-400" style={{ opacity }} />
                <text x={WIDTH / 2} y={y + BATCH_H / 2 - 4} textAnchor="middle" fontSize={9} fontWeight={700} fill="white">
                  {batch.label}
                </text>
                <text x={WIDTH / 2} y={y + BATCH_H / 2 + 10} textAnchor="middle" fontSize={8} fill="white">
                  {batch.qty} × ${batch.unitCost.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
