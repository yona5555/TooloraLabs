"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import type { Mat2 } from "@tooloralabs/tools";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * The unit cube (and a lattice in its base plane) carried by the 2x2 matrix embedded as
 * [[a11, a12, 0], [a21, a22, 0], [0, 0, 1]]: the morph group's matrix is blended from the
 * identity to that map, so the ghost cube morphs into the parallelepiped whose volume is |det A|.
 *
 * Display normalisation (the numbers in the labels and table stay exact): the image of the unit
 * square is scaled to a fixed on-screen span, the k̂ height is kept proportional to that span so
 * the solid never collapses into an edge-on sliver, and the camera distance is fitted to the
 * bounding sphere for the canvas aspect, so the solid fills the drawing in any card shape.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type MatrixScene3DProps = {
  m: Mat2;
  /** Changing this number replays the identity → A animation. */
  replay: number;
  labels: { i: string; j: string; k: string };
};

type V3 = [number, number, number];
const DURATION = 1.6;
/** Lattice lines in math units, a quarter cell beyond the unit square on each side. */
const LATTICE = [-0.25, 0, 0.25, 0.5, 0.75, 1, 1.25];
/** Scene span of the transformed unit square's bounding box. */
const SPAN = 3;
/** Minimum k̂ height relative to SPAN. */
const MIN_DEPTH = 0.45 * SPAN;

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export default function MatrixScene3D({
  m,
  replay,
  labels,
}: MatrixScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const controlsReady = useThree((s) => s.controls !== null);
  const morph = useRef<THREE.Group>(null);
  const iTip = useRef<THREE.Group>(null);
  const jTip = useRef<THREE.Group>(null);
  const kTip = useRef<THREE.Group>(null);
  const progress = useRef(0);

  const aspect = size.width / Math.max(1, size.height);
  const landscape = aspect >= 0.85;

  // Layout for the final solid: an elongated parallelogram is turned so its long diagonal runs
  // along the canvas' long side (horizontal in wide cards, vertical in tall ones); xy is scaled
  // so that diagonal spans SPAN; k̂ keeps a visible height; the camera distance is fitted to
  // the projected corners for this aspect.
  const { k, kz, centre, turn, view, dist } = useMemo(() => {
    const cx = [0, m[0], m[1], m[0] + m[1]];
    const cy = [0, m[2], m[3], m[2] + m[3]];
    const d1: [number, number] = [m[0] + m[1], m[2] + m[3]];
    const d2: [number, number] = [m[0] - m[1], m[2] - m[3]];
    const long = Math.hypot(...d1) >= Math.hypot(...d2) ? d1 : d2;
    const phi = Math.atan2(long[1], long[0]);
    const extentAlong = (ang: number) => {
      const proj = cx.map((x, i) => x * Math.cos(ang) + cy[i] * Math.sin(ang));
      return Math.max(...proj) - Math.min(...proj);
    };
    const L = extentAlong(phi);
    const T = extentAlong(phi + Math.PI / 2);
    let turn = 0;
    if (Math.hypot(...long) > 1e-9 && L > 1.8 * Math.max(T, 1e-9)) {
      turn = (landscape ? 0 : Math.PI / 2) - phi;
      // An axis has no direction: keep the turn within ±90°.
      while (turn > Math.PI / 2) turn -= Math.PI;
      while (turn <= -Math.PI / 2) turn += Math.PI;
    }
    const ext = Math.max(
      extentAlong(-turn),
      extentAlong(Math.PI / 2 - turn),
      1e-6,
    );
    const k = SPAN / Math.max(ext, 0.25);
    const kz = Math.min(Math.max(k, MIN_DEPTH), SPAN);
    const centre = new THREE.Vector3(
      ((m[0] + m[1]) / 2) * k,
      ((m[2] + m[3]) / 2) * k,
      kz / 2,
    );
    const view = (
      landscape
        ? new THREE.Vector3(0.4, 0.6, 1)
        : new THREE.Vector3(0.65, 0.3, 1)
    ).normalize();
    const right = new THREE.Vector3(0, 1, 0).cross(view).normalize();
    const up = view.clone().cross(right).normalize();
    const rot = new THREE.Matrix4().makeRotationZ(turn);
    let X = 0;
    let Y = 0;
    let Z = 0;
    const v = new THREE.Vector3();
    for (let i = 0; i < 4; i++)
      for (const z of [0, kz]) {
        v.set(cx[i] * k, cy[i] * k, z)
          .sub(centre)
          .applyMatrix4(rot);
        X = Math.max(X, Math.abs(v.dot(right)));
        Y = Math.max(Y, Math.abs(v.dot(up)));
        Z = Math.max(Z, v.dot(view));
      }
    return { k, kz, centre, turn, view, dist: { X, Y, Z } };
  }, [m, landscape]);

  // Fit the camera distance so the solid's projection fills ~78% of the canvas (zoom reset to 1).
  useEffect(() => {
    const state = get();
    const cam = state.camera as THREE.PerspectiveCamera;
    const controls = state.controls as unknown as { update?: () => void } | null;
    if (!cam.isPerspectiveCamera) return;
    const tanV = Math.tan((cam.fov * Math.PI) / 360);
    const tanH = tanV * aspect;
    const FILL = 0.78;
    const d =
      dist.Z + Math.max(dist.X / (tanH * FILL), dist.Y / (tanV * FILL), 1);
    cam.zoom = 1;
    cam.position.copy(view).multiplyScalar(d);
    cam.near = Math.max(0.01, d / 100);
    cam.far = d * 10;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    controls?.update?.();
    invalidate();
  }, [get, aspect, dist, view, controlsReady, invalidate]);

  const key = m.join(",");
  useEffect(() => {
    progress.current = 0;
    invalidate();
  }, [key, replay, invalidate]);

  useFrame((state, delta) => {
    const g = morph.current;
    if (!g) return;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / DURATION);
      state.invalidate();
    }
    const t = ease(progress.current);
    const a = (1 + (m[0] - 1) * t) * k;
    const b = m[1] * t * k;
    const c = m[2] * t * k;
    const d = (1 + (m[3] - 1) * t) * k;
    const z = k + (kz - k) * t;
    // Math x → three x, math y → three y (up), the third basis vector k̂ → three z (depth).
    g.matrix.set(a, b, 0, 0, c, d, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    g.matrixWorldNeedsUpdate = true;
    iTip.current?.position.set(a, c, 0);
    jTip.current?.position.set(b, d, 0);
    kTip.current?.position.set(0, 0, z);
  });

  const cubeGeom = useMemo(
    () => new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    [],
  );
  const latticeColor = p.dark ? "#52525b" : "#94a3b8";
  const bg = p.dark ? "rgba(24,24,27,0.88)" : "rgba(255,255,255,0.94)";
  const iColor = p.danger;
  const jColor = p.positive;
  const kColor = p.accent;
  const det = m[0] * m[3] - m[1] * m[2];
  const solidColor = det < 0 ? p.warning : p.primary;
  const O: V3 = [0, 0, 0];
  const lo = LATTICE[0];
  const hi = LATTICE[LATTICE.length - 1];
  const neg = useMemo(() => centre.clone().negate(), [centre]);
  // Labels are pushed away from the solid's centre (world space, the outer group is at -centre).
  const awayPoint = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  return (
    <group rotation={[0, 0, turn]}>
      <group position={neg}>
        {/* Ghost of the original unit cube (same xy scale), never transformed. */}
        <mesh geometry={cubeGeom} scale={k}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color={p.muted} threshold={15} />
        </mesh>

        <group ref={morph} matrixAutoUpdate={false}>
          {LATTICE.map((v) => (
            <group key={v}>
              <Line
                points={[
                  [v, lo, 0],
                  [v, hi, 0],
                ]}
                color={latticeColor}
                lineWidth={v === 0 ? 1.6 : 0.8}
                transparent
                opacity={0.7}
              />
              <Line
                points={[
                  [lo, v, 0],
                  [hi, v, 0],
                ]}
                color={latticeColor}
                lineWidth={v === 0 ? 1.6 : 0.8}
                transparent
                opacity={0.7}
              />
            </group>
          ))}
          <mesh geometry={cubeGeom}>
            <meshStandardMaterial
              color={solidColor}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
            <Edges color={p.dark ? "#e4e4e7" : "#1e3a8a"} threshold={15} />
          </mesh>
          <Line points={[O, [1, 0, 0]]} color={iColor} lineWidth={4} />
          <Line points={[O, [0, 1, 0]]} color={jColor} lineWidth={4} />
          <Line points={[O, [0, 0, 1]]} color={kColor} lineWidth={4} />
        </group>

        {/* Arrow-tip labels live outside the (sheared, scaled) morph group and follow the tips. */}
        <group ref={iTip}>
          <Label3D
            position={[0, 0, 0]}
            color={iColor}
            bg={bg}
            text={labels.i}
            away={awayPoint}
          />
        </group>
        <group ref={jTip}>
          <Label3D
            position={[0, 0, 0]}
            color={jColor}
            bg={bg}
            text={labels.j}
            away={awayPoint}
          />
        </group>
        <group ref={kTip}>
          <Label3D
            position={[0, 0, 0]}
            color={kColor}
            bg={bg}
            text={labels.k}
            away={awayPoint}
          />
        </group>
      </group>
    </group>
  );
}
