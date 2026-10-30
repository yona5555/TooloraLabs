"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMotionEpisode } from "@/components/tool-ui/motion/motion";
import { useSceneFrame } from "@/components/tool-ui/motion/scene-motion";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * A macro plate: one slice per macronutrient. The slice angle is its share of the day's calories;
 * the slice height is its grams (same scale for all three), so fat, at 9 kcal/g, is a wide but low
 * slice. Heights ease to new values on every edit. Reduced motion: drawn still.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type MacroPlateScene3DProps = {
  parts: { key: string; color: string; percent: number; grams: number; label: string }[];
  /** Total calories label above the plate. */
  total: string;
};

const R = 1.15;
const HMAX = 1.1;
const GAP = 0.06;

export default function MacroPlateScene3D({ parts, total }: MacroPlateScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const gmax = Math.max(1, ...parts.map((part) => part.grams));
  const targets = parts.map((part) => Math.max(0.02, (part.grams / gmax) * HMAX));
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";

  const targetKey = targets.join(",");
  useEffect(() => {
    invalidate();
  }, [invalidate, targetKey]);

  // the slices grow to their new height during a motion episode (tool-ui/motion); at rest they snap to it
  const { active } = useMotionEpisode([targetKey]);
  useSceneFrame((_, dt) => {
    let moving = false;
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const target = targets[i];
      const cur = m.scale.y;
      const next = dt ? cur + (target - cur) * 0.18 : target;
      const done = Math.abs(next - target) < 0.002;
      m.scale.y = done ? target : next;
      if (!done) moving = true;
    });
    return moving;
  }, active);

  const lens = parts.map((part) => (part.percent / 100) * Math.PI * 2);
  const slices = parts.map((part, i) => {
    const start = lens.slice(0, i).reduce((x, y) => x + y, 0);
    return { ...part, i, start, len: lens[i], mid: start + lens[i] / 2 };
  });

  return (
    <group position={[0, -0.55, 0]}>
      {/* Plate and rim */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[R + 0.32, R + 0.22, 0.06, 64]} />
        <meshStandardMaterial color={p.dark ? "#3f3f46" : "#e2e8f0"} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.27, 0.025, 8, 64]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>

      {slices.map((s) => (
        <Slice
          key={s.key}
          start={s.start}
          len={s.len}
          color={s.color}
          offset={[Math.cos(s.mid) * GAP, 0, -Math.sin(s.mid) * GAP]}
          initial={targets[s.i]}
          register={(m) => {
            meshes.current[s.i] = m;
          }}
        />
      ))}

      {/* Slice labels sit just outside the plate rim, beside their slice: left-hand slices read
          to the left, right-hand ones to the right, front/back ones below/above, so they never
          stack on each other or on the total, which floats high above the back of the plate. */}
      {slices.map((s) => {
        const cx = Math.cos(s.mid);
        const cz = -Math.sin(s.mid);
        const side = cx > 0.3 ? "left" : cx < -0.3 ? "right" : "center";
        const off: [number, number] = side === "left" ? [8, 0] : side === "right" ? [-8, 0] : cz > 0 ? [0, -16] : [0, 16];
        return (
          <Label3D
            key={`l${s.key}`}
            position={[cx * (R + 0.34), Math.max(0.12, targets[s.i] * 0.5), cz * (R + 0.34)]}
            align={side}
            offset={off}
            color={p.text}
            bg={bg}
            border={s.color}
            text={s.label}
            fontSize={11}
            weight={800}
          />
        );
      })}
      <Label3D position={[0, HMAX + 0.75, -R * 0.5]} color={p.primary} bg={bg} text={total} weight={800} />
    </group>
  );
}

/** One extruded sector (angle in the plate plane, height 1 along +y, scaled by the parent). */
function Slice({ start, len, color, offset, initial, register }: { start: number; len: number; color: string; offset: [number, number, number]; initial: number; register: (m: THREE.Mesh | null) => void }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, R, start, start + Math.max(0.001, len), false);
    shape.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 48 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [start, len]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group position={offset}>
      <mesh
        geometry={geo}
        ref={(m) => {
          register(m);
          if (m && !m.userData.init) {
            m.userData.init = true;
            m.scale.y = initial;
          }
        }}
      >
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
      </mesh>
    </group>
  );
}
