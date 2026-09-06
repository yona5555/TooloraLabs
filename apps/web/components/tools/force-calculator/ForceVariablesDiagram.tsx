type ForceVariablesDiagramProps = {
  solved: string;
  labels: Record<string, string>;
  order: string[];
  caption: string;
};

/**
 * A row of the relevant quantities for the active mode (F, m, a for
 * Newton's second law; F, m1, m2, d for gravitation) with the one currently
 * being solved for highlighted.
 */
export default function ForceVariablesDiagram({ solved, labels, order, caption }: ForceVariablesDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center gap-2 overflow-x-auto">
        {order.map((key) => (
          <div
            key={key}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border text-xs font-bold ${
              key === solved
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {labels[key]}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
