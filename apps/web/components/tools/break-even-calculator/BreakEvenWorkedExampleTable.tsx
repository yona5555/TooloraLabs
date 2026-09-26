export type WorkedExampleBadge = { text: string; kind: "loss" | "breakeven" | "profit" | "highlight" };
export type WorkedExampleRow = (string | WorkedExampleBadge)[];

type Props = {
  columns: string[];
  rows: WorkedExampleRow[];
  caption: string;
};

const BADGE_CLASSES: Record<WorkedExampleBadge["kind"], string> = {
  loss: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  breakeven: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  profit: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  highlight: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
};

function isBadge(cell: string | WorkedExampleBadge): cell is WorkedExampleBadge {
  return typeof cell === "object";
}

/**
 * A single, reusable real-HTML table used everywhere a banned line+point
 * chart or two-box+arrow diagram used to sit in this tool (the main result
 * panel, the price-sensitivity diagram, the fixed-cost-accumulation
 * diagram, the monthly-pace diagram, the fixed-cost-addition diagram).
 * Every caller passes genuinely computed rows — from the live calculator
 * inputs where the panel is client-side (BreakEvenChart,
 * BreakEvenSensitivityDiagram), or from this file's own shared $10,000/$20/
 * $50 reference scenario for the static education section — never
 * hardcoded example numbers disconnected from real arithmetic. A real table
 * has no line, no point, no box, no arrow to be a disguised version of the
 * banned pattern.
 */
export default function BreakEvenWorkedExampleTable({ columns, rows, caption }: Props) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-start font-semibold text-zinc-600 dark:text-zinc-300">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                {row.map((cell, j) =>
                  isBadge(cell) ? (
                    <td key={j} className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE_CLASSES[cell.kind]}`}>{cell.text}</span>
                    </td>
                  ) : (
                    <td key={j} className="px-3 py-2.5 font-mono">
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
