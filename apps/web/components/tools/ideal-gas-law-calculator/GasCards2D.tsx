"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, SvgChem, SvgHandle, useMeasuredSize, useStepper, useSvgDrag, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { clamp } from "@/components/tool-ui/indicator-kit/format";
import { g4, GAS_SEED_INDEX, GASES, PRESSURE_SEED_INDEX, PRESSURES, R_LATM, SEED, tempCss, ZERO_C } from "./gasMath";
import { svgPx } from "@/components/tool-ui/svgPx";

import FitSvg from "@/components/tool-ui/FitSvg";
/**
 * The five 2D gas law indicator cards. Each drawing is laid out in real pixels at the measured
 * width of its box (viewBox = box), so labels keep their size on a phone and marks span the box.
 * Coordinates that come from log/pow/trig are rounded, so server and browser render identically.
 */
type Side = "visual-left" | "table-left";
const W0 = 520;
const rd = (v: number) => Math.round(v * 100) / 100;
const lit = (on: boolean) => ({ stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2.5 : 1.25 });

// ── Boyle's law: P × V constant ───────────────────────────────────────────────────────
const NRT = SEED.moles * R_LATM * SEED.temperature; // 22.414 L·atm
/** The Boyle drawing (own measured box and drag), so the phone mini card can render a live copy of it. */
function GasBoylePlot({ s, on }: { s: Stepper; on: boolean }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.boyle");
  const HMIN = 270;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 40;
  const X1 = W - 14;
  const Y0 = H - 42;
  const Y1 = 34;
  const VMAX = 50;
  const xv = (v: number) => X0 + (v / VMAX) * (X1 - X0);
  const yp = (p: number) => Y0 - (p / 4) * (Y0 - Y1);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (_x, py) => s.set(((Y0 - py) / (Y0 - Y1)) * 4));
  const pts: string[] = [];
  for (let v = NRT / 4; v <= VMAX; v += 0.25) pts.push(`${xv(v).toFixed(1)},${yp(NRT / v).toFixed(1)}`);
  const v = NRT / s.value;
  const valueText = `P = ${g4(s.value)} atm`;
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${valueText}, ${g4(v)} L`}>
        {[0, 1, 2, 3, 4].map((p) => (
          <g key={p}>
            <line x1={X0} y1={yp(p)} x2={X1} y2={yp(p)} style={{ stroke: "var(--ph-grid)" }} strokeWidth={1} />
            <text x={X0 - 8} y={yp(p) + 4} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {p}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50].map((x) => (
          <text key={x} x={xv(x)} y={Y0 + 18} textAnchor={x === 0 ? "start" : x === 50 ? "end" : "middle"} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
            {x}
          </text>
        ))}
        <text x={X1} y={Y0 + 36} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
          {t("axisV")}
        </text>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} strokeLinecap="round" />
        <rect x={X0} y={yp(s.value)} width={rd(xv(v) - X0)} height={rd(Y0 - yp(s.value))} rx={4} style={{ fill: "var(--chem-gas)", fillOpacity: on ? 0.28 : 0.16 }} />
        <polyline points={pts.join(" ")} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <text x={X0 + 6} y={14} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
          {`${g4(s.value)} atm × ${g4(v)} L = ${g4(NRT)} L·atm`}
        </text>
      </svg>
      <SvgHandle x={rd(xv(v))} y={yp(s.value)} viewW={W} viewH={H} direction="vertical" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="gas-boyle-handle" />
    </div>
  );
}

export function GasBoyleCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.boyle");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SEED.pressure, { min: 0.5, max: 4, step: 0.25 });
  const [hover, setHover] = useState<string | null>(null);
  const v = NRT / s.value;
  const valueText = `P = ${g4(s.value)} atm`;
  const rows: KitRow[] = [
    { key: "nrt", label: "nRT", value: `${g4(NRT)} L·atm` },
    { key: "p", label: t("rowP"), value: `${g4(s.value)} atm` },
    { key: "v", label: "V = nRT / P", value: `${g4(v)} L`, isKey: true },
    { key: "pv", label: "P × V", value: `${g4(s.value * v)} L·atm` },
    { key: "kpa", label: t("rowKpa"), value: `${g4(s.value * 101.325)} kPa` },
    { key: "double", label: t("rowDouble"), value: `${g4(v / 2)} L` },
  ];
  return (
    <IndicatorCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { p: ltr(g4(s.value)), v: ltr(g4(v)) })}
      controls={<KitControls s={s} valueText={valueText} testId="gas-boyle" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={0}
      visual={<GasBoylePlot s={s} on={hover === "v" || hover === "p"} />}
    />
  );
}

// ── Charles's law: V ∝ T ──────────────────────────────────────────────────────────────
const CHARLES_T = [-200, -100, 0, 100, 200, 300];
export function GasCharlesCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.charles");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(0, { min: -250, max: 300, step: 25 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 30;
  const X1 = W - 16;
  const Y0 = H - 36;
  const Y1 = 30;
  const VMAX = R_LATM * (300 + ZERO_C);
  const xt = (c: number) => X0 + ((c + ZERO_C) / (300 + ZERO_C)) * (X1 - X0);
  const yv = (v: number) => Y0 - (v / VMAX) * (Y0 - Y1);
  const vAt = (c: number) => R_LATM * (c + ZERO_C);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * (300 + ZERO_C) - ZERO_C));
  const v = vAt(s.value);
  const bw = Math.min(26, (X1 - X0) / 14);
  const valueText = `${s.value} °C`;
  const rows: KitRow[] = [
    { key: "t", label: t("rowT"), value: `${s.value} °C` },
    { key: "k", label: t("rowK"), value: `${g4(s.value + ZERO_C)} K` },
    { key: "v", label: "V = nRT / P", value: `${g4(v)} L`, isKey: true },
    { key: "ratio", label: "V / T", value: `${g4(R_LATM)} L/K` },
    { key: "stp", label: t("rowStp"), value: `× ${g4(v / vAt(0))}` },
    { key: "zero", label: t("rowZero"), value: "−273.15 °C" },
  ];
  return (
    <IndicatorCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { t: ltr(String(s.value)), v: ltr(g4(v)) })}
      controls={<KitControls s={s} valueText={valueText} testId="gas-charles" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${valueText}, ${g4(v)} L`}>
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} strokeLinecap="round" />
            {/* Extrapolation to zero volume at absolute zero. */}
            <line x1={xt(-ZERO_C)} y1={Y0} x2={xt(300)} y2={yv(vAt(300))} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={2} strokeDasharray="6 5" />
            {CHARLES_T.map((c) => (
              <g key={c}>
                <rect x={xt(c) - bw / 2} y={yv(vAt(c))} width={bw} height={Y0 - yv(vAt(c))} rx={bw / 2} style={{ fill: tempCss(c + ZERO_C), fillOpacity: 0.75 }} />
                <text x={xt(c)} y={Y0 + 16} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  {c}
                </text>
              </g>
            ))}
            <circle cx={xt(-ZERO_C)} cy={Y0} r={5} style={{ fill: "var(--ph-knob)", ...lit(hover === "zero") }} />
            <line x1={xt(s.value)} y1={yv(v)} x2={xt(s.value)} y2={Y0} style={{ stroke: "var(--ph-focus)" }} strokeWidth={2} strokeDasharray="3 3" />
            <text x={X0} y={16} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
              {`${s.value} °C → ${g4(v)} L`}
            </text>
            <text x={X1} y={16} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              V (L) · T (°C)
            </text>
          </svg>
          <SvgHandle x={xt(s.value)} y={yv(v)} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="gas-charles-handle" />
        </div>
      }
    />
  );
}

