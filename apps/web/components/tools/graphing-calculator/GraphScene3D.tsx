"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide } from "three";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import type { GraphKeyPoint, RealFunction } from "@tooloralabs/tools";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

export type GraphSceneMode = "plot" | "surface";

export type GraphScene3DProps = {
  f: RealFunction;
  xMin: number;
  xMax: number;
  yLo: number;
  yHi: number;
  mode: GraphSceneMode;
  traceX: number;
  slope: number | null;
  keyPoints: GraphKeyPoint[];
  fmt: (n: number) => string;
};

type V3 = [number, number, number];

const W = 6;
const H = 4;
const LIMIT = H / 2 + 0.4;
const DEPTH = 4;
const SURF_H = 2.2;

function Label({ position, color, children, bold = false }: { position: V3; color: string; children: ReactNode; bold?: boolean }) {
  return (
    <Label3D position={position} color={color} weight={bold ? 700 : 500}>
        {children}
      </Label3D>
  );
}

/** Splits the sampled curve into drawable pieces, breaking at undefined points, jumps and the clipping window. */
function curvePieces(f: RealFunction, sx: (x: number) => number, sy: (y: number) => number, xMin: number, xMax: number, z: number): V3[][] {
  const pieces: V3[][] = [];
  let cur: V3[] = [];
  const n = 400;
  let prevY: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = f(x);
    const Y = y === null ? null : sy(y);
    const out = Y === null || Math.abs(Y) > LIMIT || (prevY !== null && Math.abs(Y - prevY) > H * 0.6);
    if (out) {
      if (cur.length > 1) pieces.push(cur);
      cur = [];
      if (Y !== null && Math.abs(Y) <= LIMIT) cur.push([sx(x), Y, z]);
    } else cur.push([sx(x), Y as number, z]);
    prevY = Y;
  }
  if (cur.length > 1) pieces.push(cur);
  return pieces;
}

const KIND_COLOR: Record<GraphKeyPoint["kind"], "danger" | "positive" | "warning" | "accent" | "primary"> = {
  root: "danger",
  "y-intercept": "positive",
  maximum: "warning",
  minimum: "warning",
  inflection: "accent",
};

