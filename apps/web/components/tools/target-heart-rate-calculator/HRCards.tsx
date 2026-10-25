"use client";
import { useId, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f2 } from "@/components/tool-ui/indicator-kit/format";
import { Card } from "../macro-calculator/MacroCards";
import { useHRLive } from "./HRLiveContext";
import { ACSM, BELOW_COLOR, MAX_FORMULAS, REST_DEFAULT, ZONES, ahaOf, fox, maxBy, pctAt, r0, tanaka, targetAt, zoneColor, zoneIndex } from "./hr";
import { labelW } from "@/components/tool-ui/labelLayout";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The eight target-heart-rate indicator cards (§31 library). All read the calculator's live
 * result (age, max HR, resting HR) through HRLiveContext; the zone strip writes the training
 * intensity back, so dragging it moves the Result table and the beat of the 3D heart. The other
 * cards keep a what-if value of their own on top of the live result.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
const n0 = (v: number) => String(r0(v));
const bpmT = (v: number) => `${r0(v)} bpm`;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.target-heart-rate-calculator.visuals.${key}`),
    tz: useTranslations("tools.target-heart-rate-calculator.zones"),
    tv: useTranslations("tools.target-heart-rate-calculator.visuals.common"),
    tc: useTranslations("toolPage.indicatorKit"),
  };
}

/** Max HR, resting HR (given or the typical 60 bpm) and the method of the live result. */
function useBase() {
  const { snap, intensity } = useHRLive();
  const max = snap.data.maxHeartRate;
  const rest = snap.rest;
  const rest0 = rest ?? REST_DEFAULT;
  return { age: snap.age, max, rest, rest0, intensity };
}

/** A what-if track drawn along the bottom of a card's SVG: line, filled part, end ticks. */
function SvgTrack({ W, y, frac, lo, hi }: { W: number; y: number; frac: number; lo: string; hi: string }) {
  const x = X0 + clamp(frac, 0, 1) * (W - 2 * X0);
  return (
    <g>
      <line x1={X0} y1={y} x2={W - X0} y2={y} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <line x1={X0} y1={y} x2={x} y2={y} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
      <T x={X0} y={y + 22} text={lo} anchor="start" size={12} />
      <T x={W - X0} y={y + 22} text={hi} anchor="end" size={12} />
    </g>
  );
}

/** The live intensity as a stepper: −/+ and the drag write the calculator's own intensity. */
function useSharedIntensity(): Stepper {
  const { intensity, setIntensity } = useHRLive();
  const [seed] = useState(intensity);
  const min = 50;
  const max = 100;
  const step = 1;
  const set = (v: number) => setIntensity(clamp(Math.round(v), min, max));
  return {
    value: intensity,
    set,
    inc: () => set(intensity + step),
    dec: () => set(intensity - step),
    reset: () => setIntensity(seed),
    flash: intensity,
    atMin: intensity <= min,
    atMax: intensity >= max,
    isSeed: intensity === seed,
    min,
    max,
    step,
  };
}

/** One ECG complex (P, QRS, T) as relative points, 36 px wide. */
const ECG: [number, number][] = [[0, 0], [4, -3], [8, 0], [11, 0], [13, 4], [16, -26], [19, 8], [22, 0], [27, 0], [31, -6], [35, 0]];
const HEART_PATH = "M 0 -4 C -2 -9 -10 -9 -10 -2 C -10 4 -3 8 0 11 C 3 8 10 4 10 -2 C 10 -9 2 -9 0 -4 Z";
const KEYFRAMES =
  "@keyframes thr-ecg{from{transform:translateX(0)}to{transform:translateX(calc(-1 * var(--thr-bw)))}}" +
  "@keyframes thr-beat{0%{transform:scale(1)}8%{transform:scale(1.25)}18%{transform:scale(1)}28%{transform:scale(1.12)}40%,100%{transform:scale(1)}}" +
  "@media (prefers-reduced-motion: reduce){.thr-anim{animation:none!important}}";

// ── 1. Zone strip: drag the training intensity across the five zones (writes the calculator) ──
export function HRZoneStripCard({ side }: { side: Side }) {
  const { t, tz, tv } = useCardText("strip");
  const { max, rest } = useBase();
  const s = useSharedIntensity();
  const [hover, setHover] = useState<string | null>(null);
  const clip = "thr" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const HMIN = 300;
  const d = useDrawing(HMIN, s, (x, _y, W) => 50 + ((x - X0) / (W - 2 * X0)) * 50);
  const { W, H } = d;
  const xp = (pct: number) => X0 + ((clamp(pct, 50, 100) - 50) / 50) * (W - 2 * X0);
  const pct = s.value;
  const bpm = targetAt(pct, max, rest);
  const zi = zoneIndex(pct);
  const zone = ZONES[Math.max(0, zi)];
  const period = 60 / bpm;
  const sy = 96;
  const SH = 36;
  const next = ZONES[zi + 1];
  const prev = zi > 0 ? ZONES[zi] : null;
  // ECG band: paper speed 130 px/s, so the gap between beats is the real beat interval.
  const ecgY = H - 46;
  const bw = Math.max(36, 130 * period);
  const ex0 = X0 + 40;
  const beats = Math.ceil((W - X0 - ex0) / bw) + 2;
  const ecg = Array.from({ length: beats }, (_, i) => ECG.map(([dx, dy]) => `${px2(ex0 + i * bw + dx)},${px2(ecgY + dy)}`).join(" ")).join(" ");
  const valueText = `${pct}% · ${bpmT(bpm)}`;
  const rows: KitRow[] = [
    { key: "pct", label: t("rowIntensity"), value: `${pct}%` },
    { key: "bpm", label: rest === null ? `${max} × ${f2(pct / 100)}` : `(${max} − ${rest}) × ${f2(pct / 100)} + ${rest}`, value: bpmT(bpm), isKey: true },
    { key: "zone", label: t("rowZone"), value: `${tz(zone.key)} (${zone.lo}–${zone.hi}%)` },
    { key: "beat", label: `60 ÷ ${n0(bpm)}`, value: `${f2(period)} s` },
    { key: "next", label: t("rowNext"), value: next ? `+${n0(targetAt(next.lo, max, rest) - bpm)} bpm` : "—" },
    { key: "prev", label: t("rowPrev"), value: prev ? `−${n0(bpm - targetAt(prev.lo, max, rest))} bpm` : "—" },
  ];
  return (
    <Card phoneRole="visual" tool="target-heart-rate-calculator" idPrefix="thr"
      n={1}
      side={side}
      k="strip"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { pct: ltr(`${pct}%`), bpm: ltr(bpmT(bpm)), zone: tz(zone.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xp(pct), y: sy, dir: "horizontal" }} s={s} testId="thr-c1">
          <style>{KEYFRAMES}</style>
          {/* bpm axis on top: the same strip read in this person's beats per minute */}
          <T x={X0} y={22} text="bpm" anchor="start" size={12} bold />
          {[50, 60, 70, 80, 90, 100].map((p) => (
            <g key={p}>
              <line x1={xp(p)} y1={sy - SH / 2 - 14} x2={xp(p)} y2={sy - SH / 2 - 4} style={LINE} />
              <T x={xp(p)} y={sy - SH / 2 - 20} text={n0(targetAt(p, max, rest))} size={12} bold={hover === "bpm"} />
            </g>
          ))}
          {ZONES.map((z, i) => {
            const a = xp(z.lo);
            const b = xp(z.hi);
            const on = i === zi;
            const name = tz(z.key);
            return (
              <g key={z.key}>
                <rect x={a} y={sy - SH / 2} width={Math.max(0, b - a)} height={SH} style={{ fill: z.color, opacity: on ? 1 : 0.5, ...lit(on && hover === "zone") }} />
                {b - a > name.length * 6.6 + 8 && (
                  <text style={{ fontSize: svgPx(12) }} x={(a + b) / 2} y={sy + 4} fontWeight={800} textAnchor="middle" fill="#fff">
                    {name}
                  </text>
                )}
              </g>
            );
          })}
          <rect x={X0} y={sy - SH / 2} width={W - 2 * X0} height={SH} fill="none" style={LINE} rx={3} />
          {[50, 60, 70, 80, 90, 100].map((p) => (
            <T key={p} x={xp(p)} y={sy + SH / 2 + 16} text={`${p}%`} size={12} />
          ))}
          <line x1={xp(pct)} y1={sy - SH / 2 - 6} x2={xp(pct)} y2={sy + SH / 2 + 6} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <T x={clamp(xp(pct), X0 + 70, W - X0 - 70)} y={sy + SH / 2 + 42} text={`${pct}% → ${bpmT(bpm)}`} size={14} bold style={INK} />

          {/* Live ECG at the target rate, and a heart beating at it */}
          <clipPath id={clip}>
            <rect x={ex0} y={ecgY - 34} width={W - X0 - ex0} height={50} />
          </clipPath>
          <line x1={ex0} y1={ecgY} x2={W - X0} y2={ecgY} style={LINE} opacity={0.35} />
          <g clipPath={`url(#${clip})`}>
            <g className="thr-anim" style={{ "--thr-bw": `${px2(bw)}px`, animation: `thr-ecg ${f2(period)}s linear infinite` } as CSSProperties}>
              <polyline points={ecg} fill="none" stroke={zoneColor(pct)} strokeWidth={2.2} strokeLinejoin="round" />
            </g>
          </g>
          <g transform={`translate(${X0 + 14} ${ecgY - 8})`}>
            <path d={HEART_PATH} fill={zoneColor(pct)} className="thr-anim" style={{ transformBox: "fill-box", transformOrigin: "center", animation: `thr-beat ${f2(period)}s ease-out infinite` }} />
          </g>
          <T x={W - X0} y={H - 8} text={`${f2(period)} s / ${tv("beatShort")}`} anchor="end" size={12} bold={hover === "beat"} />
        </Drawing>
      }
    />
  );
}

