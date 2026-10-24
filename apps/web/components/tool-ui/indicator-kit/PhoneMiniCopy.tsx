"use client";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { miniCopy } from "./miniCopy";

/** The mini slot `slot` of this page, or null on pages that keep their own top cards. */
function findSlot(el: HTMLElement | null, slot: 0 | 1): HTMLElement | null {
  const main = el?.closest("main[data-phone-cards]");
  if (!main || main.hasAttribute("data-phone-markets") || main.querySelector("[data-phone-ticker]")) return null;
  return main.querySelector<HTMLElement>(`[data-phone-mini-slot="${slot}"]`);
}

/** The original indicator: the element right after PhoneMini's hidden marker. */
function sourceBox(marker: HTMLElement | null): HTMLElement | null {
  return (marker?.nextElementSibling as HTMLElement | null) ?? null;
}

/**
 * Phone-only copy for PhoneMini: lays the indicator out at its original width and scales it down
 * (never up) to fit the chip, centred. Re-measured whenever the original or the chip resizes.
 */
export default function PhoneMiniCopy({ slot, title, label, source, children }: { slot: 0 | 1; title: ReactNode; label?: string; source: RefObject<HTMLSpanElement | null>; children: ReactNode }) {
  // Read once: the copy mounts only on the client, lazily after the page committed.
  const [target] = useState(() => findSlot(source.current, slot));
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ w: number; s: number; x: number; y: number } | null>(null);
  // A new render of the indicator, never its markup again: ids baked into it get a "-mini" suffix.
  const copy = useMemo(() => miniCopy(children), [children]);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    const src = sourceBox(source.current);
    if (!box || !inner || !src) return;
    const measure = () => {
      const w = src.getBoundingClientRect().width || 320;
      inner.style.width = `${w}px`;
      const h = inner.scrollHeight || 1;
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      const s = Math.min(1, bw / w, bh / h);
      setFit({ w, s, x: (bw - w * s) / 2, y: (bh - h * s) / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(src);
    ro.observe(box);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [source]);

  if (!target) return null;
  return createPortal(
    <div className="relative flex h-full w-full min-w-0 flex-col gap-0.5 overflow-hidden rounded-xl border border-blue-200 bg-white px-2 pt-1.5 pb-1 text-start dark:border-blue-500/30 dark:bg-zinc-900">
      <span className="w-full truncate text-[11px] leading-4 font-semibold text-zinc-600 dark:text-zinc-300">{title}</span>
      <div ref={boxRef} aria-hidden="true" inert className="relative min-h-0 w-full flex-1 overflow-hidden">
        <div
          ref={innerRef}
          className="absolute top-0 left-0 origin-top-left"
          style={fit ? { width: fit.w, transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.s})` } : { visibility: "hidden" }}
        >
          {copy}
        </div>
      </div>
      <button
        type="button"
        aria-label={label}
        onClick={() => (source.current?.closest("[data-card]") ?? sourceBox(source.current))?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="absolute inset-0 rounded-xl"
      />
    </div>,
    target,
  );
}
