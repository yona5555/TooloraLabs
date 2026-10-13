"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "./PhCanvas3D";
import { ballPoints, DILUTION_MAX_STEPS, f2, particleCounts, SHELF } from "./phMath";
import { UI_TOKENS, uiHex, usePhColors, type PhColors } from "./phColors";

/**
 * The three 3D indicator scenes (shelf, dilution beaker, particle droplet). One module, loaded
 * only through next/dynamic (ssr:false) by PhCards3D, and only while its card holds a WebGL slot.
 * Geometries/materials are declarative, so fiber disposes them when the scene unmounts.
 */
const TOKENS = [...UI_TOKENS, "--ph-glass", "--ph-ion-h", "--ph-ion-oh", "--ph-knob", "--ph-ink", "--ph-focus", "--ph-water"];

function useColors(): PhColors | null {
  return usePhColors(TOKENS);
}

function Spectrum({ from, to, y = 0, r = 0.11, c }: { from: number; to: number; y?: number; r?: number; c: PhColors }) {
  const len = (to - from) / 14;
  return (
    <group>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[from + (i + 0.5) * len, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, len, 18]} />
          <meshStandardMaterial color={uiHex(c, i + 0.5)} />
        </mesh>
      ))}
      <mesh position={[from, y, 0]}>
        <sphereGeometry args={[r, 16, 10]} />
        <meshStandardMaterial color={uiHex(c, 0.5)} />
      </mesh>
      <mesh position={[to, y, 0]}>
        <sphereGeometry args={[r, 16, 10]} />
        <meshStandardMaterial color={uiHex(c, 13.5)} />
      </mesh>
    </group>
  );
}

// ── 3. Shelf ──────────────────────────────────────────────────────────────────────────
const SX0 = -4.2;
const SX1 = 4.2;
const sx = (pH: number) => SX0 + (pH / 14) * (SX1 - SX0);

export function ShelfScene3D({ index, hover }: { index: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  return (
    <PhCanvas3D camera={[0, 1.3, 6.3]} testId="ph-c3-canvas" minDistance={5} maxDistance={12} azimuth={0.7} fitAspect={2.3}>
      <group position={[0, -0.35, 0]}>
      <Spectrum from={SX0} to={SX1} y={-0.9} c={c} />
      {SHELF.map((sub, i) => {
        const sel = i === index;
        const z = i % 2 === 0 ? 0.55 : -0.55;
        const lift = sel ? 0.25 : 0;
        return (
          <group key={sub.key} position={[sx(sub.pH), -0.78 + lift, z]}>
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.8, 24]} />
              <meshStandardMaterial color={uiHex(c, sub.pH)} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.82, 0]}>
              <sphereGeometry args={[0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={uiHex(c, sub.pH)} roughness={0.35} />
            </mesh>
            <mesh position={[0, 1.08, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.22, 14]} />
              <meshStandardMaterial color={c["--ph-glass"]} />
            </mesh>
            {sel && (
              <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.32, 0.045, 10, 36]} />
                <meshStandardMaterial color={c["--ph-focus"]} emissive={c["--ph-focus"]} emissiveIntensity={hover ? 0.6 : 0.25} />
              </mesh>
            )}
            {/* Alternate label heights so neighbours a few tenths of a pH apart never collide. */}
            <Label3D position={[0, i % 2 === 0 ? 1.4 : 1.85, 0]} color={c["--ph-ink"]} fontSize={sel ? 12 : 10} weight={sel ? 800 : 600} text={f2(sub.pH).replace(/0$/, "")} />
          </group>
        );
      })}
      {[0, 7, 14].map((p) => (
        <Label3D key={p} position={[sx(p), -1.35, 0]} color={c["--ph-ink"]} fontSize={10} text={`pH ${p}`} />
      ))}
      </group>
      <Invalidate deps={[index, hover, c]} />
    </PhCanvas3D>
  );
}

