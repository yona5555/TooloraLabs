"use client";
import { useTransformContext, vec } from "mafs";

type Vector2 = [number, number];

/** Converts a math-space point to pixel space using Mafs' own view transform — the documented pattern for building custom Mafs children that need raw SVG. */
export function useMafsPixel(point: Vector2): Vector2 {
  const { viewTransform } = useTransformContext();
  return vec.transform(point, viewTransform);
}

type HoverSegmentProps = {
  point1: Vector2;
  point2: Vector2;
  color: string;
  weight?: number;
  dashed?: boolean;
  tooltip: string;
};

/**
 * A line segment with a native `<title>` tooltip and a wide transparent hit-area — Mafs' own
 * `Line.Segment` has no way to attach hover content, so this renders the equivalent raw SVG
 * directly in pixel space via `useMafsPixel`.
 */
export function MafsHoverSegment({ point1, point2, color, weight = 2.5, dashed, tooltip }: HoverSegmentProps) {
  const [x1, y1] = useMafsPixel(point1);
  const [x2, y2] = useMafsPixel(point2);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={weight} strokeDasharray={dashed ? "7 5" : undefined} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={18} style={{ cursor: "help" }}>
        <title>{tooltip}</title>
      </line>
    </g>
  );
}

type HoverPointProps = {
  point: Vector2;
  tooltip: string;
  radiusPx?: number;
};

/** An invisible hover target around a math-space point, for a native tooltip with no visible marker of its own. */
export function MafsHoverPoint({ point, tooltip, radiusPx = 16 }: HoverPointProps) {
  const [x, y] = useMafsPixel(point);
  return (
    <circle cx={x} cy={y} r={radiusPx} fill="transparent" style={{ cursor: "help" }}>
      <title>{tooltip}</title>
    </circle>
  );
}
