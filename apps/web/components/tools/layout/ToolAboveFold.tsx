"use client";
import { ReactNode, useLayoutEffect, useRef, useState } from "react";

type ToolAboveFoldProps = {
  input: ReactNode;
  result: ReactNode;
  sidebar: ReactNode;
  /**
   * A quick below-the-fold widget (e.g. recommendations, milestones, a
   * payoff chart) placed under input+result.
   */
  secondary?: ReactNode;
};

/**
 * The sidebar is taken out of grid flow with `lg:absolute` instead of being a
 * normal grid item. A shared CSS Grid row is always sized to its tallest
 * same-row item regardless of align-items — and, empirically, giving the
 * (usually tallest, thanks to the fixed 600px ad slot) sidebar a row-span
 * still leaked extra height into row 1 rather than cleanly containing it to
 * row 2. Removing it from flow entirely is the only way to guarantee
 * input/result/secondary size to their own content.
 *
 * Taking it out of flow means it no longer contributes to this container's
 * height, so without help the next section below would start too early and
 * the (usually taller) sidebar would visually overlap it. A ResizeObserver
 * measures the sidebar's real rendered height and applies it as this
 * container's min-height, reserving exactly the space the sidebar needs —
 * nothing hardcoded, and it adapts if the related-tools list length changes.
 * `content-start` is required alongside min-height: without it, Grid's
 * default `align-content: normal` (which computes to stretch) redistributes
 * the min-height's extra space by growing the auto row tracks themselves,
 * which reintroduces the exact dead-space-under-row-1 bug this is meant to
 * fix — content-start pins rows to their natural size and leaves the extra
 * space as trailing blank area instead.
 *
 * `min-w-0` on each grid item guards against grid's default
 * `min-width: auto`, which resolves to an item's min-content size and can
 * force a track wider than its minmax() sizing when content can't wrap
 * below that. This alone didn't cause it, but a caller relying on this
 * component MUST also render at `contentWidth="wide"` (see ToolPageLayout) —
 * at the narrower default page width the 320px + minmax(360px,…) + 320px
 * template doesn't fit and column 2 gets forced to its 360px floor, pushing
 * it under the sidebar exactly like min-w-0 alone can't fix.
 *
 * `items-start` on the container overrides Grid's default `align-items:
 * normal` (which resolves to stretch), which was independently forcing
 * `input` and `result` — the two real row-1 grid items — to match each
 * other's height even after the sidebar was removed from flow. Without it,
 * whichever of the two is shorter gets stretched with dead space to match
 * the taller one.
 *
 * Height-mismatch handling is automatic, not opt-in: whenever the measured
 * input+secondary content runs taller than the sidebar's own natural
 * height (e.g. a tool with several stacked secondary cards, like
 * mortgage-calculator, versus a tool whose columns are naturally balanced,
 * like BMI), the sidebar's box is stretched to match and its content
 * becomes `position: sticky` so it travels with the scroll across that
 * full height instead of scrolling out of view after one screen, leaving a
 * boxless empty column behind it. Tools with balanced columns (contentHeight
 * <= sidebarHeight) get no extra height and no sticky class — this is a
 * no-op for them, not a behavior change.
 */
export default function ToolAboveFold({ input, result, sidebar, secondary }: ToolAboveFoldProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setSidebarHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The grid's own intrinsic height already equals input+secondary's
  // combined height, since the sidebar is taken out of flow (absolute) and
  // never contributes to it.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setContentHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sidebarBoxHeight = contentHeight > sidebarHeight ? contentHeight : undefined;

  return (
    <div
      ref={gridRef}
      className="relative grid grid-cols-1 content-start items-start gap-6 lg:grid-cols-[320px_minmax(360px,1fr)_320px]"
      style={{ minHeight: sidebarHeight || undefined }}
    >
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">{input}</div>
      <div className="min-w-0 lg:col-start-2 lg:row-start-1">{result}</div>
      {secondary && (
        <div className="min-w-0 lg:col-start-1 lg:col-span-2 lg:row-start-2">{secondary}</div>
      )}
      <div
        className="hidden lg:absolute lg:top-0 lg:end-0 lg:block lg:w-[320px]"
        style={sidebarBoxHeight ? { height: sidebarBoxHeight } : undefined}
      >
        <div ref={sidebarRef} className={sidebarBoxHeight ? "lg:sticky lg:top-20" : undefined}>
          {sidebar}
        </div>
      </div>
    </div>
  );
}
