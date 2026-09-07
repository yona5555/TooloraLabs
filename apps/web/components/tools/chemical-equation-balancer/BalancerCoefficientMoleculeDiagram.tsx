type BalancerCoefficientMoleculeDiagramProps = {
  formula: string;
  count: number;
  caption: string;
};

/**
 * A fixed illustration of what a coefficient actually means: "2 H2O" is not
 * a single doubled molecule, it is two separate, identical molecules —
 * shown here as repeated icons rather than a single scaled-up one.
 */
export default function BalancerCoefficientMoleculeDiagram({ formula, count, caption }: BalancerCoefficientMoleculeDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex h-12 w-14 items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-500/15 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
            {formula}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
