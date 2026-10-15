"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * A rounded 3D heart (extruded heart curve with a deep bevel, aortic arch and pulmonary trunk on
 * top) that beats at the target heart rate: each period of 60 ÷ bpm seconds holds a "lub" and a
 * softer "dub", and a ring pulses out behind it. The whole heart takes the training-zone colour.
 * Reduced motion: drawn still. Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type HeartScene3DProps = {
  bpm: number;
  color: string;
  labels: { bpm: string; pct: string; max: string };
};

function heartGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(5, 5);
  s.bezierCurveTo(5, 5, 4, 0, 0, 0);
  s.bezierCurveTo(-6, 0, -6, 7, -6, 7);
  s.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  s.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
  s.bezierCurveTo(16, 7, 16, 0, 10, 0);
  s.bezierCurveTo(7, 0, 5, 5, 5, 5);
  const g = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: true, bevelThickness: 3.2, bevelSize: 2.6, bevelSegments: 10, curveSegments: 40 });
  g.center();
  return g;
}

/** Lub-dub envelope over one beat, 0..1. */
function pulse(phase: number): number {
  return Math.exp(-(((phase - 0.06) / 0.05) ** 2)) + 0.55 * Math.exp(-(((phase - 0.26) / 0.06) ** 2));
}

export default function HeartScene3D({ bpm, color, labels }: HeartScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const geo = useMemo(heartGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const heart = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const reduced = useRef<boolean | null>(null);
  const period = 60 / Math.min(240, Math.max(30, bpm));
  const vessel = useMemo(() => "#" + new THREE.Color(color).multiplyScalar(0.72).getHexString(), [color]);
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";

  useEffect(() => {
    invalidate();
  }, [invalidate, period, color]);

  useFrame((state) => {
    if (reduced.current === null) reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const phase = reduced.current ? 0.5 : (state.clock.elapsedTime % period) / period;
    const k = 1 + 0.085 * pulse(phase);
    heart.current?.scale.set(k, k, k);
    if (ring.current && ringMat.current) {
      const r = 1 + phase * 0.7;
      ring.current.scale.set(r, r, r);
      ringMat.current.opacity = reduced.current ? 0.25 : 0.45 * (1 - phase);
    }
    if (!reduced.current) state.invalidate();
  });

  return (
    <group position={[0, -0.1, 0]}>
      {/* Pulse ring behind the heart */}
      <mesh ref={ring} position={[0, 0.05, -0.45]}>
        <ringGeometry args={[0.95, 1.02, 96]} />
        <meshBasicMaterial ref={ringMat} color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      <group ref={heart}>
        {/* Heart body: the curve is drawn tip-up, so turn it over; 0.075 → about 1.7 units wide. */}
        <mesh geometry={geo} rotation={[0, 0, Math.PI]} scale={[0.075, 0.075, 0.075]}>
          <meshStandardMaterial color={color} roughness={0.38} metalness={0.08} />
        </mesh>
        {/* Aortic arch */}
        <mesh position={[0.12, 0.62, -0.05]} rotation={[0, 0.35, 0]}>
          <torusGeometry args={[0.24, 0.085, 16, 40, Math.PI]} />
          <meshStandardMaterial color={vessel} roughness={0.45} />
        </mesh>
        {/* Arch branches */}
        {[-0.06, 0.12, 0.3].map((x) => (
          <mesh key={x} position={[x, 0.92, -0.1]}>
            <cylinderGeometry args={[0.035, 0.04, 0.18, 12]} />
            <meshStandardMaterial color={vessel} roughness={0.45} />
          </mesh>
        ))}
        {/* Pulmonary trunk */}
        <mesh position={[-0.2, 0.62, 0.12]} rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.085, 0.1, 0.4, 16]} />
          <meshStandardMaterial color={vessel} roughness={0.45} />
        </mesh>
      </group>

      <Label3D position={[0, 1.05, 0]} offset={[0, -10]} color={p.text} bg={bg} text={labels.bpm} weight={800} />
      <Label3D position={[0, -0.95, 0]} offset={[0, 16]} color={p.muted} bg={bg} text={labels.pct} />
      <Label3D position={[1.05, 0.35, 0]} align="left" color={p.primary} bg={bg} text={labels.max} />
    </group>
  );
}
