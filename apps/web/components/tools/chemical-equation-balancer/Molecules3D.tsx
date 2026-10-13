"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PhColors } from "../ph-calculator/phColors";
import { elRadius, elToken, moleculeLayout } from "./chemMath";

/**
 * Ball-and-stick molecules for the balancer and stoichiometry scenes: every atom of every placed
 * molecule goes into one instanced mesh per element (true CPK colours, never tinted), and every
 * bond into one instanced stick mesh, so even 40 glucose molecules stay a handful of draw calls.
 */
export type Placed = { formula: string; at: [number, number, number]; scale?: number; lit?: boolean };

const BALL = 0.17;
const up = new THREE.Vector3(0, 1, 0);

function Instanced({ items, geo, color, emissive = 0.18 }: { items: THREE.Matrix4[]; geo: THREE.BufferGeometry; color: string; emissive?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  if (items.length === 0) return null;
  return (
    <instancedMesh key={items.length} ref={ref} args={[geo, undefined, items.length]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} roughness={0.35} />
    </instancedMesh>
  );
}

export function Molecules({ items, c, highlight }: { items: Placed[]; c: PhColors; highlight?: string }) {
  const ball = useMemo(() => new THREE.SphereGeometry(1, 18, 12), []);
  const stick = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 8), []);
  useLayoutEffect(
    () => () => {
      ball.dispose();
      stick.dispose();
    },
    [ball, stick],
  );
  const { atoms, bonds } = useMemo(() => {
    const atoms: Record<string, THREE.Matrix4[]> = {};
    const bonds: THREE.Matrix4[] = [];
    const layouts = new Map<string, ReturnType<typeof moleculeLayout>>();
    const q = new THREE.Quaternion();
    for (const it of items) {
      if (!layouts.has(it.formula)) layouts.set(it.formula, moleculeLayout(it.formula));
      const lay = layouts.get(it.formula)!;
      const k = it.scale ?? 1;
      const pos = lay.map((a) => new THREE.Vector3(it.at[0] + a.p[0] * k, it.at[1] + a.p[1] * k, it.at[2] + a.p[2] * k));
      lay.forEach((a, i) => {
        const r = BALL * elRadius(a.el) * k;
        (atoms[a.el] ??= []).push(new THREE.Matrix4().compose(pos[i], q.identity(), new THREE.Vector3(r, r, r)));
      });
      // Bonds: each atom to the nearest atom placed before it (centre first), so the molecule is one piece.
      for (let i = 1; i < pos.length; i++) {
        let best = 0;
        for (let j = 1; j < i; j++) if (pos[i].distanceTo(pos[j]) < pos[i].distanceTo(pos[best])) best = j;
        const a = pos[i];
        const b = pos[best];
        const len = a.distanceTo(b);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const rot = new THREE.Quaternion().setFromUnitVectors(up, b.clone().sub(a).normalize());
        bonds.push(new THREE.Matrix4().compose(mid, rot, new THREE.Vector3(0.045 * k, len, 0.045 * k)));
      }
    }
    return { atoms, bonds };
  }, [items]);
  return (
    <group>
      {Object.entries(atoms).map(([el, list]) => (
        <Instanced key={el} items={list} geo={ball} color={c[elToken(el)]} emissive={highlight === el ? 0.6 : 0.18} />
      ))}
      <Instanced items={bonds} geo={stick} color={c["--ph-ink-muted"]} emissive={0.05} />
    </group>
  );
}

/** Lays `count` molecules of one formula on a tidy grid centred at `at` (columns × rows, depth 1). */
export function gridOf(formula: string, count: number, at: [number, number, number], width: number, gap = 0.95, scale = 1): Placed[] {
  const cols = Math.max(1, Math.min(count, Math.floor(width / gap) + 1));
  const rows = Math.ceil(count / cols);
  const out: Placed[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? count - row * cols : cols;
    out.push({ formula, scale, at: [at[0] + (col - (inRow - 1) / 2) * gap, at[1] - row * gap, at[2] + (row % 2) * 0.12] });
  }
  return out;
}