// ── 2. Gradient gauge: where a heart-rate reading sits, as % of max HR ─────────────────────
const G0 = 40;
const G1 = 100;
export function HRReadingGaugeCard({ side }: { side: Side }) {
  const { max } = useBase();
  // A new max HR re-seeds this card's what-if reading.
  return <ReadingGauge key={max} side={side} />;
}
function ReadingGauge({ side }: { side: Side }) {
  const { t, tz, tv } = useCardText("gauge");
  const { max, rest, rest0 } = useBase();
  const lo = Math.ceil((max * G0) / 100);
  const s = useStepper(Math.round(max * 0.7), { min: lo, max, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const geo = (W: number, H: number) => {
    const R = Math.max(70, Math.min(W / 2 - 50, H - 80));
    return { cx: W / 2, cy: H - 50, R };
  };
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const { cx, cy } = geo(W, H);
    const a = Math.atan2(Math.max(0, cy - y), x - cx);
    return ((G0 + (1 - a / Math.PI) * (G1 - G0)) / 100) * max;
  });
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const ang = (p: number) => Math.PI * (1 - (clamp(p, G0, G1) - G0) / (G1 - G0));
  const pt = (p: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(p))), px2(cy - r * Math.sin(ang(p)))];
  const arc = (p0: number, p1: number, r: number) => {
    const [x0, y0] = pt(p0, r);
    const [x1, y1] = pt(p1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const bpm = s.value;
  const pMax = (bpm / max) * 100;
  const pMethod = pctAt(bpm, max, rest);
  const pHrr = ((bpm - rest0) / Math.max(1, max - rest0)) * 100;
  const zi = zoneIndex(pMethod);
  const zoneName = zi < 0 ? tv("belowZones") : tz(ZONES[zi].key);
  // Zone edges in % of max HR (they move when the Karvonen method is on).
  const edge = (z: number) => (targetAt(z, max, rest) / max) * 100;
  const bands = [{ key: "below", a: G0, b: edge(50), color: BELOW_COLOR }, ...ZONES.map((z) => ({ key: z.key, a: edge(z.lo), b: edge(z.hi), color: z.color }))];
  const [nx, ny] = pt(pMax, R - 18);
  const valueText = bpmT(bpm);
  const rows: KitRow[] = [
    { key: "bpm", label: t("rowReading"), value: valueText },
    { key: "pmax", label: `${bpm} ÷ ${max}`, value: `${Math.round(pMax)}% HRmax`, isKey: true },
    { key: "phrr", label: `(${bpm} − ${rest0}) ÷ (${max} − ${rest0})`, value: `${Math.round(pHrr)}% HRR` },
    { key: "zone", label: t("rowZone"), value: zoneName },
    { key: "aha", label: t("rowAha"), value: tv(ahaOf(pMax)) },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={2}
      side={side}
      k="gauge"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { bpm: ltr(valueText), pct: ltr(`${Math.round(pMax)}%`), zone: zoneName })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: nx, y: ny, dir: "circular" }} s={s} testId="thr-c2">
          {bands.map((b, i) => {
            if (b.b <= b.a) return null;
            const on = i - 1 === zi;
            return <path key={b.key} d={arc(b.a, Math.min(b.b, G1), R)} fill="none" stroke={b.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.55} />;
          })}
          {/* AHA moderate (50–70 %) and vigorous (70–85 %) bands, inner ring */}
          <path d={arc(50, 70, R - 34)} fill="none" style={{ stroke: "var(--ph-neutral)" }} strokeWidth={5} opacity={hover === "aha" ? 1 : 0.55} />
          <path d={arc(70, 85, R - 34)} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={5} opacity={hover === "aha" ? 1 : 0.55} />
          {[40, 50, 60, 70, 80, 90, 100].map((p) => {
            const [x, y] = pt(p, R + 24);
            return <T key={p} x={x} y={y + 4} text={`${p}%`} size={12} bold={p === 70} style={p === 70 ? INK : MUTED} />;
          })}
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "pmax" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`${valueText} · ${Math.round(pMax)}% HRmax`} size={15} bold style={INK} />
          <T x={cx} y={cy + 42} text={`HRmax ${max} · ${Math.round(pHrr)}% HRR`} size={12} />
        </Drawing>
      }
    />
  );
}

