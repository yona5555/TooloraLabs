export type VariableRow = { symbol: string; meaning: string; unit: string };

type Props = {
  rows: VariableRow[];
  columnSymbol: string;
  columnMeaning: string;
  columnUnit: string;
};

export default function VariablesTable({ rows, columnSymbol, columnMeaning, columnUnit }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-start dark:border-zinc-800 dark:bg-zinc-900/60">
            <th className="px-4 py-2.5 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnSymbol}</th>
            <th className="px-4 py-2.5 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnMeaning}</th>
            <th className="px-4 py-2.5 text-start font-semibold text-zinc-600 dark:text-zinc-300">{columnUnit}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/60">
              <td dir="ltr" className="px-4 py-2.5 text-start font-mono font-semibold text-blue-600 dark:text-blue-400">
                {row.symbol}
              </td>
              <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-200">{row.meaning}</td>
              <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
