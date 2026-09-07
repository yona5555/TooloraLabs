import SectionCard from "./SectionCard";

export type ReferenceTableRow = {
  key: string;
  label: string;
  value: string;
  tag?: { text: string; colorClass: string };
};

type ReferenceTableCardProps = {
  title: string;
  caption?: string;
  columnLabel: string;
  columnValue: string;
  rows: ReferenceTableRow[];
};

/**
 * Fills the visual gap left below Calculate/Clear in the input column on
 * tools whose result column runs taller (see ToolAboveFold's height-mismatch
 * handling) with a real, documented reference table tied to the tool's own
 * subject matter — never left as blank stretched space.
 */
export default function ReferenceTableCard({ title, caption, columnLabel, columnValue, rows }: ReferenceTableCardProps) {
  return (
    <SectionCard title={title}>
      {caption && <p className="text-sm text-zinc-600 dark:text-zinc-300">{caption}</p>}
      <div dir="ltr" className={`overflow-x-auto ${caption ? "mt-3" : ""}`}>
        <table className="w-full min-w-[260px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-start dark:border-zinc-700">
              <th className="px-2 py-1.5 text-start font-semibold">{columnLabel}</th>
              <th className="px-2 py-1.5 text-start font-semibold">{columnValue}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-zinc-100 dark:border-zinc-800/60">
                <td className="px-2 py-1.5 font-medium text-zinc-800 dark:text-zinc-100">{row.label}</td>
                <td className="px-2 py-1.5 font-mono text-zinc-700 dark:text-zinc-300">
                  {row.value}
                  {row.tag && <span className={`ms-2 rounded-full px-2 py-0.5 text-xs font-medium ${row.tag.colorClass}`}>{row.tag.text}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