// ── 3. Ranked bars: max HR by five published formulas, at your age ──────────────────────
export function HRFormulaBarsCard({ side }: { side: Side }) {
  const { t } = useCardText("formulas");
  const { age, rest, intensity } = useBase();
  const s = useStepper(1, { min: 0, max: MAX_FORMULAS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const bars = MAX_FORMULAS.map((f, fi) => ({ ...f, fi, v: maxBy(f.key, age) })).sort((a, b) => b.v - a.v);
  const top = 18;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => bars[clamp(Math.floor(((y - top) / (H - top - 30)) * bars.length), 0, bars.length - 1)].fi);
  const { W, H } = d;
  // the name column as wide as the longest formula name at 12px, so "Gulati 2010 (women)" never runs
  // off the left edge (§39); at most half the drawing
  const LW = Math.min(W / 2, Math.max(112, Math.ceil(Math.max(...bars.map((b) => labelW(t(`names.${b.key}`))))) + 12));
  const rowH = (H - top - 30) / bars.length;
  const vmax = Math.max(...bars.map((b) => b.v)) * 1.12;
  const xv = (v: number) => LW + (v / vmax) * (W - LW - X0);
  const f = MAX_FORMULAS[s.value];
  const fv = maxBy(f.key, age);
  const sel = bars.findIndex((b) => b.fi === s.value);
  const valueText = t(`names.${f.key}`);
  const rows: KitRow[] = [
    { key: "f", label: t("rowFormula"), value: f.text },
    { key: "v", label: f.text.replace("age", String(age)), value: bpmT(fv), isKey: true },
    { key: "target", label: t("rowTarget", { pct: intensity }), value: bpmT(targetAt(intensity, fv, rest)) },
    { key: "fox", label: t("rowVsFox"), value: `${fv - fox(age) >= 0 ? "+" : "−"}${f2(Math.abs(fv - fox(age)))} bpm` },
    { key: "spread", label: t("rowSpread"), value: `${f2(bars[0].v - bars[bars.length - 1].v)} bpm` },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={3}
      side={side}
      k="formulas"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { name: valueText, v: ltr(bpmT(fv)), age: ltr(String(age)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xv(fv) + 14, y: top + rowH * (sel + 0.5), dir: "vertical" }} s={s} testId="thr-c3">
          <line x1={LW} y1={top - 6} x2={LW} y2={H - 26} style={LINE} strokeWidth={1.5} />
          {bars.map((b, bi) => {
            const y = top + rowH * bi + rowH * 0.2;
            const bh = rowH * 0.6;
            const on = bi === sel;
            return (
              <g key={b.key}>
                <T x={LW - 8} y={y + bh / 2 + 4} text={t(`names.${b.key}`)} anchor="end" size={12} bold={on} style={on ? INK : MUTED} />
                <rect x={LW} y={y} width={Math.max(0, xv(b.v) - LW)} height={bh} rx={4} style={{ fill: on ? "#ef4444" : "#f97316", opacity: on ? 1 : 0.5, ...lit(on && hover === "v") }} />
                <T x={xv(b.v) - 6} y={y + bh / 2 + 4} text={f2(b.v)} anchor="end" size={12} bold style={{ fill: "#fff" }} />
              </g>
            );
          })}
          <T x={W - X0} y={H - 8} text={`${t("ageLabel")} ${age} · bpm`} anchor="end" size={12} bold />
        </Drawing>
      }
    />
  );
}

