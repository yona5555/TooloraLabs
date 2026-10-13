"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { ballPoints } from "@/components/tool-ui/indicator-kit/format";
import { useTokenColors, type TokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import { liquidHex } from "./MolarityResultScene3D";
import { g3, SOLUTES } from "./molMath";

/**
 * The three 3D molarity indicator scenes (moles cylinders, particle droplet, molar-mass heaps).
 * Loaded only through next/dynamic (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = ["--chem-solute", "--chem-solvent", "--chem-tint", "--chem-stock", "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted", "--ph-focus", "--ph-water"];
const useColors = (): TokenColors | null => useTokenColors(TOKENS);

// ── 2. Same moles, two shapes: C × V cylinders ────────────────────────────────────────
/** Cross-section ∝ concentration and height ∝ volume, so both solids hold the same n = C × V. */
export const cylR = (c: number) => 0.62 * Math.sqrt(c);
export const cylH = (v: number) => 0.62 * v;

export function CylindersScene3D({ c1, v1, c2, v2, hover }: { c1: number; v1: number; c2: number; v2: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const cyl = (x: number, conc: number, vol: number, lit: boolean, label: string) => (
    <group position={[x, -1.4, 0]}>
      <mesh position={[0, cylH(vol) / 2, 0]}>
        <cylinderGeometry args={[cylR(conc), cylR(conc), cylH(vol), 40]} />
        <meshStandardMaterial color={liquidHex(c, conc)} roughness={0.3} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.25 : 0} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[cylR(conc) + 0.04, cylR(conc) + 0.1, 40]} />
        <meshStandardMaterial color={c["--ph-ink"]} side={THREE.DoubleSide} />
      </mesh>
      <Label3D position={[0, cylH(vol) + 0.32, 0]} color={c["--ph-ink"]} fontSize={11} weight={700} text={label} />
    </group>
  );
  return (
    <DemandCanvas3D camera={[0, 1.4, 6.6]} testId="mol-c2-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.6}>
      {cyl(-1.5, c1, v1, hover === "c1" || hover === "v1", `${g3(c1)} M · ${g3(v1)} L`)}
      {cyl(1.3, c2, v2, hover === "c2" || hover === "v2", `${g3(c2)} M · ${g3(v2)} L`)}
      <Label3D position={[0, -1.85, 0]} color={c["--ph-ink-muted"]} fontSize={10} text={`n = ${g3(c1 * v1)} mol`} />
      <Invalidate deps={[c1, v1, c2, v2, hover, c]} />
    </DemandCanvas3D>
  );
}

// ── 4. Particle droplet ───────────────────────────────────────────────────────────────
const DROP = ballPoints(64, 211);
function Dots({ count, color }: { count: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const [x, y, z] = DROP[i];
      o.position.set(x * 1.4, y * 1.4, z * 1.4);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    // Drawn after the translucent droplet (renderOrder 2, emissive), so the water never tints the solute.
    <instancedMesh key={count} ref={ref} args={[undefined, undefined, count]} renderOrder={2}>
      <sphereGeometry args={[0.1, 14, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} transparent opacity={1} />
    </instancedMesh>
  );
}

export function DropletScene3D({ count, molarity, hover }: { count: number; molarity: number; hover: string | null }) {
  const c = useColors();
  const shell = useMemo(() => new THREE.SphereGeometry(1.65, 48, 32), []);
  useLayoutEffect(() => () => shell.dispose(), [shell]);
  if (!c) return null;
  return (
    <DemandCanvas3D camera={[0, 0.7, 5.3]} testId="mol-c4-canvas" minDistance={4.5} maxDistance={10} fitAspect={0.85}>
      <mesh geometry={shell} renderOrder={1}>
        <meshPhysicalMaterial color={liquidHex(c, molarity)} transparent opacity={hover === "shown" ? 0.3 : 0.2} roughness={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Dots count={count} color={c["--chem-solute"]} />
      <Invalidate deps={[count, molarity, hover, c]} />
    </DemandCanvas3D>
  );
}

// ── 7. Molar-mass heaps: 1 mol of each solute ─────────────────────────────────────────
const HX0 = -3.4;
const HX1 = 3.4;
export const heapH = (g: number) => 0.35 + (g / 342.3) * 2.3;

export function HeapsScene3D({ index, hover }: { index: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const step = (HX1 - HX0) / (SOLUTES.length - 1);
  return (
    <DemandCanvas3D camera={[0, 1.6, 6.6]} testId="mol-c7-canvas" minDistance={5} maxDistance={12} azimuth={0.7} fitAspect={2.1}>
      <group position={[0, -1.2, 0]}>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[4.1, 4.1, 0.08, 64]} />
          <meshStandardMaterial color={c["--ph-glass"]} transparent opacity={0.5} />
        </mesh>
        {SOLUTES.map((s, i) => {
          const sel = i === index;
          const h = heapH(s.molarMass);
          const x = HX0 + i * step;
          return (
            <group key={s.key} position={[x, 0, 0]}>
              <mesh position={[0, h / 2, 0]}>
                <coneGeometry args={[0.48, h, 32]} />
                <meshStandardMaterial color={sel ? c["--chem-stock"] : c["--chem-solvent"]} roughness={0.6} emissive={sel && hover ? c["--ph-focus"] : "#000000"} emissiveIntensity={sel && hover ? 0.25 : 0} />
              </mesh>
              {sel && (
                <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.6, 0.045, 10, 36]} />
                  <meshStandardMaterial color={c["--ph-focus"]} />
                </mesh>
              )}
              {/* Alternate label heights so neighbouring numbers never collide. */}
              <Label3D position={[0, h + (i % 2 === 0 ? 0.3 : 0.62), 0]} color={c["--ph-ink"]} fontSize={sel ? 12 : 10} weight={sel ? 800 : 600} text={`${s.molarMass.toFixed(2)} g`} />
            </group>
          );
        })}
      </group>
      <Invalidate deps={[index, hover, c]} />
    </DemandCanvas3D>
  );
}
