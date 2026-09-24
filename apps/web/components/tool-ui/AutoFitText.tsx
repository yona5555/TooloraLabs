"use client";
import { useLayoutEffect, useRef } from "react";

const DEFAULT_STEPS = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"];

type Props = {
  text: string;
  steps?: string[];
  className?: string;
  dir?: "ltr" | "rtl";
  /**
   * When false, a connected number/currency value NEVER breaks across lines
   * — not even as a last-resort fallback beyond the smallest step. Splitting
   * a single value like "₹4,200,000.00" mid-token ("₹4,20" / "0,000" / ".00")
   * is worse than the overflow it was meant to prevent: an unreadable
   * number, not just a tight one. Defaults to true (today's fallback
   * behavior) so existing callers are unaffected; the flow-diagram boxes
   * turn it off and rely on real space (the redesigned card widths) plus
   * the smallest font step instead.
   */
  allowWrap?: boolean;
};

/**
 * Measures its own rendered width against its parent's actual available
 * width and steps down through `steps` (largest first) until the text fits
 * on one line without overflowing — a real fit-to-container measurement,
 * not a guess based on character count. A character-count heuristic (tried
 * first here) looked reasonable in isolation but still overflowed a ~100px
 * flow-diagram box for a 12-char value, because the "how many px does this
 * many chars need" estimate was never actually checked against the box's
 * real width.
 *
 * The measurement itself has to force `white-space: nowrap` while reading
 * `scrollWidth`: a wrapped block element's `scrollWidth` is capped at its
 * own fixed width almost by definition (the "overflow" just becomes extra
 * height instead), so measuring the wrapped state never detects that a
 * smaller font is needed — a first version of this component did exactly
 * that and never shrank at all, wrapping the same 24px text across three
 * ragged lines instead. Measuring the *unwrapped* natural width at each
 * step is what actually answers "does this fit on one line at this size."
 * Wrapping is re-enabled only on the final, settled className, as a
 * last-resort fallback beyond the smallest step.
 *
 * The shrink loop mutates the DOM node directly rather than looping through
 * React re-renders: each `className` write forces a synchronous layout
 * recompute before the next `scrollWidth` read, so the whole loop settles
 * within one paint instead of flashing through intermediate sizes.
 */
export default function AutoFitText({ text, steps = DEFAULT_STEPS, className = "", dir, allowWrap = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  function shrinkToFit() {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const available = parent.clientWidth;
    let i = 0;
    el.className = `${className} ${steps[i]} inline-block whitespace-nowrap`.trim();
    while (el.scrollWidth > available && i < steps.length - 1) {
      i += 1;
      el.className = `${className} ${steps[i]} inline-block whitespace-nowrap`.trim();
    }
    // Settled on the smallest step that fits (or the smallest step overall).
    // Wrapping is re-enabled here only when the caller allows it as a final
    // fallback — otherwise the value stays on one line, full stop.
    el.className = allowWrap
      ? `${className} ${steps[i]} block w-full break-words`.trim()
      : `${className} ${steps[i]} inline-block whitespace-nowrap`.trim();
  }

  useLayoutEffect(() => {
    shrinkToFit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, className]);

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => shrinkToFit());
    observer.observe(parent);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialClassName = allowWrap
    ? `${className} ${steps[0]} block w-full break-words`.trim()
    : `${className} ${steps[0]} inline-block whitespace-nowrap`.trim();

  return (
    <span ref={ref} dir={dir} className={initialClassName}>
      {text}
    </span>
  );
}
