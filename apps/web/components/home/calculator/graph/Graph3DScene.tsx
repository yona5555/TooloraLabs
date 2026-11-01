"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { axisTicks, sampleCurve, sampleSurface, type SurfaceGrid } from "@tooloralabs/tools";
import Label3D from "@/components/tool-ui/three/Label3D";
import { fmtTick, heightColor, type PlotFunction } from "./graphShared";
import { SceneMotion, useSceneHost } from "@/components/tool-ui/motion/scene-motion";

export type Graph3DSceneProps = {
  fns: PlotFunction[];
  /** Half-width of the square x/y domain shown. */
  range: number;
  dark: boolean;
  wireframe: boolean;
  /** The visitor's Auto-rotate button: a bounded episode (GraphCalculator), off screen or hidden it stops. */
  autoRotate: boolean;
};

const HALF = 3; // world half-size of the x/y square
const HEIGHT = 2; // world half-height of the z range
const RIBBON = 0.32;

type Mapped = { kind: "surface"; fn: PlotFunction; grid: SurfaceGrid } | { kind: "ribbon"; fn: PlotFunction; depth: number };

function surfaceGeometry(grid: SurfaceGrid, toY: (z: number) => number, zMin: number, zMax: number) {
  const { n, z } = grid;
  const pos = new Float32Array((n + 1) * (n + 1) * 3);
  const col = new Float32Array((n + 1) * (n + 1) * 3);
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const k = j * (n + 1) + i;
      const v = z[k];
      pos[k * 3] = -HALF + (2 * HALF * i) / n;
      pos[k * 3 + 1] = v === null ? 0 : toY(v);
      pos[k * 3 + 2] = HALF - (2 * HALF * j) / n; // math y grows away from the viewer
      const [r, g, b] = heightColor(v === null ? 0 : (v - zMin) / (zMax - zMin || 1));
      col.set([r, g, b], k * 3);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i;
      const b = a + 1;
      const c = a + n + 1;
      const d = c + 1;
      if (z[a] === null || z[b] === null || z[c] === null || z[d] === null) continue;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  // wire grid: every 4th row/column as line segments over defined cells
  const wire: number[] = [];
  const step = Math.max(1, Math.round(n / 16));
  const at = (k: number) => [pos[k * 3], pos[k * 3 + 1] + 0.004, pos[k * 3 + 2]];
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const k = j * (n + 1) + i;
      if (z[k] === null) continue;
      if (j % step === 0 && i < n && z[k + 1] !== null) wire.push(...at(k), ...at(k + 1));
      if (i % step === 0 && j < n && z[k + n + 1] !== null) wire.push(...at(k), ...at(k + n + 1));
    }
  }
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute("position", new THREE.Float32BufferAttribute(wire, 3));
  return { geo, wireGeo };
}

