"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp } from "@/components/tool-ui/indicator-kit/format";
import { Card, SvgTrack, useSharedStepper } from "../macro-calculator/MacroCards";
import { useDateFmt, useDueLive } from "./DueDateLiveContext";
import {
  BIRTH_SD,
  DAY_MS,
  MILESTONES,
  TERM_DAYS,
  TRIMESTERS,
  ZONES,
  birthCdf,
  birthOnDay,
  naegeleMnemonic,
  redateThreshold,
  trimesterOf,
  wd,
  zoneOf,
} from "./dueDate";

/**
 * The eight due-date indicator cards (§31 library). All read the calculator's live result (method,
 * entered date, cycle length, due date, conception date, gestational age today) through
 * DueDateLiveContext. The cycle-length card writes the cycle back in LMP mode, so dragging it moves
 * the input, the Result table and the 3D week path. The other cards keep a what-if value of their
 * own on top of the live result. Numbers use Western digits, like the BMI cards. Every drag handle
 * sits on its own track along the bottom; value labels sit 38px under the track, out of its reach.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
const PCT = (v: number) => `${(v * 100).toFixed(1)}%`;
const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.due-date-calculator.visuals.${key}`),
    tc: useTranslations("tools.due-date-calculator.visuals.common"),
    tr: useTranslations("tools.due-date-calculator.result"),
    tk: useTranslations("toolPage.indicatorKit"),
  };
}

/** Rough text width for placing SVG labels (no measuring pass needed). */
const textW = (s: string, size: number) => s.length * size * 0.56;

