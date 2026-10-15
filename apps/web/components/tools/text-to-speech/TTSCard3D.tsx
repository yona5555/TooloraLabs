"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { chunksOf, STORY } from "./ttsMath";

/** 1. (3D) The stored paragraph's real chunks as a stack of slabs under an adjustable chunk limit. */
const ChunkStackScene3D = dynamic(() => import("./TTSScene3D"), { ssr: false, loading: () => null });
const SERIES = ["var(--ai-a)", "var(--ai-b)", "var(--ai-c)", "var(--ai-e)"];

/** 2D twin (no WebGL, off screen, or no free slot): the same slabs as flat bars. */
function ChunkStack2D({ lengths, limit }: { lengths: number[]; limit: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 260 });
  const X0 = 20;
  const xs = (v: number) => X0 + (v / 240) * (W - X0 - 70);
  const rowH = (H - 40) / Math.max(1, lengths.length);
  return (
    <div ref={box} className="relative min-h-[260px] w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${lengths.length} × ${limit}`}>
        {lengths.map((len, i) => {
          const h = Math.min(26, rowH * 0.66);
          const y = 28 + i * rowH + (rowH - h) / 2;
          return (
            <g key={i}>
              <rect x={X0} y={y} width={Math.max(4, xs(len) - X0)} height={h} rx={h / 2} style={{ fill: SERIES[i % SERIES.length] }} />
              <text x={X0 + 10} y={y + h / 2 + 4} fontSize={10.5} fontWeight={700} className="tabular-nums" style={{ fill: "var(--ph-surface)" }}>{`#${i + 1} · ${len}`}</text>
            </g>
          );
        })}
        <line x1={xs(limit)} y1={20} x2={xs(limit)} y2={H - 8} style={{ stroke: "var(--ai-d)" }} strokeWidth={2} strokeDasharray="6 4" />
        <text x={xs(limit)} y={14} fontSize={11} fontWeight={800} textAnchor="middle" className="tabular-nums" style={{ fill: "var(--ai-d)" }}>{limit}</text>
      </svg>
    </div>
  );
}

export function TTSChunkStackCard({ side }: { side: "visual-left" | "table-left" }) {
  const t = useTranslations("tools.text-to-speech.visuals.chunkStack");
  const tc = useTranslations("toolPage.indicatorKit");
  const s = useStepper(200, { min: 60, max: 240, step: 10 });
  const [hover, setHover] = useState<string | null>(null);
  const limit = s.value;
  const lengths = useMemo(() => chunksOf(STORY, limit).map((c) => c.length), [limit]);
  const valueText = t("valueText", { l: limit, n: lengths.length });
  const rows: KitRow[] = [
    { key: "limit", label: t("rowLimit"), value: String(limit) },
    { key: "chars", label: t("rowChars"), value: STORY.length.toLocaleString("en-US") },
    { key: "chunks", label: t("rowChunks"), value: String(lengths.length), isKey: true },
    { key: "longest", label: t("rowLongest"), value: String(Math.max(...lengths)) },
    { key: "shortest", label: t("rowShortest"), value: String(Math.min(...lengths)) },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={1}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { l: ltr(String(limit)), n: ltr(String(lengths.length)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="tts-c1-handle" ticks={[60, 120, 200, 240].map((v) => ({ at: v, text: String(v) }))} />
          <KitControls s={s} valueText={t("valueShort", { l: limit })} testId="tts-c1" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <ViewportScene
          testId="tts-c1"
          className="min-h-[260px] flex-1"
          fallback={<ChunkStack2D lengths={lengths} limit={limit} />}
          render3d={() => <ChunkStackScene3D lengths={lengths} limit={limit} hover={hover} />}
        />
      }
    />
  );
}
