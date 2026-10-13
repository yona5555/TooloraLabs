"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { usePhColors, type PhColors } from "../ph-calculator/phColors";
import { EL_TOKENS, elToken } from "../chemical-equation-balancer/chemMath";
import { Molecules } from "../chemical-equation-balancer/Molecules3D";
import type { Part } from "./mmMath";

export type MmSceneProps = { formula: string; parts: Part[]; totalText: string; formulaLabel: string; atomsText: string; drawMolecule: boolean };

const TOKENS = [...EL_TOKENS, "--ph-ink", "--ph-ink-muted", "--ph-line", "--ph-surface", "--ph-glass"];
const TAN = 2 * Math.tan((19 * Math.PI) / 180);
const FIT_W = 9.4;
/** Camera distance: fov fixed at 38°, the camera backs off until the full width fits (no fish-eye). */
export const fitDistance = (aspect: number) => Math.max(9, FIT_W / (TAN * aspect));

/**
 * Element label heights along the mass column: each at its segment's centre, pushed apart so two
 * labels are never closer than `gap` (small shares like H in glucose never overlap their neighbours).
 */
export function spreadLabels(centres: number[], gap: number, lo: number, hi: number): number[] {
  const out = centres.map((c) => Math.max(lo, Math.min(hi, c)));
  for (let i = 1; i < out.length; i++) out[i] = Math.max(out[i], out[i - 1] + gap);
  const over = out.length ? out[out.length - 1] - hi : 0;
  if (over > 0) for (let i = out.length - 1; i >= 0; i--) out[i] = i === out.length - 1 ? hi : Math.min(out[i], out[i + 1] - gap);
  return out;
}

function Scene({ p, c }: { p: MmSceneProps; c: PhColors }) {
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const aspect = size.width / Math.max(1, size.height);
  const d = fitDistance(aspect);
  useEffect(() => {
    const { camera, controls, invalidate } = get();
    camera.position.setLength(d);
    camera.updateProjectionMatrix();
    const oc = controls as unknown as { minDistance: number; maxDistance: number; update: () => void } | null;
    if (oc) {
      oc.minDistance = d * 0.65;
      oc.maxDistance = d * 1.4;
      oc.update();
    }
    invalidate();
  }, [get, d]);
  const Hv = TAN * d;
  const Wv = Hv * aspect;
  const u = Wv / Math.max(1, size.width);
  // Mass column on the right (segments ∝ each element's share), molecule on the left.
  const colX = Wv * 0.12;
  const r = Math.min(0.62, Wv * 0.07);
  const y0 = -Hv / 2 + 26 * u;
  const H = Math.max(1, Hv - 26 * u - 64 * u);
  const below = (i: number) => p.parts.slice(0, i).reduce((a, q) => a + q.pct, 0);
  const segs = p.parts.map((pt, i) => ({ pt, y: y0 + (H * below(i)) / 100, h: (H * pt.pct) / 100 }));
  const labelY = spreadLabels(
    segs.map((s) => s.y + s.h / 2),
    26 * u,
    y0 + 8 * u,
    y0 + H - 8 * u,
  );
  const molX = -Wv * 0.25;
  const molScale = Math.min(2.6, (Wv * 0.42) / 1.9);
  return (
    <group>
      {p.drawMolecule && <Molecules items={[{ formula: p.formula, at: [molX, 0.15 * molScale, 0], scale: molScale }]} c={c} />}
      <Label3D position={[molX, -0.15 * molScale - 1.05 * molScale, 0]} color={c["--ph-ink"]} fontSize={18} weight={800} text={p.formulaLabel} avoid={false} />
      <Label3D position={[molX, -0.15 * molScale - 1.05 * molScale, 0]} offset={[0, -24]} color={c["--ph-ink-muted"]} fontSize={13} weight={600} text={p.atomsText} avoid={false} />
      {segs.map(({ pt, y, h }, i) => (
        <mesh key={pt.symbol} position={[colX, y + h / 2, 0]}>
          <cylinderGeometry args={[r, r, Math.max(0.001, h - (i < segs.length - 1 ? 0.02 : 0)), 40]} />
          <meshStandardMaterial color={c[elToken(pt.symbol)]} roughness={0.4} />
        </mesh>
      ))}
      {segs.map(({ pt }, i) => (
        <Label3D
          key={pt.symbol}
          position={[colX + r + 0.18, labelY[i], 0]}
          align="left"
          avoid={false}
          color={c["--ph-ink"]}
          fontSize={14}
          weight={700}
          text={`${pt.symbol}  ${pt.pct.toFixed(1)} %`}
        />
      ))}
      <Label3D position={[colX, y0 + H, 0]} offset={[0, 22]} color={c["--ph-ink"]} bg={c["--ph-surface"]} border={c["--ph-line"]} fontSize={15} weight={800} text={p.totalText} avoid={false} />
      <Invalidate deps={[p, c, size.width, size.height]} />
    </group>
  );
}

/** §44: the 3D scene at the top of the molar mass Result card (molecule + mass column). */
export default function MolarMassResultScene3D(p: MmSceneProps) {
  const c = usePhColors(TOKENS);
  if (!c) return null;
  return (
    <PhCanvas3D camera={[0.9, 0.7, 9.9]} testId="mm-hero-canvas" minDistance={6} maxDistance={200} azimuth={0.7} fitAspect={0.01}>
      <Scene p={p} c={c} />
    </PhCanvas3D>
  );
}
