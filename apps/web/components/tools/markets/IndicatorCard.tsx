import type { ReactNode } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

type IndicatorCardProps = {
  id: string;
  title: string;
  heading: string;
  intro: string;
  /** Optional controls row between the intro and the indicator (e.g. a period toggle). */
  controls?: ReactNode;
  /** The indicator itself; replaced by `fallback` when its data isn't available. */
  children: ReactNode;
  fallback?: ReactNode;
  worked: { title: string; rows: Row[] } | null;
};

/**
 * §32 layout for one market indicator: its own blue-header SectionCard, an h3 + intro, and the
 * WORKED EXAMPLE table beside the indicator (stacked under it only on narrow screens).
 */
export default function IndicatorCard({ id, title, heading, intro, controls, children, fallback, worked }: IndicatorCardProps) {
  return (
    <SectionCard id={id} title={title}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{heading}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{intro}</p>
      {controls && <div className="mt-3">{controls}</div>}
      {fallback ?? (
        // Container query, not viewport: the same card sits in the narrow result column and full width.
        <div className="@container mt-4">
          <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center">
            <div className="min-w-0 flex-1">{children}</div>
            {worked && (
              <div className="@3xl:w-80 @3xl:shrink-0">
                <WorkedExampleNote title={worked.title} rows={worked.rows} />
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/** A row of pill buttons for switching an indicator's period or shift. */
export function PillGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format = String,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-medium ${
            value === o ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}
