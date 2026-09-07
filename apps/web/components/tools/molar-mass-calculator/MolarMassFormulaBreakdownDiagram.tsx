type MolarMassFormulaBreakdownDiagramProps = {
  elements: { symbol: string; count: number }[];
  caption: string;
};

const MAX_ELEMENTS = 6;

/**
 * A live element-count breakdown parsed straight from the current formula
 * text — updates on every keystroke, even before the formula is confirmed
 * valid, since a partial formula still yields a partial element list.
 */
export default function MolarMassFormulaBreakdownDiagram({ elements, caption }: MolarMassFormulaBreakdownDiagramProps) {
  const shown = elements.slice(0, MAX_ELEMENTS);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-wrap justify-center gap-2">
        {shown.length > 0 ? (
          shown.map((el) => (
            <div key={el.symbol} className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-500/10 font-mono text-blue-700 dark:text-blue-300">
              <span className="text-sm font-bold">{el.symbol}</span>
              <span className="text-[10px]">×{el.count}</span>
            </div>
          ))
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">?</div>
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
