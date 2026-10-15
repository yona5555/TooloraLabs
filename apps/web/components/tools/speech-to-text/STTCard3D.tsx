"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { EXAMPLE_SEGMENTS, run } from "./sttMath";
import { PER_TURN } from "./sttHelix";

/** 6. (3D) The stored transcript's real words, in spoken order, as pillars wound on a helix. */
const HelixScene3D = dynamic(() => import("./STTScene3D"), { ssr: false, loading: () => null });
const WORDS = run(EXAMPLE_SEGMENTS).transcript.split(" ");
const color = (w: string) => (w.length <= 3 ? "var(--ai-b)" : w.length <= 6 ? "var(--ai-a)" : "var(--ai-e)");

/** 2D twin (no WebGL, off screen, or no free slot): the same words on a flat spiral. */
function Spiral2D({ words }: { words: string[] }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 270 });
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) / 2 - 16;
  const n = WORDS.length;
  return (
    <div ref={box} className="relative min-h-[270px] w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${words.length}`}>
        {words.map((w, i) => {
          const a = (i / PER_TURN) * 2 * Math.PI;
          const r = R * (0.18 + (0.82 * i) / n);
          return <circle key={i} cx={px2(cx + r * Math.sin(a))} cy={px2(cy - r * Math.cos(a))} r={2 + w.length * 0.9} style={{ fill: color(w) }} />;
        })}
        <text x={cx} y={cy + 5} fontSize={13} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          {words[words.length - 1]}
        </text>
      </svg>
    </div>
  );
}

export function STTHelixCard({ side }: { side: "visual-left" | "table-left" }) {
  const t = useTranslations("tools.speech-to-text.visuals.helix");
  const tc = useTranslations("toolPage.indicatorKit");
  const s = useStepper(24, { min: 1, max: WORDS.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const words = WORDS.slice(0, s.value);
  const out = run([words.join(" ")]);
  const longest = words.reduce((a, w) => (w.length > a.length ? w : a), "");
  const valueText = t("valueText", { n: s.value, w: words[words.length - 1] });
  const rows: KitRow[] = [
    { key: "n", label: t("rowWords"), value: `${s.value} / ${WORDS.length}` },
    { key: "chars", label: t("rowChars"), value: String(out.transcript.length) },
    { key: "turns", label: t("rowTurns"), value: (s.value / PER_TURN).toFixed(2), isKey: true },
    { key: "longest", label: t("rowLongest"), value: `${longest} (${longest.length})` },
    { key: "last", label: t("rowLast"), value: words[words.length - 1] },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={6}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(s.value)), turns: ltr((s.value / PER_TURN).toFixed(2)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="stt-c6-handle" ticks={[1, 24, WORDS.length].map((v) => ({ at: v, text: String(v) }))} />
          <KitControls s={s} valueText={t("valueShort", { n: s.value })} testId="stt-c6" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="stt-c6" className="min-h-[270px] flex-1" fallback={<Spiral2D words={words} />} render3d={() => <HelixScene3D words={words} hover={hover} />} />}
    />
  );
}
