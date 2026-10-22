"use client";
import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { KitControls, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { snap } from "@/components/tool-ui/indicator-kit/format";
import { axisTicks } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clean } from "./sttMath";

/**
 * §44 (2D): the main visual at the top of the Transcript card — the final segments the recognizer
 * committed, one column each (bar = the segment's words after the tool's clean-up) with the running
 * transcript word count as a line. The handle picks how many segments the tool joins; new speech
 * adds a column and moves the handle to the end.
 */
export default function STTScene({ segments, k, onK }: { segments: string[]; k: number; onK: (v: number) => void }) {
  const t = useTranslations("tools.speech-to-text.visuals.hero");
  const n = Math.max(1, segments.length);
  const set = useCallback((v: number) => onK(snap(v, 1, 1, n)), [onK, n]);
  const s: Stepper = {
    value: k,
    set,
    inc: () => set(k + 1),
    dec: () => set(k - 1),
    reset: () => set(n),
    flash: 0,
    atMin: k <= 1,
    atMax: k >= n,
    isSeed: k === n,
    min: 1,
    max: n,
    step: 1,
  };
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 420, h: 280 });
  const X0 = 40;
  const X1 = W - 20;
  const trackY = H - 26;
  const cw = (X1 - X0) / n;
  const xc = (i: number) => X0 + cw * (i + 0.5);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (x) => set(1 + Math.floor((x - X0) / cw)));

  const words = segments.map((sg) => (clean(sg) ? clean(sg).split(" ").length : 0));
  const cum = words.map((_, i) => words.slice(0, i + 1).reduce((a, w) => a + w, 0));
  const total = cum[cum.length - 1] ?? 0;
  const top = 62;
  const bot = trackY - 46;
  const yMax = Math.max(1, total);
  const yw = (v: number) => bot - (v / yMax) * (bot - top);
  const bw = Math.min(42, cw * 0.5);
  const line = cum.map((c, i) => `${i ? "L" : "M"} ${xc(i)} ${yw(c)}`).join(" ");
  const shown = clean(segments[k - 1] ?? "");
  const room = Math.max(10, Math.floor((X1 - X0) / 6.4));
  const valueText = t("valueText", { k, n, w: cum[k - 1] ?? 0 });

  return (
    <div data-ph-scene-block className="flex flex-1 flex-col gap-3">
      <div ref={box} dir="ltr" data-preview="visual" className="relative min-h-[280px] w-full flex-1" data-testid="stt-hero-drawing">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
          <text x={X0} y={16} fontSize={11} fontWeight={700} style={{ fill: "var(--ph-ink-muted)" }}>
            {t("segment", { k })}
          </text>
          <text x={X0} y={33} fontSize={11.5} fontWeight={600} style={{ fill: "var(--ph-ink)" }}>
            {shown.length > room ? `“${shown.slice(0, room - 2)}…”` : `“${shown}”`}
          </text>
          {axisTicks(0, yMax, bot - top, 30).map((v) => (
            <g key={v}>
              <line x1={X0} y1={yw(v)} x2={X1} y2={yw(v)} style={{ stroke: "var(--ph-grid)" }} />
              <text x={X0 - 6} y={yw(v) + 4} fontSize={10} fontWeight={600} textAnchor="end" className="tabular-nums" style={{ fill: "var(--ph-ink-muted)" }}>
                {v}
              </text>
            </g>
          ))}
          {words.map((w, i) => {
            const on = i < k;
            return (
              <g key={i} opacity={on ? 1 : 0.35}>
                <rect x={xc(i) - bw / 2} y={yw(w)} width={bw} height={Math.max(3, bot - yw(w))} rx={Math.min(8, bw / 2)} style={{ fill: i === k - 1 ? "var(--ai-a)" : "var(--ai-soft)", stroke: "var(--ai-a)" }} strokeWidth={1.25} />
                <text x={xc(i)} y={bot + 15} fontSize={10.5} fontWeight={700} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
                  {`S${i + 1} · ${w}`}
                </text>
              </g>
            );
          })}
          <path d={line} fill="none" style={{ stroke: "var(--ai-b)" }} strokeWidth={2.5} />
          {cum.map((c, i) => (
            <g key={i} opacity={i < k ? 1 : 0.35}>
              <circle cx={xc(i)} cy={yw(c)} r={i === k - 1 ? 6 : 4} style={{ fill: "var(--ai-b)" }} />
              <text x={xc(i)} y={yw(c) - 10} fontSize={11} fontWeight={800} textAnchor="middle" className="tabular-nums" style={{ fill: "var(--ph-ink)" }}>
                {c}
              </text>
            </g>
          ))}
          <line x1={X0} y1={trackY} x2={X1} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={10} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={xc(k - 1)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={10} strokeLinecap="round" />
        </svg>
        <SvgHandle x={xc(k - 1)} y={trackY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="stt-hero-handle" />
      </div>
      <KitControls s={s} valueText={t("valueShort", { k, n })} testId="stt-hero" />
    </div>
  );
}
