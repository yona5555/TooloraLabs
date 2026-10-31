"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

type P3 = [number, number, number];

export type WorkSceneData = {
  kind: "work";
  angle: number;
  force: number;
  labels: { force: string; parallel: string; perpendicular: string; angle: string; distance: string; work: string };
};

export type KineticSceneData = {
  kind: "kinetic";
  mass: number;
  velocity: number;
  /** KE at v/2, v, 2v (J). */
  energies: number[];
  labels: { mass: string; velocity: string; energy: string; columns: string[] };
};

export type PotentialSceneData = {
  kind: "potential";
  mass: number;
  height: number;
  fallTime: number;
  labels: { mass: string; height: string; energy: string; impact: string; pe: string; ke: string };
};

export type PowerSceneData = {
  kind: "power";
  /** Number of equal time slices the work is stacked in (1…10). */
  slabs: number;
  labels: { work: string; power: string; time: string; slab: string };
};

export type EnergyScene3DProps = { data: WorkSceneData | KineticSceneData | PotentialSceneData | PowerSceneData };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const log = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-30));

/** Straight arrow from `from` to `to` (shaft + cone head). */
function Arrow({ from, to, color, width = 4 }: { from: P3; to: P3; color: string; width?: number }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const v = b.clone().sub(a);
  const len = v.length();
  if (len < 1e-6) return null;
  const head = Math.min(0.3, len * 0.4);
  const dir = v.clone().normalize();
  const shaftEnd = a.clone().add(dir.clone().multiplyScalar(len - head));
  const conePos = a.clone().add(dir.clone().multiplyScalar(len - head / 2));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <group>
      <Line points={[from, shaftEnd.toArray() as P3]} color={color} lineWidth={width} />
      <mesh position={conePos.toArray() as P3} quaternion={q}>
        <coneGeometry args={[head * 0.42, head, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/**
 * Loop clock for the demand-rendered canvas: for MOVE_SECONDS after `period` changes (never on load, so an idle page
 * draws nothing) calls `onPhase(phase 0…1)` every frame of a `period`-second cycle. At rest, and with reduced motion,
 * it renders `still` once.
 */
const MOVE_SECONDS = 8;

function useLoop(period: number, onPhase: (phase: number) => void, still = 1) {
  const invalidate = useThree((s) => s.invalidate);
  const reduced = useRef<boolean | null>(null);
  const start = useRef<number | null>(null);
  const shownPeriod = useRef(period);
  const moveLeft = useRef(0);
  useEffect(() => {
    if (shownPeriod.current !== period) moveLeft.current = MOVE_SECONDS;
    shownPeriod.current = period;
    invalidate();
  }, [invalidate, period]);
  useFrame((state, delta) => {
    if (reduced.current === null) reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced.current || moveLeft.current <= 0) {
      onPhase(still);
      return;
    }
    moveLeft.current -= Math.min(delta, 0.1);
    const now = state.clock.getElapsedTime();
    if (start.current === null) start.current = now;
    onPhase(((now - start.current) % period) / period);
    state.invalidate();
  });
}

/** Work: a block dragged along its displacement d by a force F at angle θ, split into F cos θ (does work) and F sin θ (does none). */
function WorkScene({ d }: { d: WorkSceneData }) {
  const p = usePalette3D();
  const X0 = -2.3;
  const D = 3.6;
  const S = 0.8;
  const block = useRef<THREE.Group>(null);
  useLoop(3.2, (ph) => {
    // ease-in-out run over 75 % of the cycle, then hold at the end
    const k = Math.min(1, ph / 0.75);
    const e = k * k * (3 - 2 * k);
    if (block.current) block.current.position.x = X0 + D * e;
  });
  const th = (d.angle * Math.PI) / 180;
  const L = 1.5;
  const fx = L * Math.cos(th);
  const fy = L * Math.sin(th);
  const c: P3 = [0, S / 2, 0];
  const arc = Array.from({ length: 25 }, (_, i) => {
    const a = (th * i) / 24;
    return [0.55 * Math.cos(a), S / 2 + 0.55 * Math.sin(a), 0] as P3;
  });
  return (
    <group position={[0, -1.4, 0]}>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[7.6, 0.08, 1.8]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {/* where the block ends after the displacement */}
      <mesh position={[X0 + D, S / 2, 0]}>
        <boxGeometry args={[S, S, S]} />
        <meshStandardMaterial color={p.primary} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* displacement d in front of the track */}
      <Arrow from={[X0, 0.02, 0.95]} to={[X0 + D, 0.02, 0.95]} color={p.accent} width={3.5} />
      <Label3D position={[X0 + D / 2, -0.32, 0.95]} color={p.accent} weight={700}>
        {d.labels.distance}
      </Label3D>
      <group ref={block} position={[X0, 0, 0]}>
        <mesh position={c}>
          <boxGeometry args={[S, S, S]} />
          <meshStandardMaterial color={p.primary} roughness={0.45} />
        </mesh>
        <Arrow from={c} to={[fx, S / 2 + fy, 0]} color={p.danger} width={5} />
        {Math.abs(fx) > 0.05 && <Arrow from={c} to={[fx, S / 2, 0.02]} color={p.positive} width={3.5} />}
        {Math.abs(fy) > 0.05 && <Line points={[[fx, S / 2, 0], [fx, S / 2 + fy, 0]]} color={p.muted} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.06} />}
        {Math.abs(th) > 0.02 && <Line points={arc} color={p.warning} lineWidth={2} />}
      </group>
      {/* labels stay on fixed rows above the track, so they never collide with the moving block */}
      <Label3D position={[0, 3.35, 0]} color={p.text} weight={700}>
        {d.labels.work}
      </Label3D>
      <Label3D position={[-1.6, 2.85, 0]} color={p.danger} weight={700}>
        {d.labels.force}
      </Label3D>
      <Label3D position={[1.6, 2.85, 0]} color={p.warning} weight={700}>
        {d.labels.angle}
      </Label3D>
      <Label3D position={[-1.6, 2.4, 0]} color={p.positive} weight={700}>
        {d.labels.parallel}
      </Label3D>
      <Label3D position={[1.6, 2.4, 0]} color={p.muted}>
        {d.labels.perpendicular}
      </Label3D>
    </group>
  );
}

