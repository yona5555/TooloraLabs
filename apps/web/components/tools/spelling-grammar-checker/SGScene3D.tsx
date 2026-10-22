"use client";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { useTokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import { PER_ROW, RIBBON_WORDS } from "./sgWords";

/**
 * 3D word ribbon: the stored paragraph's words in reading order, eleven per row; a word the tool
 * flags stands tall in its issue type's colour, a clean word stays low. Loaded only through
 * next/dynamic (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = ["--ai-a", "--ai-b", "--ai-d", "--ai-e", "--ph-ink", "--ph-ink-muted", "--ph-grid", "--ph-focus"];

export default function SGRibbonScene3D({ n, hover }: { n: number; hover: string | null }) {
  const c = useTokenColors(TOKENS);
  if (!c) return null;
  const col = { spelling: c["--ai-d"], grammar: c["--ai-a"], capitalization: c["--ai-b"], punctuation: c["--ai-e"] };
  const rows = Math.ceil(RIBBON_WORDS.length / PER_ROW);
  const words = RIBBON_WORDS.slice(0, n);
  const last = words[words.length - 1];
  const pos = (i: number): [number, number] => [(i % PER_ROW) * 0.52 - ((PER_ROW - 1) * 0.52) / 2, Math.floor(i / PER_ROW) * 1.0 - ((rows - 1) * 1.0) / 2];
  return (
    <DemandCanvas3D camera={[0, 3.3, 4.5]} testId="sg-c6-canvas" minDistance={3.8} maxDistance={11} azimuth={0.9} fitAspect={1.6}>
      {words.map((w, i) => {
        const [x, z] = pos(i);
        const h = w.type ? 1.1 : 0.22;
        const lit = (hover === "flagged" && !!w.type) || (hover === "last" && i === words.length - 1);
        return (
          <mesh key={i} position={[x, h / 2 - 0.6, z]}>
            <cylinderGeometry args={[0.18, 0.18, h, 18]} />
            <meshStandardMaterial color={w.type ? col[w.type] : c["--ph-ink-muted"]} roughness={0.4} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.45 : 0} />
          </mesh>
        );
      })}
      {words.map((w, i) =>
        w.type ? <Label3D key={`l${i}`} position={[pos(i)[0], 0.75, pos(i)[1]]} color={c["--ph-ink"]} fontSize={10} weight={700} text={w.w} /> : null,
      )}
      {last && !last.type && <Label3D position={[pos(n - 1)[0], -0.1, pos(n - 1)[1]]} color={c["--ph-ink-muted"]} fontSize={10} text={last.w} />}
      <Invalidate deps={[n, hover, c]} />
    </DemandCanvas3D>
  );
}
