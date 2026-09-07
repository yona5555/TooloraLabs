type MolarityVariablesDiagramProps = {
  solved: string;
  labels: Record<string, string>;
  order: string[];
  caption: string;
};

/**
 * A row of the relevant quantities for the active mode (n, M, V for
 * concentration; C1, V1, C2, V2 for dilution) with the one currently being
 * solved for highlighted.
 */
export default function MolarityVariablesDiagram({ solved, labels, order, caption }: MolarityVariablesDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center gap-2 overflow-x-auto">
        {order.map((key) => (
          <div
            key={key}
            className={`flex h-14 w-16 flex-col items-center justify-center rounded-xl border text-xs font-bold ${
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
