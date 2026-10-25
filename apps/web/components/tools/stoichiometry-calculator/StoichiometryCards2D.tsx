"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, SvgHandle, useMeasuredSize, useStepper, useSvgDrag, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { g3, sciText } from "../molarity-calculator/molMath";
import { uniFormula } from "../chemical-equation-balancer/chemMath";
import { ACIDS, AVOGADRO, M, rd } from "./stoichMath";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The five 2D stoichiometry indicator cards. Each drawing is laid out in real pixels at the measured
 * width of its box (viewBox = box), so labels keep their size on a phone and marks span the box.
 */
type Side = "visual-left" | "table-left";
const W0 = 520;
const lit = (on: boolean) => ({ stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2.5 : 1.25 });

// ── 2. Four number lines: g H₂ → mol H₂ → mol H₂O → g H₂O ─────────────────────────────
const G_MAX = 20;
export function StoLinesCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.lines");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(4, { min: 0.5, max: G_MAX, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 280;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const nH2 = s.value / M.H2;
  const gH2O = nH2 * M.H2O;
  const X0 = 24;
  const X1 = W - 24;
  const axes = [
    { key: "g", max: G_MAX, v: s.value, label: "H₂ (g)", ticks: [0, 5, 10, 15, 20], op: `÷ ${M.H2} g/mol` },
    { key: "n", max: 10, v: nH2, label: "H₂ (mol)", ticks: [0, 2, 4, 6, 8, 10], op: "× 2/2" },
    { key: "n2", max: 10, v: nH2, label: "H₂O (mol)", ticks: [0, 2, 4, 6, 8, 10], op: `× ${g3(M.H2O)} g/mol` },
    { key: "g2", max: 200, v: gH2O, label: "H₂O (g)", ticks: [0, 50, 100, 150, 200], op: "" },
  ];
  const yA = (i: number) => 30 + i * ((H - 60) / 3);
  const xA = (v: number, max: number) => X0 + (v / max) * (X1 - X0);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * G_MAX));
  const valueText = `${g3(s.value)} g H₂`;
  const rows: KitRow[] = [
    { key: "g", label: t("rowGH2"), value: `${g3(s.value)} g` },
    { key: "n", label: "n = m / M (H₂)", value: `${g3(nH2)} mol` },
    { key: "n2", label: t("rowRatio"), value: `${g3(nH2)} mol` },
    { key: "g2", label: t("rowGH2O"), value: `${g3(gH2O)} g`, isKey: true },
    { key: "mm", label: t("rowMolarMasses"), value: `${M.H2} · ${M.H2O} g/mol` },
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { g: ltr(g3(s.value)), n: ltr(g3(nH2)), w: ltr(g3(gH2O)) })}
      controls={<KitControls s={s} valueText={valueText} testId="sto-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <polyline points={axes.map((a, i) => `${xA(a.v, a.max)},${yA(i)}`).join(" ")} fill="none" style={{ stroke: "var(--chem-reactant)" }} strokeWidth={2.5} strokeDasharray="5 4" />
            {axes.map((a, i) => {
              const y = yA(i);
              const on = hover === a.key;
              return (
                <g key={a.key} onPointerEnter={() => setHover(a.key)} onPointerLeave={() => setHover(null)}>
                  <line x1={X0} y1={y} x2={X1} y2={y} style={{ stroke: "var(--ph-line)" }} strokeWidth={on ? 3 : 2} strokeLinecap="round" />
                  {a.ticks.map((tk) => (
                    <g key={tk}>
                      <line x1={xA(tk, a.max)} y1={y - 4} x2={xA(tk, a.max)} y2={y + 4} style={{ stroke: "var(--ph-line)" }} />
                      <text x={xA(tk, a.max)} y={y + 17} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                        {tk}
                      </text>
                    </g>
                  ))}
                  <text x={X0} y={y - 9} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                    <SvgChem text={a.label} />
                  </text>
                  {a.op && (
                    <text x={X1} y={y + 34} fontWeight={700} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                      {`↓ ${a.op}`}
                    </text>
                  )}
                  <circle cx={xA(a.v, a.max)} cy={y} r={7} style={{ fill: i < 2 ? "var(--chem-reactant)" : "var(--chem-product)", ...lit(on || i === 3) }} />
                </g>
              );
            })}
          </svg>
          <SvgHandle x={xA(s.value, G_MAX)} y={yA(0)} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="sto-c2-handle" />
        </div>
      }
    />
  );
}

