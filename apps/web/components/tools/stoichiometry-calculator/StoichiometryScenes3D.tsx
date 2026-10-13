"use client";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { useTokenColors, type TokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import { EL_TOKENS, labelFormula } from "../chemical-equation-balancer/chemMath";
import { Molecules } from "../chemical-equation-balancer/Molecules3D";
import { placeTerms } from "../chemical-equation-balancer/BalancerResultScene3D";
import { g3 } from "../molarity-calculator/molMath";
import { SUBSTANCES } from "./stoichMath";

/**
 * The three 3D stoichiometry indicator scenes (molecules by the ratio, Haber-Bosch gas tanks, one
 * mole of each). Loaded only through next/dynamic (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = [...EL_TOKENS, "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted", "--ph-focus", "--chem-reactant", "--chem-product", "--chem-gas", "--chem-solvent", "--chem-stock"];
const useColors = (): TokenColors | null => useTokenColors(TOKENS);

// ── 1. Molecules by the ratio: 2k H₂ + k O₂ → 2k H₂O ─────────────────────────────────
export function RatioScene3D({ k, hover }: { k: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const terms = [
    { formula: "H2", coefficient: 2 * k, side: "reactant" as const },
    { formula: "O2", coefficient: k, side: "reactant" as const },
    { formula: "H2O", coefficient: 2 * k, side: "product" as const },
  ];
  const L = placeTerms(terms, "reactant", -3.4, -0.45, -1.3, 2.6);
  const R = placeTerms(terms, "product", 0.45, 3.4, -1.3, 2.6);
  const el = hover === "h2" ? "H" : hover === "o2" ? "O" : undefined;
  return (
    <DemandCanvas3D camera={[0, 0.5, 8]} testId="sto-c1-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.6}>
      <Molecules items={[...L.out, ...R.out]} c={c} highlight={el} />
      {[...L.labels, ...R.labels].map((l, i) => (
        <Label3D key={i} position={[l.x, l.y, 0]} color={c["--ph-ink"]} fontSize={11} weight={700} text={l.text} />
      ))}
      <Label3D position={[0, -0.3, 0]} color={c["--ph-ink"]} fontSize={14} weight={800} text="→" />
      <Invalidate deps={[k, hover, c]} />
    </DemandCanvas3D>
  );
}

// ── 6. Haber-Bosch: N₂ + 3H₂ → 2NH₃ as gas tanks (volume ∝ moles) ──────────────────────
export function TanksScene3D({ tonnes, max, masses, hover }: { tonnes: number; max: number; masses: [number, number, number]; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const tanks = [
    { key: "n2", formula: "N2", mol: 1, x: -2.1, color: c["--chem-el-n"] },
    { key: "h2", formula: "H2", mol: 3, x: -0.55, color: c["--chem-el-h"] },
    { key: "nh3", formula: "NH3", mol: 2, x: 1.7, color: c["--chem-product"] },
  ];
  const unitH = 0.95 * (0.35 + (0.65 * tonnes) / max); // never an empty tank
  return (
    <DemandCanvas3D camera={[0, 1.1, 7.4]} testId="sto-c6-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.5}>
      <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 64]} />
        <meshStandardMaterial color={c["--chem-solvent"]} transparent opacity={0.4} />
      </mesh>
      {tanks.map((tk, i) => {
        const h = Math.max(0.08, tk.mol * unitH);
        const lit = hover === tk.key;
        return (
          <group key={tk.key} position={[tk.x, -1.6, 0]}>
            <mesh position={[0, h / 2, 0]}>
              <cylinderGeometry args={[0.55, 0.55, h, 40]} />
              <meshStandardMaterial color={tk.color} roughness={0.35} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.3 : 0} />
            </mesh>
            <mesh position={[0, h, 0]}>
              <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={tk.color} roughness={0.35} />
            </mesh>
            <Label3D position={[0, h + 0.85, 0]} color={c["--ph-ink"]} fontSize={11} weight={800} text={`${g3(masses[i])} t`} />
            <Label3D position={[0, -0.32, 0.7]} color={c["--ph-ink-muted"]} fontSize={10} text={`${tk.mol} mol ${labelFormula(tk.formula)}`} />
          </group>
        );
      })}
      <Label3D position={[0.55, -0.9, 0]} color={c["--ph-ink"]} fontSize={14} weight={800} text="→" />
      <Invalidate deps={[tonnes, max, masses, hover, c]} />
    </DemandCanvas3D>
  );
}

// ── 8. One mole of each: sphere volume ∝ mass of one mole ─────────────────────────────
export const moleRadius = (mm: number) => 0.08 * Math.cbrt(mm);
export function MoleScene3D({ index, hover }: { index: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const n = SUBSTANCES.length;
  return (
    <DemandCanvas3D camera={[0, 1.4, 7.6]} testId="sto-c8-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.7}>
      {SUBSTANCES.map((sb, i) => {
        const x = -3.6 + (i / (n - 1)) * 7.2;
        const r = moleRadius(sb.mm);
        const sel = i === index;
        return (
          <group key={sb.formula} position={[x, -1 + r, 0]}>
            <mesh>
              <sphereGeometry args={[r, 36, 24]} />
              <meshStandardMaterial color={sel ? c["--chem-stock"] : c["--chem-gas"]} roughness={0.35} emissive={sel || hover === "mm" ? c["--ph-focus"] : "#000000"} emissiveIntensity={sel ? 0.35 : 0} />
            </mesh>
            <Label3D position={[0, r + 0.32 + (i % 2) * 0.3, 0]} color={c["--ph-ink"]} fontSize={sel ? 11 : 9.5} weight={sel ? 800 : 600} text={`${Math.round(sb.mm)}`} />
            <Label3D position={[0, -r - 0.32 - (i % 2) * 0.3, 0.4]} color={c["--ph-ink-muted"]} fontSize={9} text={labelFormula(sb.formula)} />
          </group>
        );
      })}
      <Invalidate deps={[index, hover, c]} />
    </DemandCanvas3D>
  );
}
