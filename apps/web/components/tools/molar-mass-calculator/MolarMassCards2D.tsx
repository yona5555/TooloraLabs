"use client";
import { useRef, useState, useId } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, SvgHandle, useMeasuredSize, useStepper, useSvgDrag, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { g3, sciText } from "../molarity-calculator/molMath";
import { uniFormula } from "../chemical-equation-balancer/chemMath";
import {
  AVOGADRO,
  CL35,
  CL35_NATURAL,
  CL37,
  clWeight,
  COMPOUNDS,
  countsMass,
  LOG_N_MAX,
  LOG_N_MIN,
  LOG_N_SEED,
  PARSE_FORMULA,
  parseSteps,
  partsOf,
  WATER_M,
} from "./mmMath";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The five 2D molar mass indicator cards. Each drawing is laid out in real pixels at the measured
 * width of its box (viewBox = box), so labels keep their size on a phone and marks span the box.
 */
type Side = "visual-left" | "table-left";
const W0 = 520;
const elFill = (el: string) => `var(--chem-el-${el.toLowerCase()}, var(--chem-el-other))`;
const f3 = (v: number) => String(Number(v.toFixed(3)));

// ── 2. Chlorine isotopes on a balance: the fulcrum is the atomic weight ───────────────
export function MmIsotopesCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.isotopes");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(CL35_NATURAL, { min: 0, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const p35 = s.value;
  const w = clWeight(p35);
  const M0 = 34.5;
  const M1 = 37.5;
  const X0 = 30;
  const X1 = W - 30;
  const xm = (m: number) => X0 + ((m - M0) / (M1 - M0)) * (X1 - X0);
  const beamY = H * 0.5;
  const axisY = H - 40;
  const ref = useRef<SVGSVGElement>(null);
  // Dragging the fulcrum sets the abundance that would balance the beam there.
  const drag = useSvgDrag(ref, W, H, (px) => {
    const m = M0 + ((px - X0) / (X1 - X0)) * (M1 - M0);
    s.set(((CL37 - m) / (CL37 - CL35)) * 100);
  });
  const rMax = Math.min(46, H * 0.18);
  const r35 = Math.max(4, rMax * Math.sqrt(p35 / 100));
  const r37 = Math.max(4, rMax * Math.sqrt((100 - p35) / 100));
  const valueText = `${p35} % ³⁵Cl`;
  const rows: KitRow[] = [
    { key: "p35", label: t("rowP35"), value: `${p35} %` },
    { key: "p37", label: t("rowP37"), value: `${100 - p35} %` },
    { key: "m35", label: t("rowM35"), value: `${f3(CL35)} u` },
    { key: "m37", label: t("rowM37"), value: `${f3(CL37)} u` },
    { key: "w", label: t("rowWeight"), value: `${f3(w)} g/mol`, isKey: true },
    { key: "iupac", label: t("rowIupac"), value: "35.45 g/mol" },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { p: ltr(String(p35)), w: ltr(f3(w)) })}
      controls={<KitControls s={s} valueText={valueText} testId="mm-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <line x1={X0} y1={axisY} x2={X1} y2={axisY} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} />
            {[35, 36, 37].map((m) => (
              <g key={m}>
                <line x1={xm(m)} y1={axisY - 5} x2={xm(m)} y2={axisY + 5} style={{ stroke: "var(--ph-line)" }} />
                <text x={xm(m)} y={axisY + 20} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  {`${m} u`}
                </text>
              </g>
            ))}
            <line x1={xm(CL35)} y1={beamY} x2={xm(CL37)} y2={beamY} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
            {[
              { key: "m35", m: CL35, r: r35, label: "³⁵Cl", pct: p35, fill: "var(--chem-el-cl)" },
              { key: "m37", m: CL37, r: r37, label: "³⁷Cl", pct: 100 - p35, fill: "var(--chem-gas)" },
            ].map((b) => (
              <g key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)}>
                <line x1={xm(b.m)} y1={beamY} x2={xm(b.m)} y2={beamY - 14} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} />
                <circle cx={xm(b.m)} cy={beamY - 14 - b.r} r={b.r} style={{ fill: b.fill, stroke: hover === b.key ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={hover === b.key ? 2.5 : 1} />
                <text x={xm(b.m)} y={Math.max(16, beamY - 22 - 2 * b.r)} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
                  <SvgChem text={`${b.label} · ${b.pct} %`} />
                </text>
              </g>
            ))}
            <path d={`M ${xm(w)} ${beamY + 3} l -14 26 l 28 0 z`} style={{ fill: "var(--ph-accent-strong)" }} />
            <line x1={xm(w)} y1={beamY + 29} x2={xm(w)} y2={axisY} style={{ stroke: "var(--ph-focus)" }} strokeDasharray="4 4" />
            <text x={xm(w)} y={beamY + 46} fontWeight={800} textAnchor={xm(w) > W - 80 ? "end" : xm(w) < 80 ? "start" : "middle"} style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
              {`${f3(w)} u`}
            </text>
          </svg>
          <SvgHandle x={xm(w)} y={axisY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mm-c2-handle" />
        </div>
      }
    />
  );
}