// ── 3. To completion: moles during 4H₂ + 2O₂ → 4H₂O (lines over progress) ─────────────
export function StoProgressCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.progress");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(50, { min: 0, max: 100, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 40;
  const X1 = W - 16;
  const Y0 = H - 34;
  const Y1 = 20;
  const xp = (p: number) => X0 + (p / 100) * (X1 - X0);
  const yn = (n: number) => Y0 - (n / 4) * (Y0 - Y1);
  const p = s.value / 100;
  const series = [
    { key: "h2", f: "H₂", n: (q: number) => 4 * (1 - q), color: "var(--chem-el-h)" },
    { key: "o2", f: "O₂", n: (q: number) => 2 * (1 - q), color: "var(--chem-el-o)" },
    { key: "h2o", f: "H₂O", n: (q: number) => 4 * q, color: "var(--chem-product)" },
  ];
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * 100));
  const mass = 4 * M.H2 + 2 * M.O2;
  const valueText = `${s.value} %`;
  const rows: KitRow[] = [
    { key: "p", label: t("rowProgress"), value: `${s.value} %` },
    { key: "h2", label: t("rowH2"), value: `${g3(4 * (1 - p))} mol` },
    { key: "o2", label: t("rowO2"), value: `${g3(2 * (1 - p))} mol` },
    { key: "h2o", label: t("rowH2O"), value: `${g3(4 * p)} mol`, isKey: true },
    { key: "mass", label: t("rowMass"), value: `${g3(mass)} g` },
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { p: ltr(String(s.value)), w: ltr(g3(4 * p)) })}
      controls={<KitControls s={s} valueText={valueText} testId="sto-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {[0, 1, 2, 3, 4].map((n) => (
              <g key={n}>
                <line x1={X0} y1={yn(n)} x2={X1} y2={yn(n)} style={{ stroke: "var(--ph-grid)" }} />
                <text x={X0 - 8} y={yn(n) + 4} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  {n}
                </text>
              </g>
            ))}
            {[0, 25, 50, 75, 100].map((q) => (
              <text key={q} x={xp(q)} y={H - 12} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                {`${q} %`}
              </text>
            ))}
            {series.map((sr, i) => (
              <g key={sr.key} onPointerEnter={() => setHover(sr.key)} onPointerLeave={() => setHover(null)}>
                <line x1={xp(0)} y1={yn(sr.n(0))} x2={xp(100)} y2={yn(sr.n(1))} style={{ stroke: sr.color }} strokeWidth={hover === sr.key ? 5 : 3.5} strokeLinecap="round" />
                <circle cx={xp(s.value)} cy={yn(sr.n(p))} r={6.5} style={{ fill: sr.color, stroke: "var(--ph-ink)" }} strokeWidth={1.25} />
                <text x={i === 2 ? xp(100) - 6 : xp(0) + 8} y={yn(sr.n(i === 2 ? 1 : 0)) + (i === 2 ? 18 : i === 0 ? 18 : -8)} fontWeight={800} textAnchor={i === 2 ? "end" : "start"} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                  <SvgChem text={sr.f} />
                </text>
              </g>
            ))}
            <line x1={xp(s.value)} y1={Y1} x2={xp(s.value)} y2={Y0} style={{ stroke: "var(--ph-focus)" }} strokeDasharray="4 4" />
          </svg>
          <SvgHandle x={xp(s.value)} y={Y0} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="sto-c3-handle" />
        </div>
      }
    />
  );
}

