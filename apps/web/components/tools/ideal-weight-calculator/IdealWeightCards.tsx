"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { axisTicks, Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1, f2, snap } from "@/components/tool-ui/indicator-kit/format";
import { Card } from "../macro-calculator/MacroCards";
import { useIdealWeightLive } from "./IdealWeightLiveContext";
import { FORMULAS, GROUPS, IDEAL_COLOR, W_MAX, W_MIN, WHO_HI, WHO_LO, bmiOf, cmText, coefOf, groupOf, ideal, inchesOver60, kg1, signedKg, weightAt } from "./iw";

/**
 * The eight ideal-weight indicator cards (§31 library). All read the calculator's last valid
 * measurements and the four formula estimates through IdealWeightLiveContext. Two write back:
 * the height sweep drags the height field and the WHO strip drags the current-weight field
 * (inputs, Result table and 3D figure follow). The others keep a what-if value of their own.
 *
 * Handle rule: every drag handle (a 44 px hit area) sits on a rail, track or needle tip with
 * no value label within 24 px of its centre.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
/** Track labels sit this far below the track, clear of the 44 px handle. */
const TRACK_LABEL = 36;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.ideal-weight-calculator.visuals.${key}`),
    tc: useTranslations("tools.ideal-weight-calculator.visuals.common"),
    tg: useTranslations("tools.ideal-weight-calculator.visuals.groups"),
    tf: useTranslations("tools.ideal-weight-calculator.aboveFold"),
  };
}

function SvgTrack({ W, y, frac, lo, hi }: { W: number; y: number; frac: number; lo: string; hi: string }) {
  const x = X0 + clamp(frac, 0, 1) * (W - 2 * X0);
  return (
    <g>
      <line x1={X0} y1={y} x2={W - X0} y2={y} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <line x1={X0} y1={y} x2={x} y2={y} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
      <T x={X0} y={y + TRACK_LABEL} text={lo} anchor="start" size={10.5} />
      <T x={W - X0} y={y + TRACK_LABEL} text={hi} anchor="end" size={10.5} />
    </g>
  );
}

/** A stepper whose value lives in the calculator (height or current-weight field). */
function useSharedStepper(value: number, write: (v: number) => void, min: number, max: number, step: number): Stepper {
  const [seed] = useState(value);
  const set = (v: number) => write(snap(v, step, min, max));
  return {
    value,
    set,
    inc: () => set(value + step),
    dec: () => set(value - step),
    reset: () => write(seed),
    flash: Math.round(value * 10),
    atMin: value <= min,
    atMax: value >= max,
    isSeed: value === seed,
    min,
    max,
    step,
  };
}

/** The current-weight row: labelled as assumed (BMI 25 for this height) when the field is empty. */
function useCurrentRow() {
  const { tc } = useCardText("common");
  const { current, currentGiven } = useIdealWeightLive();
  return { key: "cur", label: currentGiven ? tc("current") : tc("assumed"), value: kg1(current) };
}

// ── 1. Trend lines (wow): every formula and the WHO band against height; drag writes the height field ─
const HS0 = 140;
const HS1 = 210;
export function IdealWeightHeightSweepCard({ side }: { side: Side }) {
  const { t, tc, tf } = useCardText("sweep");
  const { gender: g, heightCm: h, r, setHeightCm } = useIdealWeightLive();
  const s = useSharedStepper(h, setHeightCm, HS0, HS1, 0.5);
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 300;
  const PL = 46;
  const PR = 18;
  const A0 = HS0 - 5;
  const A1 = HS1 + 5;
  const d = useDrawing(HMIN, s, (x, _y, W) => A0 + ((x - PL) / (W - PL - PR)) * (A1 - A0));
  const { W, H } = d;
  const top = 56;
  const base = H - 44;
  const yLo = Math.floor((Math.min(weightAt(WHO_LO, A0), ...FORMULAS.map((f) => ideal(g, A0)[f.key])) - 2) / 10) * 10;
  const yHi = Math.ceil((Math.max(weightAt(WHO_HI, A1), ...FORMULAS.map((f) => ideal(g, A1)[f.key])) + 2) / 10) * 10;
  const xa = (cm: number) => PL + ((clamp(cm, A0, A1) - A0) / (A1 - A0)) * (W - PL - PR);
  const yk = (kg: number) => base - ((clamp(kg, yLo, yHi) - yLo) / (yHi - yLo)) * (base - top);
  const samples = Array.from({ length: 29 }, (_, i) => A0 + (i * (A1 - A0)) / 28);
  const curve = (fn: (cm: number) => number) => samples.map((cm) => `${px2(xa(cm))},${px2(yk(fn(cm)))}`).join(" ");
  const band = `${curve((cm) => weightAt(WHO_LO, cm))} ${samples
    .slice()
    .reverse()
    .map((cm) => `${px2(xa(cm))},${px2(yk(weightAt(WHO_HI, cm)))}`)
    .join(" ")}`;
  const hc = clamp(h, HS0, HS1);
  const slope = ideal(g, h + 1).average - r.average;
  const valueText = cmText(h);
  const rows: KitRow[] = [
    { key: "h", label: t("rowHeight"), value: valueText },
    ...FORMULAS.map((f) => ({ key: f.key, label: tf(f.label), value: kg1(r[f.key]) })),
    { key: "avg", label: tf("averageLabel"), value: kg1(r.average), isKey: true },
    { key: "who", label: tc("whoRange"), value: `${f1(weightAt(WHO_LO, h))}–${kg1(weightAt(WHO_HI, h))}` },
    { key: "slope", label: t("rowSlope"), value: `+${f2(slope)} kg` },
  ];
  const legend: { key: string; label: string; color: string; dash?: string; band?: boolean }[] = [
    ...FORMULAS.map((f) => ({ key: f.key, label: tf(f.label), color: f.color })),
    { key: "avg", label: tf("averageLabel"), color: "var(--ph-ink)", dash: "7 4" },
    { key: "who", label: tc("whoRange"), color: IDEAL_COLOR, band: true },
  ];
  const colW = (W - 2 * X0) / 3;
  return (
    <Card phoneRole="visual" tool="ideal-weight-calculator" idPrefix="iw"
      n={1}
      side={side}
      k="sweep"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { h: ltr(valueText), kg: ltr(kg1(r.average)), slope: ltr(`${f2(slope)} kg`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`${valueText} · ${kg1(r.average)}`} handle={{ x: xa(hc), y: yk(r.average), dir: "horizontal" }} s={s} testId="iw-c1">
          {/* legend, two rows of three */}
          {legend.map((l, i) => {
            const lx = X0 + (i % 3) * colW;
            const ly = 12 + Math.floor(i / 3) * 18;
            return (
              <g key={l.key}>
                {l.band ? (
                  <rect x={lx} y={ly - 1} width={18} height={10} rx={2} fill={l.color} opacity={0.3} />
                ) : (
                  <line x1={lx} y1={ly + 4} x2={lx + 18} y2={ly + 4} style={l.key === "avg" ? { stroke: l.color } : undefined} stroke={l.key === "avg" ? undefined : l.color} strokeWidth={3} strokeDasharray={l.dash} />
                )}
                <T x={lx + 24} y={ly + 8} text={l.label} anchor="start" size={10} bold={hover === l.key} style={hover === l.key ? INK : MUTED} />
              </g>
            );
          })}
          <polygon points={band} fill={IDEAL_COLOR} opacity={hover === "who" ? 0.32 : 0.16} />
          {axisTicks(yLo, yHi, base - top, 26).map((v) => (
            <g key={v}>
              <line x1={PL} y1={yk(v)} x2={W - PR} y2={yk(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yk(v) + 4} text={String(v)} anchor="end" size={10.5} />
            </g>
          ))}
          {axisTicks(A0, A1, W - PL - PR, 44).map((v) => (
            <T key={v} x={xa(v)} y={base + 16} text={String(v)} size={10.5} />
          ))}
          <T x={W - PR} y={base + 34} text={t("axisHeight")} anchor="end" size={10.5} bold />
          <T x={PL} y={base + 34} text={`${valueText} → ${kg1(r.average)}`} anchor="start" size={11.5} bold style={INK} />
          {FORMULAS.map((f) => (
            <polyline key={f.key} points={curve((cm) => ideal(g, cm)[f.key])} fill="none" stroke={f.color} strokeWidth={hover === f.key ? 3.5 : 2} opacity={hover && hover !== f.key && hover !== "h" ? 0.45 : 1} />
          ))}
          <polyline points={curve((cm) => ideal(g, cm).average)} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "avg" ? 3.5 : 2.5} strokeDasharray="7 4" />
          <line x1={xa(hc)} y1={top} x2={xa(hc)} y2={base} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="3 4" />
          {FORMULAS.map((f) => (
            <circle key={f.key} cx={xa(hc)} cy={yk(r[f.key])} r={hover === f.key ? 5 : 3.5} fill={f.color} />
          ))}
        </Drawing>
      }
    />
  );
}

// ── 2. Ranked bars: the four formulas ranked; pick one on the rail to read its equation ────────
export function IdealWeightRankCard({ side }: { side: Side }) {
  const { t, tc, tf } = useCardText("rank");
  const { gender: g, heightCm: h, current, r } = useIdealWeightLive();
  const ranked = [...FORMULAS].sort((a, b) => r[b.key] - r[a.key]);
  const s = useStepper(0, { min: 0, max: 3, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const top = 46;
  const railX = (W: number) => W - 24;
  const lane = (H: number) => (H - top - 40) / 4;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => Math.floor((y - top) / lane(H)));
  const { W, H } = d;
  const rowH = lane(H);
  const sel = ranked[s.value];
  const k = coefOf(sel.key, g);
  const whoLo = weightAt(WHO_LO, h);
  const whoHi = weightAt(WHO_HI, h);
  const vals = [...ranked.map((f) => r[f.key]), current, whoLo, whoHi];
  const lo = Math.max(0, Math.floor((Math.min(...vals) - 4) / 5) * 5);
  const hi = Math.ceil((Math.max(...vals) + 2) / 5) * 5;
  const xEnd = W - 24 - 80; // bars stop before the value pills (xEnd+6..+50), which stop before the rail handle (W-46)
  const xk = (kg: number) => X0 + ((clamp(kg, lo, hi) - lo) / (hi - lo)) * (xEnd - X0);
  const bh = Math.min(24, rowH * 0.42);
  const valueText = tf(sel.label);
  const rows: KitRow[] = [
    { key: "f", label: t("rowFormula"), value: valueText },
    { key: "eq", label: `${k.base} + ${k.inc} × ${f2(inchesOver60(h))}`, value: kg1(r[sel.key]), isKey: true },
    { key: "rank", label: t("rowRank"), value: `${s.value + 1} / 4` },
    { key: "avg", label: t("rowVsAverage"), value: signedKg(r[sel.key] - r.average) },
    useCurrentRow(),
    { key: "diff", label: t("rowVsCurrent"), value: signedKg(current - r[sel.key]) },
    { key: "who", label: tc("whoRange"), value: `${f1(whoLo)}–${kg1(whoHi)}` },
  ];
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={2}
      side={side}
      k="rank"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { name: valueText, kg: ltr(kg1(r[sel.key])), d: ltr(signedKg(r[sel.key] - r.average)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: railX(W), y: top + rowH * s.value + rowH * 0.62, dir: "vertical" }} s={s} testId="iw-c2">
          {/* WHO healthy band behind the bars */}
          <rect x={xk(whoLo)} y={top - 8} width={Math.max(0, xk(whoHi) - xk(whoLo))} height={rowH * 4 + 4} fill={IDEAL_COLOR} opacity={hover === "who" ? 0.25 : 0.12} />
          <line x1={X0} y1={16} x2={X0 + 16} y2={16} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} strokeDasharray="5 4" />
          <T x={X0 + 22} y={20} text={`${tf("averageLabel")}: ${kg1(r.average)}`} anchor="start" size={11.5} bold style={INK} />
          <line x1={railX(W)} y1={top} x2={railX(W)} y2={top + rowH * 4} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
          {ranked.map((f, i) => {
            const y = top + rowH * i + rowH * 0.62;
            const on = i === s.value;
            return (
              <g key={f.key} opacity={on ? 1 : 0.6}>
                <T x={X0} y={y - bh / 2 - 5} text={`${i + 1}. ${tf(f.label)}`} anchor="start" size={10.5} bold={on} style={on ? INK : MUTED} />
                <rect x={X0} y={y - bh / 2} width={Math.max(0, xk(r[f.key]) - X0)} height={bh} rx={5} style={{ fill: f.color, ...(on ? lit(hover === "eq") : {}) }} />
                {/* value in a fixed column past the plot: no line or band ever crosses it */}
                <rect x={xEnd + 6} y={y - 10} width={44} height={20} rx={10} style={{ fill: "var(--ph-surface)", stroke: f.color }} strokeWidth={on ? 2 : 1.25} />
                <T x={xEnd + 28} y={y + 4} text={f1(r[f.key])} size={11} bold={on} style={INK} />
                <circle cx={railX(W)} cy={y} r={3} style={{ fill: on ? "var(--ph-accent-strong)" : "var(--ph-ink-muted)" }} />
              </g>
            );
          })}
          <line x1={xk(r.average)} y1={top - 8} x2={xk(r.average)} y2={top + rowH * 4 - 4} style={{ stroke: "var(--ph-ink)" }} strokeDasharray="5 4" strokeWidth={hover === "avg" ? 2.5 : 1.5} />
          <line x1={xk(current)} y1={top - 8} x2={xk(current)} y2={top + rowH * 4 - 4} stroke={groupOf(bmiOf(current, h)).color} strokeWidth={hover === "cur" || hover === "diff" ? 3.5 : 2.5} />
          {axisTicks(lo, hi, xEnd - X0, 48).map((v, i, all) => (
            <T key={v} x={xk(v)} y={H - 24} text={i === all.length - 1 ? `${v} kg` : String(v)} size={10.5} />
          ))}
          {/* legend for the current-weight line (the dashed average is keyed in the title) */}
          <line x1={X0} y1={H - 10} x2={X0 + 16} y2={H - 10} stroke={groupOf(bmiOf(current, h)).color} strokeWidth={3} />
          <T x={X0 + 22} y={H - 6} text={`${tc("current")} ${kg1(current)}`} anchor="start" size={10.5} bold />
        </Drawing>
      }
    />
  );
}

// ── 3. Zone strip (wow): drag the current weight across the WHO groups (writes the weight field) ─
export function IdealWeightZoneCard({ side }: { side: Side }) {
  const { t, tc, tg, tf } = useCardText("zone");
  const { heightCm: h, current, r, setCurrentKg } = useIdealWeightLive();
  const D0 = weightAt(15, h);
  const D1 = weightAt(40, h);
  const s = useSharedStepper(current, setCurrentKg, Math.max(W_MIN, Math.ceil(D0)), Math.min(W_MAX, Math.floor(D1)), 0.5);
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => D0 + ((x - X0) / (W - 2 * X0)) * (D1 - D0));
  const { W, H } = d;
  const xb = (kg: number) => X0 + ((clamp(kg, D0, D1) - D0) / (D1 - D0)) * (W - 2 * X0);
  const sy = H / 2 - 10;
  const SH = 34;
  const bmi = bmiOf(current, h);
  const grp = groupOf(bmi);
  const whoLo = weightAt(WHO_LO, h);
  const whoHi = weightAt(WHO_HI, h);
  const toRange = current > whoHi ? current - whoHi : current < whoLo ? current - whoLo : 0;
  const valueText = kg1(current);
  const rows: KitRow[] = [
    { ...useCurrentRow(), isKey: true },
    { key: "bmi", label: `BMI = ${f1(current)} ÷ ${f2(h / 100)}²`, value: f1(bmi) },
    { key: "grp", label: t("rowGroup"), value: tg(grp.key) },
    { key: "range", label: t("rowToRange"), value: toRange === 0 ? tc("inside") : signedKg(-toRange) },
    { key: "avg", label: t("rowToAverage"), value: signedKg(r.average - current) },
    { key: "lo", label: tc("whoLow"), value: kg1(whoLo) },
    { key: "hi", label: tc("whoHigh"), value: kg1(whoHi) },
  ];
  const hx = xb(current);
  // Each band name centred over its band; the end bands may hang outwards from the strip edge;
  // a name that would touch its neighbour is left out (the table names the current group).
  const zoneLabels: { key: string; name: string; x: number; anchor: "start" | "middle" | "end"; on: boolean }[] = [];
  let lastEnd = -Infinity;
  GROUPS.forEach((c, i) => {
    const a = xb(weightAt(Math.max(15, c.min), h));
    const z = xb(weightAt(Math.min(40, c.max), h));
    const name = tg(c.key);
    const w = name.length * 6.2 + 4;
    let x0 = (a + z) / 2 - w / 2;
    if (i === 0 && w > z - a) x0 = a;
    if (i === GROUPS.length - 1 && w > z - a) x0 = z - w;
    x0 = clamp(x0, X0 - 20, W - X0 + 20 - w);
    if (x0 < lastEnd + 8) return;
    lastEnd = x0 + w;
    zoneLabels.push({ key: c.key, name, x: x0, anchor: "start", on: c.key === grp.key });
  });
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={3}
      side={side}
      k="zone"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(valueText), bmi: ltr(f1(bmi)), group: tg(grp.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: hx, y: sy, dir: "horizontal" }} s={s} testId="iw-c3">
          {/* BMI axis on top: the same strip read as BMI */}
          {[15, 18.5, 25, 30, 35, 40].map((b) => (
            <g key={b}>
              <line x1={xb(weightAt(b, h))} y1={sy - SH / 2 - 42} x2={xb(weightAt(b, h))} y2={sy - SH / 2 - 34} style={LINE} />
              <T x={xb(weightAt(b, h))} y={sy - SH / 2 - 48} text={String(b)} size={10.5} bold={b === 18.5 || b === 25} />
            </g>
          ))}
          <T x={X0} y={sy - SH / 2 - 64} text="BMI" anchor="start" size={10.5} bold />
          {GROUPS.map((c) => {
            const a = xb(weightAt(Math.max(15, c.min), h));
            const z = xb(weightAt(Math.min(40, c.max), h));
            const on = c.key === grp.key;
            return <rect key={c.key} x={a} y={sy - SH / 2} width={Math.max(0, z - a)} height={SH} style={{ fill: c.color, opacity: on ? 1 : 0.55, ...lit(on && hover === "grp") }} />;
          })}
          {/* band names in a row just above the strip (the average line and the handle start below it) */}
          {zoneLabels.map((l) => (
            <T key={l.key} x={l.x} y={sy - SH / 2 - 12} text={l.name} anchor={l.anchor} size={10.5} bold={l.on} style={l.on ? INK : MUTED} />
          ))}
          <rect x={X0} y={sy - SH / 2} width={W - 2 * X0} height={SH} fill="none" style={LINE} rx={3} />
          {/* the four formula estimates and their average as markers under the strip */}
          {FORMULAS.map((f) => (
            <path key={f.key} d={`M ${px2(xb(r[f.key]))} ${sy + SH / 2 + 26} l -5 9 l 10 0 z`} fill={f.color} />
          ))}
          <line x1={xb(r.average)} y1={sy - SH / 2} x2={xb(r.average)} y2={sy + SH / 2 + 38} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "avg" ? 3 : 2} strokeDasharray="4 3" />
          <T x={clamp(xb(r.average), X0 + 60, W - X0 - 60)} y={sy + SH / 2 + 52} text={`${tf("averageLabel")} ${kg1(r.average)}`} size={10.5} bold style={INK} />
          <line x1={hx} y1={sy - SH / 2 - 6} x2={hx} y2={sy + SH / 2 + 6} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <T x={clamp(hx, X0 + 80, W - X0 - 80)} y={H - 8} text={`${valueText} · BMI ${f1(bmi)}`} size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 4. Formula diagram: the Devine formula built step by step ──────────────────────────────────
export function IdealWeightFormulaCard({ side }: { side: Side }) {
  const { t, tf } = useCardText("formula");
  const { gender: g, heightCm: h, r } = useIdealWeightLive();
  const s = useStepper(4, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const st = s.value;
  const k = coefOf("devine", g);
  const inches = h / 2.54;
  const over = inches - 60;
  const stages = [
    { key: "in", top: `${f1(h)} ÷ 2.54`, bottom: `${f2(inches)} in` },
    { key: "over", top: `${f2(inches)} − 60`, bottom: `${f2(over)} in` },
    { key: "inc", top: `${k.inc} × ${f2(over)}`, bottom: kg1(k.inc * over) },
    { key: "base", top: `${k.base} + ${f1(k.inc * over)}`, bottom: kg1(r.devine) },
  ];
  const trackY = H - 48;
  const boxW = Math.min(160, (W - 2 * X0 - 3 * 18) / 4);
  const gap = (W - 2 * X0 - 4 * boxW) / 3;
  const by = 56;
  const bh = trackY - 42 - by;
  const valueText = t(`stage${st}`);
  const rows: KitRow[] = [
    { key: "in", label: t("rowInches"), value: `${f2(inches)} in`, isKey: st === 1 },
    { key: "over", label: t("rowOver"), value: `${f2(over)} in`, isKey: st === 2 },
    { key: "inc", label: t("rowIncrement", { inc: k.inc }), value: signedKg(k.inc * over), isKey: st === 3 },
    { key: "base", label: t(g === "male" ? "rowBaseMale" : "rowBaseFemale"), value: kg1(k.base) },
    { key: "devine", label: tf("devineLabel"), value: kg1(r.devine), isKey: st === 4 },
    { key: "avg", label: tf("averageLabel"), value: kg1(r.average) },
  ];
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={4}
      side={side}
      k="formula"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { stage: valueText, kg: ltr(kg1(r.devine)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((st - 1) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="iw-c4">
          <T x={W / 2} y={28} text={`kg = ${k.base} + ${k.inc} × (cm ÷ 2.54 − 60)`} size={13} bold style={INK} />
          {stages.map((sg, gi) => {
            const x = X0 + gi * (boxW + gap);
            const shown = gi < st;
            const on = gi === st - 1 || hover === sg.key || (gi === 3 && hover === "devine");
            return (
              <g key={sg.key} opacity={shown ? 1 : 0.28}>
                <rect x={x} y={by} width={boxW} height={bh} rx={10} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + boxW / 2} y={by + 20} text={String(gi + 1)} size={11} bold />
                <T x={x + boxW / 2} y={by + bh / 2 + 2} text={sg.top} size={10.5} />
                <T x={x + boxW / 2} y={by + bh / 2 + 24} text={sg.bottom} size={12} bold style={INK} />
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

// ── 5. Gradient gauge: BMI after a what-if change in weight (seeded with the change to the average) ─
const B0 = 14;
const B1 = 40;
export function IdealWeightGaugeCard({ side }: { side: Side }) {
  const { current, r } = useIdealWeightLive();
  // A new current weight or ideal re-seeds the what-if change.
  return <Gauge key={`${current}-${r.average}`} side={side} />;
}
function Gauge({ side }: { side: Side }) {
  const { t, tg, tf } = useCardText("gauge");
  const { heightCm: h, current, r } = useIdealWeightLive();
  const s = useStepper(clamp(Math.round((r.average - current) * 2) / 2, -40, 40), { min: -40, max: 40, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const geo = (W: number, H: number) => {
    const R = Math.max(70, Math.min(W / 2 - 46, H - 96));
    return { cx: W / 2, cy: H - 62, R };
  };
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const { cx, cy } = geo(W, H);
    const a = Math.atan2(Math.max(0, cy - y), x - cx);
    const b = B0 + (1 - a / Math.PI) * (B1 - B0);
    return weightAt(b, h) - current;
  });
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const ang = (b: number) => Math.PI * (1 - (clamp(b, B0, B1) - B0) / (B1 - B0));
  const pt = (b: number, rr: number): [number, number] => [px2(cx + rr * Math.cos(ang(b))), px2(cy - rr * Math.sin(ang(b)))];
  const arc = (b0: number, b1: number, rr: number) => {
    const [x0, y0] = pt(b0, rr);
    const [x1, y1] = pt(b1, rr);
    return `M ${x0} ${y0} A ${rr} ${rr} 0 0 1 ${x1} ${y1}`;
  };
  const w2 = Math.max(W_MIN, current + s.value);
  const bmiNow = bmiOf(current, h);
  const bmi2 = bmiOf(w2, h);
  const bmiAvg = bmiOf(r.average, h);
  const grp2 = groupOf(bmi2);
  const [nx, ny] = pt(bmi2, R - 18);
  const [gx, gy] = pt(bmiNow, R - 18);
  const [ax0, ay0] = pt(bmiAvg, R - 13);
  const [ax1, ay1] = pt(bmiAvg, R + 13);
  const valueText = signedKg(s.value);
  const rows: KitRow[] = [
    useCurrentRow(),
    { key: "bmiNow", label: t("rowBmiNow"), value: f1(bmiNow) },
    { key: "d", label: t("rowChange"), value: valueText },
    { key: "w2", label: t("rowNewWeight"), value: kg1(w2) },
    { key: "bmi2", label: `BMI = ${f1(w2)} ÷ ${f2(h / 100)}²`, value: f1(bmi2), isKey: true },
    { key: "grp", label: t("rowGroup"), value: tg(grp2.key) },
    { key: "avg", label: `${tf("averageLabel")} (BMI)`, value: f1(bmiAvg) },
  ];
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={5}
      side={side}
      k="gauge"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { d: ltr(valueText), w: ltr(kg1(w2)), bmi: ltr(f1(bmi2)), group: tg(grp2.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`BMI ${f1(bmi2)}`} handle={{ x: nx, y: ny, dir: "circular" }} s={s} testId="iw-c5">
          {GROUPS.map((c) => {
            const on = grp2.key === c.key;
            return <path key={c.key} d={arc(Math.max(B0, c.min), Math.min(B1, c.max), R)} fill="none" stroke={c.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.6} style={hover === "grp" && on ? { filter: "brightness(1.15)" } : undefined} />;
          })}
          {[B0, WHO_LO, 25, 30, B1].map((b) => {
            const [x, y] = pt(b, R + 26);
            return <T key={b} x={x} y={y + 4} text={String(b)} size={10.5} />;
          })}
          {/* the average ideal weight as a dark tick across the arc */}
          <line x1={ax0} y1={ay0} x2={ax1} y2={ay1} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "avg" ? 4.5 : 3} />
          <line x1={cx} y1={cy} x2={gx} y2={gy} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} strokeDasharray="4 4" opacity={hover === "bmiNow" ? 1 : 0.7} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "bmi2" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          {/* centre readout sits below the 44 px handle band, even with the needle flat */}
          <T x={cx} y={cy + 36} text={`BMI ${f1(bmi2)}`} size={15} bold style={INK} />
          <T x={cx} y={cy + 52} text={`${f1(current)} → ${kg1(w2)}`} size={11} />
        </Drawing>
      }
    />
  );
}

// ── 6. Timeline: weeks to reach each estimate at a steady weekly rate ──────────────────────────
export function IdealWeightTimelineCard({ side }: { side: Side }) {
  const { t, tc, tf } = useCardText("timeline");
  const { heightCm: h, current, r } = useIdealWeightLive();
  const s = useStepper(0.5, { min: 0.25, max: 1, step: 0.05 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 300;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.25 + ((x - X0) / (W - 2 * X0)) * 0.75);
  const { W, H } = d;
  const rate = s.value;
  const gain = r.average > current;
  const whoEdge = gain ? weightAt(WHO_LO, h) : weightAt(WHO_HI, h);
  const stations: { key: string; label: string; kg: number; color: string }[] = [
    ...FORMULAS.map((f) => ({ key: f.key as string, label: tf(f.label), kg: r[f.key], color: f.color })),
    { key: "avg", label: tf("averageLabel"), kg: r.average, color: "var(--ph-ink)" },
    { key: "who", label: tc("whoEdge"), kg: whoEdge, color: IDEAL_COLOR },
  ].map((x) => ({ ...x, weeks: Math.max(0, gain ? x.kg - current : current - x.kg) / rate }));
  const weeksOf = (kg: number) => Math.max(0, gain ? kg - current : current - kg) / rate;
  const maxWeeks = Math.max(4, ...stations.map((x) => weeksOf(x.kg)));
  const ly = 84;
  const xw = (wk: number) => X0 + (clamp(wk, 0, maxWeeks) / maxWeeks) * (W - 2 * X0);
  const trackY = H - 48;
  const avgWeeks = weeksOf(r.average);
  const valueText = `${f2(rate)} kg/${tc("week")}`;
  const rows: KitRow[] = [
    useCurrentRow(),
    { key: "rate", label: t("rowRate"), value: valueText },
    { key: "avg", label: `|${f1(current)} − ${f1(r.average)}| ÷ ${f2(rate)}`, value: `${f1(avgWeeks)} ${tc("weeks")}`, isKey: true },
    { key: "who", label: tc("whoEdge"), value: `${f1(weeksOf(whoEdge))} ${tc("weeks")}` },
    { key: "first", label: t("rowFirst"), value: `${f1(Math.min(...FORMULAS.map((f) => weeksOf(r[f.key]))))} ${tc("weeks")}` },
    { key: "last", label: t("rowLast"), value: `${f1(Math.max(...FORMULAS.map((f) => weeksOf(r[f.key]))))} ${tc("weeks")}` },
    { key: "months", label: t("rowMonths"), value: f1(avgWeeks / 4.345) },
  ];
  const colW = (W - 2 * X0) / 2;
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={6}
      side={side}
      k="timeline"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { rate: ltr(valueText), weeks: ltr(f1(avgWeeks)), kg: ltr(kg1(r.average)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((rate - 0.25) / 0.75) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="iw-c6">
          <T x={X0} y={24} text={`${kg1(current)} → ${kg1(r.average)} · ${f1(avgWeeks)} ${tc("weeks")}`} anchor="start" size={13} bold style={INK} />
          <T x={X0} y={44} text={gain ? t("gain") : t("loss")} anchor="start" size={10.5} />
          <line x1={X0} y1={ly} x2={W - X0} y2={ly} style={LINE} strokeWidth={3} strokeLinecap="round" />
          {axisTicks(0, maxWeeks, W - 2 * X0, 48).map((v) => (
            <g key={v}>
              <line x1={xw(v)} y1={ly + 6} x2={xw(v)} y2={ly + 12} style={LINE} />
              <T x={xw(v)} y={ly + 26} text={String(v)} size={10.5} />
            </g>
          ))}
          <T x={W - X0} y={ly + 42} text={tc("weeks")} anchor="end" size={10.5} bold />
          <circle cx={xw(0)} cy={ly} r={6} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-ink)" }} strokeWidth={2} />
          {stations.map((x) => (
            <circle key={x.key} cx={xw(weeksOf(x.kg))} cy={ly} r={hover === x.key || (x.key === "avg" && hover === null) ? 7 : 5} style={{ fill: x.color }} stroke="var(--ph-surface)" strokeWidth={1.5} />
          ))}
          {/* legend instead of labels on the line, so close stations never collide */}
          {stations.map((x, i) => {
            const lx = X0 + (i % 2) * colW;
            const lyy = ly + 62 + Math.floor(i / 2) * 18;
            return (
              <g key={`lg${x.key}`}>
                <circle cx={lx + 6} cy={lyy - 4} r={5} style={{ fill: x.color }} />
                <T x={lx + 16} y={lyy} text={`${x.label} · ${f1(weeksOf(x.kg))}`} anchor="start" size={10.5} bold={hover === x.key} style={hover === x.key ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(rate - 0.25) / 0.75} lo="0.25" hi="1.00 kg" />
        </Drawing>
      }
    />
  );
}

// ── 7. Sensitivity trio: what a ± height measuring error does to the average estimate ─────────
export function IdealWeightSensitivityCard({ side }: { side: Side }) {
  const { t, tf } = useCardText("sensitivity");
  const { gender: g, heightCm: h, r } = useIdealWeightLive();
  const s = useStepper(2, { min: 0.5, max: 5, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - 2 * X0)) * 4.5);
  const { W, H } = d;
  const e = s.value;
  const trio = [
    { key: "short", label: cmText(h - e), v: ideal(g, h - e).average },
    { key: "now", label: cmText(h), v: r.average },
    { key: "tall", label: cmText(h + e), v: ideal(g, h + e).average },
  ];
  const trackY = H - 48;
  const base = trackY - 50;
  const lo = Math.max(0, Math.floor((Math.min(...trio.map((x) => x.v)) * 0.85) / 5) * 5);
  const hi = Math.max(...trio.map((x) => x.v)) * 1.04;
  const yb = (v: number) => base - ((v - lo) / (hi - lo)) * (base - 30);
  const colW = (W - 2 * X0) / 3;
  const spread = trio[2].v - trio[0].v;
  const valueText = `± ${f1(e)} cm`;
  const rows: KitRow[] = [
    { key: "e", label: t("rowError"), value: valueText },
    { key: "short", label: t("rowAt", { h: cmText(h - e) }), value: kg1(trio[0].v) },
    { key: "now", label: t("rowAt", { h: cmText(h) }), value: kg1(trio[1].v) },
    { key: "tall", label: t("rowAt", { h: cmText(h + e) }), value: kg1(trio[2].v) },
    { key: "spread", label: `${f1(trio[2].v)} − ${f1(trio[0].v)}`, value: kg1(spread), isKey: true },
    { key: "per", label: t("rowPerCm"), value: kg1(spread / (2 * e)) },
  ];
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={7}
      side={side}
      k="sensitivity"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { e: ltr(valueText), d: ltr(kg1(spread)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 0.5) / 4.5) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="iw-c7">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          <T x={X0} y={base - 6} text={String(lo)} anchor="start" size={10} />
          <T x={W - X0} y={22} text={tf("averageLabel")} anchor="end" size={10.5} bold />
          {trio.map((c, ci) => {
            const x = X0 + colW * ci + colW * 0.22;
            const bw = colW * 0.56;
            const on = hover === c.key || (ci === 1 && hover === null);
            return (
              <g key={c.key}>
                <rect x={x} y={yb(c.v)} width={bw} height={Math.max(0, base - yb(c.v))} rx={5} style={{ fill: ci === 1 ? IDEAL_COLOR : "#3b82f6", opacity: ci === 1 ? 1 : 0.7, ...lit(on) }} />
                <T x={x + bw / 2} y={yb(c.v) - 8} text={f1(c.v)} size={12} bold style={INK} />
                <T x={x + bw / 2} y={base + 16} text={c.label} size={10.5} bold={ci === 1} style={ci === 1 ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(e - 0.5) / 4.5} lo="± 0.5 cm" hi="± 5 cm" />
        </Drawing>
      }
    />
  );
}

// ── 8. Labeled bars: the BMI each formula implies, against a draggable target BMI ─────────────
export function IdealWeightTargetBmiCard({ side }: { side: Side }) {
  const { t, tg, tf } = useCardText("target");
  const { heightCm: h, r } = useIdealWeightLive();
  const s = useStepper(22, { min: WHO_LO, max: WHO_HI, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const top = 44;
  const railX = (W: number) => W - 24;
  const imp = FORMULAS.map((f) => ({ ...f, bmi: bmiOf(r[f.key], h) }));
  const lo = Math.floor(Math.min(WHO_LO, ...imp.map((x) => x.bmi)) - 2);
  const hi = Math.ceil(Math.max(WHO_HI, ...imp.map((x) => x.bmi)) + 1.5);
  const geo = (H: number) => ({ base: H - 46 });
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => {
    const { base } = geo(H);
    return lo + ((base - y) / (base - top)) * (hi - lo);
  });
  const { W, H } = d;
  const { base } = geo(H);
  const yb = (b: number) => base - ((clamp(b, lo, hi) - lo) / (hi - lo)) * (base - top);
  const target = s.value;
  const tkg = weightAt(target, h);
  const PL = 36;
  const plotR = railX(W) - 30;
  const colW = (plotR - PL) / imp.length;
  const valueText = `BMI ${f1(target)}`;
  const nearest = [...imp].sort((a, b) => Math.abs(a.bmi - target) - Math.abs(b.bmi - target))[0];
  const rows: KitRow[] = [
    { key: "t", label: t("rowTarget"), value: valueText },
    { key: "tkg", label: `${f1(target)} × ${f2(h / 100)}²`, value: kg1(tkg), isKey: true },
    ...imp.map((f) => ({ key: f.key, label: `${tf(f.label)} (BMI)`, value: f1(f.bmi) })),
    { key: "near", label: t("rowNearest"), value: tf(nearest.label) },
  ];
  return (
    <Card tool="ideal-weight-calculator" idPrefix="iw"
      n={8}
      side={side}
      k="target"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { bmi: ltr(f1(target)), kg: ltr(kg1(tkg)), name: tf(nearest.label) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: railX(W), y: yb(target), dir: "vertical" }} s={s} testId="iw-c8">
          <T x={PL} y={22} text={`${valueText} = ${kg1(tkg)}`} anchor="start" size={13} bold style={INK} />
          {/* WHO normal band behind the bars */}
          <rect x={PL} y={yb(WHO_HI)} width={plotR - PL} height={yb(WHO_LO) - yb(WHO_HI)} fill={IDEAL_COLOR} opacity={0.12} />

          {axisTicks(lo, hi, base - top, 26).map((v) => (
            <g key={v}>
              <line x1={PL} y1={yb(v)} x2={plotR} y2={yb(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yb(v) + 4} text={String(v)} anchor="end" size={10.5} />
            </g>
          ))}
          <line x1={PL} y1={base} x2={plotR} y2={base} style={LINE} strokeWidth={1.5} />
          {imp.map((f, i) => {
            const x = PL + colW * i + colW * 0.2;
            const bw = colW * 0.6;
            const on = hover === f.key || f.key === nearest.key;
            return (
              <g key={f.key}>
                <rect x={x} y={yb(f.bmi)} width={bw} height={Math.max(0, base - yb(f.bmi))} rx={5} style={{ fill: f.color, opacity: on ? 1 : 0.75, ...lit(hover === f.key) }} />
                <T x={x + bw / 2} y={yb(f.bmi) - 7} text={f1(f.bmi)} size={11.5} bold style={INK} />
                <T x={x + bw / 2} y={base + 16} text={tf(f.label).replace(/\s*\(\d{4}\)$/, "")} size={10.5} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          {/* the target line runs from the plot to the rail on the right, where the handle sits */}
          <line x1={PL} y1={yb(target)} x2={railX(W)} y2={yb(target)} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "t" || hover === "tkg" ? 3 : 2} strokeDasharray="6 4" />
          <line x1={railX(W)} y1={yb(WHO_HI)} x2={railX(W)} y2={yb(WHO_LO)} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
          {/* legend for the green band, in its own row under the bar names */}
          <rect x={PL} y={H - 16} width={18} height={10} rx={2} fill={IDEAL_COLOR} opacity={0.3} />
          <T x={PL + 24} y={H - 7} text={`${tg("normal")} · BMI ${WHO_LO}–${WHO_HI}`} anchor="start" size={10.5} />
        </Drawing>
      }
    />
  );
}
