"use client";

import { ReactNode, useLayoutEffect, useRef, useState } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  hidden?: boolean;
};

// Minimum gap kept between the tooltip and either edge of the viewport.
const EDGE_GAP = 8;

// The tooltip is not rendered as a box until it is shown (display: none), so an
// idle tooltip never adds to the page's scroll width. When shown it is centred
// under its trigger, then clamped inside the viewport, and it wraps if the label
// is wider than the viewport. This holds for every locale and screen width.
export default function Tooltip({ label, children, hidden }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const visible = open && !hidden;

  useLayoutEffect(() => {
    if (!visible) return;
    const wrapper = wrapperRef.current;
    const tip = tipRef.current;
    if (!wrapper || !tip) return;
    const anchor = wrapper.getBoundingClientRect();
    const width = tip.offsetWidth;
    const viewport = document.documentElement.clientWidth;
    const centred = anchor.left + anchor.width / 2 - width / 2;
    const clamped = Math.min(Math.max(centred, EDGE_GAP), viewport - EDGE_GAP - width);
    // Written to the DOM before paint, so the tooltip never shows unclamped.
    tip.style.left = `${Math.max(clamped, EDGE_GAP) - anchor.left}px`;
  }, [visible, label]);

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        ref={tipRef}
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-2 w-max max-w-[calc(100vw-1rem)] rounded-md bg-zinc-900 px-2 py-1 text-center text-xs font-medium text-white shadow-lg dark:bg-zinc-700 ${visible ? "block" : "hidden"}`}
      >
        {label}
      </span>
    </div>
  );
}
