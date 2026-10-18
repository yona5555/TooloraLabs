"use client";
import type { ReactNode } from "react";
import { useGapFreeSplit, type GapLayout } from "./useGapFreeSplit";

// Remedies applied from the outside, so each tool's own drawing and worked-example note stay as
// they are: the first child is the drawing part, the last child the table part (its <dl> rows).
const LAYOUT: Record<GapLayout, string> = {
  side: "flex flex-col gap-6 lg:flex-row lg:items-center",
  "side-fill":
    "flex flex-col gap-6 lg:flex-row lg:items-stretch lg:[&>:first-child]:flex lg:[&>:first-child]:flex-col lg:[&>:first-child]:items-center lg:[&>:first-child]:justify-center lg:[&>:last-child]:flex lg:[&>:last-child]:flex-col lg:[&>:last-child>dl]:flex lg:[&>:last-child>dl]:flex-1 lg:[&>:last-child>dl]:flex-col lg:[&>:last-child>dl]:justify-between lg:[&>:last-child>dl]:gap-2 lg:[&>:last-child>dl]:space-y-0",
  "side-2col":
    "flex flex-col gap-6 lg:flex-row lg:items-center [&>:last-child>dl]:grid [&>:last-child>dl]:grid-cols-1 [&>:last-child>dl]:gap-x-6 [&>:last-child>dl]:gap-y-2 [&>:last-child>dl]:space-y-0 sm:[&>:last-child>dl]:grid-cols-2",
  stacked:
    "flex flex-col gap-4 [&>:first-child]:w-full [&_[data-gfr-wrap]]:w-full [&_[data-gfr-wrap]]:max-w-none [&_[data-gfr-main]]:h-auto [&_[data-gfr-main]]:w-full [&_[data-gfr-main]]:max-w-none [&>:last-child>dl]:grid [&>:last-child>dl]:grid-cols-1 [&>:last-child>dl]:gap-x-6 [&>:last-child>dl]:gap-y-2 [&>:last-child>dl]:space-y-0 sm:[&>:last-child>dl]:grid-cols-2 lg:[&>:last-child>dl]:grid-cols-3",
};

// Same remedies for a row that switches at a container width (`@3xl`) and whose table part wraps
// the note one level deeper (wrapper > note > dl), as in markets/IndicatorCard.
const LAYOUT_CQ: Record<GapLayout, string> = {
  side: "flex flex-col gap-6 @3xl:flex-row @3xl:items-center",
  "side-fill":
    "flex flex-col gap-6 @3xl:flex-row @3xl:items-stretch @3xl:[&>:first-child]:flex @3xl:[&>:first-child]:flex-col @3xl:[&>:first-child]:items-center @3xl:[&>:first-child]:justify-center @3xl:[&>:last-child]:flex @3xl:[&>:last-child]:flex-col @3xl:[&>:last-child>*]:flex @3xl:[&>:last-child>*]:flex-1 @3xl:[&>:last-child>*]:flex-col @3xl:[&>:last-child_dl]:flex @3xl:[&>:last-child_dl]:flex-1 @3xl:[&>:last-child_dl]:flex-col @3xl:[&>:last-child_dl]:justify-between @3xl:[&>:last-child_dl]:gap-2 @3xl:[&>:last-child_dl]:space-y-0",
  "side-2col":
    "flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:[&>:last-child]:w-[28rem] [&>:last-child_dl]:grid [&>:last-child_dl]:grid-cols-1 [&>:last-child_dl]:gap-x-6 [&>:last-child_dl]:gap-y-2 [&>:last-child_dl]:space-y-0 sm:[&>:last-child_dl]:grid-cols-2",
  stacked:
    "flex flex-col gap-4 [&>:first-child]:w-full [&_[data-gfr-wrap]]:w-full [&_[data-gfr-wrap]]:max-w-none [&_[data-gfr-main]]:h-auto [&_[data-gfr-main]]:w-full [&_[data-gfr-main]]:max-w-none [&>:last-child]:w-full [&>:last-child_dl]:grid [&>:last-child_dl]:grid-cols-1 [&>:last-child_dl]:gap-x-6 [&>:last-child_dl]:gap-y-2 [&>:last-child_dl]:space-y-0 sm:[&>:last-child_dl]:grid-cols-2 lg:[&>:last-child_dl]:grid-cols-3",
};

/**
 * Drop-in for an inline "drawing beside its worked-example note" row: keeps that side-by-side
 * layout unless it measures an empty gap, then switches to the first remedy without one
 * (visuals.md "no empty gaps", same test as scripts/card-gap-check.mjs). Children: drawing, note.
 */
export default function GapFreeRow({ children, className = "", layout: pinned, container = false }: { children: ReactNode; className?: string; layout?: GapLayout; /** Switch at the parent `@container`'s `@3xl` instead of the `lg` viewport. */ container?: boolean }) {
  const { layout, boxRef } = useGapFreeSplit(pinned);
  return (
    <div ref={boxRef} data-gap-layout={layout} className={`${(container ? LAYOUT_CQ : LAYOUT)[layout]} ${className}`}>
      {children}
    </div>
  );
}
