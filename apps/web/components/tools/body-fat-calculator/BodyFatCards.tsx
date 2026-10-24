"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { axisTicks, Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1, f2, snap } from "@/components/tool-ui/indicator-kit/format";
import { Card } from "../macro-calculator/MacroCards";
import { useBodyFatLive } from "./BodyFatLiveContext";
import { ACSM, DOMAIN, ESSENTIAL, IN, aceClasses, aceCuts, aceOf, circIn, navyBf, waistFor, weightAtBf, type Measures } from "./ace";

/**
 * The eight body-fat indicator cards (§31 library). All read the calculator's last valid
 * measurements and result through BodyFatLiveContext. Two write back: the zone strip drags the
 * waist field (inputs, Result table and 3D figure follow), and the composition bar drags the
 * body weight the fat/lean split is read at (Result table and 3D figure follow). The others keep
 * a what-if value of their own on top of the live result.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.body-fat-calculator.visuals.${key}`),
    tc: useTranslations("tools.body-fat-calculator.categories"),
  };
}

/** Body fat for a what-if waist (same tool formula); 0 when the tape would be invalid. */
const bfAt = (m: Measures, waistCm: number) => navyBf({ ...m, waistCm }) ?? 0;

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

/** A stepper whose value lives in the calculator (waist field or assumed weight). */
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

