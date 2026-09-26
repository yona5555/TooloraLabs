type InventoryRisingPriceEffectDiagramProps = {
  fifoLabel: string;
  lifoLabel: string;
  fifoTraits: string[];
  lifoTraits: string[];
  caption: string;
};

/**
 * Plain HTML two-column comparison cards — matches
 * BreakEvenBusinessTypeDiagram's pattern exactly (grid-cols-2 cards, each
 * with a bullet trait list). The previous version was two bordered SVG
 * rects side by side with hand-wrapped <tspan> text — the same class of
 * bug Break-Even's own diagram already replaced for this exact reason.
 */
export default function InventoryRisingPriceEffectDiagram({ fifoLabel, lifoLabel, fifoTraits, lifoTraits, caption }: InventoryRisingPriceEffectDiagramProps) {
  return (
    <figure className="my-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{fifoLabel}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-rose-700 dark:text-rose-300">
            {fifoTraits.map((trait) => (
              <li key={trait}>• {trait}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-400 bg-rose-100 p-4 dark:border-rose-400/60 dark:bg-rose-500/20">
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">{lifoLabel}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-rose-800 dark:text-rose-200">
            {lifoTraits.map((trait) => (
              <li key={trait}>• {trait}</li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
