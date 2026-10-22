"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, axisTicks, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { DualRingGauge, evenTicks } from "@/components/tool-ui/indicator-kit/DualRingGauge";
import { clamp, fmtSmart, niceCeil } from "@/components/tool-ui/indicator-kit/format";
import { CHUNK_LIMIT, chunksOf, firstWords, fmtTime, LONG_SENTENCE, RATE_MAX, RATE_MIN, seconds, sentencesOf, SPEC_RATE_MAX, SPEC_RATE_MIN, STORY, ttsTool, wordCount, WPM } from "./ttsMath";

/**
 * The seven 2D text-to-speech indicator cards (the 3D chunk stack lives in TTSCard3D). Each card
 * owns its state (seeded once, never linked to the Playback card or to another card) and runs the
 * tool's own TextToSpeechCalculator on a stored example text.
 */
type Side = "visual-left" | "table-left";
const n0 = (v: number) => v.toLocaleString("en-US");
const SERIES = ["var(--ai-a)", "var(--ai-b)", "var(--ai-c)", "var(--ai-e)"];

function useCardText(key: string) {
  return { t: useTranslations(`tools.text-to-speech.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

const STORY_WORDS = wordCount(STORY);

// ── 2. Rate → listening time (line curve) ─────────────────────────────────────────────
export function TTSRateCurveCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("rateCurve");
  const s = useStepper(1.5, { min: RATE_MIN, max: RATE_MAX, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 46;
  const d = useDrawing(HMIN, s, (x, _y, W) => RATE_MIN + ((x - X0) / (W - X0 - 20)) * (RATE_MAX - RATE_MIN));
  const { W, H } = d;
  const r = s.value;
  const sec = seconds(STORY_WORDS, r);
  const base = seconds(STORY_WORDS, 1);
  const yMax = niceCeil(seconds(STORY_WORDS, RATE_MIN));
  const top = 18;
  const bot = H - 34;
  const xr = (v: number) => X0 + ((v - RATE_MIN) / (RATE_MAX - RATE_MIN)) * (W - X0 - 20);
  const ys = (v: number) => bot - (v / yMax) * (bot - top);
  const pts = Array.from({ length: 61 }, (_, i) => RATE_MIN + (i / 60) * (RATE_MAX - RATE_MIN));
  const path = pts.map((v, i) => `${i ? "L" : "M"} ${px2(xr(v))} ${px2(ys(seconds(STORY_WORDS, v)))}`).join(" ");
  const diff = sec - base;
  const valueText = `${r.toFixed(1)}× → ${fmtTime(sec)}`;
  const rows: KitRow[] = [
    { key: "words", label: t("rowWords"), value: n0(STORY_WORDS) },
    { key: "rate", label: t("rowRate"), value: `${r.toFixed(1)}×` },
    { key: "wpm", label: t("rowWpm"), value: `${n0(Math.round(WPM * r))} wpm` },
    { key: "time", label: t("rowTime"), value: fmtTime(sec), isKey: true },
    { key: "diff", label: t("rowDiff"), value: `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${fmtTime(Math.abs(diff))}` },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { rate: ltr(r.toFixed(1)), time: ltr(fmtTime(sec)) })}
      controls={<KitControls s={s} valueText={`${r.toFixed(1)}×`} testId="tts-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xr(r), y: ys(sec), dir: "horizontal" }} s={s} testId="tts-c2">
          {axisTicks(0, yMax, bot - top, 34).map((v) => (
            <g key={v}>
              <line x1={X0} y1={ys(v)} x2={W - 20} y2={ys(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={X0 - 6} y={ys(v) + 4} text={`${v} s`} anchor="end" size={10} />
            </g>
          ))}
          {[0.5, 1, 1.5, 2].map((v) => (
            <T key={v} x={xr(v)} y={bot + 18} text={`${v.toFixed(1)}×`} anchor={v === 0.5 ? "start" : v === 2 ? "end" : "middle"} size={10.5} />
          ))}
          <line x1={X0} y1={bot} x2={W - 20} y2={bot} style={LINE} strokeWidth={1.25} />
          <path d={path} fill="none" style={{ stroke: "var(--ai-a)" }} strokeWidth={3} strokeLinecap="round" />
          <g onPointerEnter={() => setHover("diff")} onPointerLeave={() => setHover(null)}>
            <line x1={xr(1)} y1={ys(base)} x2={xr(1)} y2={bot} style={{ stroke: "var(--ai-b)" }} strokeDasharray="4 4" strokeWidth={hover === "diff" ? 2.5 : 1.5} />
            <circle cx={xr(1)} cy={ys(base)} r={5} style={{ fill: "var(--ai-b)" }} />
            <T x={xr(1) + 8} y={ys(base) - 8} text={`1.0× · ${fmtTime(base)}`} anchor="start" size={10.5} bold style={{ fill: "var(--ai-b)" }} />
          </g>
          <line x1={xr(r)} y1={ys(sec)} x2={xr(r)} y2={bot} style={{ stroke: "var(--ai-a)" }} strokeWidth={hover === "time" ? 2.5 : 1.5} />
          <T x={xr(r) > W - 120 ? xr(r) - 14 : xr(r) + 14} y={ys(sec) - 14} text={fmtTime(sec)} anchor={xr(r) > W - 120 ? "end" : "start"} size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 3. Rate ↔ words per minute (double-ring gauge) ────────────────────────────────────
export function TTSWpmGaugeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("wpmGauge");
  const s = useStepper(1.2, { min: RATE_MIN, max: RATE_MAX, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const r = s.value;
  const wpm = Math.round(WPM * r);
  const valueText = `${r.toFixed(1)}× = ${wpm} wpm`;
  const rows: KitRow[] = [
    { key: "rate", label: t("rowRate"), value: `${r.toFixed(1)}×` },
    { key: "base", label: t("rowBase"), value: `${WPM} wpm` },
    { key: "wpm", label: `${WPM} × ${r.toFixed(1)}`, value: `${wpm} wpm`, isKey: true },
    { key: "wps", label: t("rowWps"), value: `${(wpm / 60).toFixed(2)}` },
    { key: "sec", label: t("rowPer100"), value: fmtTime(seconds(100, r)) },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { rate: ltr(r.toFixed(1)), wpm: ltr(String(wpm)) })}
      controls={<KitControls s={s} valueText={`${r.toFixed(1)}×`} testId="tts-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <DualRingGauge
          s={s}
          frac={r / RATE_MAX}
          fromFrac={(f) => f * RATE_MAX}
          outer={{ ticks: evenTicks(0.5, RATE_MAX), color: "var(--ai-a)", tickColor: "var(--ph-ink)", hoverKey: "rate" }}
          inner={{ ticks: evenTicks(50, WPM * RATE_MAX), color: "var(--ai-c)", tickColor: "var(--ph-ink-muted)", hoverKey: "wpm" }}
          center={[`${r.toFixed(1)}×`, t("outerUnit"), `${wpm} wpm`]}
          hover={hover}
          onHover={setHover}
          label={t("handle")}
          valueText={valueText}
          testId="tts-c3"
          hMin={280}
        />
      }
    />
  );
}

// ── 4. Packing sentences into chunks (waterfall) ──────────────────────────────────────
const STORY_SENTENCES = sentencesOf(STORY);
export function TTSPackingCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("packing");
  const s = useStepper(5, { min: 1, max: STORY_SENTENCES.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const X0 = 44;
  const k = s.value;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - X0 - 16)) * STORY_SENTENCES.length);
  const { W, H } = d;
  const text = STORY_SENTENCES.slice(0, k).join(" ");
  const chunks = useMemo(() => chunksOf(text), [text]);
  // Each sentence's bar runs from the chunk's length before it to the length after it (the tool joins with one space).
  const steps = chunks.flatMap((c, ci) => {
    let len = 0;
    return sentencesOf(c).map((sen, si) => {
      const from = len;
      len = si === 0 ? sen.length : len + 1 + sen.length;
      return { ci, from, to: len, first: si === 0 };
    });
  });
  const top = 20;
  const trackY = H - 22;
  const bot = trackY - 40;
  const cw = (W - X0 - 16) / STORY_SENTENCES.length;
  const yl = (v: number) => bot - (v / 240) * (bot - top);
  const last = chunks[chunks.length - 1] ?? "";
  const valueText = t("valueText", { k, n: chunks.length });
  const rows: KitRow[] = [
    { key: "k", label: t("rowSentences"), value: String(k) },
    { key: "chars", label: t("rowChars"), value: n0(text.length) },
    { key: "chunks", label: t("rowChunks"), value: String(chunks.length), isKey: true },
    { key: "last", label: t("rowLast"), value: `${last.length} / ${CHUNK_LIMIT}` },
    { key: "room", label: t("rowRoom"), value: String(CHUNK_LIMIT - last.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(String(k)), n: ltr(String(chunks.length)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { k })} testId="tts-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + cw * (k - 0.5), y: trackY, dir: "horizontal" }} s={s} testId="tts-c4">
          {[0, 100, 200].map((v) => (
            <g key={v}>
              <line x1={X0} y1={yl(v)} x2={W - 16} y2={yl(v)} style={{ stroke: v === CHUNK_LIMIT ? "var(--ai-d)" : "var(--ph-grid)" }} strokeDasharray={v === CHUNK_LIMIT ? "6 4" : undefined} strokeWidth={v === CHUNK_LIMIT ? 2 : 1} />
              <T x={X0 - 6} y={yl(v) + 4} text={String(v)} anchor="end" size={10} style={v === CHUNK_LIMIT ? { fill: "var(--ai-d)" } : MUTED} />
            </g>
          ))}
          {steps.map((st, i) => {
            const cx = X0 + cw * (i + 0.5);
            const bw = Math.min(34, cw * 0.62);
            const on = hover === "chunks" || (hover === "last" && st.ci === chunks.length - 1);
            return (
              <g key={i}>
                {!st.first && <line x1={cx - cw + bw / 2} y1={yl(st.from)} x2={cx - bw / 2} y2={yl(st.from)} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="3 3" />}
                <rect x={cx - bw / 2} y={yl(st.to)} width={bw} height={Math.max(3, yl(st.from) - yl(st.to))} rx={Math.min(7, bw / 2)} style={{ fill: SERIES[st.ci % SERIES.length], ...lit(on) }} />
                {yl(st.from) - yl(st.to) > 22 ? (
                  <T x={cx} y={yl(st.to) + 15} text={String(st.to)} size={10} bold style={{ fill: "var(--ph-surface)" }} />
                ) : (
                  <T x={cx} y={yl(st.to) - 6} text={String(st.to)} size={10} bold style={INK} />
                )}
                <T x={cx} y={bot + 15} text={`S${i + 1}`} size={10} />
              </g>
            );
          })}
          <line x1={X0} y1={trackY} x2={W - 16} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={X0 + cw * (k - 0.5)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 5. What the character count counts (donut) ────────────────────────────────────────
export function TTSCharMixCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("charMix");
  const s = useStepper(24, { min: 4, max: STORY_WORDS, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 480, h: 240 });
  const text = firstWords(STORY, s.value);
  const out = ttsTool.execute({ text, rate: 1, pitch: 1 }, { locale: "en-US" }).data;
  const letters = (text.match(/[A-Za-z]/g) ?? []).length;
  const spaces = (text.match(/\s/g) ?? []).length;
  const punct = out.characterCount - letters - spaces;
  const parts = [
    { key: "letters", v: letters, color: "var(--ai-a)" },
    { key: "spaces", v: spaces, color: "var(--ai-b)" },
    { key: "punct", v: punct, color: "var(--ai-d)" },
  ];
  const cx = Math.min(W * 0.32, H / 2 + 20);
  const cy = H / 2;
  const R = Math.min(H / 2 - 12, W * 0.26);
  const r0 = R * 0.58;
  let acc = 0;
  const arcs = parts.map((p) => {
    const a0 = (acc / out.characterCount) * 2 * Math.PI;
    acc += p.v;
    const a1 = (acc / out.characterCount) * 2 * Math.PI;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const P = (a: number, rr: number) => `${px2(cx + rr * Math.sin(a))} ${px2(cy - rr * Math.cos(a))}`;
    const dd = p.v === 0 ? "" : a1 - a0 >= 2 * Math.PI - 1e-6 ? "" : `M ${P(a0, R)} A ${R} ${R} 0 ${big} 1 ${P(a1, R)} L ${P(a1, r0)} A ${r0} ${r0} 0 ${big} 0 ${P(a0, r0)} Z`;
    return { ...p, d: dd };
  });
  const lx = cx + R + 28;
  const pct = (v: number) => `${((v / out.characterCount) * 100).toFixed(1)} %`;
  const valueText = t("valueText", { w: s.value, c: out.characterCount });
  const rows: KitRow[] = [
    { key: "words", label: t("rowWords"), value: String(s.value) },
    { key: "letters", label: t("rowLetters"), value: n0(letters) },
    { key: "spaces", label: t("rowSpaces"), value: n0(spaces) },
    { key: "punct", label: t("rowPunct"), value: n0(punct) },
    { key: "total", label: t("rowTotal"), value: n0(out.characterCount), isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { c: ltr(n0(out.characterCount)), s: ltr(pct(spaces)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="tts-c5-handle" ticks={[4, 40, STORY_WORDS].map((v) => ({ at: v, text: t("ticks", { n: v }) }))} />
          <KitControls s={s} valueText={t("valueShort", { w: s.value })} testId="tts-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative min-h-[240px] w-full flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {arcs.map((a) =>
              a.d ? (
                <path key={a.key} d={a.d} style={{ fill: a.color, ...lit(hover === a.key || hover === "total") }} onPointerEnter={() => setHover(a.key)} onPointerLeave={() => setHover(null)} />
              ) : a.v > 0 ? (
                <circle key={a.key} cx={cx} cy={cy} r={(R + r0) / 2} fill="none" style={{ stroke: a.color }} strokeWidth={R - r0} />
              ) : null,
            )}
            <T x={cx} y={cy - 2} text={n0(out.characterCount)} size={18} bold style={INK} />
            <T x={cx} y={cy + 16} text={t("centre")} size={10.5} />
            {parts.map((p, i) => {
              const y = cy - 36 + i * 36;
              return (
                <g key={p.key} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)}>
                  <circle cx={lx} cy={y} r={7} style={{ fill: p.color }} />
                  <T x={lx + 14} y={y - 2} text={t(`legend.${p.key}`)} anchor="start" size={11.5} bold style={INK} />
                  <T x={lx + 14} y={y + 13} text={`${n0(p.v)} · ${pct(p.v)}`} anchor="start" size={10.5} />
                </g>
              );
            })}
          </svg>
        </div>
      }
    />
  );
}

// ── 6. The utterance queue under a playhead (timeline) ───────────────────────────────
const STORY_CHUNKS = chunksOf(STORY);
const CHUNK_SECS = STORY_CHUNKS.map((c) => seconds(wordCount(c), 1));
const STORY_SECS = CHUNK_SECS.reduce((a, v) => a + v, 0);
export function TTSPlayheadCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("playhead");
  const max = Math.floor(STORY_SECS);
  const s = useStepper(12, { min: 0, max, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 220;
  const X0 = 24;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * STORY_SECS);
  const { W, H } = d;
  const xt = (v: number) => X0 + (v / STORY_SECS) * (W - 2 * X0);
  const starts = CHUNK_SECS.map((_, i) => CHUNK_SECS.slice(0, i).reduce((a, v) => a + v, 0));
  const tt = s.value;
  const cur = starts.reduce((acc, st, i) => (st <= tt ? i : acc), 0);
  const into = tt - starts[cur];
  const spoken = Math.min(STORY_WORDS, Math.floor((tt * WPM) / 60));
  const laneY = H / 2 - 18;
  const laneH = 40;
  const valueText = t("valueText", { t: fmtTime(tt), c: cur + 1 });
  const rows: KitRow[] = [
    { key: "t", label: t("rowElapsed"), value: fmtTime(tt) },
    { key: "chunk", label: t("rowChunk"), value: `${cur + 1} / ${STORY_CHUNKS.length}`, isKey: true },
    { key: "into", label: t("rowInto"), value: `${fmtTime(into)} / ${fmtTime(CHUNK_SECS[cur])}` },
    { key: "spoken", label: t("rowSpoken"), value: `${spoken} / ${STORY_WORDS}` },
    { key: "left", label: t("rowLeft"), value: fmtTime(Math.max(0, STORY_SECS - tt)) },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { c: ltr(String(cur + 1)), t: ltr(fmtTime(tt)) })}
      controls={<KitControls s={s} valueText={fmtTime(tt)} testId="tts-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xt(tt), y: laneY + laneH + 34, dir: "horizontal" }} s={s} testId="tts-c6">
          {STORY_CHUNKS.map((c, i) => {
            const x = xt(starts[i]) + (i ? 2 : 0);
            const w = xt(starts[i] + CHUNK_SECS[i]) - x - 2;
            const done = i < cur;
            const now = i === cur;
            return (
              <g key={i} onPointerEnter={() => setHover(now ? "chunk" : null)} onPointerLeave={() => setHover(null)}>
                <rect x={x} y={laneY} width={w} height={laneH} rx={12} style={{ fill: now ? "var(--ai-a)" : done ? "var(--ai-soft)" : "var(--glass-track)", ...lit(now && hover === "chunk") }} />
                {now && <rect x={x} y={laneY} width={Math.max(0, xt(tt) - x)} height={laneH} rx={12} style={{ fill: "var(--ai-c)" }} />}
                <T x={x + w / 2} y={laneY - 10} text={`#${i + 1} · ${c.length}`} size={10.5} bold style={now ? INK : MUTED} />
                <T x={x + w / 2} y={laneY + laneH / 2 + 4} text={fmtTime(CHUNK_SECS[i])} size={10.5} bold style={now ? { fill: "var(--ph-surface)" } : INK} />
              </g>
            );
          })}
          <line x1={xt(tt)} y1={laneY - 24} x2={xt(tt)} y2={laneY + laneH + 34} style={{ stroke: "var(--ai-d)" }} strokeWidth={2} />
          <line x1={X0} y1={laneY + laneH + 34} x2={W - X0} y2={laneY + laneH + 34} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <T x={X0} y={H - 8} text="0 s" anchor="start" size={10.5} />
          <T x={W - X0} y={H - 8} text={fmtTime(STORY_SECS)} anchor="end" size={10.5} />
        </Drawing>
      }
    />
  );
}

