"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { INK, LINE, lit, MUTED, px2, SvgLabel as T } from "@/components/tool-ui/indicator-kit/SvgBits";
import { Drawing, useDrawing } from "@/components/tool-ui/indicator-kit/Drawing";
import { clamp } from "@/components/tool-ui/indicator-kit/format";
import { Card, SvgTrack, useSharedStepper, type Side } from "../macro-calculator/MacroCards";
import { useDateFmt, useOvLive } from "./OvulationLiveContext";
import { DAY_MS, FIGO_HI, FIGO_LO, FW_AFTER, FW_BEFORE, MENSES_DAYS, PHASE_COLORS, combined, mod, phaseOf, wilcoxOf, type PhaseKey } from "./ovulation";

/**
 * The eight ovulation indicator cards (§31 library). All read the calculator's live result (LMP,
 * cycle length, luteal phase and the three projected cycles) through OvulationLiveContext. The
 * cycle-length card writes the cycle and the phase-split card writes the luteal phase back, so
 * dragging them moves the inputs, the Result table and the 3D cycle wheel. The other cards keep a
 * what-if value of their own on top of the live result. Numbers use Western digits, like the other
 * health cards. Every drag handle sits on its own track along the bottom; value labels sit 38px
 * under the track (SvgTrack) or at least 30px above it, out of the 44px handle's reach.
 */
