"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { LABEL_GAP } from "@/components/tool-ui/chartLabels";
import { DualRingGauge } from "@/components/tool-ui/indicator-kit/DualRingGauge";
import { capitalised, clean, EVENTS, EXAMPLE_SEGMENTS, LANG_SAMPLES, LOWER_SENTENCES, run } from "./sttMath";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The seven 2D speech-to-text indicator cards (the 3D word helix lives in STTCard3D). Each card owns
 * its state (seeded once, never linked to the Transcript card or to another card) and runs the
 * tool's own SpeechToTextCalculator on stored recognizer-style text.
 */
type Side = "visual-left" | "table-left";
const n0 = (v: number) => v.toLocaleString("en-US");

function useCardText(key: string) {
  return { t: useTranslations(`tools.speech-to-text.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

/** Text as SVG lines (greedy word wrap, at most `max` lines; "…" when text remains). */
function wrap(text: string, per: number, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const cand = line ? `${line} ${w}` : w;
    if (cand.length <= per || !line) {
      line = cand;
      continue;
    }
    if (out.length === max - 1) return [...out, `${line.slice(0, per - 1)}…`];
    out.push(line);
    line = w;
  }
  return line ? [...out, line] : out;
}

// ── 1. Whitespace clean-up (dumbbell) ─────────────────────────────────────────────────
const CLEAN_WORDS = ["please", "send", "your", "notes", "by", "friday"];
/** The stored segment with `extra` additional spaces spread round-robin over its gaps and both ends. */
function spaced(extra: number): string {
  const gaps = Array(CLEAN_WORDS.length + 1).fill(0);
  for (let i = 0; i < extra; i++) gaps[i % gaps.length]++;
  return " ".repeat(gaps[0]) + CLEAN_WORDS.map((w, i) => w + " ".repeat((i < CLEAN_WORDS.length - 1 ? 1 : 0) + gaps[i + 1])).join("");
}
export function STTCleanupCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("cleanup");
  const s = useStepper(9, { min: 0, max: 21, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 230;
  const X0 = 30;
  const raw = spaced(s.value);
  const out = run([raw]);
  const maxLen = spaced(21).length;
  const baseLen = spaced(0).length;
  // The handle sits on the raw length; dragging it sets how many extra spaces the raw segment carries.
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * maxLen - baseLen);
  const { W, H } = d;
  const xl = (v: number) => X0 + (v / maxLen) * (W - 2 * X0);
  const rawY = 52;
  const cleanY = 112;
  const dotY = 168;
  const per = Math.floor((W - 2 * X0) / 7.2);
  const valueText = t("valueText", { e: s.value, r: raw.length, c: out.transcript.length });
  const rows: KitRow[] = [
    { key: "extra", label: t("rowExtra"), value: String(s.value) },
    { key: "raw", label: t("rowRaw"), value: String(raw.length) },
    { key: "clean", label: t("rowClean"), value: String(out.transcript.length), isKey: true },
    { key: "removed", label: t("rowRemoved"), value: String(raw.length - out.transcript.length) },
    { key: "words", label: t("rowWords"), value: String(out.wordCount) },
  ];
  // Spaces drawn as middle dots so the extra ones are visible; the cleaned line is the tool's transcript.
  // A zero-width space after each dot keeps the wrap point the real space gave, so words never split.
  const show = (str: string) => str.replace(/ /g, "·\u200B");
  return (
    <IndicatorCard
      idPrefix="stt"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { r: ltr(String(raw.length)), c: ltr(String(out.transcript.length)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { e: s.value })} testId="stt-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xl(raw.length), y: dotY, dir: "horizontal" }} s={s} testId="stt-c1">
          <T x={X0} y={rawY - 18} text={t("rawLabel")} anchor="start" size={12} bold />
          <text x={X0} y={rawY} fontWeight={600} style={{ fontSize: svgPx(12), fill: "var(--ai-d)" }} onPointerEnter={() => setHover("raw")} onPointerLeave={() => setHover(null)}>
            {raw.length > per ? `${show(raw.slice(0, per - 1))}…` : show(raw)}
          </text>
          <T x={X0} y={cleanY - 18} text={t("cleanLabel")} anchor="start" size={12} bold />
          <text x={X0} y={cleanY} fontWeight={600} style={{ fontSize: svgPx(12), fill: "var(--ai-c)" }} onPointerEnter={() => setHover("clean")} onPointerLeave={() => setHover(null)}>
            {show(out.transcript)}
          </text>
          <line x1={X0} y1={dotY} x2={W - X0} y2={dotY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={xl(out.transcript.length)} y1={dotY} x2={xl(raw.length)} y2={dotY} style={{ stroke: "var(--ai-b)" }} strokeWidth={hover === "removed" ? 8 : 5} strokeLinecap="round" />
          <circle cx={xl(out.transcript.length)} cy={dotY} r={9} style={{ fill: "var(--ai-c)", ...lit(hover === "clean") }} />
          <T x={xl(out.transcript.length)} y={dotY + 28} text={String(out.transcript.length)} size={12} bold style={{ fill: "var(--ai-c)" }} />
          <T x={Math.max(xl(raw.length), xl(out.transcript.length) + 34)} y={dotY + 28} text={String(raw.length)} size={12} bold style={{ fill: "var(--ai-d)" }} />
          <T x={X0} y={H - 8} text="0" anchor="start" size={12} />
          <T x={W - X0} y={H - 8} text={String(maxLen)} anchor="end" size={12} />
        </Drawing>
      }
    />
  );
}

// ── 2. Sentence starts become capitals (lollipop) ────────────────────────────────────
export function STTCapitalsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("capitals");
  const s = useStepper(5, { min: 1, max: LOWER_SENTENCES.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 26;
  const k = s.value;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - 2 * X0)) * LOWER_SENTENCES.length);
  const { W, H } = d;
  const input = LOWER_SENTENCES.slice(0, k).join(" ");
  const out = run([input]);
  const changed = capitalised(input, out.transcript);
  const cw = (W - 2 * X0) / LOWER_SENTENCES.length;
  const xc = (i: number) => X0 + cw * (i + 0.5);
  const base = H - 66;
  const lens = LOWER_SENTENCES.map((x) => x.length);
  const maxLen = Math.max(...lens);
  const yl = (v: number) => base - (v / maxLen) * (base - 56);
  const firsts = out.transcript.match(/(^|[.!?]\s+)([A-Z])/g)?.map((m) => m.trim().slice(-1)) ?? [];
  const valueText = t("valueText", { k, c: changed });
  const rows: KitRow[] = [
    { key: "k", label: t("rowSentences"), value: String(k) },
    { key: "chars", label: t("rowChars"), value: n0(out.transcript.length) },
    { key: "caps", label: t("rowCaps"), value: String(changed), isKey: true },
    { key: "letters", label: t("rowLetters"), value: firsts.join(", ") },
    { key: "words", label: t("rowWords"), value: String(out.wordCount) },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(String(k)), c: ltr(String(changed)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { k })} testId="stt-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xc(k - 1), y: H - 22, dir: "horizontal" }} s={s} testId="stt-c2">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.25} />
          {LOWER_SENTENCES.map((sen, i) => {
            const on = i < k;
            const letter = on ? sen[0].toUpperCase() : sen[0];
            return (
              <g key={i} opacity={on ? 1 : 0.4} onPointerEnter={() => setHover("caps")} onPointerLeave={() => setHover(null)}>
                <line x1={xc(i)} y1={base} x2={xc(i)} y2={yl(lens[i]) + 16} style={{ stroke: on ? "var(--ai-a)" : "var(--ph-line)" }} strokeWidth={2.5} />
                <circle cx={xc(i)} cy={yl(lens[i])} r={16} style={{ fill: on ? "var(--ai-a)" : "var(--ph-surface)", ...lit(on && hover === "caps") }} />
                <text x={xc(i)} y={yl(lens[i]) + 5.5} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(15), fill: on ? "var(--ph-surface)" : "var(--ph-ink-muted)" }}>
                  {letter}
                </text>
                <T x={xc(i)} y={base + 15} text={String(lens[i])} size={12} />
              </g>
            );
          })}
          <T x={X0} y={18} text={t("axis")} anchor="start" size={12} bold />
          <line x1={X0} y1={H - 22} x2={W - X0} y2={H - 22} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={H - 22} x2={xc(k - 1)} y2={H - 22} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 3. Interim guesses and final segments (swimlane timeline) ────────────────────────
export function STTInterimCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("interim");
  const s = useStepper(4, { min: 1, max: EVENTS.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const X0 = 74;
  const i = s.value;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - X0 - 16)) * EVENTS.length);
  const { W, H } = d;
  const seen = EVENTS.slice(0, i);
  const finals = seen.filter((e) => e.final).map((e) => e.final as string);
  const lastFinal = seen.map((e, j) => (e.final ? j : -1)).reduce((a, j) => Math.max(a, j), -1);
  const interim = EVENTS[i - 1].interim && lastFinal < i - 1 ? (EVENTS[i - 1].interim as string) : "";
  const out = run(finals);
  const cw = (W - X0 - 16) / EVENTS.length;
  const xc = (j: number) => X0 + cw * (j + 0.5);
  const lane1 = 40;
  const lane2 = 104;
  const shownY = 160;
  const per = Math.floor((W - 24) / 7);
  const display = [out.transcript, interim].filter(Boolean).join(" ");
  const valueText = t("valueText", { i, w: out.wordCount });
  const rows: KitRow[] = [
    { key: "event", label: t("rowEvent"), value: `${i} / ${EVENTS.length}` },
    { key: "finals", label: t("rowFinals"), value: String(finals.length) },
    { key: "words", label: t("rowWords"), value: String(out.wordCount), isKey: true },
    { key: "interim", label: t("rowInterim"), value: String(interim ? interim.split(" ").length : 0) },
    { key: "shown", label: t("rowShown"), value: String(display.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { i: ltr(String(i)), w: ltr(String(out.wordCount)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { i })} testId="stt-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xc(i - 1), y: H - 22, dir: "horizontal" }} s={s} testId="stt-c3">
          <T x={10} y={lane1 + 4} text={t("laneInterim")} anchor="start" size={12} bold />
          <T x={10} y={lane2 + 4} text={t("laneFinal")} anchor="start" size={12} bold />
          <line x1={X0} y1={lane1} x2={W - 16} y2={lane1} style={{ stroke: "var(--ph-grid)" }} strokeWidth={14} strokeLinecap="round" />
          <line x1={X0} y1={lane2} x2={W - 16} y2={lane2} style={{ stroke: "var(--ph-grid)" }} strokeWidth={14} strokeLinecap="round" />
          {EVENTS.map((e, j) => {
            const on = j < i;
            const y = e.final ? lane2 : lane1;
            const words = (e.final ?? e.interim ?? "").split(" ").length;
            return (
              <g key={j} opacity={on ? 1 : 0.35} onPointerEnter={() => setHover(e.final ? "finals" : "interim")} onPointerLeave={() => setHover(null)}>
                {e.final && j > 0 && <line x1={xc(j)} y1={lane1} x2={xc(j)} y2={lane2} style={{ stroke: "var(--ai-c)" }} strokeDasharray="3 3" />}
                <circle cx={xc(j)} cy={y} r={e.final ? 11 : 4 + words * 1.4} style={{ fill: e.final ? "var(--ai-c)" : "var(--ai-b)", ...lit(on && hover === (e.final ? "finals" : "interim")) }} />
                <T x={xc(j)} y={y + (e.final ? 28 : -14)} text={String(words)} size={12} bold style={INK} />
              </g>
            );
          })}
          <T x={12} y={shownY - 18} text={t("shown")} anchor="start" size={12} bold />
          {/* What the Transcript card shows at this event: committed text in ink, the interim guess faint. */}
          {[...wrap(out.transcript, per, 2).map((ln) => ({ ln, faint: false })), ...(interim ? [{ ln: `${interim}…`, faint: true }] : [])].slice(0, 3).map((r, j) => (
            <text key={j} x={12} y={shownY + j * 17} fontWeight={600} style={{ fontSize: svgPx(12), fill: r.faint ? "var(--ph-ink-muted)" : "var(--ph-ink)" }}>
              {r.ln}
            </text>
          ))}
          <line x1={X0} y1={H - 22} x2={W - 16} y2={H - 22} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={H - 22} x2={xc(i - 1)} y2={H - 22} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 4. Joining segments with one space (stacked bar) ─────────────────────────────────
const CLEANED = EXAMPLE_SEGMENTS.map(clean);
const SEG_COLORS = ["var(--ai-a)", "var(--ai-b)", "var(--ai-c)", "var(--ai-e)", "var(--ai-d)"];
export function STTJoinCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("join");
  const s = useStepper(3, { min: 1, max: CLEANED.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 220;
  const X0 = 20;
  const k = s.value;
  const out = run(EXAMPLE_SEGMENTS.slice(0, k));
  const fullLen = run(EXAMPLE_SEGMENTS).transcript.length;
  const d = useDrawing(HMIN, s, (x, _y, W) => {
    const f = (x - X0) / (W - 2 * X0);
    let acc = 0;
    for (let j = 0; j < CLEANED.length; j++) {
      acc += CLEANED[j].length + (j ? 1 : 0);
      if (f * fullLen <= acc) return j + 1;
    }
    return CLEANED.length;
  });
  const { W, H } = d;
  const xl = (v: number) => X0 + (v / fullLen) * (W - 2 * X0);
  const barY = H / 2 - 30;
  const barH = 44;
  const sum = CLEANED.slice(0, k).reduce((a, c) => a + c.length, 0);
  // Segment j starts after the previous segments plus one joining space each.
  const parts = CLEANED.map((c, j) => {
    const x0 = CLEANED.slice(0, j).reduce((a, q) => a + q.length + 1, 0);
    return { j, x0, x1: x0 + c.length };
  });
  const valueText = t("valueText", { k, c: out.transcript.length });
  const rows: KitRow[] = [
    { key: "k", label: t("rowSegments"), value: String(k) },
    { key: "sum", label: t("rowSum"), value: String(sum) },
    { key: "spaces", label: t("rowSpaces"), value: String(k - 1) },
    { key: "len", label: t("rowLen"), value: String(out.transcript.length), isKey: true },
    { key: "words", label: t("rowWords"), value: String(out.wordCount) },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(String(k)), c: ltr(String(out.transcript.length)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { k })} testId="stt-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xl(parts[k - 1].x1), y: barY + barH + 34, dir: "horizontal" }} s={s} testId="stt-c4">
          <rect x={X0} y={barY} width={W - 2 * X0} height={barH} rx={14} style={{ fill: "var(--glass-track)" }} />
          {parts.map((p) => {
            const on = p.j < k;
            return (
              <g key={p.j} opacity={on ? 1 : 0.3} onPointerEnter={() => setHover("sum")} onPointerLeave={() => setHover(null)}>
                {p.j > 0 && on && <circle cx={xl(p.x0 - 0.5)} cy={barY + barH / 2} r={4} style={{ fill: "var(--ph-ink)", ...lit(hover === "spaces") }} />}
                <rect x={xl(p.x0)} y={barY} width={xl(p.x1) - xl(p.x0)} height={barH} rx={10} style={{ fill: SEG_COLORS[p.j], ...lit(on && hover === "sum") }} />
                <T x={(xl(p.x0) + xl(p.x1)) / 2} y={barY + barH / 2 + 4} text={String(CLEANED[p.j].length)} size={12} bold style={{ fill: "var(--ph-surface)" }} />
                <T x={(xl(p.x0) + xl(p.x1)) / 2} y={barY - 10} text={`S${p.j + 1}`} size={12} bold style={on ? INK : MUTED} />
              </g>
            );
          })}
          <line x1={X0} y1={barY + barH + 34} x2={W - X0} y2={barY + barH + 34} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={barY + barH + 34} x2={xl(parts[k - 1].x1)} y2={barY + barH + 34} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
          <T x={W - X0} y={H - 6} text={t("total", { c: out.transcript.length })} anchor="end" size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 5. Word lengths in the transcript (donut) ────────────────────────────────────────
const EXAMPLE_WORDS = run(EXAMPLE_SEGMENTS).transcript.split(" ");
export function STTWordLengthsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("wordLengths");
  const s = useStepper(20, { min: 3, max: EXAMPLE_WORDS.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 480, h: 240 });
  const words = EXAMPLE_WORDS.slice(0, s.value);
  const len = (w: string) => w.replace(/[^A-Za-z']/g, "").length;
  const parts = [
    { key: "short", v: words.filter((w) => len(w) <= 3).length, color: "var(--ai-b)" },
    { key: "medium", v: words.filter((w) => len(w) >= 4 && len(w) <= 6).length, color: "var(--ai-a)" },
    { key: "long", v: words.filter((w) => len(w) >= 7).length, color: "var(--ai-e)" },
  ];
  const avg = words.reduce((a, w) => a + len(w), 0) / words.length;
  const total = words.length;
  const cx = Math.min(W * 0.32, H / 2 + 20);
  const cy = H / 2;
  const R = Math.min(H / 2 - 12, W * 0.26);
  const r0 = R * 0.58;
  let acc = 0;
  const arcs = parts.map((p) => {
    const a0 = (acc / total) * 2 * Math.PI;
    acc += p.v;
    const a1 = (acc / total) * 2 * Math.PI;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const P = (a: number, rr: number) => `${px2(cx + rr * Math.sin(a))} ${px2(cy - rr * Math.cos(a))}`;
    const full = a1 - a0 >= 2 * Math.PI - 1e-6;
    return { ...p, full, d: p.v === 0 || full ? "" : `M ${P(a0, R)} A ${R} ${R} 0 ${big} 1 ${P(a1, R)} L ${P(a1, r0)} A ${r0} ${r0} 0 ${big} 0 ${P(a0, r0)} Z` };
  });
  const lx = cx + R + 28;
  const valueText = t("valueText", { w: total, a: avg.toFixed(2) });
  const rows: KitRow[] = [
    { key: "words", label: t("rowWords"), value: String(total) },
    { key: "short", label: t("legend.short"), value: String(parts[0].v) },
    { key: "medium", label: t("legend.medium"), value: String(parts[1].v) },
    { key: "long", label: t("legend.long"), value: String(parts[2].v) },
    { key: "avg", label: t("rowAvg"), value: avg.toFixed(2), isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { w: ltr(String(total)), a: ltr(avg.toFixed(2)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="stt-c5-handle" ticks={[3, 20, EXAMPLE_WORDS.length].map((v) => ({ at: v, text: String(v) }))} />
          <KitControls s={s} valueText={t("valueShort", { w: total })} testId="stt-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative min-h-[240px] w-full flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {arcs.map((a) =>
              a.full ? (
                <circle key={a.key} cx={cx} cy={cy} r={(R + r0) / 2} fill="none" style={{ stroke: a.color }} strokeWidth={R - r0} />
              ) : a.d ? (
                <path key={a.key} d={a.d} style={{ fill: a.color, ...lit(hover === a.key) }} onPointerEnter={() => setHover(a.key)} onPointerLeave={() => setHover(null)} />
              ) : null,
            )}
            <T x={cx} y={cy - 2} text={avg.toFixed(2)} size={18} bold style={INK} />
            <T x={cx} y={cy + 16} text={t("centre")} size={12} />
            {parts.map((p, i) => {
              const y = cy - 36 + i * 36;
              return (
                <g key={p.key} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)}>
                  <circle cx={lx} cy={y} r={7} style={{ fill: p.color }} />
                  <T x={lx + 14} y={y - 2} text={t(`legend.${p.key}`)} anchor="start" size={12} bold style={INK} />
                  <T x={lx + 14} y={y + 13} text={`${p.v} · ${((p.v / total) * 100).toFixed(1)} %`} anchor="start" size={12} />
                </g>
              );
            })}
          </svg>
        </div>
      }
    />
  );
}

// ── 7. Which languages get capitals (radial bars) ────────────────────────────────────
export function STTLanguagesCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("languages");
  const s = useStepper(3, { min: 0, max: LANG_SAMPLES.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const data = useMemo(
    () =>
      LANG_SAMPLES.map((l) => {
        const out = run([l.text]);
        const starts = (clean(l.text).match(/(^|[.!?।؟]\s+)\S/g) ?? []).length;
        return { ...l, out, starts, caps: capitalised(clean(l.text), out.transcript) };
      }),
    [],
  );
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const nw = W < 460;
    const R0 = nw ? Math.min(W / 2 - 44, 100) : 0;
    let a = Math.atan2(x - (nw ? W / 2 : Math.min(W * 0.3, H / 2 + 10)), -(y - (nw ? R0 + 40 : H / 2)));
    if (a < 0) a += 2 * Math.PI;
    return Math.round((a / (2 * Math.PI)) * LANG_SAMPLES.length - 0.5);
  });
  const { W, H } = d;
  // Wide: radial on the left, texts on the right. Narrow (phone): radial on top, texts under it.
  const narrow = W < 460;
  const R = narrow ? Math.min(W / 2 - 44, 100) : Math.min(H / 2 - 30, W * 0.26);
  const cx = narrow ? W / 2 : Math.min(W * 0.3, H / 2 + 10);
  const cy = narrow ? R + 40 : H / 2;
  const r0 = 26;
  const cur = data[s.value];
  const ang = (i: number) => ((i + 0.5) / LANG_SAMPLES.length) * 2 * Math.PI;
  const P = (a: number, r: number) => [px2(cx + r * Math.sin(a)), px2(cy - r * Math.cos(a))] as const;
  const [hx, hy] = P(ang(s.value), R + 14);
  const tx = narrow ? 12 : cx + R + 40;
  const ty = narrow ? cy + R + 58 : cy - 46;
  const per = Math.max(10, Math.floor((W - tx - 10) / 7));
  // Arabic samples run right to left: anchored at the right edge of the text column.
  const rtl = cur.code.startsWith("ar");
  const lx0 = rtl ? W - 10 : tx;
  const valueText = t("valueText", { l: cur.code, c: cur.caps, s: cur.starts });
  // The drawing is as tall as its text column (phone: under the radial), so no line falls below its edge.
  const afterLines = wrap(cur.out.transcript, per, 2);
  const lastBase = ty + (narrow ? 76 : 84) + (afterLines.length - 1) * 16;
  const needH = Math.ceil(lastBase + 2 * LABEL_GAP);
  const rows: KitRow[] = [
    { key: "lang", label: t("rowLang"), value: cur.code },
    { key: "starts", label: t("rowStarts"), value: String(cur.starts) },
    { key: "caps", label: t("rowCaps"), value: String(cur.caps), isKey: true },
    { key: "words", label: t("rowWords"), value: String(cur.out.wordCount) },
    { key: "share", label: t("rowShare"), value: `${Math.round((cur.caps / cur.starts) * 100)} %` },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t(cur.caps === cur.starts ? "caption.all" : cur.caps === 0 ? "caption.none" : "caption.some", { l: ltr(cur.code), c: ltr(String(cur.caps)), s: ltr(String(cur.starts)) })}
      controls={<KitControls s={s} valueText={cur.code} testId="stt-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} H={Math.max(H, needH)} hMin={Math.max(HMIN, needH)} label={t("handle")} valueText={valueText} handle={{ x: hx, y: hy, dir: "circular" }} s={s} testId="stt-c7">
          <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: "var(--ph-grid)" }} />
          <circle cx={cx} cy={cy} r={(R + r0) / 2} fill="none" style={{ stroke: "var(--ph-grid)" }} strokeDasharray="3 4" />
          {data.map((l, i) => {
            const a = ang(i);
            const on = i === s.value;
            const len = r0 + (l.caps / Math.max(1, l.starts)) * (R - r0);
            const [x0, y0] = P(a, r0);
            const [x1, y1] = P(a, Math.max(r0 + 4, len));
            const [lx, ly] = P(a, R + 32);
            return (
              <g key={l.code} onPointerEnter={() => setHover("caps")} onPointerLeave={() => setHover(null)}>
                <line x1={x0} y1={y0} x2={x1} y2={y1} style={{ stroke: on ? "var(--ai-a)" : "var(--ai-soft)" }} strokeWidth={on ? 14 : 11} strokeLinecap="round" />
                {!on && <T x={lx} y={ly + 4} text={l.code.slice(0, 2)} size={12} bold style={MUTED} />}
              </g>
            );
          })}
          <T x={cx} y={cy + 5} text={`${cur.caps}/${cur.starts}`} size={13} bold style={INK} />
          <T x={tx} y={ty} text={t("before")} anchor="start" size={12} bold />
          {wrap(clean(cur.text), per, 2).map((ln, j) => (
            <text key={`b${j}`} x={lx0} y={ty + 18 + j * 16} fontWeight={600} direction={rtl ? "rtl" : "ltr"} textAnchor="start" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {ln}
            </text>
          ))}
          <T x={tx} y={ty + (narrow ? 58 : 66)} text={t("after")} anchor="start" size={12} bold />
          {afterLines.map((ln, j) => (
            <text key={`a${j}`} x={lx0} y={ty + (narrow ? 76 : 84) + j * 16} fontWeight={700} direction={rtl ? "rtl" : "ltr"} textAnchor="start" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
              {ln}
            </text>
          ))}
        </Drawing>
      }
    />
  );
}

// ── 8. Characters versus words as the transcript grows (double-ring gauge) ───────────
const FULL = run(EXAMPLE_SEGMENTS).transcript;
const FULL_WORDS = FULL.split(" ").length;
export function STTGaugeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("gauge");
  const s = useStepper(120, { min: 0, max: FULL.length, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const prefix = FULL.slice(0, s.value);
  const out = run([prefix]);
  const valueText = t("valueText", { c: s.value, w: out.wordCount });
  const rows: KitRow[] = [
    { key: "chars", label: t("rowChars"), value: `${s.value} / ${FULL.length}` },
    { key: "words", label: t("rowWords"), value: `${out.wordCount} / ${FULL_WORDS}`, isKey: true },
    { key: "spaces", label: t("rowSpaces"), value: String((out.transcript.match(/ /g) ?? []).length) },
    { key: "avg", label: t("rowAvg"), value: out.wordCount ? (out.transcript.replace(/ /g, "").length / out.wordCount).toFixed(2) : "0.00" },
  ];
  return (
    <IndicatorCard
      idPrefix="stt"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { c: ltr(String(s.value)), w: ltr(String(out.wordCount)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { c: s.value })} testId="stt-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <DualRingGauge
          s={s}
          frac={s.value / FULL.length}
          innerFrac={out.wordCount / FULL_WORDS}
          fromFrac={(f) => f * FULL.length}
          outer={{ ticks: Array.from({ length: 9 }, (_, i) => ((i + 1) * 25) / FULL.length).filter((f) => f < 1), color: "var(--ai-a)", tickColor: "var(--ph-ink)", hoverKey: "chars" }}
          inner={{ ticks: Array.from({ length: Math.floor(FULL_WORDS / 5) }, (_, i) => ((i + 1) * 5) / FULL_WORDS).filter((f) => f < 1), color: "var(--ai-c)", tickColor: "var(--ph-ink-muted)", hoverKey: "words" }}
          center={[`${s.value}`, t("outerUnit"), t("innerUnit", { w: out.wordCount })]}
          hover={hover}
          onHover={setHover}
          label={t("handle")}
          valueText={valueText}
          testId="stt-c8"
          hMin={280}
        />
      }
    />
  );
}
