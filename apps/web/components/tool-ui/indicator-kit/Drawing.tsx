"use client";
import { useContext, useRef, type ReactNode } from "react";
import type { HandleDirection } from "@/components/tool-ui/glass/GlassPrimitives";
import FitSvg from "@/components/tool-ui/FitSvg";
import { SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "./CardKit";
import { MiniContext } from "./miniContext";

/** The measured drawing of a 2D indicator card (§40), its labels kept readable by `FitSvg` (§39). */
/** Measured drawing box + drag plumbing: `toValue` maps a pointer (viewBox px) to the card's value. */
export function useDrawing(hMin: number, s: Stepper, toValue: (x: number, y: number, W: number, H: number) => number, w0 = 520) {
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: w0, h: hMin });
  const H = Math.max(hMin, hBox);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (x, y) => s.set(toValue(x, y, W, H)));
  return { boxRef: box, svgRef: ref, drag, W, H };
}

export function Drawing({
  boxRef,
  svgRef,
  drag,
  W,
  H,
  hMin,
  label,
  valueText,
  handle,
  s,
  testId,
  children,
}: {
  boxRef: ReturnType<typeof useDrawing>["boxRef"];
  svgRef: ReturnType<typeof useDrawing>["svgRef"];
  drag: ReturnType<typeof useDrawing>["drag"];
  W: number;
  H: number;
  hMin: number;
  label: string;
  valueText: string;
  handle: { x: number; y: number; dir: HandleDirection };
  s: Stepper;
  testId: string;
  children: ReactNode;
}) {
  // Phone top mini card (rule 2): the same drawing, scaled into the chip, without handle or refs.
  if (useContext(MiniContext)) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 block" aria-hidden="true">
        {children}
      </svg>
    );
  }
  return (
    <div ref={boxRef} data-preview="visual" className="relative w-full flex-1" style={{ minHeight: hMin }}>
      <FitSvg grow={false} ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {children}
      </FitSvg>
      <SvgHandle x={handle.x} y={handle.y} viewW={W} viewH={H} direction={handle.dir} label={label} valueText={valueText} s={s} drag={drag} testId={`${testId}-handle`} />
    </div>
  );
}

/** Lets `IndicatorCard` recognise a kit drawing without importing it (and `FitSvg` with it). */
Drawing.kitDrawing = true;
