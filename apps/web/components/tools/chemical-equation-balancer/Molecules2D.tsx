"use client";
import { elRadius, elToken, moleculeLayout } from "./chemMath";

/**
 * SVG twin of the 3D ball-and-stick molecules (front projection, same CPK colour tokens), used by
 * the 2D fallbacks so a scene without WebGL still shows the same molecules.
 */
export function SvgMolecule({ formula, x, y, size, lit = false }: { formula: string; x: number; y: number; size: number; lit?: boolean }) {
  const lay = moleculeLayout(formula).map((a) => ({ ...a, sx: x + a.p[0] * size, sy: y - a.p[1] * size, z: a.p[2] }));
  const order = [...lay.keys()].sort((i, j) => lay[i].z - lay[j].z);
  return (
    <g>
      {lay.slice(1).map((a, i) => (
        <line key={`b${i}`} x1={lay[0].sx} y1={lay[0].sy} x2={a.sx} y2={a.sy} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={Math.max(1, size * 0.07)} />
      ))}
      {order.map((i) => (
        <circle
          key={i}
          cx={lay[i].sx}
          cy={lay[i].sy}
          r={size * 0.17 * elRadius(lay[i].el)}
          style={{ fill: `var(${elToken(lay[i].el)})`, stroke: lit ? "var(--ph-focus)" : "var(--ph-line)" }}
          strokeWidth={lit ? 2 : 0.8}
        />
      ))}
    </g>
  );
}