// ── Gas densities at STP: ranked bars ─────────────────────────────────────────────────
export function GasDensityCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.density");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(GAS_SEED_INDEX, { min: 0, max: GASES.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const rho = (M: number) => (SEED.pressure * M) / (R_LATM * SEED.temperature);
  const max = rho(GASES[GASES.length - 1].M);
  const LBL = 46;
  const X0 = LBL + 8;
  const X1 = W - 84;
  const rowH = (H - 16) / GASES.length;
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (_x, py) => s.set(clamp(Math.floor((py - 8) / rowH), 0, GASES.length - 1)));
  const g = GASES[s.value];
  const name = t(`items.${g.key}`);
  const r = rho(g.M);
  const air = rho(28.96);
  const rows: KitRow[] = [
    { key: "name", label: t("rowName"), value: name },
    { key: "m", label: t("rowM"), value: `${g.M} g/mol` },
    { key: "rho", label: "ρ = PM / RT", value: `${g4(r)} g/L`, isKey: true },
    { key: "mass", label: t("rowMass"), value: `${g4(g.M)} g` },
    { key: "air", label: t("rowAir"), value: `× ${g4(r / air)}` },
    { key: "verdict", label: t("rowVerdict"), value: t(r < air ? "rises" : "sinks") },
  ];
  const yRow = (i: number) => 8 + i * rowH + rowH / 2;
  return (
    <IndicatorCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { name, formula: g.formula, rho: ltr(g4(r)) })}
      controls={<KitControls s={s} valueText={`${s.value + 1} / ${GASES.length}`} testId="gas-density" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g.formula} ${g4(r)} g/L`}>
            {GASES.map((gas, i) => {
              const sel = i === s.value;
              const w = Math.max(8, ((X1 - X0) * rho(gas.M)) / max);
              return (
                <g key={gas.key}>
                  <text x={LBL} y={yRow(i) + 4} fontWeight={sel ? 800 : 600} textAnchor="end" style={{ fontSize: svgPx(sel ? 12.5 : 12), fill: "var(--ph-ink)" }}>
                    <SvgChem text={gas.formula} />
                  </text>
                  <rect x={X0} y={yRow(i) - 8} width={w} height={16} rx={8} style={{ fill: sel ? "var(--chem-gas)" : "var(--glass-track)", ...lit(sel) }} />
                  <text x={X0 + w + (sel ? 28 : 8)} y={yRow(i) + 4} fontWeight={sel ? 800 : 500} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                    {g4(rho(gas.M))}
                  </text>
                </g>
              );
            })}
            <line x1={X0 + ((X1 - X0) * air) / max} y1={6} x2={X0 + ((X1 - X0) * air) / max} y2={H - 6} style={{ stroke: "var(--ph-neutral)", opacity: hover === "air" ? 1 : 0.7 }} strokeWidth={1.5} strokeDasharray="4 4" />
          </svg>
          <SvgHandle x={rd(X0 + Math.max(8, ((X1 - X0) * r) / max))} y={yRow(s.value)} viewW={W} viewH={H} direction="vertical" label={t("handle")} valueText={`${name} · ${g4(r)} g/L`} s={s} drag={drag} testId="gas-density-handle" />
        </div>
      }
    />
  );
}

// ── Pressure dial (log scale) ─────────────────────────────────────────────────────────
const LOG_LO = -1;
const LOG_HI = 3;
/** The pressure dial drawing (own measured box and drag), so the phone mini card can render a live copy of it. */
function GasDialPlot({ s }: { s: Stepper }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.dial");
  const HMIN = 240;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const R = Math.min(W / 2 - 30, H - 70);
  const cx = W / 2;
  const cy = H - 34;
  // −1 (0.1 atm) on the left to 3 (1000 atm) on the right; values below 0.1 atm rest on the stop.
  const ang = (p: number) => Math.PI * (1 - (clamp(Math.log10(p), LOG_LO, LOG_HI) - LOG_LO) / (LOG_HI - LOG_LO));
  const at = (p: number, r: number): [number, number] => [rd(cx + r * Math.cos(ang(p))), rd(cy - r * Math.sin(ang(p)))];
  const src = PRESSURES[s.value];
  const name = t(`items.${src.key}`);
  const tip = at(src.p, R - 18);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px, py) => {
    const a = Math.atan2(cy - py, px - cx);
    const lg = LOG_LO + (1 - clamp(a, 0, Math.PI) / Math.PI) * (LOG_HI - LOG_LO);
    let best = 0;
    PRESSURES.forEach((q, i) => {
      if (Math.abs(clamp(Math.log10(q.p), LOG_LO, LOG_HI) - lg) < Math.abs(clamp(Math.log10(PRESSURES[best].p), LOG_LO, LOG_HI) - lg)) best = i;
    });
    s.set(best);
  });
  const arc = (from: number, to: number) => {
    const a = at(from, R);
    const b = at(to, R);
    return `M ${a[0]} ${a[1]} A ${R} ${R} 0 0 1 ${b[0]} ${b[1]}`;
  };
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <FitSvg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${name} ${g4(src.p)} atm`}>
        <path d={arc(0.1, 1)} fill="none" style={{ stroke: "var(--chem-cold)" }} strokeWidth={16} />
        <path d={arc(1, 10)} fill="none" style={{ stroke: "var(--ph-neutral)" }} strokeWidth={16} />
        <path d={arc(10, 1000)} fill="none" style={{ stroke: "var(--chem-hot)" }} strokeWidth={16} />
        {[0.1, 1, 10, 100, 1000].map((p) => {
          const [x, y] = at(p, R + 20);
          return (
            <text key={p} x={x} y={y + 4} textAnchor={p === 0.1 ? "end" : p === 1000 ? "start" : "middle"} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {String(p)}
            </text>
          );
        })}
        {PRESSURES.map((q, i) => {
          const [x, y] = at(q.p, R);
          return <circle key={q.key} cx={x} cy={y} r={i === s.value ? 6 : 3.5} style={{ fill: "var(--ph-knob)", ...lit(i === s.value) }} />;
        })}
        <line x1={cx} y1={cy} x2={tip[0]} y2={tip[1]} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={8} style={{ fill: "var(--ph-ink)" }} />
        <text x={cx} y={H - 8} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
          {`${g4(src.p)} atm`}
        </text>
      </FitSvg>
      <SvgHandle x={tip[0]} y={tip[1]} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={`${name} · ${g4(src.p)} atm`} s={s} drag={drag} testId="gas-dial-handle" />
    </div>
  );
}