/** Heavy part of the graph drawing (three + drei); only loaded through next/dynamic inside Scene3D. */
export default function GraphScene3D({ f, xMin, xMax, yLo, yHi, mode, traceX, slope, keyPoints, fmt }: GraphScene3DProps) {
  const p = usePalette3D();
  const sx = (x: number) => ((x - xMin) / (xMax - xMin) - 0.5) * W;
  const yMid = (yLo + yHi) / 2;
  const kPlot = H / Math.max(1e-9, yHi - yLo);
  const absMax = Math.max(Math.abs(yLo), Math.abs(yHi), 1e-9);
  const kSurf = SURF_H / absMax;
  const plotY = (y: number) => (y - yMid) * kPlot;
  const surfY = (y: number) => y * kSurf;
  const sy = mode === "plot" ? plotY : surfY;

  const pieces = useMemo(() => curvePieces(f, sx, sy, xMin, xMax, 0), [f, xMin, xMax, yLo, yHi, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const surface = useMemo(() => {
    if (mode !== "surface") return null;
    const NX = 90;
    const NT = 36;
    const pos = new Float32Array((NX + 1) * (NT + 1) * 3);
    const col = new Float32Array((NX + 1) * (NT + 1) * 3);
    const ok: boolean[] = [];
    const lo = new Color(p.primary);
    const hi = new Color(p.warning);
    const mid = new Color(p.positive);
    const tmp = new Color();
    for (let j = 0; j <= NT; j++) {
      const t = -Math.PI + (2 * Math.PI * j) / NT;
      for (let i = 0; i <= NX; i++) {
        const x = xMin + ((xMax - xMin) * i) / NX;
        const y = f(x);
        const v = y === null ? null : y * Math.cos(t);
        const Y = v === null ? 0 : surfY(v);
        const k = j * (NX + 1) + i;
        ok[k] = v !== null && Math.abs(Y) <= LIMIT + 0.4;
        pos.set([sx(x), ok[k] ? Y : 0, (t / Math.PI) * (DEPTH / 2)], k * 3);
        const s = Math.max(-1, Math.min(1, Y / SURF_H));
        if (s < 0) tmp.copy(mid).lerp(lo, -s);
        else tmp.copy(mid).lerp(hi, s);
        col.set([tmp.r, tmp.g, tmp.b], k * 3);
      }
    }
    const idx: number[] = [];
    for (let j = 0; j < NT; j++) {
      for (let i = 0; i < NX; i++) {
        const a = j * (NX + 1) + i;
        const b = a + 1;
        const c = a + NX + 1;
        const d = c + 1;
        if (ok[a] && ok[b] && ok[c] && ok[d]) idx.push(a, c, b, b, c, d);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [f, xMin, xMax, yLo, yHi, mode, p.primary, p.warning, p.positive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => surface?.dispose(), [surface]);

  const ty = f(traceX);
  const TX = sx(traceX);
  const TY = ty === null ? null : sy(ty);
  const traceVisible = TY !== null && Math.abs(TY) <= LIMIT;
  let tangent: V3[] | null = null;
  if (traceVisible && slope !== null) {
    const k = mode === "plot" ? kPlot : kSurf;
    const dx = 1;
    const dy = (slope * k * (xMax - xMin)) / W;
    const len = Math.hypot(dx, dy);
    const ux = (0.9 * dx) / len;
    const uy = (0.9 * dy) / len;
    tangent = [
      [TX - ux, (TY as number) - uy, 0.01],
      [TX + ux, (TY as number) + uy, 0.01],
    ];
  }

  const zeroY = sy(0);
  const showXAxis = Math.abs(zeroY) <= LIMIT;
  const showYAxis = xMin <= 0 && xMax >= 0;

  return (
    <group>
      {/* back panel (plot) or floor grid (surface) */}
      {mode === "plot" ? (
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[W + 0.8, H + 1.2]} />
          <meshBasicMaterial color={p.dark ? "#1f1f23" : "#ffffff"} />
        </mesh>
      ) : (
        <gridHelper args={[W + 0.6, 12, p.grid, p.grid]} position={[0, -SURF_H - 0.25, 0]} />
      )}

      {/* grid lines (plot) */}
      {mode === "plot" &&
        [0, 0.25, 0.5, 0.75, 1].map((q) => (
          <group key={q}>
            <Line points={[[-W / 2, -H / 2 + q * H, 0], [W / 2, -H / 2 + q * H, 0]]} color={p.grid} lineWidth={1} />
            <Line points={[[-W / 2 + q * W, -H / 2, 0], [-W / 2 + q * W, H / 2, 0]]} color={p.grid} lineWidth={1} />
            <Label position={[-W / 2 - 0.45, -H / 2 + q * H, 0]} color={p.muted}>
              {fmt(yLo + q * (yHi - yLo))}
            </Label>
            <Label position={[-W / 2 + q * W, -H / 2 - 0.3, 0]} color={p.muted}>
              {fmt(xMin + q * (xMax - xMin))}
            </Label>
          </group>
        ))}

      {/* axes */}
      {showXAxis && <Line points={[[-W / 2, zeroY, 0.005], [W / 2, zeroY, 0.005]]} color={p.text} lineWidth={1.5} />}
      {showYAxis && (
        <Line
          points={[
            [sx(0), mode === "plot" ? -H / 2 : -SURF_H, 0.005],
            [sx(0), mode === "plot" ? H / 2 : SURF_H, 0.005],
          ]}
          color={p.text}
          lineWidth={1.5}
        />
      )}
      {mode === "surface" && <Line points={[[0, -SURF_H - 0.25, -DEPTH / 2], [0, -SURF_H - 0.25, DEPTH / 2]]} color={p.muted} lineWidth={1} />}

      {surface && (
        <mesh geometry={surface}>
          <meshStandardMaterial vertexColors side={DoubleSide} roughness={0.55} metalness={0.05} transparent opacity={0.85} />
        </mesh>
      )}

      {/* the curve itself */}
      {pieces.map((pts, i) => (
        <Line key={i} points={pts} color={p.primary} lineWidth={mode === "plot" ? 3 : 3.5} />
      ))}

      {/* key points */}
      {keyPoints.map((kp, i) => {
        const Y = sy(kp.y);
        if (Math.abs(Y) > LIMIT) return null;
        return (
          <mesh key={i} position={[sx(kp.x), Y, 0.02]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={p[KIND_COLOR[kp.kind]]} />
          </mesh>
        );
      })}

      {/* tracing point + tangent */}
      {tangent && <Line points={tangent} color={p.danger} lineWidth={2} dashed dashSize={0.12} gapSize={0.07} />}
      {traceVisible && (
        <group>
          <mesh position={[TX, TY as number, 0.03]}>
            <sphereGeometry args={[0.11, 20, 20]} />
            <meshStandardMaterial color={p.danger} emissive={p.danger} emissiveIntensity={0.3} />
          </mesh>
          <Label position={[TX, (TY as number) + 0.32, 0.03]} color={p.danger} bold>
            {`(${fmt(traceX)}, ${fmt(ty as number)})`}
          </Label>
        </group>
      )}
      {mode === "surface" && (
        <Label position={[0, SURF_H + 0.45, -DEPTH / 2]} color={p.muted}>
          z = f(x) · cos(t)
        </Label>
      )}
    </group>
  );
}
