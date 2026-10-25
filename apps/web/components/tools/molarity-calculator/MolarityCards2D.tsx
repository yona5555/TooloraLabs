"use client";
import { useRef, useState, useId } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, SvgChem, SvgHandle, useMeasuredSize, useStepper, useSvgDrag, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { clamp } from "@/components/tool-ui/indicator-kit/format";
import { AVOGADRO, g3, liquidCss, REFERENCE, referenceSeedIndex, sciText, SEED, SERIAL_MAX } from "./molMath";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The five 2D molarity indicator cards. Each drawing is laid out in real pixels at the measured
 * width of its box (viewBox = box), so labels keep their size on a phone and marks span the box.
 */
type Side = "visual-left" | "table-left";
const W0 = 520;
const lit = (on: boolean) => ({ stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2.5 : 1.25 });

// ── 1. Grams → moles → molarity ───────────────────────────────────────────────────────
const MASS_STEP = SEED.molarMassNaCl / 10; // 0.1 mol of NaCl per step
const MASS_MAX = SEED.molarMassNaCl * 4;

export function MolFlowCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.flow");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SEED.molarMassNaCl, { min: MASS_STEP, max: MASS_MAX, step: MASS_STEP });
  const [hover, setHover] = useState<string | null>(null);
  const n = s.value / SEED.molarMassNaCl;
  const m = n / SEED.volume;
  const valueText = `${g3(s.value)} g NaCl`;
  const rows: KitRow[] = [
    { key: "mass", label: t("rowMass"), value: `${g3(s.value)} g` },
    { key: "mm", label: t("rowMolarMass"), value: `${SEED.molarMassNaCl} g/mol` },
    { key: "n", label: "n = m / M", value: `${g3(n)} mol` },
    { key: "v", label: t("rowVolume"), value: `${g3(SEED.volume)} L` },
    { key: "m", label: "c = n / V", value: `${g3(m)} mol/L`, isKey: true },
    { key: "units", label: t("rowUnits"), value: sciText(n * AVOGADRO) },
  ];
  return (
    <IndicatorCard
      idPrefix="mol"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { g: ltr(g3(s.value)), n: ltr(g3(n)), m: ltr(g3(m)) })}
      controls={<KitControls s={s} valueText={valueText} testId="mol-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={1}
      visual={<MolFlowDrawing s={s} valueText={valueText} hover={hover} setHover={setHover} />}
    />
  );
}