export function GasDialCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.dial");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(PRESSURE_SEED_INDEX, { min: 0, max: PRESSURES.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const src = PRESSURES[s.value];
  const name = t(`items.${src.key}`);
  const vMol = (R_LATM * 293.15) / src.p;
  const rows: KitRow[] = [
    { key: "name", label: t("rowName"), value: name },
    { key: "atm", label: t("rowAtm"), value: `${g4(src.p)} atm`, isKey: true },
    { key: "kpa", label: t("rowKpa"), value: `${g4(src.p * 101.325)} kPa` },
    { key: "psi", label: t("rowPsi"), value: `${g4(src.p * 14.6959)} psi` },
    { key: "vmol", label: t("rowVmol"), value: `${g4(vMol)} L` },
  ];
  return (
    <IndicatorCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { name, p: ltr(g4(src.p)) })}
      controls={<KitControls s={s} valueText={`${s.value + 1} / ${PRESSURES.length}`} testId="gas-dial" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={1}
      visual={<GasDialPlot s={s} />}
    />
  );
}

// ── PV = nRT balance ──────────────────────────────────────────────────────────────────
export function GasBalanceCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.balance");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SEED.moles, { min: 0.25, max: 4, step: 0.25 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 230;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const P = SEED.pressure;
  const T = SEED.temperature;
  const nrt = s.value * R_LATM * T;
  const v = nrt / P;
  const cx = W / 2;
  const beamY = 64;
  const arm = Math.min(W / 2 - 64, 200);
  const railY = H - 22;
  const X0 = 30;
  const X1 = W - 30;
  const xn = (n: number) => X0 + ((n - 0.25) / 3.75) * (X1 - X0);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(0.25 + ((px - X0) / (X1 - X0)) * 3.75));
  const valueText = `n = ${g4(s.value)} mol`;
  const rows: KitRow[] = [
    { key: "p", label: "P", value: `${g4(P)} atm` },
    { key: "n", label: "n", value: `${g4(s.value)} mol` },
    { key: "t", label: "T", value: `${g4(T)} K` },
    { key: "r", label: "R", value: `${R_LATM} L·atm/(mol·K)` },
    { key: "v", label: "V = nRT / P", value: `${g4(v)} L`, isKey: true },
    { key: "pv", label: "PV", value: `${g4(P * v)} L·atm` },
    { key: "nrt", label: "nRT", value: `${g4(nrt)} L·atm` },
  ];
  const pan = (x: number, title: string, value: string, key: string) => (
    <g onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)}>
      <line x1={x} y1={beamY} x2={x} y2={beamY + 30} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} />
      <ellipse cx={x} cy={beamY + 56} rx={58} ry={26} style={{ fill: "var(--ph-surface)", ...lit(hover === key) }} />
      <text x={x} y={beamY + 52} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
        {title}
      </text>
      <text x={x} y={beamY + 68} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
        {value}
      </text>
    </g>
  );
  return (
    <IndicatorCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(g4(s.value)), v: ltr(g4(v)) })}
      controls={<KitControls s={s} valueText={valueText} testId="gas-balance" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`PV = nRT = ${g4(nrt)} L·atm`}>
            <text x={cx} y={20} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
              {`${g4(P * v)} = ${g4(nrt)} L·atm`}
            </text>
            <line x1={cx - arm} y1={beamY} x2={cx + arm} y2={beamY} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
            <path d={`M ${cx} ${beamY} L ${cx - 16} ${railY - 34} L ${cx + 16} ${railY - 34} Z`} style={{ fill: "var(--chem-piston)" }} />
            {pan(cx - arm, "P × V", `${g4(P)} × ${g4(v)}`, "pv")}
            {pan(cx + arm, "n × R × T", `${g4(s.value)} × R × ${g4(T)}`, "nrt")}
            <line x1={X0} y1={railY} x2={X1} y2={railY} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} strokeLinecap="round" />
            <line x1={X0} y1={railY} x2={xn(s.value)} y2={railY} style={{ stroke: "var(--chem-gas)" }} strokeWidth={5} strokeLinecap="round" />
          </svg>
          <SvgHandle x={xn(s.value)} y={railY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="gas-balance-handle" />
        </div>
      }
    />
  );
}
