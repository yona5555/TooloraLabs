"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1, f2 } from "@/components/tool-ui/indicator-kit/format";
import { useTDEELive } from "./TDEELiveContext";
import {
  BMR_FORMULAS,
  COLORS,
  GAUGE_ZONES,
  KCAL_KG,
  LEVELS,
  LEVEL_COLORS,
  bmrBy,
  dailyFromWeekly,
  deurenberg,
  gaugeZone,
  k0,
  kcalT,
  mifflin,
  mult,
  sgn,
  splitOf,
  weeklyFromDaily,
} from "./energy";

/**
 * The eight TDEE indicator cards (§31 library). All read the calculator's live result (BMR,
 * TDEE, body, activity, goal) through TDEELiveContext; the activity-steps card writes the
 * activity level back, so dragging it moves the Result table and the 3D energy towers. The other
 * cards keep a what-if value of their own on top of the live result (re-seeded when it changes).
 * Numbers here use Western digits, like the BMI cards.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
const kgT = (v: number) => `${f1(v)} kg`;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.tdee-calculator.visuals.${key}`),
    tv: useTranslations("tools.tdee-calculator.visuals.common"),
    tg: useTranslations("tools.tdee-calculator"),
    tc: useTranslations("toolPage.indicatorKit"),
  };
}

/** Pounds per kg, for the second unit on the weight cards. */
const LB = 2.20462;

