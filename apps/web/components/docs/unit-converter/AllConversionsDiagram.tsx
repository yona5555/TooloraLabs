type Row = { label: string; value: string };

type Props = {
  rows: Row[];
  caption: string;
};

/**
 * The allConversions output is one input value expressed in every unit of its
 * category at once — a magnitude bar chart would misleadingly suggest one
 * unit is "bigger" than another, when they're the same real-world quantity.
 * A plain equivalence list represents that fan-out honestly instead.
 */
export default function AllConversionsDiagram({ rows, caption }: Props) {
  return (
    <figure className="my-2">
      <div className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{row.label}</span>
            <span dir="ltr" className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
