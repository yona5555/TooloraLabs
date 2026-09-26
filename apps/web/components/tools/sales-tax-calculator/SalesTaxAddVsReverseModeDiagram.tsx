type SalesTaxAddVsReverseModeDiagramProps = {
  addModeLabel: string;
  reverseModeLabel: string;
  caption: string;
};

const PRICE = 100;
const RATE = 0.08;
const TOTAL = PRICE * (1 + RATE);

/**
 * Previously two rows of bordered boxes connected by ×(1+r)/÷(1+r) operator
 * symbols and arrows — the banned "boxes linked by an arithmetic symbol"
 * pattern. Replaced with a plain two-row worked-example table: the formula
 * lives as ordinary text inside one cell, not as a glyph floating between
 * two separately-bordered shapes.
 */
export default function SalesTaxAddVsReverseModeDiagram({ addModeLabel, reverseModeLabel, caption }: SalesTaxAddVsReverseModeDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-teal-700 dark:text-teal-300">{addModeLabel}</dt>
            <dd className="mt-0.5 font-mono text-zinc-700 dark:text-zinc-200">
              ${PRICE.toFixed(2)} × {(1 + RATE).toFixed(2)} = <span className="font-bold text-teal-700 dark:text-teal-300">${TOTAL.toFixed(2)}</span>
            </dd>
          </div>
          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
            <dt className="font-semibold text-sky-700 dark:text-sky-300">{reverseModeLabel}</dt>
            <dd className="mt-0.5 font-mono text-zinc-700 dark:text-zinc-200">
              ${TOTAL.toFixed(2)} ÷ {(1 + RATE).toFixed(2)} = <span className="font-bold text-sky-700 dark:text-sky-300">${PRICE.toFixed(2)}</span>
            </dd>
          </div>
        </dl>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
