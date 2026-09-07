type BalancerMatrixDiagramProps = {
  caption: string;
  cornerLabel: string;
};

const ELEMENTS = ["Fe", "O"];
const TERM_LABELS = ["Fe", "O₂", "Fe₂O₃"];
const CELLS = [
  [1, 0, -2],
  [0, 2, -3],
];

/**
 * A small illustrative version of the element-by-term coefficient matrix
 * the balancer actually solves internally (reactant columns positive,
 * product columns negative) — the "matrix method" generalizes far beyond
 * trial and error for equations too complex to balance by inspection.
 */
export default function BalancerMatrixDiagram({ caption, cornerLabel }: BalancerMatrixDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <table className="border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="border border-zinc-300 px-3 py-1.5 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">{cornerLabel}</th>
              {TERM_LABELS.map((label) => (
                <th key={label} className="border border-zinc-300 px-3 py-1.5 font-mono font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ELEMENTS.map((element, r) => (
              <tr key={element}>
                <td className="border border-zinc-300 px-3 py-1.5 font-mono font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">{element}</td>
                {CELLS[r].map((value, c) => (
                  <td key={c} className="border border-zinc-300 px-3 py-1.5 font-mono text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
