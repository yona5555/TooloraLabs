import type { TrianglePoint } from "./TriangleCalculator";

export type ActiveAngleProjection = {
  activeVertex: TrianglePoint;
  baseVertex: TrianglePoint;
  farVertex: TrianglePoint;
  foot: TrianglePoint;
  /** Perpendicular distance from farVertex to the base line — the "red" height segment, always >= 0. */
  heightLength: number;
  /**
   * Signed distance from activeVertex to foot along the activeVertex->baseVertex direction —
   * the "green" segment. Negative when the angle at activeVertex is obtuse, meaning the foot
   * falls behind activeVertex rather than between activeVertex and baseVertex.
   */
  signedAdjacent: number;
  /** True exactly when signedAdjacent < 0 (the angle at activeVertex is obtuse). */
  isObtuse: boolean;
  angleDeg: number;
};

function dist(p: TrianglePoint, q: TrianglePoint): number {
  return Math.hypot(p.x - q.x, p.y - q.y);
}

/** Interior angle at `active`, between rays active->base and active->far, in degrees. */
export function angleAtVertex(active: TrianglePoint, base: TrianglePoint, far: TrianglePoint): number {
  const v1 = { x: base.x - active.x, y: base.y - active.y };
  const v2 = { x: far.x - active.x, y: far.y - active.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y) || 1;
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * For the interior angle at `activeVertex` (between rays to `baseVertex` and `farVertex`),
 * projects `farVertex` perpendicularly onto the infinite line through `activeVertex` and
 * `baseVertex`. This decomposes the side activeVertex->farVertex into a height component
 * perpendicular to the base line (the "red" segment: `heightLength` = |activeVertex->farVertex|
 * * sin(angle)) and a base-aligned component (the "green" segment: `signedAdjacent` =
 * |activeVertex->farVertex| * cos(angle), negative for an obtuse angle at activeVertex, since
 * the foot then falls on the extension behind activeVertex rather than toward baseVertex).
 *
 * With the project's existing vertex convention (activeVertex at the origin, baseVertex along
 * the positive x-axis — see `buildVertices` in TriangleCalculator.ts), this is exactly
 * `signedAdjacent = far.x`, `heightLength = far.y` for the un-dragged initial layout; the
 * general form here is what a freely dragged (non-axis-aligned) vertex configuration needs.
 */
export function projectOntoActiveAngleBase(activeVertex: TrianglePoint, baseVertex: TrianglePoint, farVertex: TrianglePoint): ActiveAngleProjection {
  const dirX = baseVertex.x - activeVertex.x;
  const dirY = baseVertex.y - activeVertex.y;
  const dirLen = Math.hypot(dirX, dirY) || 1;
  const ux = dirX / dirLen;
  const uy = dirY / dirLen;

  const toFarX = farVertex.x - activeVertex.x;
  const toFarY = farVertex.y - activeVertex.y;

  const signedAdjacent = toFarX * ux + toFarY * uy;
  const foot: TrianglePoint = { x: activeVertex.x + ux * signedAdjacent, y: activeVertex.y + uy * signedAdjacent };
  const heightLength = dist(farVertex, foot);
  const angleDeg = angleAtVertex(activeVertex, baseVertex, farVertex);

  return { activeVertex, baseVertex, farVertex, foot, heightLength, signedAdjacent, isObtuse: signedAdjacent < 0, angleDeg };
}

export function sideLength(p: TrianglePoint, q: TrianglePoint): number {
  return dist(p, q);
}

export function triangleAreaFromVertices(a: TrianglePoint, b: TrianglePoint, c: TrianglePoint): number {
  return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
}

export const MIN_DRAG_ANGLE_DEG = 1;
export const MIN_DRAG_SIDE_LENGTH = 0.3;

/**
 * True when the given vertices would form a degenerate or near-degenerate triangle — any
 * interior angle under MIN_DRAG_ANGLE_DEG, or any side shorter than MIN_DRAG_SIDE_LENGTH.
 * Used to reject a drag move before it's applied, rather than clamping to an arbitrary nearby
 * position.
 */
export function isDegenerateTriangle(a: TrianglePoint, b: TrianglePoint, c: TrianglePoint): boolean {
  const ab = sideLength(a, b);
  const bc = sideLength(b, c);
  const ca = sideLength(c, a);
  if (ab < MIN_DRAG_SIDE_LENGTH || bc < MIN_DRAG_SIDE_LENGTH || ca < MIN_DRAG_SIDE_LENGTH) return true;

  const angleA = angleAtVertex(a, b, c);
  const angleB = angleAtVertex(b, a, c);
  const angleC = 180 - angleA - angleB;
  return angleA < MIN_DRAG_ANGLE_DEG || angleB < MIN_DRAG_ANGLE_DEG || angleC < MIN_DRAG_ANGLE_DEG;
}
