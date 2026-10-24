"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { KM_PER_MILE } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import { useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, f1, f2 } from "@/components/tool-ui/indicator-kit/format";
import { Card, SvgTrack } from "../macro-calculator/MacroCards";
import { paceOf, usePaceLive, type PaceSnapshot } from "./PaceLiveContext";
import { PACE_ZONES, RACES, RIEGEL, clock, pacePer, parseRecord, riegel, sClock, toUnit, zoneOf } from "./pace";

/**
 * The eight pace indicator cards (§31 library). All read the active mode's live effort (distance,
 * time, pace) through PaceLiveContext and keep a what-if value of their own on top of it (re-seeded
 * when the effort changes). Numbers use Western digits, like the BMI cards. Every handle rides its
 * own track at the bottom of the drawing; track labels sit 38px below it, so the 44px handle never
 * covers a value label.
 */
type Side = "visual-left" | "table-left";
const X0 = 30;
const ACCENT = "#2563eb";
const AMBER = "#f59e0b";

function useCardText(key: string) {
  return {
    t: useTranslations(`tools.pace-calculator.visuals.${key}`),
    tv: useTranslations("tools.pace-calculator.visuals.common"),
    tRace: useTranslations("tools.pace-calculator.visuals.common.races"),
    tZone: useTranslations("tools.pace-calculator.gauge.zones"),
    tc: useTranslations("toolPage.indicatorKit"),
  };
}

/** Effort key: cards re-seed their what-if value when the calculator's effort changes. */
const effortKey = (s: PaceSnapshot) => `${s.mode}-${s.unit}-${Math.round(s.km * 1000)}-${Math.round(s.sec)}-${Math.round((s.targetKm ?? 0) * 1000)}`;

function useBase() {
  const snap = usePaceLive();
  const pk = paceOf(snap);
  const u = snap.unit;
  return {
    snap,
    pk,
    u,
    /** Pace text in the chosen unit, e.g. "5:00 /km". */
    pT: (secPerKm: number) => `${clock(pacePer(secPerKm, u))} /${u}`,
    /** Distance text in the chosen unit, e.g. "21.10 km". */
    dT: (km: number) => `${f2(toUnit(km, u))} ${u}`,
  };
}

