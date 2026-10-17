"use client";
import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { KitControls, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { snap } from "@/components/tool-ui/indicator-kit/format";
import { axisTicks } from "@/components/tool-ui/indicator-kit/SvgBits";
import { fmtTime, RATE_MAX, RATE_MIN, RATE_SEED, RATE_STEP, seconds, wordCount } from "./ttsMath";

/**
 * §44 (2D): the main visual at the top of the Playback card — the speech queue on a time axis.
 * Every bar is one real chunk from the tool's chunker, as long as it takes to speak at the current
 * rate; the axis is fixed to the slowest rate, so a faster rate visibly shortens every bar. The
 * handle on the rate track writes the Speed field; moving the Speed slider moves the handle.
 */
const COLORS = ["var(--ai-a)", "var(--ai-b)", "var(--ai-c)", "var(--ai-e)"];
const MAX_ROWS = 8;

/** Greedy word wrap into at most `max` lines of `per` characters; the last line ends with "…" when text remains. */
function wrap(text: string, per: number, max: number): string[] {
  const out: string[] = [];
  let line = "";
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const cand = line ? `${line} ${words[i]}` : words[i];
    if (cand.length <= per || !line) {
      line = cand;
      continue;
    }
    if (out.length === max - 1) return [...out, `${line.slice(0, per - 1)}…`];
    out.push(line);
    line = words[i];
  }
  return [...out, line];
}

export default function TTSScene({ chunks, rate, onRate }: { chunks: string[]; rate: number; onRate: (v: number) => void }) {
  const t = useTranslations("tools.text-to-speech.visuals.hero");
  const set = useCallback((v: number) => onRate(snap(v, RATE_STEP, RATE_MIN, RATE_MAX)), [onRate]);
  const s: Stepper = {
    value: rate,
    set,
    inc: () => set(rate + RATE_STEP),
    dec: () => set(rate - RATE_STEP),
    reset: () => set(RATE_SEED),
    flash: 0,
    atMin: rate <= RATE_MIN,
    atMax: rate >= RATE_MAX,
    isSeed: rate === RATE_SEED,
    min: RATE_MIN,
    max: RATE_MAX,
    step: RATE_STEP,
  };
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 420, h: 300 });
  const X0 = 34;
  const X1 = W - 26;
  const trackY = H - 30;
  const xr = (v: number) => X0 + ((v - RATE_MIN) / (RATE_MAX - RATE_MIN)) * (X1 - X0);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (x) => set(RATE_MIN + ((x - X0) / (X1 - X0)) * (RATE_MAX - RATE_MIN)));

  const durs = chunks.map((c) => seconds(wordCount(c), rate));
  const starts = durs.map((_, i) => durs.slice(0, i).reduce((a, d) => a + d, 0));
  const total = durs.reduce((a, d) => a + d, 0);
  // The axis follows the current total, so the queue always spans the drawing; its ticks relabel as the rate changes.
  const tMax = (total || 1) * 1.04;
  const xt = (sec: number) => X0 + (sec / tMax) * (X1 - X0);
  const rows = Math.min(MAX_ROWS, Math.max(1, chunks.length));
  const top = 30;
  const axisY = trackY - 58;
  const rowH = (axisY - top - 4) / rows;
  const barH = Math.min(30, rowH * 0.4);
  // Each row prints its chunk's own text, wrapped over the lines that fit above its bar.
  const perLine = Math.max(12, Math.floor((X1 - X0) / 6.3));
  const lineCount = Math.max(1, Math.floor((rowH - barH - 14) / 15));
  const valueText = `${rate.toFixed(1)}× · ${fmtTime(total)}`;

  return (
    <div data-ph-scene-block className="flex flex-1 flex-col gap-3">
      {/* Grows with the card's spare height (rows get taller), so the column ends flush (§41). */}
      <div ref={box} dir="ltr" data-preview="visual" className="relative min-h-[300px] w-full flex-1" data-testid="tts-hero-drawing">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
          <text x={X0} y={16} fontSize={11} fontWeight={700} style={{ fill: "var(--ph-ink-muted)" }}>
            {t("queue", { n: chunks.length })}
          </text>
          <text x={X1} y={16} fontSize={13} fontWeight={800} textAnchor="end" className="tabular-nums" style={{ fill: "var(--ph-ink)" }}>
            {`≈ ${fmtTime(total)}`}
          </text>
          {axisTicks(0, tMax, X1 - X0, 56).map((v) => (
            <g key={v}>
              <line x1={xt(v)} y1={top} x2={xt(v)} y2={axisY} style={{ stroke: "var(--ph-grid)" }} />
              <text x={xt(v)} y={axisY + 16} fontSize={10.5} fontWeight={600} textAnchor={v === 0 ? "start" : "middle"} className="tabular-nums" style={{ fill: "var(--ph-ink-muted)" }}>
                {`${v} s`}
              </text>
            </g>
          ))}
          <line x1={X0} y1={axisY} x2={X1} y2={axisY} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.25} />
          {chunks.map((c, i) => {
            const x = xt(starts[i]);
            const w = Math.max(4, xt(starts[i] + durs[i]) - x);
            const label = `#${i + 1} · ${c.length} · ${fmtTime(durs[i])}`;
            const inside = w > label.length * 6.2 + 14;
            const right = x + w + 6 + label.length * 6.2 < X1;
            const lines = wrap(c, perLine, lineCount);
            // Text block + bar centred in the row.
            const y = top + (i % rows) * rowH + (rowH - (lines.length * 15 + 8 + barH)) / 2 + lines.length * 15 + 8;
            return (
              <g key={i}>
                {lines.map((ln, k) => (
                  <text key={k} x={X0} y={y - 8 - (lines.length - 1 - k) * 15} fontSize={11} fontWeight={500} style={{ fill: "var(--ph-ink-muted)" }}>
                    {ln}
                  </text>
                ))}
                <rect x={x} y={y} width={w} height={barH} rx={Math.min(10, barH / 2, w / 2)} style={{ fill: COLORS[i % COLORS.length] }} />
                <text
                  x={inside ? x + 10 : right ? x + w + 6 : x - 6}
                  y={y + barH / 2 + 4}
                  fontSize={11}
                  fontWeight={700}
                  textAnchor={inside || right ? "start" : "end"}
                  className="tabular-nums"
                  style={{ fill: inside ? "var(--ph-surface)" : "var(--ph-ink)" }}
                >
                  {label}
                </text>
              </g>
            );
          })}
          <text x={X0} y={trackY - 16} fontSize={10.5} fontWeight={700} style={{ fill: "var(--ph-ink-muted)" }}>
            {t("rateAxis")}
          </text>
          <line x1={X0} y1={trackY} x2={X1} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={10} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={xr(rate)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={10} strokeLinecap="round" />
          {[0.5, 1, 1.5, 2].map((v) => (
            <text key={v} x={xr(v)} y={trackY + 22} fontSize={10.5} fontWeight={600} textAnchor={v === 0.5 ? "start" : v === 2 ? "end" : "middle"} className="tabular-nums" style={{ fill: "var(--ph-ink-muted)" }}>
              {`${v.toFixed(1)}×`}
            </text>
          ))}
        </svg>
        <SvgHandle x={xr(rate)} y={trackY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="tts-hero-handle" />
      </div>
      <KitControls s={s} valueText={`${rate.toFixed(1)}×`} testId="tts-hero" />
    </div>
  );
}
