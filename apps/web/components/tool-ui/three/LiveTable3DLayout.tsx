"use client";
import { createContext, useContext, type ReactNode } from "react";

import { hasWords as isWords, MixedText, Subs } from "../MixedText";

const FillContext = createContext(false);

/**
 * Wrap a Live3D block in this inside a column that is stretched to the
 * above-the-fold row height (ToolAboveFold `stretchResult`): at lg+ the table
 * then takes all the height left under the drawing and shows more rows,
 * instead of the card ending early (§27 column fill). The wrapping element
 * must itself be an `lg:flex lg:flex-1 lg:flex-col` box.
 */
export function LiveTableFill({ children }: { children: ReactNode }) {
  return <FillContext.Provider value>{children}</FillContext.Provider>;
}

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
  /**
   * Words that describe the drawing (translated, page direction). 3D labels hold only symbols,
   * numbers and units — canvas text cannot shape Arabic reliably — so any words go here.
   */
  caption?: ReactNode;
  className?: string;
  /**
   * Side-by-side (@3xl) only: cap the table at 600px and scroll it inside, so a very deep table
   * does not stretch the drawing into a tall, mostly empty strip. The drawing matches that height.
   */
  capHeight?: boolean;
};

/**
 * Site rule (visuals.md): drawing cards are two parts — deep live table on
 * the left, live 3D drawing on the right, same height, no gaps. Narrow
 * containers stack via a container query: the drawing on top in the desktop
 * Result column, under the table on phones (the values come first there).
 * No forced dir, so RTL mirrors naturally.
 */
export default function LiveTable3DLayout({
  groups,
  headings,
  drawing,
  hint,
  caption,
  className = "",
  capHeight = false,
}: Props) {
  // Fill mode only ever runs in the narrow Result column (the page is max-w-6xl,
  // so that column never reaches @3xl); the table box is taken out of flow so
  // its row count never pushes the row taller, it just fills what is left (never
  // shorter than the usual 520px cap, so the card only ever gains rows).
  const fill = useContext(FillContext);
  return (
    <div data-split="lt3d" className={`@container ${fill ? "lg:flex lg:flex-1 lg:flex-col" : ""} ${className}`}>
      <div className={`grid grid-cols-1 gap-4 @3xl:grid-cols-2 @3xl:items-stretch ${fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}`}>
        <div data-part="table" className={fill ? "min-w-0 lg:relative lg:min-h-[520px] lg:flex-1" : "min-w-0"}>
        <div className={`max-h-[520px] min-w-0 overflow-auto rounded-xl ${capHeight ? "@3xl:max-h-[600px]" : "@3xl:max-h-none"} border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40 ${fill ? "lg:absolute lg:inset-0 lg:max-h-none" : "h-full"}`}>
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
                      <Subs text={r.label} />
                    </td>
                    <td
                      // A word (e.g. Arabic "given") keeps the sans font; only formulas use mono.
                      dir={isWords(r.formula) ? "auto" : "ltr"}
                      className={`px-3 py-1.5 text-start ${isWords(r.formula) ? "" : "font-mono"} text-xs text-zinc-500 lg:[overflow-wrap:anywhere] dark:text-zinc-400`}
                    >
                      {isWords(r.formula) ? <MixedText text={r.formula ?? ""} /> : <Subs text={r.formula ?? ""} />}
                    </td>
                    <td
                      // Words (e.g. an Arabic verdict) keep a proportional font: monospace breaks Arabic letter joining.
                      dir={isWords(r.value) ? "auto" : "ltr"}
                      className={`px-3 py-1.5 text-end ${isWords(r.value) ? "" : "font-mono"} font-semibold [overflow-wrap:break-word] ${r.emphasize ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}
                    >
                      {/* its own box: the value stays whole, the unit may go to the next line */}
                      <span>
                        <Subs text={r.value} />
                      </span>
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
        </div>
        <div data-part="drawing" className="flex h-[320px] flex-col lg:max-@3xl:order-first @3xl:h-auto @3xl:min-h-[320px]">
          <div data-preview="visual" className="min-h-0 flex-1">{drawing}</div>
          {caption ? (
            <p className="mt-1.5 text-center text-xs leading-5 text-zinc-600 dark:text-zinc-300">{caption}</p>
          ) : null}
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
