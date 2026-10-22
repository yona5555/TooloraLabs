"use client";
import DemandCanvas3D, { SiteLabel3D as Label3D, Invalidate } from "@/components/tool-ui/three/DemandCanvas3D";
import { useTokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";

/**
 * 3D chunk stack: one slab per real chunk of the stored paragraph, as long as its character count,
 * stacked in speaking order, with a translucent wall at the chunk limit. Loaded only through
 * next/dynamic (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = ["--ai-a", "--ai-b", "--ai-c", "--ai-e", "--ai-d", "--ph-ink", "--ph-ink-muted", "--ph-focus"];
const SCALE = 4.4 / 240;

export default function TTSChunkStackScene3D({ lengths, limit, hover }: { lengths: number[]; limit: number; hover: string | null }) {
  const c = useTokenColors(TOKENS);
  if (!c) return null;
  const series = [c["--ai-a"], c["--ai-b"], c["--ai-c"], c["--ai-e"]];
  const n = lengths.length;
  const gap = Math.min(0.62, 3.4 / Math.max(1, n));
  const y0 = -((n - 1) * gap) / 2;
  const x0 = -2.2;
  return (
    <DemandCanvas3D camera={[1.5, 1.7, 5.2]} testId="tts-c1-canvas" minDistance={4} maxDistance={11} azimuth={0.9} fitAspect={1.5}>
      {lengths.map((len, i) => {
        const w = Math.max(0.05, len * SCALE);
        const lit = hover === "longest" ? len === Math.max(...lengths) : hover === "shortest" ? len === Math.min(...lengths) : hover === "chunks";
        return (
          <group key={i} position={[x0 + w / 2, y0 + (n - 1 - i) * gap, 0]}>
            <mesh>
              <boxGeometry args={[w, gap * 0.7, 0.9]} />
              <meshStandardMaterial color={series[i % series.length]} roughness={0.4} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.3 : 0} />
            </mesh>
            <Label3D position={[w / 2 + 0.12, 0, 0.45]} align="left" color={c["--ph-ink"]} fontSize={10.5} weight={700} text={`#${i + 1} · ${len}`} />
          </group>
        );
      })}
      <mesh position={[x0 + limit * SCALE, 0, 0]}>
        <boxGeometry args={[0.03, n * gap + 0.4, 1.3]} />
        <meshStandardMaterial color={c["--ai-d"]} transparent opacity={hover === "limit" ? 0.7 : 0.35} />
      </mesh>
      <Label3D position={[x0 + limit * SCALE, y0 + (n - 1) * gap + gap / 2 + 0.35, 0]} color={c["--ai-d"]} fontSize={11} weight={800} text={`${limit}`} />
      <Invalidate deps={[lengths, limit, hover, c]} />
    </DemandCanvas3D>
  );
}