function useBase() {
  const { snap } = useTDEELive();
  const m = mult(snap.activityLevel);
  return { ...snap, m };
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

function Card({ n, side, k, caption, s, valueText, rows, hover, setHover, visual }: { n: number; side: Side; k: string; caption: string; s: Stepper; valueText: string; rows: KitRow[]; hover: string | null; setHover: (v: string | null) => void; visual: ReactNode }) {
  const { t, tc } = useCardText(k);
  return (
    <IndicatorCard
      idPrefix="tdee"
      n={n}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      controls={<KitControls s={s} valueText={valueText} testId={`tdee-c${n}`} />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={visual}
    />
  );
}

/** The live activity level as a stepper (index 0–4): −/+ and the drag write the calculator. */
function useSharedLevel(): Stepper {
  const { snap, setActivityLevel } = useTDEELive();
  const value = LEVELS.indexOf(snap.activityLevel);
  const [seed] = useState(value);
  const [flash, setFlash] = useState(0);
  const set = (v: number) => {
    const i = clamp(Math.round(v), 0, LEVELS.length - 1);
    if (i !== value) setFlash((f) => f + 1);
    setActivityLevel(LEVELS[i]);
  };
  return {
    value,
    set,
    inc: () => set(value + 1),
    dec: () => set(value - 1),
    reset: () => set(seed),
    flash,
    atMin: value <= 0,
    atMax: value >= LEVELS.length - 1,
    isSeed: value === seed,
    min: 0,
    max: LEVELS.length - 1,
    step: 1,
  };
}

// ── 1. Stepped diagram: TDEE at each activity level (drag writes the calculator) ─────────────
export function TDEEActivityStepsCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("steps");
  const { bmr, tdee } = useBase();
  const s = useSharedLevel();
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const PL = 44;
  const d = useDrawing(HMIN, s, (x, _y, W) => Math.floor(((x - PL) / (W - PL - 12)) * LEVELS.length));
  const { W, H } = d;
  const top = 34;
  const base = H - 40;
  const colW = (W - PL - 12) / LEVELS.length;
  const vmax = bmr * mult("veryActive") * 1.06;
  const yv = (v: number) => base - (v / vmax) * (base - top);
  const i = s.value;
  const level = LEVELS[i];
  const name = tv(`level.${level}`);
  const sed = bmr * mult("sedentary");
  const next = LEVELS[i + 1];
  const valueText = `${name} · ×${mult(level)}`;
  const rows: KitRow[] = [
    { key: "lvl", label: t("rowLevel"), value: name },
    { key: "tdee", label: `${k0(bmr)} × ${mult(level)}`, value: kcalT(tdee), isKey: true },
    { key: "act", label: t("rowActivity"), value: kcalT(tdee - bmr) },
    { key: "sed", label: t("rowVsSedentary"), value: sgn(tdee - sed, kcalT(Math.abs(tdee - sed))) },
    { key: "next", label: t("rowNext"), value: next ? `+${kcalT(bmr * (mult(next) - mult(level)))}` : "—" },
    { key: "hour", label: `${k0(tdee)} ÷ 24`, value: `${k0(tdee / 24)} kcal/h` },
  ];
  return (
    <Card
      n={1}
      side={side}
      k="steps"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { level: name, tdee: ltr(kcalT(tdee)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: PL + colW * (i + 0.5), y: yv(tdee) + 16, dir: "horizontal" }} s={s} testId="tdee-c1">
          {[0, 1000, 2000, 3000, 4000, 5000].filter((v) => v <= vmax).map((v) => (
            <g key={v}>
              <line x1={PL} y1={yv(v)} x2={W - 12} y2={yv(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yv(v) + 4} text={k0(v)} anchor="end" size={10} />
            </g>
          ))}
          <T x={6} y={14} text="kcal/day" anchor="start" size={10.5} bold />
          {LEVELS.map((lv, li) => {
            const v = bmr * mult(lv);
            const x = PL + colW * li + 3;
            const w = colW - 6;
            const on = li === i;
            return (
              <g key={lv}>
                {/* BMR base (same on every step) and the activity on top of it */}
                <rect x={x} y={yv(bmr)} width={w} height={base - yv(bmr)} style={{ fill: COLORS.bmr, opacity: on ? 0.95 : 0.4 }} />
                <rect x={x} y={yv(v)} width={w} height={yv(bmr) - yv(v)} style={{ fill: LEVEL_COLORS[lv], opacity: on ? 1 : 0.45, ...lit(on && hover === "act") }} />
                <T x={x + w / 2} y={yv(v) - 6} text={k0(v)} size={on ? 12.5 : 10.5} bold={on} style={on ? INK : MUTED} />
                <T x={x + w / 2} y={base + 14} text={`×${mult(lv)}`} size={10} bold={on} style={on ? INK : MUTED} />
                <T x={x + w / 2} y={base + 28} text={tv(`level.${lv}`)} size={9.5} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <line x1={PL} y1={yv(bmr)} x2={W - 12} y2={yv(bmr)} style={{ stroke: "var(--ph-ink)" }} strokeDasharray="5 4" strokeWidth={hover === "lvl" ? 2.5 : 1.2} />
          <T x={PL + 6} y={yv(bmr) + 14} text={`BMR ${k0(bmr)}`} anchor="start" size={10.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 2. Stacked bar: what TDEE is made of (BMR, TEF, NEAT, EAT) ─────────────────────────────
export function TDEEComponentsStackCard({ side }: { side: Side }) {
  const { t } = useCardText("stack");
  const { bmr, tdee } = useBase();
  const s = useStepper(10, { min: 5, max: 15, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => {
    const kcal = ((x - X0) / (W - 2 * X0)) * tdee - bmr;
    return (kcal / tdee) * 100;
  });
  const { W, H } = d;
  const sp = splitOf(bmr, tdee, s.value / 100);
  const xk = (v: number) => X0 + (v / tdee) * (W - 2 * X0);
  const parts = [
    { key: "bmr", v: sp.bmr, color: COLORS.bmr, name: "BMR" },
    { key: "tef", v: sp.tef, color: COLORS.tef, name: "TEF" },
    { key: "neat", v: sp.neat, color: COLORS.neat, name: "NEAT" },
    { key: "eat", v: sp.eat, color: COLORS.eat, name: "EAT" },
  ];
  const by = 70;
  const bh = 56;
  const segs = parts.map((p, i) => {
    const a = parts.slice(0, i).reduce((sum, q) => sum + q.v, 0);
    return { ...p, a, b: a + p.v };
  });
  const pct = (v: number) => `${Math.round((v / tdee) * 100)}%`;
  const valueText = `TEF ${s.value}%`;
  const rows: KitRow[] = [
    { key: "bmr", label: t("rowBmr"), value: `${kcalT(sp.bmr)} · ${pct(sp.bmr)}` },
    { key: "tef", label: `${k0(tdee)} × ${s.value}%`, value: `${kcalT(sp.tef)} · ${pct(sp.tef)}`, isKey: true },
    { key: "neat", label: t("rowNeat"), value: `${kcalT(sp.neat)} · ${pct(sp.neat)}` },
    { key: "eat", label: t("rowEat"), value: `${kcalT(sp.eat)} · ${pct(sp.eat)}` },
    { key: "sum", label: "BMR + TEF + NEAT + EAT", value: kcalT(tdee) },
  ];
  return (
    <Card
      n={2}
      side={side}
      k="stack"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { bmr: ltr(pct(sp.bmr)), tef: ltr(`${s.value}%`), act: ltr(pct(sp.neat + sp.eat)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xk(sp.bmr + sp.tef), y: by + bh + 14, dir: "horizontal" }} s={s} testId="tdee-c2">
          <T x={X0} y={22} text={`TDEE ${kcalT(tdee)}`} anchor="start" size={13} bold style={INK} />
          {segs.map((g) => {
            const w = Math.max(0, xk(g.b) - xk(g.a));
            const on = hover === g.key || (g.key === "tef" && hover === null);
            return (
              <g key={g.key}>
                <rect x={xk(g.a)} y={by} width={w} height={bh} style={{ fill: g.color, opacity: on || hover === "sum" ? 1 : 0.75, ...lit(hover === g.key) }} />
                {w > 34 && <T x={xk(g.a) + w / 2} y={by + bh / 2 - 2} text={g.name} size={11} bold style={{ fill: "#fff" }} />}
                {w > 34 && <T x={xk(g.a) + w / 2} y={by + bh / 2 + 13} text={pct(g.v)} size={10.5} style={{ fill: "#fff" }} />}
              </g>
            );
          })}
          <rect x={X0} y={by} width={W - 2 * X0} height={bh} fill="none" style={LINE} />
          {/* Legend with the kcal of each part, in a row under the bar */}
          {segs.map((g, gi) => {
            const lx = X0 + gi * ((W - 2 * X0) / 4);
            return (
              <g key={`lg${g.key}`}>
                <rect x={lx} y={H - 58} width={10} height={10} rx={2} style={{ fill: g.color }} />
                <T x={lx + 14} y={H - 49} text={g.name} anchor="start" size={10.5} bold style={INK} />
                <T x={lx + 14} y={H - 34} text={k0(g.v)} anchor="start" size={10.5} />
              </g>
            );
          })}
          <T x={W - X0} y={H - 10} text={`${t("activityLabel")} ${kcalT(sp.neat + sp.eat)}`} anchor="end" size={10.5} bold />
        </Drawing>
      }
    />
  );
}

// ── 3. Balance: daily intake against TDEE, the beam tips to a deficit or surplus ──────────────
export function TDEEBalanceCard({ side }: { side: Side }) {
  const { tdee, dailyTarget } = useBase();
  return <Balance key={`${Math.round(tdee)}-${Math.round(dailyTarget)}`} side={side} />;
}
function Balance({ side }: { side: Side }) {
  const { t, tg } = useCardText("balance");
  const { tdee, dailyTarget } = useBase();
  const lo = Math.round((tdee * 0.5) / 25) * 25;
  const hi = Math.round((tdee * 1.5) / 25) * 25;
  const seed = Math.abs(dailyTarget - tdee) < 1 ? tdee - 500 : dailyTarget;
  const s = useStepper(seed, { min: lo, max: hi, step: 25 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => lo + ((x - X0) / (W - 2 * X0)) * (hi - lo));
  const { W, H } = d;
  const intake = s.value;
  const bal = intake - tdee;
  const pctAdj = (bal / tdee) * 100;
  const zone = gaugeZone(pctAdj);
  const ang = clamp(pctAdj / 50, -1, 1) * 0.32;
  const cx = W / 2;
  const cy = 150;
  const L = Math.min(W / 2 - 60, 170);
  // Intake on the left pan, TDEE on the right: a heavier intake tips the left side down.
  const lx = cx - L * Math.cos(ang);
  const ly = cy + L * Math.sin(ang);
  const rx = cx + L * Math.cos(ang);
  const ry = cy - L * Math.sin(ang);
  const bScale = 54 / Math.max(intake, tdee);
  const trackY = H - 44;
  const valueText = kcalT(intake);
  const rows: KitRow[] = [
    { key: "in", label: t("rowIntake"), value: kcalT(intake) },
    { key: "out", label: "TDEE", value: kcalT(tdee) },
    { key: "bal", label: `${k0(intake)} − ${k0(tdee)}`, value: sgn(bal, kcalT(Math.abs(bal))), isKey: true },
    { key: "week", label: `× 7 ÷ ${k0(KCAL_KG)}`, value: sgn(bal, `${f2(Math.abs(weeklyFromDaily(bal)))} kg/wk`) },
    { key: "zone", label: t("rowZone"), value: `${tg(`gauge.${zone.key}`)} (${sgn(pctAdj, `${Math.round(Math.abs(pctAdj))}%`)})` },
  ];
  return (
    <Card
      n={3}
      side={side}
      k="balance"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { intake: ltr(kcalT(intake)), tdee: ltr(kcalT(tdee)), kg: ltr(sgn(bal, `${f2(Math.abs(weeklyFromDaily(bal)))} kg`)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((intake - lo) / (hi - lo)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="tdee-c3">
          {/* Fulcrum */}
          <path d={`M ${cx} ${cy} L ${cx - 26} ${cy + 70} L ${cx + 26} ${cy + 70} Z`} style={{ fill: "var(--ph-neutral)" }} opacity={0.75} />
          <line x1={cx - 60} y1={cy + 70} x2={cx + 60} y2={cy + 70} style={LINE} strokeWidth={3} />
          {/* Beam */}
          <line x1={px2(lx)} y1={px2(ly)} x2={px2(rx)} y2={px2(ry)} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "bal" ? 6 : 4.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={6} style={{ fill: "var(--ph-ink)" }} />
          {/* Pans with blocks sized by kcal */}
          {[
            { x: lx, y: ly, v: intake, color: COLORS.intake, key: "in", label: t("inLabel") },
            { x: rx, y: ry, v: tdee, color: COLORS.eat, key: "out", label: t("outLabel") },
          ].map((p) => {
            const h = p.v * bScale;
            return (
              <g key={p.key}>
                <line x1={px2(p.x - 34)} y1={px2(p.y + 4)} x2={px2(p.x + 34)} y2={px2(p.y + 4)} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} />
                <rect x={px2(p.x - 26)} y={px2(p.y - h)} width={52} height={px2(h)} rx={4} style={{ fill: p.color, ...lit(hover === p.key) }} />
                <T x={px2(p.x)} y={px2(p.y - h - 22)} text={p.label} size={10.5} bold />
                <T x={px2(p.x)} y={px2(p.y - h - 8)} text={k0(p.v)} size={12} bold style={INK} />
              </g>
            );
          })}
          <T x={cx} y={cy + 92} text={`${sgn(bal, `${k0(Math.abs(bal))} kcal/day`)} · ${tg(`gauge.${zone.key}`)}`} size={12} bold style={{ fill: zone.color }} />
          <SvgTrack W={W} y={trackY} frac={(intake - lo) / (hi - lo)} lo={k0(lo)} hi={k0(hi)} />
        </Drawing>
      }
    />
  );
}

// ── 4. Trend line: 16-week weight simulator, simple 7700 rule vs adaptive TDEE (wow) ─────────
const WEEKS = 16;
export function TDEEProjectionCard({ side }: { side: Side }) {
  const { weeklyKg, weightKg } = useBase();
  return <Projection key={`${weeklyKg}-${weightKg}`} side={side} />;
}
function Projection({ side }: { side: Side }) {
  const { t } = useCardText("projection");
  const { weightKg: w0, tdee, bmr, m, bodyFat, weeklyKg } = useBase();
  const s = useStepper(weeklyKg === 0 ? -0.5 : weeklyKg, { min: -1, max: 0.5, step: 0.05 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const PL = 46;
  const PR = 16;
  const top = 20;
  const rate = s.value;
  const intake = tdee + dailyFromWeekly(rate);
  // BMR gained or lost per kg of body weight: Mifflin 10 kcal/kg, Katch 21.6 × lean share.
  const dBdW = bodyFat !== null ? 21.6 * (1 - bodyFat / 100) : 10;
  const adaptive: number[] = [w0];
  let w = w0;
  for (let day = 1; day <= WEEKS * 7; day++) {
    const tdeeW = (bmr + dBdW * (w - w0)) * m;
    w += (intake - tdeeW) / KCAL_KG;
    if (day % 7 === 0) adaptive.push(w);
  }
  const simple = Array.from({ length: WEEKS + 1 }, (_, i) => w0 + rate * i);
  const all = [...adaptive, ...simple];
  const span = Math.max(4, Math.max(...all) - Math.min(...all));
  const yLo = Math.min(...all) - span * 0.12;
  const yHi = Math.max(...all) + span * 0.12;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => {
    const base = H - 34;
    const wv = yLo + ((base - y) / (base - top)) * (yHi - yLo);
    return (wv - w0) / WEEKS;
  });
  const { W, H } = d;
  const base = H - 34;
  const xw = (i: number) => PL + (i / WEEKS) * (W - PL - PR);
  const yw = (v: number) => base - ((v - yLo) / (yHi - yLo)) * (base - top);
  const pts = (arr: number[]) => arr.map((v, i) => `${px2(xw(i))},${px2(yw(v))}`).join(" ");
  const ticks = [0, 4, 8, 12, 16];
  const step = span > 12 ? 4 : span > 6 ? 2 : 1;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yLo / step) * step; v <= yHi; v += step) yTicks.push(v);
  const ref = 12;
  const valueText = `${sgn(rate, f2(Math.abs(rate)))} kg/wk`;
  const rows: KitRow[] = [
    { key: "intake", label: `${k0(tdee)} ${rate < 0 ? "−" : "+"} ${f2(Math.abs(rate))} × 7700 ÷ 7`, value: kcalT(intake), isKey: true },
    { key: "w4", label: t("rowWeek", { n: 4 }), value: kgT(adaptive[4]) },
    { key: "w8", label: t("rowWeek", { n: 8 }), value: kgT(adaptive[8]) },
    { key: "w12", label: t("rowWeek", { n: 12 }), value: `${kgT(adaptive[12])} · ${f1(adaptive[12] * LB)} lb` },
    { key: "simple", label: t("rowSimple"), value: kgT(simple[WEEKS]) },
    { key: "adapt", label: t("rowAdaptive"), value: kgT(adaptive[WEEKS]) },
    { key: "gap", label: t("rowGap"), value: `${f2(Math.abs(simple[WEEKS] - adaptive[WEEKS]))} kg` },
  ];
  return (
    <Card
      n={4}
      side={side}
      k="projection"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { intake: ltr(kcalT(intake)), w: ltr(kgT(adaptive[WEEKS])), simple: ltr(kgT(simple[WEEKS])) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xw(WEEKS), y: yw(simple[WEEKS]), dir: "vertical" }} s={s} testId="tdee-c4">
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PL} y1={yw(v)} x2={W - PR} y2={yw(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yw(v) + 4} text={String(v)} anchor="end" size={10} />
            </g>
          ))}
          {ticks.map((i) => (
            <T key={i} x={xw(i)} y={base + 16} text={String(i)} size={10} />
          ))}
          <T x={W - PR} y={base + 30} text={t("weeksLabel")} anchor="end" size={10.5} bold />
          <T x={6} y={top - 6} text="kg" anchor="start" size={10.5} bold />
          <line x1={PL} y1={yw(w0)} x2={W - PR} y2={yw(w0)} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="3 4" />
          <polyline points={pts(simple)} fill="none" style={{ stroke: "var(--ph-neutral)" }} strokeWidth={hover === "simple" ? 4 : 2.5} strokeDasharray="7 5" />
          <polyline points={pts(adaptive)} fill="none" stroke={rate < 0 ? "#ef4444" : rate > 0 ? "#10b981" : COLORS.bmr} strokeWidth={hover === "adapt" ? 4.5 : 3.2} strokeLinejoin="round" />
          {adaptive.map((v, i) => (
            <circle key={i} cx={px2(xw(i))} cy={px2(yw(v))} r={(hover === "w4" && i === 4) || (hover === "w8" && i === 8) ? 6 : 2.6} style={{ fill: "var(--ph-ink)" }} />
          ))}
          {/* Reference point: week 12 on the adaptive curve */}
          <circle cx={px2(xw(ref))} cy={px2(yw(adaptive[ref]))} r={hover === "w12" ? 9 : 7} fill="none" stroke={COLORS.intake} strokeWidth={3} />
          <T x={xw(ref)} y={yw(adaptive[ref]) + (rate < 0 ? 24 : -14)} text={kgT(adaptive[ref])} size={11.5} bold style={INK} />
          <T x={xw(WEEKS) - 22} y={yw(simple[WEEKS]) + (rate < 0 ? 20 : -12)} text={t("simpleShort")} anchor="end" size={10.5} bold style={MUTED} />
          <T x={xw(WEEKS) - 22} y={yw(adaptive[WEEKS]) + (rate < 0 ? -24 : 30)} text={t("adaptiveShort")} anchor="end" size={10.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 5. Gradient gauge: daily adjustment as a share of TDEE, in five zones ────────────────────
export function TDEEAdjustmentGaugeCard({ side }: { side: Side }) {
  const { tdee, dailyTarget } = useBase();
  return <AdjustmentGauge key={`${Math.round(tdee)}-${Math.round(dailyTarget)}`} side={side} />;
}
function AdjustmentGauge({ side }: { side: Side }) {
  const { t, tg } = useCardText("gauge");
  const { tdee, dailyTarget } = useBase();
  const seedPct = ((dailyTarget - tdee) / tdee) * 100;
  const s = useStepper(Math.abs(seedPct) < 0.5 ? -20 : Math.round(seedPct), { min: -50, max: 50, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const geo = (W: number, H: number) => {
    const R = Math.max(70, Math.min(W / 2 - 50, H - 86));
    return { cx: W / 2, cy: H - 58, R };
  };
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const { cx, cy } = geo(W, H);
    const a = Math.atan2(Math.max(0, cy - y), x - cx);
    return -50 + (1 - a / Math.PI) * 100;
  });
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const ang = (p: number) => Math.PI * (1 - (clamp(p, -50, 50) + 50) / 100);
  const pt = (p: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(p))), px2(cy - r * Math.sin(ang(p)))];
  const arc = (p0: number, p1: number, r: number) => {
    const [x0, y0] = pt(p0, r);
    const [x1, y1] = pt(p1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const pct = s.value;
  const adj = (tdee * pct) / 100;
  const zone = gaugeZone(pct);
  const [nx, ny] = pt(pct, R - 18);
  const valueText = sgn(pct, `${Math.abs(pct)}%`);
  const rows: KitRow[] = [
    { key: "pct", label: t("rowPct"), value: valueText },
    { key: "adj", label: `${k0(tdee)} × ${valueText}`, value: sgn(adj, kcalT(Math.abs(adj))) },
    { key: "intake", label: t("rowIntake"), value: kcalT(tdee + adj), isKey: true },
    { key: "week", label: `× 7 ÷ ${k0(KCAL_KG)}`, value: sgn(adj, `${f2(Math.abs(weeklyFromDaily(adj)))} kg/wk`) },
    { key: "zone", label: t("rowZone"), value: tg(`gauge.${zone.key}`) },
    { key: "aggr", label: t("rowAggressive"), value: Math.abs(pct) > 35 ? t("yes") : t("no") },
  ];
  return (
    <Card
      n={5}
      side={side}
      k="gauge"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { pct: ltr(valueText), zone: tg(`gauge.${zone.key}`), intake: ltr(kcalT(tdee + adj)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: nx, y: ny, dir: "circular" }} s={s} testId="tdee-c5">
          {GAUGE_ZONES.map((z) => {
            const on = z.key === zone.key;
            return <path key={z.key} d={arc(z.from, z.to, R)} fill="none" stroke={z.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.5} />;
          })}
          {[-50, -35, -10, 0, 10, 35, 50].map((p) => {
            const [x, y] = pt(p, R + 24);
            return <T key={p} x={x} y={y + 4} text={`${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(p)}%`} size={10.5} bold={p === 0} style={p === 0 ? INK : MUTED} />;
          })}
          <path d={arc(-50, -35, R - 34)} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} opacity={hover === "aggr" ? 1 : 0.35} />
          <path d={arc(35, 50, R - 34)} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} opacity={hover === "aggr" ? 1 : 0.35} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "pct" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`${kcalT(tdee + adj)} · ${valueText}`} size={15} bold style={INK} />
          <T x={cx} y={cy + 44} text={tg(`gauge.${zone.key}`)} size={11.5} bold style={{ fill: zone.color }} />
        </Drawing>
      }
    />
  );
}

// ── 6. Sensitivity trio: TDEE younger / now / older (Mifflin: −5 kcal of BMR per year) ───────
export function TDEEAgeSensitivityCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("age");
  const { age, bmr, m, bodyFat } = useBase();
  const s = useStepper(10, { min: 1, max: 20, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 19);
  const { W, H } = d;
  const dy = s.value;
  // Katch-McArdle has no age term: the trio is flat when body fat is given.
  const perYear = bodyFat !== null ? 0 : 5;
  const youngA = Math.max(1, age - dy);
  const cols = [
    { key: "young", a: youngA, b: bmr + perYear * (age - youngA) },
    { key: "now", a: age, b: bmr },
    { key: "old", a: age + dy, b: bmr - perYear * dy },
  ];
  const top = 40;
  const base = H - 84;
  const vmax = Math.max(...cols.map((c) => c.b * m)) * 1.08;
  const yv = (v: number) => base - (v / vmax) * (base - top);
  const cw = (W - 2 * X0) / 3;
  const trackY = H - 34;
  const valueText = `± ${dy} ${tv("years")}`;
  const rows: KitRow[] = [
    { key: "young", label: t("rowAt", { a: youngA }), value: kcalT(cols[0].b * m) },
    { key: "now", label: t("rowAt", { a: age }), value: kcalT(bmr * m), isKey: true },
    { key: "old", label: t("rowAt", { a: age + dy }), value: kcalT(cols[2].b * m) },
    { key: "year", label: `${perYear} × ${f2(m)}`, value: `−${f1(perYear * m)} kcal/${tv("yearShort")}` },
    { key: "decade", label: t("rowDecade"), value: `−${k0(perYear * m * 10)} kcal` },
  ];
  return (
    <Card
      n={6}
      side={side}
      k="age"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={bodyFat !== null ? t("captionKatch") : t("caption", { d: ltr(String(dy)), v: ltr(kcalT(perYear * m * dy)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((dy - 1) / 19) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="tdee-c6">
          {cols.map((c, ci) => {
            const v = c.b * m;
            const x = X0 + cw * ci + cw * 0.18;
            const w = cw * 0.64;
            const on = c.key === "now";
            return (
              <g key={c.key}>
                <rect x={x} y={yv(v)} width={w} height={base - yv(v)} rx={5} style={{ fill: on ? COLORS.intake : COLORS.bmr, opacity: on ? 1 : 0.6, ...lit(hover === c.key) }} />
                <rect x={x} y={yv(c.b)} width={w} height={base - yv(c.b)} rx={5} style={{ fill: "#000", opacity: 0.12 }} />
                <T x={x + w / 2} y={yv(v) - 8} text={k0(v)} size={on ? 14 : 12} bold style={INK} />
                <T x={x + w / 2} y={base + 16} text={`${tv("ageShort")} ${c.a}`} size={11} bold={on} style={on ? INK : MUTED} />
                {ci !== 1 && <T x={x + w / 2} y={base + 30} text={sgn(v - bmr * m, k0(Math.abs(v - bmr * m)))} size={10.5} />}
              </g>
            );
          })}
          <T x={X0} y={18} text="TDEE · kcal/day" anchor="start" size={10.5} bold />
          <SvgTrack W={W} y={trackY} frac={(dy - 1) / 19} lo="1" hi="20" />
        </Drawing>
      }
    />
  );
}

// ── 7. Ranked bars: TDEE by four published BMR equations ─────────────────────────────────────
export function TDEEFormulaBarsCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("formulas");
  const { weightKg, heightCm, age, gender, m, bodyFat } = useBase();
  const s = useStepper(bodyFat !== null ? 2 : 0, { min: 0, max: BMR_FORMULAS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const bmi = weightKg / (heightCm / 100) ** 2;
  const bf = bodyFat ?? clamp(deurenberg(bmi, age, gender), 3, 60);
  const bars = BMR_FORMULAS.map((f, fi) => ({ ...f, fi, b: bmrBy(f.key, weightKg, heightCm, age, gender, bf) }))
    .map((b) => ({ ...b, v: b.b * m }))
    .sort((a, b) => b.v - a.v);
  const LW = 112;
  const top = 18;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => bars[clamp(Math.floor(((y - top) / (H - top - 30)) * bars.length), 0, bars.length - 1)].fi);
  const { W, H } = d;
  const rowH = (H - top - 30) / bars.length;
  const vmax = Math.max(...bars.map((b) => b.v)) * 1.1;
  const xv = (v: number) => LW + (v / vmax) * (W - LW - X0);
  const f = BMR_FORMULAS[s.value];
  const sel = bars.findIndex((b) => b.fi === s.value);
  const fb = bars[sel];
  const mif = mifflin(weightKg, heightCm, age, gender) * m;
  const valueText = t(`names.${f.key}`);
  const rows: KitRow[] = [
    { key: "f", label: t("rowFormula"), value: f.text },
    { key: "b", label: "BMR", value: kcalT(fb.b) },
    { key: "v", label: `${k0(fb.b)} × ${m}`, value: kcalT(fb.v), isKey: true },
    { key: "mif", label: t("rowVsMifflin"), value: sgn(fb.v - mif, kcalT(Math.abs(fb.v - mif))) },
    { key: "bf", label: bodyFat !== null ? tv("bfGiven") : tv("bfEstimated"), value: `${f1(bf)}%` },
    { key: "spread", label: t("rowSpread"), value: kcalT(bars[0].v - bars[bars.length - 1].v) },
  ];
  return (
    <Card
      n={7}
      side={side}
      k="formulas"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { name: valueText, v: ltr(kcalT(fb.v)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xv(fb.v) + 14, y: top + rowH * (sel + 0.5), dir: "vertical" }} s={s} testId="tdee-c7">
          <line x1={LW} y1={top - 6} x2={LW} y2={H - 26} style={LINE} strokeWidth={1.5} />
          <line x1={xv(mif)} y1={top - 6} x2={xv(mif)} y2={H - 26} style={{ stroke: "var(--ph-ink)" }} strokeDasharray="4 4" strokeWidth={hover === "mif" ? 2.5 : 1.2} />
          {bars.map((b, bi) => {
            const y = top + rowH * bi + rowH * 0.2;
            const bh = rowH * 0.6;
            const on = bi === sel;
            return (
              <g key={b.key}>
                <T x={LW - 8} y={y + bh / 2 + 4} text={t(`names.${b.key}`)} anchor="end" size={10.5} bold={on} style={on ? INK : MUTED} />
                <rect x={LW} y={y} width={Math.max(0, xv(b.v) - LW)} height={bh} rx={4} style={{ fill: on ? COLORS.intake : COLORS.bmr, opacity: on ? 1 : 0.5, ...lit(on && hover === "v") }} />
                <T x={LW + 8} y={y + bh / 2 + 4} text={k0(b.v)} anchor="start" size={11} bold style={{ fill: "#fff" }} />
              </g>
            );
          })}
          <T x={W - X0} y={H - 8} text={`TDEE · kcal/day · ×${m}`} anchor="end" size={10.5} bold />
        </Drawing>
      }
    />
  );
}

// ── 8. Formula diagram: the Mifflin-St Jeor terms, × activity = TDEE (drag the weight) ──────
export function TDEEFormulaDiagramCard({ side }: { side: Side }) {
  const { weightKg } = useBase();
  return <FormulaDiagram key={weightKg} side={side} />;
}
function FormulaDiagram({ side }: { side: Side }) {
  const { t, tv } = useCardText("formula");
  const { weightKg, heightCm, age, gender, m } = useBase();
  const lo = Math.max(30, Math.round(weightKg - 30));
  const hi = Math.round(weightKg + 30);
  const s = useStepper(Math.round(weightKg * 2) / 2, { min: lo, max: hi, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const w = s.value;
  const terms = [
    { key: "w", text: `10 × ${f1(w)}`, v: 10 * w, color: COLORS.bmr },
    { key: "h", text: `6.25 × ${f1(heightCm)}`, v: 6.25 * heightCm, color: COLORS.tef },
    { key: "a", text: `−5 × ${age}`, v: -5 * age, color: "#ef4444" },
    { key: "s", text: gender === "male" ? "+5" : "−161", v: gender === "male" ? 5 : -161, color: COLORS.neat },
  ];
  const bmr = mifflin(w, heightCm, age, gender);
  const tdee = bmr * m;
  const posMax = 10 * hi + 6.25 * heightCm + 5;
  const scaleMax = Math.max(posMax, tdee) * 1.04;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * (scaleMax / 10));
  const { W, H } = d;
  const xk = (v: number) => X0 + (v / scaleMax) * (W - 2 * X0);
  const rowY = [34, 78, 122, 166];
  const bh = 24;
  // Running sum: each term starts where the previous one ended (negative terms run back).
  const bars = terms.map((tm, i) => {
    const a = terms.slice(0, i).reduce((sum, q) => sum + q.v, 0);
    return { ...tm, a, b: a + tm.v };
  });
  const yB = H - 74;
  const yT = H - 30;
  const valueText = `${f1(w)} kg`;
  const rows: KitRow[] = [
    { key: "w", label: "10 × W", value: `${f1(10 * w)}` },
    { key: "h", label: "6.25 × H", value: f2(6.25 * heightCm) },
    { key: "a", label: "−5 × A", value: `−${5 * age}` },
    { key: "s", label: tv(gender === "male" ? "sexMale" : "sexFemale"), value: gender === "male" ? "+5" : "−161" },
    { key: "bmr", label: "BMR", value: kcalT(bmr), isKey: true },
    { key: "tdee", label: `× ${m}`, value: kcalT(tdee), isKey: true },
    { key: "perkg", label: t("rowPerKg"), value: `+${f1(10 * m)} kcal` },
  ];
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
      caption={t("caption", { w: ltr(valueText), bmr: ltr(kcalT(bmr)), tdee: ltr(kcalT(tdee)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xk(10 * w), y: rowY[0] + bh / 2, dir: "horizontal" }} s={s} testId="tdee-c8">
          {bars.map((b, bi) => {
            const x1 = xk(Math.min(b.a, b.b));
            const x2 = xk(Math.max(b.a, b.b));
            const y = rowY[bi];
            return (
              <g key={b.key}>
                {bi > 0 && <line x1={xk(b.a)} y1={rowY[bi - 1] + bh} x2={xk(b.a)} y2={y} style={LINE} strokeDasharray="3 3" />}
                <rect x={x1} y={y} width={Math.max(2, x2 - x1)} height={bh} rx={4} style={{ fill: b.color, opacity: b.v < 0 ? 0.8 : 1, ...lit(hover === b.key) }} />
                <T x={b.v < 0 ? x1 - 6 : x2 + (bi === 0 ? 20 : 6)} y={y + bh / 2 + 4} text={b.text} anchor={b.v < 0 ? "end" : "start"} size={11} bold style={INK} />
              </g>
            );
          })}
          {/* BMR = the sum; TDEE = BMR × activity */}
          <rect x={X0} y={yB} width={Math.max(2, xk(bmr) - X0)} height={bh} rx={4} style={{ fill: COLORS.bmr, ...lit(hover === "bmr") }} />
          <T x={xk(bmr) + 6} y={yB + bh / 2 + 4} text={`BMR ${k0(bmr)}`} anchor="start" size={11.5} bold style={INK} />
          <rect x={X0} y={yT} width={Math.max(2, xk(tdee) - X0)} height={bh} rx={4} style={{ fill: COLORS.eat, ...lit(hover === "tdee") }} />
          <T x={Math.min(xk(tdee) + 6, W - 120)} y={yT + bh / 2 + 4} text={`TDEE ${k0(tdee)}`} anchor="start" size={11.5} bold style={xk(tdee) + 6 > W - 120 ? { fill: "#fff" } : INK} />
          <T x={X0} y={yT - 6} text={`× ${m}`} anchor="start" size={10.5} bold />
          <T x={W - X0} y={16} text="Mifflin-St Jeor · kcal/day" anchor="end" size={10.5} bold />
        </Drawing>
      }
    />
  );
}
