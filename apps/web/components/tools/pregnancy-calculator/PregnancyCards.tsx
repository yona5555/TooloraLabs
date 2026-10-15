"use client";
import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1 } from "@/components/tool-ui/indicator-kit/format";
import { usePregnancyLive } from "./PregnancyLiveContext";
import {
  ACOG_TRI,
  BIRTH_SD,
  FULL_TERM,
  GAIN,
  GROWTH,
  STATIONS,
  TERMS,
  TRI_COLORS,
  VISIT_WEEKS,
  acogTrimester,
  addDaysISO,
  diffDays,
  fmtDate,
  gainKeyOf,
  gainRange,
  milestoneFor,
  naegeleISO,
  normCdf,
  normPdf,
  sgn,
  termOf,
  visitInterval,
  wd,
} from "./preg";

/**
 * The eight pregnancy indicator cards (§31 library). All read the calculator's live result (LMP,
 * today, gestational age, due date) through PregnancyLiveContext. The timeline card writes the
 * gestational age back (the LMP becomes today − that age), so dragging it moves the date input,
 * the Result table and the 3D womb. The other cards keep a what-if value of their own on top of
 * the live result. Numbers use Western digits, like the BMI cards. Drag handles sit on their own
 * track along the bottom of each drawing; no value label is ever drawn within a handle's reach.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
/** Clear distance under a track for its labels: the 44px handle never covers them. */
const TRACK_LABEL_DY = 38;
const MAX_DAY = 294;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.pregnancy-calculator.visuals.${key}`),
    tc: useTranslations("tools.pregnancy-calculator.visuals.common"),
    tSize: useTranslations("tools.pregnancy-calculator.sizeComparisons"),
    tk: useTranslations("toolPage.indicatorKit"),
    locale: useLocale(),
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
            {st.text && <T x={sx} y={y + TRACK_LABEL_DY} text={st.text} anchor="middle" size={9.5} bold={st.on} style={st.on ? INK : MUTED} />}
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
      idPrefix="pregnancy"
      n={n}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      controls={<KitControls s={s} valueText={valueText} testId={`pregnancy-c${n}`} />}
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

const frac = (v: number, lo: number, hi: number) => (clamp(v, lo, hi) - lo) / (hi - lo);

// ── 1. Timeline with stations: drag today along the pregnancy (wow, writes the gestational age) ─
export function PregnancyTimelineCard({ side }: { side: Side }) {
  const { t, tc, locale } = useCardText("timeline");
  const { snap, setGa } = usePregnancyLive();
  const s = useSharedStepper(clamp(snap.ga, 0, MAX_DAY), setGa, { min: 0, max: MAX_DAY, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 450;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * MAX_DAY);
  const { W, H } = d;
  const ga = s.value;
  const lmp = addDaysISO(snap.today, -ga);
  const due = addDaysISO(lmp, FULL_TERM);
  const xd = (day: number) => X0 + (clamp(day, 0, MAX_DAY) / MAX_DAY) * (W - 2 * X0);
  const extra = Math.max(0, (H - HMIN) / 3);
  const LEVEL = 32;
  const lineY = 34 + 4 * LEVEL + extra;
  const bandY = lineY + 14;
  const trackY = H - 52;
  const passed = STATIONS.filter((st) => st.at <= ga);
  const next = STATIONS.find((st) => st.at > ga);
  const tri = acogTrimester(ga);
  const valueText = wd(ga);
  const rows: KitRow[] = [
    { key: "ga", label: t("rowGa"), value: wd(ga), isKey: true },
    { key: "lmp", label: t("rowLmp"), value: fmtDate(lmp, locale) },
    { key: "due", label: t("rowDue"), value: fmtDate(due, locale) },
    { key: "tri", label: t("rowTrimester"), value: tc(`tri.t${tri}`) },
    { key: "passed", label: t("rowPassed"), value: `${passed.length} / ${STATIONS.length}` },
    next
      ? { key: "next", label: `${t("rowNext")}: ${tc(`stations.${next.key}`)}`, value: `${fmtDate(addDaysISO(lmp, next.at), locale, true)} (+${next.at - ga} d)` }
      : { key: "next", label: t("rowNext"), value: t("allPassed") },
  ];
  return (
    <Card
      n={1}
      side={side}
      k="timeline"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { ga: ltr(wd(ga)), due: ltr(fmtDate(due, locale)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xd(ga), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c1">
          {/* Stations: four label rows above the line, neighbours on a row are four stations apart */}
          {STATIONS.map((st, i) => {
            const x = xd(st.at);
            const level = i % 4;
            const ly = 30 + level * LEVEL + extra * 0.5;
            const done = st.at <= ga;
            const on = hover === "next" && next?.key === st.key;
            const anchor = x < X0 + 50 ? "start" : x > W - X0 - 50 ? "end" : "middle";
            const tx = anchor === "start" ? x - 4 : anchor === "end" ? x + 4 : x;
            return (
              <g key={st.key}>
                <line x1={x} y1={ly + 16} x2={x} y2={lineY} style={{ stroke: "var(--ph-line)" }} strokeDasharray="2 3" />
                <circle cx={x} cy={lineY} r={on ? 8 : 6} style={{ fill: done ? "var(--ph-accent-strong)" : "var(--ph-surface)", stroke: "var(--ph-ink)" }} strokeWidth={1.5} />
                <T x={tx} y={ly} text={tc(`stations.${st.key}`)} anchor={anchor} size={10} bold={done || on} style={done || on ? INK : MUTED} />
                <T x={tx} y={ly + 13} text={`${Math.floor(st.at / 7)}w${st.at % 7 ? ` ${st.at % 7}d` : ""}`} anchor={anchor} size={9.5} />
              </g>
            );
          })}
          <line x1={xd(0)} y1={lineY} x2={xd(MAX_DAY)} y2={lineY} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} />
          <line x1={xd(0)} y1={lineY} x2={xd(ga)} y2={lineY} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={4} strokeLinecap="round" />
          {/* ACOG trimester bands, then the term weeks */}
          {ACOG_TRI.map((z) => (
            <g key={z.n}>
              <rect x={xd(z.from)} y={bandY} width={xd(z.to) - xd(z.from) - 1} height={18} rx={3} fill={TRI_COLORS[z.n]} opacity={hover === "tri" && z.n === tri ? 1 : 0.75} />
              <T x={(xd(z.from) + xd(z.to)) / 2} y={bandY + 13} text={`T${z.n}`} size={10.5} bold style={{ fill: "#fff" }} />
            </g>
          ))}
          <rect x={xd(FULL_TERM)} y={bandY} width={xd(MAX_DAY) - xd(FULL_TERM)} height={18} rx={3} fill={TERMS[4].color} opacity={0.35} />
          {/* Today */}
          <line x1={xd(ga)} y1={lineY - 6} x2={xd(ga)} y2={bandY + 30} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <T x={clamp(xd(ga), X0 + 60, W - X0 - 60)} y={bandY + 48} text={`${t("you")}: ${wd(ga)} · ${f1((ga / FULL_TERM) * 100)}%`} size={12.5} bold style={INK} />
          {next && <T x={clamp(xd(ga), X0 + 70, W - X0 - 70)} y={bandY + 66} text={`→ ${tc(`stations.${next.key}`)} +${next.at - ga} d`} size={10.5} bold />}
          <SvgTrack W={W} y={trackY} frac={ga / MAX_DAY} lo="0w" hi="42w" stops={[98, 196, FULL_TERM].map((v) => ({ frac: v / MAX_DAY, text: `${v / 7}w` }))} />
        </Drawing>
      }
    />
  );
}

// ── 2. Multi-ring donut: progress of pregnancy, trimester and week on a look-ahead date ─────
export function PregnancyRingsCard({ side }: { side: Side }) {
  const { t, tc, locale } = useCardText("rings");
  const { snap } = usePregnancyLive();
  const s = useStepper(0, { min: 0, max: 30, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 420;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 30);
  const { W, H } = d;
  const N = s.value;
  const ga = Math.min(MAX_DAY, snap.ga + 7 * N);
  const date = addDaysISO(snap.today, 7 * N);
  const tri = acogTrimester(ga);
  const z = ACOG_TRI[tri - 1];
  const pTotal = Math.min(1, ga / FULL_TERM);
  const pTri = clamp((ga - z.from) / (z.to - z.from), 0, 1);
  const pWeek = (ga % 7) / 7;
  const trackY = H - 52;
  const legendY = trackY - 78;
  const R = Math.max(70, Math.min(W / 2 - 40, (legendY - 30) / 2));
  const cx = W / 2;
  const cy = 18 + R;
  const SW = Math.min(18, R / 5);
  const ring = (r: number, p: number, color: string, on: boolean) => {
    const a = Math.max(0.0001, p) * 2 * Math.PI;
    const x1 = px2(cx + r * Math.sin(a));
    const y1 = px2(cy - r * Math.cos(a));
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--ph-grid)" }} strokeWidth={SW} />
        {p >= 0.999 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={on ? SW + 4 : SW} />
        ) : (
          <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={on ? SW + 4 : SW} strokeLinecap="round" />
        )}
      </g>
    );
  };
  const valueText = `+${N} w`;
  const rows: KitRow[] = [
    { key: "date", label: t("rowDate"), value: fmtDate(date, locale) },
    { key: "ga", label: t("rowGa"), value: wd(ga) },
    { key: "total", label: `${ga} ÷ 280`, value: `${f1(pTotal * 100)}%`, isKey: true },
    { key: "tri", label: `${tc(`tri.t${tri}`)} (${z.to - z.from} d)`, value: `${f1(pTri * 100)}%` },
    { key: "week", label: t("rowWeekDay"), value: `${(ga % 7) + 1} / 7` },
    { key: "left", label: t("rowLeft"), value: `${Math.max(0, FULL_TERM - ga)} d` },
  ];
  const legend = [
    { key: "total", text: `${t("ringTotal")} ${f1(pTotal * 100)}%`, color: "var(--ph-accent-strong)" },
    { key: "tri", text: `${tc(`tri.t${tri}`)} ${f1(pTri * 100)}%`, color: TRI_COLORS[tri] },
    { key: "week", text: `${t("ringWeek")} ${(ga % 7) + 1}/7`, color: "#f59e0b" },
  ];
  return (
    <Card
      n={2}
      side={side}
      k="rings"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { date: ltr(fmtDate(date, locale)), pct: ltr(`${f1(pTotal * 100)}%`), tri: tc(`tri.t${tri}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (N / 30) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c2">
          {ring(R - SW / 2, pTotal, "var(--ph-accent-strong)", hover === "total")}
          {ring(R - SW * 1.5 - 4, pTri, TRI_COLORS[tri], hover === "tri")}
          {ring(R - SW * 2.5 - 8, pWeek + 1 / 7, "#f59e0b", hover === "week")}
          <T x={cx} y={cy - 4} text={`${f1(pTotal * 100)}%`} size={20} bold style={INK} />
          <T x={cx} y={cy + 16} text={wd(ga)} size={12} bold />
          {legend.map((l, i) => (
            <g key={l.key}>
              <rect x={X0} y={legendY + i * 18 - 10} width={11} height={11} rx={2} style={{ fill: l.color }} />
              <T x={X0 + 16} y={legendY + i * 18} text={l.text} anchor="start" size={10.5} bold style={INK} />
            </g>
          ))}
          <T x={W - X0} y={legendY} text={fmtDate(date, locale)} anchor="end" size={11} bold style={INK} />
          <SvgTrack W={W} y={trackY} frac={N / 30} lo={t("now")} hi="+30 w" />
        </Drawing>
      }
    />
  );
}