/** Kinetic energy: a cart rolling at speed v, with KE columns for v/2, v and 2v behind it (1 : 4 : 16). */
function KineticScene({ d }: { d: KineticSceneData }) {
  const p = usePalette3D();
  const s = 0.55 + 0.35 * clamp((log(d.mass) + 1) / 6, 0, 1);
  const cart = useRef<THREE.Group>(null);
  // Visual speed grows with log(v) so slow walkers and fast cars both read.
  const vis = d.velocity > 0 ? 0.6 + 0.9 * clamp(log(d.velocity) / 3, 0, 1) : 0;
  const span = 6;
  useLoop(vis > 0 ? span / vis / 1.6 : 4, (ph) => {
    if (cart.current) cart.current.position.x = -3 + span * ph;
  }, 0.45);
  const maxE = Math.max(...d.energies.map(Math.abs), 1e-30);
  const cols = d.energies.map((e, i) => ({ x: -1.8 + i * 1.8, h: 0.15 + 2.4 * (Math.abs(e) / maxE), label: d.labels.columns[i], on: i === 1 }));
  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, -0.04, 0.3]}>
        <boxGeometry args={[7.6, 0.08, 2.4]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {cols.map((c) => (
        <group key={c.x}>
          <mesh position={[c.x, c.h / 2, -0.7]}>
            <boxGeometry args={[0.5, c.h, 0.4]} />
            <meshStandardMaterial color={c.on ? p.warning : p.muted} transparent opacity={c.on ? 0.95 : 0.55} />
          </mesh>
          <Label3D position={[c.x, c.h + 0.25, -0.7]} color={c.on ? p.warning : p.muted} weight={c.on ? 700 : 400}>
            {c.label}
          </Label3D>
        </group>
      ))}
      <group ref={cart} position={[-3, 0, 0.75]}>
        <mesh position={[0, 0.12 + s * 0.35, 0]}>
          <boxGeometry args={[s * 1.4, s * 0.6, s * 0.8]} />
          <meshStandardMaterial color={p.primary} roughness={0.45} />
        </mesh>
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * s * 0.45, 0.12, sz * s * 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.08, 18]} />
              <meshStandardMaterial color={p.text} />
            </mesh>
          )),
        )}
        {vis > 0 && <Arrow from={[s * 0.75, 0.12 + s * 0.35, 0]} to={[s * 0.75 + 0.5 + 0.6 * vis, 0.12 + s * 0.35, 0]} color={p.positive} width={4} />}
      </group>
      <Label3D position={[0, 3.55, 0]} color={p.text} weight={700}>
        {d.labels.energy}
      </Label3D>
      <Label3D position={[-1.5, 3.1, 0]} color={p.positive} weight={700}>
        {d.labels.velocity}
      </Label3D>
      <Label3D position={[1.5, 3.1, 0]} color={p.primary} weight={700}>
        {d.labels.mass}
      </Label3D>
    </group>
  );
}

