"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { axisTicks, Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1, f2, snap } from "@/components/tool-ui/indicator-kit/format";
import { Card } from "../macro-calculator/MacroCards";
import { useBMILive } from "./BMILiveContext";
import { BMI_MID, WHO_CLASSES, WHO_CUTS, bmiOf, weightAt, whoIndex, whoOf } from "./who";

/**
 * The eight BMI indicator cards (§31 library). All read the calculator's live result
 * (height, weight, age, sex) through BMILiveContext; the zone strip writes the weight back, so
 * dragging it moves the input field, the Result table and the 3D figure. The other cards keep
 * a what-if value of their own on top of the live result.
 */
type Side = "visual-left" | "table-left";
const B0 = 13;
const B1 = 45;
const X0 = 30;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.bmi-calculator.visuals.${key}`),
    tw: useTranslations("tools.bmi-calculator.visuals.who"),
    tc: useTranslations("toolPage.indicatorKit"),
  };
}

/** A what-if track drawn along the bottom of a card's SVG: line, filled part, end ticks. */
function SvgTrack({ W, y, frac, lo, hi }: { W: number; y: number; frac: number; lo: string; hi: string }) {
  const x = X0 + clamp(frac, 0, 1) * (W - 2 * X0);
  return (
    <g>
      <line x1={X0} y1={y} x2={W - X0} y2={y} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <line x1={X0} y1={y} x2={x} y2={y} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
      <T x={X0} y={y + 22} text={lo} anchor="start" size={10.5} />
      <T x={W - X0} y={y + 22} text={hi} anchor="end" size={10.5} />
    </g>
  );
}

/** The live weight as a stepper: −/+ and the drag write the calculator's own weight field. */
function useSharedWeight(): Stepper {
  const { result, setWeightKg } = useBMILive();
  const [seed] = useState(result.weightKg);
  const h = result.heightCm;
  const min = Math.ceil(weightAt(B0, h));
  const max = Math.floor(weightAt(B1, h));
  const step = 0.5;
  const value = result.weightKg;
  const set = (v: number) => setWeightKg(snap(v, step, min, max));
  return {
    value,
    set,
    inc: () => set(value + step),
    dec: () => set(value - step),
    reset: () => setWeightKg(seed),
    flash: Math.round(value * 10),
    atMin: value <= min,
    atMax: value >= max,
    isSeed: value === seed,
    min,
    max,
    step,
  };
}

// ── 1. WHO zone strip: drag the weight across the eight bands (writes the calculator) ──────
export function BMIZoneStripCard({ side }: { side: Side }) {
  const { t, tw } = useCardText("zone");
  const { result } = useBMILive();
  const h = result.heightCm;
  const s = useSharedWeight();
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const d = useDrawing(HMIN, s, (x, _y, W) => weightAt(B0 + ((x - X0) / (W - 2 * X0)) * (B1 - B0), h));
  const { W, H } = d;
  const xb = (b: number) => X0 + ((clamp(b, B0, B1) - B0) / (B1 - B0)) * (W - 2 * X0);
  const w = s.value;
  const bmi = bmiOf(w, h);
  const i = whoIndex(bmi);
  const cls = WHO_CLASSES[i];
  const sy = H / 2 - 4;
  const SH = 34;
  const up = WHO_CUTS.find((c) => c > bmi);
  const down = [...WHO_CUTS].reverse().find((c) => c <= bmi);
  const toNormal = bmi < 18.5 ? weightAt(18.5, h) - w : bmi >= 25 ? w - weightAt(24.9, h) : 0;
  const kgTicks = axisTicks(weightAt(B0, h), weightAt(B1, h), W - 2 * X0, 54);
  const valueText = `${f1(w)} kg`;
  const rows: KitRow[] = [
    { key: "w", label: t("rowWeight"), value: `${f1(w)} kg`, isKey: true },
    { key: "bmi", label: `BMI = ${f1(w)} ÷ ${f2(h / 100)}²`, value: f1(bmi) },
    { key: "cls", label: t("rowClass"), value: tw(cls.key) },
    { key: "up", label: t("rowUp", { cut: up ?? "—" }), value: up ? `+${f1(weightAt(up, h) - w)} kg` : "—" },
    { key: "down", label: t("rowDown", { cut: down ?? "—" }), value: down ? `−${f1(w - weightAt(down, h))} kg` : "—" },
    { key: "normal", label: t("rowNormal"), value: toNormal === 0 ? t("inside") : `${f1(toNormal)} kg` },
  ];
  return (
    <Card phoneRole="visual" tool="bmi-calculator" idPrefix="bmi"
      n={1}
      side={side}
      k="zone"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(`${f1(w)} kg`), bmi: ltr(f1(bmi)), cls: tw(cls.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xb(bmi), y: sy, dir: "horizontal" }} s={s} testId="bmi-c1">
          {/* kg axis on top: the same strip read in this height's kilograms */}
          <line x1={X0} y1={sy - SH / 2 - 26} x2={W - X0} y2={sy - SH / 2 - 26} style={LINE} strokeWidth={1} opacity={0.5} />
          {kgTicks.map((kg) => {
            const x = xb(bmiOf(kg, h));
            if (x < X0 + 8 || x > W - X0 - 8) return null;
            return (
              <g key={kg}>
                <line x1={x} y1={sy - SH / 2 - 30} x2={x} y2={sy - SH / 2 - 22} style={LINE} />
                <T x={x} y={sy - SH / 2 - 36} text={`${kg}`} size={10.5} />
              </g>
            );
          })}
          <T x={X0} y={sy - SH / 2 - 52} text="kg" anchor="start" size={10.5} bold />
          {WHO_CLASSES.map((c, ci) => {
            const a = xb(Math.max(c.min, B0));
            const b = xb(Math.min(c.max, B1));
            const on = ci === i;
            const name = tw(c.key);
            return (
              <g key={c.key}>
                <rect x={a} y={sy - SH / 2} width={Math.max(0, b - a)} height={SH} style={{ fill: c.color, opacity: on ? 1 : 0.55, ...lit(on && hover === "cls") }} />
                {b - a > name.length * 6.6 + 8 && (
                  <text x={(a + b) / 2} y={sy + 4} fontSize={10.5} fontWeight={800} textAnchor="middle" fill="#fff">
                    {name}
                  </text>
                )}
              </g>
            );
          })}
          <rect x={X0} y={sy - SH / 2} width={W - 2 * X0} height={SH} fill="none" style={LINE} rx={3} />
          {WHO_CUTS.map((c, ci) => (
            <T key={c} x={xb(c)} y={sy + SH / 2 + (ci === 1 ? 32 : 18)} text={String(c)} size={10.5} bold={c === 18.5 || c === 25} style={c === 18.5 || c === 25 ? INK : MUTED} />
          ))}
          <T x={X0} y={sy + SH / 2 + 50} text="BMI" anchor="start" size={10.5} bold />
          <line x1={xb(bmi)} y1={sy - SH / 2 - 6} x2={xb(bmi)} y2={sy + SH / 2 + 6} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <T x={clamp(xb(bmi), X0 + 60, W - X0 - 60)} y={H - 10} text={`${f1(w)} kg · BMI ${f1(bmi)}`} size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 2. Gradient gauge: BMI Prime (BMI ÷ 25) after a what-if weight change ─────────────────
const P0 = 0.5;
const P1 = 1.8;
export function BMIPrimeGaugeCard({ side }: { side: Side }) {
  const { t, tw } = useCardText("prime");
  const { result } = useBMILive();
  const h = result.heightCm;
  const w = result.weightKg;
  const s = useStepper(0, { min: -30, max: 30, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const geo = (W: number, H: number) => {
    const R = Math.max(70, Math.min(W / 2 - 46, H - 74));
    return { cx: W / 2, cy: H - 46, R };
  };
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const { cx, cy } = geo(W, H);
    const a = Math.atan2(Math.max(0, cy - y), x - cx);
    const p = P0 + (1 - a / Math.PI) * (P1 - P0);
    return p * 25 * (h / 100) ** 2 - w;
  });
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const ang = (p: number) => Math.PI * (1 - (clamp(p, P0, P1) - P0) / (P1 - P0));
  const pt = (p: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(p))), px2(cy - r * Math.sin(ang(p)))];
  const arc = (p0: number, p1: number, r: number) => {
    const [x0, y0] = pt(p0, r);
    const [x1, y1] = pt(p1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const w2 = w + s.value;
  const prime0 = result.bmi / 25;
  const bmi2 = bmiOf(w2, h);
  const prime2 = bmi2 / 25;
  const [nx, ny] = pt(prime2, R - 18);
  const [gx, gy] = pt(prime0, R - 18);
  const valueText = `${s.value > 0 ? "+" : ""}${s.value} kg`;
  const rows: KitRow[] = [
    { key: "p0", label: t("rowNow"), value: f2(prime0) },
    { key: "d", label: t("rowDelta"), value: valueText },
    { key: "w2", label: t("rowWeight"), value: `${f1(w2)} kg` },
    { key: "b2", label: `BMI = ${f1(w2)} ÷ ${f2(h / 100)}²`, value: f1(bmi2) },
    { key: "p2", label: `BMI Prime = ${f1(bmi2)} ÷ 25`, value: f2(prime2), isKey: true },
    { key: "cls", label: t("rowClass"), value: tw(whoOf(bmi2).key) },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={2}
      side={side}
      k="prime"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { d: ltr(valueText), p: ltr(f2(prime2)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`BMI Prime ${f2(prime2)}`} handle={{ x: nx, y: ny, dir: "circular" }} s={s} testId="bmi-c2">
          {WHO_CLASSES.map((c) => {
            const a = Math.max(c.min / 25, P0);
            const b = Math.min(c.max / 25, P1);
            if (b <= a) return null;
            const on = whoOf(bmi2).key === c.key;
            return <path key={c.key} d={arc(a, b, R)} fill="none" stroke={c.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.6} />;
          })}
          {[0.64, 0.74, 1, 1.2, 1.4, 1.6].map((p) => {
            const [x, y] = pt(p, R + 24);
            return <T key={p} x={x} y={y + 4} text={f2(p)} size={10.5} bold={p === 1} style={p === 1 ? INK : MUTED} />;
          })}
          <line x1={cx} y1={cy} x2={gx} y2={gy} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} strokeDasharray="4 4" opacity={hover === "p0" ? 1 : 0.7} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "p2" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`BMI Prime ${f2(prime2)}`} size={15} bold style={INK} />
          <T x={cx} y={cy + 42} text={`BMI ${f1(bmi2)} · ${f1(w2)} kg`} size={11} />
        </Drawing>
      }
    />
  );
}

// ── 3. Labeled bars: the weight at every WHO cut-off for this height ─────────────────────
export function BMICutoffBarsCard({ side }: { side: Side }) {
  const { t, tw } = useCardText("cutoffs");
  const { result } = useBMILive();
  const h = result.heightCm;
  const w = result.weightKg;
  const s = useStepper(3, { min: 0, max: WHO_CUTS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const n = WHO_CUTS.length + 1;
  const bars = [...WHO_CUTS.map((c, ci) => ({ key: `c${c}`, label: String(c), kg: weightAt(c, h), color: whoOf(c).color, you: false, ci })), { key: "you", label: t("you"), kg: w, color: whoOf(result.bmi).color, you: true, ci: -1 }].sort((a, b) => a.kg - b.kg);
  // Pointer → bar slot → that bar's cut-off (the "you" bar keeps the current choice).
  const d = useDrawing(HMIN, s, (x, _y, W) => {
    const bar = bars[clamp(Math.floor(((x - X0) / (W - 2 * X0)) * n), 0, n - 1)];
    return bar.you ? s.value : bar.ci;
  });
  const { W, H } = d;
  const slot = (W - 2 * X0) / n;
  const top = Math.max(...bars.map((b) => b.kg)) * 1.08;
  const base = H - 40;
  const yk = (kg: number) => base - (kg / top) * (base - 34);
  const cut = WHO_CUTS[s.value];
  const cutKg = weightAt(cut, h);
  const sel = bars.findIndex((b) => b.key === `c${cut}`);
  const diff = cutKg - w;
  const valueText = `BMI ${cut}`;
  const rows: KitRow[] = [
    { key: "cut", label: t("rowCut"), value: `${cut} (${tw(whoOf(cut).key)})` },
    { key: "kg", label: `${cut} × ${f2(h / 100)}²`, value: `${f1(cutKg)} kg`, isKey: true },
    { key: "you", label: t("rowYou"), value: `${f1(w)} kg` },
    { key: "diff", label: t("rowDiff"), value: `${diff >= 0 ? "+" : "−"}${f1(Math.abs(diff))} kg` },
    { key: "pct", label: t("rowPct"), value: `${diff >= 0 ? "+" : "−"}${f1((Math.abs(diff) / w) * 100)}%` },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={3}
      side={side}
      k="cutoffs"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { cut: ltr(String(cut)), kg: ltr(`${f1(cutKg)} kg`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + slot * (sel + 0.5), y: yk(cutKg) - 26, dir: "horizontal" }} s={s} testId="bmi-c3">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {bars.map((b, bi) => {
            const x = X0 + slot * bi + slot * 0.18;
            const bw = slot * 0.64;
            const on = bi === sel;
            return (
              <g key={b.key}>
                <rect x={x} y={yk(b.kg)} width={bw} height={base - yk(b.kg)} rx={4} style={{ fill: b.color, opacity: b.you || on ? 1 : 0.55, ...lit(on || (b.you && hover === "you")) }} />
                <T x={x + bw / 2} y={yk(b.kg) - 6} text={f1(b.kg)} size={10.5} bold={on || b.you} style={on || b.you ? INK : MUTED} />
                <T x={x + bw / 2} y={base + 16} text={b.label} size={10.5} bold={b.you} style={b.you ? INK : MUTED} />
              </g>
            );
          })}
          <T x={X0} y={14} text="kg" anchor="start" size={10.5} bold />
          <T x={W - X0} y={base + 32} text="BMI" anchor="end" size={10.5} bold />
        </Drawing>
      }
    />
  );
}

// ── 4. Trend line: BMI against height at your weight, reference point = you ──────────────
const HC0 = 140;
const HC1 = 210;
export function BMIHeightCurveCard({ side }: { side: Side }) {
  const { result } = useBMILive();
  // A new height in the calculator re-seeds this card's what-if height.
  return <HeightCurve key={Math.round(result.heightCm)} side={side} />;
}
function HeightCurve({ side }: { side: Side }) {
  const { t, tw } = useCardText("curve");
  const { result } = useBMILive();
  const w = result.weightKg;
  const s = useStepper(clamp(Math.round(result.heightCm), HC0, HC1), { min: HC0, max: HC1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const PL = 44;
  const d = useDrawing(HMIN, s, (x, _y, W) => HC0 + ((x - PL) / (W - PL - 18)) * (HC1 - HC0));
  const { W, H } = d;
  const bLo = bmiOf(w, HC1);
  const bHi = bmiOf(w, HC0);
  const yMin = Math.max(10, Math.floor(bLo - 2));
  const yMax = Math.ceil(bHi + 2);
  const top = 16;
  const base = H - 36;
  const xh = (cm: number) => PL + ((cm - HC0) / (HC1 - HC0)) * (W - PL - 18);
  const yb = (b: number) => base - ((clamp(b, yMin, yMax) - yMin) / (yMax - yMin)) * (base - top);
  const pts = Array.from({ length: 71 }, (_, i) => HC0 + i).map((cm) => `${px2(xh(cm))},${px2(yb(bmiOf(w, cm)))}`).join(" ");
  const cm = s.value;
  const b = bmiOf(w, cm);
  const hNorm = Math.sqrt(w / 24.9) * 100;
  const valueText = `${cm} cm`;
  const rows: KitRow[] = [
    { key: "w", label: t("rowWeight"), value: `${f1(w)} kg` },
    { key: "h", label: t("rowHeight"), value: `${cm} cm` },
    { key: "b", label: `BMI = ${f1(w)} ÷ ${f2(cm / 100)}²`, value: f1(b), isKey: true },
    { key: "you", label: t("rowYou", { h: f1(result.heightCm) }), value: f1(result.bmi) },
    { key: "cls", label: t("rowClass"), value: tw(whoOf(b).key) },
    { key: "hn", label: `√(${f1(w)} ÷ 24.9)`, value: `${f1(hNorm)} cm` },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={4}
      side={side}
      k="curve"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(`${f1(w)} kg`), h: ltr(`${cm} cm`), b: ltr(f1(b)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xh(cm), y: yb(b), dir: "horizontal" }} s={s} testId="bmi-c4">
          {WHO_CLASSES.map((c) => {
            const lo = Math.max(c.min, yMin);
            const hi = Math.min(c.max, yMax);
            if (hi <= lo) return null;
            return <rect key={c.key} x={PL} y={yb(hi)} width={W - PL - 18} height={yb(lo) - yb(hi)} fill={c.color} opacity={0.14} />;
          })}
          {axisTicks(yMin, yMax, base - top, 26).map((v) => (
            <g key={v}>
              <line x1={PL} y1={yb(v)} x2={W - 18} y2={yb(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yb(v) + 4} text={String(v)} anchor="end" size={10.5} />
            </g>
          ))}
          {[140, 150, 160, 170, 180, 190, 200, 210].map((v) => (
            <T key={v} x={xh(v)} y={base + 16} text={String(v)} size={10.5} />
          ))}
          <T x={W - 18} y={base + 32} text="cm" anchor="end" size={10.5} bold />
          <T x={6} y={top - 4} text="BMI" anchor="start" size={10.5} bold />
          <polyline points={pts} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} />
          {hNorm >= HC0 && hNorm <= HC1 && <line x1={xh(hNorm)} y1={top} x2={xh(hNorm)} y2={base} style={{ stroke: "var(--ph-neutral)" }} strokeDasharray="4 4" strokeWidth={hover === "hn" ? 2.5 : 1.5} />}
          <circle cx={xh(clamp(result.heightCm, HC0, HC1))} cy={yb(result.bmi)} r={hover === "you" ? 8 : 6} style={{ fill: "var(--ph-ink)" }} />
          <T x={xh(clamp(result.heightCm, HC0, HC1))} y={yb(result.bmi) - 12} text={`${f1(result.bmi)}`} size={11} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 5. Sensitivity trio: what a ± height-measurement error does to BMI ───────────────────
export function BMISensitivityCard({ side }: { side: Side }) {
  const { t, tw } = useCardText("sensitivity");
  const { result } = useBMILive();
  const h = result.heightCm;
  const w = result.weightKg;
  const s = useStepper(2, { min: 0.5, max: 6, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - 2 * X0)) * 5.5);
  const { W, H } = d;
  const e = s.value;
  const trio = [
    { key: "short", label: `${f1(h - e)} cm`, b: bmiOf(w, h - e) },
    { key: "now", label: `${f1(h)} cm`, b: result.bmi },
    { key: "tall", label: `${f1(h + e)} cm`, b: bmiOf(w, h + e) },
  ];
  const trackY = H - 34;
  const base = trackY - 46;
  const top = Math.max(...trio.map((x) => x.b)) * 1.12;
  const yb = (b: number) => base - (b / top) * (base - 30);
  const colW = (W - 2 * X0) / 3;
  const spread = trio[0].b - trio[2].b;
  const valueText = `± ${f1(e)} cm`;
  const rows: KitRow[] = [
    { key: "e", label: t("rowError"), value: valueText },
    { key: "short", label: `${f1(w)} ÷ ${f2((h - e) / 100)}²`, value: f1(trio[0].b) },
    { key: "now", label: `${f1(w)} ÷ ${f2(h / 100)}²`, value: f1(trio[1].b) },
    { key: "tall", label: `${f1(w)} ÷ ${f2((h + e) / 100)}²`, value: f1(trio[2].b) },
    { key: "spread", label: t("rowSpread"), value: `${f2(spread)}`, isKey: true },
    { key: "cls", label: t("rowClasses"), value: whoOf(trio[0].b).key === whoOf(trio[2].b).key ? t("same") : `${tw(whoOf(trio[2].b).key)} → ${tw(whoOf(trio[0].b).key)}` },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={5}
      side={side}
      k="sensitivity"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { e: ltr(valueText), d: ltr(f2(spread)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 0.5) / 5.5) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmi-c5">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {trio.map((c, ci) => {
            const x = X0 + colW * ci + colW * 0.22;
            const bw = colW * 0.56;
            const on = hover === c.key || (ci === 1 && hover === null);
            return (
              <g key={c.key}>
                <rect x={x} y={yb(c.b)} width={bw} height={base - yb(c.b)} rx={5} style={{ fill: whoOf(c.b).color, opacity: ci === 1 ? 1 : 0.7, ...lit(on) }} />
                <T x={x + bw / 2} y={yb(c.b) - 8} text={`BMI ${f1(c.b)}`} size={12} bold style={INK} />
                <T x={x + bw / 2} y={base + 16} text={c.label} size={10.5} bold={ci === 1} style={ci === 1 ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(e - 0.5) / 5.5} lo="± 0.5 cm" hi="± 6 cm" />
        </Drawing>
      }
    />
  );
}

// ── 6. Formula diagram: w ÷ h² built stage by stage, then Prime and the ponderal index ──
export function BMIFormulaCard({ side }: { side: Side }) {
  const { t } = useCardText("formula");
  const { result } = useBMILive();
  const hm = result.heightCm / 100;
  const w = result.weightKg;
  const s = useStepper(4, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const st = s.value;
  const bmi = w / hm ** 2;
  const stages = [
    { key: "h2", top: `${f2(hm)}²`, bottom: `${f2(hm ** 2)} m²` },
    { key: "bmi", top: `${f1(w)} ÷ ${f2(hm ** 2)}`, bottom: `BMI ${f1(bmi)}` },
    { key: "prime", top: `${f1(bmi)} ÷ 25`, bottom: `Prime ${f2(bmi / 25)}` },
    { key: "pi", top: `${f1(w)} ÷ ${f2(hm)}³`, bottom: `PI ${f1(w / hm ** 3)}` },
  ];
  const trackY = H - 34;
  const boxW = Math.min(150, (W - 2 * X0 - 3 * 18) / 4);
  const gap = (W - 2 * X0 - 4 * boxW) / 3;
  const by = 66;
  const bh = trackY - 50 - by;
  const valueText = t(`stage${st}`);
  const rows: KitRow[] = [
    { key: "in", label: t("rowInputs"), value: `${f1(w)} kg · ${f2(hm)} m` },
    { key: "h2", label: `h² = ${f2(hm)} × ${f2(hm)}`, value: `${f2(hm ** 2)} m²`, isKey: st === 1 },
    { key: "bmi", label: `BMI = ${f1(w)} ÷ ${f2(hm ** 2)}`, value: `${f1(bmi)} kg/m²`, isKey: st === 2 },
    { key: "prime", label: `Prime = ${f1(bmi)} ÷ 25`, value: f2(bmi / 25), isKey: st === 3 },
    { key: "pi", label: `PI = ${f1(w)} ÷ ${f2(hm)}³`, value: `${f1(w / hm ** 3)} kg/m³`, isKey: st === 4 },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={6}
      side={side}
      k="formula"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { stage: valueText })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((st - 1) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmi-c6">
          <T x={W / 2} y={30} text={`BMI = w ÷ h² = ${f1(w)} ÷ ${f2(hm)}² = ${f1(bmi)}`} size={14} bold style={INK} />
          {stages.map((g, gi) => {
            const x = X0 + gi * (boxW + gap);
            const shown = gi < st;
            const on = gi === st - 1 || hover === g.key;
            return (
              <g key={g.key} opacity={shown ? 1 : 0.28}>
                <rect x={x} y={by} width={boxW} height={bh} rx={10} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + boxW / 2} y={by + 22} text={String(gi + 1)} size={11} bold />
                <T x={x + boxW / 2} y={by + bh / 2} text={g.top} size={11} />
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

// ── 7. Balance: your weight against the weight of a chosen target BMI ────────────────────
export function BMIBalanceCard({ side }: { side: Side }) {
  const { t } = useCardText("balance");
  const { result } = useBMILive();
  const h = result.heightCm;
  const w = result.weightKg;
  const s = useStepper(BMI_MID, { min: 18.5, max: 24.9, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => 18.5 + ((x - X0) / (W - 2 * X0)) * 6.4);
  const { W, H } = d;
  const tb = s.value;
  const tw2 = weightAt(tb, h);
  const diff = w - tw2;
  const tilt = clamp(diff / 40, -1, 1) * 16;
  const rad = (tilt * Math.PI) / 180;
  const trackY = H - 34;
  const cx = W / 2;
  const pivotY = 70;
  const arm = Math.min(W / 2 - 70, 190);
  const lx = px2(cx - arm * Math.cos(rad));
  const ly = px2(pivotY + arm * Math.sin(rad));
  const rx = px2(cx + arm * Math.cos(rad));
  const ry = px2(pivotY - arm * Math.sin(rad));
  const pan = (x: number, y: number, kg: number, label: string, color: string, on: boolean) => (
    <g>
      <line x1={x} y1={y} x2={x - 34} y2={y + 46} style={LINE} />
      <line x1={x} y1={y} x2={x + 34} y2={y + 46} style={LINE} />
      <path d={`M ${x - 46} ${y + 46} Q ${x} ${y + 72} ${x + 46} ${y + 46} Z`} style={{ fill: color, ...lit(on) }} opacity={0.9} />
      <T x={x} y={y + 92} text={`${f1(kg)} kg`} size={13} bold style={INK} />
      <T x={x} y={y + 108} text={label} size={10.5} />
    </g>
  );
  const valueText = `BMI ${f1(tb)}`;
  const rows: KitRow[] = [
    { key: "tb", label: t("rowTarget"), value: f1(tb) },
    { key: "tw", label: `${f1(tb)} × ${f2(h / 100)}²`, value: `${f1(tw2)} kg` },
    { key: "w", label: t("rowYou"), value: `${f1(w)} kg` },
    { key: "diff", label: diff > 0 ? t("rowLose") : t("rowGain"), value: `${f1(Math.abs(diff))} kg`, isKey: true },
    { key: "pct", label: t("rowPct"), value: `${f1((Math.abs(diff) / w) * 100)}%` },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={7}
      side={side}
      k="balance"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t(diff > 0 ? "captionLose" : "captionGain", { b: ltr(f1(tb)), kg: ltr(`${f1(Math.abs(diff))} kg`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((tb - 18.5) / 6.4) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmi-c7">
          <path d={`M ${cx} ${pivotY} L ${cx - 22} ${trackY - 46} L ${cx + 22} ${trackY - 46} Z`} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
          <circle cx={cx} cy={pivotY} r={6} style={{ fill: "var(--ph-ink)" }} />
          {pan(lx, ly, w, t("you"), whoOf(result.bmi).color, hover === "w")}
          {pan(rx, ry, tw2, `BMI ${f1(tb)}`, "#10b981", hover === "tw")}
          <T x={cx} y={24} text={`${diff > 0 ? "−" : "+"}${f1(Math.abs(diff))} kg`} size={15} bold style={INK} />
          <SvgTrack W={W} y={trackY} frac={(tb - 18.5) / 6.4} lo="BMI 18.5" hi="BMI 24.9" />
        </Drawing>
      }
    />
  );
}

// ── 8. Timeline: weeks to the healthy range at a steady weekly rate ──────────────────────
export function BMITimelineCard({ side }: { side: Side }) {
  const { t, tw } = useCardText("timeline");
  const { result } = useBMILive();
  const h = result.heightCm;
  const w = result.weightKg;
  const s = useStepper(0.5, { min: 0.25, max: 1, step: 0.25 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.25 + ((x - X0) / (W - 2 * X0)) * 0.75);
  const { W, H } = d;
  const rate = s.value;
  const goalKg = result.bmi > 24.9 ? result.healthyMaxWeight : result.bmi < 18.5 ? result.healthyMinWeight : weightAt(BMI_MID, h);
  const total = goalKg - w;
  const weeks = Math.abs(total) / rate;
  const goalBmi = bmiOf(goalKg, h);
  const lo = Math.min(result.bmi, goalBmi);
  const hi = Math.max(result.bmi, goalBmi);
  const crossed = WHO_CUTS.filter((c) => c > lo && c < hi && c !== 25 && c !== 18.5);
  const stations = [
    { key: "start", kg: w, b: result.bmi, label: t("start") },
    ...crossed.map((c) => ({ key: `c${c}`, kg: weightAt(c, h), b: c, label: tw(whoOf(total < 0 ? c - 0.01 : c).key) })),
    { key: "goal", kg: goalKg, b: goalBmi, label: t("goal") },
  ].sort((a, b) => (total < 0 ? b.kg - a.kg : a.kg - b.kg));
  const trackY = H - 34;
  const lineY = (trackY - 30) / 2 + 20;
  const span = Math.max(weeks, 1);
  const xw = (wk: number) => X0 + 20 + (wk / span) * (W - 2 * X0 - 40);
  const valueText = `${f2(rate)} kg/wk`;
  const rows: KitRow[] = [
    { key: "rate", label: t("rowRate"), value: valueText },
    { key: "goal", label: t("rowGoal"), value: `${f1(goalKg)} kg · BMI ${f1(goalBmi)}` },
    { key: "total", label: `${f1(goalKg)} − ${f1(w)}`, value: `${total >= 0 ? "+" : "−"}${f1(Math.abs(total))} kg` },
    { key: "weeks", label: `${f1(Math.abs(total))} ÷ ${f2(rate)}`, value: t("weeks", { n: Math.ceil(weeks) }), isKey: true },
    { key: "months", label: t("rowMonths"), value: f1(weeks / 4.345) },
  ];
  return (
    <Card tool="bmi-calculator" idPrefix="bmi"
      n={8}
      side={side}
      k="timeline"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { r: ltr(valueText), n: ltr(String(Math.ceil(weeks))) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((rate - 0.25) / 0.75) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmi-c8">
          <line x1={xw(0)} y1={lineY} x2={xw(weeks)} y2={lineY} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
          {stations.map((st, si) => {
            const wk = Math.abs(st.kg - w) / rate;
            const x = xw(wk);
            const up = si % 2 === 0;
            const on = hover === st.key || (st.key === "goal" && hover === "weeks");
            return (
              <g key={st.key}>
                <circle cx={x} cy={lineY} r={st.key === "goal" || st.key === "start" ? 10 : 7} style={{ fill: whoOf(st.b).color, ...lit(on) }} />
                <T x={x} y={up ? lineY - 22 : lineY + 30} text={st.label} size={10.5} bold style={INK} />
                <T x={x} y={up ? lineY - 38 : lineY + 46} text={`${f1(st.kg)} kg · ${t("wk", { n: Math.round(wk) })}`} size={10.5} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(rate - 0.25) / 0.75} lo="0.25 kg/wk" hi="1 kg/wk" />
        </Drawing>
      }
    />
  );
}