function ribbonGeometry(points: { x: number; y: number }[][], depth: number) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (const seg of points) {
    const base = pos.length / 3;
    seg.forEach((p, i) => {
      pos.push(p.x, p.y, depth - RIBBON, p.x, p.y, depth + RIBBON);
      if (i > 0) {
        const a = base + (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Heavy 3D part (three + fiber + drei), only loaded through Graph3D's dynamic()
 * import. z = f(x, y) renders as a height-coloured surface with an optional
 * wire grid; one-variable curves render as ribbons extruded along depth.
 */
export default function Graph3DScene({ fns, range, dark, wireframe, autoRotate }: Graph3DSceneProps) {
  const scene = useMemo(() => {
    const r = Math.max(0.5, range);
    const items: Mapped[] = [];
    const curves = fns.filter((f) => f.graph.kind === "curve");
    // with a surface present the height range follows the surfaces, so a steep curve cannot flatten them
    const surfaceLed = curves.length < fns.length;
    let lo = Infinity;
    let hi = -Infinity;
    for (const fn of fns) {
      if (fn.graph.kind === "surface") {
        const grid = sampleSurface(fn.graph.evaluate, r, 72);
        lo = Math.min(lo, grid.zMin);
        hi = Math.max(hi, grid.zMax);
        items.push({ kind: "surface", fn, grid });
      } else {
        const k = curves.indexOf(fn);
        items.push({ kind: "ribbon", fn, depth: (k - (curves.length - 1) / 2) * 1.1 });
        const vals: number[] = [];
        for (let i = 0; i <= 240; i++) {
          const v = fn.graph.curve(-r + (2 * r * i) / 240);
          if (v !== null) vals.push(v);
        }
        vals.sort((a, b) => a - b);
        if (vals.length && !surfaceLed) {
          lo = Math.min(lo, vals[Math.floor(vals.length * 0.03)]);
          hi = Math.max(hi, vals[Math.ceil(vals.length * 0.97) - 1]);
        }
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      lo = -1;
      hi = 1;
    }
    if (hi - lo < 1e-9) {
      lo -= 1;
      hi += 1;
    }
    const toY = (z: number) => -HEIGHT + ((z - lo) / (hi - lo)) * 2 * HEIGHT;
    const toX = (x: number) => (x / r) * HALF;
    const built = items.map((it) => {
      if (it.kind === "surface") return { ...it, ...surfaceGeometry(it.grid, toY, lo, hi) };
      // cut the ribbon where it leaves the height range instead of flattening it against the box
      const segs: { x: number; y: number }[][] = [];
      for (const s of sampleCurve(it.fn.graph.curve, -r, r, lo, hi, 360)) {
        let cur: { x: number; y: number }[] = [];
        for (const p of s) {
          if (p.y < lo || p.y > hi) {
            if (cur.length > 1) segs.push(cur);
            cur = [];
          } else cur.push({ x: toX(p.x), y: toY(p.y) });
        }
        if (cur.length > 1) segs.push(cur);
      }
      return { ...it, geo: ribbonGeometry(segs, it.depth), edges: segs };
    });
    return { r, lo, hi, toY, toX, built, zTicks: axisTicks(lo, hi, 4), xTicks: axisTicks(-r, r, 4) };
  }, [fns, range]);

  const text = dark ? "#e4e4e7" : "#27272a";
  const muted = dark ? "#a1a1aa" : "#52525b";
  const axis = dark ? "#a1a1aa" : "#3f3f46";
  const y0 = Math.min(HEIGHT, Math.max(-HEIGHT, scene.toY(0)));
  const floor = -HEIGHT - 0.02;
  // tool-ui/motion: on demand only; rotating only while the visitor's episode runs and motion is allowed
  const host = useRef<HTMLDivElement>(null);
  const { frameloop, motion } = useSceneHost(host);
  const rotating = autoRotate && motion;

  return (
    <div ref={host} className="h-full w-full">
    <Canvas dpr={[1, 2]} camera={{ position: [6.4, 4.6, 6.4], fov: 42 }} frameloop={rotating ? "always" : frameloop} gl={{ antialias: true, alpha: true }}>
      <SceneMotion motion={motion} frameloop={frameloop}>
      <ambientLight intensity={dark ? 0.6 : 0.75} />
      <directionalLight position={[6, 10, 6]} intensity={dark ? 0.9 : 1.05} />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} />

      <gridHelper args={[2 * HALF, 12, dark ? "#52525b" : "#94a3b8", dark ? "#3f3f46" : "#cbd5e1"]} position={[0, floor, 0]} />

      {scene.built.map((it) =>
        it.kind === "surface" ? (
          <group key={it.fn.id}>
            <mesh geometry={it.geo}>
              <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.55} metalness={0.05} />
            </mesh>
            {wireframe && (
              <lineSegments geometry={it.wireGeo}>
                <lineBasicMaterial color={dark ? "#0a0a0a" : "#1e293b"} transparent opacity={0.45} />
              </lineSegments>
            )}
          </group>
        ) : (
          <group key={it.fn.id}>
            <mesh geometry={it.geo}>
              <meshStandardMaterial color={it.fn.color} side={THREE.DoubleSide} roughness={0.45} transparent opacity={0.88} />
            </mesh>
            {it.edges.map((s, i) => (
              <Line key={i} points={s.map((p) => [p.x, p.y, it.depth + RIBBON] as [number, number, number])} color={it.fn.color} lineWidth={2} />
            ))}
          </group>
        ),
      )}

      {/* axes: x (right), y (depth), z (up) */}
      <Line points={[[-HALF - 0.3, y0, 0], [HALF + 0.5, y0, 0]]} color={axis} lineWidth={1.5} />
      <Line points={[[0, y0, HALF + 0.3], [0, y0, -HALF - 0.5]]} color={axis} lineWidth={1.5} />
      <Line points={[[-HALF, -HEIGHT, -HALF], [-HALF, HEIGHT + 0.4, -HALF]]} color={axis} lineWidth={1.5} />
      <Label3D position={[HALF + 0.8, y0, 0]} color={text} fontSize={13} weight={700} text="x" />
      <Label3D position={[0, y0, -HALF - 0.8]} color={text} fontSize={13} weight={700} text="y" />
      <Label3D position={[-HALF, HEIGHT + 0.7, -HALF]} color={text} fontSize={13} weight={700} text="z" />
      {scene.xTicks.major
        .filter((v) => v !== 0)
        .map((v) => (
          <group key={`t${v}`}>
            <Label3D position={[scene.toX(v), floor, HALF + 0.35]} color={muted} fontSize={10} text={fmtTick(v, scene.xTicks.step)} />
            <Label3D position={[HALF + 0.35, floor, -scene.toX(v)]} color={muted} fontSize={10} text={fmtTick(v, scene.xTicks.step)} />
          </group>
        ))}
      {scene.zTicks.major.map((v) => (
        <Label3D key={`z${v}`} position={[-HALF - 0.3, scene.toY(v), -HALF]} color={muted} fontSize={10} align="right" text={fmtTick(v, scene.zTicks.step)} />
      ))}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={3} maxDistance={22} autoRotate={rotating} autoRotateSpeed={1.2} />
      </SceneMotion>
    </Canvas>
    </div>
  );
}
