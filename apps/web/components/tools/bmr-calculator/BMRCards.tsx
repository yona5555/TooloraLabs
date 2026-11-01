"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { axisTicks, flowRows, INK, labelW, LINE, lit, MUTED, px2, SvgLabel as T, wrapLabel } from "@/components/tool-ui/indicator-kit/SvgBits";
import { Drawing, useDrawing } from "@/components/tool-ui/indicator-kit/Drawing";
import { clamp, f1, f2, snap } from "@/components/tool-ui/indicator-kit/format";
import { Card } from "../macro-calculator/MacroCards";
import { useBMRLive } from "./BMRLiveContext";
import { BANDS, CUTS, DOMAIN, ORGANS, PAL, ageForBmr, bandOf, bmrAt, coefOf, cunningham, deurenberg, k0, katchMcArdle, weightForBmr, type Which } from "./bmr";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The eight BMR indicator cards (§31 library). All read the calculator's last valid measurements
 * and both estimates through BMRLiveContext, and follow the formula the Result headline uses.
 * Two write back: the zone strip drags the weight field and the age curve drags the age field
 * (inputs, Result table and 3D figure follow). The others keep a what-if value of their own on
 * top of the live result.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.bmr-calculator.visuals.${key}`),
    tr: useTranslations("tools.bmr-calculator.result.range"),
    tl: useTranslations("tools.bmr-calculator.formulas.labels"),
  };
}

const nameKey = (w: Which) => (w === "hb" ? "harrisBenedict" : "mifflinStJeor");
const other = (w: Which): Which => (w === "hb" ? "msj" : "hb");
const signed = (v: number, unit: string) => `${v >= 0 ? "+" : "−"}${k0(Math.abs(v))} ${unit}`;

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

/** A stepper whose value lives in the calculator (weight or age field). */
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

/** Bar-chart floor: a round kcal value under the lowest bar, so small differences stay visible. */
const floorOf = (vals: number[]) => Math.max(0, Math.floor((Math.min(...vals) * 0.8) / 100) * 100);

// ── 1. Zone strip (wow): drag the body weight across the three BMR ranges (writes the calculator) ─
export function BMRZoneStripCard({ side }: { side: Side }) {
  const { t, tr, tl } = useCardText("zone");
  const { body: b, which, bmr, hb, msj, setWeightKg } = useBMRLive();
  const [D0, D1] = DOMAIN;
  const wMin = clamp(Math.ceil(weightForBmr(b, D0 + 20, which)), 20, 199);
  const wMax = clamp(Math.floor(weightForBmr(b, D1 - 20, which)), wMin + 1, 250);
  const s = useSharedStepper(b.weightKg, setWeightKg, wMin, wMax, 0.5);
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const d = useDrawing(HMIN, s, (x, _y, W) => weightForBmr(b, D0 + ((x - X0) / (W - 2 * X0)) * (D1 - D0), which));
  const { W, H } = d;
  const xb = (p: number) => X0 + ((clamp(p, D0, D1) - D0) / (D1 - D0)) * (W - 2 * X0);
  const band = bandOf(bmr);
  const sy = H / 2 - 4;
  const SH = 34;
  const up = CUTS.find((c) => c > bmr);
  const down = [...CUTS].reverse().find((c) => c <= bmr);
  const kgTicks = axisTicks(Math.max(1, weightForBmr(b, D0, which)), weightForBmr(b, D1, which), W - 2 * X0, 50);
  const valueText = `${f1(b.weightKg)} kg`;
  const otherVal = which === "hb" ? msj : hb;
  const rows: KitRow[] = [
    { key: "w", label: t("rowWeight"), value: valueText, isKey: true },
    { key: "bmr", label: tl(nameKey(which)), value: `${k0(bmr)} kcal` },
    { key: "range", label: t("rowRange"), value: tr(band.key) },
    { key: "up", label: t("rowUp", { kcal: up ? k0(up) : "—" }), value: up ? `+${f1(weightForBmr(b, up, which) - b.weightKg)} kg` : "—" },
    { key: "down", label: t("rowDown", { kcal: down ? k0(down) : "—" }), value: down ? `−${f1(b.weightKg - weightForBmr(b, down, which))} kg` : "—" },
    { key: "other", label: tl(nameKey(other(which))), value: `${k0(otherVal)} kcal` },
  ];
  return (
    <Card phoneRole="visual" tool="bmr-calculator" idPrefix="bmr"
      n={1}
      side={side}
      k="zone"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(valueText), kcal: ltr(`${k0(bmr)} kcal`), range: tr(band.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xb(bmr), y: sy, dir: "horizontal" }} s={s} testId="bmr-c1">
          {/* weight axis on top: the same strip read in this body's kilograms */}
          <line x1={X0} y1={sy - SH / 2 - 26} x2={W - X0} y2={sy - SH / 2 - 26} style={LINE} strokeWidth={1} opacity={0.5} />
          {kgTicks.map((kg) => {
            const x = xb(bmrAt({ ...b, weightKg: kg }, which));
            if (kg <= 0 || x < X0 + 8 || x > W - X0 - 8) return null;
            return (
              <g key={kg}>
                <line x1={x} y1={sy - SH / 2 - 30} x2={x} y2={sy - SH / 2 - 22} style={LINE} />
                <T x={x} y={sy - SH / 2 - 36} text={`${kg}`} size={12} />
              </g>
            );
          })}
          <T x={X0} y={sy - SH / 2 - 52} text={t("axisWeight")} anchor="start" size={12} bold />
          {BANDS.map((c) => {
            const a = xb(c.min);
            const z = xb(c.max);
            const on = c.key === band.key;
            const name = tr(c.key);
            // In the active band, centre the name in the wider side of the handle so it is never covered.
            const hx = xb(bmr);
            const lx = on && hx > a && hx < z ? (hx - a > z - hx ? (a + hx - 14) / 2 : (hx + 14 + z) / 2) : (a + z) / 2;
            const room = on && hx > a && hx < z ? Math.max(hx - a, z - hx) - 14 : z - a;
            return (
              <g key={c.key}>
                <rect x={a} y={sy - SH / 2} width={Math.max(0, z - a)} height={SH} style={{ fill: c.color, opacity: on ? 1 : 0.55, ...lit(on && hover === "range") }} />
                {room > name.length * 6.6 + 8 && (
                  <text style={{ fontSize: svgPx(12) }} x={lx} y={sy + 4} fontWeight={800} textAnchor="middle" fill="#fff">
                    {name}
                  </text>
                )}
              </g>
            );
          })}
          <rect x={X0} y={sy - SH / 2} width={W - 2 * X0} height={SH} fill="none" style={LINE} rx={3} />
          {[D0, ...CUTS, D1].map((c) => (
            <T key={c} x={xb(c)} y={sy + SH / 2 + 24} text={k0(c)} size={12} bold={CUTS.includes(c)} style={CUTS.includes(c) ? INK : MUTED} />
          ))}
          <T x={X0} y={sy + SH / 2 + 44} text={t("axisKcal")} anchor="start" size={12} bold />
          {/* the other formula as a hollow marker on the same strip */}
          <circle cx={xb(otherVal)} cy={sy + SH / 2 + 6} r={hover === "other" ? 6 : 4.5} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} />
          <line x1={xb(bmr)} y1={sy - SH / 2 - 6} x2={xb(bmr)} y2={sy + SH / 2 + 6} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <T x={clamp(xb(bmr), X0 + 80, W - X0 - 80)} y={H - 10} text={`${f1(b.weightKg)} kg · ${k0(bmr)} kcal`} size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 2. Gradient gauge: BMR after a what-if change in age ──────────────────────────────────────
export function BMRGaugeCard({ side }: { side: Side }) {
  const { t, tr } = useCardText("gauge");
  const { body: b, which, bmr } = useBMRLive();
  const [D0, D1] = DOMAIN;
  const s = useStepper(10, { min: -20, max: 30, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const geo = (W: number, H: number) => {
    const R = Math.max(70, Math.min(W / 2 - 46, H - 74));
    return { cx: W / 2, cy: H - 46, R };
  };
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const { cx, cy } = geo(W, H);
    const a = Math.atan2(Math.max(0, cy - y), x - cx);
    const p = D0 + (1 - a / Math.PI) * (D1 - D0);
    return ageForBmr(b, p, which) - b.age;
  });
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const ang = (p: number) => Math.PI * (1 - (clamp(p, D0, D1) - D0) / (D1 - D0));
  const pt = (p: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(p))), px2(cy - r * Math.sin(ang(p)))];
  const arc = (p0: number, p1: number, r: number) => {
    const [x0, y0] = pt(p0, r);
    const [x1, y1] = pt(p1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const age2 = clamp(b.age + s.value, 1, 120);
  const bmr2 = bmrAt({ ...b, age: age2 }, which);
  const k = coefOf(which, b.gender);
  const [nx, ny] = pt(bmr2, R - 18);
  const [gx, gy] = pt(bmr, R - 18);
  const valueText = `${s.value > 0 ? "+" : ""}${s.value} y`;
  const band2 = bandOf(bmr2);
  const rows: KitRow[] = [
    { key: "now", label: t("rowNow", { age: b.age }), value: `${k0(bmr)} kcal` },
    { key: "d", label: t("rowDelta"), value: valueText },
    { key: "age", label: t("rowAge"), value: `${age2}` },
    { key: "bmr2", label: t("rowBmr", { age: age2 }), value: `${k0(bmr2)} kcal`, isKey: true },
    { key: "diff", label: `${k.a} × ${Math.abs(age2 - b.age)}`, value: signed(bmr2 - bmr, "kcal") },
    { key: "range", label: t("rowRange"), value: tr(band2.key) },
    { key: "decade", label: t("rowDecade"), value: `−${f1(k.a * 10)} kcal` },
  ];
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={2}
      side={side}
      k="gauge"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { age: ltr(String(age2)), kcal: ltr(`${k0(bmr2)} kcal`), range: tr(band2.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`${k0(bmr2)} kcal`} handle={{ x: nx, y: ny, dir: "circular" }} s={s} testId="bmr-c2">
          {BANDS.map((c) => {
            const on = band2.key === c.key;
            return <path key={c.key} d={arc(c.min, c.max, R)} fill="none" stroke={c.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.6} style={hover === "range" && on ? { filter: "brightness(1.15)" } : undefined} />;
          })}
          {[D0, ...CUTS, D1].map((p) => {
            const [x, y] = pt(p, R + 24);
            return <T key={p} x={x} y={y + 4} text={k0(p)} size={12} />;
          })}
          <line x1={cx} y1={cy} x2={gx} y2={gy} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} strokeDasharray="4 4" opacity={hover === "now" ? 1 : 0.7} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "bmr2" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`${k0(bmr2)} kcal`} size={15} bold style={INK} />
          <T x={cx} y={cy + 42} text={`${b.age} → ${age2}`} size={12} />
        </Drawing>
      }
    />
  );
}

// ── 3. Stacked bar: where the resting energy goes, organ by organ, over a chosen span of hours ─
export function BMROrganCard({ side }: { side: Side }) {
  const { t } = useCardText("organs");
  const { bmr } = useBMRLive();
  const s = useStepper(24, { min: 1, max: 24, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 24);
  const { W, H } = d;
  const h = s.value;
  const total = (bmr * h) / 24;
  const xk = (kcal: number) => X0 + (clamp(kcal, 0, bmr) / bmr) * (W - 2 * X0);
  const by = 64;
  const bh = 50;
  const gy = by + bh + 34;
  const segs = ORGANS.map((o, i) => ({
    key: o.key,
    from: total * ORGANS.slice(0, i).reduce((sum, x) => sum + x.share, 0),
    kcal: total * o.share,
    color: o.color,
    share: o.share,
  }));
  const valueText = `${h} h`;
  const organRow = (key: (typeof ORGANS)[number]["key"]) => {
    const o = ORGANS.find((x) => x.key === key)!;
    return { key, label: `${t(key)} (${Math.round(o.share * 100)}%)`, value: `${k0(total * o.share)} kcal` };
  };
  const rows: KitRow[] = [
    { key: "h", label: t("rowHours"), value: valueText },
    { key: "total", label: `${k0(bmr)} × ${h} ÷ 24`, value: `${k0(total)} kcal`, isKey: true },
    organRow("muscle"),
    organRow("liver"),
    organRow("brain"),
    organRow("heart"),
    organRow("kidneys"),
  ];
  const ticks = axisTicks(0, bmr, W - 2 * X0, 56);
  // legend packed in as many rows as the width needs (12px labels never collide); the box grows with them
  const legend = segs.map((sg) => `${t(sg.key)} ${Math.round(sg.share * 100)}%`);
  const flow = flowRows(legend.map((s) => 18 + labelW(s)), W - 2 * X0);
  const extraH = Math.max(0, flow.rows - 2) * 20;
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={3}
      side={side}
      k="organs"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { h: ltr(valueText), kcal: ltr(`${k0(total)} kcal`), brain: ltr(`${k0(total * 0.2)} kcal`) })}
      visual={
        <Drawing {...d} hMin={HMIN + extraH} label={t("handle")} valueText={valueText} handle={{ x: xk(total), y: by + bh / 2, dir: "horizontal" }} s={s} testId="bmr-c3">
          <T x={W / 2} y={28} text={`${h} h → ${k0(total)} kcal`} size={14} bold style={INK} />
          {/* the full day as a ghost outline */}
          <rect x={xk(0)} y={by - 8} width={xk(bmr) - xk(0)} height={bh + 16} rx={8} fill="none" style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="5 4" opacity={0.6} />
          {segs.map((sg) => {
            const a = xk(sg.from);
            const z = xk(sg.from + sg.kcal);
            return (
              <g key={sg.key}>
                <rect x={a} y={by} width={Math.max(0, z - a)} height={bh} style={{ fill: sg.color, ...lit(hover === sg.key) }} />
                {z - a > 34 && (
                  <text style={{ fontSize: svgPx(12) }} x={(a + z) / 2} y={by + bh / 2 + 4} fontWeight={800} textAnchor="middle" fill="#fff" className="tabular-nums">
                    {k0(sg.kcal)}
                  </text>
                )}
              </g>
            );
          })}
          <line x1={X0} y1={gy - 14} x2={W - X0} y2={gy - 14} style={LINE} strokeWidth={1} />
          {ticks.map((v) => (
            <g key={v}>
              <line x1={xk(v)} y1={gy - 18} x2={xk(v)} y2={gy - 10} style={LINE} />
              <T x={xk(v)} y={gy + 2} text={k0(v)} size={12} />
            </g>
          ))}
          <T x={W - X0} y={gy + 18} text="kcal" anchor="end" size={12} bold />
          {/* legend, packed rows */}
          {segs.map((sg, i) => {
            const lx = X0 + flow.at[i].x;
            const ly = H - 24 - (flow.rows - 1 - flow.at[i].row) * 20;
            return (
              <g key={`lg${sg.key}`}>
                <rect x={lx} y={ly} width={12} height={12} rx={3} fill={sg.color} />
                <T x={lx + 18} y={ly + 10} text={legend[i]} anchor="start" size={12} bold={hover === sg.key} style={hover === sg.key ? INK : MUTED} />
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}

// ── 4. Trend line (wow): BMR against age for both formulas; drag the point (writes the age field) ─
const A0 = 18;
const A1 = 90;
export function BMRAgeCurveCard({ side }: { side: Side }) {
  const { t, tr, tl } = useCardText("ageCurve");
  const { body: b, which, bmr, setAge } = useBMRLive();
  const s = useSharedStepper(b.age, setAge, A0, A1, 1);
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const PL = 50;
  const d = useDrawing(HMIN, s, (x, _y, W) => A0 + ((x - PL) / (W - PL - 18)) * (A1 - A0));
  const { W, H } = d;
  const top = 18;
  const base = H - 40;
  const at = (age: number, w: Which) => bmrAt({ ...b, age }, w);
  const ends = [at(A0, "hb"), at(A1, "hb"), at(A0, "msj"), at(A1, "msj"), bmr];
  const yLo = Math.floor((Math.min(...ends) - 60) / 100) * 100;
  const yHi = Math.ceil((Math.max(...ends) + 60) / 100) * 100;
  const xa = (age: number) => PL + ((clamp(age, A0, A1) - A0) / (A1 - A0)) * (W - PL - 18);
  const yk = (kcal: number) => base - ((clamp(kcal, yLo, yHi) - yLo) / (yHi - yLo)) * (base - top);
  const line = (w: Which) => `${px2(xa(A0))},${px2(yk(at(A0, w)))} ${px2(xa(A1))},${px2(yk(at(A1, w)))}`;
  const age = clamp(b.age, A0, A1);
  const k = coefOf(which, b.gender);
  const o = other(which);
  const at25 = at(25, which);
  const valueText = `${b.age}`;
  const colorOf = (w: Which) => (w === "hb" ? "#3b82f6" : "#10b981");
  const rows: KitRow[] = [
    { key: "age", label: t("rowAge"), value: valueText },
    { key: "you", label: tl(nameKey(which)), value: `${k0(bmr)} kcal`, isKey: true },
    { key: "other", label: tl(nameKey(o)), value: `${k0(at(b.age, o))} kcal` },
    { key: "slope", label: t("rowSlope"), value: `−${f2(k.a)} kcal` },
    { key: "since", label: t("rowSince25"), value: signed(bmr - at25, "kcal") },
    { key: "range", label: t("rowRange"), value: tr(bandOf(bmr).key) },
  ];
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={4}
      side={side}
      k="ageCurve"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { age: ltr(valueText), kcal: ltr(`${k0(bmr)} kcal`), slope: ltr(`${f1(k.a * 10)} kcal`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xa(age), y: yk(bmr), dir: "horizontal" }} s={s} testId="bmr-c4">
          {BANDS.map((c) => {
            const a = Math.max(c.min, yLo);
            const z = Math.min(c.max, yHi);
            if (z <= a) return null;
            return <rect key={c.key} x={PL} y={yk(z)} width={W - PL - 18} height={yk(a) - yk(z)} fill={c.color} opacity={hover === "range" && c.key === bandOf(bmr).key ? 0.3 : 0.12} />;
          })}
          {axisTicks(yLo, yHi, base - top, 28).map((v) => (
            <g key={v}>
              <line x1={PL} y1={yk(v)} x2={W - 18} y2={yk(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yk(v) + 4} text={k0(v)} anchor="end" size={12} />
            </g>
          ))}
          {axisTicks(A0, A1, W - PL - 18, 40).map((v) => (
            <T key={v} x={xa(v)} y={base + 16} text={String(v)} size={12} />
          ))}
          <T x={W - 18} y={base + 32} text={t("axisAge")} anchor="end" size={12} bold />
          <polyline points={line(o)} fill="none" stroke={colorOf(o)} strokeWidth={hover === "other" ? 3 : 2} strokeDasharray="6 5" />
          <polyline points={line(which)} fill="none" stroke={colorOf(which)} strokeWidth={hover === "slope" ? 4.5 : 3.5} />
          <line x1={xa(age)} y1={yk(bmr)} x2={xa(age)} y2={base} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="3 4" />
          {b.age > 25 && <circle cx={xa(25)} cy={yk(at25)} r={hover === "since" ? 6 : 4} fill="none" stroke={colorOf(which)} strokeWidth={2} />}
          <circle cx={xa(age)} cy={yk(at(b.age, o))} r={hover === "other" ? 6 : 4.5} fill={colorOf(o)} />
          <T x={xa(age)} y={Math.max(top + 12, yk(Math.max(bmr, at(b.age, o))) - 14)} text={`${k0(bmr)} kcal`} size={12} bold style={INK} />
          {/* legend */}
          {([which, o] as Which[]).map((w, i) => (
            <g key={w}>
              <line x1={PL + 8 + i * 150} y1={top + 6} x2={PL + 30 + i * 150} y2={top + 6} stroke={colorOf(w)} strokeWidth={3} strokeDasharray={i ? "6 5" : undefined} />
              <T x={PL + 36 + i * 150} y={top + 10} text={tl(nameKey(w))} anchor="start" size={12} bold={i === 0} />
            </g>
          ))}
        </Drawing>
      }
    />
  );
}

// ── 5. Sensitivity trio: what a ± scale error on the weight does to BMR ───────────────────────
export function BMRSensitivityCard({ side }: { side: Side }) {
  const { t, tr } = useCardText("sensitivity");
  const { body: b, which, bmr } = useBMRLive();
  const s = useStepper(2, { min: 0.5, max: 10, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - 2 * X0)) * 9.5);
  const { W, H } = d;
  const e = s.value;
  const k = coefOf(which, b.gender);
  const trio = [
    { key: "light", label: `${f1(b.weightKg - e)} kg`, v: bmrAt({ ...b, weightKg: Math.max(1, b.weightKg - e) }, which) },
    { key: "now", label: `${f1(b.weightKg)} kg`, v: bmr },
    { key: "heavy", label: `${f1(b.weightKg + e)} kg`, v: bmrAt({ ...b, weightKg: b.weightKg + e }, which) },
  ];
  const trackY = H - 34;
  const base = trackY - 46;
  const lo = floorOf(trio.map((x) => x.v));
  const hi = Math.max(...trio.map((x) => x.v)) * 1.06;
  const yb = (v: number) => base - ((v - lo) / (hi - lo)) * (base - 30);
  const colW = (W - 2 * X0) / 3;
  const spread = trio[2].v - trio[0].v;
  const valueText = `± ${f1(e)} kg`;
  const same = bandOf(trio[0].v).key === bandOf(trio[2].v).key;
  const rows: KitRow[] = [
    { key: "e", label: t("rowError"), value: valueText },
    { key: "light", label: t("rowAt", { w: f1(b.weightKg - e) }), value: `${k0(trio[0].v)} kcal` },
    { key: "now", label: t("rowAt", { w: f1(b.weightKg) }), value: `${k0(trio[1].v)} kcal` },
    { key: "heavy", label: t("rowAt", { w: f1(b.weightKg + e) }), value: `${k0(trio[2].v)} kcal` },
    { key: "spread", label: `2 × ${f1(e)} × ${k.w}`, value: `${k0(spread)} kcal`, isKey: true },
    { key: "range", label: t("rowRanges"), value: same ? t("same") : `${tr(bandOf(trio[0].v).key)} → ${tr(bandOf(trio[2].v).key)}` },
  ];
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={5}
      side={side}
      k="sensitivity"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { e: ltr(valueText), d: ltr(`${k0(spread)} kcal`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 0.5) / 9.5) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmr-c5">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          <T x={X0} y={base - 6} text={k0(lo)} anchor="start" size={12} />
          {trio.map((c, ci) => {
            const x = X0 + colW * ci + colW * 0.22;
            const bw = colW * 0.56;
            const on = hover === c.key || (ci === 1 && hover === null);
            return (
              <g key={c.key}>
                <rect x={x} y={yb(c.v)} width={bw} height={Math.max(0, base - yb(c.v))} rx={5} style={{ fill: bandOf(c.v).color, opacity: ci === 1 ? 1 : 0.7, ...lit(on) }} />
                <T x={x + bw / 2} y={yb(c.v) - 8} text={`${k0(c.v)}`} size={12} bold style={INK} />
                <T x={x + bw / 2} y={base + 16} text={c.label} size={12} bold={ci === 1} style={ci === 1 ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(e - 0.5) / 9.5} lo="± 0.5 kg" hi="± 10 kg" />
        </Drawing>
      }
    />
  );
}

// ── 6. Formula diagram: the chosen equation built term by term ────────────────────────────────
export function BMRFormulaCard({ side }: { side: Side }) {
  const { t, tl } = useCardText("formula");
  const { body: b, which, bmr } = useBMRLive();
  const s = useStepper(4, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const st = s.value;
  const k = coefOf(which, b.gender);
  const tw = k.w * b.weightKg;
  const th = k.h * b.heightCm;
  const ta = k.a * b.age;
  const cum = [tw, tw + th, tw + th - ta, tw + th - ta + k.c];
  const cSign = k.c < 0 ? "−" : "+";
  const stages = [
    { key: "w", top: `${k.w} × ${f1(b.weightKg)}`, bottom: k0(cum[0]) },
    { key: "h", top: `+ ${k.h} × ${f1(b.heightCm)}`, bottom: k0(cum[1]) },
    { key: "a", top: `− ${k.a} × ${b.age}`, bottom: k0(cum[2]) },
    { key: "c", top: `${cSign} ${Math.abs(k.c)}`, bottom: `${k0(cum[3])} kcal` },
  ];
  const trackY = H - 34;
  const boxW = Math.min(160, (W - 2 * X0 - 3 * 18) / 4);
  const gap = (W - 2 * X0 - 4 * boxW) / 3;
  const by = 62;
  const bh = trackY - 50 - by;
  const valueText = t(`stage${st}`);
  const eq = which === "msj" ? `BMR = ${k.w}·kg + ${k.h}·cm − ${k.a}·age ${cSign} ${Math.abs(k.c)}` : `BMR = ${k.c} + ${k.w}·kg + ${k.h}·cm − ${k.a}·age`;
  const rows: KitRow[] = [
    { key: "w", label: `${t("rowWeight")} = ${k.w} × ${f1(b.weightKg)}`, value: `${f1(tw)} kcal`, isKey: st === 1 },
    { key: "h", label: `${t("rowHeight")} = ${k.h} × ${f1(b.heightCm)}`, value: `+${f1(th)} kcal`, isKey: st === 2 },
    { key: "a", label: `${t("rowAge")} = ${k.a} × ${b.age}`, value: `−${f1(ta)} kcal`, isKey: st === 3 },
    { key: "c", label: t(b.gender === "male" ? "rowConstMale" : "rowConstFemale"), value: `${cSign}${f1(Math.abs(k.c))} kcal`, isKey: false },
    { key: "bmr", label: tl(nameKey(which)), value: `${k0(bmr)} kcal`, isKey: st === 4 },
  ];
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={6}
      side={side}
      k="formula"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { stage: valueText, formula: tl(nameKey(which)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((st - 1) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmr-c6">
          {wrapLabel(eq, W - 2 * X0, 13).map((line, li, all) => (
            <T key={li} x={W / 2} y={30 - (all.length - 1) * 16 + li * 16} text={line} size={13} bold style={INK} />
          ))}
          {stages.map((sg, gi) => {
            const x = X0 + gi * (boxW + gap);
            const shown = gi < st;
            const on = gi === st - 1 || hover === sg.key || (gi === 3 && hover === "bmr");
            return (
              <g key={sg.key} opacity={shown ? 1 : 0.28}>
                <rect x={x} y={by} width={boxW} height={bh} rx={10} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + boxW / 2} y={by + 22} text={String(gi + 1)} size={12} bold />
                {wrapLabel(sg.top, boxW - 6).map((line, li, all) => (
                  <T key={li} x={x + boxW / 2} y={by + bh / 2 - (all.length - 1) * 14 + li * 14} text={line} size={12} />
                ))}
                <T x={x + boxW / 2} y={by + bh / 2 + 22} text={sg.bottom} size={12} bold style={INK} />
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

// ── 7. Labeled bars: four equations side by side; the lean-mass ones follow a body-fat slider ──
const BF0 = 5;
const BF1 = 50;
export function BMREquationsCard({ side }: { side: Side }) {
  const { body: b } = useBMRLive();
  // A new weight, height, age or sex re-seeds the body-fat estimate.
  return <Equations key={`${b.gender}-${b.weightKg}-${b.heightCm}-${b.age}`} side={side} />;
}
function Equations({ side }: { side: Side }) {
  const { t, tl } = useCardText("equations");
  const { body: b, hb, msj } = useBMRLive();
  const seed = clamp(Math.round(deurenberg(b) * 2) / 2, BF0, BF1);
  const s = useStepper(seed, { min: BF0, max: BF1, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => BF0 + ((x - X0) / (W - 2 * X0)) * (BF1 - BF0));
  const { W, H } = d;
  const bf = s.value;
  const lbm = b.weightKg * (1 - bf / 100);
  const km = katchMcArdle(lbm);
  const cu = cunningham(lbm);
  const bars = [
    { key: "hb", label: "H-B", v: hb, color: "#3b82f6" },
    { key: "msj", label: "MSJ", v: msj, color: "#10b981" },
    { key: "km", label: "K-M", v: km, color: "#f59e0b" },
    { key: "cu", label: "Cunn.", v: cu, color: "#ec4899" },
  ];
  const vals = bars.map((x) => x.v);
  const spread = Math.max(...vals) - Math.min(...vals);
  const trackY = H - 34;
  const base = trackY - 46;
  const lo = floorOf(vals);
  const hi = Math.max(...vals) * 1.08;
  const yb = (v: number) => base - ((v - lo) / (hi - lo)) * (base - 26);
  const colW = (W - 2 * X0) / bars.length;
  const valueText = `${f1(bf)}%`;
  const rows: KitRow[] = [
    { key: "bf", label: t("rowBf", { est: f1(deurenberg(b)) }), value: valueText },
    { key: "lbm", label: `${t("rowLbm")} = ${f1(b.weightKg)} × (1 − ${f1(bf)}%)`, value: `${f1(lbm)} kg` },
    { key: "km", label: `${t("rowKatch")} = 370 + 21.6 × ${f1(lbm)}`, value: `${k0(km)} kcal` },
    { key: "cu", label: `${t("rowCunningham")} = 500 + 22 × ${f1(lbm)}`, value: `${k0(cu)} kcal` },
    { key: "hb", label: tl("harrisBenedict"), value: `${k0(hb)} kcal` },
    { key: "msj", label: tl("mifflinStJeor"), value: `${k0(msj)} kcal` },
    { key: "spread", label: t("rowSpread"), value: `${k0(spread)} kcal`, isKey: true },
  ];
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={7}
      side={side}
      k="equations"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { bf: ltr(valueText), km: ltr(`${k0(km)} kcal`), d: ltr(`${k0(spread)} kcal`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((bf - BF0) / (BF1 - BF0)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bmr-c7">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          <T x={X0} y={base - 6} text={k0(lo)} anchor="start" size={12} />
          {bars.map((c, ci) => {
            const x = X0 + colW * ci + colW * 0.2;
            const bw = colW * 0.6;
            const lean = c.key === "km" || c.key === "cu";
            return (
              <g key={c.key}>
                <rect x={x} y={yb(c.v)} width={bw} height={Math.max(0, base - yb(c.v))} rx={5} style={{ fill: c.color, opacity: lean ? 1 : 0.8, ...lit(hover === c.key) }} />
                <T x={x + bw / 2} y={yb(c.v) - 8} text={k0(c.v)} size={12} bold style={INK} />
                <T x={x + bw / 2} y={base + 16} text={c.label} size={12} bold={lean} style={lean ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(bf - BF0) / (BF1 - BF0)} lo={`${BF0}%`} hi={`${BF1}%`} />
        </Drawing>
      }
    />
  );
}

// ── 8. Ranked bar list: daily energy at each activity level, the BMR part shaded inside ───────
export function BMRActivityCard({ side }: { side: Side }) {
  const { t } = useCardText("activity");
  const { bmr } = useBMRLive();
  const s = useStepper(2, { min: 0, max: PAL.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const top = 44;
  const lane = (H: number) => (H - top - 34) / PAL.length;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => Math.floor((y - top) / lane(H)));
  const { W, H } = d;
  const rowH = lane(H);
  const max = bmr * PAL[PAL.length - 1].f * 1.04;
  const xk = (kcal: number) => X0 + (kcal / max) * (W - 2 * X0 - 50);
  const sel = PAL[s.value];
  const tdee = bmr * sel.f;
  const valueText = t(sel.key);
  const rows: KitRow[] = [
    { key: "level", label: t("rowLevel"), value: valueText },
    { key: "f", label: t("rowFactor"), value: `× ${sel.f}` },
    { key: "tdee", label: `${k0(bmr)} × ${sel.f}`, value: `${k0(tdee)} kcal`, isKey: true },
    { key: "move", label: t("rowMove"), value: `${k0(tdee - bmr)} kcal` },
    { key: "share", label: t("rowShare"), value: `${f1(100 / sel.f)}%` },
    { key: "week", label: t("rowWeek"), value: `${k0(tdee * 7)} kcal` },
  ];
  const bh = Math.min(26, rowH * 0.46);
  return (
    <Card tool="bmr-calculator" idPrefix="bmr"
      n={8}
      side={side}
      k="activity"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { level: valueText, kcal: ltr(`${k0(tdee)} kcal`), share: ltr(`${f1(100 / sel.f)}%`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xk(tdee), y: top + rowH * s.value + rowH * 0.62, dir: "vertical" }} s={s} testId="bmr-c8">
          <T x={X0} y={24} text={`BMR ${k0(bmr)} kcal`} anchor="start" size={12} bold style={INK} />
          <line x1={xk(bmr)} y1={top - 6} x2={xk(bmr)} y2={H - 30} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="4 4" opacity={hover === "share" ? 1 : 0.7} />
          {PAL.map((p, i) => {
            const y = top + rowH * i;
            const on = i === s.value;
            const v = bmr * p.f;
            return (
              <g key={p.key} opacity={on ? 1 : 0.62}>
                <T x={X0} y={y + rowH * 0.62 - bh / 2 - 5} text={`${t(p.key)} · × ${p.f}`} anchor="start" size={12} bold={on} style={on ? INK : MUTED} />
                <rect x={X0} y={y + rowH * 0.62 - bh / 2} width={xk(v) - X0} height={bh} rx={5} fill="#f59e0b" style={on ? lit(hover === "tdee" || hover === "move") : undefined} />
                <rect x={X0} y={y + rowH * 0.62 - bh / 2} width={xk(bmr) - X0} height={bh} rx={5} fill="#3b82f6" />
                <T x={xk(v) + (on ? 18 : 6)} y={y + rowH * 0.62 + 4} text={k0(v)} anchor="start" size={12} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <rect x={X0} y={H - 22} width={12} height={12} rx={3} fill="#3b82f6" />
          <T x={X0 + 18} y={H - 12} text={t("legendBmr")} anchor="start" size={12} />
          <rect x={W / 2} y={H - 22} width={12} height={12} rx={3} fill="#f59e0b" />
          <T x={W / 2 + 18} y={H - 12} text={t("legendMove")} anchor="start" size={12} />
        </Drawing>
      }
    />
  );
}