// ── 1. Timeline with stations: pick any week, see its dates and what happens then (wow) ───────
export function DueTimelineCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("timeline");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const s = useStepper(clamp(Math.floor(snap.ga / 7), 0, 42), { min: 0, max: 42, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 42);
  const { W, H } = d;
  const D = 294;
  const xs = (g: number) => X0 + (clamp(g, 0, D) / D) * (W - 2 * X0);
  const w = s.value;
  const g0 = w * 7;
  const start = snap.lmp + g0;
  const fromToday = start - snap.today;
  const active = MILESTONES.filter((m) => m.from < g0 + 7 && m.to > g0);
  const next = MILESTONES.find((m) => m.from >= g0 + 7);
  const trackY = H - 52;
  const bandY = 34;
  const laneTop = 68;
  const base = trackY - 56;
  const laneH = (base - laneTop) / MILESTONES.length;
  const sx = xs(g0 + 3.5);
  const valueText = `${wd(g0)} · ${f.long(start)}`;
  const dd = tc("abbr.d");
  const rows: KitRow[] = [
    { key: "start", label: `${tc("abbr.lmp")} + ${g0} ${dd} (${wd(g0)})`, value: f.long(start), isKey: true },
    { key: "end", label: `${tc("abbr.lmp")} + ${g0 + 6} ${dd} (${wd(g0 + 6)})`, value: f.long(start + 6) },
    { key: "today", label: t("rowFromToday"), value: `${signed(fromToday)} ${dd}` },
    { key: "tri", label: tr("trimester"), value: tr(`trimesterValue.${trimesterOf(g0)}`) },
    { key: "zone", label: t("rowZone"), value: g0 < 259 ? t("notYetTerm") : tc(`zones.${zoneOf(g0)}`) },
    { key: "ms", label: t("rowMilestones"), value: active.length ? active.map((m) => tc(`milestones.${m.key}`)).join(" · ") : tc("none") },
    { key: "next", label: t("rowNext"), value: next ? `${tc(`milestones.${next.key}`)} · ${f.short(snap.lmp + next.from)}` : tc("none") },
  ];
  const tagRight = sx < W * 0.6;
  return (
    <Card phoneRole="visual" tool="due-date-calculator" idPrefix="due"
      n={1}
      side={side}
      k="timeline"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { week: ltr(wd(g0)), date: ltr(f.long(start)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (w / 42) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c1">
          <T x={tagRight ? sx + 6 : sx - 6} y={18} text={valueText} anchor={tagRight ? "start" : "end"} size={12} bold style={INK} />
          {/* Trimester band, then the post-due fortnight */}
          {TRIMESTERS.map((tm) => (
            <g key={tm.n}>
              <rect x={xs(tm.from)} y={bandY} width={xs(tm.to) - xs(tm.from)} height={22} fill={tm.color} style={lit(hover === "tri" && trimesterOf(g0) === tm.n)} />
              <T x={(xs(tm.from) + xs(tm.to)) / 2} y={bandY + 15} text={tr(`trimesterValue.${tm.n}`)} size={10.5} bold style={{ fill: "#fff" }} />
            </g>
          ))}
          <rect x={xs(TERM_DAYS)} y={bandY} width={xs(D) - xs(TERM_DAYS)} height={22} style={{ fill: "var(--ph-ink-muted)" }} opacity={0.25} />
          {/* Milestone lanes */}
          {MILESTONES.map((m, i) => {
            const y = laneTop + i * laneH + laneH / 2;
            const on = active.includes(m);
            const name = tc(`milestones.${m.key}`);
            const a = xs(m.from);
            const b = xs(m.to);
            const after = b + 6 + textW(name, 10) < W - 4;
            return (
              <g key={m.key}>
                <line x1={X0} y1={y} x2={W - X0} y2={y} style={{ stroke: "var(--ph-grid)" }} />
                <rect x={a} y={y - 6} width={Math.max(3, b - a)} height={12} rx={4} fill={m.color} opacity={on ? 1 : 0.55} style={on ? { stroke: "var(--ph-focus)", strokeWidth: 2 } : undefined} />
                <T x={after ? b + 6 : a - 6} y={y + 4} text={name} anchor={after ? "start" : "end"} size={10} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          {/* Today */}
          <line x1={xs(snap.ga)} y1={bandY - 4} x2={xs(snap.ga)} y2={base} style={{ stroke: "var(--ph-accent-strong)" }} strokeDasharray="3 3" strokeWidth={1.5} />
          {/* Selected week */}
          <rect x={xs(g0)} y={bandY - 4} width={Math.max(2, xs(g0 + 7) - xs(g0))} height={base - bandY + 4} style={{ fill: "var(--ph-focus)" }} opacity={0.14} />
          <line x1={sx} y1={24} x2={sx} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} />
          {/* Week axis */}
          {[0, 8, 16, 24, 32, 40].map((k) => (
            <T key={k} x={xs(k * 7)} y={base + 18} text={String(k)} size={10} />
          ))}
          <SvgTrack W={W} y={trackY} frac={w / 42} lo="0+0" hi="42+0" />
        </Drawing>
      }
    />
  );
}

// ── 2. Zone strip: the ACOG term window on your calendar, drag a birth day ──────────────────
export function DueTermWindowCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("window");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const s = useStepper(0, { min: -28, max: 14, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => -28 + ((x - X0) / (W - 2 * X0)) * 42);
  const { W, H } = d;
  const G0 = 245;
  const G1 = 301;
  const xs = (g: number) => X0 + ((clamp(g, G0, G1) - G0) / (G1 - G0)) * (W - 2 * X0);
  const off = s.value;
  const ga = TERM_DAYS + off;
  const birth = snap.due + off;
  const zone = zoneOf(ga);
  const stripY = 40;
  const trackY = H - 52;
  const dd = tc("abbr.d");
  const valueText = `${signed(off)} ${dd} · ${f.short(birth)}`;
  const range = (k: (typeof ZONES)[number]) =>
    k.key === "preterm" ? t("before", { date: f.short(snap.lmp + k.to) }) : k.key === "post" ? t("from", { date: f.short(snap.lmp + k.from) }) : `${f.short(snap.lmp + k.from)} – ${f.short(snap.lmp + k.to - 1)}`;
  const rows: KitRow[] = [
    { key: "birth", label: `${tc("abbr.due")} ${signed(off)} ${dd}`, value: f.long(birth), isKey: true },
    { key: "ga", label: t("rowGa"), value: wd(ga) },
    { key: "zone", label: t("rowZone"), value: tc(`zones.${zone}`) },
    { key: "today", label: t("rowFromToday"), value: `${signed(birth - snap.today)} ${dd}` },
    { key: "window", label: t("rowWindow"), value: `${f.short(snap.lmp + 259)} – ${f.short(snap.lmp + 293)}` },
    { key: "len", label: t("rowLength"), value: `35 ${dd}` },
  ];
  const mx = xs(ga);
  const tagRight = mx < W * 0.55;
  const legendY = stripY + 74;
  const legendStep = Math.max(19, Math.min(26, (trackY - 30 - legendY) / 5));
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={2}
      side={side}
      k="window"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { date: ltr(f.long(birth)), ga: ltr(wd(ga)), zone: tc(`zones.${zone}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((off + 28) / 42) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c2">
          <T x={tagRight ? mx + 8 : mx - 8} y={22} text={`${f.long(birth)} · ${wd(ga)}`} anchor={tagRight ? "start" : "end"} size={12} bold style={INK} />
          {ZONES.map((z) => {
            const a = xs(z.from);
            const b = xs(z.to);
            if (b - a <= 0) return null;
            return <rect key={z.key} x={a} y={stripY} width={b - a} height={32} fill={z.color} opacity={z.key === zone ? 1 : 0.6} style={lit(hover === "zone" && z.key === zone)} />;
          })}
          {/* Due date line */}
          <line x1={xs(TERM_DAYS)} y1={stripY - 4} x2={xs(TERM_DAYS)} y2={stripY + 36} style={{ stroke: "#fff" }} strokeWidth={2} strokeDasharray="4 3" />
          {/* Boundary weeks under the strip */}
          {[245, 259, 273, 287, 294, 301].map((g, i, all) => (
            <T key={g} x={xs(g)} y={stripY + 50} text={wd(g)} anchor={i === 0 ? "start" : i === all.length - 1 ? "end" : "middle"} size={10} bold={g === 259 || g === 294} />
          ))}
          {/* Selected birth day */}
          <line x1={mx} y1={stripY - 10} x2={mx} y2={stripY + 38} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} />
          <path d={`M ${mx - 6} ${stripY - 14} L ${mx + 6} ${stripY - 14} L ${mx} ${stripY - 6} Z`} style={{ fill: "var(--ph-ink)" }} />
          {/* Legend with calendar ranges */}
          {ZONES.map((z, i) => {
            const y = legendY + i * legendStep;
            const on = z.key === zone;
            return (
              <g key={`lg${z.key}`}>
                <rect x={X0} y={y - 10} width={11} height={11} rx={2} fill={z.color} />
                <T x={X0 + 17} y={y} text={`${tc(`zones.${z.key}`)} · ${range(z)}`} anchor="start" size={10.5} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(off + 28) / 42} lo={`−28 ${dd}`} hi={`+14 ${dd}`} />
        </Drawing>
      }
    />
  );
}

// ── 3. Labelled bars: chance of birth in each week (model, labelled) ────────────────────────
const W_LO = 34;
const W_HI = 43;
export function DueBirthOddsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("odds");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const s = useStepper(40, { min: W_LO, max: W_HI, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => W_LO + ((x - X0) / (W - 2 * X0)) * (W_HI - W_LO));
  const { W, H } = d;
  const weeks = Array.from({ length: W_HI - W_LO + 1 }, (_, i) => W_LO + i);
  const pOf = (wk: number) => (wk === W_HI ? 1 : birthCdf(7 * (wk + 1) - 0.5)) - (wk === W_LO ? 0 : birthCdf(7 * wk - 0.5));
  const ps = weeks.map(pOf);
  const pmax = Math.max(...ps);
  const sel = s.value;
  const p = pOf(sel);
  const byEnd = sel === W_HI ? 1 : birthCdf(7 * (sel + 1) - 0.5);
  const still = 1 - (sel === W_LO ? 0 : birthCdf(7 * sel - 0.5));
  const top = 40;
  const trackY = H - 52;
  const base = trackY - 50;
  const cw = (W - 2 * X0) / weeks.length;
  const yv = (v: number) => base - (v / pmax) * (base - top);
  const dd = tc("abbr.d");
  const valueText = `${sel === W_LO ? "≤" : ""}${sel}${sel === W_HI ? "+" : ""} · ${PCT(p)}`;
  const rows: KitRow[] = [
    { key: "p", label: t("rowInWeek", { week: `${sel}+0 – ${sel}+6` }), value: PCT(p), isKey: true },
    { key: "dates", label: t("rowDates"), value: `${f.short(snap.lmp + sel * 7)} – ${f.short(snap.lmp + sel * 7 + 6)}` },
    { key: "by", label: t("rowByEnd"), value: PCT(byEnd) },
    { key: "still", label: t("rowStill"), value: PCT(still) },
    { key: "due", label: t("rowOnDue"), value: PCT(birthOnDay(TERM_DAYS)) },
    { key: "pm7", label: t("rowWithin7"), value: PCT(birthCdf(TERM_DAYS + 7.5) - birthCdf(TERM_DAYS - 7.5)) },
    { key: "model", label: t("rowModel"), value: `280 ± ${BIRTH_SD} ${dd}` },
  ];
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={3}
      side={side}
      k="odds"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { week: ltr(String(sel)), p: ltr(PCT(p)), by: ltr(PCT(byEnd)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((sel - W_LO) / (W_HI - W_LO)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c3">
          <T x={X0} y={18} text={t("axis")} anchor="start" size={10.5} bold />
          {weeks.map((wk, i) => {
            const x = X0 + i * cw + cw * 0.15;
            const bw = cw * 0.7;
            const on = wk === sel;
            const y = yv(ps[i]);
            const zone = ZONES.find((z) => z.key === zoneOf(wk * 7)) ?? ZONES[2];
            return (
              <g key={wk}>
                <rect x={x} y={y} width={bw} height={Math.max(1, base - y)} rx={3} fill={zone.color} opacity={on ? 1 : 0.55} style={lit(on && hover === "p")} />
                <T x={x + bw / 2} y={y - 6} text={`${(ps[i] * 100).toFixed(ps[i] < 0.1 ? 1 : 0)}`} size={on ? 11.5 : 9.5} bold={on} style={on ? INK : MUTED} />
                <T x={x + bw / 2} y={base + 16} text={wk === W_LO ? `≤${wk}` : wk === W_HI ? `${wk}+` : String(wk)} size={10} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} />
          <SvgTrack W={W} y={trackY} frac={(sel - W_LO) / (W_HI - W_LO)} lo={`${W_LO}`} hi={`${W_HI}`} />
        </Drawing>
      }
    />
  );
}

// ── 4. Trend line with a reference point: Naegele vs your cycle length (writes the cycle) ─────
export function DueCycleCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("cycle");
  const { snap, setCycle } = useDueLive();
  const f = useDateFmt();
  const isLmp = snap.method === "lmp";
  const shared = useSharedStepper(clamp(snap.cycle, 20, 45), setCycle, { min: 20, max: 45, step: 1 });
  const local = useStepper(28, { min: 20, max: 45, step: 1 });
  const s = isLmp ? shared : local;
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 350;
  const d = useDrawing(HMIN, s, (x, _y, W) => 20 + ((x - X0) / (W - 2 * X0)) * 25);
  const { W, H } = d;
  const c = s.value;
  const lmp = isLmp ? snap.anchor : snap.lmp;
  const adj = lmp + 252 + c;
  const PL = 50;
  const PR = 18;
  const top = 34;
  const trackY = H - 52;
  const base = trackY - 52;
  const xc = (v: number) => PL + ((v - 20) / 25) * (W - PL - PR);
  const ys = (v: number) => base - ((v + 8) / 25) * (base - top);
  const dd = tc("abbr.d");
  const A = tc("abbr.lmp");
  const valueText = `${c} ${dd} → ${f.short(adj)}`;
  const rows: KitRow[] = [
    { key: "lmp", label: isLmp ? A : t("rowLmpEq"), value: f.long(lmp) },
    { key: "classic", label: `${A} + 280 ${dd}`, value: f.long(lmp + TERM_DAYS) },
    { key: "mnemonic", label: t("rowMnemonic"), value: f.long(naegeleMnemonic(lmp)) },
    { key: "ov", label: t("rowOvulation", { c: String(c) }), value: `${c - 14}` },
    { key: "conc", label: `${A} + ${c - 14} ${dd}`, value: f.long(lmp + c - 14) },
    { key: "adj", label: `${A} + ${c - 14} + 266 ${dd}`, value: f.long(adj), isKey: true },
    { key: "shift", label: `${c} − 28`, value: `${signed(c - 28)} ${dd}` },
  ];
  const px = xc(c);
  const py = ys(c - 28);
  const tag = `${signed(c - 28)} ${dd} → ${f.short(adj)}`;
  const tagRight = px < W * 0.55;
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={4}
      side={side}
      k="cycle"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t(isLmp ? "caption" : "captionOther", { c: ltr(`${c} ${dd}`), shift: ltr(`${signed(c - 28)} ${dd}`), date: ltr(f.long(adj)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((c - 20) / 25) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c4">
          <T x={PL - 8} y={18} text={t("axisY")} anchor="start" size={10.5} bold />
          {/* Typical cycle band 24–38 days */}
          <rect x={xc(24)} y={top} width={xc(38) - xc(24)} height={base - top} fill="#22c55e" opacity={0.1} />
          <T x={(xc(24) + xc(38)) / 2} y={top + 14} text={`24–38 ${dd} · ${t("typical")}`} size={10} style={{ fill: "#16a34a" }} bold />
          {/* Grid + y ticks */}
          {[-5, 0, 5, 10, 15].map((v) => (
            <g key={v}>
              <line x1={PL} y1={ys(v)} x2={W - PR} y2={ys(v)} style={{ stroke: v === 0 ? "var(--ph-ink-muted)" : "var(--ph-grid)" }} strokeDasharray={v === 0 ? "5 4" : undefined} />
              <T x={PL - 6} y={ys(v) + 4} text={signed(v)} anchor="end" size={10} />
            </g>
          ))}
          <T x={W - PR} y={ys(0) - 6} text={`28 ${dd} = ${t("classic")}`} anchor="end" size={10} bold style={INK} />
          {/* Shift line: one day later per day of cycle */}
          <line x1={xc(20)} y1={ys(-8)} x2={xc(45)} y2={ys(17)} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} />
          {/* Reference point */}
          <line x1={px} y1={py} x2={px} y2={base} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="3 3" />
          <circle cx={px} cy={py} r={hover === "adj" || hover === "shift" ? 9 : 7} style={{ fill: "var(--ph-accent-strong)", stroke: "var(--ph-surface)" }} strokeWidth={2} />
          <T x={tagRight ? px + 12 : px - 12} y={py - 10} text={tag} anchor={tagRight ? "start" : "end"} size={12} bold style={INK} />
          {[20, 25, 30, 35, 40, 45].map((v) => (
            <T key={v} x={xc(v)} y={base + 16} text={String(v)} size={10} bold={v === c} />
          ))}
          <SvgTrack W={W} y={trackY} frac={(c - 20) / 25} lo={`20 ${dd}`} hi={`45 ${dd}`} />
        </Drawing>
      }
    />
  );
}

// ── 5. Flow arrows with embedded numbers: every dating method lands on one due date ──────────
export function DueMethodsCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("methods");
  const tModes = useTranslations("tools.due-date-calculator.modes");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const s = useStepper(snap.method === "ivf3day" ? 3 : 5, { min: 2, max: 6, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => 2 + ((x - X0) / (W - 2 * X0)) * 4);
  const { W, H } = d;
  const N = s.value;
  const cyc = snap.method === "lmp" ? snap.cycle : 28;
  const dd = tc("abbr.d");
  const flows = [
    { key: "lmp", name: tModes("labels.lmp"), days: 252 + cyc, on: snap.method === "lmp" },
    { key: "conception", name: tModes("labels.conception"), days: 266, on: snap.method === "conception" },
    { key: "ivf", name: t("ivfDay", { n: String(N) }), days: 266 - N, on: (snap.method === "ivf3day" && N === 3) || (snap.method === "ivf5day" && N === 5) },
  ];
  const trackY = H - 52;
  const top = 30;
  const bottom = trackY - 40;
  const laneH = (bottom - top) / flows.length;
  const bw = Math.min(170, (W - 2 * X0) * 0.4);
  const dw = Math.min(120, (W - 2 * X0) * 0.27);
  const dx = W - X0 - dw;
  const bh = Math.min(48, laneH - 12);
  const valueText = t("dayN", { n: String(N) });
  const rows: KitRow[] = [
    ...flows.map((fl) => ({ key: fl.key, label: `${fl.name}: ${f.short(snap.due - fl.days)}`, value: `+${fl.days} ${dd}`, isKey: fl.on })),
    { key: "due", label: tr("dueDate"), value: f.long(snap.due), isKey: true },
    { key: "embryo", label: t("rowEmbryo"), value: `266 − ${N} = ${266 - N} ${dd}` },
  ];
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={5}
      side={side}
      k="methods"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { due: ltr(f.long(snap.due)), n: ltr(String(N)), date: ltr(f.long(snap.due - 266 + N)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((N - 2) / 4) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c5">
          {/* Due date box */}
          <T x={dx + dw / 2} y={top - 10} text={tr("dueDate")} size={10.5} bold />
          <rect x={dx} y={top} width={dw} height={bottom - top} rx={10} fill="#16a34a" style={lit(hover === "due")} />
          <T x={dx + dw / 2} y={(top + bottom) / 2 - 4} text={f.short(snap.due)} size={13} bold style={{ fill: "#fff" }} />
          <T x={dx + dw / 2} y={(top + bottom) / 2 + 14} text="40+0" size={11} bold style={{ fill: "#fff" }} />
          {flows.map((fl, i) => {
            const cy = top + laneH * i + laneH / 2;
            const on = fl.on || hover === fl.key;
            const ax = X0 - 10 + bw;
            return (
              <g key={fl.key}>
                <rect x={X0 - 10} y={cy - bh / 2} width={bw} height={bh} rx={8} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={X0 - 10 + bw / 2} y={cy - 4} text={fl.name} size={Math.min(10.5, (bw - 8) / (fl.name.length * 0.56))} style={MUTED} bold />
                <T x={X0 - 10 + bw / 2} y={cy + 13} text={f.long(snap.due - fl.days)} size={12} bold style={INK} />
                <line x1={ax + 4} y1={cy} x2={dx - 10} y2={cy} style={{ stroke: on ? "var(--ph-accent-strong)" : "var(--ph-ink-muted)" }} strokeWidth={on ? 3 : 2} />
                <path d={`M ${dx - 12} ${cy - 6} L ${dx - 2} ${cy} L ${dx - 12} ${cy + 6} Z`} style={{ fill: on ? "var(--ph-accent-strong)" : "var(--ph-ink-muted)" }} />
                <rect x={(ax + dx) / 2 - 30} y={cy - 11} width={60} height={22} rx={11} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} />
                <T x={(ax + dx) / 2 - 3} y={cy + 4} text={`+${fl.days} ${dd}`} size={11} bold style={INK} />
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={(N - 2) / 4} stops={[2, 3, 4, 5, 6].map((m, i) => ({ frac: i / 4, text: t("dayShort", { n: String(m) }), on: m === N }))} />
        </Drawing>
      }
    />
  );
}

// ── 6. Multi-ring donut: the countdown on any date you pick ──────────────────────────────────
export function DueCountdownCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("countdown");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const s = useStepper(0, { min: -84, max: 84, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 400;
  const d = useDrawing(HMIN, s, (x, _y, W) => -84 + ((x - X0) / (W - 2 * X0)) * 168);
  const { W, H } = d;
  const off = s.value;
  const asOf = snap.today + off;
  const g = clamp(asOf - snap.lmp, 0, 300);
  const left = snap.due - asOf;
  const tri = trimesterOf(g);
  const T3 = TRIMESTERS[tri - 1];
  const triInto = clamp(g - T3.from, 0, T3.to - T3.from);
  const trackY = H - 52;
  const legendY = trackY - 82;
  const R = Math.max(60, Math.min(W / 2 - 40, (legendY - 30) / 2));
  const cx = W / 2;
  const cy = 18 + R;
  const ring = (r: number, frac: number, color: string, width: number, on: boolean) => {
    const fr = clamp(frac, 0, 0.9999);
    const a = fr * 2 * Math.PI;
    const x1 = px2(cx + r * Math.sin(a));
    const y1 = px2(cy - r * Math.cos(a));
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--ph-grid)" }} strokeWidth={width} />
        {fr > 0 && <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${fr > 0.5 ? 1 : 0} 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={on ? width + 3 : width} strokeLinecap="round" />}
      </g>
    );
  };
  const dd = tc("abbr.d");
  const valueText = `${signed(off)} ${dd} · ${f.short(asOf)}`;
  const rows: KitRow[] = [
    { key: "asof", label: `${tc("abbr.today")} ${signed(off)} ${dd}`, value: f.long(asOf), isKey: true },
    { key: "ga", label: tr("gestationalAge"), value: wd(g) },
    { key: "pct", label: `${g} ÷ 280`, value: `${Math.min(100, (g / TERM_DAYS) * 100).toFixed(1)}%` },
    { key: "left", label: tr("daysUntilDue"), value: `${left}` },
    { key: "wleft", label: t("rowWeeksLeft"), value: left >= 0 ? wd(left) : `−${wd(-left)}` },
    { key: "tri", label: t("rowTrimester", { n: tr(`trimesterValue.${tri}`) }), value: `${triInto} / ${T3.to - T3.from} ${dd}` },
    { key: "months", label: t("rowMonths"), value: (left / 30.44).toFixed(1) },
  ];
  const sw = Math.max(9, R * 0.13);
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={6}
      side={side}
      k="countdown"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { date: ltr(f.long(asOf)), ga: ltr(wd(g)), left: ltr(`${left} ${dd}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((off + 84) / 168) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c6">
          {ring(R, g / TERM_DAYS, "#2563eb", sw, hover === "pct")}
          {ring(R - sw * 1.6, triInto / (T3.to - T3.from), T3.color, sw, hover === "tri")}
          {/* Inner ring: the 7 days of the current week */}
          {Array.from({ length: 7 }, (_, k) => {
            const r = R - sw * 3.2;
            const a0 = (k / 7) * 2 * Math.PI + 0.06;
            const a1 = ((k + 1) / 7) * 2 * Math.PI - 0.06;
            const p0 = [px2(cx + r * Math.sin(a0)), px2(cy - r * Math.cos(a0))];
            const p1 = [px2(cx + r * Math.sin(a1)), px2(cy - r * Math.cos(a1))];
            return <path key={k} d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`} fill="none" stroke={k <= g % 7 ? "#14b8a6" : "var(--ph-grid)"} strokeWidth={sw} style={k <= g % 7 ? undefined : { stroke: "var(--ph-grid)" }} />;
          })}
          <T x={cx} y={cy + 2} text={left >= 0 ? String(left) : `−${-left}`} size={Math.min(30, R * 0.36)} bold style={INK} />
          <T x={cx} y={cy + Math.min(30, R * 0.36) * 0.75} text={`${dd} · ${wd(g)}`} size={11} bold />
          {/* Legend */}
          {[
            { c: "#2563eb", text: `${t("ring280")} · ${Math.min(100, (g / TERM_DAYS) * 100).toFixed(0)}%` },
            { c: T3.color, text: `${t("ringTrimester", { n: tr(`trimesterValue.${tri}`) })} · ${triInto}/${T3.to - T3.from} ${dd}` },
            { c: "#14b8a6", text: `${t("ringWeek")} · ${(g % 7) + 1}/7` },
          ].map((l, i) => (
            <g key={i}>
              <rect x={X0} y={legendY + 8 + i * 18 - 9} width={10} height={10} rx={2} fill={l.c} />
              <T x={X0 + 15} y={legendY + 8 + i * 18} text={l.text} anchor="start" size={10.5} bold style={INK} />
            </g>
          ))}
          <SvgTrack W={W} y={trackY} frac={(off + 84) / 168} lo={`−84 ${dd}`} hi={`+84 ${dd}`} stops={[{ frac: 0.5, text: tc("abbr.today"), on: off === 0 }]} />
        </Drawing>
      }
    />
  );
}

// ── 7. Calendar grid: month by month, coloured by trimester and term zone ────────────────────
function monthStartDay(base: number, k: number): number {
  const b = new Date(base * DAY_MS);
  return Math.round(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + k, 1) / DAY_MS);
}
export function DueCalendarCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("calendar");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const first = new Date(snap.lmp * DAY_MS);
  const last = new Date((snap.lmp + 294) * DAY_MS);
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
  const ch = Math.max(28, (trackY - 34 - gy0) / 6);
  const gStart = clamp(m0 - snap.lmp, 0, 294);
  const gEnd = clamp(m1 - 1 - snap.lmp, 0, 294);
  const tris = [...new Set([gStart, gEnd].map(trimesterOf))].map((n) => tr(`trimesterValue.${n}`)).join(" → ");
  const msIn = MILESTONES.filter((m) => snap.lmp + m.from >= m0 && snap.lmp + m.from < m1);
  const daysPreg = Math.max(0, Math.min(m1, snap.lmp + 294) - Math.max(m0, snap.lmp));
  const valueText = f.month(m0);
  const rows: KitRow[] = [
    { key: "month", label: t("rowMonth", { n: String(k + 1), total: String(M + 1) }), value: f.month(m0), isKey: true },
    { key: "ga", label: tr("gestationalAge"), value: `${wd(gStart)} → ${wd(gEnd)}` },
    { key: "tri", label: tr("trimester"), value: tris },
    { key: "ms", label: t("rowStarts"), value: msIn.length ? msIn.map((m) => `${tc(`milestones.${m.key}`)} ${f.short(snap.lmp + m.from)}`).join(" · ") : tc("none") },
    { key: "due", label: tr("dueDate"), value: snap.due >= m0 && snap.due < m1 ? f.long(snap.due) : tc("none") },
    { key: "days", label: t("rowDays"), value: `${daysPreg}` },
  ];
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={7}
      side={side}
      k="calendar"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { month: f.month(m0), ga: ltr(`${wd(gStart)} → ${wd(gEnd)}`) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (M ? k / M : 0) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c7">
          <T x={W / 2} y={20} text={f.month(m0)} size={14} bold style={INK} />
          {Array.from({ length: 7 }, (_, i) => (
            <T key={i} x={gx0 + cw * i + cw / 2} y={gy0 - 10} text={f.weekday(i)} size={10.5} bold />
          ))}
          {Array.from({ length: m1 - m0 }, (_, i) => {
            const day = m0 + i;
            const pos = lead + i;
            const x = gx0 + (pos % 7) * cw;
            const y = gy0 + Math.floor(pos / 7) * ch;
            const g = day - snap.lmp;
            const inPreg = g >= 0 && g < 294;
            const color = !inPreg ? null : g >= 259 ? (ZONES.find((z) => z.key === zoneOf(g)) ?? ZONES[2]).color : TRIMESTERS[trimesterOf(g) - 1].color;
            const isDue = day === snap.due;
            const isToday = day === snap.today;
            const ms = MILESTONES.find((m) => m.from === g);
            return (
              <g key={day}>
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={cw - 3}
                  height={ch - 3}
                  rx={5}
                  fill={color ?? "transparent"}
                  opacity={isDue ? 1 : color ? 0.32 : 1}
                  style={color ? undefined : { stroke: "var(--ph-grid)" }}
                />
                {isToday && <rect x={x + 1.5} y={y + 1.5} width={cw - 3} height={ch - 3} rx={5} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={2.5} />}
                {isDue && <rect x={x + 1.5} y={y + 1.5} width={cw - 3} height={ch - 3} rx={5} fill="#16a34a" />}
                <T x={x + cw / 2} y={y + ch / 2 + 4} text={String(i + 1)} size={11} bold={isDue || isToday} style={isDue ? { fill: "#fff" } : inPreg ? INK : MUTED} />
                {ms && <circle cx={x + cw - 7} cy={y + 7} r={3.5} fill={ms.color} />}
              </g>
            );
          })}
          <SvgTrack W={W} y={trackY} frac={M ? k / M : 0} lo={f.monthShort(monthStartDay(snap.lmp, 0))} hi={f.monthShort(monthStartDay(snap.lmp, M))} />
        </Drawing>
      }
    />
  );
}

// ── 8. Sensitivity trio: if the LMP is a few days off, and when an ultrasound would redate ────
export function DueErrorTrioCard({ side }: { side: Side }) {
  const { t, tc, tr } = useCardText("error");
  const { snap } = useDueLive();
  const f = useDateFmt();
  const thr = redateThreshold(snap.ga);
  const s = useStepper(clamp(thr, 1, 21), { min: 1, max: 21, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 20);
  const { W, H } = d;
  const e = s.value;
  const redate = e > thr;
  const dd = tc("abbr.d");
  const cols = [
    { key: "early", name: t("earlier"), due: snap.due - e, ga: snap.ga + e },
    { key: "cur", name: t("current"), due: snap.due, ga: snap.ga },
    { key: "late", name: t("later"), due: snap.due + e, ga: Math.max(0, snap.ga - e) },
  ];
  const trackY = H - 52;
  const axisY = trackY - 66;
  const R = 25;
  const xs = (v: number) => X0 + ((clamp(v, -R, R) + R) / (2 * R)) * (W - 2 * X0);
  const cw = (W - 2 * X0) / 3;
  const boxH = Math.max(70, axisY - 40 - 26);
  const valueText = `± ${e} ${dd}`;
  const rows: KitRow[] = [
    { key: "early", label: `${tr("dueDate")} − ${e} ${dd}`, value: f.long(snap.due - e) },
    { key: "cur", label: tr("dueDate"), value: f.long(snap.due), isKey: true },
    { key: "late", label: `${tr("dueDate")} + ${e} ${dd}`, value: f.long(snap.due + e) },
    { key: "ga", label: t("rowGaRange"), value: `${wd(Math.max(0, snap.ga - e))} – ${wd(snap.ga + e)}` },
    { key: "thr", label: t("rowThreshold", { ga: wd(snap.ga) }), value: `± ${thr} ${dd}` },
    { key: "verdict", label: t("rowVerdict"), value: redate ? t("redate") : t("keep") },
  ];
  return (
    <Card tool="due-date-calculator" idPrefix="due"
      n={8}
      side={side}
      k="error"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t(redate ? "captionRedate" : "captionKeep", { e: ltr(`${e} ${dd}`), t: ltr(`${thr} ${dd}`), ga: ltr(wd(snap.ga)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 1) / 20) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="due-c8">
          {/* Trio of outcomes */}
          {cols.map((c, i) => {
            const x = X0 + cw * i + 4;
            const on = c.key === "cur" || hover === c.key;
            const out = c.key !== "cur" && redate;
            return (
              <g key={c.key}>
                <rect x={x} y={14} width={cw - 8} height={boxH} rx={10} style={{ fill: c.key === "cur" ? "var(--ph-accent-soft)" : "var(--ph-surface)", ...lit(on) }} />
                <T x={x + (cw - 8) / 2} y={34} text={c.name} size={Math.min(10.5, (cw - 14) / (c.name.length * 0.56))} bold style={MUTED} />
                <T x={x + (cw - 8) / 2} y={14 + boxH / 2 + 6} text={f.short(c.due)} size={c.key === "cur" ? 15 : 13} bold style={out ? { fill: "#dc2626" } : INK} />
                <T x={x + (cw - 8) / 2} y={14 + boxH - 12} text={wd(c.ga)} size={11} bold />
              </g>
            );
          })}
          {/* Redating band ±thr around the current due date */}
          <rect x={xs(-thr)} y={axisY - 12} width={xs(thr) - xs(-thr)} height={24} rx={6} fill="#22c55e" opacity={0.18} style={lit(hover === "thr")} />
          <line x1={X0} y1={axisY} x2={W - X0} y2={axisY} style={LINE} strokeWidth={2} />
          {[-21, -14, -7, 0, 7, 14, 21].map((v) => (
            <g key={v}>
              <line x1={xs(v)} y1={axisY - 4} x2={xs(v)} y2={axisY + 4} style={LINE} />
              <T x={xs(v)} y={axisY + 26} text={signed(v)} size={10} bold={v === 0} />
            </g>
          ))}
          <T x={xs(thr)} y={axisY - 18} text={`±${thr}`} size={10} bold style={{ fill: "#16a34a" }} />
          {cols.map((c) => {
            const v = c.due - snap.due;
            const out = c.key !== "cur" && redate;
            return <circle key={c.key} cx={xs(v)} cy={axisY} r={c.key === "cur" ? 7 : 6} fill={c.key === "cur" ? "#2563eb" : out ? "#dc2626" : "#16a34a"} stroke="#fff" strokeWidth={1.5} />;
          })}
          <SvgTrack W={W} y={trackY} frac={(e - 1) / 20} lo={`±1 ${dd}`} hi={`±21 ${dd}`} />
        </Drawing>
      }
    />
  );
}
