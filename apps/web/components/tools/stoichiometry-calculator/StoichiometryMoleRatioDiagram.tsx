type StoichiometryMoleRatioDiagramProps = {
  caption: string;
};

const UNIT_PX = 16;

/**
 * A fixed illustrative scaling comparison: 1 mole of a known substance
 * consistently produces 2 moles of a target substance when the balanced
 * equation's coefficients are 1 and 2 — the mole ratio scales any amount
 * of the known substance by that same fixed factor, shown here for two
 * different starting amounts.
 */
export default function StoichiometryMoleRatioDiagram({ caption }: StoichiometryMoleRatioDiagramProps) {
  const rows = [
    { label: "1 mol A", moles: 1, color: "bg-blue-500/70" },
    { label: "2 mol B", moles: 2, color: "bg-emerald-500/70" },
    { label: "3 mol A", moles: 3, color: "bg-blue-500/70" },
    { label: "6 mol B", moles: 6, color: "bg-emerald-500/70" },
  ];

  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto flex max-w-xs flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-end text-xs font-mono text-zinc-500 dark:text-zinc-400">{row.label}</span>
            <div className={`h-4 rounded ${row.color}`} style={{ width: `${row.moles * UNIT_PX}px` }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