// ── 4. Same ratio at any scale: target moles vs known moles (three slopes) ────────────
export function StoSlopesCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.slopes");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(2, { min: 0, max: 5, step: 0.25 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 40;
  const X1 = W - 16;
  const Y0 = H - 34;
  const Y1 = 16;
  const xv = (v: number) => X0 + (v / 5) * (X1 - X0);
  const yv = (v: number) => Y0 - (v / 15) * (Y0 - Y1);
  const lines = [
    { key: "h2o", label: "H₂ → H₂O (2 : 2)", k: 1, color: "var(--chem-product)" },
    { key: "nh3", label: "N₂ → NH₃ (1 : 2)", k: 2, color: "var(--chem-el-n)" },
    { key: "h2", label: "N₂ → H₂ (1 : 3)", k: 3, color: "var(--chem-reactant)" },
  ];
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * 5));
  const x = s.value;
  const valueText = `${g3(x)} mol`;
  const rows: KitRow[] = [
    { key: "x", label: t("rowKnown"), value: `${g3(x)} mol` },
    { key: "h2o", label: "H₂O (× 2/2)", value: `${g3(x)} mol` },
    { key: "nh3", label: "NH₃ (× 2/1)", value: `${g3(2 * x)} mol`, isKey: true },
    { key: "h2", label: "H₂ (× 3/1)", value: `${g3(3 * x)} mol` },
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { x: ltr(g3(x)), a: ltr(g3(2 * x)) })}
      controls={<KitControls s={s} valueText={valueText} testId="sto-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {[0, 5, 10, 15].map((v) => (
              <g key={v}>
                <line x1={X0} y1={yv(v)} x2={X1} y2={yv(v)} style={{ stroke: "var(--ph-grid)" }} />
                <text x={X0 - 8} y={yv(v) + 4} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  {v}
                </text>
              </g>
            ))}
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <text key={v} x={xv(v)} y={H - 12} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                {v}
              </text>
            ))}
            {lines.map((ln, i) => (
              <g key={ln.key} onPointerEnter={() => setHover(ln.key)} onPointerLeave={() => setHover(null)}>
                <line x1={xv(0)} y1={yv(0)} x2={xv(5)} y2={yv(5 * ln.k)} style={{ stroke: ln.color }} strokeWidth={hover === ln.key ? 5 : 3} strokeLinecap="round" />
                <circle cx={xv(x)} cy={yv(x * ln.k)} r={6.5} style={{ fill: ln.color, stroke: "var(--ph-ink)" }} strokeWidth={1.25} />
                <text x={X0 + 8} y={Y1 + 12 + i * 16} fontWeight={700} style={{ fontSize: svgPx(12), fill: ln.color }}>
                  <SvgChem text={ln.label} />
                </text>
              </g>
            ))}
            <line x1={xv(x)} y1={Y1} x2={xv(x)} y2={Y0} style={{ stroke: "var(--ph-focus)" }} strokeDasharray="4 4" />
          </svg>
          <SvgHandle x={xv(x)} y={Y0} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="sto-c4-handle" />
        </div>
      }
    />
  );
}

