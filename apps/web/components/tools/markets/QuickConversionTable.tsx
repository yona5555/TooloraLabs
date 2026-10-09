/** The 1-2-5 series between two powers of ten (e.g. 0.01, 0.02, 0.05, 0.1 … 1,000,000). */
export function quickAmounts(minExp: number, maxExp: number): number[] {
  const out: number[] = [];
  for (let e = minExp; e <= maxExp; e++) for (const m of [1, 2, 5]) out.push(Number((m * 10 ** e).toPrecision(1)));
  return out;
}

type QuickConversionTableProps = {
  title: string;
  /** Three column headings (codes/symbols, shown LTR). */
  columns: [string, string, string];
  /** One row per reference amount: the amount, its conversion, and its value in the display currency. */
  rows: [string, string, string][];
};

/**
 * Common amounts converted at the current rate, placed under the input form so the input column
 * carries real content all the way down. The table is laid out absolutely inside a growing box: it
 * never adds to the column's natural height (only `min-h` does), and when ToolAboveFold stretches the
 * input card to the result column's height, more rows simply come into view.
 */
export default function QuickConversionTable({ title, columns, rows }: QuickConversionTableProps) {
  return (
    <div className="mt-5 flex flex-1 flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <div className="relative mt-2 min-h-44 flex-1 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
        <table className="absolute inset-x-0 top-0 w-full text-xs" data-testid="quick-table">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th dir="ltr" className="px-2 py-1.5 text-start font-medium uppercase">{columns[0]}</th>
              <th dir="ltr" className="px-2 py-1.5 text-end font-medium uppercase">{columns[1]}</th>
              <th dir="ltr" className="px-2 py-1.5 text-end font-medium">{columns[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a} className="border-t border-zinc-100 even:bg-zinc-50/60 dark:border-zinc-800 dark:even:bg-zinc-800/30">
                <td dir="ltr" className="px-2 py-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">{a}</td>
                <td dir="ltr" className="px-2 py-1 text-end font-mono text-blue-700 dark:text-blue-300">{b}</td>
                <td dir="ltr" className="px-2 py-1 text-end font-mono text-zinc-700 dark:text-zinc-300">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