// ── 4. Mass composition as one stacked bar ────────────────────────────────────────────
export function MmCompositionCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.composition");
  const tn = useTranslations("tools.molar-mass-calculator.visuals.compounds");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(0, { min: 0, max: COMPOUNDS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const cp = COMPOUNDS[s.value];
  const pr = partsOf(cp.formula);
  const parts = pr?.parts ?? [];
  const valueText = `${tn(cp.key)} · ${uniFormula(cp.formula)}`;
  const rows: KitRow[] = [
    ...parts.map((pt) => ({ key: pt.symbol, label: `${pt.symbol} (${pt.pct.toFixed(1)} %): ${pt.count} × ${f3(pt.atomicMass)}`, value: f3(pt.subtotal) })),
    { key: "total", label: t("rowTotal"), value: `${f3(pr?.total ?? 0)} g/mol`, isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { name: tn(cp.key), f: ltr(uniFormula(cp.formula)), m: ltr(f3(pr?.total ?? 0)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mm-c4-handle" ticks={[0, COMPOUNDS.length - 1].map((i) => ({ at: i, text: `${i + 1}` }))} />
          <KitControls s={s} valueText={`${s.value + 1} / ${COMPOUNDS.length} · ${uniFormula(cp.formula)}`} testId="mm-c4" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={0}
      visual={<MmCompositionDrawing parts={parts} heading={`${uniFormula(cp.formula)} · ${f3(pr?.total ?? 0)} g/mol`} valueText={valueText} hover={hover} setHover={setHover} />}
    />
  );
}

/** Card 4's drawing; it owns its measured box so the phone mini copy (PhoneMini) measures its own. */
function MmCompositionDrawing({ parts, heading, valueText, hover, setHover }: { parts: NonNullable<ReturnType<typeof partsOf>>["parts"]; heading: string; valueText: string; hover: string | null; setHover: (k: string | null) => void }) {
  const HMIN = 210;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 16;
  const X1 = W - 16;
  const barY = H * 0.42;
  const barH = Math.min(64, H * 0.3);
  const before = (i: number) => parts.slice(0, i).reduce((a, q) => a + q.pct, 0);
  const segs = parts.map((pt, i) => ({ pt, x: X0 + ((X1 - X0) * before(i)) / 100, w: ((X1 - X0) * pt.pct) / 100 }));
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        <text x={W / 2} y={28} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(16), fill: "var(--ph-ink)" }}>
          <SvgChem text={heading} />
        </text>
        {segs.map(({ pt, x, w }, i) => {
          const on = hover === pt.symbol;
          const wide = w > 54;
          return (
            <g key={pt.symbol} onPointerEnter={() => setHover(pt.symbol)} onPointerLeave={() => setHover(null)}>
              <rect x={x} y={barY} width={Math.max(1, w - 1.5)} height={barH} rx={i === 0 || i === segs.length - 1 ? 8 : 0} style={{ fill: elFill(pt.symbol), stroke: on ? "var(--ph-focus)" : "none" }} strokeWidth={on ? 3 : 0} />
              {wide && (
                <text x={x + w / 2} y={barY + barH / 2 + 5} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(14), fill: "var(--ph-ink)" }}>
                  {pt.symbol}
                </text>
              )}
              <text x={x + w / 2} y={barY + barH + 22 + (wide ? 0 : (i % 2) * 16)} fontWeight={700} textAnchor={x + w / 2 < 40 ? "start" : x + w / 2 > W - 40 ? "end" : "middle"} style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
                {`${wide ? "" : `${pt.symbol} `}${pt.pct.toFixed(1)} %`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── 5. Moles in the same sample mass, ranked ──────────────────────────────────────────
export function MmRankedCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.ranked");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(10, { min: 1, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const list = COMPOUNDS.map((c) => ({ ...c, n: s.value / c.mm })).sort((a, b) => b.n - a.n);
  const valueText = `${s.value} g`;
  const rows: KitRow[] = [
    { key: "m", label: t("rowMass"), value: `${s.value} g` },
    ...list.map((c, i) => ({ key: c.formula, label: `n(${uniFormula(c.formula)}) = m / ${f3(c.mm)}`, value: `${g3(c.n)} mol`, isKey: i === 0 })),
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { m: ltr(String(s.value)), n: ltr(g3(list[0].n)), f: ltr(uniFormula(list[0].formula)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mm-c5-handle" ticks={[1, 50, 100].map((x) => ({ at: x, text: `${x} g` }))} />
          <KitControls s={s} valueText={valueText} testId="mm-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={1}
      visual={<MmRankedDrawing list={list} valueText={valueText} hover={hover} setHover={setHover} />}
    />
  );
}

/** Card 5's drawing; it owns its measured box so the phone mini copy (PhoneMini) measures its own. */
function MmRankedDrawing({ list, valueText, hover, setHover }: { list: Array<(typeof COMPOUNDS)[number] & { n: number }>; valueText: string; hover: string | null; setHover: (k: string | null) => void }) {
  const HMIN = 300;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  // The top-ranked compound spans the full width; the others are drawn to the same scale.
  const nMax = list[0].n;
  const LBL = 96;
  const X0 = 10 + LBL;
  const X1 = W - 70;
  const rowH = (H - 20) / list.length;
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {list.map((c, i) => {
          const y = 10 + i * rowH;
          const w = Math.max(2, ((X1 - X0) * c.n) / nMax);
          const on = hover === c.formula || (hover === null && i === 0);
          return (
            <g key={c.formula} onPointerEnter={() => setHover(c.formula)} onPointerLeave={() => setHover(null)}>
              <text x={X0 - 8} y={y + rowH / 2 + 5} fontWeight={700} textAnchor="end" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
                <SvgChem text={uniFormula(c.formula)} />
              </text>
              <rect x={X0} y={y + rowH * 0.2} width={w} height={rowH * 0.6} rx={rowH * 0.3} style={{ fill: i === 0 ? "var(--chem-product)" : "var(--chem-gas)", opacity: on ? 1 : 0.75, stroke: on ? "var(--ph-focus)" : "none" }} strokeWidth={2} />
              <text x={X0 + w + 8} y={y + rowH / 2 + 5} fontWeight={800} style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
                {`${g3(c.n)} mol`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── 6. Particles on a log scale: where one mole sits ──────────────────────────────────
export function MmAvogadroCard({ side }: { side: Side }) {
  const svgId = useId();
  const t = useTranslations("tools.molar-mass-calculator.visuals.avogadro");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(LOG_N_SEED, { min: LOG_N_MIN, max: LOG_N_MAX, step: 0.05 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 200;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const N = 10 ** s.value;
  const n = N / AVOGADRO;
  const X0 = 24;
  const X1 = W - 24;
  const xl = (e: number) => X0 + ((e - LOG_N_MIN) / (LOG_N_MAX - LOG_N_MIN)) * (X1 - X0);
  const barY = H * 0.55;
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(LOG_N_MIN + ((px - X0) / (X1 - X0)) * (LOG_N_MAX - LOG_N_MIN)));
  const marks = [
    { key: "g", e: Math.log10(AVOGADRO / WATER_M), text: t("markGram") },
    { key: "n", e: LOG_N_SEED, text: t("markMole") },
  ];
  const valueText = `N = ${sciText(N)}`;
  const rows: KitRow[] = [
    { key: "N", label: t("rowN"), value: sciText(N) },
    { key: "na", label: t("rowNa"), value: "6.02214076 × 10²³ mol⁻¹" },
    { key: "n", label: "n = N / Nₐ", value: `${g3(n)} mol`, isKey: true },
    { key: "g", label: t("rowWater"), value: `${g3(n * WATER_M)} g` },
    { key: "log", label: "log₁₀ N", value: s.value.toFixed(2) },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { N: ltr(sciText(N)), n: ltr(g3(n)), g: ltr(g3(n * WATER_M)) })}
      controls={<KitControls s={s} valueText={valueText} testId="mm-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <defs>
              <linearGradient id={`${svgId}mm-c6-bar`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--chem-solvent)" }} />
                <stop offset="100%" style={{ stopColor: "var(--chem-solute)" }} />
              </linearGradient>
            </defs>
            <rect x={X0} y={barY - 9} width={X1 - X0} height={18} rx={9} fill={`url(#${svgId}mm-c6-bar)`} style={{ stroke: "var(--ph-line)" }} />
            {Array.from({ length: LOG_N_MAX - LOG_N_MIN + 1 }, (_, i) => LOG_N_MIN + i).map((e) => (
              <g key={e}>
                <line x1={xl(e)} y1={barY + 11} x2={xl(e)} y2={barY + 17} style={{ stroke: "var(--ph-line)" }} />
                <text x={xl(e)} y={barY + 32} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  <SvgChem text={`10${String(e).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)])}`} />
                </text>
              </g>
            ))}
            {marks.map((m, i) => (
              <g key={m.key} onPointerEnter={() => setHover(m.key)} onPointerLeave={() => setHover(null)}>
                <line x1={xl(m.e)} y1={barY - 11} x2={xl(m.e)} y2={barY - 30 - i * 22} style={{ stroke: hover === m.key ? "var(--ph-focus)" : "var(--ph-ink)" }} strokeWidth={1.5} />
                <text x={xl(m.e)} y={barY - 35 - i * 22} fontWeight={700} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                  {m.text}
                </text>
              </g>
            ))}
            <text x={W / 2} y={24} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(15), fill: "var(--ph-ink)" }}>
              <SvgChem text={`N = ${sciText(N)} → ${g3(n)} mol`} />
            </text>
          </svg>
          <SvgHandle x={xl(s.value)} y={barY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mm-c6-handle" />
        </div>
      }
    />
  );
}

// ── 8. The parser reading Al₂(SO₄)₃ token by token (stepped running mass) ─────────────
const STEPS = parseSteps();
export function MmParserCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.parser");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(STEPS.length - 1, { min: 0, max: STEPS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 280;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const st = STEPS[s.value];
  const masses = STEPS.map((x) => countsMass(x.counts));
  const mMax = masses[masses.length - 1];
  // Token pills across the top; the handle sits under the token being read.
  const X0 = 16;
  const X1 = W - 16;
  const tw = (X1 - X0) / STEPS.length;
  const tx = (i: number) => X0 + tw * (i + 0.5);
  const pillY = 18;
  const pillH = 38;
  const sy0 = H - 26;
  const sy1 = pillY + pillH + 66;
  const ys = (m: number) => sy0 - (m / mMax) * (sy0 - sy1);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(Math.floor((px - X0) / tw)));
  const countsText = Object.entries(st.counts)
    .map(([el, n]) => `${el} ${n}`)
    .join(" · ");
  const action = st.note === "element" ? t("actElement") : st.note === "open" ? t("actOpen") : t("actClose", { k: st.token.slice(1) || "1" });
  const valueText = `${s.value + 1} / ${STEPS.length} · ${st.token}`;
  const rows: KitRow[] = [
    { key: "tok", label: t("rowToken"), value: st.token },
    { key: "act", label: t("rowAction"), value: action },
    { key: "cnt", label: t("rowCounts"), value: countsText },
    { key: "m", label: t("rowMass"), value: `${f3(masses[s.value])} g/mol`, isKey: true },
    { key: "f", label: t("rowFinal"), value: `${uniFormula(PARSE_FORMULA)} = ${f3(mMax)} g/mol` },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { tok: ltr(st.token), c: ltr(countsText), m: ltr(f3(masses[s.value])) })}
      controls={<KitControls s={s} valueText={valueText} testId="mm-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {STEPS.map((x, i) => {
              const read = i <= s.value;
              const cur = i === s.value;
              return (
                <g key={i} onPointerEnter={() => setHover("tok")} onPointerLeave={() => setHover(null)}>
                  <rect x={tx(i) - tw / 2 + 3} y={pillY} width={tw - 6} height={pillH} rx={pillH / 2} style={{ fill: cur ? "var(--ph-accent-soft)" : "transparent", stroke: cur ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={cur ? 2.5 : 1} />
                  <text x={tx(i)} y={pillY + pillH / 2 + 6} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(17), fill: read ? "var(--ph-ink)" : "var(--ph-ink-muted)", opacity: read ? 1 : 0.6 }}>
                    <SvgChem text={uniFormula(x.token)} />
                  </text>
                </g>
              );
            })}
            {/* Stepped running mass: one stair per token, the current one highlighted. */}
            <line x1={X0} y1={sy0} x2={X1} y2={sy0} style={{ stroke: "var(--ph-line)" }} />
            {STEPS.map((_, i) => {
              const m = masses[i];
              const on = i === s.value;
              const done = i <= s.value;
              return (
                <g key={i} onPointerEnter={() => setHover("m")} onPointerLeave={() => setHover(null)}>
                  <rect x={tx(i) - tw / 2 + 5} y={ys(m)} width={tw - 10} height={Math.max(2, sy0 - ys(m))} rx={6} style={{ fill: done ? "var(--chem-product)" : "var(--glass-track)", opacity: on ? 1 : done ? 0.6 : 0.5, stroke: on ? "var(--ph-focus)" : "none" }} strokeWidth={2} />
                  <text x={tx(i)} y={ys(m) - 8} fontWeight={on ? 800 : 600} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)", opacity: done ? 1 : 0.55 }}>
                    {Math.round(m)}
                  </text>
                </g>
              );
            })}
          </svg>
          <SvgHandle x={tx(s.value)} y={pillY + pillH + 14} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="mm-c8-handle" />
        </div>
      }
    />
  );
}
