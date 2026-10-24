"use client";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

// Rule 2: the copy is fetched only on phone.
const PhoneMiniCopy = lazy(() => import("./PhoneMiniCopy"));

/**
 * APPROVED PHONE STANDARD rule 2, chosen per tool: wraps one of the tool's own 2D indicators (or its
 * formula card / main result) and, below 768px only, mirrors it into top mini card `slot` (0 or 1),
 * scaled to fit the 88px chip. The copy renders the same `children` element, so it is live with the
 * state that produced it; it is inert and aria-hidden, and tapping the chip scrolls to the original.
 * No wrapper box: a hidden marker before the indicator finds it (its next sibling), so parent layouts
 * (gaps, space-y, grids) and desktop are unchanged.
 * Tools without a PhoneMini keep the automatic mirror of their first two kit Drawings (PhoneMiniMirror).
 */
export default function PhoneMini({ slot, title, label, children }: { slot: 0 | 1; title: ReactNode; label?: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const read = () => setPhone(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return (
    <>
      <span ref={ref} hidden data-ph-mini-src={slot} />
      {children}
      {phone && (
        <Suspense fallback={null}>
          <PhoneMiniCopy slot={slot} title={title} label={label ?? (typeof title === "string" ? title : undefined)} source={ref}>
            {children}
          </PhoneMiniCopy>
        </Suspense>
      )}
    </>
  );
}
