"use client";
import SectionCard from "@/components/tool-ui/SectionCard";

export type QuickExample = { id: string; label: string; detail: string };

type Props = {
  title: string;
  examples: QuickExample[];
  activeId?: string | null;
  onPick: (id: string) => void;
  className?: string;
};

/**
 * Fills the space under a short input card with real content (visuals.md column fill): preset
 * buttons that load a worked example into the tool's inputs. The list grows (`flex-1`) with the
 * column height instead of leaving an empty band.
 */
export default function QuickExamplesCard({ title, examples, activeId, onPick, className = "" }: Props) {
  return (
    <SectionCard title={title} className={`flex flex-col ${className}`} bodyClassName="flex flex-1 flex-col p-4 lg:p-5">
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
              <span dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{ex.detail}</span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
