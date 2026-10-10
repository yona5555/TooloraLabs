"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from "three";
import { Html, Line } from "@react-three/drei";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { formatMathValue, type CurveKeyKind, type CurvePlot } from "@tooloralabs/tools";

export type MathSolverScene3DProps = {
  plot: CurvePlot;
  showDerivative: boolean;
  labels: Record<CurveKeyKind, string>;
};

const HALF_W = 3;
const HALF_H = 1.8;
const RIBBON = 0.35;
const DERIV_Z = -1.1;

function Label({ position, color, children, bold = false }: { position: [number, number, number]; color: string; children: ReactNode; bold?: boolean }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <span style={{ color, fontSize: 11, fontWeight: bold ? 700 : 500, whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{children}</span>
    </Html>
  );
}

/** Splits a sampled curve into runs that stay inside the y window (so off-window parts are clipped, not flattened). */
function segments(points: { x: number; y: number }[], yLo: number, yHi: number): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  for (const pt of points) {
    if (pt.y >= yLo && pt.y <= yHi) cur.push(pt);
    else if (cur.length) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out.filter((s) => s.length > 1);
}

function scaleFor(plot: CurvePlot) {
  const [xLo, xHi] = plot.xRange;
  const [yLo, yHi] = plot.yRange;
  return {
    sx: (x: number) => ((x - xLo) / (xHi - xLo || 1)) * 2 * HALF_W - HALF_W,
    sy: (y: number) => ((y - yLo) / (yHi - yLo || 1)) * 2 * HALF_H - HALF_H,
  };
}

/** Ribbon surface: the curve swept along z, so y = f(x) reads as a solid band in 3D. */
function buildRibbon(plot: CurvePlot): BufferGeometry {
  const { sx, sy } = scaleFor(plot);
  const g = new BufferGeometry();
  const pos: number[] = [];
  const idx: number[] = [];
  plot.samples.forEach((s, i) => {
    const X = sx(s.x);
    const Y = sy(s.y);
    pos.push(X, Y, -RIBBON, X, Y, RIBBON);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Heavy part of the math-solver live 3D curve; only loaded through next/dynamic inside Scene3D. */
export default function MathSolverScene3D({ plot, showDerivative, labels }: MathSolverScene3DProps) {
  const p = usePalette3D();
  const [xLo, xHi] = plot.xRange;
  const [yLo, yHi] = plot.yRange;
  const { sx, sy } = scaleFor(plot);
  const yAxis0 = sy(0);
  const xAxis0 = xLo <= 0 && xHi >= 0 ? sx(0) : null;

  const ribbon = useMemo(() => buildRibbon(plot), [plot]);
  useEffect(() => () => ribbon.dispose(), [ribbon]);

  const derivSegs = showDerivative ? segments(plot.derivativeSamples, yLo, yHi) : [];
  const keyColor: Record<CurveKeyKind, string> = { root: p.danger, vertex: p.accent, critical: p.accent, "y-intercept": p.warning };

  return (
    <group>
      {/* axes */}
      <Line points={[[-HALF_W - 0.3, yAxis0, 0], [HALF_W + 0.3, yAxis0, 0]]} color={p.muted} lineWidth={1.5} />
      {xAxis0 !== null ? <Line points={[[xAxis0, -HALF_H - 0.2, 0], [xAxis0, HALF_H + 0.2, 0]]} color={p.muted} lineWidth={1.5} /> : null}
      <Label position={[HALF_W + 0.5, yAxis0, 0]} color={p.muted}>x</Label>
      {xAxis0 !== null ? <Label position={[xAxis0, HALF_H + 0.4, 0]} color={p.muted}>y</Label> : null}
      <Label position={[-HALF_W, yAxis0 - 0.25, 0.4]} color={p.muted}>{formatMathValue(xLo)}</Label>
      <Label position={[HALF_W, yAxis0 - 0.25, 0.4]} color={p.muted}>{formatMathValue(xHi)}</Label>
      <Label position={[-HALF_W - 0.45, HALF_H, 0]} color={p.muted}>{formatMathValue(yHi)}</Label>
      <Label position={[-HALF_W - 0.45, -HALF_H, 0]} color={p.muted}>{formatMathValue(yLo)}</Label>
      {/* back grid plane */}
      <mesh position={[0, 0, -RIBBON - 0.02]}>
        <planeGeometry args={[HALF_W * 2 + 0.6, HALF_H * 2 + 0.4]} />
        <meshBasicMaterial color={p.grid} transparent opacity={0.18} side={DoubleSide} depthWrite={false} />
      </mesh>

      {/* f(x) */}
      <mesh geometry={ribbon}>
        <meshStandardMaterial color={p.primary} transparent opacity={0.55} side={DoubleSide} roughness={0.5} />
      </mesh>
      <Line points={plot.samples.map((s) => [sx(s.x), sy(s.y), RIBBON] as [number, number, number])} color={p.primary} lineWidth={3} />
      <Label position={[sx(plot.samples[plot.samples.length - 1].x) + 0.35, sy(plot.samples[plot.samples.length - 1].y), RIBBON]} color={p.primary} bold>
        f(x)
      </Label>

      {/* f'(x) behind, in its own plane */}
      {derivSegs.map((seg, i) => (
        <Line key={i} points={seg.map((s) => [sx(s.x), sy(s.y), DERIV_Z] as [number, number, number])} color={p.positive} lineWidth={2} dashed dashSize={0.15} gapSize={0.08} />
      ))}
      {derivSegs.length > 0 ? (
        <Label position={[sx(derivSegs[0][0].x), sy(derivSegs[0][0].y) + 0.25, DERIV_Z]} color={p.positive} bold>
          {"f′(x)"}
        </Label>
      ) : null}

      {/* key points */}
      {plot.keyPoints.map((k, i) => {
        if (k.y < yLo || k.y > yHi) return null;
        const pos: [number, number, number] = [sx(k.x), sy(k.y), RIBBON];
        return (
          <group key={i}>
            <mesh position={pos}>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color={keyColor[k.kind]} emissive={keyColor[k.kind]} emissiveIntensity={0.25} />
            </mesh>
            <Label position={[pos[0], pos[1] + (k.kind === "root" ? -0.32 : 0.32), pos[2]]} color={keyColor[k.kind]} bold>
              {`${labels[k.kind]} (${formatMathValue(k.x)}, ${formatMathValue(k.y)})`}
            </Label>
          </group>
        );
      })}
    </group>
  );
}
