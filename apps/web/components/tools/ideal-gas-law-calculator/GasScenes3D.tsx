"use client";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { ballPoints } from "../ph-calculator/phMath";
import { usePhColors, type PhColors } from "../ph-calculator/phColors";
import { GasDots, tempHex } from "./GasResultScene3D";
import { ALT_MAX_KM, g4 } from "./gasMath";

/**
 * The three 3D gas indicator scenes (molar-volume spheres, molecular speeds, rising balloon).
 * Loaded only through next/dynamic (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = ["--chem-cold", "--chem-hot", "--chem-gas", "--chem-piston", "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted", "--ph-focus", "--ph-water"];
const useColors = (): PhColors | null => usePhColors(TOKENS);

// ── Molar volume spheres ──────────────────────────────────────────────────────────────
/** Sphere radius whose volume is proportional to V (litres). */
export const radiusFor = (v: number) => 0.42 * Math.cbrt(v);

export function SpheresScene3D({ v0, v25, hover }: { v0: number; v25: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const r0 = radiusFor(v0);
  const r25 = radiusFor(v25);
  const ball = (x: number, r: number, color: string, lit: boolean, label: string) => (
    <group position={[x, r - 1.3, 0]}>
      <mesh>
        <sphereGeometry args={[r, 40, 28]} />
        <meshPhysicalMaterial color={color} transparent opacity={lit ? 0.6 : 0.42} roughness={0.15} depthWrite={false} />
      </mesh>
      <Label3D position={[0, r + 0.3, 0]} color={c["--ph-ink"]} fontSize={11} weight={700} text={label} />
    </group>
  );
  const gap = 0.35;
  const xRef = -(r0 + r25 + gap) - 0.2;
  return (
    <PhCanvas3D camera={[0, 1.2, 7.4]} testId="gas-c-spheres-canvas" minDistance={5} maxDistance={14} azimuth={0.8} fitAspect={2}>
      <group position={[0.4, 0, 0]}>
        {ball(xRef, radiusFor(1), c["--ph-water"], hover === "ref", "1 L")}
        {ball(-r0 - gap / 2, r0, c["--chem-cold"], hover === "v0", `${g4(v0)} L`)}
        {ball(r25 + gap / 2, r25, c["--chem-hot"], hover === "v25", `${g4(v25)} L`)}
      </group>
      <Invalidate deps={[v0, v25, hover, c]} />
    </PhCanvas3D>
  );
}

// ── Molecular speeds in a flask ───────────────────────────────────────────────────────
const SPEED_PTS = ballPoints(36, 59);
/** Fixed per-molecule speed factors around 1 (a spread like the Maxwell distribution). */
const FACTORS = SPEED_PTS.map(([a, b, cc]) => 0.45 + Math.abs(a + b + cc) * 0.6);
const DIRS = ballPoints(36, 71).map(([a, b, cc]) => new THREE.Vector3(a, b, cc + 0.001).normalize());

function Trails({ scale, color }: { scale: number; color: string }) {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  useLayoutEffect(() => {
    const pos: number[] = [];
    SPEED_PTS.forEach(([x, y, z], i) => {
      const p = new THREE.Vector3(x * 1.3, y * 1.3, z * 1.3);
      const q = p.clone().addScaledVector(DIRS[i], FACTORS[i] * scale);
      pos.push(p.x, p.y, p.z, q.x, q.y, q.z);
    });
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  }, [geo, scale]);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  return (
    <lineSegments geometry={geo} renderOrder={2}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

export function SpeedScene3D({ tK, rms, hover }: { tK: number; rms: number; hover: string | null }) {
  const c = useColors();
  const shell = useMemo(() => new THREE.SphereGeometry(1.7, 48, 32), []);
  useLayoutEffect(() => () => shell.dispose(), [shell]);
  if (!c) return null;
  const col = tempHex(c, tK);
  return (
    <PhCanvas3D camera={[0, 0.7, 5.6]} testId="gas-c-speed-canvas" minDistance={4.5} maxDistance={10} fitAspect={0.9}>
      <mesh geometry={shell} renderOrder={1}>
        <meshPhysicalMaterial color={c["--ph-glass"]} transparent opacity={hover ? 0.2 : 0.14} roughness={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {SPEED_PTS.map(([x, y, z], i) => (
        <mesh key={i} position={[x * 1.3, y * 1.3, z * 1.3]} renderOrder={2}>
          <sphereGeometry args={[0.08, 12, 8]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} transparent opacity={1} />
        </mesh>
      ))}
      <Trails scale={rms / 1400} color={col} />
      <Invalidate deps={[tK, rms, hover, c]} />
    </PhCanvas3D>
  );
}

// ── Balloon rising through the standard atmosphere ────────────────────────────────────
const COL_H = 3.4;
const COL_Y0 = -1.7;
const yAlt = (h: number) => COL_Y0 + (h / ALT_MAX_KM) * COL_H;
const BALLOON_PTS = ballPoints(40, 31);

export function AltitudeScene3D({ hKm, volume, groundVolume, tK, hover }: { hKm: number; volume: number; groundVolume: number; tK: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const r = 0.45 * Math.cbrt(volume / groundVolume);
  const y = yAlt(hKm);
  return (
    <PhCanvas3D camera={[0, 0.4, 6.4]} testId="gas-c-alt-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.1}>
      <mesh position={[0, COL_Y0 - 0.05, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.08, 48]} />
        <meshStandardMaterial color={c["--chem-piston"]} transparent opacity={0.6} />
      </mesh>
      {/* Altitude mast with km ticks. */}
      <mesh position={[1.4, COL_Y0 + COL_H / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, COL_H, 16]} />
        <meshStandardMaterial color={c["--ph-glass"]} />
      </mesh>
      {[0, 2, 4, 6, 8, 10].map((k) => (
        <Label3D key={k} position={[1.65, yAlt(k), 0]} align="left" color={c["--ph-ink-muted"]} fontSize={10} text={`${k} km`} />
      ))}
      <mesh position={[1.4, y, 0]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color={c["--ph-focus"]} />
      </mesh>
      {/* Balloon of one mole of air at this height, its string and gas particles. */}
      <mesh position={[-0.3, (COL_Y0 + y - r) / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, Math.max(0.05, y - r - COL_Y0), 6]} />
        <meshStandardMaterial color={c["--ph-ink-muted"]} />
      </mesh>
      <mesh position={[-0.3, y, 0]} renderOrder={1}>
        <sphereGeometry args={[r, 40, 28]} />
        <meshPhysicalMaterial color={c["--chem-gas"]} transparent opacity={hover === "v" ? 0.5 : 0.35} roughness={0.2} depthWrite={false} />
      </mesh>
      <GasDots count={24} x={-0.3} r={r} y0={y - r * 0.8} h={r * 1.6} color={tempHex(c, tK)} size={0.05} seedPts={BALLOON_PTS} />
      <Invalidate deps={[hKm, volume, tK, hover, c]} />
    </PhCanvas3D>
  );
}
