"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { analyzeProjectile, sampleTrajectory, type ProjectileAnalysis } from "@tooloralabs/tools";

export type PmScene3DProps = { a: ProjectileAnalysis; fmt: (n: number, max?: number) => string };

type P3 = [number, number, number];

const FIT_W = 5.6;
const FIT_H = 3.0;
const PATH_POINTS = 90;
const STROBES = 10;
const DEPTH = 2.4;

function arrowParts(rel: P3) {
  const v = new THREE.Vector3(...rel);
  const len = v.length();
  const head = Math.min(0.24, len * 0.35);
  const dir = len > 1e-9 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0);
  const shaftEnd = dir.clone().multiplyScalar(Math.max(0, len - head)).toArray() as P3;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const conePos = dir.clone().multiplyScalar(len - head / 2).toArray() as P3;
  return { len, head, shaftEnd, q, conePos };
}

function Arrow({ from, rel, color, width = 3 }: { from: P3; rel: P3; color: string; width?: number }) {
  const { len, head, shaftEnd, q, conePos } = arrowParts(rel);
  if (len < 1e-4) return null;
  return (
    <group position={from}>
      <Line points={[[0, 0, 0], shaftEnd]} color={color} lineWidth={width} />
      <mesh position={conePos} quaternion={q}>
        <coneGeometry args={[head * 0.4, head, 18]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

type LabelItem = {
  id: string;
  pos: P3;
  text: string;
  color: string;
  align?: "center" | "left" | "right";
  /** Screen offset in CSS px (+x right, +y up). */
  offset?: [number, number];
  fontSize?: number;
  weight?: number;
};

const PAD_X = 6;
const PAD_Y = 2;
const EDGE = 4;

/** Same box Label3D draws (monospace pill), slightly generous so estimates never under-size. */
function labelBox(item: LabelItem) {
  const fs = item.fontSize ?? 11;
  const w = Math.ceil([...item.text].length * fs * 0.64) + PAD_X * 2 + 6;
  const h = Math.ceil(fs * 1.35) + PAD_Y * 2 + 2;
  return { w, h };
}

type Layout = { hidden: Set<string>; shift: Record<string, [number, number]> };

/**
 * Screen-space label layout: every frame each label's pill is projected to the canvas, nudged
 * back inside the canvas edges, and placed in priority order; a label whose pill would touch one
 * already placed is hidden, so labels never overlap or get cut off at any value or rotation
 * (they reappear as soon as there is room).
 */
function Labels({ items, bg }: { items: LabelItem[]; bg: string }) {
  const [layout, setLayout] = useState<Layout>({ hidden: new Set(), shift: {} });
  const last = useRef("");
  const group = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const g = group.current;
    if (!g) return;
    const placed: [number, number, number, number][] = [];
    const hidden = new Set<string>();
    const shift: Record<string, [number, number]> = {};
    for (const item of items) {
      v.set(...item.pos).applyMatrix4(g.matrixWorld).project(camera);
      if (v.z > 1 || v.z < -1) {
        hidden.add(item.id);
        continue;
      }
      const sx = ((v.x + 1) / 2) * size.width;
      const sy = ((1 - v.y) / 2) * size.height;
      const { w, h } = labelBox(item);
      const [ox, oy] = item.offset ?? [0, 0];
      let cx = sx + ox + (item.align === "left" ? w / 2 : item.align === "right" ? -w / 2 : 0);
      let cy = sy - oy;
      // keep the pill inside the canvas (rounded to 2 px so the layout settles)
      const dx = cx - w / 2 < EDGE ? EDGE - (cx - w / 2) : cx + w / 2 > size.width - EDGE ? size.width - EDGE - (cx + w / 2) : 0;
      const dy = cy - h / 2 < EDGE ? EDGE - (cy - h / 2) : cy + h / 2 > size.height - EDGE ? size.height - EDGE - (cy + h / 2) : 0;
      const sdx = Math.ceil(Math.abs(dx) / 2) * 2 * Math.sign(dx);
      const sdy = Math.ceil(Math.abs(dy) / 2) * 2 * Math.sign(dy);
      cx += sdx;
      cy += sdy;
      const r: [number, number, number, number] = [cx - w / 2 - 2, cy - h / 2 - 2, cx + w / 2 + 2, cy + h / 2 + 2];
      const clash = placed.some((q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
      if (clash) hidden.add(item.id);
      else {
        placed.push(r);
        if (sdx || sdy) shift[item.id] = [sdx, -sdy];
      }
    }
    const key = `${[...hidden].join("|")}#${Object.entries(shift)
      .map(([k, [x, y]]) => `${k}:${x},${y}`)
      .join("|")}`;
    if (key !== last.current) {
      last.current = key;
      setLayout({ hidden, shift });
    }
  });
  return (
    <group ref={group}>
      {items.map((item) => {
        const [ox, oy] = item.offset ?? [0, 0];
        const [sx, sy] = layout.shift[item.id] ?? [0, 0];
        return (
          <Label3D
            key={item.id}
            position={item.pos}
            text={item.text}
            color={item.color}
            bg={bg}
            align={item.align}
            offset={[ox + sx, oy + sy]}
            fontSize={item.fontSize}
            weight={item.weight ?? 600}
            visible={!layout.hidden.has(item.id)}
          />
        );
      })}
    </group>
  );
}

/** Fits the camera zoom to the scene's real extents for the canvas' own size (leaving room for the side labels). */
function FitCamera({ points, yaw, fitKey }: { points: P3[]; yaw: number; fitKey: string }) {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  useEffect(() => {
    const { camera, invalidate } = get();
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const m = new THREE.Matrix4().makeRotationY(yaw);
    const v = new THREE.Vector3();
    let ax = 1e-6;
    let ay = 1e-6;
    for (const p of points) {
      v.set(...p).applyMatrix4(m).project(camera);
      ax = Math.max(ax, Math.abs(v.x));
      ay = Math.max(ay, Math.abs(v.y));
    }
    const availX = Math.max(0.35, 1 - Math.min(200, width * 0.3) / Math.max(1, width));
    const availY = Math.max(0.35, 1 - 70 / Math.max(1, height));
    camera.zoom = Math.max(0.2, Math.min(3, availX / ax, availY / ay));
    camera.updateProjectionMatrix();
    invalidate();
    // fitKey stands for `points`, which is rebuilt every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, width, height, yaw, fitKey]);
  return null;
}

function niceStep(span: number): number {
  const raw = span / 4;
  if (!(raw > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/**
 * Heavy part of the live 3D drawing (only loaded through next/dynamic inside Scene3D): the real
 * parabola of the current launch over a ground strip, ten strobe balls at equal time steps, the
 * launch velocity with its vₓ / vy components, the constant vₓ at the apex, the impact velocity,
 * the h_max and R dimension lines, and the optimal-angle trajectory as a dashed ghost. Equal
 * scales on both axes, so every angle on screen is the true angle. In a tall, narrow canvas the
 * flight turns diagonally into depth so it fills the height instead of shrinking to a strip.
 */
export default function PmScene3D({ a, fmt }: PmScene3DProps) {
  const p = usePalette3D();
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const yaw = width / Math.max(1, height) < 0.85 ? -0.7 : 0;
  const opt = analyzeProjectile({ speed: a.speed, angle: a.optimalAngle, height: a.height, gravity: a.gravity });

  const spanX = Math.max(a.maxRange, a.range);
  const spanY = Math.max(a.maxHeight, opt?.maxHeight ?? 0);
  const s = spanX < 1e-9 && spanY < 1e-9 ? 1 : Math.min(spanX > 1e-9 ? FIT_W / spanX : Infinity, spanY > 1e-9 ? FIT_H / spanY : Infinity);
  const x0 = -(spanX * s) / 2;
  const G = -(spanY * s) / 2 - 0.1;
  const to3 = (x: number, y: number, z = 0): P3 => [x0 + x * s, G + y * s, z];

  const path = sampleTrajectory(a, PATH_POINTS).map((q) => to3(q.x, q.y));
  const optPath = opt && Math.abs(opt.angle - a.angle) > 0.5 ? sampleTrajectory(opt, PATH_POINTS).map((q) => to3(q.x, q.y)) : null;
  const strobes = sampleTrajectory(a, STROBES);

  const launch = to3(0, a.height);
  const apex = to3(a.apexX, a.maxHeight);
  const impact = to3(a.range, 0);
  const vScale = 1.15 / Math.max(a.speed, a.impactSpeed, 1e-9);
  const groundW = Math.max(spanX * s, 1) + 1.4;
  const groundCx = x0 + (spanX * s) / 2;
  const dimZ = 0.75;

  const step = niceStep(spanX);
  const ticks: number[] = [];
  if (spanX > 1e-9) for (let x = 0; x <= spanX + 1e-9 && ticks.length < 12; x += step) ticks.push(x);

  const labels: LabelItem[] = [
    { id: "range", pos: [x0 + (a.range * s) / 2, G, dimZ], text: `R = ${fmt(a.range)} m`, color: p.positive, offset: [0, -16], weight: 700 },
    { id: "hmax", pos: apex, text: `h = ${fmt(a.maxHeight)} m`, color: p.warning, offset: [0, 18], weight: 700 },
    { id: "v0", pos: launch, text: `v₀ = ${fmt(a.speed)} m/s`, color: p.primary, align: "right", offset: [-12, 0], weight: 700 },
    { id: "vi", pos: impact, text: `v = ${fmt(a.impactSpeed)} m/s`, color: p.danger, align: "left", offset: [12, 0], weight: 700 },
    { id: "theta", pos: launch, text: `θ = ${fmt(a.angle, 1)}°`, color: p.primary, align: "right", offset: [-12, -20] },
    { id: "beta", pos: impact, text: `β = ${fmt(a.impactAngle, 1)}°`, color: p.danger, align: "left", offset: [12, -20] },
    { id: "t", pos: impact, text: `t = ${fmt(a.timeOfFlight)} s`, color: p.text, align: "left", offset: [12, 20] },
    { id: "vx", pos: [apex[0] + a.vx * vScale, apex[1], 0], text: `vₓ = ${fmt(a.vx)} m/s`, color: p.accent, align: "left", offset: [8, 0] },
  ];
  if (optPath && opt) {
    const optApex = to3(opt.apexX, opt.maxHeight);
    labels.push({ id: "opt", pos: optApex, text: `θ* = ${fmt(opt.angle, 1)}° → ${fmt(opt.range)} m`, color: p.muted, offset: [0, 18] });
  }
  if (a.height > 0) labels.push({ id: "h0", pos: to3(0, a.height / 2), text: `h₀ = ${fmt(a.height)} m`, color: p.muted, align: "right", offset: [-12, 0] });
  ticks.forEach((x, i) => labels.push({ id: `tick${i}`, pos: to3(x, 0, 1.15), text: fmt(x, 1), color: p.muted, fontSize: 10, weight: 500 }));

  const fitPoints: P3[] = [
    [groundCx - groundW / 2, G, -DEPTH / 2],
    [groundCx + groundW / 2, G, -DEPTH / 2],
    [groundCx - groundW / 2, G, DEPTH / 2],
    [groundCx + groundW / 2, G, DEPTH / 2],
    to3(0, spanY),
    to3(spanX, spanY),
  ];
  const fitKey = `${s.toFixed(4)}|${spanX.toFixed(4)}|${spanY.toFixed(4)}`;

  return (
    <>
      <FitCamera points={fitPoints} yaw={yaw} fitKey={fitKey} />
      <group rotation={[0, yaw, 0]}>
        {/* ground strip */}
        <mesh position={[groundCx, G - 0.03, 0]}>
          <boxGeometry args={[groundW, 0.04, DEPTH]} />
          <meshStandardMaterial color={p.grid} />
        </mesh>
        {ticks.map((x, i) => (
          <mesh key={i} position={to3(x, 0, 1.0)}>
            <boxGeometry args={[0.02, 0.012, 0.22]} />
            <meshBasicMaterial color={p.muted} />
          </mesh>
        ))}

        {/* launch platform */}
        {a.height > 0 && (
          <mesh position={[launch[0] - 0.12, G + (a.height * s) / 2, 0]}>
            <boxGeometry args={[0.24, a.height * s, 0.5]} />
            <meshStandardMaterial color={p.muted} transparent opacity={0.55} />
          </mesh>
        )}

        {/* optimal-angle ghost and the real trajectory */}
        {optPath && <Line points={optPath} color={p.muted} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.08} />}
        {path.length > 1 && <Line points={path} color={p.primary} lineWidth={3} />}

        {/* strobe balls at equal Δt: equal horizontal spacing, shrinking then growing vertical spacing */}
        {strobes.map((q, i) => (
          <mesh key={i} position={to3(q.x, q.y)}>
            <sphereGeometry args={[i === 0 || i === STROBES ? 0.075 : 0.06, 20, 14]} />
            <meshStandardMaterial color={i === 0 ? p.primary : i === STROBES ? p.danger : p.faces[5]} roughness={0.35} />
          </mesh>
        ))}

        {/* h_max: dashed drop from the apex; R: dimension line on the ground */}
        {a.maxHeight > 0 && <Line points={[to3(a.apexX, 0), apex]} color={p.warning} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.06} />}
        {a.range > 0 && <Line points={[to3(0, 0, dimZ), to3(a.range, 0, dimZ)]} color={p.positive} lineWidth={2.5} />}

        {/* velocity vectors: launch v₀ with components, apex vₓ, impact v */}
        <Arrow from={launch} rel={[a.vx * vScale, a.vy * vScale, 0]} color={p.primary} width={3.5} />
        <Arrow from={launch} rel={[a.vx * vScale, 0, 0]} color={p.accent} width={2} />
        <Arrow from={launch} rel={[0, a.vy * vScale, 0]} color={p.positive} width={2} />
        <Arrow from={apex} rel={[a.vx * vScale, 0, 0]} color={p.accent} width={2.5} />
        {/* the impact arrow ends on the landing point, so it stays above the ground */}
        <Arrow from={[impact[0] - a.vx * vScale, impact[1] - a.impactVy * vScale, 0]} rel={[a.vx * vScale, a.impactVy * vScale, 0]} color={p.danger} width={3.5} />

        <Labels items={labels} bg={p.dark ? "#18181bd9" : "#f8fafcd9"} />
      </group>
    </>
  );
}
