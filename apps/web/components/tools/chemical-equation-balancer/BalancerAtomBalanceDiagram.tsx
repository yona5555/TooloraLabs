type BalancerAtomBalanceDiagramProps = {
  rows: { element: string; reactantCount: number; productCount: number }[];
  caption: string;
};

const MAX_BAR_WIDTH = 90;

/**
 * A live per-element bar comparison: for each element in the balanced
 * equation, a bar for the total atom count on the reactant side and a bar
 * for the product side — equal length on both sides is exactly what
 * "balanced" means, made visible rather than just asserted.
 */
export default function BalancerAtomBalanceDiagram({ rows, caption }: BalancerAtomBalanceDiagramProps) {
  const maxCount = Math.max(1, ...rows.map((r) => Math.max(r.reactantCount, r.productCount)));

  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto flex max-w-sm flex-col gap-2">
        {rows.map((row) => (
          <div key={row.element} className="flex items-center gap-2 text-xs">
            <span className="w-8 shrink-0 text-end font-mono font-semibold text-zinc-600 dark:text-zinc-300">{row.element}</span>
            <div className="flex flex-1 justify-end">
              <div className="h-3 rounded-l bg-blue-500/70" style={{ width: `${(row.reactantCount / maxCount) * MAX_BAR_WIDTH}px` }} />
            </div>
            <span className="w-5 text-center font-mono text-zinc-500 dark:text-zinc-400">{row.reactantCount}</span>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <span className="w-5 text-center font-mono text-zinc-500 dark:text-zinc-400">{row.productCount}</span>
            <div className="flex flex-1">
              <div className="h-3 rounded-r bg-emerald-500/70" style={{ width: `${(row.productCount / maxCount) * MAX_BAR_WIDTH}px` }} />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
