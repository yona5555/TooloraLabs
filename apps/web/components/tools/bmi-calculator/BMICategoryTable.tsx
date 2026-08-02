type CategoryRow = {
  category: string;
  range: string;
};

const ROW_COLORS = [
  "#1d4ed8", // severe thinness
  "#3b82f6", // moderate thinness
  "#93c5fd", // mild thinness
  "#22c55e", // normal
  "#f59e0b", // overweight
  "#f87171", // obese I
  "#ef4444", // obese II
  "#b91c1c", // obese III
];

export default function BMICategoryTable({ rows }: { rows: CategoryRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      {rows.map((row, index) => (
        <div
          key={row.category}
          className={`flex items-center justify-between gap-4 bg-white px-5 py-3.5 dark:bg-zinc-900 ${
            index !== 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""
          }`}
        >
          <span className="flex items-center gap-3 font-medium text-zinc-900 dark:text-zinc-100">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: ROW_COLORS[index % ROW_COLORS.length] }}
            />
            {row.category}
          </span>
          <span dir="ltr" className="shrink-0 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {row.range}
          </span>
        </div>
      ))}
    </div>
  );
}
