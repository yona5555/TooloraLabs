"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { useTokenColors, type TokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import { EL_TOKENS, labelFormula } from "../chemical-equation-balancer/chemMath";
import { Molecules } from "../chemical-equation-balancer/Molecules3D";
import { gridDims, INSET, MAX_SHOWN, shownCount, type StoSceneProps } from "./stoichiometryLayout";

export type { StoItem, StoSceneProps } from "./stoichiometryLayout";

const TOKENS = [...EL_TOKENS, "--ph-ink", "--ph-ink-muted", "--ph-surface", "--ph-line"];

const TAN = 2 * Math.tan((19 * Math.PI) / 180);
const D0 = 10;

/** Molecule centres (world units) for one slot, the ball-and-stick scale, and the cluster's top. */
export function cluster(count: number, x: number, sw: number, availH: number) {
  const { cols, rows } = gridDims(count);
  const gap = Math.min((sw * 0.9) / cols, availH / rows, 2.6);
  const k = gap / 1.3;
  const at: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? count - row * cols : cols;
    at.push([x + ((i % cols) - (inRow - 1) / 2) * gap, ((rows - 1) / 2 - row) * gap, 0]);
  }
  return { at, k, top: (rows / 2) * gap };
}

function Spinning({ formula, at, k, phase, c }: { formula: string; at: [number, number, number]; k: number; phase: number; c: TokenColors }) {
  const items = useMemo(() => [{ formula, at: [0, 0, 0] as [number, number, number], scale: k }], [formula, k]);
  return (
    <group position={at} rotation={[0.25, phase, 0]} userData={{ spin: true }}>
      <Molecules items={items} c={c} />
    </group>
  );
}

/** Slow turn of every molecule; skipped for reduced motion. The canvas only lives while on screen. */
function Spin({ root }: { root: RefObject<Group | null> }) {
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  useFrame((state, dt) => {
    if (reduce || !root.current) return;
    root.current.traverse((o) => {
      if (o.userData.spin) o.rotation.y += Math.min(dt, 0.05) * 0.45;
    });
    state.invalidate();
  });
  return null;
}

function Scene({ p, c }: { p: StoSceneProps; c: TokenColors }) {
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const root = useRef<Group>(null);
  useEffect(() => {
    const { camera, controls, invalidate } = get();
    camera.position.setLength(D0);
    camera.updateProjectionMatrix();
    const oc = controls as unknown as { minDistance: number; maxDistance: number; update: () => void } | null;
    if (oc) {
      oc.minDistance = D0 * 0.7;
      oc.maxDistance = D0 * 1.5;
      oc.update();
    }
    invalidate();
  }, [get, size.width, size.height]);
  const aspect = size.width / Math.max(1, size.height);
  const Hv = TAN * D0;
  const Wv = Hv * aspect;
  const u = Hv / Math.max(1, size.height); // world units per CSS pixel
  const slots = p.items.length + 1;
  const sw = (Wv * (1 - 2 * INSET)) / slots;
  const xAt = (slot: number) => -Wv * (0.5 - INSET) + sw * (slot + 0.5);
  const nR = p.items.filter((i) => i.side === "reactant").length;
  // Room for the formula label above and a margin below.
  const availH = Hv - 64 * u;
  const yShift = -14 * u;
  const arrowX = xAt(nR);
  const arrowLen = sw * 0.6;
  return (
    <group ref={root}>
      <Spin root={root} />
      {p.items.map((it, i) => {
        const x = xAt(i < nR ? i : i + 1);
        const n = shownCount(it.coefficient);
        const cl = cluster(n, x, sw, availH);
        return (
          <group key={`${it.formula}-${i}`} position={[0, yShift, 0]}>
            {cl.at.map((at, j) => (
              <Spinning key={j} formula={it.formula} at={at} k={cl.k} phase={j * 0.9 + i} c={c} />
            ))}
            <Label3D avoid={false} position={[x, cl.top, 0]} offset={[0, 18]} color={c["--ph-ink"]} fontSize={17} weight={800} text={`${it.coefficient > 1 ? it.coefficient : ""}${labelFormula(it.formula)}`} />
            {it.coefficient > MAX_SHOWN && (
              <Label3D avoid={false} position={[x, -cl.top, 0]} offset={[0, -12]} color={c["--ph-ink"]} bg={c["--ph-surface"]} border={c["--ph-line"]} fontSize={13} weight={800} text={`×${it.coefficient}`} />
            )}
          </group>
        );
      })}
      {/* Reaction arrow with the mole ratio from the coefficients. */}
      <mesh position={[arrowX - 0.1, yShift, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, arrowLen, 16]} />
        <meshStandardMaterial color={c["--ph-ink"]} />
      </mesh>
      <mesh position={[arrowX + arrowLen / 2 - 0.02, yShift, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.3, 24]} />
        <meshStandardMaterial color={c["--ph-ink"]} />
      </mesh>
      <Label3D avoid={false} position={[arrowX, yShift, 0]} offset={[0, 22]} color={c["--ph-ink"]} bg={c["--ph-surface"]} border={c["--ph-line"]} fontSize={14} weight={800} text={p.ratio} />
      <Invalidate deps={[p, c, size.width, size.height]} />
    </group>
  );
}

/** §44: the 3D reaction at the top of the stoichiometry Result card (ball-and-stick molecules). */
export default function StoichiometryResultScene3D(p: StoSceneProps) {
  const c = useTokenColors(TOKENS);
  if (!c) return null;
  return (
    <DemandCanvas3D camera={[1.1, 0.8, 9.9]} testId="sto-hero-canvas" minDistance={7} maxDistance={15} azimuth={0.6} fitAspect={0.01}>
      <Scene p={p} c={c} />
    </DemandCanvas3D>
  );
}
