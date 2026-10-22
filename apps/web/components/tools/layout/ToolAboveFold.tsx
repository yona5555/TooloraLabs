"use client";
import { ReactNode, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

type ToolAboveFoldProps = {
  input: ReactNode;
  result: ReactNode;
  sidebar: ReactNode;
  /**
   * A quick below-the-fold widget (e.g. recommendations, milestones, a
   * payoff chart) placed under input+result.
   */
  secondary?: ReactNode;
  /**
   * Optional desktop-only filler placed under the sidebar. When given, the sidebar scrolls
   * normally instead of sticking, and this node gets all the remaining column height (so a
   * `sticky` element inside it, e.g. an ad, rides the rest of the page). The sidebar itself is
   * still what's measured, so the filler never feeds back into the layout height.
   */
  sidebarFill?: ReactNode;
  /**
   * Stretch the input card to the row height (instead of making it sticky when the result column is
   * taller), so an input card whose last block can grow (`flex-1`, e.g. a quick conversion table)
   * fills the column with real content rather than leaving a gap under it.
   */
  stretchInput?: boolean;
  /**
   * Stretch the result column to the row height (when the input card is the taller one), so a
   * result column whose last card can grow (`lg:flex-1`) ends flush with the input card (§27).
   */
  stretchResult?: boolean;
  /**
   * Give the sidebar at least the height of the input/result row (lg+ only), so the right column
   * ends flush with them (§27). The sidebar must grow with real content to use that height (e.g.
   * `RelatedToolsSidebar fill`, whose tool list extends into it). It still sticks across the
   * secondary row like before; only its minimum height changes.
   */
  sidebarMatchRow?: boolean;
  /**
   * §41: 16px between the grid's rows and columns (the spacing token) instead of 24px, and the
   * secondary row spans all three columns under a sidebar that ends with row 1 (use with
   * `sidebarMatchRow`), so every column ends at the same bottom edge.
   */
  tight?: boolean;
  /**
   * Opt-in per §8 (2026-10-22, surface-area-calculator pilot only — every other caller is
   * unaffected since this defaults to false): the three columns stop being `320px` / `320px`
   * fixed with a `minmax(360px,1fr)` middle track (whose 1000px+gaps floor can exceed the real
   * available width around 1024px, pushing the result column's content to overflow into the
   * absolutely-positioned sidebar's area — the exact "Related Tools covers Result" bug). Instead:
   * one column below `md` (768px), input+result as two flexible `minmax()` tracks from `md`, and
   * the sidebar's reserved third track only from `xl` (1280px) once there's reliably enough room
   * for all three — a real 3→2→1 collapse driven by width tiers instead of one hard breakpoint.
   */
  fluidColumns?: boolean;
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
 *
 * The same automatic height-mismatch handling applies to `input` versus
 * `result`, independent of the sidebar comparison above: whenever a tool's
 * result column (hero number, breakdown chart, mode tabs, any "fill the
 * gap" card stacked beneath) runs taller than its input form, the input
 * card is stretched to match and made sticky at the same `top-20` offset,
 * so the fields stay reachable while the visitor scrolls through a long
 * result column instead of scrolling out of view after one screen. Tools
 * whose input is already the taller (or equal) column get no extra height
 * and no sticky class — a no-op, not a behavior change. `top-20` matches
 * the sidebar's own offset, so both columns clear the site header by the
 * same margin and never fight each other for the same sticky band.
 */
export default function ToolAboveFold({ input, result, sidebar, secondary, sidebarFill, stretchInput = false, stretchResult = false, sidebarMatchRow = false, tight = false, fluidColumns = false }: ToolAboveFoldProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const [sidebarNatural, setSidebarNatural] = useState(0);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [resultHeight, setResultHeight] = useState(0);
  const layoutId = useId();

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

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setInputHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = resultRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setResultHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Row 1's height = the taller of the two row-1 grid items' boxes. Read as border boxes so the
  // value matches what the visitor sees; the sidebar is out of flow, so this can never loop.
  useLayoutEffect(() => {
    if (!sidebarMatchRow) return;
    const a = inputBoxRef.current;
    const b = resultRef.current;
    if (!a || !b) return;
    const update = () => setRowHeight(Math.max(a.getBoundingClientRect().height, b.getBoundingClientRect().height));
    const observer = new ResizeObserver(update);
    observer.observe(a);
    observer.observe(b);
    return () => observer.disconnect();
  }, [sidebarMatchRow]);

  // When the sidebar's own content is the tallest, row 1 must grow to it instead. Its natural
  // height = its box minus the part that only grows to fill (`data-sidebar-grow`, natural height
  // 0), so feeding it back as row 1's min-height can never ratchet the row taller.
  useLayoutEffect(() => {
    if (!sidebarMatchRow) return;
    const el = sidebarRef.current;
    if (!el) return;
    const grow = el.querySelector<HTMLElement>("[data-sidebar-grow]");
    const update = () => setSidebarNatural(el.getBoundingClientRect().height - (grow ? grow.getBoundingClientRect().height : 0));
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (grow) observer.observe(grow);
    return () => observer.disconnect();
  }, [sidebarMatchRow]);
  // The pre-paint script below has done its job once these inline values exist.
  useLayoutEffect(() => {
    if (sidebarMatchRow && sidebarNatural && rowHeight) document.getElementById(`afold-${layoutId}`)?.remove();
  }, [sidebarMatchRow, sidebarNatural, rowHeight, layoutId]);
  const rowMinStyle = sidebarMatchRow && sidebarNatural ? ({ "--side-nat": `${sidebarNatural}px` } as CSSProperties) : undefined;
  const rowMinClass = sidebarMatchRow ? "lg:[min-height:var(--side-nat)]" : "";

  const sidebarBoxHeight = !tight && contentHeight > sidebarHeight ? contentHeight : undefined;
  const inputBoxHeight = resultHeight > inputHeight ? resultHeight : undefined;

  // fluidColumns (§8 pilot, surface-area-calculator only): input+result become two real grid
  // columns from `md` using flexible minmax() shares instead of a flat 320px, and the sidebar's
  // reserved third track only joins from `xl` — see the prop's own doc comment for the overlap bug
  // this avoids. Every class below is written out in full for both branches (not built from a
  // shared breakpoint variable) because Tailwind's build-time scanner matches literal class text.
  const gridColsClass = fluidColumns
    ? "md:grid-cols-[minmax(240px,1fr)_minmax(320px,1.4fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(360px,1.4fr)_minmax(240px,300px)]"
    : "lg:grid-cols-[320px_minmax(360px,1fr)_320px]";
  const inputCellClass = fluidColumns ? "md:col-start-1 md:row-start-1" : "lg:col-start-1 lg:row-start-1";
  const inputStretchClass = fluidColumns
    ? stretchInput
      ? "md:self-stretch"
      : "md:[height:var(--input-stretch-h)]"
    : stretchInput
      ? "lg:self-stretch"
      : "lg:[height:var(--input-stretch-h)]";
  const inputInnerClass = stretchInput
    ? fluidColumns
      ? "md:h-full"
      : "lg:h-full"
    : inputBoxHeight
      ? fluidColumns
        ? "md:sticky md:top-20"
        : "lg:sticky lg:top-20"
      : undefined;
  const resultCellClass = fluidColumns ? "md:col-start-2 md:row-start-1" : "lg:col-start-2 lg:row-start-1";
  const resultStretchClass = stretchResult ? (fluidColumns ? "md:self-stretch" : "lg:self-stretch") : "";
  const secondaryCellClass = fluidColumns
    ? tight
      ? "md:col-start-1 md:row-start-2 md:col-span-2"
      : "md:col-start-1 md:row-start-2 md:col-span-2"
    : tight
      ? "lg:col-start-1 lg:row-start-2 lg:col-span-3"
      : "lg:col-start-1 lg:row-start-2 lg:col-span-2";
  const sidebarOuterClass = fluidColumns
    ? `hidden xl:absolute xl:top-0 xl:end-0 xl:w-[min(300px,22vw)] ${sidebarFill ? "xl:flex xl:flex-col" : "xl:block"}`
    : `hidden lg:absolute lg:top-0 lg:end-0 lg:w-[320px] ${sidebarFill ? "lg:flex lg:flex-col" : "lg:block"}`;
  const sidebarStickyClass = sidebarBoxHeight && !sidebarFill ? (fluidColumns ? "xl:sticky xl:top-20" : "lg:sticky lg:top-20") : "";

  return (
    <>
    <div
      ref={gridRef}
      data-afold={sidebarMatchRow ? layoutId : undefined}
      className={`relative grid grid-cols-1 content-start items-start ${gridColsClass} ${tight ? "gap-4" : "gap-6"}`}
      style={{ minHeight: sidebarHeight || undefined }}
    >
      {/*
        The stretch height is desktop-only (matches the sidebar's `sticky`
        below, which is also gated to the same breakpoint) — below it the
        layout is a single stacked column, so forcing this wrapper to
        `result`'s height would leave a large empty gap under a short input
        card before the result starts. Setting it as a CSS custom property
        and reading it only inside a breakpoint-gated arbitrary-property
        class (rather than an unconditional inline `style.height`) keeps the
        value inert below that breakpoint without a matchMedia/JS check.
      */}
      {/* stretchInput lets the grid row itself size the input card (self-stretch), with no measuring. */}
      <div
        ref={inputBoxRef}
        data-afold-cell=""
        className={`min-w-0 ${inputCellClass} ${rowMinClass} ${inputStretchClass}`}
        style={{ ...(inputBoxHeight && !stretchInput ? ({ "--input-stretch-h": `${inputBoxHeight}px` } as CSSProperties) : {}), ...rowMinStyle }}
      >
        <div ref={inputRef} className={inputInnerClass}>
          {input}
        </div>
      </div>
      <div
        ref={resultRef}
        data-afold-cell=""
        data-tool-result
        data-preview="result"
        className={`min-w-0 ${resultCellClass} ${rowMinClass} ${resultStretchClass}`}
        style={rowMinStyle}
      >
        {result}
      </div>
      {secondary && <div className={`min-w-0 ${secondaryCellClass}`}>{secondary}</div>}
      <div className={`${sidebarOuterClass} min-w-0`} style={sidebarBoxHeight ? { height: sidebarBoxHeight } : undefined}>
        <div
          ref={sidebarRef}
          data-afold-side=""
          className={`min-w-0 ${sidebarStickyClass} ${sidebarMatchRow ? "lg:flex lg:flex-col lg:[min-height:var(--row-h)]" : ""}`}
          style={sidebarMatchRow && rowHeight ? ({ "--row-h": `${rowHeight}px` } as CSSProperties) : undefined}
        >
          {sidebar}
        </div>
        {sidebarFill && <div className={`${tight ? "mt-4" : "mt-6"} min-h-0 flex-1`}>{sidebarFill}</div>}
      </div>
    </div>
    {sidebarMatchRow && <script dangerouslySetInnerHTML={{ __html: prePaintRowScript(layoutId) }} />}
    </>
  );
}

/**
 * sidebarMatchRow sizes row 1 from measurements that the effects above only take after
 * hydration, so the page first painted at its natural height and then grew (CLS). This inline
 * script runs while the HTML is parsed, after the stylesheet and before the first paint, takes the
 * same two measurements and applies them through a temporary <style> (not the elements' style
 * attributes, which React hydrates); the effect above removes it once the inline values exist.
 * Below lg the sidebar is hidden, its height is 0 and nothing is applied.
 */
function prePaintRowScript(id: string) {
  const key = JSON.stringify(id);
  return `(function(){var g=document.querySelector('[data-afold='+JSON.stringify(${key})+']');if(!g)return;var s=g.querySelector("[data-afold-side]");if(!s)return;var w=s.querySelector("[data-sidebar-grow]");var n=s.getBoundingClientRect().height-(w?w.getBoundingClientRect().height:0);if(!n)return;var el=document.createElement("style");el.id="afold-"+${key};var sel='[data-afold='+JSON.stringify(${key})+']';el.textContent=sel+">[data-afold-cell]{--side-nat:"+n+"px}";document.head.appendChild(el);var r=0;g.querySelectorAll(":scope>[data-afold-cell]").forEach(function(c){r=Math.max(r,c.getBoundingClientRect().height)});el.textContent+=sel+" [data-afold-side]{--row-h:"+r+"px}"})()`;
}
