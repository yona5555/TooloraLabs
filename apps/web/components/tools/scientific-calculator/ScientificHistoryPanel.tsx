"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useValueFlash, usePrefersReducedMotion } from "@/components/tool-ui/glass/GlassPrimitives";
import "@/components/tool-ui/glass/glass-tokens.css";
import { formatResult } from "./formatResult";
import type { HistoryEntry } from "./reducer";

type ScientificHistoryPanelProps = {
  history: HistoryEntry[];
  onSelect: (value: number) => void;
  onDelete: (id: number) => void;
};

/** Decimal-safe sum of every finite result currently listed -- a non-finite entry (shouldn't
 * exist today since errors never reach history, but defensive per §42) is skipped rather than
 * poisoning the total with NaN. Routed back through the calculator's own formatResult so
 * 0.1+0.2 reads "0.3", not a raw float, exactly like every other number this tool ever shows. */
function sumHistory(entries: HistoryEntry[]): number | null {
  const finite = entries.map((e) => e.result).filter((r) => Number.isFinite(r));
  if (finite.length === 0) return null;
  // toPrecision-based rounding per term keeps 0.1+0.2-style binary noise out of the running sum.
  const total = finite.reduce((acc, r) => acc + r, 0);
  return total;
}

export default function ScientificHistoryPanel({ history, onSelect, onDelete }: ScientificHistoryPanelProps) {
  const t = useTranslations("tools.scientific-calculator.history");
  const total = sumHistory(history);
  const { flashing, trigger } = useValueFlash();
  const prevTotalRef = useRef(total);
  const reducedMotion = usePrefersReducedMotion();
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  // §42.3: flashes on ANY total change, whether it came from this card's own delete button or
  // from a new row the calculator just pushed -- the total itself is what's being watched here,
  // not just this card's own control, since "updates live" covers both directions.
  useEffect(() => {
    if (prevTotalRef.current !== total) {
      trigger();
      prevTotalRef.current = total;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // §Rule 41/general polish: the row collapses (max-height + opacity transition) before the
  // actual delete fires, so the page never jumps -- instant (duration 0) under reduced motion.
  function handleDelete(id: number) {
    if (reducedMotion) {
      onDelete(id);
      return;
    }
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onDelete(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  }

  return (
    <SectionCard title={t("title")}>
      {/* §A: natural height, never stretched -- empty is a compact one-line card; with rows, the
          card grows with them up to ~6 rows' worth, then the LIST (not the card) scrolls with
          the total row always pinned visible below it. The Unit Circle card below is the one
          that absorbs whatever height this leaves in the column (ScientificCalculator.tsx
          measures the calculator and gives the column that total height; History no longer
          reserves a fixed slot of its own). */}
      {history.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <ul className="max-h-[280px] space-y-1.5 overflow-y-auto">
            {history.map((entry) => {
              const isRemoving = removingIds.has(entry.id);
              return (
              <li
                key={entry.id}
                className="flex items-center gap-2 overflow-hidden transition-all duration-200 ease-out"
                style={{ maxHeight: isRemoving ? 0 : 80, opacity: isRemoving ? 0 : 1, marginBottom: isRemoving ? 0 : undefined }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(entry.result)}
                  onKeyDown={(e) => {
                    if (e.key === "Delete" || e.key === "Backspace") {
                      e.preventDefault();
                      handleDelete(entry.id);
                    }
                  }}
                  className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-xl border border-zinc-200 px-3 py-2 text-start transition hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
                >
                  <span dir="ltr" style={{ unicodeBidi: "isolate" }} className="w-full truncate text-xs text-zinc-500 dark:text-zinc-400">{entry.expression}</span>
                  <span dir="ltr" style={{ unicodeBidi: "isolate" }} className="w-full truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatResult(entry.result)}
                  </span>
                </button>
                {/* §38: a round delete control, never a square -- always visible (not hover-only,
                    so touch users can reach it), 44px target, keyboard-deletable via its own
                    Enter/Space activation or Delete/Backspace while the row button has focus. */}
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  aria-label={t("deleteEntry", { expression: entry.expression })}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </li>
              );
            })}
          </ul>

          {total !== null && (
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 font-mono text-sm font-bold ${flashing ? "glass-value-flash" : ""}`}
              style={{ background: "var(--glass-key-row-bg)", color: "var(--glass-key-row-text)" }}
            >
              <span>{t("total")}</span>
              <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{formatResult(total)}</span>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
