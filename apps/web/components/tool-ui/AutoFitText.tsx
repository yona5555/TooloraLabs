"use client";
import { useLayoutEffect, useRef } from "react";

const DEFAULT_STEPS = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"];

type Props = {
  text: string;
  steps?: string[];
  className?: string;
  dir?: "ltr" | "rtl";
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
export default function AutoFitText({ text, steps = DEFAULT_STEPS, className = "", dir }: Props) {
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
    // Settled step applied; re-enable wrapping as the final fallback in
    // case even the smallest step still doesn't fit on one line.
    el.className = `${className} ${steps[i]} block w-full break-words`.trim();
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

  return (
    <span ref={ref} dir={dir} className={`${className} ${steps[0]} block w-full break-words`.trim()}>
      {text}
    </span>
  );
}
