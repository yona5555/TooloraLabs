type Row = { label: string; value: string; emphasize?: boolean; note?: string };

type Props = {
  title: string;
  rows: Row[];
};

/**
 * The site-wide reference for the label/value list that sits directly beside a chart (never
 * below it) — matches `BreakEvenWorkedExampleNote`/`FuelWorkedExampleNote`/
 * `TriangleWorkedExampleNote` exactly. Those three predate this shared version (each tool had
 * its own copy); this one is for every tool built after it, so the pattern isn't re-duplicated
 * per tool going forward. No `dir="ltr"` on the row itself, only on the value cell, so RTL
 * locales keep the label at the line-start and the value at the line-end instead of
 * mirror-inverting the whole row.
 */
export default function WorkedExampleNote({ title, rows }: Props) {
  return (
    <div className="min-w-[200px] flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{title}</p>
      <div className="mt-3 space-y-2 text-sm">
        {rows.map((row, i) => (
          <div key={i}>
            <dl
              className={`flex flex-wrap items-baseline justify-between gap-x-3 lg:flex-nowrap lg:gap-3 ${
                row.emphasize ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""
              }`}
            >
              <dt className="text-zinc-500 dark:text-zinc-400">{row.label}</dt>
              <dd
                dir="ltr"
                className={`ms-auto max-w-full font-mono font-semibold lg:ms-0 ${
                  row.emphasize ? "text-base text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"
                }`}
              >
                {row.value}
              </dd>
            </dl>
            {row.note && <p className="text-end text-xs text-zinc-400 dark:text-zinc-500">{row.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
