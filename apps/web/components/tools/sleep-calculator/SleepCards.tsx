"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1 } from "@/components/tool-ui/indicator-kit/format";
import { useSleepLive } from "./SleepLiveContext";
import {
  ADULT_INDEX,
  AGE_GROUPS,
  CYCLE_MIN,
  DAY,
  EFF_ZONES,
  OPTION_COLORS,
  STAGES,
  STAGE_COLORS,
  VERDICT_COLORS,
  WIND_DOWN,
  ageVerdict,
  clock,
  cycleSegments,
  cycleStages,
  dur,
  effZone,
  hrs,
  latencyKey,
  optionClock,
  sgnMin,
  stageAt,
  stageTotals,
  wrap,
  type StageKey,
} from "./sleep";

/**
 * The eight sleep indicator cards (§31 library). All read the calculator's live result (mode,
 * entered time, minutes to fall asleep, the four options) through SleepLiveContext. The 24-hour
 * dial writes the entered time and the formula card writes the minutes to fall asleep back, so
 * dragging them moves the inputs, the Result table and the 3D night clock. The other cards keep a
 * what-if value of their own on top of the live result. Numbers use Western digits, like the BMI
 * cards. Drag handles sit on their own tracks or ring; no value label is ever drawn under a handle.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
/** Clear distance under a track for its labels: the 44px handle never covers them. */
const TRACK_LABEL_DY = 38;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.sleep-calculator.visuals.${key}`),
    tc: useTranslations("tools.sleep-calculator.visuals.common"),
    tr: useTranslations("tools.sleep-calculator.result"),
    tk: useTranslations("toolPage.indicatorKit"),
  };
}

/** A what-if track along the bottom of a card's SVG; its labels sit below the handle's reach. */
function SvgTrack({ W, y, frac, lo, hi, stops }: { W: number; y: number; frac: number; lo?: string; hi?: string; stops?: { frac: number; text?: string; on?: boolean }[] }) {
  const x = X0 + clamp(frac, 0, 1) * (W - 2 * X0);
  return (
    <g>
      <line x1={X0} y1={y} x2={W - X0} y2={y} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <line x1={X0} y1={y} x2={x} y2={y} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
      {lo && <T x={X0} y={y + TRACK_LABEL_DY} text={lo} anchor="start" size={10.5} />}
      {hi && <T x={W - X0} y={y + TRACK_LABEL_DY} text={hi} anchor="end" size={10.5} />}
      {stops?.map((st, i) => {
        const sx = X0 + st.frac * (W - 2 * X0);
        return (
          <g key={i}>
            <circle cx={sx} cy={y} r={3.5} style={{ fill: "var(--ph-ink-muted)" }} />
            {st.text && <T x={sx} y={y + TRACK_LABEL_DY} text={st.text} anchor={i === 0 ? "start" : i === stops.length - 1 ? "end" : "middle"} size={9.5} bold={st.on} style={st.on ? INK : MUTED} />}
          </g>
        );
      })}
    </g>
  );
}

function Card({ n, side, k, caption, s, valueText, rows, hover, setHover, visual }: { n: number; side: Side; k: string; caption: string; s: Stepper; valueText: string; rows: KitRow[]; hover: string | null; setHover: (v: string | null) => void; visual: ReactNode }) {
  const { t, tk } = useCardText(k);
  return (
    <IndicatorCard
      idPrefix="sleep"
      n={n}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      controls={<KitControls s={s} valueText={valueText} testId={`sleep-c${n}`} />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tk("worked")} />}
      visual={visual}
    />
  );
}

/** A stepper whose value lives in the calculator (writes go straight back to it). */
function useSharedStepper(value: number, write: (v: number) => void, { min, max, step }: { min: number; max: number; step: number }): Stepper {
  const [seed] = useState(value);
  const [flash, setFlash] = useState(0);
  const set = (v: number) => {
    const next = clamp(Math.round(v / step) * step, min, max);
    if (next !== value) {
      setFlash((f) => f + 1);
      write(next);
    }
  };
  return {
    value,
    set,
    inc: () => set(value + step),
    dec: () => set(value - step),
    reset: () => set(seed),
    flash,
    atMin: value <= min,
    atMax: value >= max,
    isSeed: value === seed,
    min,
    max,
    step,
  };
}

const feelOf = (stage: StageKey) => (stage === "n3" ? "high" : stage === "n2" ? "moderate" : "low");
const FEEL_COLORS = { low: "#22c55e", moderate: "#f59e0b", high: "#ef4444" } as const;

// ── 1. Trend line with a reference point: the night's hypnogram, drag the wake-up (wow) ──────
const T_MIN = 60;
const T_MAX = 600;
export function SleepHypnogramCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("hypno");
  const { snap } = useSleepLive();
  const best = snap.nights[0];
  const s = useStepper(best.sleepMinutes, { min: T_MIN, max: T_MAX, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 380;
  const PL = 58;
  const PR = 16;
  const d = useDrawing(HMIN, s, (x, _y, W) => T_MIN + ((x - X0) / (W - 2 * X0)) * (T_MAX - T_MIN));
  const { W, H } = d;
  const top = 48;
  const base = H - 118;
  const LEVELS: StageKey[] = ["wake", "rem", "n1", "n2", "n3"];
  const ly = (st: StageKey) => top + (LEVELS.indexOf(st) / (LEVELS.length - 1)) * (base - top);
  const xt = (m: number) => PL + (m / T_MAX) * (W - PL - PR);
  const tm = s.value;
  const at = stageAt(tm);
  const feel = feelOf(at.stage);
  const wakeClock = clock(best.onset + tm);
  const stageName = at.stage === "wake" ? t("boundary") : tc(`stages.${at.stage}`);
  const nearest = Math.round(tm / CYCLE_MIN) * CYCLE_MIN;
  const segs = Array.from({ length: Math.ceil(T_MAX / CYCLE_MIN) }, (_, i) => cycleSegments(i))
    .flat()
    .filter((g) => g.from < T_MAX)
    .map((g) => ({ ...g, to: Math.min(g.to, T_MAX) }));
  const trackY = H - 52;
  const valueText = `${wakeClock} · ${hrs(tm)}`;
  const rows: KitRow[] = [
    { key: "wake", label: `${clock(best.onset)} + ${dur(tm)}`, value: wakeClock, isKey: true },
    { key: "cycles", label: t("rowCycles"), value: `${at.cycle} + ${Math.round(at.into)} min` },
    { key: "stage", label: t("rowStage"), value: stageName },
    { key: "nearest", label: t("rowNearest"), value: `${clock(best.onset + nearest)} (${sgnMin(nearest - tm)})` },
    { key: "feel", label: t("rowFeel"), value: t(`feel.${feel}`) },
  ];
  const mx = xt(tm);
  const tagRight = mx < W * 0.6;
  return (
    <Card
      n={1}
      side={side}
      k="hypno"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { time: ltr(wakeClock), stage: stageName, feel: t(`feel.${feel}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((tm - T_MIN) / (T_MAX - T_MIN)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c1">
          {/* Stage rows */}
          {LEVELS.map((st) => (
            <g key={st}>
              <line x1={PL} y1={ly(st)} x2={W - PR} y2={ly(st)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={ly(st) + 4} text={tc(`stages.${st}`)} anchor="end" size={10} bold style={{ fill: STAGE_COLORS[st] }} />
            </g>
          ))}
          {/* Cycle boundaries */}
          {Array.from({ length: Math.floor(T_MAX / CYCLE_MIN) + 1 }, (_, i) => (
            <g key={i}>
              <line x1={xt(i * CYCLE_MIN)} y1={top - 8} x2={xt(i * CYCLE_MIN)} y2={base} style={{ stroke: "var(--ph-line)" }} strokeDasharray="3 4" />
              {i < Math.floor(T_MAX / CYCLE_MIN) + 1 && i * CYCLE_MIN + 45 < T_MAX && <T x={xt(i * CYCLE_MIN + 45)} y={top - 12} text={`C${i + 1}`} size={9.5} />}
            </g>
          ))}
          {/* Hypnogram: connectors, then coloured stage runs (past the wake-up faded) */}
          {segs.map((g, i) => {
            const next = segs[i + 1];
            return next ? <line key={`v${i}`} x1={xt(g.to)} y1={ly(g.stage)} x2={xt(g.to)} y2={ly(next.stage)} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={1.2} opacity={g.to > tm ? 0.3 : 0.8} /> : null;
          })}
          {segs.map((g, i) => (
            <line key={`h${i}`} x1={xt(g.from)} y1={ly(g.stage)} x2={xt(g.to)} y2={ly(g.stage)} stroke={STAGE_COLORS[g.stage]} strokeWidth={hover === "stage" && tm >= g.from && tm < g.to ? 8 : 5} strokeLinecap="round" opacity={g.from >= tm ? 0.25 : 1} />
          ))}
          {/* Nearest cycle end */}
          <line x1={xt(nearest)} y1={top - 4} x2={xt(nearest)} y2={base} stroke="#22c55e" strokeWidth={hover === "nearest" ? 3 : 2} opacity={0.8} />
          {/* The what-if wake-up */}
          <rect x={mx} y={top - 4} width={Math.max(0, xt(T_MAX) - mx)} height={base - top + 4} style={{ fill: "var(--ph-ink-muted)" }} opacity={0.07} />
          <line x1={mx} y1={top - 4} x2={mx} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <circle cx={mx} cy={ly(at.stage)} r={7} fill={STAGE_COLORS[at.stage]} stroke="#fff" strokeWidth={2} />
          <T x={tagRight ? mx + 6 : mx - 6} y={18} text={`${wakeClock} · ${stageName}`} anchor={tagRight ? "start" : "end"} size={12} bold style={{ fill: FEEL_COLORS[feel] }} />
          {/* Hours asleep axis */}
          {[0, 2, 4, 6, 8, 10].map((h) => (
            <T key={h} x={xt(h * 60)} y={base + 18} text={`${h} h`} size={10} />
          ))}
          <SvgTrack W={W} y={trackY} frac={(tm - T_MIN) / (T_MAX - T_MIN)} lo="1 h" hi="10 h" />
        </Drawing>
      }
    />
  );
}

