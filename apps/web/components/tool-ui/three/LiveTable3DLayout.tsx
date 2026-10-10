import type { ReactNode } from "react";

export type LiveTableRow = {
  label: string;
  /** Formula with the current numbers substituted, e.g. "V = 3 × 4 × 5". */
  formula?: string;
  value: string;
  unit?: string;
  emphasize?: boolean;
};

export type LiveTableGroup = { title: string; rows: LiveTableRow[] };

type Props = {
  groups: LiveTableGroup[];
  /** Column headings: [quantity, formula, value]. */
  headings: [string, string, string];
  /** The live 3D drawing (usually a <Scene3D>). */
  drawing: ReactNode;
  /** Short hint under the drawing, e.g. "Drag to rotate". */
  hint?: string;
  className?: string;
};

/**
 * Site rule (visuals.md): drawing cards are two parts — deep live table on
 * the left, live 3D drawing on the right, same height, no gaps. Narrow
 * containers (mobile, the above-the-fold Result column) stack the drawing
 * on top via a container query. No forced dir, so RTL mirrors naturally.
 */
export default function LiveTable3DLayout({
  groups,
  headings,
  drawing,
  hint,
  className = "",
}: Props) {
  return (
    <div className={`@container ${className}`}>
      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2 @3xl:items-stretch">
        <div className="max-h-[520px] min-w-0 overflow-auto rounded-xl @3xl:max-h-none border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800">
              <tr className="border-b border-zinc-200 text-xs tracking-wide text-zinc-500 uppercase dark:border-zinc-700 dark:text-zinc-400">
                {headings.map((h, i) => (
                  <th
                    key={i}
                    className={`px-3 py-2 font-semibold ${i === 2 ? "text-end" : "text-start"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g, gi) => (
              <tbody key={gi}>
                <tr>
                  <th
                    colSpan={3}
                    className="bg-blue-50 px-3 py-1.5 text-start text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                  >
                    {g.title}
                  </th>
                </tr>
                {g.rows.map((r, ri) => (
                  <tr
                    key={ri}
                    className="border-t border-zinc-100 dark:border-zinc-700/60"
                  >
                    <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">
                      {r.label}
                    </td>
                    <td
                      dir="ltr"
                      className="px-3 py-1.5 text-start font-mono text-xs text-zinc-500 [overflow-wrap:anywhere] dark:text-zinc-400"
                    >
                      {r.formula ?? ""}
                    </td>
                    <td
                      dir="ltr"
                      className={`px-3 py-1.5 text-end font-mono font-semibold [overflow-wrap:break-word] ${r.emphasize ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}
                    >
                      {r.value}
                      {r.unit ? (
                        <span className="ms-1 text-xs font-normal whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                          {r.unit}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <div className="order-first flex h-[320px] flex-col @3xl:order-none @3xl:h-auto @3xl:min-h-[320px]">
          <div className="min-h-0 flex-1">{drawing}</div>
          {hint ? (
            <p className="mt-1 text-center text-xs text-zinc-400 dark:text-zinc-500">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