// ── 1. Trend line: the Riegel pace curve, drag the target race along it (wow) ────────────────
const LOG_MAX = 50;
const kmAt = (frac: number) => Math.exp(clamp(frac, 0, 1) * Math.log(LOG_MAX));
const fracOf = (km: number) => Math.log(clamp(km, 1, LOG_MAX)) / Math.log(LOG_MAX);
export function PaceRiegelCard({ side }: { side: Side }) {
  const { snap } = useBase();
  return <Riegel key={effortKey(snap)} side={side} />;
}
function Riegel({ side }: { side: Side }) {
  const { t, tv } = useCardText("riegel");
  const { snap, pk, u, pT, dT } = useBase();
  const seed = snap.targetKm ?? (snap.km < 20 ? 42.195 : 10);
  const s = useStepper(clamp(seed, 1, LOG_MAX), { min: 1, max: LOG_MAX, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 380;
  const d = useDrawing(HMIN, s, (x, _y, W) => kmAt((x - X0) / (W - 2 * X0)));
  const { W, H } = d;
  const PL = 50;
  const PR = 16;
  const top = 40;
  const base = H - 128;
  const trackY = H - 52;
  const xs = (km: number) => PL + fracOf(km) * (W - PL - PR);
  const paceAt = (km: number) => riegel(snap.km, snap.sec, km) / km;
  const lo = Math.min(paceAt(1), pk) * 0.985;
  const hi = Math.max(paceAt(LOG_MAX), pk) * 1.015;
  const ys = (p: number) => base - ((p - lo) / (hi - lo)) * (base - top);
  const curve = Array.from({ length: 61 }, (_, i) => {
    const km = kmAt(i / 60);
    return `${i === 0 ? "M" : "L"} ${px2(xs(km))} ${px2(ys(paceAt(km)))}`;
  }).join(" ");
  const D2 = s.value;
  const T2 = riegel(snap.km, snap.sec, D2);
  const even = D2 * pk;
  const tx = xs(D2);
  const ty = ys(T2 / D2);
  const yx = xs(snap.km);
  const yy = ys(pk);
  const ticks = [lo, (lo + hi) / 2, hi];
  const valueText = dT(D2);
  const label = `${clock(T2)} · ${pT(T2 / D2)}`;
  const anchor = tx > W * 0.7 ? "end" : tx < W * 0.3 ? "start" : "middle";
  const rows: KitRow[] = [
    { key: "known", label: t("rowKnown"), value: `${dT(snap.km)} · ${clock(snap.sec)}` },
    { key: "ratio", label: `D₂ ÷ D₁ = ${f2(toUnit(D2, u))} ÷ ${f2(toUnit(snap.km, u))}`, value: f2(D2 / snap.km) },
    { key: "factor", label: `(D₂ ÷ D₁)^${RIEGEL}`, value: f2(Math.pow(D2 / snap.km, RIEGEL)) },
    { key: "t2", label: `T₂ = ${clock(snap.sec)} × ${f2(Math.pow(D2 / snap.km, RIEGEL))}`, value: clock(T2), isKey: true },
    { key: "pace", label: t("rowPace"), value: pT(T2 / D2) },
    { key: "even", label: t("rowEven"), value: clock(even) },
    { key: "cost", label: t("rowFatigue"), value: sClock(T2 - even) },
  ];
  return (
    <Card phoneRole="visual" tool="pace-calculator" idPrefix="pace"
      n={1}
      side={side}
      k="riegel"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { d: ltr(dT(D2)), t: ltr(clock(T2)), p: ltr(pT(T2 / D2)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + fracOf(D2) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c1">
          <T x={6} y={16} text={`${tv("paceAxis")} (/${u})`} anchor="start" size={10.5} bold />
          {ticks.map((p, i) => (
            <g key={i}>
              <line x1={PL} y1={ys(p)} x2={W - PR} y2={ys(p)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={ys(p) + 4} text={clock(pacePer(p, u))} anchor="end" size={10} />
            </g>
          ))}
          {RACES.filter((r) => r.key !== "mile" && r.key !== "15k" && r.key !== "30k").map((r) => (
            <g key={r.key}>
              <line x1={xs(r.km)} y1={top} x2={xs(r.km)} y2={base} style={{ stroke: "var(--ph-grid)" }} strokeDasharray="3 4" />
              <T x={xs(r.km)} y={base + 16} text={`${f1(r.km)}`} size={10} />
            </g>
          ))}
          <T x={W - PR} y={base + 32} text={`${tv("distanceAxis")} (km, log)`} anchor="end" size={10} />
          <line x1={PL} y1={yy} x2={W - PR} y2={yy} stroke={ACCENT} strokeWidth={hover === "even" ? 2.5 : 1.5} strokeDasharray="6 4" opacity={0.8} />
          <path d={curve} fill="none" stroke={AMBER} strokeWidth={hover === "pace" || hover === "t2" ? 4 : 3} />
          <line x1={tx} y1={ty} x2={tx} y2={base} style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.2} strokeDasharray="2 3" />
          <circle cx={yx} cy={yy} r={hover === "known" ? 8 : 6} fill={ACCENT} stroke="#fff" strokeWidth={2} />
          <T x={yx > W / 2 ? yx - 12 : yx + 12} y={Math.min(base - 6, yy + 18)} text={`${t("you")} ${dT(snap.km)} · ${clock(snap.sec)}`} size={10.5} bold style={{ fill: ACCENT }} anchor={yx > W / 2 ? "end" : "start"} />
          <circle cx={tx} cy={ty} r={9} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <circle cx={tx} cy={ty} r={3} fill={AMBER} />
          <T x={tx} y={Math.max(top - 8, ty - 16)} text={label} anchor={anchor} size={12} bold style={INK} />
          <SvgTrack stopAnchor="frac"
            W={W}
            y={trackY}
            frac={fracOf(D2)}
            stops={[5, 10, 21.0975, 42.195].map((km) => ({ frac: fracOf(km), text: `${f1(km)}K`, on: Math.abs(D2 - km) < 0.15 }))}
          />
        </Drawing>
      }
    />
  );
}

// ── 2. Gradient gauge: speed on the tool's effort zones, with the marathon world records ─────
const SMIN = 4;
const SMAX = 24;
export function PaceSpeedGaugeCard({ side }: { side: Side }) {
  const { snap } = useBase();
  return <SpeedGauge key={effortKey(snap)} side={side} />;
}
function SpeedGauge({ side }: { side: Side }) {
  const { t, tZone } = useCardText("gauge");
  const tRec = useTranslations("tools.pace-calculator.education.worldRecords");
  const { snap, pk, pT, dT } = useBase();
  const yours = 3600 / pk;
  const s = useStepper(clamp(Math.round(yours * 10) / 10, SMIN, SMAX), { min: SMIN, max: SMAX, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 340;
  const geo = (W: number, H: number) => {
    const cy = H - 132;
    const R = Math.max(80, Math.min(W / 2 - 56, cy - 42));
    return { cx: W / 2, cy, R };
  };
  const d = useDrawing(HMIN, s, (x, _y, W) => SMIN + ((x - X0) / (W - 2 * X0)) * (SMAX - SMIN));
  const { W, H } = d;
  const { cx, cy, R } = geo(W, H);
  const v = s.value;
  const vPk = 3600 / v;
  const zone = zoneOf(vPk);
  const records = (tRec.raw("rows") as { menTime: string; womenTime: string }[])[3];
  const wrMen = records ? (42.195 / parseRecord(records.menTime)) * 3600 : 0;
  const wrWomen = records ? (42.195 / parseRecord(records.womenTime)) * 3600 : 0;
  const ang = (sp: number) => Math.PI * (1 - (clamp(sp, SMIN, SMAX) - SMIN) / (SMAX - SMIN));
  const pt = (sp: number, r: number): [number, number] => [px2(cx + r * Math.cos(ang(sp))), px2(cy - r * Math.sin(ang(sp)))];
  const arc = (a: number, b: number, r: number) => {
    const [x0, y0] = pt(a, r);
    const [x1, y1] = pt(b, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const zoneSpeeds = PACE_ZONES.map((z) => ({ ...z, a: z.key === "recovery" ? SMIN : 3600 / z.to, b: z.key === "elite" ? SMAX : 3600 / z.from }));
  const [nx, ny] = pt(v, R - 20);
  const [yx1, yy1] = pt(yours, R - 14);
  const [yx2, yy2] = pt(yours, R + 14);
  const trackY = H - 52;
  const valueText = `${f1(v)} km/h`;
  const rows: KitRow[] = [
    { key: "speed", label: t("rowSpeed"), value: `${f1(v)} km/h · ${f1(v / KM_PER_MILE)} mph`, isKey: true },
    { key: "pace", label: `3600 ÷ ${f1(v)}`, value: `${clock(vPk)} /km · ${clock(vPk * KM_PER_MILE)} /mi` },
    { key: "zone", label: t("rowZone"), value: tZone(zone.key) },
    { key: "finish", label: `${t("rowFinish")} (${dT(snap.km)})`, value: clock(snap.km * vPk) },
    { key: "vs", label: t("rowVsYours"), value: sClock(snap.km * vPk - snap.sec) },
    { key: "wr", label: t("rowWr"), value: wrMen ? `${Math.round((v / wrMen) * 100)}%` : "–" },
  ];
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={2}
      side={side}
      k="gauge"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { v: ltr(valueText), p: ltr(pT(vPk)), zone: tZone(zone.key) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((v - SMIN) / (SMAX - SMIN)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c2">
          {zoneSpeeds.map((z) => {
            const on = z.key === zone.key || hover === "zone";
            return <path key={z.key} d={arc(z.a, z.b, R)} fill="none" stroke={z.color} strokeWidth={z.key === zone.key ? 26 : 20} opacity={on ? 1 : 0.5} />;
          })}
          {[4, 8, 12, 16, 20, 24].map((sp) => {
            const [x, y] = pt(sp, R + 25);
            return <T key={sp} x={x} y={y + 4} text={String(sp)} size={10.5} />;
          })}
          {/* World-record marathon speeds (from the records table on this page) */}
          {[wrMen, wrWomen]
            .filter((sp) => sp > 0)
            .map((sp) => {
              const [x1, y1] = pt(sp, R - 13);
              const [x2, y2] = pt(sp, R + 13);
              return <line key={sp} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} opacity={hover === "wr" || !hover ? 1 : 0.5} />;
            })}
          {wrMen > 0 && (() => {
            const [lx, ly] = pt((wrMen + wrWomen) / 2, R - 36);
            return <T x={lx} y={ly + 4} text={`WR ♂ ${f1(wrMen)} · ♀ ${f1(wrWomen)}`} anchor="end" size={9.5} bold style={INK} />;
          })()}
          {/* Your actual speed: a blue tick across the arc */}
          <line x1={yx1} y1={yy1} x2={yx2} y2={yy2} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "speed" ? 4.5 : 3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy + 26} text={`${f1(v)} km/h · ${pT(vPk)}`} size={15} bold style={INK} />
          <T x={cx} y={cy + 44} text={`${tZone(zone.key)} · ${t("yours")} ${f1(yours)}`} size={11.5} bold style={{ fill: zone.color }} />
          <SvgTrack stopAnchor="frac" W={W} y={trackY} frac={(v - SMIN) / (SMAX - SMIN)} lo={`${SMIN} km/h`} hi={`${SMAX} km/h`} />
        </Drawing>
      }
    />
  );
}

// ── 3. Labeled bars: a pacing plan, drag from negative to positive split ──────────────────
export function PaceSplitsCard({ side }: { side: Side }) {
  const { snap } = useBase();
  return <Splits key={effortKey(snap)} side={side} />;
}
function Splits({ side }: { side: Side }) {
  const { t } = useCardText("splits");
  const { snap, pk, u, pT, dT } = useBase();
  const s = useStepper(0, { min: -10, max: 10, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 340;
  const d = useDrawing(HMIN, s, (x, _y, W) => -10 + ((x - X0) / (W - 2 * X0)) * 20);
  const { W, H } = d;
  const dU = toUnit(snap.km, u);
  const N = clamp(Math.round(dU), 2, 10);
  const segKm = snap.km / N;
  const a = s.value / 200;
  const paces = Array.from({ length: N }, (_, i) => pk * (1 + a * (N === 1 ? 0 : (2 * i) / (N - 1) - 1)));
  const times = paces.map((p) => p * segKm);
  const half = Math.floor(N / 2);
  const firstHalf = times.slice(0, half).reduce((x, y) => x + y, 0);
  const secondHalf = times.slice(half).reduce((x, y) => x + y, 0);
  const PL = 44;
  const top = 44;
  const base = H - 112;
  const trackY = H - 52;
  const lo = Math.min(...times) * 0.9;
  const hiT = Math.max(...times) * 1.04;
  const yv = (v: number) => base - ((v - lo) / (hiT - lo)) * (base - top);
  const colW = (W - PL - 12) / N;
  const kind = s.value < 0 ? "negative" : s.value > 0 ? "positive" : "even";
  const valueText = `${s.value > 0 ? "+" : s.value < 0 ? "−" : ""}${Math.abs(s.value)}%`;
  const rows: KitRow[] = [
    { key: "seg", label: `${dT(snap.km)} ÷ ${N}`, value: dT(segKm) },
    { key: "first", label: t("rowFirst"), value: pT(paces[0]) },
    { key: "last", label: t("rowLast"), value: pT(paces[N - 1]) },
    { key: "h1", label: t("rowHalf1"), value: clock(firstHalf) },
    { key: "h2", label: t("rowHalf2"), value: clock(secondHalf) },
    { key: "total", label: t("rowTotal"), value: clock(times.reduce((x, y) => x + y, 0)), isKey: true },
    { key: "kind", label: t("rowKind"), value: t(kind) },
  ];
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={3}
      side={side}
      k="splits"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { kind: t(kind), first: ltr(pT(paces[0])), last: ltr(pT(paces[N - 1])), total: ltr(clock(snap.sec)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((s.value + 10) / 20) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c3">
          <T x={6} y={16} text={`${t("axis")} · ${dT(segKm)}`} anchor="start" size={10.5} bold />
          {[lo, (lo + hiT) / 2, hiT].map((v, i) => (
            <g key={i}>
              <line x1={PL} y1={yv(v)} x2={W - 12} y2={yv(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={PL - 6} y={yv(v) + 4} text={clock(v)} anchor="end" size={9.5} />
            </g>
          ))}
          {times.map((tm, i) => {
            const x = PL + colW * i + colW * 0.14;
            const w = colW * 0.72;
            const inFirst = i < half;
            const on = (hover === "h1" && inFirst) || (hover === "h2" && !inFirst) || (hover === "first" && i === 0) || (hover === "last" && i === N - 1);
            return (
              <g key={i}>
                <rect x={x} y={yv(tm)} width={w} height={base - yv(tm)} rx={4} style={{ fill: inFirst ? ACCENT : AMBER, ...lit(on) }} opacity={0.9} />
                <T x={x + w / 2} y={yv(tm) - 6} text={clock(pacePer(paces[i], u))} size={colW > 44 ? 10.5 : 8.5} bold style={INK} />
                <T x={x + w / 2} y={base + 15} text={String(i + 1)} size={10} />
              </g>
            );
          })}
          <line x1={PL} y1={yv(snap.sec / N)} x2={W - 12} y2={yv(snap.sec / N)} style={{ stroke: "var(--ph-ink)" }} strokeDasharray="5 4" strokeWidth={1.2} />
          <SvgTrack stopAnchor="frac" W={W} y={trackY} frac={(s.value + 10) / 20} lo="−10%" hi="+10%" stops={[{ frac: 0.5, text: t("even"), on: s.value === 0 }]} />
        </Drawing>
      }
    />
  );
}

// ── 4. Side-by-side equivalence: one distance on a km ruler and a mile ruler ───────────────
const niceStep = (span: number, maxTicks: number) => [0.5, 1, 2, 5, 10, 20].find((st) => span / st <= maxTicks) ?? 20;
export function PaceRulersCard({ side }: { side: Side }) {
  const { snap } = useBase();
  return <Rulers key={effortKey(snap)} side={side} />;
}
function Rulers({ side }: { side: Side }) {
  const { t } = useCardText("rulers");
  const { snap, pk } = useBase();
  const s = useStepper(clamp(Math.round(snap.km * 10) / 10, 1, 42.2), { min: 1, max: 42.2, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 41.2);
  const { W, H } = d;
  const D = s.value;
  const Dmi = D / KM_PER_MILE;
  const xd = (km: number) => X0 + (km / D) * (W - 2 * X0);
  const kmY = 92;
  const miY = 196;
  const trackY = H - 52;
  const maxTicks = clamp(Math.floor((W - 2 * X0) / 60), 3, 7);
  const stK = niceStep(D, maxTicks);
  const stM = niceStep(Dmi, maxTicks);
  const kmTicks: number[] = [];
  for (let k = stK; k < D - stK * 0.35; k += stK) kmTicks.push(Number(k.toFixed(2)));
  const miTicks: number[] = [];
  for (let m = stM; m < Dmi - stM * 0.35; m += stM) miTicks.push(Number(m.toFixed(2)));
  const valueText = `${f1(D)} km`;
  const rows: KitRow[] = [
    { key: "span", label: `${f1(D)} km ÷ ${KM_PER_MILE}`, value: `${f2(Dmi)} mi`, isKey: true },
    { key: "pkm", label: t("rowPaceKm"), value: `${clock(pk)} /km` },
    { key: "pmi", label: `${clock(pk)} × ${KM_PER_MILE}`, value: `${clock(pk * KM_PER_MILE)} /mi` },
    { key: "tkm", label: `${t("rowAt")} ${kmTicks.length ? kmTicks[kmTicks.length - 1] : D} km`, value: clock((kmTicks.length ? kmTicks[kmTicks.length - 1] : D) * pk) },
    { key: "tmi", label: `${t("rowAt")} ${miTicks.length ? miTicks[miTicks.length - 1] : f2(Dmi)} mi`, value: clock((miTicks.length ? miTicks[miTicks.length - 1] : Dmi) * KM_PER_MILE * pk) },
    { key: "end", label: `${f1(D)} × ${clock(pk)}`, value: clock(D * pk) },
  ];
  const ruler = (y: number, ticks: number[], toKm: (v: number) => number, unit: string, color: string, on: boolean) => (
    <g>
      <line x1={X0} y1={y} x2={W - X0} y2={y} stroke={color} strokeWidth={on ? 6 : 4} strokeLinecap="round" />
      {[0, ...ticks.filter((v) => xd(toKm(v)) < W - X0 - 66)].map((v) => {
        const x = xd(toKm(v));
        return (
          <g key={v}>
            <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke={color} strokeWidth={2} />
            <T x={x} y={y - 14} text={clock(toKm(v) * pk)} size={9.5} bold style={INK} />
            <T x={x} y={y + 22} text={`${v}`} size={10} />
          </g>
        );
      })}
      <line x1={W - X0} y1={y - 10} x2={W - X0} y2={y + 10} stroke={color} strokeWidth={3} />
      <T x={W - X0} y={y + 22} text={`${unit === "km" ? f1(D) : f2(Dmi)} ${unit}`} anchor="end" size={10.5} bold style={{ fill: color }} />
    </g>
  );
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={4}
      side={side}
      k="rulers"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { km: ltr(`${f1(D)} km`), mi: ltr(`${f2(Dmi)} mi`), t: ltr(clock(D * pk)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((D - 1) / 41.2) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c4">
          <T x={X0} y={22} text={`${t("kmRuler")} · ${clock(pk)} /km`} anchor="start" size={11} bold style={{ fill: ACCENT }} />
          {ruler(kmY, kmTicks, (v) => v, "km", ACCENT, hover === "pkm" || hover === "tkm")}
          <T x={X0} y={miY - 48} text={`${t("miRuler")} · ${clock(pk * KM_PER_MILE)} /mi`} anchor="start" size={11} bold style={{ fill: AMBER }} />
          {ruler(miY, miTicks, (v) => v * KM_PER_MILE, "mi", AMBER, hover === "pmi" || hover === "tmi")}
          <line x1={W - X0} y1={kmY + 26} x2={W - X0} y2={miY - 30} style={{ stroke: "var(--ph-ink)" }} strokeDasharray="3 3" />
          <SvgTrack stopAnchor="frac" W={W} y={trackY} frac={(D - 1) / 41.2} lo="1 km" hi="42.2 km" />
        </Drawing>
      }
    />
  );
}

// ── 5. Sensitivity trio: finish time a few seconds per unit faster / slower ────────────────
export function PaceSensitivityCard({ side }: { side: Side }) {
  const { t } = useCardText("trio");
  const { snap, pk, u, pT, dT } = useBase();
  const s = useStepper(15, { min: 5, max: 60, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => 5 + ((x - X0) / (W - 2 * X0)) * 55);
  const { W, H } = d;
  const dx = s.value;
  const dU = toUnit(snap.km, u);
  const pu = pacePer(pk, u);
  const cols = [
    { key: "fast", pace: Math.max(1, pu - dx), color: "#22c55e" },
    { key: "now", pace: pu, color: ACCENT },
    { key: "slow", pace: pu + dx, color: "#ef4444" },
  ].map((c) => ({ ...c, time: Math.max(0, c.pace) * dU }));
  const top = 44;
  const base = H - 104;
  const trackY = H - 52;
  const vmax = Math.max(...cols.map((c) => c.time)) * 1.08;
  const yv = (v: number) => base - (v / vmax) * (base - top);
  const cw = (W - 2 * X0) / 3;
  const valueText = `± ${dx} s /${u}`;
  const delta = dx * dU;
  const rows: KitRow[] = [
    { key: "fast", label: `${clock(pu - dx)} × ${f2(dU)}`, value: clock(cols[0].time) },
    { key: "now", label: t("rowNow"), value: clock(cols[1].time), isKey: true },
    { key: "slow", label: `${clock(pu + dx)} × ${f2(dU)}`, value: clock(cols[2].time) },
    { key: "delta", label: `${dx} s × ${f2(dU)}`, value: `± ${clock(delta)}` },
    { key: "speed", label: t("rowSpeedSpan"), value: `${f1(3600 / (pu + dx))}–${f1(3600 / Math.max(1, pu - dx))} ${u === "km" ? "km/h" : "mph"}` },
  ];
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={5}
      side={side}
      k="trio"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { dx: ltr(valueText), d: ltr(dT(snap.km)), delta: ltr(clock(delta)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((dx - 5) / 55) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c5">
          <T x={X0} y={18} text={`${t("axis")} · ${dT(snap.km)}`} anchor="start" size={10.5} bold />
          {cols.map((c, ci) => {
            const x = X0 + cw * ci + cw * 0.18;
            const w = cw * 0.64;
            const on = hover === c.key;
            return (
              <g key={c.key}>
                <rect x={x} y={yv(c.time)} width={w} height={base - yv(c.time)} rx={6} style={{ fill: c.color, ...lit(on || (hover === "delta" && c.key !== "now")) }} opacity={c.key === "now" ? 1 : 0.85} />
                <T x={x + w / 2} y={yv(c.time) - 8} text={clock(c.time)} size={c.key === "now" ? 13 : 11.5} bold style={INK} />
                <T x={x + w / 2} y={base + 16} text={pT(u === "km" ? c.pace : c.pace / KM_PER_MILE)} size={10.5} bold={c.key === "now"} style={c.key === "now" ? INK : MUTED} />
              </g>
            );
          })}
          <SvgTrack stopAnchor="frac" W={W} y={trackY} frac={(dx - 5) / 55} lo={`5 s`} hi={`60 s`} />
        </Drawing>
      }
    />
  );
}

// ── 6. Ranked bars: race predictions with a what-if fatigue exponent ──────────────────────
export function PaceFatigueCard({ side }: { side: Side }) {
  const { t, tRace } = useCardText("fatigue");
  const { snap, pk } = useBase();
  const s = useStepper(RIEGEL, { min: 1, max: 1.15, step: 0.01 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 360;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 0.15);
  const { W, H } = d;
  const e = s.value;
  const bars = RACES.map((r) => ({ ...r, time: riegel(snap.km, snap.sec, r.km, e), std: riegel(snap.km, snap.sec, r.km), even: r.km * pk }));
  const LW = 96;
  const top = 30;
  const trackY = H - 52;
  const rowH = (trackY - 44 - top) / bars.length;
  const vmax = Math.max(...bars.map((b) => Math.max(b.time, b.std, b.even))) * 1.28;
  const xv = (v: number) => LW + (v / vmax) * (W - LW - 12);
  const mar = bars[bars.length - 1];
  const valueText = `e = ${f2(e)}`;
  const rows: KitRow[] = [
    { key: "e", label: t("rowExponent"), value: f2(e) },
    { key: "mar", label: `${clock(snap.sec)} × (42.195 ÷ ${f2(snap.km)})^${f2(e)}`, value: clock(mar.time), isKey: true },
    { key: "std", label: `${t("rowStandard")} (${RIEGEL})`, value: clock(mar.std) },
    { key: "diff", label: t("rowDiff"), value: sClock(mar.time - mar.std) },
    { key: "even", label: t("rowEven"), value: clock(mar.even) },
  ];
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={6}
      side={side}
      k="fatigue"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { e: ltr(f2(e)), t: ltr(clock(mar.time)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((e - 1) / 0.15) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c6">
          <line x1={LW} y1={top - 4} x2={LW} y2={trackY - 44} style={LINE} strokeWidth={1.5} />
          {bars.map((b, bi) => {
            const y = top + rowH * bi + rowH * 0.2;
            const bh = rowH * 0.6;
            const on = hover === "mar" && b.key === "marathon";
            return (
              <g key={b.key}>
                <T x={LW - 8} y={y + bh / 2 + 4} text={tRace(b.key)} anchor="end" size={10.5} bold={on} style={on ? INK : MUTED} />
                <rect x={LW} y={y} width={Math.max(2, xv(b.time) - LW)} height={bh} rx={4} style={{ fill: AMBER, ...lit(on) }} opacity={0.6 + 0.4 * (bi / bars.length)} />
                {/* Even pace (e = 1) and the standard 1.06 as thin marks inside the row */}
                <line x1={xv(b.even)} y1={y - 2} x2={xv(b.even)} y2={y + bh + 2} stroke={ACCENT} strokeWidth={hover === "even" ? 3.5 : 2.5} />
                <line x1={xv(b.std)} y1={y - 2} x2={xv(b.std)} y2={y + bh + 2} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "std" ? 3 : 1.6} strokeDasharray="3 2" />
                <T x={Math.max(xv(b.time), xv(b.std), xv(b.even)) + 6} y={y + bh / 2 + 4} text={clock(b.time)} anchor="start" size={10.5} bold style={INK} />
              </g>
            );
          })}
          <SvgTrack stopAnchor="frac"
            W={W}
            y={trackY}
            frac={(e - 1) / 0.15}
            stops={[
              { frac: 0, text: `1.00 ${t("evenShort")}`, on: e === 1 },
              { frac: 0.4, text: `${RIEGEL} Riegel`, on: Math.abs(e - RIEGEL) < 0.001 },
              { frac: 1, text: "1.15", on: e >= 1.15 },
            ]}
          />
        </Drawing>
      }
    />
  );
}

// ── 7. Timeline with stations: race day from the start gun to the finish ─────────────────
const tod = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
export function PaceTimelineCard({ side }: { side: Side }) {
  const { t } = useCardText("timeline");
  const { snap, dT } = useBase();
  const s = useStepper(480, { min: 300, max: 720, step: 15 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 320;
  const d = useDrawing(HMIN, s, (x, _y, W) => 300 + ((x - X0) / (W - 2 * X0)) * 420);
  const { W, H } = d;
  const start = s.value;
  const stations = [0, 25, 50, 75, 100].map((pct) => ({ pct, el: (snap.sec * pct) / 100, km: (snap.km * pct) / 100 }));
  const lineY = 128;
  const trackY = H - 52;
  const xs = (pct: number) => X0 + 14 + (pct / 100) * (W - 2 * X0 - 28);
  const valueText = tod(start);
  const rows: KitRow[] = [
    { key: "start", label: t("rowStart"), value: tod(start) },
    ...stations.slice(1).map((st) => ({ key: `s${st.pct}`, label: `${st.pct}% · ${dT(st.km)} (+${clock(st.el)})`, value: tod(start + st.el / 60), isKey: st.pct === 100 })),
    { key: "dur", label: t("rowDuration"), value: clock(snap.sec) },
  ];
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={7}
      side={side}
      k="timeline"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { start: ltr(tod(start)), finish: ltr(tod(start + snap.sec / 60)) })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((start - 300) / 420) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c7">
          <line x1={xs(0)} y1={lineY} x2={xs(100)} y2={lineY} style={{ stroke: "var(--ph-line)" }} strokeWidth={6} strokeLinecap="round" />
          <line x1={xs(0)} y1={lineY} x2={xs(100)} y2={lineY} stroke={ACCENT} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
          {stations.map((st, i) => {
            const x = xs(st.pct);
            const up = i % 2 === 0;
            const on = hover === (i === 0 ? "start" : `s${st.pct}`);
            const anchor = i === 0 ? "start" : i === stations.length - 1 ? "end" : "middle";
            const ax = i === 0 ? x - 14 : i === stations.length - 1 ? x + 14 : x;
            return (
              <g key={st.pct}>
                <circle cx={x} cy={lineY} r={on || i === 4 ? 11 : 9} fill={i === 0 ? "#22c55e" : i === 4 ? "#ef4444" : ACCENT} stroke="#fff" strokeWidth={2.5} />
                <line x1={x} y1={up ? lineY - 14 : lineY + 14} x2={x} y2={up ? lineY - 34 : lineY + 34} style={{ stroke: "var(--ph-line)" }} />
                <T x={ax} y={up ? lineY - 58 : lineY + 52} text={tod(start + st.el / 60)} anchor={anchor} size={14} bold style={INK} />
                <T x={ax} y={up ? lineY - 41 : lineY + 69} text={i === 0 ? t("gun") : W < 420 ? dT(st.km) : `${st.pct}% · ${dT(st.km)}`} anchor={anchor} size={10} />
              </g>
            );
          })}
          <SvgTrack stopAnchor="frac" W={W} y={trackY} frac={(start - 300) / 420} lo="05:00" hi="12:00" />
        </Drawing>
      }
    />
  );
}

// ── 8. Balance: your time against a goal time ──────────────────────────────────────────────
export function PaceGoalCard({ side }: { side: Side }) {
  const { snap } = useBase();
  return <Goal key={effortKey(snap)} side={side} />;
}
function Goal({ side }: { side: Side }) {
  const { t } = useCardText("goal");
  const { snap, pk, u, pT } = useBase();
  const step = snap.sec > 3600 ? 60 : 15;
  const lo = Math.max(step, Math.round((snap.sec * 0.7) / step) * step);
  const hi = Math.round((snap.sec * 1.3) / step) * step;
  const s = useStepper(Math.round((snap.sec * 0.95) / step) * step, { min: lo, max: hi, step });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 330;
  const d = useDrawing(HMIN, s, (x, _y, W) => lo + ((x - X0) / (W - 2 * X0)) * (hi - lo));
  const { W, H } = d;
  const goal = s.value;
  const gap = goal - snap.sec;
  const goalPk = goal / snap.km;
  const dPace = pacePer(goalPk - pk, u);
  const tilt = clamp((-gap / snap.sec) * 120, -14, 14);
  const cx = W / 2;
  const pivotY = 100;
  const arm = Math.min(170, W / 2 - 60);
  const rad = (tilt * Math.PI) / 180;
  // Left pan = your time, right pan = goal. The heavier (longer) time sinks.
  const lx = cx - arm * Math.cos(rad);
  const ly = pivotY + arm * Math.sin(rad);
  const rx = cx + arm * Math.cos(rad);
  const ry = pivotY - arm * Math.sin(rad);
  const trackY = H - 52;
  const valueText = clock(goal);
  const status = gap < 0 ? t("faster") : gap > 0 ? t("slower") : t("equal");
  const rows: KitRow[] = [
    { key: "yours", label: t("rowYours"), value: clock(snap.sec) },
    { key: "goal", label: t("rowGoal"), value: clock(goal) },
    { key: "gap", label: `${clock(goal)} − ${clock(snap.sec)}`, value: sClock(gap), isKey: true },
    { key: "pace", label: `${clock(goal)} ÷ ${f2(toUnit(snap.km, u))}`, value: pT(goalPk) },
    { key: "dpace", label: t("rowPaceChange"), value: `${sClock(dPace)} /${u}` },
    { key: "speed", label: t("rowSpeedChange"), value: `${gap < 0 ? "+" : gap > 0 ? "−" : ""}${f1(Math.abs((snap.sec / goal - 1) * 100))}%` },
  ];
  const pan = (x: number, y: number, label: string, value: string, color: string, on: boolean) => (
    <g>
      <line x1={x} y1={y} x2={x - 34} y2={y + 46} style={{ stroke: "var(--ph-line)" }} />
      <line x1={x} y1={y} x2={x + 34} y2={y + 46} style={{ stroke: "var(--ph-line)" }} />
      <path d={`M ${x - 44} ${y + 46} Q ${x} ${y + 72} ${x + 44} ${y + 46} Z`} fill={color} opacity={on ? 1 : 0.85} />
      <T x={x} y={y + 92} text={value} size={13} bold style={INK} />
      <T x={x} y={y + 108} text={label} size={10.5} />
    </g>
  );
  return (
    <Card tool="pace-calculator" idPrefix="pace"
      n={8}
      side={side}
      k="goal"
      s={s}
      valueText={valueText}
      rows={rows}
      hover={hover}
      setHover={setHover}
      caption={t("caption", { goal: ltr(clock(goal)), pace: ltr(pT(goalPk)), status })}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((goal - lo) / (hi - lo)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="pace-c8">
          <T x={cx} y={22} text={`${sClock(gap)} · ${status}`} size={13} bold style={{ fill: gap < 0 ? "#16a34a" : gap > 0 ? "#dc2626" : "var(--ph-ink)" }} />
          <T x={cx} y={40} text={`${sClock(dPace)} /${u}`} size={11} />
          <path d={`M ${cx - 16} ${pivotY + 74} L ${cx} ${pivotY} L ${cx + 16} ${pivotY + 74} Z`} style={{ fill: "var(--ph-ink-muted)" }} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
          <circle cx={cx} cy={pivotY} r={6} style={{ fill: "var(--ph-ink)" }} />
          {pan(lx, ly, t("panYours"), clock(snap.sec), ACCENT, hover === "yours")}
          {pan(rx, ry, t("panGoal"), clock(goal), AMBER, hover === "goal")}
          <SvgTrack stopAnchor="frac" W={W} y={trackY} frac={(goal - lo) / (hi - lo)} lo={`−30% · ${clock(lo)}`} hi={`+30% · ${clock(hi)}`} />
        </Drawing>
      }
    />
  );
}
