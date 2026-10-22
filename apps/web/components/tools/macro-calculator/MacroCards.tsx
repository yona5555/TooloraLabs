"use client";
import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1, f2 } from "@/components/tool-ui/indicator-kit/format";
import { useMacroLive } from "./MacroLiveContext";
import {
  AMDR,
  COLORS,
  FOODS,
  GOALS,
  GOAL_COLORS,
  KCAL_G,
  MACROS,
  PROTEIN_ZONES,
  REF_WEIGHT_KG,
  SYMBOL,
  gT,
  gramsOf,
  inAmdr,
  k0,
  kcalT,
  proteinZone,
  sgn,
  splitFor,
} from "./macros";
import type { MacroGoal } from "./types";

/**
 * The eight macro indicator cards (§31 library). All read the calculator's live result (calories,
 * goal, protein, carbs, fat) through MacroLiveContext. The calories stack card writes the calorie
 * total and the AMDR card writes the goal back, so dragging them moves the inputs, the Result
 * table and the 3D plate. The other cards keep a what-if value of their own on top of the live
 * result (re-seeded when it changes). Numbers here use Western digits, like the BMI cards.
 * Drag handles sit on their own tracks or points; no value label is ever drawn under a handle.
 */
export type Side = "visual-left" | "table-left";
const X0 = 30;
/** Clear distance under a track for its end labels: the 44px handle never covers them. */
const TRACK_LABEL_DY = 38;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.macro-calculator.visuals.${key}`),
    tv: useTranslations("tools.macro-calculator.visuals.common"),
    tm: useTranslations("tools.macro-calculator.result"),
    tGoal: useTranslations("tools.macro-calculator.goals.labels"),
    tc: useTranslations("toolPage.indicatorKit"),
  };
}

function useBase() {
  return useMacroLive().snap;
}

/**
 * A what-if track along the bottom of a card's SVG; its labels sit below the handle's reach.
 * Shared by the health tools' cards. `stopAnchor` sets how stop labels anchor: "ends" (first
 * start, last end, others middle; default), "middle" (all middle) or "frac" (by position 0/1).
 * A stop without text draws only its dot.
 */
export function SvgTrack({ W, y, frac, lo, hi, stops, stopAnchor = "ends" }: { W: number; y: number; frac: number; lo?: string; hi?: string; stops?: { frac: number; text?: string; on?: boolean }[]; stopAnchor?: "ends" | "middle" | "frac" }) {
  const x = X0 + clamp(frac, 0, 1) * (W - 2 * X0);
  return (
    <g>
      <line x1={X0} y1={y} x2={W - X0} y2={y} style={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <line x1={X0} y1={y} x2={x} y2={y} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
      {lo && <T x={X0} y={y + TRACK_LABEL_DY} text={lo} anchor="start" size={10.5} />}
      {hi && <T x={W - X0} y={y + TRACK_LABEL_DY} text={hi} anchor="end" size={10.5} />}
      {stops?.map((st, i) => {
        const sx = X0 + st.frac * (W - 2 * X0);
        const anchor =
          stopAnchor === "middle"
            ? "middle"
            : stopAnchor === "frac"
              ? st.frac <= 0 ? "start" : st.frac >= 1 ? "end" : "middle"
              : i === 0 ? "start" : i === stops.length - 1 ? "end" : "middle";
        return (
          <g key={i}>
            <circle cx={sx} cy={y} r={3.5} style={{ fill: "var(--ph-ink-muted)" }} />
            {st.text && <T x={sx} y={y + TRACK_LABEL_DY} text={st.text} anchor={anchor} size={9.5} bold={st.on} style={st.on ? INK : MUTED} />}
          </g>
        );
      })}
    </g>
  );
}

/**
 * One 2D indicator card. Shared by the health tools: `tool` is the tool slug whose
 * `tools.<tool>.visuals.<k>` holds title/subtitle, `idPrefix` names its ids and test ids.
 */
export function Card({ n, side, k, caption, s, valueText, rows, hover, setHover, visual, tool = "macro-calculator", idPrefix = "macro" }: { n: number; side: Side; k: string; caption: string; s: Stepper; valueText: string; rows: KitRow[]; hover: string | null; setHover: (v: string | null) => void; visual: ReactNode; tool?: string; idPrefix?: string }) {
  const t = useTranslations(`tools.${tool}.visuals.${k}`);
  const tc = useTranslations("toolPage.indicatorKit");
  return (
    <IndicatorCard
      idPrefix={idPrefix}
      n={n}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      controls={<KitControls s={s} valueText={valueText} testId={`${idPrefix}-c${n}`} />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={visual}
    />
  );
}

/** A stepper whose value lives in the calculator (writes go straight back to it). */
export function useSharedStepper(value: number, write: (v: number) => void, { min, max, step }: { min: number; max: number; step: number }): Stepper {
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

// ── 1. Annotated reference point: drag your split inside the macro triangle (wow) ────────────
export function MacroMixerCard({ side }: { side: Side }) {
  const { goal } = useBase();
  return <Mixer key={goal} side={side} />;
}
const P_MIN = 8;
const P_MAX = 50;
const F_MIN = 10;
const F_MAX = 50;
const C_MIN = 20;
/** Highest protein share drawn in the zoomed triangle. */
const PV = 60;
/** The mixer's drag handle sits this far right of the what-if point. */
const HANDLE_DX = 46;
function Mixer({ side }: { side: Side }) {
  const { t, tm, tGoal } = useCardText("mixer");
  const snap = useBase();
  const kcal = snap.calories;
  const s = useStepper(Math.round(snap.protein.percent), { min: P_MIN, max: P_MAX, step: 1 });
  const [fatRaw, setFat] = useState(Math.round(snap.fat.percent));
  const [hover, setHover] = useState<string | null>(null);
  const clipId = useId();
  const HMIN = 400;
  // Zoomed view: only the lower 60 % of protein is drawn (a trapezoid), since every useful split
  // has less protein than that; the plotted area is about 1.6× a whole triangle in the same box.
  const geo = (W: number, H: number) => {
    const L = Math.max(180, Math.min(W - 60, (H - 34 - 124) / (PV / 100) / 0.866));
    const h = L * 0.866;
    return { L, h, cx: W / 2, base: 34 + (PV / 100) * h };
  };
  const d = useDrawing(HMIN, s, (xRaw, y, W, H) => {
    const { L, h, cx, base } = geo(W, H);
    // The handle rides HANDLE_DX to the right of the point (so it never hides the goal dots).
    const x = xRaw - HANDLE_DX;
    const p = clamp(((base - y) / h) * 100, P_MIN, P_MAX);
    const f = ((100 - p) + ((x - cx) * 200) / L) / 2;
    setFat(Math.round(clamp(f, F_MIN, Math.min(F_MAX, 100 - C_MIN - p))));
    return p;
  });
  const { W, H } = d;
  const { L, h, cx, base } = geo(W, H);
  const P = s.value;
  const F = clamp(fatRaw, F_MIN, Math.min(F_MAX, 100 - C_MIN - P));
  const C = 100 - P - F;
  const pt = (p: number, c: number, f: number): [number, number] => [px2(cx + ((f - c) / 100) * (L / 2)), px2(base - (p / 100) * h)];
  const vC = pt(0, 100, 0);
  const vF = pt(0, 0, 100);
  const tC = pt(PV, 100 - PV, 0);
  const tF = pt(PV, 0, 100 - PV);
  const trap = `${tC.join(",")} ${vC.join(",")} ${vF.join(",")} ${tF.join(",")}`;
  // AMDR polygon: every crossing of two band edges that satisfies all three bands, in angle order.
  const cand: [number, number, number][] = [];
  for (const a of AMDR.protein) for (const b of AMDR.carbs) cand.push([a, b, 100 - a - b]);
  for (const a of AMDR.protein) for (const b of AMDR.fat) cand.push([a, 100 - a - b, b]);
  for (const a of AMDR.carbs) for (const b of AMDR.fat) cand.push([100 - a - b, a, b]);
  const poly = cand.filter(([p, c, f]) => inAmdr("protein", p) && inAmdr("carbs", c) && inAmdr("fat", f)).map(([p, c, f]) => pt(p, c, f));
  const mx = poly.reduce((a, q) => a + q[0], 0) / Math.max(1, poly.length);
  const my = poly.reduce((a, q) => a + q[1], 0) / Math.max(1, poly.length);
  poly.sort((a, b) => Math.atan2(a[1] - my, a[0] - mx) - Math.atan2(b[1] - my, b[0] - mx));
  const goals = GOALS.map((g) => ({ g, sp: splitFor(kcal, g)! }));
  const nearest = goals
    .map(({ g, sp }) => ({ g, dist: Math.hypot(sp.protein.percent - P, sp.carbs.percent - C, sp.fat.percent - F) }))
    .sort((a, b) => a.dist - b.dist)[0];
  const ok = inAmdr("protein", P) && inAmdr("carbs", C) && inAmdr("fat", F);
  const [hx, hy] = pt(P, C, F);
  const valueText = `P ${P} · C ${C} · F ${F} %`;
  const grams = { protein: gramsOf("protein", kcal, P), carbs: gramsOf("carbs", kcal, C), fat: gramsOf("fat", kcal, F) };
  const rows: KitRow[] = [
    { key: "protein", label: `${tm("protein")}: ${k0(kcal)} × ${P}% ÷ 4`, value: gT(grams.protein), isKey: true },
    { key: "carbs", label: `${tm("carbs")}: ${k0(kcal)} × ${C}% ÷ 4`, value: gT(grams.carbs) },
    { key: "fat", label: `${tm("fat")}: ${k0(kcal)} × ${F}% ÷ 9`, value: gT(grams.fat) },
    { key: "amdr", label: t("rowAmdr"), value: ok ? t("inside") : t("outside") },
    { key: "near", label: t("rowNearest"), value: tGoal(nearest.g) },
    { key: "vs", label: t("rowVsYours"), value: sgn(grams.protein - snap.protein.grams, gT(Math.abs(grams.protein - snap.protein.grams))) },
  ];
  const legend = [...GOALS.map((g) => ({ key: g, color: GOAL_COLORS[g], text: tGoal(g) })), { key: "amdr", color: "#22c55e", text: "AMDR (IOM)" }];
  const colW = (W - 2 * X0) / 2;
  return (
    <Card
      n={1}
      side={side}
      k="mixer"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { split: ltr(valueText), state: ok ? t("inside") : t("outside") })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: hx + HANDLE_DX, y: hy, dir: "free" }} s={s} testId="macro-c1">
          <defs>
            <clipPath id={clipId}>
              <polygon points={trap} />
            </clipPath>
          </defs>
          <polygon points={trap} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} strokeWidth={1.5} />
          {/* 20 % grid lines for each macro, clipped to the zoomed area */}
          {[20, 40, 60, 80].map((v) => (
            <g key={v} style={{ stroke: "var(--ph-grid)" }} clipPath={`url(#${clipId})`}>
              <line x1={pt(v, 100 - v, 0)[0]} y1={pt(v, 100 - v, 0)[1]} x2={pt(v, 0, 100 - v)[0]} y2={pt(v, 0, 100 - v)[1]} />
              <line x1={pt(0, v, 100 - v)[0]} y1={pt(0, v, 100 - v)[1]} x2={pt(100 - v, v, 0)[0]} y2={pt(100 - v, v, 0)[1]} />
              <line x1={pt(0, 100 - v, v)[0]} y1={pt(0, 100 - v, v)[1]} x2={pt(100 - v, 0, v)[0]} y2={pt(100 - v, 0, v)[1]} />
            </g>
          ))}
          {poly.length > 2 && (
            <polygon
              points={poly.map((q) => q.join(",")).join(" ")}
              fill="#22c55e"
              fillOpacity={hover === "amdr" ? 0.45 : 0.25}
              stroke="#16a34a"
              strokeWidth={hover === "amdr" ? 2.5 : 1.5}
              strokeDasharray="5 3"
            />
          )}
          {goals.map(({ g, sp }) => {
            const [gx, gy] = pt(sp.protein.percent, sp.carbs.percent, sp.fat.percent);
            return <circle key={g} cx={gx} cy={gy} r={hover === "near" && nearest.g === g ? 8 : 6} fill={GOAL_COLORS[g]} stroke="#fff" strokeWidth={1.5} />;
          })}
          {[20, 40].map((v) => {
            const [lx, ly] = pt(v, 100 - v, 0);
            return <T key={v} x={lx - 6} y={ly + 4} text={`${v}%`} anchor="end" size={10} style={{ fill: COLORS.protein }} />;
          })}
          {/* The what-if point: a ring (goal dots stay visible inside it), tied to the handle beside it */}
          <line x1={hx + 10} y1={hy} x2={hx + HANDLE_DX - 20} y2={hy} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} />
          <circle cx={hx} cy={hy} r={10} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <circle cx={hx} cy={hy} r={2} style={{ fill: "var(--ph-ink)" }} />
          {/* Edge labels (the handle is kept ≥ 20 % from every corner) */}
          <T x={cx} y={tC[1] - 8} text={`${tm("protein")} ${PV}%`} size={11} bold style={{ fill: COLORS.protein }} />
          <T x={vC[0]} y={vC[1] + 18} text={`${tm("carbs")} 100%`} anchor="start" size={11} bold style={{ fill: COLORS.carbs }} />
          <T x={vF[0]} y={vF[1] + 18} text={`${tm("fat")} 100%`} anchor="end" size={11} bold style={{ fill: COLORS.fat }} />
          {/* Readout and legend under the triangle, out of the handle's range */}
          <T x={cx} y={H - 66} text={`${valueText} → ${k0(grams.protein)} / ${k0(grams.carbs)} / ${k0(grams.fat)} g`} size={12} bold style={INK} />
          {legend.map((lg, i) => {
            const lx = X0 + (i % 2) * colW;
            const ly = H - 44 + Math.floor(i / 2) * 17;
            return (
              <g key={lg.key}>
                <circle cx={lx + 5} cy={ly - 4} r={5} fill={lg.color} />
                <T x={lx + 15} y={ly} text={lg.text} anchor="start" size={10.5} />
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}

// ── 2. Stacked bar: the day's calories split into P / C / F (drag writes the calculator) ─────
const KMIN = 1000;
const KMAX = 5000;
export function MacroCaloriesStackCard({ side }: { side: Side }) {
  const { t, tm } = useCardText("stack");
  const { snap, setCalories } = useMacroLive();
  const kcal = snap.calories;
  const s = useSharedStepper(clamp(kcal, KMIN, KMAX), setCalories, { min: KMIN, max: KMAX, step: 50 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 280;
  const d = useDrawing(HMIN, s, (x, _y, W) => KMIN + ((x - X0) / (W - 2 * X0)) * (KMAX - KMIN));
  const { W, H } = d;
  const xk = (v: number) => X0 + (v / KMAX) * (W - 2 * X0);
  const by = 58;
  const bh = 52;
  const segs = MACROS.map((m, i) => {
    const a = MACROS.slice(0, i).reduce((sum, q) => sum + snap[q].calories, 0);
    return { m, a, b: a + snap[m].calories };
  });
  const trackY = H - 56;
  const valueText = kcalT(kcal);
  const rows: KitRow[] = [
    ...MACROS.map((m) => ({ key: m, label: `${tm(m)} (${Math.round(snap[m].percent)}%)`, value: `${kcalT(snap[m].calories)} · ${gT(snap[m].grams)}` })),
    { key: "sum", label: MACROS.map((m) => k0(snap[m].calories)).join(" + "), value: kcalT(kcal), isKey: true },
    { key: "per100", label: t("rowPer100"), value: MACROS.map((m) => `${f1((snap[m].percent / KCAL_G[m]))}`).join(" / ") + " g" },
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
      caption={t("caption", { kcal: ltr(kcalT(kcal)), p: ltr(gT(snap.protein.grams)), c: ltr(gT(snap.carbs.grams)), f: ltr(gT(snap.fat.grams)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((s.value - KMIN) / (KMAX - KMIN)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c2">
          <T x={X0} y={20} text={`${kcalT(kcal)} / day`} anchor="start" size={13} bold style={INK} />
          {[0, 1000, 2000, 3000, 4000, 5000].map((v) => (
            <g key={v}>
              <line x1={xk(v)} y1={by - 8} x2={xk(v)} y2={by + bh + 4} style={{ stroke: "var(--ph-grid)" }} />
              <T x={xk(v)} y={by - 12} text={k0(v)} size={9.5} />
            </g>
          ))}
          {segs.map((g) => {
            const w = Math.max(0, xk(g.b) - xk(g.a));
            return (
              <g key={g.m}>
                <rect x={xk(g.a)} y={by} width={w} height={bh} style={{ fill: COLORS[g.m], ...lit(hover === g.m || hover === "sum") }} />
                {w > 36 && <T x={xk(g.a) + w / 2} y={by + bh / 2 - 2} text={SYMBOL[g.m]} size={12} bold style={{ fill: "#fff" }} />}
                {w > 36 && <T x={xk(g.a) + w / 2} y={by + bh / 2 + 14} text={`${Math.round(snap[g.m].percent)}%`} size={10.5} style={{ fill: "#fff" }} />}
              </g>
            );
          })}
          {/* Grams per macro under the bar */}
          {MACROS.map((m, i) => {
            const lx = X0 + i * ((W - 2 * X0) / 3);
            return (
              <g key={`lg${m}`}>
                <rect x={lx} y={by + bh + 18} width={10} height={10} rx={2} style={{ fill: COLORS[m] }} />
                <T x={lx + 14} y={by + bh + 27} text={`${tm(m)}`} anchor="start" size={10.5} bold style={INK} />
                <T x={lx + 14} y={by + bh + 42} text={`${gT(snap[m].grams)} · ${k0(snap[m].calories)} kcal`} anchor="start" size={10} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(s.value - KMIN) / (KMAX - KMIN)} lo={k0(KMIN)} hi={k0(KMAX)} />
        </Drawing>
      }
    />
  );
}

// ── 3. Zone strips: each macro's share on its AMDR band (drag across goals writes the goal) ──
export function MacroAmdrCard({ side }: { side: Side }) {
  const { t, tm, tGoal } = useCardText("amdr");
  const { snap, setGoal } = useMacroLive();
  const s = useSharedStepper(GOALS.indexOf(snap.goal), (i) => setGoal(GOALS[i] as MacroGoal), { min: 0, max: GOALS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 380;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * (GOALS.length - 1));
  const { W, H } = d;
  const PMAX = 70;
  const xp = (v: number) => X0 + (v / PMAX) * (W - 2 * X0);
  const rowY = [48, 136, 224];
  const sh = 18;
  const trackY = H - 52;
  const goal = GOALS[s.value];
  const valueText = tGoal(goal);
  const rows: KitRow[] = [
    { key: "goal", label: t("rowGoal"), value: valueText },
    ...MACROS.map((m) => ({
      key: m,
      label: `${tm(m)} (AMDR ${AMDR[m][0]}–${AMDR[m][1]}%)`,
      value: `${Math.round(snap[m].percent)}% ${inAmdr(m, snap[m].percent) ? "✓" : "✗"}`,
      isKey: m === "protein",
    })),
    { key: "room", label: t("rowRoom"), value: `${Math.round(AMDR.protein[1] - snap.protein.percent)}% · ${gT(gramsOf("protein", snap.calories, AMDR.protein[1] - snap.protein.percent))}` },
  ];
  return (
    <Card
      n={3}
      side={side}
      k="amdr"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { goal: valueText, p: ltr(`${Math.round(snap.protein.percent)}%`), c: ltr(`${Math.round(snap.carbs.percent)}%`), f: ltr(`${Math.round(snap.fat.percent)}%`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (s.value / (GOALS.length - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c3">
          {MACROS.map((m, i) => {
            const y = rowY[i];
            const [a, b] = AMDR[m];
            const v = snap[m].percent;
            const on = hover === m;
            return (
              <g key={m}>
                <T x={X0} y={y - 26} text={tm(m)} anchor="start" size={11} bold style={{ fill: COLORS[m] }} />
                <rect x={xp(0)} y={y} width={xp(PMAX) - xp(0)} height={sh} rx={4} style={{ fill: "var(--ph-grid)" }} />
                <rect x={xp(a)} y={y} width={xp(b) - xp(a)} height={sh} rx={4} fill="#22c55e" opacity={on ? 0.75 : 0.45} />
                <T x={xp(a)} y={y + sh + 14} text={`${a}%`} size={10} />
                <T x={xp(b)} y={y + sh + 14} text={`${b}%`} size={10} />
                <line x1={xp(v)} y1={y - 4} x2={xp(v)} y2={y + sh + 4} stroke={COLORS[m]} strokeWidth={on ? 5 : 4} strokeLinecap="round" />
                <T x={xp(v) > W / 2 ? xp(v) - 6 : xp(v) + 6} y={y - 9} text={`${Math.round(v)}% · ${gT(snap[m].grams)}`} anchor={xp(v) > W / 2 ? "end" : "start"} size={11} bold style={INK} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={s.value / (GOALS.length - 1)} stops={GOALS.map((g, gi) => ({ frac: gi / (GOALS.length - 1), text: tGoal(g), on: gi === s.value }))} />
        </Drawing>
      }
    />
  );
}

// ── 4. Gradient gauge: protein per kg of body weight (reference weight is assumed, draggable) ─
export function MacroProteinGaugeCard({ side }: { side: Side }) {
  const { t, tv } = useCardText("protein");
  const snap = useBase();
  const s = useStepper(REF_WEIGHT_KG, { min: 40, max: 150, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const GMAX = 4;
  const geo = (W: number, H: number) => {
    const cy = H - 130;
    const R = Math.max(70, Math.min(W / 2 - 54, cy - 40));
    return { cx: W / 2, cy, R };
  };
  const d = useDrawing(HMIN, s, (x, _y, W) => 40 + ((x - X0) / (W - 2 * X0)) * 110);
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const w = s.value;
  const gkg = snap.protein.grams / w;
  const zone = proteinZone(gkg);
  const ang = (v: number) => Math.PI * (1 - clamp(v, 0, GMAX) / GMAX);
  const pt = (v: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(v))), px2(cy - r * Math.sin(ang(v)))];
  const arc = (v0: number, v1: number, r: number) => {
    const [x0, y0] = pt(v0, r);
    const [x1, y1] = pt(v1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const [nx, ny] = pt(gkg, R - 18);
  const trackY = H - 52;
  const valueText = `${w} kg`;
  const rows: KitRow[] = [
    { key: "w", label: s.isSeed ? tv("refWeight") : t("rowWeight"), value: `${w} kg` },
    { key: "gkg", label: `${k0(snap.protein.grams)} ÷ ${w}`, value: `${f2(gkg)} g/kg`, isKey: true },
    { key: "zone", label: t("rowZone"), value: t(`zones.${zone.key}`) },
    { key: "rda", label: `RDA 0.8 × ${w}`, value: gT(0.8 * w) },
    { key: "issn", label: `ISSN 1.4–2.0 × ${w}`, value: `${k0(1.4 * w)}–${k0(2 * w)} g` },
    { key: "meal", label: `${t("rowMeal")} 0.25–0.4 × ${w}`, value: `${k0(0.25 * w)}–${k0(0.4 * w)} g` },
  ];
  return (
    <Card
      n={4}
      side={side}
      k="protein"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { g: ltr(gT(snap.protein.grams)), w: ltr(`${w} kg`), gkg: ltr(`${f2(gkg)} g/kg`), zone: t(`zones.${zone.key}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((w - 40) / 110) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c4">
          {PROTEIN_ZONES.map((z) => {
            const on = z.key === zone.key;
            return <path key={z.key} d={arc(z.from, z.to, R)} fill="none" stroke={z.color} strokeWidth={on ? 26 : 20} opacity={on ? 1 : 0.5} />;
          })}
          {[0, 0.8, 1.4, 2, 3.1, 4].map((v) => {
            const [x, y] = pt(v, R + 26);
            return <T key={v} x={x} y={y + 4} text={String(v)} size={10.5} />;
          })}
          <path d={arc(1.4, 2, R - 32)} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} opacity={hover === "issn" ? 1 : 0.35} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "gkg" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`${f2(gkg)} g/kg · ${gT(snap.protein.grams)}`} size={15} bold style={INK} />
          <T x={cx} y={cy + 44} text={t(`zones.${zone.key}`)} size={11.5} bold style={{ fill: zone.color }} />
          <SvgTrack W={W} y={trackY} frac={(w - 40) / 110} lo="40 kg" hi="150 kg" />
        </Drawing>
      }
    />
  );
}

// ── 5. Labeled bars: grams per meal (drag the number of meals) ──────────────────────────────
export function MacroMealsCard({ side }: { side: Side }) {
  const { t, tm } = useCardText("meals");
  const snap = useBase();
  const s = useStepper(3, { min: 2, max: 6, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => 2 + ((x - X0) / (W - 2 * X0)) * 4);
  const { W, H } = d;
  const meals = s.value;
  const PL = 44;
  const top = 34;
  const base = H - 104;
  const per = MACROS.map((m) => ({ m, v: snap[m].grams / meals }));
  const vmax = Math.max(45, ...per.map((p) => p.v)) * 1.12;
  const yv = (v: number) => base - (v / vmax) * (base - top);
  const colW = (W - PL - 12) / 3;
  const trackY = H - 52;
  const pMeal = snap.protein.grams / meals;
  const valueText = `${meals} × / day`;
  const step = vmax > 160 ? 50 : vmax > 80 ? 25 : 10;
  const ticks: number[] = [];
  for (let v = 0; v <= vmax; v += step) ticks.push(v);
  const rows: KitRow[] = [
    ...per.map((p) => ({ key: p.m, label: `${tm(p.m)}: ${k0(snap[p.m].grams)} ÷ ${meals}`, value: gT(p.v), isKey: p.m === "protein" })),
    { key: "kcal", label: `${k0(snap.calories)} ÷ ${meals}`, value: kcalT(snap.calories / meals) },
    { key: "band", label: t("rowBand"), value: pMeal < 20 ? t("below") : pMeal > 40 ? t("above") : t("within") },
  ];
  return (
    <Card
      n={5}
      side={side}
      k="meals"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { n: ltr(String(meals)), p: ltr(gT(pMeal)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((meals - 2) / 4) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c5">
          <T x={6} y={16} text={t("axis")} anchor="start" size={10.5} bold />
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PL} y1={yv(v)} x2={W - 12} y2={yv(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yv(v) + 4} text={String(v)} anchor="end" size={10} />
            </g>
          ))}
          {/* ISSN per-meal protein band, 20–40 g */}
          <rect x={PL + 2} y={yv(40)} width={colW - 4} height={yv(20) - yv(40)} fill="#22c55e" opacity={hover === "band" ? 0.35 : 0.18} />
          {per.map((p, i) => {
            const x = PL + colW * i + colW * 0.2;
            const w = colW * 0.6;
            return (
              <g key={p.m}>
                <rect x={x} y={yv(p.v)} width={w} height={base - yv(p.v)} rx={5} style={{ fill: COLORS[p.m], ...lit(hover === p.m) }} />
                <T x={x + w / 2} y={yv(p.v) - 7} text={gT(p.v)} size={12.5} bold style={INK} />
                <T x={x + w / 2} y={base + 16} text={tm(p.m)} size={10.5} bold style={{ fill: COLORS[p.m] }} />
              </g>
            );
          })}
          <rect x={W - 118} y={7} width={10} height={10} rx={2} fill="#22c55e" opacity={0.5} />
          <T x={W - 12} y={16} text="ISSN 20–40 g" anchor="end" size={10} bold style={{ fill: "#16a34a" }} />
          <SvgTrack W={W} y={trackY} frac={(meals - 2) / 4} stops={[2, 3, 4, 5, 6].map((m, i) => ({ frac: i / 4, text: String(m), on: m === meals }))} />
        </Drawing>
      }
    />
  );
}

// ── 6. Sensitivity trio: grams at fewer / your / more calories ───────────────────────────────
export function MacroSensitivityCard({ side }: { side: Side }) {
  const { t } = useCardText("trio");
  const snap = useBase();
  const s = useStepper(20, { min: 5, max: 40, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => 5 + ((x - X0) / (W - 2 * X0)) * 35);
  const { W, H } = d;
  const pct = s.value;
  const cols = [
    { key: "low", kcal: snap.calories * (1 - pct / 100) },
    { key: "now", kcal: snap.calories },
    { key: "high", kcal: snap.calories * (1 + pct / 100) },
  ].map((c) => ({ ...c, g: MACROS.map((m) => ({ m, v: gramsOf(m, c.kcal, snap[m].percent) })) }));
  const top = 40;
  const base = H - 104;
  const totals = cols.map((c) => c.g.reduce((a, q) => a + q.v, 0));
  const vmax = Math.max(...totals) * 1.1;
  const yv = (v: number) => base - (v / vmax) * (base - top);
  const cw = (W - 2 * X0) / 3;
  const trackY = H - 52;
  const valueText = `± ${pct}%`;
  const dP = gramsOf("protein", snap.calories * (pct / 100), snap.protein.percent);
  const rows: KitRow[] = [
    { key: "low", label: `${k0(snap.calories)} × ${(1 - pct / 100).toFixed(2)}`, value: `${kcalT(cols[0].kcal)} · ${cols[0].g.map((q) => k0(q.v)).join("/")} g` },
    { key: "now", label: t("rowNow"), value: `${kcalT(cols[1].kcal)} · ${cols[1].g.map((q) => k0(q.v)).join("/")} g`, isKey: true },
    { key: "high", label: `${k0(snap.calories)} × ${(1 + pct / 100).toFixed(2)}`, value: `${kcalT(cols[2].kcal)} · ${cols[2].g.map((q) => k0(q.v)).join("/")} g` },
    { key: "dp", label: t("rowDeltaProtein"), value: `± ${gT(dP)}` },
    { key: "per100", label: t("rowPer100"), value: `${f1(gramsOf("protein", 100, snap.protein.percent))} / ${f1(gramsOf("carbs", 100, snap.carbs.percent))} / ${f1(gramsOf("fat", 100, snap.fat.percent))} g` },
  ];
  return (
    <Card
      n={6}
      side={side}
      k="trio"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { pct: ltr(`${pct}%`), dp: ltr(gT(dP)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((pct - 5) / 35) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c6">
          <T x={X0} y={18} text={t("axis")} anchor="start" size={10.5} bold />
          {cols.map((c, ci) => {
            const x = X0 + cw * ci + cw * 0.2;
            const w = cw * 0.6;
            const on = c.key === "now";
            const acc = c.g.reduce((sum, q) => sum + q.v, 0);
            return (
              <g key={c.key} opacity={on ? 1 : 0.8}>
                {c.g.map((q, qi) => {
                  const y0 = c.g.slice(0, qi).reduce((sum, r) => sum + r.v, 0);
                  const y1 = y0 + q.v;
                  const hgt = yv(y0) - yv(y1);
                  return (
                    <g key={q.m}>
                      <rect x={x} y={yv(y1)} width={w} height={Math.max(0, hgt)} style={{ fill: COLORS[q.m], ...lit(hover === c.key) }} />
                      {hgt > 16 && <T x={x + w / 2} y={yv(y1) + hgt / 2 + 4} text={k0(q.v)} size={10.5} bold style={{ fill: "#fff" }} />}
                    </g>
                  );
                })}
                <T x={x + w / 2} y={yv(acc) - 8} text={kcalT(c.kcal)} size={on ? 12.5 : 11} bold style={INK} />
                <T x={x + w / 2} y={base + 16} text={c.key === "now" ? t("now") : c.key === "low" ? `−${pct}%` : `+${pct}%`} size={11} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(pct - 5) / 35} lo="5%" hi="40%" />
        </Drawing>
      }
    />
  );
}

// ── 7. Flow arrows: calories → share → macro calories → ÷ kcal/g → grams ───────────────────
export function MacroFlowCard({ side }: { side: Side }) {
  const { calories } = useBase();
  return <Flow key={Math.round(calories)} side={side} />;
}
function Flow({ side }: { side: Side }) {
  const { t, tm } = useCardText("flow");
  const snap = useBase();
  const s = useStepper(clamp(Math.round(snap.calories / 50) * 50, KMIN, KMAX), { min: KMIN, max: KMAX, step: 50 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => KMIN + ((x - X0) / (W - 2 * X0)) * (KMAX - KMIN));
  const { W, H } = d;
  const kcal = s.value;
  const trackY = H - 52;
  const boxW = Math.min(110, (W - 2 * X0 - 40) / 3);
  const col = [X0, W / 2 - boxW / 2, W - X0 - boxW];
  const laneY = [30, 100, 170];
  const bh = 44;
  const valueText = kcalT(kcal);
  const rows: KitRow[] = [
    ...MACROS.map((m) => ({
      key: m,
      label: `${k0(kcal)} × ${Math.round(snap[m].percent)}% ÷ ${KCAL_G[m]}`,
      value: gT(gramsOf(m, kcal, snap[m].percent)),
      isKey: m === "protein",
    })),
    { key: "kcalg", label: t("rowFactors"), value: "4 / 4 / 9 kcal/g" },
    { key: "vs", label: t("rowVsYours"), value: sgn(kcal - snap.calories, kcalT(Math.abs(kcal - snap.calories))) },
  ];
  // The operation sits above the box row (the gap between lanes), never on the boxes.
  const arrow = (x1: number, x2: number, y: number, labelY: number, text: string) => (
    <g>
      <line x1={x1 + 2} y1={y} x2={x2 - 8} y2={y} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} />
      <path d={`M ${x2 - 8} ${y - 5} L ${x2} ${y} L ${x2 - 8} ${y + 5} Z`} style={{ fill: "var(--ph-ink-muted)" }} />
      <T x={(x1 + x2) / 2} y={labelY} text={text} size={10.5} bold style={INK} />
    </g>
  );
  return (
    <Card
      n={7}
      side={side}
      k="flow"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { kcal: ltr(kcalT(kcal)), p: ltr(gT(gramsOf("protein", kcal, snap.protein.percent))) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((kcal - KMIN) / (KMAX - KMIN)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c7">
          {MACROS.map((m, i) => {
            const y = laneY[i];
            const part = (kcal * snap[m].percent) / 100;
            const on = hover === m;
            return (
              <g key={m}>
                <rect x={col[0]} y={y} width={boxW} height={bh} rx={8} style={{ fill: "var(--ph-surface)", ...lit(on) }} />
                <T x={col[0] + boxW / 2} y={y + 18} text={tm(m)} size={10} bold style={{ fill: COLORS[m] }} />
                <T x={col[0] + boxW / 2} y={y + 35} text={k0(kcal)} size={12} bold style={INK} />
                {arrow(col[0] + boxW, col[1], y + bh / 2, y - 6, `× ${Math.round(snap[m].percent)}%`)}
                <rect x={col[1]} y={y} width={boxW} height={bh} rx={8} style={{ fill: COLORS[m], opacity: 0.85, ...lit(on) }} />
                <T x={col[1] + boxW / 2} y={y + 28} text={`${k0(part)} kcal`} size={12} bold style={{ fill: "#fff" }} />
                {arrow(col[1] + boxW, col[2], y + bh / 2, y - 6, `÷ ${KCAL_G[m]}`)}
                <rect x={col[2]} y={y} width={boxW} height={bh} rx={8} style={{ fill: COLORS[m], ...lit(on || hover === "kcalg") }} />
                <T x={col[2] + boxW / 2} y={y + 29} text={gT(part / KCAL_G[m])} size={14} bold style={{ fill: "#fff" }} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(kcal - KMIN) / (KMAX - KMIN)} lo={k0(KMIN)} hi={k0(KMAX)} />
        </Drawing>
      }
    />
  );
}

// ── 8. Ranked bars: how much of each food covers a share of your protein ────────────────────
export function MacroFoodsCard({ side }: { side: Side }) {
  const { t, tm } = useCardText("foods");
  const snap = useBase();
  const s = useStepper(50, { min: 10, max: 100, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => 10 + ((x - X0) / (W - 2 * X0)) * 90);
  const { W, H } = d;
  const share = s.value;
  const target = (snap.protein.grams * share) / 100;
  const bars = FOODS.map((f) => ({ ...f, g: (target / f.per100) * 100 })).sort((a, b) => a.g - b.g);
  const LW = 108;
  const top = 34;
  const trackY = H - 52;
  const rowH = (trackY - 40 - top) / bars.length;
  const vmax = Math.max(...bars.map((b) => b.g)) * 1.35;
  const xv = (v: number) => LW + (v / vmax) * (W - LW - 16);
  const valueText = `${share}% · ${gT(target)}`;
  const rows: KitRow[] = [
    { key: "target", label: `${k0(snap.protein.grams)} × ${share}%`, value: `${gT(target)} ${tm("protein")}`, isKey: true },
    ...bars.map((b) => ({ key: b.key, label: `${t(`items.${b.key}`)} (${b.per100} g/100 g)`, value: gT(b.g) })),
  ];
  return (
    <Card
      n={8}
      side={side}
      k="foods"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { g: ltr(gT(target)), share: ltr(`${share}%`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((share - 10) / 90) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="macro-c8">
          <T x={X0} y={18} text={`${gT(target)} ${tm("protein")} =`} anchor="start" size={12} bold style={INK} />
          <line x1={LW} y1={top - 4} x2={LW} y2={trackY - 40} style={LINE} strokeWidth={1.5} />
          {bars.map((b, bi) => {
            const y = top + rowH * bi + rowH * 0.18;
            const bh = rowH * 0.64;
            const on = hover === b.key;
            return (
              <g key={b.key}>
                <T x={LW - 8} y={y + bh / 2 + 4} text={t(`items.${b.key}`)} anchor="end" size={10.5} bold={on} style={on ? INK : MUTED} />
                <rect x={LW} y={y} width={Math.max(2, xv(b.g) - LW)} height={bh} rx={4} style={{ fill: COLORS.protein, opacity: 0.55 + 0.45 * (1 - bi / bars.length), ...lit(on) }} />
                <T x={xv(b.g) + 6} y={y + bh / 2 + 4} text={gT(b.g)} anchor="start" size={11} bold style={INK} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(share - 10) / 90} lo="10%" hi="100%" />
        </Drawing>
      }
    />
  );
}

