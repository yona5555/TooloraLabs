"use client";
import { Fragment } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";

export type QuickExample = { id: string; label: string; detail: string };

type Props = {
  title: string;
  examples: QuickExample[];
  activeId?: string | null;
  onPick: (id: string) => void;
  className?: string;
  /** Forwarded to the internal SectionCard — see its own doc comment. Opt-in, defaults false. */
  mobilePlain?: boolean;
  /**
   * Opt-in (2026-10-23, surface-area-calculator pilot only — every other caller is unaffected
   * since this defaults to false): below 768px, the whole card becomes a collapsed native
   * <details> (closed by default, same 44px "+" row as "About the tool"), instead of always
   * showing all example buttons expanded. md and up render exactly as the normal SectionCard.
   */
  mobileCollapsible?: boolean;
};

/**
 * An example's inputs as whole pieces, so a narrow card wraps the line between pieces and never
 * inside a value: groups split at " · ", and a long group (a data list) after each comma.
 */
function DetailPieces({ text }: { text: string }) {
  return text.split(" · ").map((group, i) => (
    <Fragment key={i}>
      {i > 0 && " · "}
      {(group.length > 24 ? group.split(/(?<=,) /) : [group]).map((piece, j) => (
        <Fragment key={j}>
          {j > 0 && " "}
          <span>{piece}</span>
        </Fragment>
      ))}
    </Fragment>
  ));
}

/**
 * Fills the space under a short input card with real content (visuals.md column fill): preset
 * buttons that load a worked example into the tool's inputs. The list grows (`flex-1`) with the
 * column height instead of leaving an empty band.
 */
export default function QuickExamplesCard({ title, examples, activeId, onPick, className = "", mobilePlain = false, mobileCollapsible = false }: Props) {
  const grid = (
    <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-2">
      {examples.map((ex) => {
        const active = ex.id === activeId;
        return (
          <button
            key={ex.id}
            type="button"
            onClick={() => onPick(ex.id)}
            aria-pressed={active}
            className={`flex flex-col items-start justify-center rounded-xl border px-3 py-2 text-start transition ${
              active
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/15"
                : "border-zinc-200 bg-zinc-50 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-blue-500/50"
            }`}
          >
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{ex.label}</span>
            <span dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              <DetailPieces text={ex.detail} />
            </span>
          </button>
        );
      })}
    </div>
  );

  if (mobileCollapsible) {
    return (
      <>
        <details className="group rounded-lg border border-zinc-200 md:hidden dark:border-zinc-800">
          <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-[12px] font-semibold tracking-wider text-zinc-500 uppercase marker:content-none dark:text-zinc-400">
            {title}
            <span aria-hidden="true" className="text-base leading-none text-zinc-400 group-open:hidden">
              +
            </span>
          </summary>
          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">{grid}</div>
        </details>
        <div className={`hidden flex-col md:flex ${className}`}>
          <SectionCard title={title} bodyClassName="flex flex-1 flex-col p-4 lg:p-5">
            {grid}
          </SectionCard>
        </div>
      </>
    );
  }

  return (
    <SectionCard
      title={title}
      className={`flex flex-col ${className}`}
      bodyClassName={mobilePlain ? "flex flex-1 flex-col max-md:p-[11px] md:p-4 lg:p-5" : "flex flex-1 flex-col p-4 lg:p-5"}
      mobilePlain={mobilePlain}
    >
      {grid}
    </SectionCard>
  );
}