// ── 7. A sentence with no full stop is cut between words (step chart) ────────────────
const LONG_WORDS = LONG_SENTENCE.split(/\s+/);
export function TTSWordSplitCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("wordSplit");
  const s = useStepper(48, { min: 10, max: LONG_WORDS.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 44;
  const n = s.value;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - X0 - 16)) * (LONG_WORDS.length - 1));
  const { W, H } = d;
  const text = firstWords(LONG_SENTENCE, n);
  const chunks = useMemo(() => chunksOf(text), [text]);
  // Running length inside the current piece after each word, as the tool builds it (one space between words).
  const pts: { len: number; piece: number }[] = [];
  chunks.forEach((c, pi) => {
    let len = 0;
    c.split(" ").forEach((w, wi) => {
      len = wi === 0 ? w.length : len + 1 + w.length;
      pts.push({ len, piece: pi });
    });
  });
  const top = 18;
  const trackY = H - 20;
  const bot = trackY - 34;
  const xw = (i: number) => X0 + (i / Math.max(1, LONG_WORDS.length - 1)) * (W - X0 - 16);
  const yl = (v: number) => bot - (v / 220) * (bot - top);
  const path = pts.map((p, i) => `${i === 0 || p.piece !== pts[i - 1].piece ? "M" : "L"} ${px2(xw(i))} ${px2(yl(p.len))}`).join(" ");
  const cuts = pts.map((p, i) => (i > 0 && p.piece !== pts[i - 1].piece ? i : -1)).filter((i) => i > 0);
  const longest = Math.max(...chunks.map((c) => c.length));
  const valueText = t("valueText", { w: n, p: chunks.length });
  const rows: KitRow[] = [
    { key: "words", label: t("rowWords"), value: String(n) },
    { key: "chars", label: t("rowChars"), value: n0(text.length) },
    { key: "pieces", label: t("rowPieces"), value: String(chunks.length), isKey: true },
    { key: "cuts", label: t("rowCuts"), value: cuts.length ? cuts.join(", ") : "—" },
    { key: "longest", label: t("rowLongest"), value: `${longest} / ${CHUNK_LIMIT}` },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { w: ltr(String(n)), p: ltr(String(chunks.length)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { w: n })} testId="tts-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xw(n - 1), y: trackY, dir: "horizontal" }} s={s} testId="tts-c7">
          {[0, 100, 200].map((v) => (
            <g key={v}>
              <line x1={X0} y1={yl(v)} x2={W - 16} y2={yl(v)} style={{ stroke: v === CHUNK_LIMIT ? "var(--ai-d)" : "var(--ph-grid)" }} strokeDasharray={v === CHUNK_LIMIT ? "6 4" : undefined} strokeWidth={v === CHUNK_LIMIT ? 2 : 1} />
              <T x={X0 - 6} y={yl(v) + 4} text={String(v)} anchor="end" size={10} style={v === CHUNK_LIMIT ? { fill: "var(--ai-d)" } : MUTED} />
            </g>
          ))}
          <path d={path} fill="none" style={{ stroke: "var(--ai-a)" }} strokeWidth={2.5} strokeLinejoin="round" />
          {cuts.map((i) => (
            <g key={i} onPointerEnter={() => setHover("cuts")} onPointerLeave={() => setHover(null)}>
              <line x1={xw(i - 0.5)} y1={top} x2={xw(i - 0.5)} y2={bot} style={{ stroke: "var(--ai-b)" }} strokeWidth={hover === "cuts" ? 3 : 2} />
              <T x={xw(i - 0.5)} y={bot + 14} text={String(i)} size={10} bold style={{ fill: "var(--ai-b)" }} />
            </g>
          ))}
          <circle cx={xw(n - 1)} cy={yl(pts[pts.length - 1]?.len ?? 0)} r={5} style={{ fill: "var(--ai-a)" }} />
          <line x1={X0} y1={trackY} x2={W - 16} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={xw(n - 1)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 8. Which rates the tool accepts (bullet chart on a log scale) ────────────────────
const LMIN = -1.5;
const LMAX = 1.3;
const ZONES = [
  { from: LMIN, to: Math.log10(SPEC_RATE_MIN), color: "var(--ai-d)", key: "invalid" },
  { from: Math.log10(SPEC_RATE_MIN), to: Math.log10(RATE_MIN), color: "var(--ai-b)", key: "spec" },
  { from: Math.log10(RATE_MIN), to: Math.log10(RATE_MAX), color: "var(--ai-c)", key: "slider" },
  { from: Math.log10(RATE_MAX), to: Math.log10(SPEC_RATE_MAX), color: "var(--ai-b)", key: "spec" },
  { from: Math.log10(SPEC_RATE_MAX), to: LMAX, color: "var(--ai-d)", key: "invalid" },
];
export function TTSRateCheckCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("rateCheck");
  const s = useStepper(Math.log10(4), { min: LMIN, max: LMAX, step: 0.05 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 200;
  const X0 = 26;
  const d = useDrawing(HMIN, s, (x, _y, W) => LMIN + ((x - X0) / (W - 2 * X0)) * (LMAX - LMIN));
  const { W, H } = d;
  const rate = Number(fmtSmart(10 ** s.value, 3).replace(/,/g, ""));
  const verdict = ttsTool.execute({ text: "Hello.", rate, pitch: 1 }, { locale: "en-US" }).data.error;
  const zone = rate < SPEC_RATE_MIN || rate > SPEC_RATE_MAX ? "invalid" : rate >= RATE_MIN && rate <= RATE_MAX ? "slider" : "spec";
  const xl = (v: number) => X0 + ((v - LMIN) / (LMAX - LMIN)) * (W - 2 * X0);
  const bandY = H / 2 - 22;
  const bandH = 30;
  const valueText = `${fmtSmart(rate, 3)}× · ${verdict ?? "ok"}`;
  const rows: KitRow[] = [
    { key: "rate", label: t("rowRate"), value: `${fmtSmart(rate, 3)}×` },
    { key: "spec", label: t("rowSpec"), value: `${SPEC_RATE_MIN}× – ${SPEC_RATE_MAX}×` },
    { key: "slider", label: t("rowSlider"), value: `${RATE_MIN}× – ${RATE_MAX}×` },
    { key: "verdict", label: t("rowVerdict"), value: verdict ? t("rejected") : t("accepted"), isKey: true },
    { key: "factor", label: t("rowFactor"), value: verdict ? "—" : `× ${fmtSmart(1 / rate, 3)}` },
  ];
  return (
    <IndicatorCard
      idPrefix="tts"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t(`caption.${zone}`, { rate: ltr(fmtSmart(rate, 3)) })}
      controls={<KitControls s={s} valueText={`${fmtSmart(rate, 3)}×`} testId="tts-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xl(s.value), y: bandY + bandH + 28, dir: "horizontal" }} s={s} testId="tts-c8">
          {ZONES.map((z, i) => (
            <rect
              key={i}
              x={xl(z.from) + (i ? 1 : 0)}
              y={bandY}
              width={xl(z.to) - xl(z.from) - (i ? 1 : 0)}
              height={bandH}
              rx={i === 0 || i === ZONES.length - 1 ? 12 : 3}
              style={{ fill: z.color, opacity: hover === z.key || zone === z.key ? 1 : 0.45, ...lit(hover === z.key) }}
              onPointerEnter={() => setHover(z.key)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
          {[0.1, 0.5, 1, 2, 10].map((v, i) => (
            <T key={v} x={xl(Math.log10(v))} y={bandY - 8} text={`${v}×`} size={10.5} bold style={i === 2 ? INK : MUTED} anchor="middle" />
          ))}
          <line x1={xl(s.value)} y1={bandY - 2} x2={xl(s.value)} y2={bandY + bandH + 2} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
          <line x1={X0} y1={bandY + bandH + 28} x2={W - X0} y2={bandY + bandH + 28} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <T x={clamp(xl(s.value), X0 + 40, W - X0 - 40)} y={bandY + bandH + 62} text={verdict ? t("rejected") : t("accepted")} size={12} bold style={{ fill: verdict ? "var(--ai-d)" : "var(--ai-c)" }} />
        </Drawing>
      }
    />
  );
}