// ── 1. ACE zone strip: drag the waist across the five classes (writes the calculator) ──────
export function BodyFatZoneStripCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("zone");
  const { m, bf, setWaistCm } = useBodyFatLive();
  const g = m.gender;
  const [D0, D1] = DOMAIN[g];
  const wMin = Math.ceil(Math.max(m.neckCm + 1, waistFor(m, D0 + 0.5)));
  const wMax = Math.floor(waistFor(m, D1));
  const s = useSharedStepper(m.waistCm, setWaistCm, wMin, wMax, 0.5);
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const d = useDrawing(HMIN, s, (x, _y, W) => waistFor(m, D0 + ((x - X0) / (W - 2 * X0)) * (D1 - D0)));
  const { W, H } = d;
  const xb = (p: number) => X0 + ((clamp(p, D0, D1) - D0) / (D1 - D0)) * (W - 2 * X0);
  const classes = aceClasses(g);
  const cls = aceOf(g, bf);
  const cuts = aceCuts(g);
  const sy = H / 2 - 4;
  const SH = 34;
  const up = cuts.find((c) => c > bf);
  const down = [...cuts].reverse().find((c) => c < bf);
  const [aLo, aHi] = ACSM[g];
  const cmTicks = axisTicks(waistFor(m, D0), waistFor(m, D1), W - 2 * X0, 54);
  const valueText = `${f1(m.waistCm)} cm`;
  const rows: KitRow[] = [
    { key: "w", label: t("rowWaist"), value: valueText, isKey: true },
    { key: "bf", label: t("rowBf"), value: `${f1(bf)}%` },
    { key: "cls", label: t("rowClass"), value: tc(cls.key) },
    { key: "up", label: t("rowUp", { cut: up ?? "—" }), value: up ? `+${f1(waistFor(m, up) - m.waistCm)} cm` : "—" },
    { key: "down", label: t("rowDown", { cut: down ?? "—" }), value: down ? `−${f1(m.waistCm - waistFor(m, down))} cm` : "—" },
    { key: "acsm", label: t("rowAcsm", { lo: aLo, hi: aHi }), value: bf > aHi ? `−${f1(m.waistCm - waistFor(m, aHi))} cm` : bf < aLo ? `+${f1(waistFor(m, aLo) - m.waistCm)} cm` : t("inside") },
  ];
  return (
    <Card phoneRole="visual" tool="body-fat-calculator" idPrefix="bodyfat"
      n={1}
      side={side}
      k="zone"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(valueText), bf: ltr(`${f1(bf)}%`), cls: tc(cls.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xb(bf), y: sy, dir: "horizontal" }} s={s} testId="bodyfat-c1">
          {/* waist axis on top: the same strip read in this body's centimetres */}
          <line x1={X0} y1={sy - SH / 2 - 26} x2={W - X0} y2={sy - SH / 2 - 26} style={LINE} strokeWidth={1} opacity={0.5} />
          {cmTicks.map((cm) => {
            const x = px2(xb(bfAt(m, cm)));
            if (cm <= m.neckCm || x < X0 + 8 || x > W - X0 - 8) return null;
            return (
              <g key={cm}>
                <line x1={x} y1={sy - SH / 2 - 30} x2={x} y2={sy - SH / 2 - 22} style={LINE} />
                <T x={x} y={sy - SH / 2 - 36} text={`${cm}`} size={10.5} />
              </g>
            );
          })}
          <T x={X0} y={sy - SH / 2 - 52} text={t("axisWaist")} anchor="start" size={10.5} bold />
          {/* ACSM healthy band under the strip */}
          <rect x={xb(aLo)} y={sy + SH / 2 + 4} width={xb(aHi) - xb(aLo)} height={5} rx={2} fill="#10b981" opacity={hover === "acsm" ? 1 : 0.6} />
          {classes.map((c) => {
            const a = xb(Math.max(c.min, D0));
            const b = xb(Math.min(c.max, D1));
            const on = c.key === cls.key;
            const name = tc(c.key);
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
          {cuts.map((c) => (
            <T key={c} x={xb(c)} y={sy + SH / 2 + 24} text={`${c}%`} size={10.5} bold style={INK} />
          ))}
          <T x={X0} y={sy + SH / 2 + 44} text={t("axisBf")} anchor="start" size={10.5} bold />
          <line x1={xb(bf)} y1={sy - SH / 2 - 6} x2={xb(bf)} y2={sy + SH / 2 + 6} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <T x={clamp(xb(bf), X0 + 70, W - X0 - 70)} y={H - 10} text={`${f1(m.waistCm)} cm · ${f1(bf)}%`} size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 2. Gradient gauge: body fat after a what-if waist change, ACSM band inside ────────────
export function BodyFatGaugeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("gauge");
  const { m, bf } = useBodyFatLive();
  const g = m.gender;
  const [D0, D1] = DOMAIN[g];
  const s = useStepper(-5, { min: -20, max: 20, step: 1 });
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
    return waistFor(m, p) - m.waistCm;
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
  const w2 = m.waistCm + s.value;
  const bf2 = bfAt(m, w2);
  const [aLo, aHi] = ACSM[g];
  const [nx, ny] = pt(bf2, R - 18);
  const [gx, gy] = pt(bf, R - 18);
  const valueText = `${s.value > 0 ? "+" : ""}${s.value} cm`;
  const rows: KitRow[] = [
    { key: "bf", label: t("rowNow"), value: `${f1(bf)}%` },
    { key: "d", label: t("rowDelta"), value: valueText },
    { key: "w2", label: t("rowWaist"), value: `${f1(w2)} cm` },
    { key: "bf2", label: t("rowBf"), value: `${f1(bf2)}%`, isKey: true },
    { key: "diff", label: t("rowChange"), value: `${bf2 - bf >= 0 ? "+" : "−"}${f1(Math.abs(bf2 - bf))}%` },
    { key: "cls", label: t("rowClass"), value: tc(aceOf(g, bf2).key) },
    { key: "acsm", label: t("rowAcsm", { lo: aLo, hi: aHi }), value: bf2 >= aLo && bf2 <= aHi ? t("inside") : t("outside") },
  ];
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={2}
      side={side}
      k="gauge"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { d: ltr(valueText), bf: ltr(`${f1(bf2)}%`), cls: tc(aceOf(g, bf2).key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`${f1(bf2)}%`} handle={{ x: nx, y: ny, dir: "circular" }} s={s} testId="bodyfat-c2">
          {aceClasses(g).map((c) => {
            const a = Math.max(c.min, D0);
            const b = Math.min(c.max, D1);
            if (b <= a) return null;
            const on = aceOf(g, bf2).key === c.key;
            return <path key={c.key} d={arc(a, b, R)} fill="none" stroke={c.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.6} />;
          })}
          <path d={arc(aLo, aHi, R - 30)} fill="none" stroke="#10b981" strokeWidth={hover === "acsm" ? 8 : 5} strokeLinecap="round" />
          <T x={pt((aLo + aHi) / 2, R - 46)[0]} y={pt((aLo + aHi) / 2, R - 46)[1] + 4} text="ACSM" size={10} bold style={{ fill: "#059669" }} />
          {aceCuts(g).map((p) => {
            const [x, y] = pt(p, R + 24);
            return <T key={p} x={x} y={y + 4} text={`${p}%`} size={10.5} />;
          })}
          <line x1={cx} y1={cy} x2={gx} y2={gy} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} strokeDasharray="4 4" opacity={hover === "bf" ? 1 : 0.7} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "bf2" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`${f1(bf2)}%`} size={15} bold style={INK} />
          <T x={cx} y={cy + 42} text={`${f1(w2)} cm`} size={11} />
        </Drawing>
      }
    />
  );
}

