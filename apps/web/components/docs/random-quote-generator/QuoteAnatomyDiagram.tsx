type Field = { label: string; value: string; colorClass: string };

type Props = {
  fields: Field[];
  caption: string;
};

/**
 * A quote result isn't a number to plot — it's four labeled fields pulled
 * off one record (text, author, source, category). This shows that shape
 * directly instead of forcing it into a chart built for magnitudes.
 */
export default function QuoteAnatomyDiagram({ fields, caption }: Props) {
  return (
    <figure className="my-2">
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        {fields.map((field) => (
          <div key={field.label} className="flex items-start gap-3">
            <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${field.colorClass}`} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{field.label}</p>
              <p className="truncate text-sm text-zinc-700 dark:text-zinc-200">{field.value}</p>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
