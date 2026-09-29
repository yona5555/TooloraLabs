export type Vec2 = { x: number; y: number };

/**
 * Angle in degrees (0-360, wrapping) of a point relative to the circle's center, measured
 * counterclockwise from the positive x-axis — the standard unit-circle convention. Used to
 * convert a freely dragged point's raw pixel-derived math coordinates back into a clean angle
 * for a hero drag indicator.
 */
export function angleFromPoint(point: Vec2, center: Vec2 = { x: 0, y: 0 }): number {
  const deg = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
}

/** The point on a circle of the given radius at the given angle (degrees), standard convention. */
export function pointOnCircle(angleDeg: number, radius: number, center: Vec2 = { x: 0, y: 0 }): Vec2 {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: center.x + radius * Math.cos(rad), y: center.y + radius * Math.sin(rad) };
}

/** Snaps a dragged point back onto the circle of the given radius, preserving its angle — the constraint a draggable unit-circle point needs to stay exactly on the circle during drag. */
export function constrainToCircle(point: Vec2, radius: number, center: Vec2 = { x: 0, y: 0 }): Vec2 {
  return pointOnCircle(angleFromPoint(point, center), radius, center);
}
