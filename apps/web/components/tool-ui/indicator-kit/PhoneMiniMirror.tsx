"use client";
import { useMemo, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { MiniContext } from "./miniContext";
import { miniCopy } from "./miniCopy";

/**
 * APPROVED PHONE STANDARD rule 2 (phone only, lazy-loaded by IndicatorCard when (max-width: 767px)
 * matches): the page's first two 2D kit indicators ([data-ph-mini-ok], DOM order) are mirrored in the
 * two top mini cards under the title (ToolPageLayout's [data-phone-mini-slot] 0 and 1). The mirror
 * renders the card's own `visual` element, so it is live with the card's state; tapping it scrolls to
 * the card. Nothing is generated: same component, compact mode (MiniContext).
 */
/** The slot this card fills (0 or 1), or null. Read once: the mirror mounts only on the client, lazily
 *  after the page committed, so the source card and the slots are already in the DOM. */
function findSlot(el: HTMLElement | null): HTMLElement | null {
  const main = el?.closest("main[data-phone-cards]");
  // A page that chose its own mini cards (PhoneMini) keeps them instead of the automatic mirror.
  if (!el || !main || main.hasAttribute("data-phone-markets") || main.querySelector("[data-phone-ticker], [data-ph-mini-src]")) return null;
  const index = Array.from(main.querySelectorAll("[data-ph-mini-ok]")).indexOf(el);
  if (index < 0 || index > 1) return null;
  return main.querySelector<HTMLElement>(`[data-phone-mini-slot="${index}"]`);
}

export default function PhoneMiniMirror({ title, visual, source }: { title: ReactNode; visual: ReactNode; source: RefObject<HTMLDivElement | null> }) {
  const [slot] = useState(() => findSlot(source.current));
  // A new render of the card's visual, never its markup again: ids baked into it get a "-mini" suffix.
  const copy = useMemo(() => miniCopy(visual), [visual]);
  if (!slot) return null;
  return createPortal(
    <button
      type="button"
      // The wrapper is display:contents in the phone flow (no box, scrollIntoView is a no-op): scroll to its card.
      onClick={() => (source.current?.querySelector("[data-card]") ?? source.current)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      className="flex h-full w-full min-w-0 flex-col gap-0.5 overflow-hidden rounded-xl border border-blue-200 bg-white px-2 pt-1.5 pb-1 text-start dark:border-blue-500/30 dark:bg-zinc-900"
    >
      <span className="w-full truncate text-[11px] leading-4 font-semibold text-zinc-600 dark:text-zinc-300">{title}</span>
      <span aria-hidden="true" dir="ltr" className="relative block min-h-0 w-full flex-1">
        <MiniContext.Provider value>{copy}</MiniContext.Provider>
      </span>
    </button>,
    slot,
  );
}
