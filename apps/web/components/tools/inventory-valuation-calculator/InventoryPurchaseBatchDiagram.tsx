type Batch = { key: string; label: string; qty: number; unitCost: number };

type InventoryPurchaseBatchDiagramProps = {
  batches: Batch[];
  fifoLabel: string;
  lifoLabel: string;
  title: string;
};

/**
 * Plain HTML vertical stack of purchase batches — no bordered boxes, no
 * arrow glyphs. Which end each method reads first is stated as plain text
 * next to that end of the stack instead of a directional arrow icon.
 */
export default function InventoryPurchaseBatchDiagram({ batches, fifoLabel, lifoLabel, title }: InventoryPurchaseBatchDiagramProps) {
  return (
    <div>
      <p className="text-center text-xs font-bold text-teal-600 dark:text-teal-400">{fifoLabel}</p>
      <div className="mx-auto mt-1.5 flex max-w-xs flex-col gap-1.5" role="img" aria-label={title}>
        {batches.map((batch, i) => {
          const opacity = 0.55 + (i / Math.max(batches.length - 1, 1)) * 0.45;
          return (
            <div key={batch.key} className="flex items-center justify-between rounded-lg bg-teal-500 px-3 py-2.5 text-xs font-semibold text-white dark:bg-teal-400" style={{ opacity }}>
              <span>{batch.label}</span>
              <span dir="ltr">
                {batch.qty} × ${batch.unitCost.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-center text-xs font-bold text-teal-800 dark:text-teal-200">{lifoLabel}</p>
    </div>
  );
}
