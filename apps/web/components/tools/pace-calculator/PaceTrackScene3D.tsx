"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * A standard 400 m track (lane 1: two 84.39 m straights, 36.8 m bend radius) with a runner that
 * laps it at the entered pace, sped up a fixed 25× so a 2:00 lap takes 4.8 s on screen; a faster
 * pace visibly runs faster. Markers every 100 m carry the split time at that pace. Labels hold
 * only numbers and units (canvas text); the words are in the card caption.
 * Reduced motion: the runner stands still at 300 m. Heavy (three): imported ONLY via next/dynamic.
 */
export type PaceTrackScene3DProps = {
  /** Seconds per km. */
  secPerKm: number;
  /** Header label, e.g. "5:00 /km · 12.0 km/h". */
  title: string;
  /** Lap label, e.g. "400 m 2:00". */
  lap: string;
  /** Split labels at 100, 200, 300 and 400 m. */
  splits: string[];
};

const SCALE = 1 / 40;
const S = 84.39 * SCALE;
const R = 36.8 * SCALE;
const LANES = 0.3;
const SPEEDUP = 25;
const MOVE_SECONDS = 8;

/** Point on the lane-1 line at arc length u (0 = start line, running anticlockwise seen from above). */
function onTrack(u: number, r = R): { x: number; z: number; heading: number } {
  const len = 2 * S + 2 * Math.PI * r;
  let d = ((u % len) + len) % len;
  if (d < S) return { x: -S / 2 + d, z: r, heading: 0 };
  d -= S;
  const bend = Math.PI * r;
  if (d < bend) {
    const a = d / r;
    return { x: S / 2 + r * Math.sin(a), z: r * Math.cos(a), heading: a };
  }
  d -= bend;
  if (d < S) return { x: S / 2 - d, z: -r, heading: Math.PI };
  d -= S;
  const a = d / r;
  return { x: -S / 2 - r * Math.sin(a), z: -r * Math.cos(a), heading: Math.PI + a };
}

function stadium(r: number): THREE.Shape {
  const sh = new THREE.Shape();
  sh.moveTo(-S / 2, -r);
  sh.lineTo(S / 2, -r);
  sh.absarc(S / 2, 0, r, -Math.PI / 2, Math.PI / 2, false);
  sh.lineTo(-S / 2, r);
  sh.absarc(-S / 2, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  return sh;
}

export default function PaceTrackScene3D({ secPerKm, title, lap, splits }: PaceTrackScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const runner = useRef<THREE.Group>(null);
  const dist = useRef(300 * SCALE);
  const shownSpeed = useRef(speed);
  const moveLeft = useRef(0);
  const reduced = useRef<boolean | null>(null);
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  // On-screen speed in scene units per second.
  const speed = secPerKm > 0 ? ((1000 * SCALE) / secPerKm) * SPEEDUP : 0;

  const geos = useMemo(() => {
    const ring = stadium(R + LANES);
    ring.holes.push(stadium(R - 0.06) as unknown as THREE.Path);
    const track = new THREE.ExtrudeGeometry(ring, { depth: 0.04, bevelEnabled: false, curveSegments: 48 });
    track.rotateX(Math.PI / 2);
    const infield = new THREE.ShapeGeometry(stadium(R - 0.06), 48);
    infield.rotateX(-Math.PI / 2);
    return { track, infield };
  }, []);
  useEffect(() => () => {
    geos.track.dispose();
    geos.infield.dispose();
  }, [geos]);

  // The runner moves for MOVE_SECONDS after the pace changes, never on load, so an idle page draws nothing.
  useEffect(() => {
    if (shownSpeed.current !== speed) moveLeft.current = MOVE_SECONDS;
    shownSpeed.current = speed;
    invalidate();
  }, [invalidate, speed]);

  useFrame((state, delta) => {
    if (reduced.current === null) reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const moving = !reduced.current && speed > 0 && moveLeft.current > 0;
    if (moving) {
      moveLeft.current -= Math.min(delta, 0.05);
      dist.current += Math.min(delta, 0.05) * speed;
    }
    const pos = onTrack(dist.current, R + LANES / 2 - 0.03);
    if (runner.current) {
      runner.current.position.set(pos.x, 0, pos.z);
      runner.current.rotation.y = pos.heading;
      const swing = Math.sin(dist.current * 9) * 0.5;
      const [, , legA, legB] = runner.current.children;
      if (legA && legB && !reduced.current) {
        legA.rotation.z = swing;
        legB.rotation.z = -swing;
      }
    }
    if (moving) state.invalidate();
  });

  const terracotta = p.dark ? "#b45309" : "#c2410c";
  const marks = [100, 200, 300, 400].map((m) => ({ m, ...onTrack(m * SCALE, R + LANES + 0.08) }));

  return (
    <group position={[0, -0.25, 0]}>
      <mesh geometry={geos.infield} position={[0, 0.001, 0]}>
        <meshStandardMaterial color={p.dark ? "#166534" : "#4ade80"} roughness={0.9} />
      </mesh>
      <mesh geometry={geos.track} position={[0, 0.04, 0]}>
        <meshStandardMaterial color={terracotta} roughness={0.8} />
      </mesh>
      {/* Start / finish line */}
      <mesh position={[-S / 2, 0.046, R + LANES / 2 - 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.035, LANES + 0.06]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {marks.map((mk) => (
        <mesh key={mk.m} position={[mk.x, 0.09, mk.z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Runner: body, head and two legs that swing while it moves */}
      <group ref={runner}>
        <mesh position={[0, 0.27, 0]}>
          <capsuleGeometry args={[0.055, 0.16, 4, 10]} />
          <meshStandardMaterial color={p.primary} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <sphereGeometry args={[0.055, 16, 12]} />
          <meshStandardMaterial color={p.dark ? "#fcd34d" : "#f59e0b"} roughness={0.6} />
        </mesh>
        <mesh position={[0.02, 0.1, 0]}>
          <boxGeometry args={[0.035, 0.18, 0.035]} />
          <meshStandardMaterial color={p.text} />
        </mesh>
        <mesh position={[-0.02, 0.1, 0]}>
          <boxGeometry args={[0.035, 0.18, 0.035]} />
          <meshStandardMaterial color={p.text} />
        </mesh>
      </group>

      {marks.map((mk, i) => (
        <Label3D key={`l${mk.m}`} position={[mk.x, 0.24, mk.z]} color={p.text} bg={bg} border={terracotta} text={splits[i]} fontSize={10.5} weight={700} />
      ))}
      <Label3D position={[0, 0.2, 0]} color={p.text} bg={bg} text={lap} fontSize={11} weight={800} />
      <Label3D position={[0, 1.05, -R]} color={p.primary} bg={bg} text={title} weight={800} />
    </group>
  );
}
