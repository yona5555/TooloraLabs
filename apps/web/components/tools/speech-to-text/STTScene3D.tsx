"use client";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { useTokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import { helix } from "./sttHelix";

/**
 * 3D word helix: every word of the stored transcript in spoken order, one pillar per word (height =
 * its letter count) wound along a helix of twelve words per turn. Loaded only through next/dynamic
 * (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = ["--ai-a", "--ai-b", "--ai-e", "--ph-ink", "--ph-ink-muted", "--ph-focus"];

export default function STTHelixScene3D({ words, hover }: { words: string[]; hover: string | null }) {
  const c = useTokenColors(TOKENS);
  if (!c) return null;
  const pts = helix(words.length);
  const longest = Math.max(...words.map((w) => w.length));
  return (
    <DemandCanvas3D camera={[0, 2.2, 5.8]} testId="stt-c6-canvas" minDistance={4.5} maxDistance={12} azimuth={1.2} fitAspect={1.3}>
      {words.map((w, i) => {
        const [x, y, z] = pts[i];
        const h = 0.12 * w.length;
        const last = i === words.length - 1;
        const lit = (hover === "longest" && w.length === longest) || (hover === "last" && last);
        const color = w.length <= 3 ? c["--ai-b"] : w.length <= 6 ? c["--ai-a"] : c["--ai-e"];
        return (
          <mesh key={i} position={[x, y + h / 2, z]}>
            <cylinderGeometry args={[0.13, 0.13, h, 16]} />
            <meshStandardMaterial color={color} roughness={0.35} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.45 : 0} />
          </mesh>
        );
      })}
      {words.length > 0 && (
        <Label3D position={[pts[words.length - 1][0], pts[words.length - 1][1] + 0.12 * words[words.length - 1].length + 0.35, pts[words.length - 1][2]]} color={c["--ph-ink"]} fontSize={11} weight={700} text={`${words.length}. ${words[words.length - 1]}`} />
      )}
      <Invalidate deps={[words, hover, c]} />
    </DemandCanvas3D>
  );
}