/** Card 1's drawing; it owns its measured box, svg ref and drag so the phone mini copy (PhoneMini) gets its own. */
function MolFlowDrawing({ s, valueText, hover, setHover }: { s: Stepper; valueText: string; hover: string | null; setHover: (k: string | null) => void }) {
  const t = useTranslations("tools.molarity-calculator.visuals.flow");
  const HMIN = 236;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const n = s.value / SEED.molarMassNaCl;
  const m = n / SEED.volume;
  const X0 = 26;
  const X1 = W - 26;
  const railY = H - 26;
  const xm = (g: number) => X0 + ((g - MASS_STEP) / (MASS_MAX - MASS_STEP)) * (X1 - X0);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(MASS_STEP + ((px - X0) / (X1 - X0)) * (MASS_MAX - MASS_STEP)));
  const cy = 34 + (railY - 60) / 2;
  const R = Math.min(W * 0.11, (railY - 80) / 2);
  const nodes = [
    { key: "mass", x: W * 0.17, frac: s.value / MASS_MAX, value: g3(s.value), unit: "g" },
    { key: "n", x: W * 0.5, frac: n / 4, value: g3(n), unit: "mol" },
    { key: "m", x: W * 0.83, frac: m / 2, value: g3(m), unit: "mol/L" },
  ];
  const ops = [`÷ ${SEED.molarMassNaCl} g/mol`, `÷ ${SEED.volume} L`];
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {ops.map((op, i) => {
          const a = nodes[i].x;
          const b = nodes[i + 1].x;
          return (
            <g key={op}>
              <line x1={a + R * 0.5} y1={cy} x2={b - R * 0.5} y2={cy} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeDasharray="4 4" />
              <path d={`M ${b - R * 0.5 - 8} ${cy - 5} L ${b - R * 0.5} ${cy} L ${b - R * 0.5 - 8} ${cy + 5}`} fill="none" style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeLinecap="round" />
              <text x={(a + b) / 2} y={16} fontWeight={700} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                {op}
              </text>
            </g>
          );
        })}
        {nodes.map((nd) => {
          const r = R * (0.45 + 0.55 * Math.sqrt(clamp(nd.frac, 0, 1)));
          const on = hover === nd.key;
          return (
            <g key={nd.key} onPointerEnter={() => setHover(nd.key)} onPointerLeave={() => setHover(null)}>
              <circle cx={nd.x} cy={cy} r={r} style={{ fill: nd.key === "m" ? liquidCss(m) : nd.key === "n" ? "var(--chem-solute)" : "var(--chem-stock)", fillOpacity: 0.85, ...lit(on || nd.key === "m") }} />
              <text x={nd.x} y={cy + R + 22} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
                {`${nd.value} ${nd.unit}`}
              </text>
            </g>
          );
        })}
        <line x1={X0} y1={railY} x2={X1} y2={railY} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} strokeLinecap="round" />
        <line x1={X0} y1={railY} x2={xm(s.value)} y2={railY} style={{ stroke: "var(--chem-stock)" }} strokeWidth={5} strokeLinecap="round" />
      </svg>
      <SvgHandle x={xm(s.value)} y={railY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mol-c1-handle" />
    </div>
  );
}

// ── 3. c = n / V curve ────────────────────────────────────────────────────────────────
export function MolCurveCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.curve");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SEED.volume, { min: 0.2, max: 5, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const n = SEED.moles;
  const c = n / s.value;
  const valueText = `V = ${g3(s.value)} L`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowN"), value: `${g3(n)} mol` },
    { key: "v", label: t("rowV"), value: `${g3(s.value)} L` },
    { key: "c", label: "c = n / V", value: `${g3(c)} mol/L`, isKey: true },
    { key: "mmol", label: t("rowMmol"), value: `${g3(c * 1000)} mmol/L` },
    { key: "double", label: t("rowDouble"), value: `${g3(n / (2 * s.value))} mol/L` },
    { key: "half", label: t("rowHalf"), value: `${g3(n / (s.value / 2))} mol/L` },
    { key: "check", label: "c × V", value: `${g3(c * s.value)} mol` },
  ];
  return (
    <IndicatorCard
      idPrefix="mol"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { v: ltr(g3(s.value)), c: ltr(g3(c)) })}
      controls={<KitControls s={s} valueText={valueText} testId="mol-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={0}
      visual={<MolCurveDrawing s={s} valueText={valueText} hover={hover} />}
    />
  );
}