/** Potential energy: a ball dropped from height h; the PE / KE column beside it trades one for the other while the total stays fixed. */
function PotentialScene({ d }: { d: PotentialSceneData }) {
  const p = usePalette3D();
  const H = d.height > 0 ? 1.2 + 2.4 * clamp(log(d.height + 1) / 3, 0, 1) : 0.05;
  const R = 0.18 + 0.14 * clamp((log(d.mass) + 1) / 6, 0, 1);
  const TX = -1.2;
  const CX = 1.6;
  const ball = useRef<THREE.Mesh>(null);
  const pe = useRef<THREE.Mesh>(null);
  const ke = useRef<THREE.Mesh>(null);
  // Real fall time when it is watchable, otherwise slowed down or sped up to 0.6–2.5 s.
  const play = clamp(d.fallTime, 0.6, 2.5);
  useLoop(play + 1.2, (ph) => {
    const tt = Math.min(1, (ph * (play + 1.2)) / play);
    const frac = tt * tt; // dropped fraction: ½gt² / h
    if (ball.current) ball.current.position.y = R + H * (1 - frac);
    if (pe.current) {
      pe.current.scale.y = Math.max(1e-3, 1 - frac);
      pe.current.position.y = (H * (1 - frac)) / 2;
    }
    if (ke.current) {
      ke.current.scale.y = Math.max(1e-3, frac);
      ke.current.position.y = H * (1 - frac) + (H * frac) / 2;
    }
  }, 0);
  return (
    <group position={[0, -1.7, 0]}>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[7, 0.08, 2]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {/* the tower and its top platform */}
      <mesh position={[TX - 0.55, H / 2, 0]}>
        <boxGeometry args={[0.3, H, 0.6]} />
        <meshStandardMaterial color={p.muted} />
      </mesh>
      <mesh position={[TX - 0.2, H - 0.03, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.6]} />
        <meshStandardMaterial color={p.muted} />
      </mesh>
      <Line points={[[TX + 0.15, H, 0], [TX + 0.15, 0, 0]]} color={p.muted} lineWidth={1.2} dashed dashSize={0.1} gapSize={0.07} />
      <mesh ref={ball} position={[TX + 0.15, H + R, 0]}>
        <sphereGeometry args={[R, 32, 24]} />
        <meshStandardMaterial color={p.primary} roughness={0.35} />
      </mesh>
      {/* height dimension */}
      <Line points={[[TX - 1.05, 0, 0], [TX - 1.05, H, 0]]} color={p.text} lineWidth={1.5} />
      {[0, H].map((y) => (
        <Line key={y} points={[[TX - 1.15, y, 0], [TX - 0.95, y, 0]]} color={p.text} lineWidth={1.5} />
      ))}
      <Label3D position={[TX - 1.05, H / 2, 0]} align="right" offset={[-6, 0]} color={p.text} weight={700}>
        {d.labels.height}
      </Label3D>
      {/* energy column: PE (blue, top) turns into KE (green, bottom) */}
      <mesh ref={pe} position={[CX, H / 2, 0]}>
        <boxGeometry args={[0.5, H, 0.5]} />
        <meshStandardMaterial color={p.primary} transparent opacity={0.85} />
      </mesh>
      <mesh ref={ke} position={[CX, 0, 0]} scale={[1, 1e-3, 1]}>
        <boxGeometry args={[0.5, H, 0.5]} />
        <meshStandardMaterial color={p.positive} transparent opacity={0.85} />
      </mesh>
      <Label3D position={[CX + 0.35, H * 0.75, 0]} align="left" color={p.primary} weight={700}>
        {d.labels.pe}
      </Label3D>
      <Label3D position={[CX + 0.35, H * 0.2, 0]} align="left" color={p.positive} weight={700}>
        {d.labels.ke}
      </Label3D>
      <Label3D position={[0.2, H + 0.85, 0]} color={p.text} weight={700}>
        {d.labels.energy}
      </Label3D>
      <Label3D position={[TX + 0.15, H + 0.4 + R, 0]} color={p.primary} weight={700}>
        {d.labels.mass}
      </Label3D>
      <Label3D position={[TX + 0.15, -0.35, 0.6]} color={p.positive} weight={700}>
        {d.labels.impact}
      </Label3D>
    </group>
  );
}

