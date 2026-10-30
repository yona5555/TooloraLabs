"use client";
import { createContext, useContext, type ComponentProps, type SVGAttributes } from "react";
import { Mafs, Text } from "mafs";
import { placeClear, type Box, type Margins } from "./chartLabels";
import { useLabelFit, type Measure } from "./useChartLabels";

type MafsProps = ComponentProps<typeof Mafs>;
type V2 = [number, number];

/** Mafs' own defaults (mafs/build/index.js: `viewBox = { x: [-3, 3], y: [-3, 3] }`, `padding ?? 0.5`). */
const MAFS_VIEW: NonNullable<MafsProps["viewBox"]> = { x: [-3, 3], y: [-3, 3] };
const MAFS_PADDING = 0.5;

/**
 * The view Mafs should draw so the area of interest keeps its place and `m` px stay free on each side for
 * the labels: the same padding and "contain" rule Mafs applies (mafs/build/index.js), solved for the
 * margins, so the result maps exactly (Mafs' own contain step then has nothing left to change).
 */
export function fitView(viewBox: MafsProps["viewBox"], contain: boolean, width: number, height: number, m: Margins): { x: V2; y: V2 } {
  const vb = viewBox ?? MAFS_VIEW;
  const pad = vb.padding ?? MAFS_PADDING;
  const x: V2 = [(vb.x?.[0] ?? 0) - pad, (vb.x?.[1] ?? 0) + pad];
  const y: V2 = [(vb.y?.[0] ?? 0) - pad, (vb.y?.[1] ?? 0) + pad];
  const innerW = width - m.left - m.right;
  const innerH = height - m.top - m.bottom;
  if (!(innerW > 0) || !(innerH > 0) || !(x[1] > x[0]) || !(y[1] > y[0])) return { x, y };
  if (!contain) {
    const ux = (x[1] - x[0]) / innerW;
    const uy = (y[1] - y[0]) / innerH;
    return { x: [x[0] - m.left * ux, x[1] + m.right * ux], y: [y[0] - m.bottom * uy, y[1] + m.top * uy] };
  }
  // one scale for both axes; the area of interest is centred in the box left inside the margins
  const u = Math.max((x[1] - x[0]) / innerW, (y[1] - y[0]) / innerH);
  const cx = (x[0] + x[1]) / 2;
  const cy = (y[0] + y[1]) / 2;
  const left = cx - (innerW / 2 + m.left) * u;
  const bottom = cy - (innerH / 2 + m.bottom) * u;
  return { x: [left, left + width * u], y: [bottom, bottom + height * u] };
}

type FitState = { view: { x: V2; y: V2 }; width: number; height: number; measure: Measure; boxes: Box[] };
const FitContext = createContext<FitState | null>(null);

const FLOAT = { "data-label-float": "" } as SVGAttributes<SVGTextElement>;

/**
 * Mafs `<Text>` (centred on its point) inside a `FitMafs`, kept clear of the chart's other labels (tick
 * labels, values) and inside the drawing: it measures itself and moves the least (`placeClear`) from where
 * it was asked to be. It is left out of the view fit (`data-label-float`), so it never widens the view.
 */
export function FitText({ x, y, size = 12, svgTextProps, children, ...rest }: Omit<ComponentProps<typeof Text>, "attach" | "attachDistance">) {
  const fit = useContext(FitContext);
  let at: [number, number] = [x, y];
  if (fit) {
    const { view, width: w, height: h } = fit;
    const ux = (view.x[1] - view.x[0]) / w;
    const uy = (view.y[1] - view.y[0]) / h;
    const px = (x - view.x[0]) / ux;
    const py = (view.y[1] - y) / uy;
    const m = fit.measure(String(children ?? ""), size);
    const lh = m.ascent + m.descent;
    const box = { left: px - m.width / 2, right: px + m.width / 2, top: py - lh / 2, bottom: py + lh / 2 };
    const { dx, dy } = placeClear(box, fit.boxes, { left: 0, right: w, top: 0, bottom: h }, { x: m.width / 2, y: lh });
    at = [x + dx * ux, y - dy * uy];
  }
  return (
    <Text x={at[0]} y={at[1]} size={size} svgTextProps={{ ...svgTextProps, ...FLOAT }} {...rest}>
      {children}
    </Text>
  );
}

/** Mafs' padding in px on the drawn view, as the (negative) lowest margin; rounded so it settles. */
function padFloor(pad: number, view: { x: V2; y: V2 }, width: number, height: number): Margins {
  const fx = -Math.floor((pad * width) / (view.x[1] - view.x[0]));
  const fy = -Math.floor((pad * height) / (view.y[1] - view.y[0]));
  return { left: fx, right: fx, top: fy, bottom: fy };
}

/**
 * `<Mafs>` with its labels kept inside the drawing (§39, shared chart label layout): the tick labels at
 * the edges of a view (e.g. −15 on a y axis that ends at −15) are measured as drawn and the view widens by
 * exactly their overflow, never by a per-chart padding. Same props as `<Mafs>`; the first render is the
 * plain `<Mafs>` view, refined in the same frame once the labels are measured. Labels that follow a dragged
 * point carry `data-label-float` (see `useLabelFit`) and are placed by the chart instead.
 */
export default function FitMafs({ viewBox, preserveAspectRatio, ...rest }: MafsProps) {
  const contain = preserveAspectRatio !== false;
  // Mafs' padding lies outside the area of interest: a margin may give it up (e.g. to push the label of a
  // tick just past the area fully out of view instead of widening the view after it), never more.
  const pad = (viewBox ?? MAFS_VIEW).padding ?? MAFS_PADDING;
  const [ref, fit] = useLabelFit(JSON.stringify([viewBox, preserveAspectRatio]), (w, h, m) => padFloor(pad, fitView(viewBox, contain, w, h, m), w, h));
  const view = fit.width ? fitView(viewBox, contain, fit.width, fit.height, fit.margins) : null;
  const ctx = view ? { view, width: fit.width, height: fit.height, measure: fit.measure, boxes: fit.boxes } : null;
  return (
    <div ref={ref}>
      <FitContext.Provider value={ctx}>
        <Mafs viewBox={view ? { ...view, padding: 0 } : viewBox} preserveAspectRatio={preserveAspectRatio} {...rest} />
      </FitContext.Provider>
    </div>
  );
}