// ── 2. Multi-ring donut: the 24-hour dial, drag the hand (writes the entered time) ───────────
export function SleepDialCard({ side }: { side: Side }) {
  const { t, tr } = useCardText("dial");
  const tModes = useTranslations("tools.sleep-calculator.modes");
  const { snap, setAnchor } = useSleepLive();
  const s = useSharedStepper(Math.round(snap.anchor / 5) * 5 >= DAY ? DAY - 5 : Math.round(snap.anchor / 5) * 5, setAnchor, { min: 0, max: DAY - 5, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 430;
  const geo = (W: number, H: number) => {
    // Hour numerals sit 30px outside the handle ring (the 44px handle never reaches them); the
    // readout and legend sit under the dial.
    const Rh = Math.max(92, Math.min(W / 2 - 46, (H - 164) / 2));
    return { cx: W / 2, cy: 44 + Rh, Rh };
  };
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const { cx, cy } = geo(W, H);
    const a = Math.atan2(x - cx, -(y - cy));
    return wrap(((a < 0 ? a + 2 * Math.PI : a) / (2 * Math.PI)) * DAY);
  });
  const { W, H } = d;
  const { cx, cy, Rh } = geo(W, H);
  const Ro = Rh - 32;
  const RS = Math.min(16, (Ro - 14) / 4);
  const RW = RS - 4;
  const pt = (m: number, r: number): [number, number] => {
    const a = (wrap(m) / DAY) * 2 * Math.PI;
    return [px2(cx + r * Math.sin(a)), px2(cy - r * Math.cos(a))];
  };
  const arc = (m0: number, len: number, r: number) => {
    const L = Math.max(1, Math.min(DAY - 1, len));
    const [x0, y0] = pt(m0, r);
    const [x1, y1] = pt(m0 + L, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${L > DAY / 2 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const anchor = s.value;
  const wakeUp = snap.mode === "wakeUp";
  const valueText = clock(anchor);
  const rows: KitRow[] = [
    { key: "anchor", label: tModes(`labels.${snap.mode}`), value: clock(anchor), isKey: true },
    ...snap.nights.map((o) => ({ key: `o${o.cycles}`, label: `${tr("cyclesCount", { count: o.cycles })} (${hrs(o.sleepMinutes)})`, value: clock(o.clockMinutes) })),
    { key: "span", label: t("rowSpan"), value: `${clock(snap.nights[0].bed)} → ${clock(snap.nights[0].wake)}` },
  ];
  const [hx, hy] = pt(anchor, Rh);
  const [ex, ey] = pt(anchor, Rh - 24);
  const colW = (W - 2 * X0) / 2;
  return (
    <Card
      n={2}
      side={side}
      k="dial"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t(wakeUp ? "captionWake" : "captionBed", { time: ltr(clock(anchor)), best: ltr(clock(snap.nights[0].clockMinutes)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: hx, y: hy, dir: "free" }} s={s} testId="sleep-c2">
          {/* Handle ring with hour ticks */}
          <circle cx={cx} cy={cy} r={Rh} fill="none" style={{ stroke: "var(--ph-line)" }} strokeDasharray="2 5" />
          <circle cx={cx} cy={cy} r={Ro + 10} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} />
          {Array.from({ length: 24 }, (_, h) => {
            const [a1, b1] = pt(h * 60, Ro + 10);
            const [a2, b2] = pt(h * 60, Ro + (h % 6 === 0 ? 20 : 15));
            return <line key={h} x1={a1} y1={b1} x2={a2} y2={b2} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={h % 6 === 0 ? 2 : 1} />;
          })}
          {/* One ring per option: falling asleep (amber), then sleep */}
          {snap.nights.map((o, i) => {
            const r = Ro - i * RS;
            const lat = wrap(o.onset - o.bed);
            const on = hover === `o${o.cycles}` || (hover === "span" && i === 0);
            return (
              <g key={o.cycles}>
                <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--ph-grid)" }} strokeWidth={RW} />
                {lat > 0 && <path d={arc(o.bed, lat, r)} fill="none" stroke={STAGE_COLORS.wake} strokeWidth={RW} />}
                <path d={arc(o.onset, o.sleepMinutes, r)} fill="none" stroke={OPTION_COLORS[o.cycles]} strokeWidth={on ? RW + 4 : RW} />
              </g>
            );
          })}
          {/* 24-hour numerals outside the handle ring */}
          {[0, 6, 12, 18].map((h) => {
            const [x, y] = pt(h * 60, Rh + 32);
            const side = h > 0 && h < 12 ? "start" : h > 12 ? "end" : "middle";
            return <T key={h} x={side === "start" ? x - 5 : side === "end" ? x + 5 : x} y={y + 4} text={String(h)} anchor={side} size={11} bold />;
          })}
          {/* Hand to the handle */}
          <line x1={cx} y1={cy} x2={ex} y2={ey} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
          <circle cx={cx} cy={cy} r={5} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + Rh + 64} text={`${clock(anchor)} → ${clock(snap.nights[0].clockMinutes)}`} size={14} bold style={INK} />
          {/* Legend under the dial, out of the handle's reach */}
          {snap.nights.map((o, i) => {
            const lx = X0 + (i % 2) * colW;
            const lyy = cy + Rh + 88 + Math.floor(i / 2) * 18;
            return (
              <g key={`lg${o.cycles}`}>
                <rect x={lx} y={lyy - 9} width={10} height={10} rx={2} fill={OPTION_COLORS[o.cycles]} />
                <T x={lx + 15} y={lyy} text={`${o.cycles}× ${hrs(o.sleepMinutes)} · ${clock(o.clockMinutes)}`} anchor="start" size={10.5} bold={o.cycles >= 5} style={INK} />
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}

// ── 3. Stacked segmented bars: minutes per sleep stage in each cycle ─────────────────────────
export function SleepStagesCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("stages");
  const s = useStepper(5, { min: 3, max: 6, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const d = useDrawing(HMIN, s, (x, _y, W) => 3 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const N = s.value;
  const tot = stageTotals(N);
  const total = N * CYCLE_MIN;
  const top = 34;
  const base = H - 150;
  const cw = (W - 2 * X0) / 6;
  const yv = (m: number) => (m / CYCLE_MIN) * (base - top);
  const trackY = H - 52;
  const valueText = `${N} × 90 min`;
  const deep3 = [0, 1, 2].reduce((a, i) => a + cycleStages(i).n3, 0);
  const rows: KitRow[] = [
    ...STAGES.map((k) => ({ key: k, label: tc(`stageLong.${k}`), value: `${tot[k]} min · ${Math.round((tot[k] / total) * 100)}%`, isKey: k === "rem" })),
    { key: "total", label: `${N} × 90`, value: `${total} min = ${hrs(total)}` },
    { key: "deep", label: t("rowDeepEarly"), value: `${Math.round((Math.min(deep3, tot.n3) / Math.max(1, tot.n3)) * 100)}%` },
    { key: "last", label: t("rowLastRem"), value: `${cycleStages(N - 1).rem} min` },
  ];
  const order: (typeof STAGES)[number][] = ["n1", "n2", "n3", "rem"];
  const legW = (W - 2 * X0) / 2;
  return (
    <Card
      n={3}
      side={side}
      k="stages"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { n: ltr(String(N)), rem: ltr(`${tot.rem} min`), deep: ltr(`${tot.n3} min`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((N - 3) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c3">
          {Array.from({ length: 6 }, (_, i) => {
            const x = X0 + cw * i + cw * 0.14;
            const w = cw * 0.72;
            const used = i < N;
            const c = cycleStages(i);
            let acc = 0;
            return (
              <g key={i} opacity={used ? 1 : 0.22}>
                {order.map((k) => {
                  const h = yv(c[k]);
                  const y = base - yv(acc) - h;
                  acc += c[k];
                  if (h <= 0) return null;
                  return (
                    <g key={k}>
                      <rect x={x} y={y} width={w} height={h} style={{ fill: STAGE_COLORS[k], ...lit(hover === k) }} />
                      {h > 15 && used && <T x={x + w / 2} y={y + h / 2 + 4} text={String(c[k])} size={10} bold style={{ fill: "#fff" }} />}
                    </g>
                  );
                })}
                <T x={x + w / 2} y={top - 8} text={`C${i + 1}`} size={10.5} bold={used} style={used ? INK : MUTED} />
              </g>
            );
          })}
          {/* Totals legend under the bars */}
          {order.map((k, i) => {
            const lx = X0 + (i % 2) * legW;
            const lyy = base + 24 + Math.floor(i / 2) * 20;
            return (
              <g key={`lg${k}`}>
                <rect x={lx} y={lyy - 10} width={11} height={11} rx={2} fill={STAGE_COLORS[k]} />
                <T x={lx + 16} y={lyy} text={`${tc(`stages.${k}`)} ${tot[k]} min (${Math.round((tot[k] / total) * 100)}%)`} anchor="start" size={10.5} bold style={INK} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(N - 3) / 3} stops={[3, 4, 5, 6].map((m, i) => ({ frac: i / 3, text: `${m}×`, on: m === N }))} />
        </Drawing>
      }
    />
  );
}

// ── 4. Zone strip: your options against the recommended range for an age group ───────────────
const HZ0 = 4;
const HZ1 = 20;
export function SleepAgeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("age");
  const { snap } = useSleepLive();
  const s = useStepper(ADULT_INDEX, { min: 0, max: AGE_GROUPS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * (AGE_GROUPS.length - 1));
  const { W, H } = d;
  const g = AGE_GROUPS[s.value];
  const xh = (h: number) => X0 + ((clamp(h, HZ0, HZ1) - HZ0) / (HZ1 - HZ0)) * (W - 2 * X0);
  // Spare height (the table can be taller than the drawing) goes into the gaps, not one empty band.
  const extra = Math.max(0, (H - HMIN) / 3);
  const sy = 92 + extra;
  const sh = 28;
  const trackY = H - 52;
  const name = t(`groups.${g.key}`);
  const valueText = name;
  const recCount = snap.nights.filter((o) => ageVerdict(g, o.sleepMinutes / 60) === "rec").length;
  const rows: KitRow[] = [
    { key: "group", label: s.isSeed ? t("rowGroupAssumed") : t("rowGroup"), value: name },
    { key: "rec", label: t("rowRec"), value: `${g.rec[0]}–${g.rec[1]} h`, isKey: true },
    { key: "may", label: t("rowMay"), value: `${g.may[0]}–${g.may[1]} h` },
    ...snap.nights.map((o) => {
      const v = ageVerdict(g, o.sleepMinutes / 60);
      return { key: `o${o.cycles}`, label: `${o.cycles}× · ${hrs(o.sleepMinutes)}`, value: tc(`verdict.${v}`) };
    }),
  ];
  const bounds = Array.from(new Set([g.may[0], g.rec[0], g.rec[1], g.may[1]]));
  return (
    <Card
      n={4}
      side={side}
      k="age"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { group: name, rec: ltr(`${g.rec[0]}–${g.rec[1]} h`), count: ltr(String(recCount)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (s.value / (AGE_GROUPS.length - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c4">
          <T x={X0} y={20} text={name} anchor="start" size={13} bold style={INK} />
          {/* Zones: not recommended / may be appropriate / recommended */}
          <rect x={xh(HZ0)} y={sy} width={xh(HZ1) - xh(HZ0)} height={sh} rx={5} fill={VERDICT_COLORS.no} opacity={0.35} />
          <rect x={xh(g.may[0])} y={sy} width={xh(g.may[1]) - xh(g.may[0])} height={sh} fill={VERDICT_COLORS.may} opacity={hover === "may" ? 0.85 : 0.55} />
          <rect x={xh(g.rec[0])} y={sy} width={xh(g.rec[1]) - xh(g.rec[0])} height={sh} fill={VERDICT_COLORS.rec} opacity={hover === "rec" ? 0.95 : 0.7} />
          {bounds.map((b) => (
            <T key={b} x={xh(b)} y={sy + sh + 15} text={String(b)} size={10.5} bold style={INK} />
          ))}
          {/* Options as markers on the strip */}
          {snap.nights.map((o) => {
            const h = o.sleepMinutes / 60;
            const on = hover === `o${o.cycles}`;
            return (
              <g key={o.cycles}>
                <line x1={xh(h)} y1={sy - 6} x2={xh(h)} y2={sy + sh + 2} style={{ stroke: "var(--ph-ink)" }} strokeWidth={on ? 4 : 2.5} />
                <T x={xh(h)} y={sy - 26} text={`${o.cycles}×`} size={10} bold style={{ fill: OPTION_COLORS[o.cycles] }} />
                <T x={xh(h)} y={sy - 11} text={`${f1(h)}`} size={10.5} bold style={INK} />
              </g>
            );
          })}
          {/* Hours axis */}
          {[4, 8, 12, 16, 20].map((h) => (
            <T key={h} x={xh(h)} y={sy + sh + 36} text={`${h} h`} size={9.5} />
          ))}
          {/* Legend */}
          {(["rec", "may", "no"] as const).map((v, i) => {
            const lx = X0;
            const lyy = sy + sh + 62 + extra + i * 17;
            return (
              <g key={v}>
                <rect x={lx} y={lyy - 10} width={11} height={11} rx={2} fill={VERDICT_COLORS[v]} opacity={0.8} />
                <T x={lx + 15} y={lyy} text={tc(`verdict.${v}`)} anchor="start" size={10} bold style={INK} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={s.value / (AGE_GROUPS.length - 1)} lo={t("groups.newborn")} hi={t("groups.older")} stops={AGE_GROUPS.map((_, i) => ({ frac: i / (AGE_GROUPS.length - 1) }))} />
        </Drawing>
      }
    />
  );
}

// ── 5. Gradient gauge: sleep efficiency at a what-if time to fall asleep ─────────────────────
export function SleepEfficiencyCard({ side }: { side: Side }) {
  const { snap } = useSleepLive();
  return <Efficiency key={`${snap.latency}-${snap.mode}`} side={side} />;
}
const E0 = 70;
const L_MAX = 120;
function Efficiency({ side }: { side: Side }) {
  const { t } = useCardText("efficiency");
  const { snap } = useSleepLive();
  const best = snap.nights[0];
  const s = useStepper(clamp(snap.latency, 0, L_MAX), { min: 0, max: L_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const geo = (W: number, H: number) => {
    const cy = H - 146;
    const R = Math.max(70, Math.min(W / 2 - 54, cy - 36));
    return { cx: W / 2, cy, R };
  };
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * L_MAX);
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const L = s.value;
  const inBed = best.sleepMinutes + L;
  const eff = (best.sleepMinutes / inBed) * 100;
  const zone = effZone(eff);
  const lk = latencyKey(L);
  const ang = (v: number) => Math.PI * (1 - (clamp(v, E0, 100) - E0) / (100 - E0));
  const pt = (v: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(v))), px2(cy - r * Math.sin(ang(v)))];
  const arcP = (v0: number, v1: number, r: number) => {
    const [x0, y0] = pt(v0, r);
    const [x1, y1] = pt(v1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const [nx, ny] = pt(eff, R - 18);
  const trackY = H - 52;
  const valueText = `${L} min`;
  const maxFor90 = Math.floor(best.sleepMinutes / 0.9 - best.sleepMinutes);
  const rows: KitRow[] = [
    { key: "bed", label: `${best.sleepMinutes} + ${L}`, value: `${inBed} min` },
    { key: "eff", label: `${best.sleepMinutes} ÷ ${inBed}`, value: `${f1(eff)}%`, isKey: true },
    { key: "zone", label: t("rowZone"), value: t(`zones.${zone.key}`) },
    { key: "lat", label: t("rowLatency"), value: t(`latency.${lk}`) },
    { key: "max", label: t("rowMax90"), value: `≤ ${maxFor90} min` },
    snap.mode === "wakeUp"
      ? { key: "shift", label: t("rowBedtime"), value: clock(optionClock("wakeUp", snap.anchor, L, best.cycles)) }
      : { key: "shift", label: t("rowWake"), value: clock(optionClock("bedtime", snap.anchor, L, best.cycles)) },
  ];
  return (
    <Card
      n={5}
      side={side}
      k="efficiency"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { lat: ltr(`${L} min`), eff: ltr(`${f1(eff)}%`), zone: t(`zones.${zone.key}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (L / L_MAX) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c5">
          {EFF_ZONES.map((z) => {
            const on = z.key === zone.key;
            return <path key={z.key} d={arcP(z.from, z.to, R)} fill="none" stroke={z.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.5} />;
          })}
          {[70, 80, 85, 90, 95, 100].map((v) => {
            const [x, y] = pt(v, R + 26);
            return <T key={v} x={x} y={y + 4} text={`${v}`} size={10.5} />;
          })}
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "eff" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 24} text={`${f1(eff)}% · ${dur(best.sleepMinutes)} / ${dur(inBed)}`} size={14} bold style={INK} />
          <T x={cx} y={cy + 42} text={t(`zones.${zone.key}`)} size={11} bold style={{ fill: zone.color }} />
          <T x={cx} y={cy + 58} text={t(`latency.${lk}`)} size={10.5} bold />
          <SvgTrack W={W} y={trackY} frac={L / L_MAX} lo="0 min" hi={`${L_MAX} min`} stops={[30, 45].map((v) => ({ frac: v / L_MAX, text: `${v}` }))} />
        </Drawing>
      }
    />
  );
}

// ── 6. Timeline with stations: the evening wind-down before an option ───────────────────────
export function SleepWindDownCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("windDown");
  const { snap } = useSleepLive();
  const s = useStepper(snap.nights[0].cycles, { min: 3, max: 6, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const d = useDrawing(HMIN, s, (x, _y, W) => 3 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const N = s.value;
  const bed = snap.mode === "wakeUp" ? optionClock("wakeUp", snap.anchor, snap.latency, N) : snap.anchor;
  const onset = wrap(bed + snap.latency);
  const wake = wrap(onset + N * CYCLE_MIN);
  const stations = [...WIND_DOWN.map((w) => ({ key: w.key, at: wrap(bed + w.at), name: tc(`stations.${w.key}`) })), { key: "asleep", at: onset, name: tc("stations.asleep") }, { key: "wake", at: wake, name: tc("stations.wake") }];
  // Stations (not to scale) on top, the same evening-to-morning span to scale below; spare
  // height is shared between the two gaps so the drawing never ends in an empty band.
  const extra = Math.max(0, (H - HMIN) / 3);
  // Narrow drawings put the station labels on four rows (two above, two below) so neighbours on
  // the same row are four stations apart; wide ones need only two.
  const step = (W - 2 * X0 - 20) / 6;
  const four = step < 70;
  const lineY = (four ? 96 : 66) + extra;
  const stripY = lineY + (four ? 116 : 100) + extra;
  const span = 360 + snap.latency + N * CYCLE_MIN;
  const xsc = (m: number) => X0 + (m / span) * (W - 2 * X0);
  const xs = (i: number) => X0 + 10 + i * step;
  const trackY = H - 52;
  const valueText = tr("cyclesCount", { count: N });
  const rows: KitRow[] = stations.map((st) => ({
    key: st.key,
    label: st.key === "bed" ? `${st.name}` : st.key === "asleep" ? `${st.name} (+${snap.latency} min)` : st.key === "wake" ? `${st.name} (+${N} × 90)` : `${st.name} (${sgnMin(WIND_DOWN.find((w) => w.key === st.key)!.at)})`,
    value: clock(st.at),
    isKey: st.key === "bed",
  }));
  return (
    <Card
      n={6}
      side={side}
      k="windDown"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { caffeine: ltr(clock(stations[0].at)), bed: ltr(clock(bed)), wake: ltr(clock(wake)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((N - 3) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c6">
          <line x1={xs(0)} y1={lineY} x2={xs(stations.length - 3)} y2={lineY} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={3} strokeDasharray="1 0" />
          <line x1={xs(stations.length - 3)} y1={lineY} x2={xs(stations.length - 2)} y2={lineY} stroke={STAGE_COLORS.wake} strokeWidth={5} />
          <line x1={xs(stations.length - 2)} y1={lineY} x2={xs(stations.length - 1)} y2={lineY} stroke={OPTION_COLORS[N]} strokeWidth={8} strokeLinecap="round" />
          <T x={(xs(stations.length - 2) + xs(stations.length - 1)) / 2} y={lineY + 26} text={hrs(N * CYCLE_MIN)} size={11} bold style={{ fill: OPTION_COLORS[N] }} />
          {stations.map((st, i) => {
            const up = i % 2 === 0;
            const far = four && i % 4 >= 2 ? 30 : 0;
            const on = hover === st.key;
            const x = xs(i);
            const anchor = i === 0 ? "start" : i === stations.length - 1 ? "end" : "middle";
            const tx = i === 0 ? x - 8 : i === stations.length - 1 ? x + 8 : x;
            return (
              <g key={st.key}>
                <circle cx={x} cy={lineY} r={on ? 10 : 8} style={{ fill: st.key === "bed" ? "var(--ph-accent-strong)" : "var(--ph-surface)", stroke: "var(--ph-ink)" }} strokeWidth={2} />
                <T x={tx} y={up ? lineY - 36 - far : lineY + 46 + far} text={st.name} anchor={anchor} size={10} bold={on} style={on ? INK : MUTED} />
                <T x={tx} y={up ? lineY - 20 - far : lineY + 62 + far} text={clock(st.at)} anchor={anchor} size={11} bold style={INK} />
              </g>
            );
          })}
          {/* To scale: wind-down, falling asleep, then each 90-minute cycle */}
          <rect x={xsc(0)} y={stripY} width={xsc(360) - xsc(0)} height={24} rx={4} style={{ fill: "var(--ph-ink-muted)" }} opacity={0.3} />
          <T x={(xsc(0) + xsc(360)) / 2} y={stripY + 16} text="6 h" size={11} bold style={INK} />
          <rect x={xsc(360)} y={stripY} width={Math.max(1, xsc(360 + snap.latency) - xsc(360))} height={24} fill={STAGE_COLORS.wake} />
          {Array.from({ length: N }, (_, k) => {
            const a = xsc(360 + snap.latency + k * CYCLE_MIN);
            const b2 = xsc(360 + snap.latency + (k + 1) * CYCLE_MIN);
            return <rect key={k} x={a + 0.75} y={stripY} width={Math.max(0, b2 - a - 1.5)} height={24} rx={3} fill={OPTION_COLORS[N]} opacity={0.6 + 0.4 * ((k + 1) / N)} />;
          })}
          <T x={(xsc(360 + snap.latency) + xsc(span)) / 2} y={stripY + 16} text={`${N} × 90 min = ${hrs(N * CYCLE_MIN)}`} size={11} bold style={{ fill: "#fff" }} />
          <T x={xsc(0)} y={stripY + 42} text={clock(stations[0].at)} anchor="start" size={10.5} bold style={INK} />
          <T x={xsc(360)} y={stripY + 42} text={clock(bed)} size={10.5} bold style={INK} />
          <T x={xsc(span)} y={stripY + 42} text={clock(wake)} anchor="end" size={10.5} bold style={INK} />
          <SvgTrack W={W} y={trackY} frac={(N - 3) / 3} stops={[3, 4, 5, 6].map((m, i) => ({ frac: i / 3, text: `${m}×`, on: m === N }))} />
        </Drawing>
      }
    />
  );
}

// ── 7. Sensitivity trio: shorter / standard / longer cycles ───────────────────────────────────
export function SleepCycleTrioCard({ side }: { side: Side }) {
  const { t } = useCardText("trio");
  const { snap } = useSleepLive();
  const best = snap.nights[0];
  const s = useStepper(15, { min: 5, max: 30, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => 5 + ((x - X0) / (W - 2 * X0)) * 25);
  const { W, H } = d;
  const dx = s.value;
  const cols = [
    { key: "short", len: CYCLE_MIN - dx },
    { key: "std", len: CYCLE_MIN },
    { key: "long", len: CYCLE_MIN + dx },
  ].map((c) => ({ ...c, sleep: best.cycles * c.len, at: optionClock(snap.mode, snap.anchor, snap.latency, best.cycles, c.len) }));
  const top = 44;
  const base = H - 108;
  const vmax = best.cycles * (CYCLE_MIN + 30);
  const yv = (m: number) => base - (m / vmax) * (base - top);
  const cw = (W - 2 * X0) / 3;
  const trackY = H - 52;
  const valueText = `± ${dx} min`;
  const shift = best.cycles * dx;
  const what = snap.mode === "wakeUp" ? t("bedtime") : t("wake");
  const rows: KitRow[] = [
    ...cols.map((c) => ({ key: c.key, label: `${best.cycles} × ${c.len} min`, value: `${clock(c.at)} · ${hrs(c.sleep)}`, isKey: c.key === "std" })),
    { key: "shift", label: t("rowShift", { what }), value: `± ${dur(shift)}` },
    { key: "range", label: t("rowRange"), value: "70–120 min" },
  ];
  return (
    <Card
      n={7}
      side={side}
      k="trio"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { dx: ltr(`${dx} min`), shift: ltr(dur(shift)), what })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((dx - 5) / 25) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c7">
          <T x={X0} y={18} text={`${what} · ${best.cycles}×`} anchor="start" size={11} bold />
          {cols.map((c, ci) => {
            const x = X0 + cw * ci + cw * 0.2;
            const w = cw * 0.6;
            const on = c.key === "std";
            const h = base - yv(c.sleep);
            return (
              <g key={c.key} opacity={on ? 1 : 0.85}>
                {Array.from({ length: best.cycles }, (_, k) => {
                  const y1 = yv((k + 1) * c.len);
                  const y0 = yv(k * c.len);
                  return <rect key={k} x={x} y={y1} width={w} height={Math.max(0, y0 - y1 - 1.5)} style={{ fill: OPTION_COLORS[best.cycles], opacity: 0.55 + 0.45 * ((k + 1) / best.cycles), ...lit(hover === c.key) }} />;
                })}
                {h > 18 && <T x={x + w / 2} y={base - h / 2 + 4} text={hrs(c.sleep)} size={11} bold style={{ fill: "#fff" }} />}
                <T x={x + w / 2} y={yv(c.sleep) - 8} text={clock(c.at)} size={on ? 12.5 : 11} bold style={INK} />
                <T x={x + w / 2} y={base + 18} text={`${c.len} min`} size={11} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(dx - 5) / 25} lo="± 5 min" hi="± 30 min" />
        </Drawing>
      }
    />
  );
}

// ── 8. Formula diagram: time − fall asleep − cycles × 90 (writes the minutes to fall asleep) ─
export function SleepFormulaCard({ side }: { side: Side }) {
  const { t } = useCardText("formula");
  const { snap, setLatency } = useSleepLive();
  const s = useSharedStepper(clamp(snap.latency, 0, L_MAX), setLatency, { min: 0, max: L_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * L_MAX);
  const { W, H } = d;
  const L = s.value;
  const wakeUp = snap.mode === "wakeUp";
  const op = wakeUp ? "−" : "+";
  const gap = 8;
  const bw = (W - 2 * X0 + 20 - 3 * gap) / 4;
  const bx = (i: number) => X0 - 10 + i * (bw + gap);
  const bh = 40;
  const trackY = H - 52;
  const lane = (i: number) => 30 + i * Math.max(52, (trackY - 46 - 30 - bh) / 3);
  const valueText = `${L} min`;
  const header = `${t("time")} ${op} ${t("fallAsleep")} ${op} ${t("cycles")} = ${t(wakeUp ? "bedtime" : "wake")}`;
  const rows: KitRow[] = [
    { key: "lat", label: t("rowLatency"), value: `${L} min`, isKey: true },
    ...snap.nights.map((o) => ({ key: `o${o.cycles}`, label: `${clock(snap.anchor)} ${op} ${L} ${op} ${o.cycles} × 90`, value: clock(o.clockMinutes) })),
  ];
  const box = (i: number, y: number, text: string, fill: string, ink: { fill: string }, on: boolean) => (
    <g>
      <rect x={bx(i)} y={y} width={bw} height={bh} rx={8} style={{ fill, ...lit(on) }} />
      <T x={bx(i) + bw / 2} y={y + bh / 2 + 4.5} text={text} size={bw < 78 ? 10 : 12} bold style={ink} />
    </g>
  );
  return (
    <Card
      n={8}
      side={side}
      k="formula"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t(wakeUp ? "captionWake" : "captionBed", { lat: ltr(`${L} min`), best: ltr(clock(snap.nights[0].clockMinutes)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (L / L_MAX) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sleep-c8">
          <T x={X0 - 10} y={16} text={header} anchor="start" size={Math.min(10.5, (W - 40) / (header.length * 0.56))} bold />
          {snap.nights.map((o, i) => {
            const y = lane(i);
            const on = hover === `o${o.cycles}`;
            return (
              <g key={o.cycles}>
                {box(0, y, clock(snap.anchor), "var(--ph-surface)", INK, on)}
                {box(1, y, `${op} ${L} min`, STAGE_COLORS.wake, { fill: "#fff" }, on || hover === "lat")}
                {box(2, y, `${op} ${o.cycles} × 90`, OPTION_COLORS[o.cycles], { fill: "#fff" }, on)}
                {box(3, y, `= ${clock(o.clockMinutes)}`, "var(--ph-accent-soft)", INK, on)}
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={L / L_MAX} lo="0 min" hi={`${L_MAX} min`} />
        </Drawing>
      }
    />
  );
}
