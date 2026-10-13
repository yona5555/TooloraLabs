"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { ballPoints, clamp } from "../ph-calculator/phMath";
import { mixHex, usePhColors, type PhColors } from "../ph-calculator/phColors";
import { pistonFrac, T_MAX } from "./gasMath";

export type GasProjection = { marker: [number, number]; bottom: [number, number]; top: [number, number] };

const SCALE_X = 1.75;
const CYL_X = -0.55;
const CYL_R = 1.0;
const PTS = ballPoints(64, 23);
const TOKENS = ["--chem-cold", "--chem-hot", "--chem-piston", "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted"];

export const tempHex = (c: PhColors, tK: number) => mixHex(c["--chem-cold"], c["--chem-hot"], clamp(tK / T_MAX, 0, 1));

/** Gas particles spread through the space under the piston; emissive, so the glass never tints them. */
export function GasDots({ count, x, r, y0, h, color, size = 0.075, seedPts = PTS }: { count: number; x: number; r: number; y0: number; h: number; color: string; size?: number; seedPts?: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const [px, py, pz] = seedPts[i % seedPts.length];
      o.position.set(x + px * r * 0.82, y0 + 0.08 + ((py + 1) / 2) * Math.max(0.02, h - 0.16), pz * r * 0.82);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, x, r, y0, h, seedPts]);
  if (count <= 0) return null;
  return (
    <instancedMesh key={count} ref={ref} args={[undefined, undefined, count]} renderOrder={2}>
      <sphereGeometry args={[size, 12, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} transparent opacity={1} />
    </instancedMesh>
  );
}

type Props = { volume: number; temperature: number; particles: number; dragging: boolean; onProject: (p: GasProjection) => void };

function Scene({ volume, temperature, particles, dragging, onProject, c }: Props & { c: PhColors }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const controls = get().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = !dragging;
  }, [get, dragging]);

  const size = useThree((s) => s.size);
  // Tall Result card (stretched to the input column): cylinder and scale grow with the canvas.
  const k = Math.min(2.6, Math.max(1, (1.2 * size.height) / Math.max(1, size.width)));
  const H = 3 * k;
  const Y0 = -1.5 * k;
  const yT = (t: number) => Y0 + (clamp(t, 0, T_MAX) / T_MAX) * H;
  const piston = Y0 + pistonFrac(volume) * (H - 0.2);
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), m: new THREE.Vector3() }), []);
  const last = useRef("");
  const markerY = yT(temperature);

  useFrame(({ camera, size: sz }) => {
    const px = (p: THREE.Vector3): [number, number] => {
      p.project(camera);
      return [((p.x + 1) / 2) * sz.width, ((1 - p.y) / 2) * sz.height];
    };
    const proj: GasProjection = { marker: px(v.m.set(SCALE_X, markerY, 0)), bottom: px(v.a.set(SCALE_X, yT(0), 0)), top: px(v.b.set(SCALE_X, yT(T_MAX), 0)) };
    const key = [proj.marker, proj.bottom, proj.top].flat().map((n) => n.toFixed(1)).join(",");
    if (key !== last.current) {
      last.current = key;
      onProject(proj);
    }
  });

  const hot = tempHex(c, temperature);
  return (
    <group>
      {/* Glass cylinder, base, piston + rod. */}
      <mesh position={[CYL_X, Y0 + H / 2, 0]}>
        <cylinderGeometry args={[CYL_R, CYL_R, H, 48, 1, true]} />
        <meshPhysicalMaterial color={c["--ph-glass"]} transparent opacity={0.26} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[CYL_X, Y0, 0]}>
        <cylinderGeometry args={[CYL_R + 0.06, CYL_R + 0.06, 0.08, 48]} />
        <meshStandardMaterial color={c["--chem-piston"]} />
      </mesh>
      <mesh position={[CYL_X, piston + 0.06, 0]}>
        <cylinderGeometry args={[CYL_R - 0.03, CYL_R - 0.03, 0.12, 48]} />
        <meshStandardMaterial color={c["--chem-piston"]} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[CYL_X, (piston + Y0 + H + 0.5) / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, Math.max(0.1, Y0 + H + 0.5 - piston), 16]} />
        <meshStandardMaterial color={c["--chem-piston"]} />
      </mesh>
      <GasDots count={particles} x={CYL_X} r={CYL_R} y0={Y0} h={piston - Y0} color={hot} />

      {/* Thermometer 0–600 K with the draggable marker. */}
      <mesh position={[SCALE_X, Y0 + H / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, H, 20]} />
        <meshStandardMaterial color={c["--ph-glass"]} />
      </mesh>
      <mesh position={[SCALE_X, (Y0 + markerY) / 2, 0]}>
        <cylinderGeometry args={[0.09, 0.09, Math.max(0.001, markerY - Y0), 20]} />
        <meshStandardMaterial color={hot} />
      </mesh>
      <mesh position={[SCALE_X, Y0 - 0.12, 0]}>
        <sphereGeometry args={[0.18, 20, 14]} />
        <meshStandardMaterial color={hot} />
      </mesh>
      {[0, 100, 200, 300, 400, 500, 600].map((tk) => (
        <Label3D key={tk} position={[SCALE_X + 0.3, yT(tk), 0]} align="left" color={c["--ph-ink"]} fontSize={10} text={`${tk} K`} />
      ))}
      <group position={[SCALE_X, markerY, 0]}>
        <mesh>
          <sphereGeometry args={[0.17, 24, 16]} />
          <meshStandardMaterial color={c["--ph-knob"]} roughness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.04, 10, 32]} />
          <meshStandardMaterial color={c["--ph-ink"]} />
        </mesh>
      </group>
      <Invalidate deps={[volume, temperature, particles, dragging, c, k]} />
    </group>
  );
}

export default function GasResultScene3D(props: Props) {
  const c = usePhColors(TOKENS);
  if (!c) return null;
  return (
    <PhCanvas3D camera={[0, 0.7, 7.4]} testId="gas-hero-canvas" minDistance={5} maxDistance={11} fitAspect={1.05}>
      <Scene {...props} c={c} />
    </PhCanvas3D>
  );
}