// ── 5. Dilution beaker ────────────────────────────────────────────────────────────────
export function DilutionScene3D({ steps, pH, hover }: { steps: number; pH: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const H = 3.2;
  const fill = (k: number) => 0.35 + (k / DILUTION_MAX_STEPS) * (H - 0.6);
  const level = fill(steps);
  return (
    <PhCanvas3D camera={[0, 1.2, 6.1]} testId="ph-c5-canvas" minDistance={5} maxDistance={11} fitAspect={1.05}>
      <group position={[0, -1.5, 0]}>
        <mesh position={[0, H / 2, 0]}>
          <cylinderGeometry args={[1.25, 1.1, H, 48, 1, true]} />
          <meshPhysicalMaterial color={c["--ph-glass"]} transparent opacity={0.28} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 48]} />
          <meshStandardMaterial color={c["--ph-glass"]} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, level / 2, 0]}>
          <cylinderGeometry args={[1.08 + (level / H) * 0.13, 1.06, level, 48]} />
          <meshStandardMaterial color={uiHex(c, pH)} transparent opacity={0.62} depthWrite={false} />
        </mesh>
        {/* Graduation rings: one per 10× dilution level. */}
        {Array.from({ length: DILUTION_MAX_STEPS + 1 }, (_, k) => (
          <mesh key={k} position={[0, fill(k), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.11 + (fill(k) / H) * 0.14, k === steps ? 0.03 : 0.012, 8, 48]} />
            <meshStandardMaterial color={k === steps ? c["--ph-focus"] : c["--ph-ink"]} transparent opacity={k === steps ? 1 : 0.35} />
          </mesh>
        ))}
        <Label3D position={[1.45, level, 0]} align="left" color={c["--ph-ink"]} fontSize={hover === "ph" ? 13 : 12} weight={800} text={`pH ${f2(pH)}`} />
        <Label3D position={[-1.45, level, 0]} align="right" color={c["--ph-ink"]} fontSize={11} text={`×10${"⁰¹²³⁴⁵⁶"[steps]}`} />
      </group>
      <Invalidate deps={[steps, pH, hover, c]} />
    </PhCanvas3D>
  );
}

// ── 8. Particle droplet ───────────────────────────────────────────────────────────────
const DROPLET_TOTAL = 60;
const PTS = ballPoints(DROPLET_TOTAL, 101);

function Ions({ from, count, color }: { from: number; count: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const [x, y, z] = PTS[from + i];
      o.position.set(x * 1.45, y * 1.45, z * 1.45);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [from, count]);
  return (
    // Drawn after the translucent droplet (renderOrder 2, emissive), so the water never tints the ions.
    <instancedMesh key={`${from}-${count}`} ref={ref} args={[undefined, undefined, count]} renderOrder={2}>
      <sphereGeometry args={[0.1, 14, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} transparent opacity={1} />
    </instancedMesh>
  );
}

export function ParticleScene3D({ pH, hover }: { pH: number; hover: string | null }) {
  const c = useColors();
  const counts = particleCounts(pH, DROPLET_TOTAL);
  const shell = useMemo(() => new THREE.SphereGeometry(1.65, 48, 32), []);
  useLayoutEffect(() => () => shell.dispose(), [shell]);
  if (!c) return null;
  return (
    <PhCanvas3D camera={[0, 0.7, 5.3]} testId="ph-c8-canvas" minDistance={4.5} maxDistance={10} fitAspect={0.85}>
      <mesh geometry={shell}>
        <meshPhysicalMaterial color={c["--ph-water"]} transparent opacity={hover === "shown" ? 0.22 : 0.14} roughness={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Ions from={0} count={counts.h} color={c["--ph-ion-h"]} />
      <Ions from={counts.h} count={counts.oh} color={c["--ph-ion-oh"]} />
      <Invalidate deps={[pH, hover, c]} />
    </PhCanvas3D>
  );
}