// ── 4. Trend line: max HR against age, Fox and Tanaka, reference point = you ─────────────
const A0 = 15;
const A1 = 85;
export function HRAgeCurveCard({ side }: { side: Side }) {
  const { age } = useBase();
  return <AgeCurve key={age} side={side} />;
}
function AgeCurve({ side }: { side: Side }) {
  const { t } = useCardText("ageCurve");
  const { age, max } = useBase();
  const s = useStepper(clamp(Math.round(age), A0, A1), { min: A0, max: A1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const PL = 44;
  const d = useDrawing(HMIN, s, (x, _y, W) => A0 + ((x - PL) / (W - PL - 18)) * (A1 - A0));
  const { W, H } = d;
  const yMin = 130;
  const yMax = 210;
  const top = 18;
  const base = H - 36;
  const xa = (a: number) => PL + ((a - A0) / (A1 - A0)) * (W - PL - 18);
  const yb = (b: number) => base - ((clamp(b, yMin, yMax) - yMin) / (yMax - yMin)) * (base - top);
  const line = (f: (a: number) => number) => `${px2(xa(A0))},${px2(yb(f(A0)))} ${px2(xa(A1))},${px2(yb(f(A1)))}`;
  const a = s.value;
  const fa = fox(a);
  const ta = tanaka(a);
  const valueText = t("ageValue", { a });
  const rows: KitRow[] = [
    { key: "a", label: t("rowAge"), value: String(a) },
    { key: "fox", label: `Fox: 220 − ${a}`, value: bpmT(fa), isKey: true },
    { key: "tan", label: `Tanaka: 208 − 0.7 × ${a}`, value: `${f2(ta)} bpm` },
    { key: "diff", label: t("rowDiff"), value: `${ta - fa >= 0 ? "+" : "−"}${f2(Math.abs(ta - fa))} bpm` },
    { key: "cross", label: t("rowCross"), value: "40" },
    { key: "you", label: t("rowYou", { a: age }), value: bpmT(max) },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={4}
      side={side}
      k="ageCurve"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { a: ltr(String(a)), fox: ltr(bpmT(fa)), tan: ltr(`${f2(ta)} bpm`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xa(a), y: yb(fa), dir: "horizontal" }} s={s} testId="thr-c4">
          {[130, 150, 170, 190, 210].map((v) => (
            <g key={v}>
              <line x1={PL} y1={yb(v)} x2={W - 18} y2={yb(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yb(v) + 4} text={String(v)} anchor="end" size={12} />
            </g>
          ))}
          {[20, 30, 40, 50, 60, 70, 80].map((v) => (
            <T key={v} x={xa(v)} y={base + 16} text={String(v)} size={12} />
          ))}
          <T x={W - 18} y={base + 32} text={t("ageLabel")} anchor="end" size={12} bold />
          {/* beside the axis, not above its tick numbers: over the "210" tick it touched it (§39) */}
          <T x={PL + 4} y={top - 6} text="HRmax" anchor="start" size={12} bold />
          <polyline points={line(tanaka)} fill="none" style={{ stroke: "var(--ph-neutral)" }} strokeWidth={hover === "tan" ? 4 : 2.5} strokeDasharray="6 5" />
          <polyline points={line(fox)} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={hover === "fox" ? 4.5 : 3} />
          <T x={xa(A1) - 4} y={yb(fox(A1)) + 16} text="Fox" anchor="end" size={12} bold style={INK} />
          <T x={xa(A1) - 4} y={yb(tanaka(A1)) - 8} text="Tanaka" anchor="end" size={12} bold />
          <circle cx={xa(40)} cy={yb(180)} r={hover === "cross" ? 6 : 4} style={{ fill: "var(--ph-neutral)" }} />
          <line x1={xa(a)} y1={yb(fa)} x2={xa(a)} y2={yb(ta)} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "diff" ? 3 : 1.5} />
          <circle cx={xa(clamp(age, A0, A1))} cy={yb(max)} r={hover === "you" ? 8 : 6} fill="#ef4444" />
          <T x={xa(clamp(age, A0, A1))} y={yb(max) - 12} text={String(max)} size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 5. Sensitivity trio: what a ± resting-HR change does to the Karvonen target ──────────
export function HRRestSensitivityCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("sensitivity");
  const { max, rest, rest0, intensity } = useBase();
  const s = useStepper(5, { min: 1, max: 20, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 19);
  const { W, H } = d;
  const e = s.value;
  const p = intensity / 100;
  const trio = [
    { key: "lo", r: rest0 - e },
    { key: "now", r: rest0 },
    { key: "hi", r: rest0 + e },
  ].map((c) => ({ ...c, v: targetAt(intensity, max, c.r) }));
  const trackY = H - 34;
  const base = trackY - 46;
  const top = Math.max(...trio.map((c) => c.v)) * 1.12;
  const yb = (v: number) => base - (v / top) * (base - 30);
  const colW = (W - 2 * X0) / 3;
  const valueText = `± ${e} bpm`;
  const rows: KitRow[] = [
    { key: "now", label: rest === null ? tv("restAssumed") : tv("restGiven"), value: bpmT(rest0) },
    ...trio.map((c) => ({ key: c.key, label: `(${max} − ${c.r}) × ${f2(p)} + ${c.r}`, value: bpmT(c.v) })),
    { key: "per", label: t("rowPer", { p: f2(p) }), value: `${f2(1 - p)} bpm` },
    { key: "spread", label: t("rowSpread"), value: `${f2(trio[2].v - trio[0].v)} bpm`, isKey: true },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={5}
      side={side}
      k="sensitivity"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { e: ltr(valueText), pct: ltr(`${intensity}%`), d: ltr(`${f2(trio[2].v - trio[0].v)} bpm`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 1) / 19) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="thr-c5">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {trio.map((c, ci) => {
            const x = X0 + colW * ci + colW * 0.22;
            const bw = colW * 0.56;
            const on = hover === c.key || (ci === 1 && hover === null);
            return (
              <g key={c.key}>
                <rect x={x} y={yb(c.v)} width={bw} height={base - yb(c.v)} rx={5} style={{ fill: zoneColor(intensity), opacity: ci === 1 ? 1 : 0.65, ...lit(on) }} />
                <T x={x + bw / 2} y={yb(c.v) - 8} text={bpmT(c.v)} size={12} bold style={INK} />
                <T x={x + bw / 2} y={base + 16} text={`${t("restShort")} ${c.r}`} size={12} bold={ci === 1} style={ci === 1 ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(e - 1) / 19} lo="± 1 bpm" hi="± 20 bpm" />
        </Drawing>
      }
    />
  );
}

// ── 6. Formula diagram: the Karvonen target built stage by stage ─────────────────────────
export function HRKarvonenFormulaCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("karvonen");
  const { age, max, rest, rest0, intensity } = useBase();
  const s = useStepper(4, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const st = s.value;
  const p = intensity / 100;
  const hrr = max - rest0;
  const work = hrr * p;
  const tgt = work + rest0;
  const stages = [
    { key: "max", top: `220 − ${age}`, bottom: `HRmax ${max}` },
    { key: "hrr", top: `${max} − ${rest0}`, bottom: `HRR ${hrr}` },
    { key: "work", top: `${hrr} × ${f2(p)}`, bottom: f2(work) },
    { key: "tgt", top: `${f2(work)} + ${rest0}`, bottom: bpmT(tgt) },
  ];
  const trackY = H - 34;
  const boxW = Math.min(150, (W - 2 * X0 - 3 * 18) / 4);
  const gap = (W - 2 * X0 - 4 * boxW) / 3;
  const by = 62;
  const bh = trackY - 50 - by;
  const valueText = t(`stage${st}`);
  const rows: KitRow[] = [
    { key: "in", label: rest === null ? tv("restAssumed") : tv("restGiven"), value: `${bpmT(rest0)} · ${intensity}%` },
    { key: "max", label: `HRmax = 220 − ${age}`, value: bpmT(max), isKey: st === 1 },
    { key: "hrr", label: `HRR = ${max} − ${rest0}`, value: bpmT(hrr), isKey: st === 2 },
    { key: "work", label: `${hrr} × ${f2(p)}`, value: `${f2(work)} bpm`, isKey: st === 3 },
    { key: "tgt", label: `${f2(work)} + ${rest0}`, value: bpmT(tgt), isKey: st === 4 },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={6}
      side={side}
      k="karvonen"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { stage: valueText })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((st - 1) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="thr-c6">
          <T x={W / 2} y={30} text={`(${max} − ${rest0}) × ${f2(p)} + ${rest0} = ${r0(tgt)}`} size={14} bold style={INK} />
          {stages.map((g, gi) => {
            const x = X0 + gi * (boxW + gap);
            const shown = gi < st;
            const on = gi === st - 1 || hover === g.key;
            return (
              <g key={g.key} opacity={shown ? 1 : 0.28}>
                <rect x={x} y={by} width={boxW} height={bh} rx={10} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + boxW / 2} y={by + 22} text={String(gi + 1)} size={12} bold />
                <T x={x + boxW / 2} y={by + bh / 2} text={g.top} size={12} />
                <T x={x + boxW / 2} y={by + bh / 2 + 22} text={g.bottom} size={12.5} bold style={INK} />
                {gi < 3 && <path d={`M ${x + boxW + 3} ${by + bh / 2} l ${gap - 8} 0 m -6 -5 l 6 5 l -6 5`} fill="none" style={LINE} strokeWidth={2} opacity={gi + 1 < st ? 1 : 0.35} />}
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(st - 1) / 3} lo="1" hi="4" />
        </Drawing>
      }
    />
  );
}

// ── 7. Balance: % of max HR against Karvonen at the same intensity ───────────────────────
export function HRMethodBalanceCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("balance");
  const { max, rest, rest0 } = useBase();
  const s = useStepper(70, { min: 50, max: 95, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const d = useDrawing(HMIN, s, (x, _y, W) => 50 + ((x - X0) / (W - 2 * X0)) * 45);
  const { W, H } = d;
  const pct = s.value;
  const simple = targetAt(pct, max, null);
  const karv = targetAt(pct, max, rest0);
  const diff = karv - simple;
  const tilt = clamp(diff / 30, -1, 1) * 16;
  const rad = (tilt * Math.PI) / 180;
  const trackY = H - 34;
  const cx = W / 2;
  const pivotY = 64;
  const arm = Math.min(W / 2 - 70, 190);
  const lx = px2(cx - arm * Math.cos(rad));
  const ly = px2(pivotY + arm * Math.sin(rad));
  const rx = px2(cx + arm * Math.cos(rad));
  const ry = px2(pivotY - arm * Math.sin(rad));
  const pan = (x: number, y: number, v: number, label: string, color: string, on: boolean) => (
    <g>
      <line x1={x} y1={y} x2={x - 34} y2={y + 46} style={LINE} />
      <line x1={x} y1={y} x2={x + 34} y2={y + 46} style={LINE} />
      <path d={`M ${x - 46} ${y + 46} Q ${x} ${y + 72} ${x + 46} ${y + 46} Z`} style={{ fill: color, ...lit(on) }} opacity={0.9} />
      <T x={x} y={y + 92} text={bpmT(v)} size={13} bold style={INK} />
      <T x={x} y={y + 108} text={label} size={12} />
    </g>
  );
  const valueText = `${pct}%`;
  const rows: KitRow[] = [
    { key: "pct", label: t("rowIntensity"), value: valueText },
    { key: "simple", label: `${max} × ${f2(pct / 100)}`, value: bpmT(simple) },
    { key: "karv", label: `(${max} − ${rest0}) × ${f2(pct / 100)} + ${rest0}`, value: bpmT(karv) },
    { key: "diff", label: t("rowDiff"), value: `${diff >= 0 ? "+" : "−"}${f2(Math.abs(diff))} bpm`, isKey: true },
    { key: "rest", label: rest === null ? tv("restAssumed") : tv("restGiven"), value: bpmT(rest0) },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={7}
      side={side}
      k="balance"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { pct: ltr(valueText), d: ltr(`${f2(Math.abs(diff))} bpm`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((pct - 50) / 45) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="thr-c7">
          <path d={`M ${cx} ${pivotY} L ${cx - 22} ${trackY - 46} L ${cx + 22} ${trackY - 46} Z`} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
          <circle cx={cx} cy={pivotY} r={6} style={{ fill: "var(--ph-ink)" }} />
          {pan(lx, ly, simple, t("simple"), "#0ea5e9", hover === "simple")}
          {pan(rx, ry, karv, "Karvonen", "#ef4444", hover === "karv")}
          <T x={cx} y={22} text={`${diff >= 0 ? "+" : "−"}${f2(Math.abs(diff))} bpm`} size={15} bold style={INK} />
          <SvgTrack W={W} y={trackY} frac={(pct - 50) / 45} lo="50%" hi="95%" />
        </Drawing>
      }
    />
  );
}

// ── 8. Stepped diagram: the ACSM intensity classes in your own beats per minute ──────────
export function HRAcsmStepsCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("acsm");
  const { max, rest, rest0 } = useBase();
  const s = useStepper(2, { min: 0, max: ACSM.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const n = ACSM.length;
  const d = useDrawing(HMIN, s, (x, _y, W) => clamp(Math.floor(((x - X0) / (W - 2 * X0)) * n), 0, n - 1));
  const { W, H } = d;
  const slot = (W - 2 * X0) / n;
  // a range wider than its step (a phone) is set on two lines, "146–" over "182", so neighbours never touch (§39)
  const wrap = labelW("000–000") > slot - 4;
  const base = H - (wrap ? 53 : 40);
  const top = 34;
  const yp = (p: number) => base - (p / 100) * (base - top);
  const c = ACSM[s.value];
  const bLo = (max * c.max[0]) / 100;
  const bHi = (max * c.max[1]) / 100;
  const kLo = targetAt(c.hrr[0], max, rest0);
  const kHi = targetAt(c.hrr[1], max, rest0);
  const valueText = t(`cls.${c.key}`);
  const rows: KitRow[] = [
    { key: "cls", label: t("rowClass"), value: valueText },
    { key: "pmax", label: `${max} × ${c.max[0]}–${c.max[1]}%`, value: `${r0(bLo)}–${r0(bHi)} bpm`, isKey: rest === null },
    { key: "phrr", label: `(${max} − ${rest0}) × ${c.hrr[0]}–${c.hrr[1]}% + ${rest0}`, value: `${r0(kLo)}–${r0(kHi)} bpm`, isKey: rest !== null },
    { key: "rpe", label: t("rowRpe"), value: c.rpe },
    { key: "rest", label: rest === null ? tv("restAssumed") : tv("restGiven"), value: bpmT(rest0) },
  ];
  return (
    <Card tool="target-heart-rate-calculator" idPrefix="thr"
      n={8}
      side={side}
      k="acsm"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { cls: valueText, lo: ltr(String(r0(bLo))), hi: ltr(`${r0(bHi)} bpm`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + slot * (s.value + 0.5), y: yp(c.max[1]) - 30, dir: "horizontal" }} s={s} testId="thr-c8">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {ACSM.map((a, ai) => {
            const x = X0 + slot * ai + 3;
            const on = ai === s.value;
            return (
              <g key={a.key}>
                <rect x={x} y={yp(a.max[1])} width={slot - 6} height={base - yp(a.max[1])} rx={4} style={{ fill: a.color, opacity: on ? 1 : 0.45, ...lit(on && hover === "pmax") }} />
                {wrap ? (
                  <>
                    <T x={x + (slot - 6) / 2} y={yp(a.max[1]) - 21} text={`${r0((max * a.max[0]) / 100)}–`} size={12} bold={on} style={on ? INK : MUTED} />
                    <T x={x + (slot - 6) / 2} y={yp(a.max[1]) - 8} text={String(r0((max * a.max[1]) / 100))} size={12} bold={on} style={on ? INK : MUTED} />
                    <T x={x + (slot - 6) / 2} y={base + 16} text={`${a.max[0]}–`} size={12} bold={on} style={on ? INK : MUTED} />
                    <T x={x + (slot - 6) / 2} y={base + 29} text={`${a.max[1]}%`} size={12} bold={on} style={on ? INK : MUTED} />
                  </>
                ) : (
                  <>
                    <T x={x + (slot - 6) / 2} y={yp(a.max[1]) - 8} text={`${r0((max * a.max[0]) / 100)}–${r0((max * a.max[1]) / 100)}`} size={12} bold={on} style={on ? INK : MUTED} />
                    <T x={x + (slot - 6) / 2} y={base + 16} text={`${a.max[0]}–${a.max[1]}%`} size={12} bold={on} style={on ? INK : MUTED} />
                  </>
                )}
              </g>
            );
          })}
          <T x={X0} y={16} text="bpm" anchor="start" size={12} bold />
          <T x={W - X0} y={base + (wrap ? 45 : 32)} text="% HRmax" anchor="end" size={12} bold />
        </Drawing>
      }
    />
  );
}