/** Card 3's drawing; it owns its measured box, svg ref and drag so the phone mini copy (PhoneMini) gets its own. */
function MolCurveDrawing({ s, valueText, hover }: { s: Stepper; valueText: string; hover: string | null }) {
  const t = useTranslations("tools.molarity-calculator.visuals.curve");
  const HMIN = 272;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const n = SEED.moles;
  const X0 = 34;
  const X1 = W - 14;
  const Y0 = H - 42;
  const Y1 = 34;
  const YMAX = 2.5;
  const xv = (v: number) => X0 + (v / 5) * (X1 - X0);
  const yc = (c: number) => Y0 - (Math.min(c, YMAX) / YMAX) * (Y0 - Y1);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * 5));
  const pts: string[] = [];
  for (let v = n / YMAX; v <= 5.0001; v += 0.02) pts.push(`${xv(v).toFixed(1)},${yc(n / v).toFixed(1)}`);
  const c = n / s.value;
  const on = hover === "c" || hover === "v";
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${valueText}, ${g3(c)} mol/L`}>
        {[0, 0.5, 1, 1.5, 2, 2.5].map((g, gi) => (
          <g key={g}>
            <line x1={X0} y1={yc(g)} x2={X1} y2={yc(g)} style={{ stroke: "var(--ph-grid)" }} strokeWidth={1} />
            <text x={X0 - 8} y={yc(g) + 4} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {g}
            </text>
            <text x={xv(gi)} y={Y0 + 18} textAnchor={gi === 0 ? "start" : gi === 5 ? "end" : "middle"} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {gi}
            </text>
          </g>
        ))}
        <text x={X1} y={Y0 + 36} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
          {t("axisV")}
        </text>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} strokeLinecap="round" />
        <polyline points={pts.join(" ")} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={xv(s.value)} y1={yc(c)} x2={xv(s.value)} y2={Y0} style={{ stroke: "var(--ph-focus)", opacity: on ? 0.9 : 0.45 }} strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={X0} y1={yc(c)} x2={xv(s.value)} y2={yc(c)} style={{ stroke: "var(--ph-focus)", opacity: on ? 0.9 : 0.45 }} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={X0 + 6} y={14} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
          {`${g3(s.value)} L → ${g3(c)} mol/L`}
        </text>
      </svg>
      <SvgHandle x={xv(s.value)} y={yc(c)} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mol-c3-handle" />
    </div>
  );
}

// ── 5. Serial dilution tubes ──────────────────────────────────────────────────────────
export function MolSerialCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.serial");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(1, { min: 0, max: SERIAL_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 226;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const c0 = SEED.molarity;
  const c = c0 / 10 ** s.value;
  const X0 = 30;
  const X1 = W - 30;
  const gap = (X1 - X0) / SERIAL_MAX;
  const tw = Math.min(30, gap * 0.55);
  const top = 40;
  const railY = H - 24;
  const bottom = railY - 34;
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set((px - X0) / gap));
  const valueText = `${t("step")} ${s.value}`;
  const rows: KitRow[] = [
    { key: "k", label: t("rowK"), value: String(s.value) },
    { key: "factor", label: t("rowFactor"), value: s.value === 0 ? "1" : `1 : ${(10 ** s.value).toLocaleString("en-US")}` },
    { key: "c", label: t("rowC"), value: `${sciText(c)} mol/L`, isKey: true },
    { key: "mmol", label: t("rowMmol"), value: `${g3(c * 1000)} mmol/L` },
    { key: "tube", label: t("rowTube"), value: `${sciText(c * 0.01)} mol` },
    { key: "water", label: t("rowWater"), value: `${s.value * 9} mL` },
  ];
  return (
    <IndicatorCard
      idPrefix="mol"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle", { c: ltr(g3(c0)) })}
      caption={t("caption", { k: ltr(String(s.value)), c: ltr(sciText(c)) })}
      controls={<KitControls s={s} valueText={valueText} testId="mol-c5" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${sciText(c)} mol/L`}>
            {Array.from({ length: SERIAL_MAX + 1 }, (_, i) => {
              const x = X0 + i * gap;
              const sel = i === s.value;
              const level = top + (bottom - top) * 0.3;
              return (
                <g key={i}>
                  <rect x={x - tw / 2 + 2} y={level} width={tw - 4} height={bottom - level - 2} rx={(tw - 4) / 2} style={{ fill: liquidCss(c0 / 10 ** i) }} />
                  <rect x={x - tw / 2} y={top} width={tw} height={bottom - top} rx={tw / 2} fill="none" style={lit(sel)} />
                  <text x={x} y={bottom + 18} fontWeight={sel ? 800 : 500} textAnchor="middle" style={{ fontSize: svgPx(sel ? 12 : 12), fill: "var(--ph-ink)" }}>
                    {i}
                  </text>
                </g>
              );
            })}
            <text x={X0} y={18} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
              <SvgChem text={`${sciText(c)} mol/L`} />
            </text>
            <line x1={X0} y1={railY} x2={X1} y2={railY} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} strokeLinecap="round" />
          </svg>
          <SvgHandle x={X0 + s.value * gap} y={railY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mol-c5-handle" />
        </div>
      }
    />
  );
}