// ── 3. Trend line with a reference point: the calculator's weight by week ───────────────────
export function PregnancyGrowthCard({ side }: { side: Side }) {
  const { snap } = usePregnancyLive();
  return <Growth key={snap.weeks} side={side} />;
}
function Growth({ side }: { side: Side }) {
  const { t, tSize, locale } = useCardText("growth");
  const { snap } = usePregnancyLive();
  const s = useStepper(clamp(snap.weeks, 4, 40), { min: 4, max: 40, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 400;
  const d = useDrawing(HMIN, s, (x, _y, W) => 4 + ((x - X0) / (W - 2 * X0)) * 36);
  const { W, H } = d;
  const w = s.value;
  const m = milestoneFor(w)!;
  const prev = milestoneFor(w - 1);
  const you = milestoneFor(clamp(snap.weeks, 4, 40))!;
  const PL = 52;
  const PR = 14;
  const top = 40;
  const base = H - 128;
  const WMAX = 3600;
  const xw = (wk: number) => PL + ((wk - 4) / 36) * (W - PL - PR);
  const yg = (g: number) => base - (g / WMAX) * (base - top);
  const path = GROWTH.map((g, i) => `${i ? "L" : "M"} ${px2(xw(g.week))} ${px2(yg(g.weightG))}`).join(" ");
  const trackY = H - 52;
  const valueText = `${w}w`;
  const wt = (g: number) => (g > 0 ? `${g} g` : "< 1 g");
  const rows: KitRow[] = [
    { key: "week", label: t("rowWeek"), value: `${w}w · ${fmtDate(addDaysISO(snap.lmp, w * 7), locale, true)}` },
    { key: "size", label: t("rowSize"), value: tSize(m.sizeComparison), isKey: true },
    { key: "len", label: w < 20 ? t("rowCrl") : t("rowChl"), value: `${m.lengthCm} cm` },
    { key: "wt", label: t("rowWeight"), value: wt(m.weightG) },
    { key: "gain", label: t("rowGain"), value: prev ? `+${m.weightG - prev.weightG} g` : "0 g" },
    { key: "pct", label: t("rowPct"), value: `${f1((m.weightG / GROWTH[GROWTH.length - 1].weightG) * 100)}%` },
  ];
  const tagRight = xw(w) < W * 0.55;
  return (
    <Card
      n={3}
      side={side}
      k="growth"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { week: ltr(`${w}w`), size: tSize(m.sizeComparison), weight: ltr(wt(m.weightG)), length: ltr(`${m.lengthCm} cm`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((w - 4) / 36) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c3">
          {[0, 1000, 2000, 3000].map((g) => (
            <g key={g}>
              <line x1={PL} y1={yg(g)} x2={W - PR} y2={yg(g)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yg(g) + 4} text={g ? `${g / 1000} kg` : "0"} anchor="end" size={10} />
            </g>
          ))}
          {/* Trimester shading (ACOG) */}
          {ACOG_TRI.map((z) => (
            <rect key={z.n} x={xw(Math.max(4, z.from / 7))} y={base + 4} width={xw(Math.min(40, z.to / 7)) - xw(Math.max(4, z.from / 7))} height={6} fill={TRI_COLORS[z.n]} opacity={0.7} />
          ))}
          <path d={path} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} />
          {GROWTH.map((g) => (
            <circle key={g.week} cx={xw(g.week)} cy={yg(g.weightG)} r={2.2} style={{ fill: "var(--ph-accent-strong)" }} />
          ))}
          {/* Reference: this week (calculator) */}
          <circle cx={xw(you.week)} cy={yg(you.weightG)} r={8} fill="none" stroke="#ec4899" strokeWidth={2.5} />
          <T x={xw(you.week)} y={yg(you.weightG) + (you.weightG > 2500 ? 22 : -14)} text={`${t("you")} ${you.week}w`} size={10} bold style={{ fill: "#ec4899" }} />
          {/* Selected week */}
          <line x1={xw(w)} y1={top - 8} x2={xw(w)} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "week" ? 3 : 1.5} strokeDasharray="4 3" />
          <circle cx={xw(w)} cy={yg(m.weightG)} r={6} style={{ fill: "var(--ph-ink)" }} />
          <T x={tagRight ? xw(w) + 8 : xw(w) - 8} y={top - 14} text={`${tSize(m.sizeComparison)} · ${wt(m.weightG)} · ${m.lengthCm} cm`} anchor={tagRight ? "start" : "end"} size={11.5} bold style={INK} />
          {[4, 12, 20, 28, 36, 40].map((wk) => (
            <T key={wk} x={xw(wk)} y={base + 26} text={`${wk}w`} size={10} />
          ))}
          <T x={xw(20)} y={base + 44} text={t("lengthNote")} size={9.5} />
          <SvgTrack W={W} y={trackY} frac={(w - 4) / 36} lo="4w" hi="40w" />
        </Drawing>
      }
    />
  );
}

// ── 4. Zone strip: what a birth on a given week is called (ACOG term definitions) ───────────
const Z0 = 168;
const termRange = (z: (typeof TERMS)[number]) => (z.key === "preterm" ? "< 37w 0d" : z.key === "postTerm" ? "≥ 42w 0d" : `${wd(z.from)} – ${wd(z.to - 1)}`);
const Z1 = 301;
export function PregnancyTermCard({ side }: { side: Side }) {
  const { t, tc, locale } = useCardText("term");
  const { snap } = usePregnancyLive();
  const s = useStepper(FULL_TERM, { min: Z0, max: Z1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 380;
  const d = useDrawing(HMIN, s, (x, _y, W) => Z0 + ((x - X0) / (W - 2 * X0)) * (Z1 - Z0));
  const { W, H } = d;
  const b = s.value;
  const zone = termOf(b);
  const xz = (day: number) => X0 + frac(day, Z0, Z1) * (W - 2 * X0);
  const extra = Math.max(0, (H - HMIN) / 3);
  const sy = 70 + extra;
  const sh = 34;
  const trackY = H - 52;
  const date = addDaysISO(snap.lmp, b);
  const fromToday = b - snap.ga;
  const valueText = wd(b);
  const rows: KitRow[] = [
    { key: "date", label: t("rowDate"), value: fmtDate(date, locale) },
    { key: "zone", label: t("rowZone"), value: tc(`terms.${zone.key}`), isKey: true },
    { key: "due", label: t("rowFromDue"), value: `${sgn(b - FULL_TERM)} d` },
    { key: "today", label: t("rowFromToday"), value: fromToday >= 0 ? `+${fromToday} d` : t("past") },
    { key: "range", label: t("rowRange"), value: termRange(zone) },
  ];
  return (
    <Card
      n={4}
      side={side}
      k="term"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { ga: ltr(wd(b)), date: ltr(fmtDate(date, locale)), zone: tc(`terms.${zone.key}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xz(b), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c4">
          <T x={X0} y={22} text={`${wd(b)} → ${tc(`terms.${zone.key}`)}`} anchor="start" size={14} bold style={{ fill: zone.color }} />
          {TERMS.map((z) => {
            const a = Math.max(z.from, Z0);
            const e = Math.min(z.to, Z1);
            const on = z.key === zone.key;
            return <rect key={z.key} x={xz(a)} y={sy} width={Math.max(0, xz(e) - xz(a) - 1)} height={sh} fill={z.color} opacity={on ? 0.95 : 0.45} />;
          })}
          {[259, 273, 287, 294].map((v) => (
            <T key={v} x={xz(v)} y={sy + sh + 16} text={`${v / 7}`} size={10.5} bold style={INK} />
          ))}
          {/* Due date and today */}
          <line x1={xz(FULL_TERM)} y1={sy - 8} x2={xz(FULL_TERM)} y2={sy + sh + 4} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "due" ? 3 : 1.5} strokeDasharray="3 3" />
          <T x={xz(FULL_TERM)} y={sy - 12} text={`${tc("edd")} 40w`} size={10} bold />
          {snap.ga >= Z0 && <line x1={xz(snap.ga)} y1={sy} x2={xz(snap.ga)} y2={sy + sh} stroke="#ec4899" strokeWidth={3} />}
          {/* The what-if birth */}
          <path d={`M ${xz(b) - 7} ${sy - 10} L ${xz(b) + 7} ${sy - 10} L ${xz(b)} ${sy - 1} Z`} style={{ fill: "var(--ph-ink)" }} />
          <line x1={xz(b)} y1={sy} x2={xz(b)} y2={sy + sh} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} />
          <T x={X0} y={sy + sh + 16} text={`${Z0 / 7}w`} anchor="start" size={10} />
          {/* Legend, one row per zone, then today */}
          {TERMS.map((z, i) => {
            const ly = sy + sh + 44 + extra + i * 18;
            return (
              <g key={`lg${z.key}`}>
                <rect x={X0} y={ly - 10} width={11} height={11} rx={2} fill={z.color} />
                <T x={X0 + 16} y={ly} text={`${tc(`terms.${z.key}`)}: ${termRange(z)}`} anchor="start" size={10.5} bold={z.key === zone.key} style={INK} />
              </g>
            );
          })}
          {snap.ga >= Z0 && (
            <g>
              <rect x={X0} y={sy + sh + 44 + extra + 5 * 18 - 6} width={11} height={3} fill="#ec4899" />
              <T x={X0 + 16} y={sy + sh + 44 + extra + 5 * 18} text={`${t("you")} ${wd(snap.ga)}`} anchor="start" size={10.5} bold style={{ fill: "#ec4899" }} />
            </g>
          )}
          <SvgTrack W={W} y={trackY} frac={frac(b, Z0, Z1)} lo="24w" hi="43w" />
        </Drawing>
      }
    />
  );
}

// ── 5. Formula diagram: Naegele's rule, 280 days, and a cycle-length adjustment ───────────────
export function PregnancyNaegeleCard({ side }: { side: Side }) {
  const { t, locale } = useCardText("naegele");
  const { snap } = usePregnancyLive();
  const s = useStepper(28, { min: 21, max: 35, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 380;
  const d = useDrawing(HMIN, s, (x, _y, W) => 21 + ((x - X0) / (W - 2 * X0)) * 14);
  const { W, H } = d;
  const c = s.value;
  const nae = naegeleISO(snap.lmp);
  const adj = addDaysISO(snap.due, c - 28);
  const dt = (iso: string) => fmtDate(iso, locale, true);
  const trackY = H - 52;
  const gap = 6;
  const bh = 38;
  const lane = (i: number) => 34 + i * Math.max(58, (trackY - 50 - 34 - bh) / 2);
  const box = (x: number, w: number, y: number, text: string, fill: string, ink: { fill: string }, on: boolean) => (
    <g>
      <rect x={x} y={y} width={w} height={bh} rx={8} style={{ fill, ...lit(on) }} />
      <T x={x + w / 2} y={y + bh / 2 + 4.5} text={text} size={w < 70 ? 9.5 : 11.5} bold style={ink} />
    </g>
  );
  const row = (i: number, parts: { text: string; fill: string; ink: { fill: string } }[], on: boolean, label: string) => {
    const n = parts.length;
    const bw = (W - 2 * X0 + 20 - (n - 1) * gap) / n;
    return (
      <g key={i}>
        <T x={X0 - 10} y={lane(i) - 6} text={label} anchor="start" size={10} bold />
        {parts.map((p, j) => (
          <g key={j}>{box(X0 - 10 + j * (bw + gap), bw, lane(i), p.text, p.fill, p.ink, on)}</g>
        ))}
      </g>
    );
  };
  const step = { fill: "var(--ph-accent-soft)", ink: INK };
  const start = { fill: "var(--ph-surface)", ink: INK };
  const valueText = `${c} d`;
  const rows: KitRow[] = [
    { key: "nae", label: t("rowNaegele"), value: fmtDate(nae, locale) },
    { key: "d280", label: t("row280"), value: fmtDate(snap.due, locale), isKey: true },
    { key: "diff", label: t("rowDiff"), value: `${sgn(diffDays(snap.due, nae))} d` },
    { key: "ov", label: t("rowOvulation"), value: `${t("day")} ${c - 14}` },
    { key: "adj", label: `${t("rowAdjusted")} (${sgn(c - 28)} d)`, value: fmtDate(adj, locale) },
  ];
  return (
    <Card
      n={5}
      side={side}
      k="naegele"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { cycle: ltr(`${c} d`), adj: ltr(fmtDate(adj, locale)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((c - 21) / 14) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c5">
          {row(0, [{ text: dt(snap.lmp), ...start }, { text: "+1 y", ...step }, { text: "−3 mo", ...step }, { text: "+7 d", ...step }, { text: `= ${dt(nae)}`, fill: "#a855f7", ink: { fill: "#fff" } }], hover === "nae" || hover === "diff", t("laneNaegele"))}
          {row(1, [{ text: dt(snap.lmp), ...start }, { text: "+280 d", ...step }, { text: `= ${dt(snap.due)}`, fill: "#ec4899", ink: { fill: "#fff" } }], hover === "d280" || hover === "diff", t("lane280"))}
          {row(2, [{ text: dt(snap.due), ...start }, { text: `${sgn(c - 28)} d`, fill: "#f59e0b", ink: { fill: "#fff" } }, { text: `= ${dt(adj)}`, fill: "#6366f1", ink: { fill: "#fff" } }], hover === "adj" || hover === "ov", t("laneAdjusted", { cycle: c }))}
          <SvgTrack W={W} y={trackY} frac={(c - 21) / 14} lo="21 d" hi="35 d" stops={[{ frac: 0.5, text: "28", on: c === 28 }]} />
        </Drawing>
      }
    />
  );
}

// ── 6. Annotated point in a distribution: when spontaneous births happen around the due date ─
const B0 = -28;
const B1 = 21;
export function PregnancyBirthWindowCard({ side }: { side: Side }) {
  const { t, tc, locale } = useCardText("birthWindow");
  const { snap } = usePregnancyLive();
  const s = useStepper(0, { min: -21, max: 14, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 380;
  const d = useDrawing(HMIN, s, (x, _y, W) => -21 + ((x - X0) / (W - 2 * X0)) * 35);
  const { W, H } = d;
  const off = s.value;
  const top = 50;
  const base = H - 128;
  const xo = (o: number) => X0 + ((o - B0) / (B1 - B0)) * (W - 2 * X0);
  const peak = normPdf(0);
  const yo = (o: number) => base - (normPdf(o / BIRTH_SD) / peak) * (base - top);
  const pts: string[] = [];
  for (let o = B0; o <= B1; o += 0.5) pts.push(`${px2(xo(o))} ${px2(yo(o))}`);
  const shade: string[] = [`${px2(xo(B0))} ${base}`];
  for (let o = B0; o <= off; o += 0.5) shade.push(`${px2(xo(o))} ${px2(yo(o))}`);
  shade.push(`${px2(xo(off))} ${px2(yo(off))}`, `${px2(xo(off))} ${base}`);
  const pBy = normCdf((off + 0.5) / BIRTH_SD) * 100;
  const pDay = (normCdf((off + 0.5) / BIRTH_SD) - normCdf((off - 0.5) / BIRTH_SD)) * 100;
  const pWeek = (normCdf(7.5 / BIRTH_SD) - normCdf(-7.5 / BIRTH_SD)) * 100;
  const date = addDaysISO(snap.due, off);
  const trackY = H - 52;
  const valueText = `${sgn(off)} d`;
  const rows: KitRow[] = [
    { key: "date", label: t("rowDate"), value: fmtDate(date, locale) },
    { key: "ga", label: t("rowGa"), value: wd(FULL_TERM + off) },
    { key: "by", label: t("rowBy"), value: `${f1(pBy)}%`, isKey: true },
    { key: "day", label: t("rowDay"), value: `${f1(pDay)}%` },
    { key: "week", label: t("rowWeek"), value: `${f1(pWeek)}%` },
    { key: "sd", label: t("rowModel"), value: `SD ${BIRTH_SD} d` },
  ];
  const tagRight = xo(off) < W * 0.6;
  return (
    <Card
      n={6}
      side={side}
      k="birthWindow"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { date: ltr(fmtDate(date, locale)), pct: ltr(`${f1(pBy)}%`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((off + 21) / 35) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c6">
          {/* ±7 days band */}
          <rect x={xo(-7)} y={top - 6} width={xo(7) - xo(-7)} height={base - top + 6} fill="#10b981" opacity={hover === "week" ? 0.22 : 0.1} />
          <T x={xo(0)} y={top - 12} text={`± 7 d: ${f1(pWeek)}%`} size={10} bold style={{ fill: "#059669" }} />
          <polygon points={shade.join(" ")} style={{ fill: "var(--ph-accent-strong)" }} opacity={hover === "by" ? 0.45 : 0.28} />
          <polyline points={pts.join(" ")} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={2.5} />
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} />
          {/* Due date */}
          <line x1={xo(0)} y1={top} x2={xo(0)} y2={base} stroke="#ec4899" strokeWidth={2} strokeDasharray="4 3" />
          {/* The what-if date */}
          <line x1={xo(off)} y1={top - 20} x2={xo(off)} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <circle cx={xo(off)} cy={yo(off)} r={6} style={{ fill: "var(--ph-ink)" }} />
          <T x={tagRight ? xo(off) + 8 : xo(off) - 8} y={18} text={`${fmtDate(date, locale, true)} · ${f1(pBy)}%`} anchor={tagRight ? "start" : "end"} size={12} bold style={INK} />
          {[-28, -21, -14, -7, 0, 7, 14, 21].map((o) => (
            <T key={o} x={xo(o)} y={base + 18} text={o === 0 ? tc("edd") : `${sgn(o)}`} size={10} bold={o === 0} style={o === 0 ? { fill: "#ec4899" } : MUTED} />
          ))}
          <T x={xo((B0 + B1) / 2)} y={base + 38} text={t("axis")} size={9.5} />
          <SvgTrack W={W} y={trackY} frac={(off + 21) / 35} lo="−21 d" hi="+14 d" stops={[{ frac: 21 / 35, text: "0", on: off === 0 }]} />
        </Drawing>
      }
    />
  );
}

// ── 7. Labeled bar chart: recommended weight gain so far by pre-pregnancy BMI (IOM 2009) ──────
export function PregnancyWeightGainCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("weightGain");
  const { snap } = usePregnancyLive();
  const s = useStepper(22, { min: 16, max: 40, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 400;
  const d = useDrawing(HMIN, s, (x, _y, W) => 16 + ((x - X0) / (W - 2 * X0)) * 24);
  const { W, H } = d;
  const bmi = s.value;
  const key = gainKeyOf(bmi);
  const g = GAIN.find((x) => x.key === key)!;
  const ga = Math.min(snap.ga, FULL_TERM);
  const [lo, hi] = gainRange(key, ga);
  const top = 44;
  const base = H - 130;
  const KMAX = 20;
  const yk = (kg: number) => base - (kg / KMAX) * (base - top);
  const PL = 46;
  const cw = (W - PL - 10) / 4;
  const trackY = H - 52;
  const valueText = `BMI ${f1(bmi)}`;
  const rows: KitRow[] = [
    { key: "bmi", label: s.isSeed ? t("rowBmiAssumed") : t("rowBmi"), value: f1(bmi) },
    { key: "cat", label: t("rowCategory"), value: tc(`gain.${key}`) },
    { key: "now", label: t("rowNow", { week: wd(ga) }), value: `${f1(lo)}–${f1(hi)} kg`, isKey: true },
    { key: "total", label: t("rowTotal"), value: `${g.total[0]}–${g.total[1]} kg` },
    { key: "rate", label: t("rowRate"), value: `${g.weekly[0]}–${g.weekly[1]} kg/w` },
  ];
  return (
    <Card
      n={7}
      side={side}
      k="weightGain"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { week: ltr(wd(ga)), range: ltr(`${f1(lo)}–${f1(hi)} kg`), cat: tc(`gain.${key}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((bmi - 16) / 24) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c7">
          <T x={X0} y={18} text={`${t("soFar")} ${wd(ga)}`} anchor="start" size={11} bold />
          {[0, 5, 10, 15, 20].map((kg) => (
            <g key={kg}>
              <line x1={PL} y1={yk(kg)} x2={W - 10} y2={yk(kg)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yk(kg) + 4} text={`${kg} kg`} anchor="end" size={9.5} />
            </g>
          ))}
          {GAIN.map((c, i) => {
            const on = c.key === key;
            const [a, b] = gainRange(c.key, ga);
            const x = PL + cw * i + cw * 0.2;
            const w = cw * 0.6;
            return (
              <g key={c.key}>
                {/* Total by term (faded), then the range so far */}
                <rect x={x} y={yk(c.total[1])} width={w} height={yk(c.total[0]) - yk(c.total[1])} rx={4} fill={c.color} opacity={0.18} />
                <rect x={x} y={yk(b)} width={w} height={Math.max(3, yk(a) - yk(b))} rx={4} style={{ fill: c.color, ...lit(on && (hover === "now" || hover === "cat")) }} opacity={on ? 1 : 0.55} />
                <T x={x + w / 2} y={yk(Math.max(b, c.total[1])) - 6} text={`${f1(a)}–${f1(b)}`} size={on ? 12 : 10.5} bold style={on ? INK : MUTED} />
                <T x={x + w / 2} y={base + 18} text={tc(`gain.${c.key}`)} size={10} bold={on} style={on ? INK : MUTED} />
                <T x={x + w / 2} y={base + 33} text={c.key === "obese" ? "≥ 30" : c.key === "under" ? "< 18.5" : `${c.bmi[0]}–${c.bmi[1]}`} size={9.5} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(bmi - 16) / 24} lo="BMI 16" hi="BMI 40" stops={[18.5, 25, 30].map((v) => ({ frac: (v - 16) / 24, text: `${v}` }))} />
        </Drawing>
      }
    />
  );
}

// ── 8. Stepped diagram: the routine prenatal visit schedule (ACOG) ────────────────────────────
export function PregnancyVisitsCard({ side }: { side: Side }) {
  const { snap } = usePregnancyLive();
  return <Visits key={snap.weeks} side={side} />;
}
function testFor(w: number): string {
  if (w >= 11 && w < 14) return "nt";
  if (w >= 18 && w < 23) return "anatomy";
  if (w >= 24 && w < 29) return "glucose";
  if (w >= 36 && w < 38) return "gbs";
  return "none";
}
function Visits({ side }: { side: Side }) {
  const { t, locale } = useCardText("visits");
  const { snap } = usePregnancyLive();
  const s = useStepper(clamp(snap.weeks, 4, 41), { min: 4, max: 41, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 400;
  const d = useDrawing(HMIN, s, (x, _y, W) => 4 + ((x - X0) / (W - 2 * X0)) * 37);
  const { W, H } = d;
  const w = s.value;
  const PL = 40;
  const PR = 14;
  const top = 34;
  const base = H - 130;
  const xw = (wk: number) => PL + ((wk - 4) / 37) * (W - PL - PR);
  const yv = (n: number) => base - (n / VISIT_WEEKS.length) * (base - top);
  const done = VISIT_WEEKS.filter((v) => v <= w).length;
  const next = VISIT_WEEKS.find((v) => v > w);
  const steps: string[] = [`M ${xw(4)} ${yv(0)}`];
  VISIT_WEEKS.forEach((v, i) => steps.push(`L ${px2(xw(v))} ${px2(yv(i))}`, `L ${px2(xw(v))} ${px2(yv(i + 1))}`));
  steps.push(`L ${xw(41)} ${yv(VISIT_WEEKS.length)}`);
  const test = testFor(w);
  const trackY = H - 52;
  const valueText = `${w}w`;
  const rows: KitRow[] = [
    { key: "done", label: t("rowDone", { week: w }), value: `${done} / ${VISIT_WEEKS.length}`, isKey: true },
    { key: "left", label: t("rowLeft"), value: `${VISIT_WEEKS.length - done}` },
    { key: "int", label: t("rowInterval"), value: t("every", { n: visitInterval(w) }) },
    next ? { key: "next", label: t("rowNext"), value: `${next}w · ${fmtDate(addDaysISO(snap.lmp, next * 7), locale, true)}` } : { key: "next", label: t("rowNext"), value: t("afterDue") },
    { key: "test", label: t("rowTest"), value: t(`tests.${test}`) },
  ];
  const bands = [
    { from: 4, to: 28, n: 4, color: "#ec4899" },
    { from: 28, to: 36, n: 2, color: "#a855f7" },
    { from: 36, to: 41, n: 1, color: "#6366f1" },
  ];
  return (
    <Card
      n={8}
      side={side}
      k="visits"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { week: ltr(`${w}w`), done: ltr(String(done)), total: ltr(String(VISIT_WEEKS.length)), every: t("every", { n: visitInterval(w) }) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((w - 4) / 37) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pregnancy-c8">
          {[0, 5, 10, 14].map((n) => (
            <g key={n}>
              <line x1={PL} y1={yv(n)} x2={W - PR} y2={yv(n)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yv(n) + 4} text={String(n)} anchor="end" size={10} />
            </g>
          ))}
          <path d={steps.join(" ")} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={2.5} />
          {VISIT_WEEKS.map((v, i) => (
            <circle key={v} cx={xw(v)} cy={yv(i + 1)} r={hover === "next" && v === next ? 7 : 4} style={{ fill: v <= w ? "var(--ph-accent-strong)" : "var(--ph-surface)", stroke: "var(--ph-accent-strong)" }} strokeWidth={1.5} />
          ))}
          {/* Interval bands */}
          {bands.map((b) => {
            const on = w >= b.from && w < b.to;
            return (
              <g key={b.from}>
                <rect x={xw(b.from)} y={base + 6} width={xw(b.to) - xw(b.from) - 1} height={16} rx={3} fill={b.color} opacity={on ? 0.95 : 0.4} style={lit(on && hover === "int")} />
                <T x={(xw(b.from) + xw(b.to)) / 2} y={base + 18} text={`/${b.n}w`} size={10} bold style={{ fill: "#fff" }} />
              </g>
            );
          })}
          {[4, 12, 20, 28, 36, 40].map((wk) => (
            <T key={wk} x={xw(wk)} y={base + 40} text={`${wk}w`} size={10} />
          ))}
          {/* Selected week */}
          <line x1={xw(w)} y1={top - 6} x2={xw(w)} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} strokeDasharray="4 3" />
          <T x={xw(w) < W * 0.55 ? xw(w) + 8 : xw(w) - 8} y={top + 4} text={`${w}w · ${done}/${VISIT_WEEKS.length}`} anchor={xw(w) < W * 0.55 ? "start" : "end"} size={12} bold style={INK} />
          <SvgTrack W={W} y={trackY} frac={(w - 4) / 37} lo="4w" hi="41w" />
        </Drawing>
      }
    />
  );
}
