"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { axisTicks, INK, LINE, lit, MUTED, px2, SvgLabel } from "@/components/tool-ui/indicator-kit/SvgBits";
import { Drawing, useDrawing } from "@/components/tool-ui/indicator-kit/Drawing";
import { fmtSmart, sci, sup } from "@/components/tool-ui/indicator-kit/format";

/**
 * The eight 2D unit-converter indicator cards. Each card owns its state (seeded once, never linked
 * to the Result card or to another card), is laid out in real pixels at its measured width, and
 * uses the exact factors the converter uses (SI definitions, 1959 international yard and pound).
 */
type Side = "visual-left" | "table-left";
const g = (v: number, sig = 4) => fmtSmart(v, sig);
const T = SvgLabel;
const ticks = axisTicks;

function useCardText(key: string) {
  return { t: useTranslations(`tools.unit-converter.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

// ── 1. Metric prefixes: hops of ×10 on a log line ─────────────────────────────────────
const PREFIX = [
  { e: -3, sym: "m" },
  { e: -2, sym: "c" },
  { e: -1, sym: "d" },
  { e: 0, sym: "" },
  { e: 1, sym: "da" },
  { e: 2, sym: "h" },
  { e: 3, sym: "k" },
];
export function UnitPrefixCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("prefix");
  const s = useStepper(3, { min: -3, max: 3, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 220;
  const X0 = 34;
  const d = useDrawing(HMIN, s, (x, _y, W) => -3 + ((x - X0) / (W - 2 * X0)) * 6);
  const { W, H } = d;
  const xe = (e: number) => X0 + ((e + 3) / 6) * (W - 2 * X0);
  const lineY = H - 62;
  const e = s.value;
  const names = t.raw("names") as string[];
  const name = names[e + 3];
  const sym = PREFIX[e + 3].sym;
  const unit = `${sym}m`;
  const factor = e === 0 ? "1" : `10${sup(e)}`;
  const valueText = `1 ${unit} = ${factor} m`;
  const hops = Array.from({ length: Math.abs(e) }, (_, i) => (e > 0 ? i : -i - 1));
  const rows: KitRow[] = [
    { key: "prefix", label: t("rowPrefix"), value: name },
    { key: "sym", label: t("rowSymbol"), value: unit },
    { key: "factor", label: t("rowFactor"), value: factor, isKey: true },
    { key: "inM", label: `1 ${unit} → m`, value: `${g(10 ** e, 6)} m` },
    { key: "fromM", label: `1 m → ${unit}`, value: `${g(10 ** -e, 6)} ${unit}` },
    { key: "shift", label: t("rowShift"), value: String(Math.abs(e)) },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(`1 ${unit} = ${factor} m`), n: ltr(String(Math.abs(e))) })}
      controls={<KitControls s={s} valueText={unit} testId="unit-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xe(e), y: lineY, dir: "horizontal" }} s={s} testId="unit-c1">
          {hops.map((k) => {
            const a = xe(k);
            const b = xe(k + 1);
            const rise = Math.min(46, (b - a) * 0.7);
            const on = hover === "shift" || hover === "factor";
            return (
              <g key={k}>
                <path d={`M ${a} ${lineY} Q ${(a + b) / 2} ${lineY - rise * 2} ${b} ${lineY}`} fill="none" style={{ stroke: e > 0 ? "var(--cv-from)" : "var(--cv-to)" }} strokeWidth={on ? 3.5 : 2.5} strokeLinecap="round" />
                <T x={(a + b) / 2} y={lineY - rise - 8} text={e > 0 ? "×10" : "÷10"} size={12} bold style={INK} />
              </g>
            );
          })}
          <line x1={X0} y1={lineY} x2={W - X0} y2={lineY} style={LINE} strokeWidth={3} strokeLinecap="round" />
          {PREFIX.map((p) => {
            const x = xe(p.e);
            const on = p.e === e;
            return (
              <g key={p.e}>
                <circle cx={x} cy={lineY} r={p.e === 0 ? 8 : 6} style={{ fill: p.e === 0 ? "var(--ph-ink)" : on ? "var(--cv-from)" : "var(--glass-track)", ...lit(on) }} />
                <T x={x} y={lineY + 26} text={`${p.sym}m`} size={12.5} bold style={on ? INK : MUTED} />
                <T x={x} y={lineY + 44} text={p.e === 0 ? "1" : `10${sup(p.e)}`} size={12} />
              </g>
            );
          })}
          <T x={W / 2} y={22} text={valueText} size={14} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 2. Imperial chain: one length, notched in inches, feet and yards ──────────────────
const IN_MAX = 72;
export function UnitImperialCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("imperial");
  const s = useStepper(36, { min: 1, max: IN_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 200;
  const X0 = 24;
  const LBL = 100;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - X0 - LBL)) * IN_MAX);
  const { W, H } = d;
  const xi = (inch: number) => X0 + (inch / IN_MAX) * (W - X0 - LBL);
  const inch = s.value;
  const bars = [
    { key: "in", every: 1, major: 12, text: `${inch} in`, color: "var(--cv-from)" },
    { key: "ft", every: 12, major: 12, text: `${g(inch / 12, 3)} ft`, color: "var(--cv-to)" },
    { key: "yd", every: 36, major: 36, text: `${g(inch / 36, 3)} yd`, color: "var(--cv-third)" },
  ];
  const gap = (H - 40) / 3;
  const valueText = `${inch} in = ${g(inch / 12, 3)} ft`;
  const rows: KitRow[] = [
    { key: "in", label: t("rowInches"), value: `${inch} in` },
    { key: "ft", label: "in ÷ 12", value: `${g(inch / 12, 4)} ft`, isKey: true },
    { key: "yd", label: "in ÷ 36", value: `${g(inch / 36, 4)} yd` },
    { key: "cm", label: "in × 2.54", value: `${g(inch * 2.54, 5)} cm` },
    { key: "mi", label: "in ÷ 63,360", value: `${g(inch / 63360, 3)} mi` },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(`${inch} in = ${g(inch / 12, 3)} ft = ${g(inch / 36, 3)} yd`) })}
      controls={<KitControls s={s} valueText={`${inch} in`} testId="unit-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xi(inch), y: 20 + gap / 2, dir: "horizontal" }} s={s} testId="unit-c2">
          {bars.map((b, i) => {
            const y = 20 + gap * i + gap / 2;
            const on = hover === b.key;
            const notches: number[] = [];
            for (let k = b.every; k < inch; k += b.every) if (b.every > 1 || xi(1) - xi(0) >= 4) notches.push(k);
            return (
              <g key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)}>
                <rect x={X0} y={y - 9} width={Math.max(8, xi(inch) - X0)} height={18} rx={9} style={{ fill: b.color, opacity: on ? 1 : 0.85 }} />
                {notches.map((k) => (
                  <line key={k} x1={xi(k)} y1={y - (k % b.major === 0 ? 9 : 4)} x2={xi(k)} y2={y + (k % b.major === 0 ? 9 : 4)} style={{ stroke: "var(--glass-track)" }} strokeWidth={k % b.major === 0 ? 2.5 : 1} />
                ))}
                <T x={W - LBL + 30} y={y + 4.5} text={b.text} anchor="start" size={12.5} bold style={INK} />
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}

// ── 3. °C → °F: scale AND offset, on a line chart ─────────────────────────────────────
export function UnitTempLineCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("tempLine");
  const s = useStepper(20, { min: -40, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 280;
  const X0 = 46;
  const d = useDrawing(HMIN, s, (x, _y, W) => -40 + ((x - X0) / (W - 14 - X0)) * 140);
  const { W, H } = d;
  const Y0 = H - 36;
  const Y1 = 18;
  const xc = (c: number) => X0 + ((c + 40) / 140) * (W - 14 - X0);
  const yf = (f: number) => Y0 - ((f + 80) / 300) * (Y0 - Y1);
  const c = s.value;
  const f = c * 1.8 + 32;
  const valueText = `${c} °C = ${g(f)} °F`;
  const rows: KitRow[] = [
    { key: "c", label: "°C", value: `${c} °C` },
    { key: "mul", label: "× 1.8", value: g(c * 1.8) },
    { key: "f", label: "+ 32", value: `${g(f)} °F`, isKey: true },
    { key: "k", label: "°C + 273.15", value: `${g(c + 273.15, 5)} K` },
    { key: "naive", label: t("rowNaive"), value: `${g(c * 1.8)} °F` },
  ];
  const on = hover === "naive";
  return (
    <IndicatorCard
      idPrefix="unit"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { c: ltr(`${c} °C`), f: ltr(`${g(f)} °F`) })}
      controls={<KitControls s={s} valueText={`${c} °C`} testId="unit-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xc(c), y: yf(f), dir: "horizontal" }} s={s} testId="unit-c3">
          {ticks(-80, 220, Y0 - Y1, 30).map((v) => (
            <g key={v}>
              <line x1={X0} y1={yf(v)} x2={W - 14} y2={yf(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={X0 - 6} y={yf(v) + 4} text={String(v)} anchor="end" size={12} />
            </g>
          ))}
          {ticks(-40, 100, W - 14 - X0, 52).map((v) => (
            <T key={v} x={xc(v)} y={Y0 + 18} text={String(v)} size={12} />
          ))}
          <T x={X0 - 6} y={Y1 - 4} text="°F" anchor="end" size={12} bold style={{ fill: "var(--cv-to)" }} />
          <T x={W - 14} y={Y0 + 32} text="°C" anchor="end" size={12} bold style={{ fill: "var(--cv-from)" }} />
          <line x1={xc(-40)} y1={yf(-72)} x2={xc(100)} y2={yf(180)} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={on ? 3 : 1.5} strokeDasharray="6 5" />
          <line x1={xc(-40)} y1={yf(-40)} x2={xc(100)} y2={yf(212)} style={{ stroke: "var(--cv-to)" }} strokeWidth={3} strokeLinecap="round" />
          <line x1={xc(c)} y1={Y0} x2={xc(c)} y2={yf(f)} style={{ stroke: "var(--cv-from)" }} strokeWidth={1.5} strokeDasharray="4 4" />
          <line x1={X0} y1={yf(f)} x2={xc(c)} y2={yf(f)} style={{ stroke: "var(--cv-to)" }} strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={xc(c)} cy={yf(c * 1.8)} r={4} style={{ fill: "var(--ph-ink-muted)" }} />
          <T x={X0 + 10} y={Y1 + 16} text={valueText} anchor="start" size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 4. Kelvin, Celsius, Fahrenheit: three parallel scales from absolute zero ──────────
export function UnitScalesCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("scales");
  const s = useStepper(0, { min: 0, max: 400, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 300;
  const TOP = 34;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => ((H - 22 - y) / (H - 22 - TOP)) * 400);
  const { W, H } = d;
  const BOT = H - 22;
  const yk = (k: number) => BOT - (k / 400) * (BOT - TOP);
  const k = s.value;
  const c = k - 273.15;
  const f = k * 1.8 - 459.67;
  const cols = [
    { key: "k", sym: "K", x: W * 0.36, conv: (v: number) => v, inv: (v: number) => v, color: "var(--cv-third)" },
    { key: "c", sym: "°C", x: W * 0.6, conv: (v: number) => v - 273.15, inv: (v: number) => v + 273.15, color: "var(--cv-from)" },
    { key: "f", sym: "°F", x: W * 0.84, conv: (v: number) => v * 1.8 - 459.67, inv: (v: number) => (v + 459.67) / 1.8, color: "var(--cv-to)" },
  ];
  const marks = [
    { k: 0, key: "zero" },
    { k: 273.15, key: "freeze" },
    { k: 373.15, key: "boil" },
  ];
  const valueText = `${k} K = ${g(c, 5)} °C = ${g(f, 5)} °F`;
  const rows: KitRow[] = [
    { key: "k", label: "K", value: `${k} K`, isKey: true },
    { key: "c", label: "K − 273.15", value: `${g(c, 5)} °C` },
    { key: "f", label: "K × 1.8 − 459.67", value: `${g(f, 5)} °F` },
    { key: "r", label: t("rowRankine"), value: `${g(k * 1.8, 5)} °R` },
    { key: "zero", label: t("rowAboveZero"), value: `${k} K` },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(`${k} K`), c: ltr(`${g(c, 5)} °C`), f: ltr(`${g(f, 5)} °F`) })}
      controls={<KitControls s={s} valueText={`${k} K`} testId="unit-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: W * 0.48, y: yk(k), dir: "vertical" }} s={s} testId="unit-c4">
          {marks.map((m) => (
            <g key={m.key}>
              <line x1={14} y1={yk(m.k)} x2={W - 14} y2={yk(m.k)} style={{ stroke: "var(--ph-grid)" }} strokeDasharray="3 5" />
              <T x={14} y={yk(m.k) - 5} text={t(`mark.${m.key}`)} anchor="start" size={12} />
            </g>
          ))}
          {cols.map((col) => {
            const on = hover === col.key;
            const lo = col.conv(0);
            const hi = col.conv(400);
            return (
              <g key={col.key} onPointerEnter={() => setHover(col.key)} onPointerLeave={() => setHover(null)}>
                <rect x={col.x - 5} y={TOP} width={10} height={BOT - TOP} rx={5} style={{ fill: "var(--glass-track)", ...lit(on) }} />
                <rect x={col.x - 5} y={yk(k)} width={10} height={BOT - yk(k) + 0.01} rx={5} style={{ fill: col.color }} />
                {ticks(lo, hi, BOT - TOP, 34).map((v) => (
                  <g key={v}>
                    <line x1={col.x + 6} y1={yk(col.inv(v))} x2={col.x + 12} y2={yk(col.inv(v))} style={LINE} />
                    <T x={col.x + 15} y={yk(col.inv(v)) + 3.5} text={String(Math.round(v))} anchor="start" size={12} />
                  </g>
                ))}
                <T x={col.x} y={TOP - 14} text={col.sym} size={13} bold style={{ fill: col.color }} />
              </g>
            );
          })}
          <line x1={W * 0.36 - 12} y1={yk(k)} x2={W * 0.84 + 12} y2={yk(k)} style={{ stroke: "var(--ph-focus)" }} strokeWidth={2} />
        </Drawing>
      }
    />
  );
}

// ── 5. Hectares and acres as circles of true area ─────────────────────────────────────
const ACRE_HA = 0.40468564224;
const PITCH_HA = 0.714; // FIFA-recommended 105 m × 68 m
export function UnitAreaCirclesCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("areaCircles");
  const s = useStepper(1, { min: 0.5, max: 10, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const d = useDrawing(HMIN, s, (x, _y, W, H) => {
    const R10 = Math.min(W * 0.27, (H - 64) / 2);
    return 10 * ((x - W * 0.62) / R10) ** 2;
  });
  const { W, H } = d;
  const ha = s.value;
  const R10 = Math.min(W * 0.27, (H - 64) / 2);
  const rOf = (a: number) => R10 * Math.sqrt(a / 10);
  const cy = (H - 24) / 2 + 2;
  const ac = ha / ACRE_HA;
  const refs = [
    { key: "acre", a: ACRE_HA, label: "1 ac", x: W * 0.1 },
    { key: "pitch", a: PITCH_HA, label: t("pitch"), x: W * 0.24 },
  ];
  const valueText = `${g(ha, 3)} ha = ${g(ac)} ac`;
  const rows: KitRow[] = [
    { key: "ha", label: "ha", value: `${g(ha, 3)} ha` },
    { key: "m2", label: "ha × 10,000", value: `${g(ha * 10000, 6)} m²` },
    { key: "ac", label: "ha ÷ 0.404686", value: `${g(ac)} ac`, isKey: true },
    { key: "ft2", label: "ft²", value: `${g((ha * 10000) / 0.09290304, 5)} ft²` },
    { key: "pitch", label: t("rowPitches"), value: g(ha / PITCH_HA, 3) },
    { key: "km2", label: "km²", value: `${g(ha / 100, 3)} km²` },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(`${g(ha, 3)} ha = ${g(ac)} ac`), p: ltr(g(ha / PITCH_HA, 3)) })}
      controls={<KitControls s={s} valueText={`${g(ha, 3)} ha`} testId="unit-c5" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: W * 0.62 + rOf(ha), y: cy, dir: "horizontal" }} s={s} testId="unit-c5">
          {refs.map((r) => (
            <g key={r.key} onPointerEnter={() => setHover(r.key === "acre" ? "ac" : "pitch")} onPointerLeave={() => setHover(null)}>
              <circle cx={r.x} cy={cy} r={rOf(r.a)} style={{ fill: r.key === "acre" ? "var(--cv-to-soft)" : "var(--glass-track)", ...lit(hover === (r.key === "acre" ? "ac" : "pitch")) }} />
              <T x={r.x} y={cy + rOf(r.a) + 18} text={r.label} size={12} bold style={INK} />
            </g>
          ))}
          <circle cx={W * 0.62} cy={cy} r={rOf(10)} fill="none" style={LINE} strokeDasharray="4 5" />
          <circle cx={W * 0.62} cy={cy} r={rOf(ha)} style={{ fill: "var(--cv-from-soft)", stroke: "var(--cv-from)" }} strokeWidth={hover === "ha" || hover === "ac" ? 3.5 : 2.5} />
          <T x={W * 0.62} y={cy + rOf(10) + 18} text={valueText} size={12.5} bold style={INK} />
          <T x={W * 0.62} y={cy - rOf(10) - 6} text="10 ha" size={12} />
        </Drawing>
      }
    />
  );
}

// ── 6. One hour on the road: km ticks above, mile ticks below ─────────────────────────
const KM_MI = 1.609344;
export function UnitRoadCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("road");
  const s = useStepper(100, { min: 10, max: 200, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 190;
  const X0 = 26;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 200);
  const { W, H } = d;
  const xk = (km: number) => X0 + (km / 200) * (W - 2 * X0);
  const roadY = H / 2;
  const kmh = s.value;
  const mph = kmh / KM_MI;
  const valueText = `${kmh} km/h = ${g(mph)} mph`;
  const rows: KitRow[] = [
    { key: "kmh", label: "km/h", value: `${kmh} km/h` },
    { key: "mph", label: "km/h ÷ 1.609344", value: `${g(mph)} mph`, isKey: true },
    { key: "mps", label: "km/h ÷ 3.6", value: `${g(kmh / 3.6)} m/s` },
    { key: "kn", label: "km/h ÷ 1.852", value: `${g(kmh / 1.852)} kn` },
    { key: "t100", label: t("rowTime100"), value: `${g(6000 / kmh, 3)} min` },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { kmh: ltr(`${kmh} km/h`), km: ltr(`${kmh} km`), mi: ltr(`${g(mph)} mi`) })}
      controls={<KitControls s={s} valueText={`${kmh} km/h`} testId="unit-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xk(kmh), y: roadY, dir: "horizontal" }} s={s} testId="unit-c6">
          <rect x={X0 - 10} y={roadY - 14} width={W - 2 * X0 + 20} height={28} rx={14} style={{ fill: "var(--glass-track)", ...LINE }} strokeWidth={1} />
          <rect x={X0 - 10} y={roadY - 14} width={xk(kmh) - X0 + 10} height={28} rx={14} style={{ fill: "var(--cv-from-soft)" }} />
          <line x1={X0} y1={roadY} x2={W - X0} y2={roadY} style={LINE} strokeWidth={1.5} strokeDasharray="10 8" />
          {ticks(0, 200, W - 2 * X0, 50).map((v) => (
            <g key={`k${v}`} onPointerEnter={() => setHover("kmh")} onPointerLeave={() => setHover(null)}>
              <line x1={xk(v)} y1={roadY - 18} x2={xk(v)} y2={roadY - 26} style={{ stroke: "var(--cv-from)" }} strokeWidth={1.5} />
              <T x={xk(v)} y={roadY - 32} text={String(v)} size={12} style={{ fill: "var(--cv-from)" }} />
            </g>
          ))}
          {ticks(0, 200 / KM_MI, W - 2 * X0, 50).map((v) => (
            <g key={`m${v}`} onPointerEnter={() => setHover("mph")} onPointerLeave={() => setHover(null)}>
              <line x1={xk(v * KM_MI)} y1={roadY + 18} x2={xk(v * KM_MI)} y2={roadY + 26} style={{ stroke: "var(--cv-to)" }} strokeWidth={1.5} />
              <T x={xk(v * KM_MI)} y={roadY + 40} text={String(v)} size={12} style={{ fill: "var(--cv-to)" }} />
            </g>
          ))}
          <T x={X0 - 10} y={roadY - 52} text="km" anchor="start" size={12} bold style={{ fill: "var(--cv-from)" }} />
          <T x={X0 - 10} y={roadY + 60} text="mi" anchor="start" size={12} bold style={{ fill: "var(--cv-to)" }} />
          <T x={W - X0 + 10} y={roadY - 52} text={t("afterHour")} anchor="end" size={12} />
        </Drawing>
      }
    />
  );
}

// ── 7. US vs UK gallons: the same liters poured into rows of gallon jugs ──────────────
const US_GAL = 3.785411784;
const UK_GAL = 4.54609;
const L_MAX = 40;
export function UnitGallonJugsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("gallons");
  const s = useStepper(10, { min: 0.5, max: L_MAX, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const X0 = 22;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * L_MAX);
  const { W, H } = d;
  const L = s.value;
  const us = L / US_GAL;
  const uk = L / UK_GAL;
  const xl = (l: number) => px2(X0 + (l / L_MAX) * (W - 2 * X0));
  const jugH = Math.min(64, (H - 110) / 2);
  // One row of jugs: each jug is one gallon wide on the shared liter axis; the last one is part-filled.
  const row = (per: number, y: number, color: string, key: string) => {
    const n = Math.ceil(L / per - 1e-9);
    return (
      <g onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)}>
        {Array.from({ length: n }, (_, i) => {
          const x = xl(i * per) + 2;
          const w = xl(per) - X0 - 4;
          const fill = Math.min(1, L / per - i);
          const neck = Math.min(10, w * 0.28);
          return (
            <g key={`${key}${i}`}>
              <rect x={x} y={px2(y + jugH * (1 - fill))} width={w} height={px2(jugH * fill)} rx={4} style={{ fill: color }} opacity={0.85} />
              <path
                d={`M ${x} ${y + 8} Q ${x} ${y} ${x + 8} ${y} L ${x + w - neck} ${y} L ${x + w - neck} ${y - 7} L ${x + w} ${y - 7} L ${x + w} ${y + jugH - 4} Q ${x + w} ${y + jugH} ${x + w - 4} ${y + jugH} L ${x + 4} ${y + jugH} Q ${x} ${y + jugH} ${x} ${y + jugH - 4} Z`}
                fill="none"
                style={lit(hover === key)}
              />
            </g>
          );
        })}
      </g>
    );
  };
  const y1 = 40;
  const y2 = y1 + jugH + 52;
  const axisY = y2 + jugH + 22;
  const valueText = `${g(L, 3)} L = ${g(us)} US gal = ${g(uk)} UK gal`;
  const rows: KitRow[] = [
    { key: "l", label: "L", value: `${g(L, 3)} L` },
    { key: "us", label: "L ÷ 3.785411784", value: `${g(us)} US gal`, isKey: true },
    { key: "uk", label: "L ÷ 4.54609", value: `${g(uk)} UK gal` },
    { key: "diff", label: t("rowDiff"), value: `${g(us - uk, 3)} gal` },
    { key: "ratio", label: t("rowRatio"), value: "1.20095" },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { l: ltr(`${g(L, 3)} L`), us: ltr(g(us)), uk: ltr(g(uk)) })}
      controls={<KitControls s={s} valueText={`${g(L, 3)} L`} testId="unit-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xl(L), y: axisY, dir: "horizontal" }} s={s} testId="unit-c7">
          <T x={X0} y={y1 - 14} text={`US gal: ${g(us, 3)}`} anchor="start" bold style={{ fill: "var(--cv-from)" }} />
          {row(US_GAL, y1, "var(--cv-from)", "us")}
          <T x={X0} y={y2 - 14} text={`UK gal: ${g(uk, 3)}`} anchor="start" bold style={{ fill: "var(--cv-to)" }} />
          {row(UK_GAL, y2, "var(--cv-to)", "uk")}
          <line x1={xl(L)} y1={y1 - 4} x2={xl(L)} y2={axisY} style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.5} strokeDasharray="4 4" />
          <line x1={X0} y1={axisY} x2={W - X0} y2={axisY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={axisY} x2={xl(L)} y2={axisY} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={8} strokeLinecap="round" />
          {ticks(0, L_MAX, W - 2 * X0, 56).map((v) => (
            <T key={v} x={xl(v)} y={axisY + 26} text={`${v} L`} size={12} anchor={v === 0 ? "start" : v === L_MAX ? "end" : "middle"} />
          ))}
        </Drawing>
      }
    />
  );
}

// ── 8. The 1791 meter: a quarter meridian, equator to pole ────────────────────────────
const QUAD_KM_1791 = 10000;
const QUAD_KM_WGS84 = 10001.966; // WGS 84 meridian quadrant
export function UnitMeridianCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("meridian");
  const s = useStepper(45, { min: 0, max: 90, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, y, _W, H) => {
    const ox = 40;
    const oy = H - 30;
    return (Math.atan2(oy - y, x - ox) * 180) / Math.PI;
  });
  const { W, H } = d;
  const ox = 40;
  const oy = H - 30;
  const R = Math.min(W - 150, oy - 26);
  const lat = s.value;
  const pt = (deg: number, r = R) => [px2(ox + r * Math.cos((deg * Math.PI) / 180)), px2(oy - r * Math.sin((deg * Math.PI) / 180))] as const;
  const [px, py] = pt(lat);
  const km = (lat / 90) * QUAD_KM_1791;
  const valueText = `${lat}° → ${g(km, 5)} km`;
  const rows: KitRow[] = [
    { key: "lat", label: t("rowLatitude"), value: `${lat}°` },
    { key: "km", label: "lat ÷ 90 × 10,000", value: `${g(km, 5)} km`, isKey: true },
    { key: "m", label: "m", value: `${sci(km * 1000, 3)} m` },
    { key: "mi", label: "mi", value: `${g(km / KM_MI, 5)} mi` },
    { key: "now", label: t("rowModern"), value: `${g((lat / 90) * QUAD_KM_WGS84, 6)} km` },
  ];
  return (
    <IndicatorCard
      idPrefix="unit"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { lat: ltr(`${lat}°`), km: ltr(`${g(km, 5)} km`) })}
      controls={<KitControls s={s} valueText={`${lat}°`} testId="unit-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: px, y: py, dir: "circular" }} s={s} testId="unit-c8">
          <path d={`M ${ox + R} ${oy} A ${R} ${R} 0 0 0 ${ox} ${oy - R}`} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={12} strokeLinecap="round" />
          {lat > 0 && <path d={`M ${ox + R} ${oy} A ${R} ${R} 0 0 0 ${px} ${py}`} fill="none" style={{ stroke: "var(--cv-from)" }} strokeWidth={hover === "km" ? 14 : 12} strokeLinecap="round" />}
          <line x1={ox} y1={oy} x2={ox + R + 14} y2={oy} style={LINE} strokeWidth={1.5} />
          <line x1={ox} y1={oy} x2={ox} y2={oy - R - 10} style={LINE} strokeWidth={1.5} />
          <line x1={ox} y1={oy} x2={px} y2={py} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={1.5} strokeDasharray="4 4" />
          {[30, 60].map((a) => {
            const [x, y] = pt(a, R + 18);
            return <T key={a} x={x} y={y + 4} text={`${a}°`} size={12} />;
          })}
          <T x={ox + R} y={oy + 22} text={t("equator")} anchor="middle" size={12} bold style={INK} />
          <T x={ox + 8} y={oy - R - 2} text={t("pole")} anchor="start" size={12} bold style={INK} />
          <T x={W - 12} y={22} text={valueText} anchor="end" size={13} bold style={INK} />
          <T x={W - 12} y={42} text="10,000 km = 10⁷ m" anchor="end" size={12} />
          <circle cx={ox} cy={oy} r={4} style={{ fill: "var(--ph-ink)" }} />
        </Drawing>
      }
    />
  );
}