// ── 3. Stacked bar (wow): drag the body weight, watch fat and lean mass split ─────────────
const KG0 = 35;
const KG1 = 160;
export function BodyFatCompositionCard({ side }: { side: Side }) {
  const { t } = useCardText("composition");
  const { m, bf, weightKg, weightSeed, setWeightKg } = useBodyFatLive();
  const g = m.gender;
  const s = useSharedStepper(weightKg, setWeightKg, KG0, KG1, 0.5);
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => KG0 + ((x - X0) / (W - 2 * X0)) * (KG1 - KG0));
  const { W, H } = d;
  const xk = (kg: number) => X0 + ((clamp(kg, 0, KG1) - 0) / KG1) * (W - 2 * X0);
  const w = s.value;
  const fat = (w * bf) / 100;
  const ess = (w * Math.min(ESSENTIAL[g], bf)) / 100;
  const store = fat - ess;
  const lean = w - fat;
  const fat0 = (weightSeed * bf) / 100;
  const lean0 = weightSeed - fat0;
  const ffmi = lean / (m.heightCm / 100) ** 2;
  const by = 70;
  const bh = 46;
  const gy = by + bh + 40;
  const segs = [
    { key: "lean", from: 0, kg: lean, color: "#c98b74", label: t("lean") },
    { key: "ess", from: lean, kg: ess, color: "#6366f1", label: t("essential") },
    { key: "store", from: lean + ess, kg: store, color: aceOf(g, bf).color, label: t("storage") },
  ];
  const valueText = `${f1(w)} kg`;
  const sign = (v: number) => `${v >= 0 ? "+" : "−"}${f1(Math.abs(v))} kg`;
  const rows: KitRow[] = [
    { key: "w", label: t("rowWeight"), value: valueText, isKey: true },
    { key: "store", label: `${t("rowFat")} = ${f1(w)} × ${f1(bf)}%`, value: `${f1(fat)} kg` },
    { key: "lean", label: `${t("rowLean")} = ${f1(w)} − ${f1(fat)}`, value: `${f1(lean)} kg` },
    { key: "ess", label: `${t("rowEssential")} (${ESSENTIAL[g]}%)`, value: `${f1(ess)} kg` },
    { key: "ffmi", label: `FFMI = ${f1(lean)} ÷ ${f2(m.heightCm / 100)}²`, value: f1(ffmi) },
    { key: "delta", label: t("rowDelta", { kg: f1(weightSeed) }), value: `${sign(fat - fat0)} · ${sign(lean - lean0)}` },
  ];
  const ticks = axisTicks(0, KG1, W - 2 * X0, 50);
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={3}
      side={side}
      k="composition"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(valueText), fat: ltr(`${f1(fat)} kg`), lean: ltr(`${f1(lean)} kg`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xk(w), y: by + bh / 2, dir: "horizontal" }} s={s} testId="bodyfat-c3">
          <T x={W / 2} y={28} text={`${f1(w)} kg = ${f1(lean)} + ${f1(ess)} + ${f1(store)}`} size={14} bold style={INK} />
          {/* the reference weight as a ghost outline */}
          <rect x={xk(0)} y={by - 8} width={xk(weightSeed) - xk(0)} height={bh + 16} rx={8} fill="none" style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="5 4" opacity={hover === "delta" ? 1 : 0.6} />
          {segs.map((sg) => {
            const a = xk(sg.from);
            const b = xk(sg.from + sg.kg);
            return (
              <g key={sg.key}>
                <rect x={a} y={by} width={Math.max(0, b - a)} height={bh} style={{ fill: sg.color, ...lit(hover === sg.key) }} />
                {b - a > 34 && (
                  <text x={(a + b) / 2} y={by + bh / 2 + 4} fontSize={11} fontWeight={800} textAnchor="middle" fill="#fff" className="tabular-nums">
                    {f1(sg.kg)}
                  </text>
                )}
              </g>
            );
          })}
          <line x1={X0} y1={gy - 14} x2={W - X0} y2={gy - 14} style={LINE} strokeWidth={1} />
          {ticks.map((v) => (
            <g key={v}>
              <line x1={xk(v)} y1={gy - 18} x2={xk(v)} y2={gy - 10} style={LINE} />
              <T x={xk(v)} y={gy + 2} text={String(v)} size={10.5} />
            </g>
          ))}
          <T x={W - X0} y={gy + 18} text="kg" anchor="end" size={10.5} bold />
          {/* legend */}
          {segs.map((sg, i) => {
            const lx = X0 + i * ((W - 2 * X0) / 3);
            return (
              <g key={`lg${sg.key}`}>
                <rect x={lx} y={H - 30} width={12} height={12} rx={3} fill={sg.color} />
                <T x={lx + 18} y={H - 20} text={sg.label} anchor="start" size={10.5} bold={hover === sg.key} style={hover === sg.key ? INK : MUTED} />
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}

// ── 4. Labeled bars: the waist at every ACE cut-off for this body, next to yours ──────────
export function BodyFatCutoffBarsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("cutoffs");
  const { m, bf } = useBodyFatLive();
  const g = m.gender;
  const cuts = aceCuts(g);
  const classes = aceClasses(g);
  const s = useStepper(2, { min: 0, max: cuts.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const n = cuts.length + 1;
  const bars = [
    ...cuts.map((c, ci) => ({ key: `c${c}`, label: `${c}%`, cm: waistFor(m, c), color: classes[ci].color, you: false, ci })),
    { key: "you", label: t("you"), cm: m.waistCm, color: aceOf(g, bf).color, you: true, ci: -1 },
  ].sort((a, b) => a.cm - b.cm);
  const d = useDrawing(HMIN, s, (x, _y, W) => {
    const bar = bars[clamp(Math.floor(((x - X0) / (W - 2 * X0)) * n), 0, n - 1)];
    return bar.you ? s.value : bar.ci;
  });
  const { W, H } = d;
  const slot = (W - 2 * X0) / n;
  const top = Math.max(...bars.map((b) => b.cm)) * 1.08;
  const bottom = Math.max(0, Math.min(...bars.map((b) => b.cm)) - 25);
  const base = H - 40;
  const yc = (cm: number) => base - ((cm - bottom) / (top - bottom)) * (base - 34);
  const cut = cuts[s.value];
  const cutCm = waistFor(m, cut);
  const sel = bars.findIndex((b) => b.key === `c${cut}`);
  const diff = cutCm - m.waistCm;
  const valueText = `${cut}%`;
  const rows: KitRow[] = [
    { key: "cut", label: t("rowCut"), value: `${cut}% (${tc(classes[s.value].key)})` },
    { key: "cm", label: t("rowSolve", { cut }), value: `${f1(cutCm)} cm`, isKey: true },
    { key: "you", label: t("rowYou"), value: `${f1(m.waistCm)} cm · ${f1(bf)}%` },
    { key: "diff", label: t("rowDiff"), value: `${diff >= 0 ? "+" : "−"}${f1(Math.abs(diff))} cm` },
    { key: "in", label: t("rowInches"), value: `${f1(cutCm / IN)} in` },
  ];
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={4}
      side={side}
      k="cutoffs"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { cut: ltr(`${cut}%`), cm: ltr(`${f1(cutCm)} cm`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + slot * (sel + 0.5), y: yc(cutCm) - 26, dir: "horizontal" }} s={s} testId="bodyfat-c4">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {bars.map((b, bi) => {
            const x = X0 + slot * bi + slot * 0.18;
            const bw = slot * 0.64;
            const on = bi === sel;
            return (
              <g key={b.key}>
                <rect x={x} y={yc(b.cm)} width={bw} height={base - yc(b.cm)} rx={4} style={{ fill: b.color, opacity: b.you || on ? 1 : 0.55, ...lit(on || (b.you && hover === "you")) }} />
                <T x={x + bw / 2} y={yc(b.cm) - 6} text={f1(b.cm)} size={10.5} bold={on || b.you} style={on || b.you ? INK : MUTED} />
                <T x={x + bw / 2} y={base + 16} text={b.label} size={10.5} bold={b.you} style={b.you ? INK : MUTED} />
              </g>
            );
          })}
          <T x={X0} y={14} text={t("axisWaist")} anchor="start" size={10.5} bold />
          <T x={W - X0} y={base + 32} text={t("axisBf")} anchor="end" size={10.5} bold />
        </Drawing>
      }
    />
  );
}

// ── 5. Trend line: body fat against waist for this body, reference point = you ────────────
export function BodyFatWaistCurveCard({ side }: { side: Side }) {
  const { m } = useBodyFatLive();
  // A new waist in the calculator re-seeds this card's what-if waist.
  return <WaistCurve key={`${m.gender}-${Math.round(m.waistCm)}`} side={side} />;
}
function WaistCurve({ side }: { side: Side }) {
  const { t, tc } = useCardText("curve");
  const { m, bf } = useBodyFatLive();
  const g = m.gender;
  const [D0, D1] = DOMAIN[g];
  const lo = Math.ceil(Math.max(m.neckCm + 2, waistFor(m, D0 + 1)));
  const hi = Math.floor(waistFor(m, D1));
  const s = useStepper(clamp(Math.round(m.waistCm), lo, hi), { min: lo, max: hi, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const PL = 44;
  const d = useDrawing(HMIN, s, (x, _y, W) => lo + ((x - PL) / (W - PL - 18)) * (hi - lo));
  const { W, H } = d;
  const top = 16;
  const base = H - 36;
  const xw = (cm: number) => PL + ((cm - lo) / (hi - lo)) * (W - PL - 18);
  const yb = (p: number) => base - ((clamp(p, D0, D1) - D0) / (D1 - D0)) * (base - top);
  const N = 60;
  const pts = Array.from({ length: N + 1 }, (_, i) => lo + ((hi - lo) * i) / N)
    .map((cm) => `${px2(xw(cm))},${px2(yb(bfAt(m, cm)))}`)
    .join(" ");
  const cm = s.value;
  const b = bfAt(m, cm);
  // dBF/dwaist per cm: the log term's slope, coefficient ÷ (ln 10 × circumference term in inches) ÷ 2.54.
  const slope = (m.gender === "male" ? 86.01 : 163.205) / (Math.LN10 * circIn({ ...m, waistCm: cm })) / IN;
  const [, aHi] = ACSM[g];
  const wAcsm = waistFor(m, aHi);
  const valueText = `${cm} cm`;
  const rows: KitRow[] = [
    { key: "w", label: t("rowWaist"), value: valueText },
    { key: "b", label: t("rowBf"), value: `${f1(b)}%`, isKey: true },
    { key: "cls", label: t("rowClass"), value: tc(aceOf(g, b).key) },
    { key: "you", label: t("rowYou", { w: f1(m.waistCm) }), value: `${f1(bf)}%` },
    { key: "slope", label: t("rowSlope"), value: `${f2(slope)}% / cm` },
    { key: "acsm", label: t("rowAcsm", { hi: aHi }), value: `${f1(wAcsm)} cm` },
  ];
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={5}
      side={side}
      k="curve"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { w: ltr(valueText), b: ltr(`${f1(b)}%`), sl: ltr(`${f2(slope)}%`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xw(cm), y: yb(b), dir: "horizontal" }} s={s} testId="bodyfat-c5">
          {aceClasses(g).map((c) => {
            const a = Math.max(c.min, D0);
            const z = Math.min(c.max, D1);
            if (z <= a) return null;
            return <rect key={c.key} x={PL} y={yb(z)} width={W - PL - 18} height={yb(a) - yb(z)} fill={c.color} opacity={0.14} />;
          })}
          {axisTicks(D0, D1, base - top, 26).map((v) => (
            <g key={v}>
              <line x1={PL} y1={yb(v)} x2={W - 18} y2={yb(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yb(v) + 4} text={`${v}%`} anchor="end" size={10.5} />
            </g>
          ))}
          {axisTicks(lo, hi, W - PL - 18, 46).map((v) => (
            <T key={v} x={xw(v)} y={base + 16} text={String(v)} size={10.5} />
          ))}
          <T x={W - 18} y={base + 32} text={t("axisWaist")} anchor="end" size={10.5} bold />
          <polyline points={pts} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} />
          {wAcsm >= lo && wAcsm <= hi && <line x1={xw(wAcsm)} y1={top} x2={xw(wAcsm)} y2={base} stroke="#10b981" strokeDasharray="4 4" strokeWidth={hover === "acsm" ? 2.5 : 1.5} />}
          <circle cx={xw(clamp(m.waistCm, lo, hi))} cy={yb(bf)} r={hover === "you" ? 8 : 6} style={{ fill: "var(--ph-ink)" }} />
          <T x={xw(clamp(m.waistCm, lo, hi))} y={yb(bf) - 12} text={`${f1(bf)}%`} size={11} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 6. Sensitivity trio: what a ± tape error on the waist does to body fat ────────────────
export function BodyFatSensitivityCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("sensitivity");
  const { m, bf } = useBodyFatLive();
  const g = m.gender;
  const s = useStepper(1.5, { min: 0.5, max: 5, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - 2 * X0)) * 4.5);
  const { W, H } = d;
  const e = s.value;
  const trio = [
    { key: "short", label: `${f1(m.waistCm - e)} cm`, b: bfAt(m, m.waistCm - e) },
    { key: "now", label: `${f1(m.waistCm)} cm`, b: bf },
    { key: "long", label: `${f1(m.waistCm + e)} cm`, b: bfAt(m, m.waistCm + e) },
  ];
  const trackY = H - 34;
  const base = trackY - 46;
  const topV = Math.max(...trio.map((x) => x.b)) * 1.15 || 1;
  const yb = (b: number) => base - (b / topV) * (base - 30);
  const colW = (W - 2 * X0) / 3;
  const spread = trio[2].b - trio[0].b;
  const valueText = `± ${f1(e)} cm`;
  const sameCls = aceOf(g, trio[0].b).key === aceOf(g, trio[2].b).key;
  const rows: KitRow[] = [
    { key: "e", label: t("rowError"), value: valueText },
    { key: "short", label: t("rowAt", { w: f1(m.waistCm - e) }), value: `${f1(trio[0].b)}%` },
    { key: "now", label: t("rowAt", { w: f1(m.waistCm) }), value: `${f1(trio[1].b)}%` },
    { key: "long", label: t("rowAt", { w: f1(m.waistCm + e) }), value: `${f1(trio[2].b)}%` },
    { key: "spread", label: t("rowSpread"), value: `${f1(spread)}%`, isKey: true },
    { key: "cls", label: t("rowClasses"), value: sameCls ? t("same") : `${tc(aceOf(g, trio[0].b).key)} → ${tc(aceOf(g, trio[2].b).key)}` },
  ];
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={6}
      side={side}
      k="sensitivity"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { e: ltr(valueText), d: ltr(`${f1(spread)}%`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 0.5) / 4.5) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bodyfat-c6">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {trio.map((c, ci) => {
            const x = X0 + colW * ci + colW * 0.22;
            const bw = colW * 0.56;
            const on = hover === c.key || (ci === 1 && hover === null);
            return (
              <g key={c.key}>
                <rect x={x} y={yb(c.b)} width={bw} height={base - yb(c.b)} rx={5} style={{ fill: aceOf(g, c.b).color, opacity: ci === 1 ? 1 : 0.7, ...lit(on) }} />
                <T x={x + bw / 2} y={yb(c.b) - 8} text={`${f1(c.b)}%`} size={12} bold style={INK} />
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

// ── 7. Formula diagram: the U.S. Navy equation built stage by stage ───────────────────────
export function BodyFatFormulaCard({ side }: { side: Side }) {
  const { t } = useCardText("formula");
  const { m, bf } = useBodyFatLive();
  const male = m.gender === "male";
  const s = useStepper(4, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 3);
  const { W, H } = d;
  const st = s.value;
  const hIn = m.heightCm / IN;
  const c = circIn(m);
  const A = male ? 86.01 : 163.205;
  const B = male ? 70.041 : 97.684;
  const K = male ? 36.76 : -78.387;
  const lc = Math.log10(c);
  const lh = Math.log10(hIn);
  const stages = [
    { key: "in", top: `${f1(m.heightCm)} ÷ 2.54`, bottom: `${f2(hIn)} in` },
    { key: "c", top: male ? "W − N" : "W + Hip − N", bottom: `${f2(c)} in` },
    { key: "log", top: `log ${f2(c)} · log ${f2(hIn)}`, bottom: `${lc.toFixed(4)} · ${lh.toFixed(4)}` },
    { key: "bf", top: `${A}·${lc.toFixed(3)} − ${B}·${lh.toFixed(3)}`, bottom: `${f1(bf)}%` },
  ];
  const trackY = H - 34;
  const boxW = Math.min(160, (W - 2 * X0 - 3 * 18) / 4);
  const gap = (W - 2 * X0 - 4 * boxW) / 3;
  const by = 62;
  const bh = trackY - 50 - by;
  const valueText = t(`stage${st}`);
  const rows: KitRow[] = [
    { key: "in", label: t("rowInches"), value: `${f2(hIn)} in`, isKey: st === 1 },
    { key: "c", label: male ? t("rowCircM") : t("rowCircF"), value: `${f2(c)} in`, isKey: st === 2 },
    { key: "log", label: `log₁₀ ${f2(c)} · log₁₀ ${f2(hIn)}`, value: `${lc.toFixed(4)} · ${lh.toFixed(4)}`, isKey: st === 3 },
    { key: "bf", label: `${A}×${lc.toFixed(4)} − ${B}×${lh.toFixed(4)} ${K >= 0 ? "+" : "−"} ${Math.abs(K)}`, value: `${f1(bf)}%`, isKey: st === 4 },
  ];
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={7}
      side={side}
      k="formula"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { stage: valueText })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((st - 1) / 3) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bodyfat-c7">
          <T x={W / 2} y={30} text={`%BF = ${A}·log(${male ? "W−N" : "W+Hip−N"}) − ${B}·log(H) ${K >= 0 ? "+" : "−"} ${Math.abs(K)}`} size={13} bold style={INK} />
          {stages.map((sg, gi) => {
            const x = X0 + gi * (boxW + gap);
            const shown = gi < st;
            const on = gi === st - 1 || hover === sg.key;
            return (
              <g key={sg.key} opacity={shown ? 1 : 0.28}>
                <rect x={x} y={by} width={boxW} height={bh} rx={10} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + boxW / 2} y={by + 22} text={String(gi + 1)} size={11} bold />
                <T x={x + boxW / 2} y={by + bh / 2} text={sg.top} size={10.5} />
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

// ── 8. Balance: your weight against the weight at a target body fat, lean mass kept ───────
export function BodyFatBalanceCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("balance");
  const { m, bf, weightKg } = useBodyFatLive();
  const g = m.gender;
  const [aLo, aHi] = ACSM[g];
  const TMIN = g === "male" ? 8 : 16;
  const TMAX = g === "male" ? 30 : 38;
  const s = useStepper(g === "male" ? 15 : 22, { min: TMIN, max: TMAX, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const d = useDrawing(HMIN, s, (x, _y, W) => TMIN + ((x - X0) / (W - 2 * X0)) * (TMAX - TMIN));
  const { W, H } = d;
  const tb = s.value;
  const w = weightKg;
  const lean = w * (1 - bf / 100);
  const tw2 = weightAtBf(w, bf, tb);
  const diff = w - tw2;
  const tilt = clamp(diff / 30, -1, 1) * 16;
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
  const valueText = `${f1(tb)}%`;
  const rows: KitRow[] = [
    { key: "tb", label: t("rowTarget"), value: `${f1(tb)}% (${tc(aceOf(g, tb).key)})` },
    { key: "lean", label: `${t("rowLean")} = ${f1(w)} × (1 − ${f1(bf)}%)`, value: `${f1(lean)} kg` },
    { key: "tw", label: `${f1(lean)} ÷ (1 − ${f1(tb)}%)`, value: `${f1(tw2)} kg` },
    { key: "w", label: t("rowYou"), value: `${f1(w)} kg` },
    { key: "diff", label: diff > 0 ? t("rowLose") : t("rowGain"), value: `${f1(Math.abs(diff))} kg`, isKey: true },
    { key: "acsm", label: t("rowAcsm", { lo: aLo, hi: aHi }), value: tb >= aLo && tb <= aHi ? t("inside") : t("outside") },
  ];
  return (
    <Card tool="body-fat-calculator" idPrefix="bodyfat"
      n={8}
      side={side}
      k="balance"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t(diff > 0 ? "captionLose" : "captionGain", { b: ltr(valueText), kg: ltr(`${f1(Math.abs(diff))} kg`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((tb - TMIN) / (TMAX - TMIN)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="bodyfat-c8">
          <path d={`M ${cx} ${pivotY} L ${cx - 22} ${trackY - 46} L ${cx + 22} ${trackY - 46} Z`} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
          <circle cx={cx} cy={pivotY} r={6} style={{ fill: "var(--ph-ink)" }} />
          {pan(lx, ly, w, `${f1(bf)}%`, aceOf(g, bf).color, hover === "w")}
          {pan(rx, ry, tw2, `${f1(tb)}%`, aceOf(g, tb).color, hover === "tw")}
          <T x={cx} y={24} text={`${diff > 0 ? "−" : "+"}${f1(Math.abs(diff))} kg`} size={15} bold style={INK} />
          <SvgTrack W={W} y={trackY} frac={(tb - TMIN) / (TMAX - TMIN)} lo={`${TMIN}%`} hi={`${TMAX}%`} />
        </Drawing>
      }
    />
  );
}