// ── 6. Log ruler of real solutions ────────────────────────────────────────────────────
const LOG_MIN = -3;
const LOG_MAX = 1.5;
export function MolRulerCard({ side }: { side: Side }) {
  const svgId = useId();
  const t = useTranslations("tools.molarity-calculator.visuals.ruler");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(referenceSeedIndex(), { min: 0, max: REFERENCE.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 204;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 22;
  const X1 = W - 22;
  const axisY = H / 2 - 4;
  // Rounded: Math.log10 can differ in the last bit between server and browser (hydration).
  const xl = (m: number) => Math.round((X0 + ((Math.log10(m) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0)) * 100) / 100;
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => {
    let best = 0;
    REFERENCE.forEach((r, i) => {
      if (Math.abs(xl(r.molarity) - px) < Math.abs(xl(REFERENCE[best].molarity) - px)) best = i;
    });
    s.set(best);
  });
  const sel = REFERENCE[s.value];
  const name = t(`items.${sel.key}`);
  const valueText = `${name} · ${g3(sel.molarity)} M`;
  const rows: KitRow[] = [
    { key: "name", label: t("rowName"), value: name },
    { key: "formula", label: t("rowFormula"), value: sel.formula },
    { key: "m", label: t("rowM"), value: `${g3(sel.molarity)} mol/L`, isKey: true },
    { key: "mmol", label: t("rowMmol"), value: `${g3(sel.molarity * 1000)} mmol/L` },
    { key: "log", label: "log₁₀ M", value: Math.log10(sel.molarity).toFixed(2) },
    { key: "saline", label: t("rowSaline"), value: `× ${g3(sel.molarity / 0.154)}` },
  ];
  const decades = [-3, -2, -1, 0, 1];
  const decadeText = (d: number) => (d === -3 ? "1 mM" : d === -2 ? "10 mM" : d === -1 ? "0.1 M" : d === 0 ? "1 M" : "10 M");
  return (
    <IndicatorCard
      idPrefix="mol"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { name, m: ltr(g3(sel.molarity)) })}
      controls={<KitControls s={s} valueText={`${s.value + 1} / ${REFERENCE.length}`} testId="mol-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <defs>
              <linearGradient id={`${svgId}mol-ruler`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--chem-solvent)" }} />
                <stop offset="100%" style={{ stopColor: "var(--chem-tint)" }} />
              </linearGradient>
            </defs>
            <rect x={X0 - 8} y={axisY - 7} width={X1 - X0 + 16} height={14} rx={7} fill={`url(#${svgId}mol-ruler)`} style={{ stroke: "var(--ph-line)" }} />
            {decades.map((d) => (
              <g key={d}>
                <line x1={xl(10 ** d)} y1={axisY + 9} x2={xl(10 ** d)} y2={axisY + 16} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} />
                <text x={xl(10 ** d)} y={axisY + 30} textAnchor={d === -3 ? "start" : "middle"} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  {decadeText(d)}
                </text>
              </g>
            ))}
            {REFERENCE.map((r, i) => {
              const on = i === s.value;
              // Three label rows: neighbours a fraction of a decade apart never share a row.
              const x = xl(r.molarity);
              const y = axisY - 24 - (i % 3) * 20;
              return (
                <g key={r.key}>
                  <line x1={x} y1={axisY - 7} x2={x} y2={y + 4} style={{ stroke: on ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={on ? 2 : 1} />
                  <circle cx={x} cy={axisY} r={on ? 7 : 5} style={{ fill: "var(--ph-knob)", ...lit(on) }} />
                  <text x={x} y={y} fontWeight={on ? 800 : 600} textAnchor={x < X0 + 20 ? "start" : x > X1 - 20 ? "end" : "middle"} style={{ fontSize: svgPx(on ? 12.5 : 12), fill: "var(--ph-ink)" }}>
                    {g3(r.molarity)}
                  </text>
                </g>
              );
            })}
            {/* Callout under the scale: the selected solution, kept inside the box. */}
            <text x={clamp(xl(sel.molarity), X0 + 80, X1 - 80)} y={H - 12} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
              {name}
            </text>
          </svg>
          <SvgHandle x={xl(sel.molarity)} y={axisY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mol-c6-handle" />
        </div>
      }
    />
  );
}

// ── 8. Stock / water donut ────────────────────────────────────────────────────────────
export function MolDonutCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.donut");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const C1 = SEED.c1;
  const V2 = SEED.v2;
  const s = useStepper(SEED.c2, { min: 0.1, max: C1, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const v1 = (s.value * V2) / C1;
  const frac = v1 / V2;
  const r = Math.min(H / 2 - 24, W * 0.26);
  const cx = Math.min(W / 2, r + 30);
  const cy = H / 2;
  const a = -Math.PI / 2 + frac * 2 * Math.PI;
  const end: [number, number] = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const arc = (from: number, to: number) => {
    const a0 = -Math.PI / 2 + from * 2 * Math.PI;
    const a1 = -Math.PI / 2 + to * 2 * Math.PI;
    return `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${to - from > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
  };
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px, py) => {
    let f = (Math.atan2(py - cy, px - cx) + Math.PI / 2) / (2 * Math.PI);
    if (f < 0) f += 1;
    s.set(f * C1);
  });
  const lx = cx + r + 34;
  const valueText = `C₂ = ${g3(s.value)} mol/L`;
  const rows: KitRow[] = [
    { key: "c1", label: t("rowC1"), value: `${g3(C1)} mol/L` },
    { key: "v2", label: t("rowV2"), value: `${g3(V2)} L` },
    { key: "c2", label: t("rowC2"), value: `${g3(s.value)} mol/L` },
    { key: "v1", label: "V₁ = C₂V₂ / C₁", value: `${g3(v1 * 1000)} mL`, isKey: true },
    { key: "water", label: t("rowWater"), value: `${g3((V2 - v1) * 1000)} mL` },
    { key: "pct", label: t("rowPct"), value: `${g3(frac * 100)} %` },
    { key: "ratio", label: t("rowRatio"), value: `1 : ${g3(C1 / s.value)}` },
  ];
  const showLegend = W - lx > 110;
  return (
    <IndicatorCard
      idPrefix="mol"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { c2: ltr(g3(s.value)), v1: ltr(g3(v1 * 1000)), water: ltr(g3((V2 - v1) * 1000)) })}
      controls={<KitControls s={s} valueText={valueText} testId="mol-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--chem-solvent)" }} strokeWidth={hover === "water" ? 30 : 24} />
            {frac > 0.999 ? (
              <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--chem-stock)" }} strokeWidth={hover === "v1" ? 30 : 24} />
            ) : (
              <path d={arc(0, frac)} fill="none" style={{ stroke: "var(--chem-stock)" }} strokeWidth={hover === "v1" ? 30 : 24} strokeLinecap="butt" />
            )}
            <text x={cx} y={cy - 2} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(18), fill: "var(--ph-ink)" }}>
              {`${g3(v1 * 1000)} mL`}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              <SvgChem text="V₁" />
            </text>
            {showLegend && (
              <g>
                <circle cx={lx} cy={cy - 20} r={7} style={{ fill: "var(--chem-stock)" }} />
                <text x={lx + 14} y={cy - 16} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                  {`${t("stock")} ${g3(v1 * 1000)} mL`}
                </text>
                <circle cx={lx} cy={cy + 14} r={7} style={{ fill: "var(--chem-solvent)", stroke: "var(--ph-line)" }} />
                <text x={lx + 14} y={cy + 18} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                  {`${t("water")} ${g3((V2 - v1) * 1000)} mL`}
                </text>
              </g>
            )}
          </svg>
          <SvgHandle x={end[0]} y={end[1]} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mol-c8-handle" />
        </div>
      }
    />
  );
}
