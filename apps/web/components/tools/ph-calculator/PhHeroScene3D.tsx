"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { ballPoints } from "@/components/tool-ui/indicator-kit/format";
import { particleCounts } from "./phMath";
import { useTokenColors, type TokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import { UI_TOKENS, uiHex } from "./phColors";

export type HeroProjection = { marker: [number, number]; bottom: [number, number]; top: [number, number] };

const SCALE_X = 1.55;
const BEAKER_X = -0.75;
const TOTAL = 44;
/**
 * Heights scale with the canvas: in a tall Result card (narrow column, stretched to the row) the
 * beaker and the 0–14 scale grow taller instead of floating in empty space (k = 1 when wide).
 */
function geometry(k: number) {
  const SCALE_H = 3 * k;
  const SCALE_Y0 = -1.5 * k;
  const BEAKER_H = 3 * k;
  const LIQUID_H = 1.9 * k;
  const LIQUID_Y = -1.45 * k + LIQUID_H / 2;
  return { SCALE_H, SCALE_Y0, BEAKER_H, LIQUID_H, LIQUID_Y, yFor: (pH: number) => SCALE_Y0 + (pH / 14) * SCALE_H };
}

function Particles({ count, color, seed, radius, liquidY, liquidH }: { count: number; color: string; seed: number; radius: number; liquidY: number; liquidH: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const pts = useMemo(() => ballPoints(TOTAL, seed), [seed]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const [x, y, z] = pts[i];
      o.position.set(BEAKER_X + x * 0.85, liquidY + y * (liquidH / 2 - 0.12), z * 0.85);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, pts, liquidY, liquidH]);
  return (
    // Drawn after the translucent liquid (renderOrder 2, emissive), so the liquid never tints the ions.
    <instancedMesh key={count} ref={ref} args={[undefined, undefined, count]} renderOrder={2}>
      <sphereGeometry args={[radius, 14, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} transparent opacity={1} />
    </instancedMesh>
  );
}

function Scene({ pH, c, dragging, onProject }: { pH: number; c: TokenColors; dragging: boolean; onProject: (p: HeroProjection) => void }) {
  // Orbit rotation is off while the pH marker is being dragged.
  const get = useThree((s) => s.get);
  useEffect(() => {
    const controls = get().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = !dragging;
  }, [get, dragging]);

  const size = useThree((s) => s.size);
  const k = Math.min(1.75, Math.max(1, (0.95 * size.height) / Math.max(1, size.width)));
  const { SCALE_H, SCALE_Y0, BEAKER_H, LIQUID_H, LIQUID_Y, yFor } = geometry(k);
  const counts = particleCounts(pH, TOTAL);
  const segs = useMemo(() => Array.from({ length: 14 }, (_, i) => uiHex(c, i + 0.5)), [c]);
  const last = useRef("");
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), m: new THREE.Vector3() }), []);
  const markerY = yFor(pH);

  useFrame(({ camera, size }) => {
    const px = (p: THREE.Vector3): [number, number] => {
      p.project(camera);
      return [((p.x + 1) / 2) * size.width, ((1 - p.y) / 2) * size.height];
    };
    const proj: HeroProjection = {
      marker: px(v.m.set(SCALE_X, markerY, 0)),
      bottom: px(v.a.set(SCALE_X, yFor(0), 0)),
      top: px(v.b.set(SCALE_X, yFor(14), 0)),
    };
    const key = [proj.marker, proj.bottom, proj.top].flat().map((n) => n.toFixed(1)).join(",");
    if (key !== last.current) {
      last.current = key;
      onProject(proj);
    }
  });

  return (
    <group>
      {/* Beaker: open glass cylinder, base and rim. */}
      <mesh position={[BEAKER_X, 0, 0]}>
        <cylinderGeometry args={[1.08, 1.08, BEAKER_H, 48, 1, true]} />
        <meshPhysicalMaterial color={c["--ph-glass"]} transparent opacity={0.28} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[BEAKER_X, -BEAKER_H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.08, 48]} />
        <meshStandardMaterial color={c["--ph-glass"]} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[BEAKER_X, BEAKER_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.08, 0.035, 10, 48]} />
        <meshStandardMaterial color={c["--ph-glass"]} />
      </mesh>
      {/* Liquid, coloured by the universal indicator at this pH. */}
      <mesh position={[BEAKER_X, LIQUID_Y, 0]} renderOrder={1}>
        <cylinderGeometry args={[1.0, 1.0, LIQUID_H, 48]} />
        <meshStandardMaterial color={uiHex(c, pH)} transparent opacity={0.55} roughness={0.25} depthWrite={false} />
      </mesh>
      <Particles count={counts.h} color={c["--ph-ion-h"]} seed={11} radius={0.075} liquidY={LIQUID_Y} liquidH={LIQUID_H} />
      <Particles count={counts.oh} color={c["--ph-ion-oh"]} seed={29} radius={0.075} liquidY={LIQUID_Y} liquidH={LIQUID_H} />

      {/* 0–14 scale: rounded bar of spectrum segments, caps, ticks and the pH marker. */}
      {segs.map((col, i) => (
        <mesh key={i} position={[SCALE_X, SCALE_Y0 + ((i + 0.5) / 14) * SCALE_H, 0]}>
          <cylinderGeometry args={[0.09, 0.09, SCALE_H / 14, 20]} />
          <meshStandardMaterial color={col} />
        </mesh>
      ))}
      <mesh position={[SCALE_X, yFor(0), 0]}>
        <sphereGeometry args={[0.09, 16, 10]} />
        <meshStandardMaterial color={segs[0]} />
      </mesh>
      <mesh position={[SCALE_X, yFor(14), 0]}>
        <sphereGeometry args={[0.09, 16, 10]} />
        <meshStandardMaterial color={segs[13]} />
      </mesh>
      {/* Ticks at least two units apart, so the label resolver never pushes one off its tick. */}
      {[0, 2, 4, 7, 10, 12, 14].map((tk) => (
        <Label3D key={tk} position={[SCALE_X + 0.3, yFor(tk), 0]} align="left" color={c["--ph-ink"]} fontSize={10} text={String(tk)} />
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
      <Invalidate deps={[pH, counts.h, dragging, c, k]} />
    </group>
  );
}

const TOKENS = [...UI_TOKENS, "--ph-glass", "--ph-ion-h", "--ph-ion-oh", "--ph-knob", "--ph-ink"];

export default function PhHeroScene3D(props: { pH: number; dragging: boolean; onProject: (p: HeroProjection) => void }) {
  const c = useTokenColors(TOKENS);
  if (!c) return null;
  return (
    <DemandCanvas3D camera={[0, 0.7, 7.2]} testId="ph-hero-canvas" minDistance={5} maxDistance={11} fitAspect={0.95}>
      <Scene {...props} c={c} />
    </DemandCanvas3D>
  );
}
