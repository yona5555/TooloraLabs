"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { ballPoints } from "../ph-calculator/phMath";
import { mixHex, usePhColors, type PhColors } from "../ph-calculator/phColors";
import { tintOf, V_MAX } from "./molMath";

export type MolProjection = { marker: [number, number]; bottom: [number, number]; top: [number, number] };

const SCALE_X = 1.75;
const PTS = ballPoints(64, 17);
const TOKENS = ["--chem-solute", "--chem-solvent", "--chem-tint", "--chem-stock", "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted", "--ph-focus"];

export const liquidHex = (c: PhColors, molarity: number) => mixHex(c["--chem-solvent"], c["--chem-tint"], 0.12 + tintOf(molarity) * 0.78);

/** Solute particles spread through a liquid column; drawn after the liquid so it never tints them. */
export function Solute({ count, x, r, y0, h, color, size = 0.07 }: { count: number; x: number; r: number; y0: number; h: number; color: string; size?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const [px, py, pz] = PTS[i % PTS.length];
      o.position.set(x + px * r * 0.82, y0 + ((py + 1) / 2) * Math.max(0.02, h - 0.1) + 0.05, pz * r * 0.82);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, x, r, y0, h]);
  if (count <= 0) return null;
  return (
    <instancedMesh key={count} ref={ref} args={[undefined, undefined, count]} renderOrder={2}>
      <sphereGeometry args={[size, 12, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} transparent opacity={1} />
    </instancedMesh>
  );
}

/** Open glass beaker standing on y = y0, with an optional liquid column of height `fill`. */
export function Beaker({ x, r, h, y0, fill, liquid, c }: { x: number; r: number; h: number; y0: number; fill: number; liquid: string; c: PhColors }) {
  return (
    <group>
      <mesh position={[x, y0 + h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 48, 1, true]} />
        <meshPhysicalMaterial color={c["--ph-glass"]} transparent opacity={0.28} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[x, y0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial color={c["--ph-glass"]} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[x, y0 + h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.035, 10, 48]} />
        <meshStandardMaterial color={c["--ph-glass"]} />
      </mesh>
      {fill > 0.005 && (
        <mesh position={[x, y0 + fill / 2, 0]} renderOrder={1}>
          <cylinderGeometry args={[r * 0.93, r * 0.93, fill, 48]} />
          <meshStandardMaterial color={liquid} transparent opacity={0.55} roughness={0.25} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

type Props = {
  mode: "concentration" | "dilution";
  /** Litres in the main beaker (V, or V₂ when diluting). */
  volume: number;
  molarity: number;
  /** Shown solute particles (log-scaled moles; the same in both beakers when diluting). */
  particles: number;
  stockVolume: number;
  stockMolarity: number;
  dragging: boolean;
  onProject: (p: MolProjection) => void;
};

function Scene({ mode, volume, molarity, particles, stockVolume, stockMolarity, dragging, onProject, c }: Props & { c: PhColors }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const controls = get().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = !dragging;
  }, [get, dragging]);

  const size = useThree((s) => s.size);
  // Tall Result card (stretched to the input column): beakers and scale grow with the canvas, no empty band.
  const k = Math.min(2.6, Math.max(1, (1.2 * size.height) / Math.max(1, size.width)));
  const H = 3 * k;
  const Y0 = -1.5 * k;
  const yFor = (v: number) => Y0 + (Math.min(v, V_MAX) / V_MAX) * H;
  const dil = mode === "dilution";
  const mainX = dil ? -0.1 : -0.55;
  const mainR = dil ? 0.85 : 1.05;
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), m: new THREE.Vector3() }), []);
  const last = useRef("");
  const markerY = yFor(volume);

  useFrame(({ camera, size: sz }) => {
    const px = (p: THREE.Vector3): [number, number] => {
      p.project(camera);
      return [((p.x + 1) / 2) * sz.width, ((1 - p.y) / 2) * sz.height];
    };
    const proj: MolProjection = { marker: px(v.m.set(SCALE_X, markerY, 0)), bottom: px(v.a.set(SCALE_X, yFor(0), 0)), top: px(v.b.set(SCALE_X, yFor(V_MAX), 0)) };
    const key = [proj.marker, proj.bottom, proj.top].flat().map((n) => n.toFixed(1)).join(",");
    if (key !== last.current) {
      last.current = key;
      onProject(proj);
    }
  });

  const fill = Math.max(0, yFor(volume) - Y0);
  const stockFill = Math.max(0, yFor(stockVolume) - Y0);
  return (
    <group>
      <Beaker x={mainX} r={mainR} h={H} y0={Y0} fill={fill} liquid={liquidHex(c, molarity)} c={c} />
      <Solute count={particles} x={mainX} r={mainR} y0={Y0} h={fill} color={c["--chem-solute"]} />
      {dil && (
        <>
          <Beaker x={-2.0} r={0.55} h={H} y0={Y0} fill={stockFill} liquid={liquidHex(c, stockMolarity)} c={c} />
          <Solute count={particles} x={-2.0} r={0.55} y0={Y0} h={stockFill} color={c["--chem-solute"]} size={0.06} />
          <Label3D position={[-2.0, Y0 + H + 0.25, 0]} color={c["--ph-ink-muted"]} fontSize={10} text="V_1" />
          <Label3D position={[mainX, Y0 + H + 0.25, 0]} color={c["--ph-ink-muted"]} fontSize={10} text="V_2" />
        </>
      )}
      {/* Volume scale 0–5 L with the draggable marker. */}
      <mesh position={[SCALE_X, Y0 + H / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, H, 20]} />
        <meshStandardMaterial color={c["--ph-glass"]} />
      </mesh>
      <mesh position={[SCALE_X, Y0 + fill / 2, 0]}>
        <cylinderGeometry args={[0.09, 0.09, Math.max(0.001, fill), 20]} />
        <meshStandardMaterial color={liquidHex(c, molarity)} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((tk) => (
        <Label3D key={tk} position={[SCALE_X + 0.3, yFor(tk), 0]} align="left" color={c["--ph-ink"]} fontSize={10} text={`${tk} L`} />
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
      <Invalidate deps={[mode, volume, molarity, particles, stockVolume, stockMolarity, dragging, c, k]} />
    </group>
  );
}

export default function MolarityResultScene3D(props: Props) {
  const c = usePhColors(TOKENS);
  if (!c) return null;
  return (
    <PhCanvas3D camera={[0, 0.7, 7.4]} testId="mol-hero-canvas" minDistance={5} maxDistance={11} fitAspect={1.05}>
      <Scene {...props} c={c} />
    </PhCanvas3D>
  );
}
