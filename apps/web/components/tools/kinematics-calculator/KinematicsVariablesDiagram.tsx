type KinematicsVariablesDiagramProps = {
  solved: string;
  labels: Record<string, string>;
  values: Record<string, string>;
  order: string[];
  caption: string;
};

/**
 * A row of the five SUVAT quantities (v0, v, a, t, dx) with the one
 * currently being solved for highlighted, and each box showing the live
 * value currently entered (or "?" for the one being solved for) — not just
 * the bare symbol — so the diagram updates as the visitor types.
 */
export default function KinematicsVariablesDiagram({ solved, labels, values, order, caption }: KinematicsVariablesDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center gap-2 overflow-x-auto">
        {order.map((key) => (
          <div
            key={key}
            className={`flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-bold transition-transform duration-200 hover:scale-105 ${
              key === solved
                ? "border-blue-500 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            <span className="opacity-80">{labels[key]}</span>
            <span className="text-[10px] font-mono font-normal opacity-90">{values[key]}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
