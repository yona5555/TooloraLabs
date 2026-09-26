type Row = { label: string; value: string; emphasize?: boolean; note?: string };

type Props = {
  title: string;
  rows: Row[];
};

/** Matches the other tools' *WorkedExampleNote components exactly — the site-wide reference for the label/value list beside a chart. */
export default function SalesTaxWorkedExampleNote({ title, rows }: Props) {
  return (
    <div className="min-w-[200px] flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
      <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{title}</p>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((row, i) => (
          <div key={i}>
            <div className={`flex items-baseline justify-between gap-3 ${row.emphasize ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""}`}>
              <dt className="text-zinc-500 dark:text-zinc-400">{row.label}</dt>
              <dd dir="ltr" className={`font-mono font-semibold ${row.emphasize ? "text-base text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}>
                {row.value}
              </dd>
            </div>
            {row.note && <p className="text-end text-xs text-zinc-400 dark:text-zinc-500">{row.note}</p>}
          </div>
        ))}
      </dl>
    </div>
  );
}
