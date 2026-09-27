import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

/**
 * Shared building blocks for any "repeated item entry" input form (product
 * rows, invoice line items, purchase batches, etc.) — see TooloraLabs
 * instructions §33.
 *
 * Root cause this fixes: these panels always render inside a fixed
 * ~320-360px above-the-fold column, even on a full desktop viewport (three
 * columns share the row). A field grid built with a viewport breakpoint
 * (`sm:grid-cols-[2fr_1fr_1fr_auto]`) activates its multi-column layout
 * based on the *viewport* being wide, not the *column* — so on desktop the
 * columns kick in for a card that never actually has the room, crushing
 * every field into a sliver and wrapping every label/value/date segment.
 * `ItemFieldsGrid` uses `repeat(auto-fit, minmax(Npx, 1fr))` instead: columns
 * collapse to one automatically whenever the actual container is too
 * narrow, regardless of viewport size — the layout responds to its own
 * width, not the screen's.
 */

type ItemFieldsGridProps = {
  children: ReactNode;
  minFieldWidth?: number;
  className?: string;
};

export function ItemFieldsGrid({ children, minFieldWidth = 110, className = "" }: ItemFieldsGridProps) {
  return (
    <div className={`grid gap-2.5 ${className}`} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minFieldWidth}px, 1fr))` }}>
      {children}
    </div>
  );
}

type RemoveRowButtonProps = {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function RemoveRowButton({ onClick, label, disabled, size = "md" }: RemoveRowButtonProps) {
  const dim = size === "md" ? "h-12 w-12" : "h-10 w-10";
  const iconSize = size === "md" ? 18 : 16;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`flex ${dim} shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800`}
    >
      <Trash2 size={iconSize} />
    </button>
  );
}

type AddRowButtonProps = {
  onClick: () => void;
  label: string;
  fullWidth?: boolean;
};

export function AddRowButton({ onClick, label, fullWidth = true }: AddRowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-blue-500/10 ${fullWidth ? "w-full" : ""}`}
    >
      <Plus size={16} />
      {label}
    </button>
  );
}

type HierarchicalItemCardProps = {
  identity: ReactNode;
  onRemove: () => void;
  removeLabel: string;
  removeDisabled?: boolean;
  children?: ReactNode;
};

/**
 * Level 1 (identity) + level 2 (this item's own fields, passed as children
 * via `ItemFieldsGrid`) + optional level 3 (nested sub-items, passed as
 * children via `NestedItemSection`). The identity field owns its own
 * full-width row so it never competes for space with the item's fields.
 */
export function HierarchicalItemCard({ identity, onRemove, removeLabel, removeDisabled, children }: HierarchicalItemCardProps) {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800/60">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">{identity}</div>
        <RemoveRowButton onClick={onRemove} label={removeLabel} disabled={removeDisabled} />
      </div>
      {children}
    </div>
  );
}

type NestedItemSectionProps = {
  title: string;
  children: ReactNode;
};

/** Level 3: a visually distinct titled sub-card for a nested list within one item (e.g. purchase batches within an inventory item). */
export function NestedItemSection({ title, children }: NestedItemSectionProps) {
  return (
    <div className="space-y-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40">
      <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{title}</p>
      {children}
    </div>
  );
}