const TOOL = "ovulation-calculator";
const ID = "ov";
const X0 = 30;
const PCT = (v: number) => `${(v * 100).toFixed(0)}%`;
const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
/** Rough text width for placing SVG labels (no measuring pass needed). */
const textW = (s: string, size: number) => s.length * size * 0.56;

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.${TOOL}.visuals.${key}`),
    tc: useTranslations(`tools.${TOOL}.visuals.common`),
    tr: useTranslations(`tools.${TOOL}.result`),
  };
}

// ── 1. Timeline with stations: drag through the cycle, day by day (wow) ─────────────────────
export function OvCycleDayCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("cycleDay");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const { cycle: c, ovOffset: ov, lmp } = snap;
  const s = useStepper(snap.dayIdx + 1, { min: 1, max: c, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * (c - 1));
  const { W, H } = d;
  const day = clamp(s.value, 1, c);
  const idx = day - 1;
  const date = lmp + idx;
  const ph = phaseOf(idx, ov);
  const rel = idx - ov;
  const dd = tc("abbr.d");
  const xs = (i: number) => X0 + (i / c) * (W - 2 * X0);
  const trackY = H - 52;
  const bandY = 34;
  const laneTop = 74;
  const base = trackY - 54;
  const lanes: { key: PhaseKey; from: number; to: number }[] = [
    { key: "menses", from: 0, to: MENSES_DAYS },
    { key: "follicular", from: 0, to: ov },
    { key: "fertile", from: ov - FW_BEFORE, to: ov + FW_AFTER + 1 },
    { key: "ovulation", from: ov, to: ov + 1 },
    { key: "luteal", from: ov, to: c },
  ];
  const laneH = (base - laneTop) / lanes.length;
  const inLane = (l: (typeof lanes)[number]) => idx >= l.from && idx < l.to;
  const valueText = `${tc("dayN", { n: String(day) })} · ${f.long(date)}`;
  const rows: KitRow[] = [
    { key: "date", label: `${tc("abbr.lmp")} + ${idx} ${dd}`, value: f.long(date), isKey: true },
    { key: "phase", label: t("rowPhase"), value: tc(`phases.${ph}`) },
    { key: "rel", label: t("rowRel"), value: `${signed(rel)} ${dd}` },
    { key: "chance", label: t("rowChance"), value: PCT(wilcoxOf(rel)) },
    { key: "today", label: t("rowFromToday"), value: `${signed(date - snap.today)} ${dd}` },
    { key: "left", label: t("rowToPeriod"), value: `${c - idx} ${dd}` },
  ];
  const sx = xs(idx + 0.5);
  const tagRight = sx < W * 0.6;
  return (
    <Card phoneRole="visual"
      tool={TOOL}
      idPrefix={ID}
      n={1}
      side={side}
      k="cycleDay"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { day: ltr(String(day)), date: ltr(f.long(date)), phase: tc(`phases.${ph}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((day - 1) / Math.max(1, c - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c1">
          <T x={tagRight ? sx + 6 : sx - 6} y={18} text={valueText} anchor={tagRight ? "start" : "end"} size={12} bold style={INK} />
          {/* Day cells coloured by phase */}
          {Array.from({ length: c }, (_, i) => (
            <rect key={i} x={xs(i) + 0.5} y={bandY} width={Math.max(1, xs(i + 1) - xs(i) - 1)} height={22} rx={2} fill={PHASE_COLORS[phaseOf(i, ov)]} opacity={i === idx ? 1 : 0.7} style={lit(i === idx && hover === "phase")} />
          ))}
          {/* Phase lanes */}
          {lanes.map((l, i) => {
            const y = laneTop + i * laneH + laneH / 2;
            const on = inLane(l);
            const name = `${tc(`phases.${l.key}`)} · ${l.to - l.from} ${dd}`;
            const a = xs(Math.max(0, l.from));
            const b = xs(Math.min(c, l.to));
            // Label above its bar, starting at the bar and pulled left only as far as it must to fit.
            const lx = Math.max(4, Math.min(a, W - 4 - textW(name, 10)));
            return (
              <g key={l.key}>
                <line x1={X0} y1={y + 4} x2={W - X0} y2={y + 4} style={{ stroke: "var(--ph-grid)" }} />
                <rect x={a} y={y - 1} width={Math.max(3, b - a)} height={10} rx={4} fill={PHASE_COLORS[l.key]} opacity={on ? 1 : 0.5} style={on ? { stroke: "var(--ph-focus)", strokeWidth: 2 } : undefined} />
                <T x={lx} y={y - 5} text={name} anchor="start" size={12} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          {/* Today (in this cycle) */}
          <line x1={xs(snap.dayIdx + 0.5)} y1={bandY - 4} x2={xs(snap.dayIdx + 0.5)} y2={base} style={{ stroke: "var(--ph-accent-strong)" }} strokeDasharray="3 3" strokeWidth={1.5} />
          {/* Selected day */}
          <rect x={xs(idx)} y={bandY - 4} width={Math.max(2, xs(idx + 1) - xs(idx))} height={base - bandY + 4} style={{ fill: "var(--ph-focus)" }} opacity={0.14} />
          <line x1={sx} y1={24} x2={sx} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} />
          {/* Day axis */}
          {[0, ov, c - 1].map((i, k) => (
            <T key={k} x={xs(i + 0.5)} y={base + 18} text={String(i + 1)} size={12} bold={i === ov} anchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} />
          ))}
          <SvgTrack W={W} y={trackY} frac={(day - 1) / Math.max(1, c - 1)} lo={tc("dayN", { n: "1" })} hi={tc("dayN", { n: String(c) })} />
        </Drawing>
      }
    />
  );
}

// ── 2. Labelled bars: chance of conception by day (Wilcox 1995) ──────────────────────────────
const RELS = [-5, -4, -3, -2, -1, 0, 1];
export function OvChanceCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("chance");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const relToday = snap.dayIdx - snap.ovOffset;
  const s = useStepper(relToday >= -5 && relToday <= 1 ? relToday : -1, { min: -5, max: 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 340;
  const d = useDrawing(HMIN, s, (x, _y, W) => -5 + ((x - X0) / (W - 2 * X0)) * 6);
  const { W, H } = d;
  const r = s.value;
  const ov = snap.cycles[0].ov;
  const p = wilcoxOf(r);
  const fromHere = combined(RELS.filter((k) => k >= r && k <= 0).map(wilcoxOf));
  const top = 40;
  const trackY = H - 52;
  const base = trackY - 64;
  const cw = (W - 2 * X0) / RELS.length;
  const yv = (v: number) => base - (v / 0.33) * (base - top);
  const dd = tc("abbr.d");
  const O = tc("abbr.ov");
  const rank = [...RELS].sort((a, b) => wilcoxOf(b) - wilcoxOf(a)).indexOf(r) + 1;
  const valueText = `${O} ${signed(r)} ${dd} · ${PCT(p)}`;
  const rows: KitRow[] = [
    { key: "date", label: `${O} ${signed(r)} ${dd}`, value: f.long(ov + r), isKey: true },
    { key: "p", label: t("rowSingle"), value: PCT(p) },
    { key: "rank", label: t("rowRank"), value: `${rank} / 7` },
    { key: "from", label: t("rowFromHere"), value: PCT(fromHere) },
    { key: "cd", label: t("rowCycleDay"), value: String(snap.ovOffset + r + 1) },
    { key: "today", label: t("rowFromToday"), value: `${signed(ov + r - snap.today)} ${dd}` },
  ];
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={2}
      side={side}
      k="chance"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { date: ltr(f.long(ov + r)), p: ltr(PCT(p)), from: ltr(PCT(fromHere)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((r + 5) / 6) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c2">
          <T x={X0} y={18} text={t("axis")} anchor="start" size={12} bold />
          {RELS.map((k, i) => {
            const x = X0 + i * cw + cw * 0.15;
            const bw = cw * 0.7;
            const on = k === r;
            const v = wilcoxOf(k);
            const y = yv(v);
            const color = k === 0 ? PHASE_COLORS.ovulation : PHASE_COLORS.fertile;
            return (
              <g key={k}>
                <rect x={x} y={Math.min(y, base - 2)} width={bw} height={Math.max(2, base - y)} rx={3} fill={color} opacity={on ? 1 : 0.55} style={lit(on && hover === "p")} />
                <T x={x + bw / 2} y={Math.min(y, base - 2) - 6} text={PCT(v)} size={on ? 12 : 12} bold={on} style={on ? INK : MUTED} />
                <T x={x + bw / 2} y={base + 16} text={signed(k)} size={12} bold={on} style={on ? INK : MUTED} />
                <T x={x + bw / 2} y={base + 31} text={String(new Date((ov + k) * DAY_MS).getUTCDate())} size={12} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} />
          <SvgTrack W={W} y={trackY} frac={(r + 5) / 6} lo={`${O} −5`} hi={`${O} +1`} />
        </Drawing>
      }
    />
  );
}

// ── 3. Trend line with a reference point: ovulation day vs cycle length (writes the cycle) ───
export function OvCycleLengthCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("cycleLength");
  const { snap, setCycle } = useOvLive();
  const f = useDateFmt();
  const s = useSharedStepper(clamp(snap.cycle, 20, 45), setCycle, { min: 20, max: 45, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 350;
  const d = useDrawing(HMIN, s, (x, _y, W) => 20 + ((x - X0) / (W - 2 * X0)) * 25);
  const { W, H } = d;
  const c = s.value;
  const L = snap.luteal;
  const ovDay = c - L + 1;
  const PL = 44;
  const PR = 18;
  const top = 34;
  const trackY = H - 52;
  const base = trackY - 52;
  const xc = (v: number) => PL + ((v - 20) / 25) * (W - PL - PR);
  const Y0 = 2;
  const Y1 = 36;
  const ys = (v: number) => base - ((clamp(v, Y0, Y1) - Y0) / (Y1 - Y0)) * (base - top);
  const dd = tc("abbr.d");
  const A = tc("abbr.lmp");
  const cls = c < FIGO_LO ? "frequent" : c > FIGO_HI ? "infrequent" : "normal";
  const valueText = `${c} ${dd} → ${tc("dayN", { n: String(ovDay) })}`;
  const rows: KitRow[] = [
    { key: "c", label: t("rowCycle"), value: `${c} ${dd}` },
    { key: "fol", label: `${c} − ${L}`, value: `${c - L} ${dd}` },
    { key: "ovday", label: t("rowOvDay"), value: String(ovDay), isKey: true },
    { key: "date", label: `${A} + ${c - L} ${dd}`, value: f.long(snap.lmp + c - L) },
    { key: "next", label: `${tr("nextPeriod")}: ${A} + ${c} ${dd}`, value: f.long(snap.lmp + c) },
    { key: "shift", label: t("rowShift"), value: `${signed(c - 28)} ${dd}` },
    { key: "figo", label: t("rowFigo"), value: t(`figo.${cls}`) },
  ];
  const px = xc(c);
  const py = ys(ovDay);
  const tag = `${tc("dayN", { n: String(ovDay) })} · ${f.short(snap.lmp + c - L)}`;
  const tagRight = px < W * 0.55;
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={3}
      side={side}
      k="cycleLength"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { c: ltr(`${c} ${dd}`), day: ltr(String(ovDay)), date: ltr(f.long(snap.lmp + c - L)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((c - 20) / 25) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c3">
          <T x={PL - 8} y={18} text={t("axisY")} anchor="start" size={12} bold />
          {/* FIGO normal-frequency band 24–38 days */}
          <rect x={xc(FIGO_LO)} y={top} width={xc(FIGO_HI) - xc(FIGO_LO)} height={base - top} fill="#22c55e" opacity={0.1} style={lit(hover === "figo")} />
          <T x={(xc(FIGO_LO) + xc(FIGO_HI)) / 2} y={top + 14} text={`${FIGO_LO}–${FIGO_HI} ${dd} · FIGO`} size={12} style={{ fill: "#16a34a" }} bold />
          {[5, 10, 15, 20, 25, 30, 35].map((v) => (
            <g key={v}>
              <line x1={PL} y1={ys(v)} x2={W - PR} y2={ys(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={ys(v) + 4} text={String(v)} anchor="end" size={12} />
            </g>
          ))}
          {/* The luteal-range fan (10–17 days) and the line for your luteal phase */}
          <path d={`M ${xc(20)} ${ys(20 - 10 + 1)} L ${xc(45)} ${ys(45 - 10 + 1)} L ${xc(45)} ${ys(45 - 17 + 1)} L ${xc(20)} ${ys(20 - 17 + 1)} Z`} fill={PHASE_COLORS.luteal} opacity={0.12} />
          <line x1={xc(20)} y1={ys(20 - L + 1)} x2={xc(45)} y2={ys(45 - L + 1)} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} />
          <T x={W - PR} y={ys(45 - L + 1) + 16} text={`L = ${L} ${dd}`} anchor="end" size={12} bold style={INK} />
          {/* Reference point */}
          <line x1={px} y1={py} x2={px} y2={base} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="3 3" />
          <circle cx={px} cy={py} r={hover === "ovday" ? 9 : 7} fill={PHASE_COLORS.ovulation} style={{ stroke: "var(--ph-surface)" }} strokeWidth={2} />
          <T x={tagRight ? px + 12 : px - 12} y={py - 10} text={tag} anchor={tagRight ? "start" : "end"} size={12} bold style={INK} />
          {[20, 25, 30, 35, 40, 45].map((v) => (
            <T key={v} x={xc(v)} y={base + 16} text={String(v)} size={12} bold={v === c} />
          ))}
          <SvgTrack W={W} y={trackY} frac={(c - 20) / 25} lo={`20 ${dd}`} hi={`45 ${dd}`} />
        </Drawing>
      }
    />
  );
}

// ── 4. Stacked segmented bar: follicular vs luteal split (writes the luteal phase) ────────────
export function OvPhaseSplitCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("split");
  const { snap, setLuteal } = useOvLive();
  const f = useDateFmt();
  const s = useSharedStepper(clamp(snap.luteal, 10, 17), setLuteal, { min: 10, max: 17, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => 10 + ((x - X0) / (W - 2 * X0)) * 7);
  const { W, H } = d;
  const c = snap.cycle;
  const L = s.value;
  const ov = c - L;
  const dd = tc("abbr.d");
  const xs = (i: number) => X0 + (clamp(i, 0, c) / c) * (W - 2 * X0);
  const trackY = H - 52;
  const bar1 = 46;
  const bar2 = 140;
  const bh = 34;
  const fw0 = ov - FW_BEFORE;
  const fw1 = ov + FW_AFTER + 1;
  const men = Math.min(MENSES_DAYS, Math.max(0, fw0));
  const segs1 = [
    { key: "fol", from: 0, to: ov, color: PHASE_COLORS.follicular, name: tc("phases.follicular") },
    { key: "lut", from: ov, to: c, color: PHASE_COLORS.luteal, name: tc("phases.luteal") },
  ];
  const segs2 = [
    { key: "men", from: 0, to: men, color: PHASE_COLORS.menses, name: tc("phases.menses") },
    { key: "pre", from: men, to: Math.max(men, fw0), color: PHASE_COLORS.follicular, name: "" },
    { key: "fw", from: fw0, to: fw1, color: PHASE_COLORS.fertile, name: tc("phases.fertile") },
    { key: "post", from: fw1, to: c, color: PHASE_COLORS.luteal, name: "" },
  ];
  const typical = L >= 12 && L <= 14;
  const valueText = `L = ${L} ${dd} · ${tc("dayN", { n: String(ov + 1) })}`;
  const rows: KitRow[] = [
    { key: "lut", label: t("rowLuteal"), value: `${L} ${dd}` },
    { key: "fol", label: `${c} − ${L}`, value: `${ov} ${dd}` },
    { key: "ov", label: t("rowOvDay"), value: `${ov + 1} · ${f.short(snap.lmp + ov)}`, isKey: true },
    { key: "fw", label: t("rowWindow"), value: `${f.short(snap.lmp + fw0)} – ${f.short(snap.lmp + fw1 - 1)}` },
    { key: "share", label: t("rowShare"), value: `${fw1 - fw0} / ${c} = ${PCT((fw1 - fw0) / c)}` },
    { key: "typ", label: t("rowTypical"), value: typical ? t("yes") : t("no") },
  ];
  const seg = (sg: { key: string; from: number; to: number; color: string; name: string }, y: number) => {
    const a = xs(sg.from);
    const b = xs(sg.to);
    if (b - a <= 0) return null;
    const n = sg.to - sg.from;
    const label = `${n}`;
    const on = hover === sg.key;
    return (
      <g key={sg.key}>
        <rect x={a} y={y} width={b - a} height={bh} fill={sg.color} style={lit(on)} />
        {b - a > 22 && <T x={(a + b) / 2} y={y + bh / 2 + 4} text={label} size={12} bold style={{ fill: "#fff" }} />}
        {sg.name && b - a > textW(sg.name, 10) + 4 && <T x={(a + b) / 2} y={y - 6} text={sg.name} size={12} bold style={MUTED} />}
      </g>
    );
  };
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={4}
      side={side}
      k="split"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { l: ltr(`${L} ${dd}`), f: ltr(`${ov} ${dd}`), day: ltr(String(ov + 1)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((L - 10) / 7) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c4">
          <T x={X0} y={18} text={t("bar1")} anchor="start" size={12} bold />
          {segs1.map((sg) => seg(sg, bar1))}
          <T x={X0} y={bar2 - 26} text={t("bar2")} anchor="start" size={12} bold />
          {segs2.map((sg) => seg(sg, bar2))}
          {/* Ovulation marker across both bars */}
          <line x1={xs(ov + 0.5)} y1={bar1 - 4} x2={xs(ov + 0.5)} y2={bar2 + bh + 4} style={{ stroke: PHASE_COLORS.ovulation }} strokeWidth={3} />
          <circle cx={xs(ov + 0.5)} cy={bar2 + bh + 12} r={6} fill={PHASE_COLORS.ovulation} />
          <T x={clamp(xs(ov + 0.5), X0 + 40, W - X0 - 40)} y={bar2 + bh + 34} text={`${tc("phases.ovulation")} · ${f.short(snap.lmp + ov)}`} size={12} bold style={INK} />
          {/* Day scale */}
          {[0, 7, 14, 21, 28, 35, 42].filter((v) => v <= c).map((v) => (
            <T key={v} x={xs(v)} y={bar1 + bh + 14} text={String(v)} size={12} />
          ))}
          <SvgTrack W={W} y={trackY} frac={(L - 10) / 7} lo={`L = 10 ${dd}`} hi={`L = 17 ${dd}`} stops={[{ frac: 2 / 7 }, { frac: 4 / 7 }]} />
        </Drawing>
      }
    />
  );
}

// ── 5. Calendar grid: month by month, coloured by cycle phase ────────────────────────────────
function monthStartDay(base: number, k: number): number {
  const b = new Date(base * DAY_MS);
  return Math.round(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + k, 1) / DAY_MS);
}
export function OvCalendarCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("calendar");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const end = snap.cycles[snap.cycles.length - 1].next;
  const first = new Date(snap.lmp * DAY_MS);
  const last = new Date((end - 1) * DAY_MS);
  const M = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth();
  const todayK = (() => {
    const tdy = new Date(snap.today * DAY_MS);
    return clamp((tdy.getUTCFullYear() - first.getUTCFullYear()) * 12 + tdy.getUTCMonth() - first.getUTCMonth(), 0, M);
  })();
  const s = useStepper(todayK, { min: 0, max: M, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 410;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * M);
  const { W, H } = d;
  const k = Math.min(s.value, M);
  const m0 = monthStartDay(snap.lmp, k);
  const m1 = monthStartDay(snap.lmp, k + 1);
  const lead = new Date(m0 * DAY_MS).getUTCDay();
  const trackY = H - 52;
  const gx0 = X0 - 16;
  const cw = (W - 2 * gx0) / 7;
  const gy0 = 52;
  const ch = Math.max(28, (trackY - 70 - gy0) / 6);
  const inRange = (day: number) => day >= snap.lmp && day < end;
  const phaseAt = (day: number) => phaseOf(mod(day - snap.lmp, snap.cycle), snap.ovOffset);
  const days = Array.from({ length: m1 - m0 }, (_, i) => m0 + i);
  const fertile = days.filter((x) => inRange(x) && (phaseAt(x) === "fertile" || phaseAt(x) === "ovulation")).length;
  const ovs = snap.cycles.filter((cy) => cy.ov >= m0 && cy.ov < m1);
  const periods = [snap.lmp, ...snap.cycles.map((cy) => cy.next)].filter((x) => x >= m0 && x < m1);
  const valueText = f.month(m0);
  const rows: KitRow[] = [
    { key: "month", label: t("rowMonth", { n: String(k + 1), total: String(M + 1) }), value: f.month(m0), isKey: true },
    { key: "fw", label: t("rowFertile"), value: `${fertile}` },
    { key: "ov", label: tr("ovulationDay"), value: ovs.length ? ovs.map((cy) => f.short(cy.ov)).join(" · ") : tc("none") },
    { key: "per", label: t("rowPeriods"), value: periods.length ? periods.map((x) => f.short(x)).join(" · ") : tc("none") },
    { key: "today", label: t("rowToday"), value: snap.today >= m0 && snap.today < m1 ? `${f.short(snap.today)} · ${tc(`phases.${phaseAt(snap.today)}`)}` : tc("none") },
  ];
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={5}
      side={side}
      k="calendar"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { month: f.month(m0), n: ltr(String(fertile)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (M ? k / M : 0) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c5">
          <T x={W / 2} y={20} text={f.month(m0)} size={14} bold style={INK} />
          {Array.from({ length: 7 }, (_, i) => (
            <T key={i} x={gx0 + cw * i + cw / 2} y={gy0 - 10} text={f.weekday(i)} size={12} bold />
          ))}
          {days.map((day, i) => {
            const pos = lead + i;
            const x = gx0 + (pos % 7) * cw;
            const y = gy0 + Math.floor(pos / 7) * ch;
            const on = inRange(day);
            const ph = on ? phaseAt(day) : null;
            const isOv = ph === "ovulation";
            const isToday = day === snap.today;
            const hl = (hover === "fw" && (ph === "fertile" || isOv)) || (hover === "ov" && isOv);
            return (
              <g key={day}>
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={cw - 3}
                  height={ch - 3}
                  rx={5}
                  fill={ph ? PHASE_COLORS[ph] : "transparent"}
                  opacity={isOv ? 1 : ph ? (ph === "fertile" ? 0.6 : 0.28) : 1}
                  style={ph ? (hl ? { stroke: "var(--ph-focus)", strokeWidth: 2.5 } : undefined) : { stroke: "var(--ph-grid)" }}
                />
                {isToday && <rect x={x + 1.5} y={y + 1.5} width={cw - 3} height={ch - 3} rx={5} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={2.5} />}
                <T x={x + cw / 2} y={y + ch / 2 + 4} text={String(i + 1)} size={12} bold={isOv || isToday} style={isOv ? { fill: "#fff" } : on ? INK : MUTED} />
              </g>
            );
          })}
          {/* Legend */}
          {(["menses", "fertile", "ovulation", "luteal"] as PhaseKey[]).map((key, i) => {
            const lx = X0 + (i % 2) * ((W - 2 * X0) / 2);
            const ly = gy0 + 6 * ch + 14 + Math.floor(i / 2) * 15;
            return (
              <g key={key}>
                <rect x={lx} y={ly - 9} width={10} height={10} rx={2} fill={PHASE_COLORS[key]} />
                <T x={lx + 15} y={ly} text={tc(`phases.${key}`)} anchor="start" size={12} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={M ? k / M : 0} lo={f.monthShort(monthStartDay(snap.lmp, 0))} hi={f.monthShort(monthStartDay(snap.lmp, M))} />
        </Drawing>
      }
    />
  );
}

// ── 6. Multi-ring donut: where any date falls in the cycle ───────────────────────────────────
export function OvDonutCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("donut");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const s = useStepper(0, { min: -14, max: 56, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 400;
  const d = useDrawing(HMIN, s, (x, _y, W) => -14 + ((x - X0) / (W - 2 * X0)) * 70);
  const { W, H } = d;
  const { cycle: c, ovOffset: ov } = snap;
  const off = s.value;
  const date = snap.today + off;
  const idx = mod(date - snap.lmp, c);
  const n = Math.floor((date - snap.lmp) / c) + 1;
  const ph = phaseOf(idx, ov);
  const toOv = idx <= ov ? ov - idx : ov + c - idx;
  const toPer = c - idx;
  const fwIdx = idx - (ov - FW_BEFORE);
  const trackY = H - 52;
  const legendY = trackY - 82;
  const R = Math.max(60, Math.min(W / 2 - 40, (legendY - 30) / 2));
  const cx = W / 2;
  const cy = 18 + R;
  const sw = Math.max(9, R * 0.13);
  const arc = (r: number, a0: number, a1: number) => {
    const p0 = [px2(cx + r * Math.sin(a0)), px2(cy - r * Math.cos(a0))];
    const p1 = [px2(cx + r * Math.sin(a1)), px2(cy - r * Math.cos(a1))];
    return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1[0]} ${p1[1]}`;
  };
  const dd = tc("abbr.d");
  const valueText = `${signed(off)} ${dd} · ${f.short(date)}`;
  const rows: KitRow[] = [
    { key: "date", label: `${tc("abbr.today")} ${signed(off)} ${dd}`, value: f.long(date), isKey: true },
    { key: "cd", label: t("rowCycleDay"), value: `${idx + 1} / ${c}` },
    { key: "phase", label: t("rowPhase"), value: tc(`phases.${ph}`) },
    { key: "ov", label: t("rowToOv"), value: `${toOv} ${dd} · ${f.short(date + toOv)}` },
    { key: "per", label: t("rowToPeriod"), value: `${toPer} ${dd} · ${f.short(date + toPer)}` },
    { key: "chance", label: t("rowChance"), value: PCT(wilcoxOf(idx - ov)) },
    { key: "n", label: t("rowCycleN"), value: n >= 1 && n <= snap.cycles.length ? String(n) : t("outside") },
  ];
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={6}
      side={side}
      k="donut"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { date: ltr(f.long(date)), day: ltr(String(idx + 1)), phase: tc(`phases.${ph}`), ov: ltr(`${toOv} ${dd}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((off + 14) / 70) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c6">
          {/* Outer ring: every day of the cycle in its phase colour, filled up to the date */}
          {Array.from({ length: c }, (_, i) => {
            const a0 = (i / c) * 2 * Math.PI + 0.02;
            const a1 = ((i + 1) / c) * 2 * Math.PI - 0.02;
            const on = i <= idx;
            return <path key={i} d={arc(R, a0, a1)} fill="none" stroke={PHASE_COLORS[phaseOf(i, ov)]} strokeWidth={i === idx ? sw + 4 : sw} opacity={on ? 1 : 0.25} style={hover === "phase" && i === idx ? { stroke: "var(--ph-focus)" } : undefined} />;
          })}
          {/* Middle ring: countdown to the next ovulation */}
          <circle cx={cx} cy={cy} r={R - sw * 1.6} fill="none" style={{ stroke: "var(--ph-grid)" }} strokeWidth={sw} />
          {toOv > 0 && <path d={arc(R - sw * 1.6, 0, Math.min(0.9999, toOv / c) * 2 * Math.PI)} fill="none" stroke={PHASE_COLORS.ovulation} strokeWidth={hover === "ov" ? sw + 3 : sw} strokeLinecap="round" />}
          {/* Inner ring: the 7 days of the fertile window */}
          {Array.from({ length: 7 }, (_, k) => {
            const r = R - sw * 3.2;
            const a0 = (k / 7) * 2 * Math.PI + 0.06;
            const a1 = ((k + 1) / 7) * 2 * Math.PI - 0.06;
            const lit7 = fwIdx >= 0 && k <= fwIdx && fwIdx < 7;
            return <path key={k} d={arc(r, a0, a1)} fill="none" stroke={lit7 ? (k === 5 ? PHASE_COLORS.ovulation : PHASE_COLORS.fertile) : "var(--ph-grid)"} strokeWidth={sw} style={lit7 ? undefined : { stroke: "var(--ph-grid)" }} />;
          })}
          <T x={cx} y={cy + 2} text={String(idx + 1)} size={Math.min(30, R * 0.36)} bold style={INK} />
          <T x={cx} y={cy + Math.min(30, R * 0.36) * 0.75} text={`/ ${c} ${dd}`} size={12} bold />
          {[
            { col: PHASE_COLORS[ph], text: `${t("ringCycle")} · ${tc(`phases.${ph}`)}` },
            { col: PHASE_COLORS.ovulation, text: `${t("ringOv")} · ${toOv} ${dd}` },
            { col: PHASE_COLORS.fertile, text: `${t("ringWindow")} · ${fwIdx >= 0 && fwIdx < 7 ? `${fwIdx + 1}/7` : "0/7"}` },
          ].map((l, i) => (
            <g key={i}>
              <rect x={X0} y={legendY + 8 + i * 18 - 9} width={10} height={10} rx={2} fill={l.col} />
              <T x={X0 + 15} y={legendY + 8 + i * 18} text={l.text} anchor="start" size={12} bold style={INK} />
            </g>
          ))}
          <SvgTrack W={W} y={trackY} frac={(off + 14) / 70} lo={`−14 ${dd}`} hi={`+56 ${dd}`} stops={[{ frac: 0.2, text: tc("abbr.today"), on: off === 0 }]} />
        </Drawing>
      }
    />
  );
}

// ── 7. Sensitivity trio: if your cycle runs a few days shorter or longer ─────────────────────
export function OvTrioCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("trio");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const s = useStepper(3, { min: 0, max: 7, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 7);
  const { W, H } = d;
  const N = s.value;
  const { cycle: c, luteal: L, lmp } = snap;
  const dd = tc("abbr.d");
  const cols = [
    { key: "short", name: t("shorter"), c: c - N },
    { key: "cur", name: t("current"), c },
    { key: "long", name: t("longer"), c: c + N },
  ].map((x) => ({ ...x, ov: lmp + x.c - L }));
  const first = cols[0].ov - FW_BEFORE;
  const lastDay = cols[2].ov + FW_AFTER;
  const trackY = H - 52;
  const axisY = trackY - 76;
  const cw = (W - 2 * X0) / 3;
  const boxH = Math.max(70, axisY - 76);
  const span0 = cols[1].ov - FW_BEFORE - 7 - 1;
  const span1 = cols[1].ov + FW_AFTER + 7 + 1;
  const xs = (v: number) => X0 + ((clamp(v, span0, span1) - span0) / (span1 - span0)) * (W - 2 * X0);
  const valueText = `± ${N} ${dd}`;
  const rows: KitRow[] = [
    { key: "short", label: `${c - N} ${dd}: ${tc("abbr.lmp")} + ${c - N - L} ${dd}`, value: f.long(cols[0].ov) },
    { key: "cur", label: `${c} ${dd}: ${tc("abbr.lmp")} + ${c - L} ${dd}`, value: f.long(cols[1].ov), isKey: true },
    { key: "long", label: `${c + N} ${dd}: ${tc("abbr.lmp")} + ${c + N - L} ${dd}`, value: f.long(cols[2].ov) },
    { key: "wide", label: t("rowWide"), value: `${f.short(first)} – ${f.short(lastDay)}` },
    { key: "len", label: `7 + 2 × ${N}`, value: `${lastDay - first + 1} ${dd}` },
  ];
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={7}
      side={side}
      k="trio"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { n: ltr(`${N} ${dd}`), from: ltr(f.long(first)), to: ltr(f.long(lastDay)), len: ltr(`${lastDay - first + 1} ${dd}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (N / 7) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c7">
          {cols.map((col, i) => {
            const x = X0 + cw * i + 4;
            const on = col.key === "cur" || hover === col.key;
            return (
              <g key={col.key}>
                <rect x={x} y={14} width={cw - 8} height={boxH} rx={10} style={{ fill: col.key === "cur" ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + (cw - 8) / 2} y={34} text={col.name} size={Math.min(10.5, (cw - 14) / (col.name.length * 0.56))} bold style={MUTED} />
                <T x={x + (cw - 8) / 2} y={14 + boxH / 2 + 4} text={f.short(col.ov)} size={col.key === "cur" ? 15 : 13} bold style={INK} />
                <T x={x + (cw - 8) / 2} y={14 + boxH - 12} text={`${col.c} ${dd}`} size={12} bold />
              </g>
            );
          })}
          {/* Fertile windows on a date axis, plus the widened window */}
          <rect x={xs(first)} y={axisY - 56} width={xs(lastDay + 1) - xs(first)} height={12} rx={6} fill={PHASE_COLORS.fertile} opacity={0.3} style={lit(hover === "wide" || hover === "len")} />
          {cols.map((col, i) => (
            <rect key={col.key} x={xs(col.ov - FW_BEFORE)} y={axisY - 40 + i * 11} width={xs(col.ov + FW_AFTER + 1) - xs(col.ov - FW_BEFORE)} height={8} rx={4} fill={PHASE_COLORS.fertile} opacity={col.key === "cur" ? 0.9 : 0.45} />
          ))}
          <line x1={X0} y1={axisY} x2={W - X0} y2={axisY} style={LINE} strokeWidth={2} />
          {cols.map((col) => (
            <circle key={col.key} cx={xs(col.ov + 0.5)} cy={axisY} r={col.key === "cur" ? 7 : 5.5} fill={PHASE_COLORS.ovulation} stroke="#fff" strokeWidth={1.5} />
          ))}
          <T x={xs(first)} y={axisY + 24} text={f.short(first)} anchor="start" size={12} bold />
          <T x={xs(lastDay + 1)} y={axisY + 24} text={f.short(lastDay)} anchor="end" size={12} bold />
          <SvgTrack W={W} y={trackY} frac={N / 7} lo={`±0 ${dd}`} hi={`±7 ${dd}`} />
        </Drawing>
      }
    />
  );
}

// ── 8. Flow arrows with embedded numbers: the count-back method for cycle 1, 2 or 3 ───────────
export function OvFlowCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("flow");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const s = useStepper(1, { min: 1, max: snap.cycles.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * (snap.cycles.length - 1));
  const { W, H } = d;
  const n = s.value;
  const cy = snap.cycles[n - 1];
  const { cycle: c, luteal: L } = snap;
  const dd = tc("abbr.d");
  const trackY = H - 52;
  const boxes = [
    { key: "lmp", name: tc("abbr.lmp"), value: f.long(snap.lmp), color: PHASE_COLORS.menses },
    { key: "next", name: tr("nextPeriod"), value: f.long(cy.next), color: PHASE_COLORS.menses },
    { key: "ov", name: tr("ovulationDay"), value: f.long(cy.ov), color: PHASE_COLORS.ovulation },
    { key: "fw", name: tr("fertileWindow"), value: `${f.short(cy.fwStart)} – ${f.short(cy.fwEnd)}`, color: PHASE_COLORS.fertile },
  ];
  const pills = [`+ ${n} × ${c} = ${n * c} ${dd}`, `− ${L} ${dd}`, `− ${FW_BEFORE} / + ${FW_AFTER} ${dd}`];
  const top = 10;
  const bottom = trackY - 36;
  const gap = (bottom - top) / boxes.length;
  const bh = Math.min(44, gap - 22);
  const bw = Math.min(W - 2 * X0, 300);
  const bx = (W - bw) / 2;
  const valueText = tr("cycle", { n });
  const rows: KitRow[] = [
    { key: "next", label: `${tc("abbr.lmp")} + ${n} × ${c} ${dd}`, value: f.long(cy.next) },
    { key: "ov", label: `${tc("abbr.next")} − ${L} ${dd}`, value: f.long(cy.ov), isKey: true },
    { key: "fw", label: `${tc("abbr.ov")} − ${FW_BEFORE} ${dd}`, value: f.long(cy.fwStart) },
    { key: "fwEnd", label: `${tc("abbr.ov")} + ${FW_AFTER} ${dd}`, value: f.long(cy.fwEnd) },
    { key: "today", label: t("rowFromToday"), value: `${signed(cy.ov - snap.today)} ${dd}` },
  ];
  return (
    <Card
      tool={TOOL}
      idPrefix={ID}
      n={8}
      side={side}
      k="flow"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { n: ltr(String(n)), ov: ltr(f.long(cy.ov)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((n - 1) / Math.max(1, snap.cycles.length - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="ov-c8">
          {boxes.map((b, i) => {
            const y = top + i * gap;
            const on = hover === b.key || (b.key === "fw" && hover === "fwEnd");
            return (
              <g key={b.key}>
                <rect x={bx} y={y} width={bw} height={bh} rx={10} style={{ fill: "var(--ph-surface)", ...lit(on || b.key === "ov") }} />
                <rect x={bx} y={y} width={8} height={bh} rx={4} fill={b.color} />
                <T x={bx + 18} y={y + 16} text={b.name} anchor="start" size={12} bold style={MUTED} />
                <T x={bx + 18} y={y + bh - 8} text={b.value} anchor="start" size={13} bold style={INK} />
                {i < pills.length && (
                  <g>
                    <line x1={W / 2} y1={y + bh} x2={W / 2} y2={y + gap - 2} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={2.5} />
                    <path d={`M ${W / 2 - 6} ${y + gap - 8} L ${W / 2} ${y + gap - 1} L ${W / 2 + 6} ${y + gap - 8} Z`} style={{ fill: "var(--ph-accent-strong)" }} />
                    <rect x={W / 2 + 10} y={y + bh + (gap - bh) / 2 - 10} width={textW(pills[i], 11) + 16} height={20} rx={10} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} />
                    <T x={W / 2 + 18} y={y + bh + (gap - bh) / 2 + 4} text={pills[i]} anchor="start" size={12} bold style={INK} />
                  </g>
                )}
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(n - 1) / Math.max(1, snap.cycles.length - 1)} stops={snap.cycles.map((cc, i) => ({ frac: i / Math.max(1, snap.cycles.length - 1), text: tr("cycle", { n: cc.n }), on: cc.n === n }))} />
        </Drawing>
      }
    />
  );
}