/** Power: the work W stacked as t equal time slices — each slice holds P × Δt joules — filling in turn. */
function PowerScene({ d }: { d: PowerSceneData }) {
  const p = usePalette3D();
  const n = d.slabs;
  const TOTAL = 3.2;
  const h = TOTAL / n;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useLoop(n * 0.45 + 1.2, (ph) => {
    const lit = (ph * (n * 0.45 + 1.2)) / 0.45;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = lit >= i + 1 ? 0.9 : lit > i ? 0.15 + 0.75 * (lit - i) : 0.15;
    });
  }, 1);
  return (
    <group position={[0, -1.6, 0]}>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[6, 0.08, 2]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)} position={[0, h * i + h / 2, 0]}>
          <boxGeometry args={[1.3, h * 0.9, 1.1]} />
          <meshStandardMaterial color={i % 2 ? p.warning : p.danger} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* time axis: one tick per slice */}
      <Line points={[[1, 0, 0.6], [1, TOTAL, 0.6]]} color={p.muted} lineWidth={1.2} />
      {Array.from({ length: n + 1 }, (_, i) => (
        <Line key={i} points={[[0.92, h * i, 0.6], [1.08, h * i, 0.6]]} color={p.muted} lineWidth={1.2} />
      ))}
      <Label3D position={[0, TOTAL + 0.45, 0]} color={p.text} weight={700}>
        {d.labels.work}
      </Label3D>
      <Label3D position={[1.3, TOTAL * 0.75, 0.6]} align="left" color={p.danger} weight={700}>
        {d.labels.power}
      </Label3D>
      <Label3D position={[1.3, TOTAL * 0.45, 0.6]} align="left" color={p.muted}>
        {d.labels.time}
      </Label3D>
      <Label3D position={[-0.85, h / 2, 0]} align="right" color={p.warning} weight={700}>
        {d.labels.slab}
      </Label3D>
    </group>
  );
}

/** Heavy part of the live drawing: only ever loaded through next/dynamic inside a <Scene3D>. */
export default function EnergyScene3D({ data }: EnergyScene3DProps) {
  switch (data.kind) {
    case "work":
      return <WorkScene d={data} />;
    case "kinetic":
      return <KineticScene d={data} />;
    case "potential":
      return <PotentialScene d={data} />;
    case "power":
      return <PowerScene d={data} />;
  }
}
