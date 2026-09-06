type BalancerEquationStructureDiagramProps = {
  reactantCount: number;
  productCount: number;
  reactantsLabel: string;
  productsLabel: string;
  caption: string;
};

const MAX_BOXES = 4;

/**
 * A live count of how many reactant and product terms the current equation
 * text contains (a cheap regex split, not a full chemical parse), shown as
 * boxes on either side of a reaction arrow — updates on every keystroke,
 * even before the equation is balanced or valid.
 */
export default function BalancerEquationStructureDiagram({ reactantCount, productCount, reactantsLabel, productsLabel, caption }: BalancerEquationStructureDiagramProps) {
  const reactants = Math.max(0, Math.min(MAX_BOXES, reactantCount));
  const products = Math.max(0, Math.min(MAX_BOXES, productCount));

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {Array.from({ length: reactants || 1 }, (_, i) => (
              <div key={i} className={`h-8 w-8 rounded-lg border-2 ${reactantCount > 0 ? "border-blue-500 bg-blue-500/15" : "border-dashed border-zinc-300 dark:border-zinc-700"}`} />
            ))}
          </div>
          <span className="text-lg text-zinc-400 dark:text-zinc-500">→</span>
          <div className="flex gap-1.5">
            {Array.from({ length: products || 1 }, (_, i) => (
              <div key={i} className={`h-8 w-8 rounded-lg border-2 ${productCount > 0 ? "border-emerald-500 bg-emerald-500/15" : "border-dashed border-zinc-300 dark:border-zinc-700"}`} />
            ))}
          </div>
        </div>
        <div className="flex gap-8 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{reactantsLabel}</span>
          <span>{productsLabel}</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