// ── 5. Richter's equivalents: acid needed to neutralise NaOH (lollipops) ──────────────
export function StoNeutralCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.neutral");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(10, { min: 1, max: 20, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const n = s.value / M.NaOH;
  const valueText = `${s.value} g NaOH`;
  const rows: KitRow[] = [
    { key: "naoh", label: t("rowNaOH"), value: `${g3(s.value)} g` },
    { key: "n", label: t("rowMol"), value: `${g3(n)} mol` },
    ...ACIDS.map((a) => ({ key: a.formula, label: uniFormula(a.formula), value: `${g3(n * a.perBase * a.mm)} g`, isKey: a.formula === "HCl" })),
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { g: ltr(g3(s.value)), hcl: ltr(g3(n * M_HCL())), h2so4: ltr(g3(n * 0.5 * M_H2SO4())) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="sto-c5-handle" ticks={[1, 10, 20].map((x) => ({ at: x, text: `${x} g` }))} />
          <KitControls s={s} valueText={valueText} testId="sto-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <PhoneMini slot={1} title={t("title")}>
          <StoNeutralVisual value={s.value} hover={hover} setHover={setHover} />
        </PhoneMini>
      }
    />
  );
}
/** Card 5's drawing, which measures its own box: the phone mini card copy then never takes over the original's box. */
function StoNeutralVisual({ value, hover, setHover }: { value: number; hover: string | null; setHover: (k: string | null) => void }) {
  const HMIN = 240;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const n = value / M.NaOH;
  const items = ACIDS.map((a) => ({ ...a, g: n * a.perBase * a.mm })).sort((p, q) => q.g - p.g);
  const LX = 92;
  const X1 = W - 70;
  const gMax = (20 / M.NaOH) * Math.max(...ACIDS.map((a) => a.perBase * a.mm));
  const xg = (g: number) => LX + (g / gMax) * (X1 - LX);
  const rowY = (i: number) => 24 + i * ((H - 48) / (items.length - 1));
  const valueText = `${value} g NaOH`;
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {items.map((it, i) => {
          const y = rowY(i);
          const on = hover === it.formula;
          return (
            <g key={it.formula} onPointerEnter={() => setHover(it.formula)} onPointerLeave={() => setHover(null)}>
              <text x={LX - 12} y={y + 4} fontWeight={800} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                <SvgChem text={uniFormula(it.formula)} />
              </text>
              <line x1={LX} y1={y} x2={X1} y2={y} style={{ stroke: "var(--ph-grid)" }} strokeWidth={2} strokeLinecap="round" />
              <line x1={LX} y1={y} x2={xg(it.g)} y2={y} style={{ stroke: "var(--chem-reactant)" }} strokeWidth={on ? 5 : 3.5} strokeLinecap="round" />
              <circle cx={xg(it.g)} cy={y} r={on ? 10 : 8} style={{ fill: "var(--chem-reactant)", ...lit(on) }} />
              <text x={xg(it.g) + 14} y={y + 4} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                {`${g3(it.g)} g`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
const M_HCL = () => ACIDS.find((a) => a.formula === "HCl")!.mm;
const M_H2SO4 = () => ACIDS.find((a) => a.formula === "H2SO4")!.mm;

// ── 7. The molar-mass bridge: grams of water on a moles dial ──────────────────────────
const DIAL_MAX = 5;
export function StoDialCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.dial");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const step = 0.1 * M.H2O;
  const s = useStepper(2 * M.H2O, { min: step, max: DIAL_MAX * M.H2O, step });
  const [hover, setHover] = useState<string | null>(null);
  const n = s.value / M.H2O;
  const valueText = `${g3(s.value)} g H₂O`;
  const rows: KitRow[] = [
    { key: "g", label: t("rowGrams"), value: `${g3(s.value)} g` },
    { key: "mm", label: t("rowMolarMass"), value: `${g3(M.H2O)} g/mol` },
    { key: "n", label: "n = m / M", value: `${g3(n)} mol`, isKey: true },
    { key: "molecules", label: t("rowMolecules"), value: sciText(n * AVOGADRO) },
    { key: "ml", label: t("rowMl"), value: `≈ ${g3(s.value)} mL` },
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { g: ltr(g3(s.value)), n: ltr(g3(n)) })}
      controls={<KitControls s={s} valueText={valueText} testId="sto-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <PhoneMini slot={0} title={t("title")}>
          <StoDialVisual s={s} setHover={setHover} />
        </PhoneMini>
      }
    />
  );
}

/** Card 7's drawing, which owns its box and drag target: the phone mini card copy then never takes over the original's. */
function StoDialVisual({ s, setHover }: { s: Stepper; setHover: (k: string | null) => void }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.dial");
  const HMIN = 250;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const n = s.value / M.H2O;
  const R = Math.min(W / 2 - 40, H - 70);
  const cx = W / 2;
  const cy = H - 40;
  const ang = (v: number) => Math.PI * (1 - v / DIAL_MAX);
  const pt = (v: number, r: number) => [rd(cx + r * Math.cos(ang(v))), rd(cy - r * Math.sin(ang(v)))] as const;
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px, py) => {
    const a = Math.atan2(cy - py, px - cx);
    s.set((1 - Math.min(Math.PI, Math.max(0, a)) / Math.PI) * DIAL_MAX * M.H2O);
  });
  const [hx, hy] = pt(n, R);
  const [nx, ny] = pt(n, R - 50); // stops short of the mole numbers
  const arc = (v0: number, v1: number, r: number) => {
    const [x0, y0] = pt(v0, r);
    const [x1, y1] = pt(v1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const valueText = `${g3(s.value)} g H₂O`;
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        <path d={arc(0, DIAL_MAX, R)} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={16} strokeLinecap="round" />
        <path d={arc(0, Math.max(0.001, n), R)} fill="none" style={{ stroke: "var(--chem-product)" }} strokeWidth={16} strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((v) => {
          const [tx, ty] = pt(v, R - 30);
          const [gx, gy] = pt(v, R + 22);
          return (
            <g key={v}>
              <text x={tx} y={ty + 4} fontWeight={700} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                {`${v}`}
              </text>
              <text x={gx} y={gy + 4} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                {`${Math.round(v * M.H2O)} g`}
              </text>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} strokeLinecap="round" onPointerEnter={() => setHover("n")} onPointerLeave={() => setHover(null)} />
        <circle cx={cx} cy={cy} r={7} style={{ fill: "var(--ph-ink)" }} />
        <text x={cx} y={cy + 26} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(15), fill: "var(--ph-ink)" }}>
          {`${g3(n)} mol`}
        </text>
      </svg>
      <SvgHandle x={hx} y={hy} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="sto-c7-handle" />
    </div>
  );
}
