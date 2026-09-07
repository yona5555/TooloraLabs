type PhVariablesDiagramProps = {
  solved: string;
  labels: Record<string, string>;
  caption: string;
};

const ORDER = ["fromPH", "fromH", "fromPOH", "fromOH"];

/**
 * A row of the four equivalent ways to express acidity (pH, [H+], pOH,
 * [OH-]) with the one currently supplied by the active tab highlighted —
 * this tool converts freely between all four, not just solving one unknown.
 */
export default function PhVariablesDiagram({ solved, labels, caption }: PhVariablesDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center gap-2 overflow-x-auto">
        {ORDER.map((key) => (
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
