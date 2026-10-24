"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, SvgChem, KitTable, KitTrack, SvgHandle, useMeasuredSize, useStepper, useSvgDrag, type KitRow, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { clamp, f1, f2, ratio, sci, sup } from "@/components/tool-ui/indicator-kit/format";
import { classify, DYES, dyeCss, dyeForm, EQUIVALENCE_ML, ions, KW_SEED_INDEX, KW_TABLE, PH_SEED, TITRATION, titrationPh, titrationSeed } from "./phMath";

/**
 * The five 2D indicator cards. Each drawing is laid out in real pixels at the measured width of
 * its box (viewBox = box), so labels keep their size on a phone and the marks span the whole box.
 */
type Side = "visual-left" | "table-left";
const lit = (on: boolean) => ({ stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2.5 : 1 });
const W0 = 520;

// ── 1. Log ladder ─────────────────────────────────────────────────────────────────────
export function PhLogLadderCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.ladder");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(PH_SEED, { min: 0, max: 14, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 300;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const top = 12;
  const gap = (H - top * 2) / 14;
  const y = (p: number) => top + p * gap;
  const RAIL = W - 24;
  const XB = 56;
  const maxLen = Math.max(60, W - XB - 150);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (_x, py) => s.set((py - top) / gap));
  const x = ions(s.value);
  const valueText = `pH ${f2(s.value)}`;
  const water = x.h / 1e-7;
  const rows: KitRow[] = [
    { key: "cur", label: t("rowPh"), value: f2(s.value) },
    { key: "cur-h", label: t("rowH"), value: `${sci(x.h)} M`, isKey: true },
    { key: "up", label: t("rowUp"), value: s.value >= 1 ? `${sci(x.h * 10)} M` : "—" },
    { key: "down", label: t("rowDown"), value: s.value <= 13 ? `${sci(x.h / 10)} M` : "—" },
    { key: "water", label: t("rowWater"), value: water >= 1 ? `× ${ratio(water)}` : `÷ ${ratio(1 / water)}` },
    { key: "poh", label: "pOH", value: f2(x.pOH) },
    { key: "oh", label: "[OH⁻]", value: `${sci(x.oh)} M` },
    { key: "class", label: t("rowClass"), value: tc(classify(s.value)) },
  ];
  const near = (p: number, v: number) => Math.abs(p - v) < 0.26;
  return (
    <IndicatorCard
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { pH: ltr(f2(s.value)), h: ltr(sci(x.h)) })}
      controls={<KitControls s={s} valueText={valueText} testId="ph-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <line x1={RAIL} y1={y(0)} x2={RAIL} y2={y(14)} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} strokeLinecap="round" />
            {Array.from({ length: 15 }, (_, p) => {
              const len = 20 + ((14 - p) / 14) * (maxLen - 20);
              const cur = near(p, s.value);
              const on = (hover === "cur" || hover === "cur-h") && cur ? true : (hover === "up" && near(p, s.value - 1)) || (hover === "down" && near(p, s.value + 1));
              return (
                <g key={p}>
                  <text x={8} y={y(p) + 4} fontSize={11.5} fontWeight={cur ? 800 : 500} style={{ fill: "var(--ph-ink)" }}>
                    {`pH ${p}`}
                  </text>
                  <line x1={XB} y1={y(p)} x2={XB + len} y2={y(p)} strokeWidth={cur || on ? 11 : 8} strokeLinecap="round" style={{ stroke: `var(--ph-ui-${p})` }} />
                  {(cur || on) && <line x1={XB} y1={y(p)} x2={XB + len} y2={y(p)} strokeWidth={15} strokeLinecap="round" style={{ stroke: "var(--ph-focus)", opacity: 0.3 }} />}
                  <text x={XB + len + 8} y={y(p) + 4} fontSize={11} style={{ fill: "var(--ph-ink-muted)" }}>
                    <SvgChem text={`10${p === 0 ? "⁰" : sup(-p)}`} />
                  </text>
                </g>
              );
            })}
            {s.value >= 0.5 && (
              <text x={RAIL - 16} y={y(s.value - 0.5) + 4} fontSize={11} fontWeight={800} textAnchor="end" style={{ fill: "var(--ph-acid)" }}>
                ×10 ↑
              </text>
            )}
            {s.value <= 13.5 && (
              <text x={RAIL - 16} y={y(s.value + 0.5) + 4} fontSize={11} fontWeight={800} textAnchor="end" style={{ fill: "var(--ph-base)" }}>
                ÷10 ↓
              </text>
            )}
          </svg>
          <SvgHandle x={RAIL} y={y(s.value)} viewW={W} viewH={H} direction="vertical" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="ph-c1-handle" />
        </div>
      }
    />
  );
}

// ── 2. Titration curve ────────────────────────────────────────────────────────────────
export function PhTitrationCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.titration");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(titrationSeed(), { min: 0, max: TITRATION.maxMl, step: TITRATION.step });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 262;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 34;
  const X1 = W - 14;
  const Y0 = H - 42;
  const Y1 = 34; // the title row (pH · live readout) sits above the 14 gridline
  const xv = (v: number) => X0 + (v / TITRATION.maxMl) * (X1 - X0);
  const yp = (p: number) => Y0 - (p / 14) * (Y0 - Y1);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * TITRATION.maxMl));
  const pts: string[] = [];
  for (let v = 0; v <= 50.0001; v += v > 23 && v < 27 ? 0.02 : 0.25) pts.push(`${xv(v).toFixed(2)},${yp(titrationPh(v)).toFixed(2)}`);
  const pH = titrationPh(s.value);
  const acidMol = TITRATION.acidM * TITRATION.acidMl * 1e-3;
  const baseMol = TITRATION.baseM * s.value * 1e-3;
  const total = (TITRATION.acidMl + s.value) * 1e-3;
  const region = Math.abs(s.value - EQUIVALENCE_ML) < 1e-9 ? "at" : s.value < EQUIVALENCE_ML ? "before" : "after";
  const excess = region === "at" ? t("none") : region === "before" ? `H⁺ ${sci((acidMol - baseMol) / total)} M` : `OH⁻ ${sci((baseMol - acidMol) / total)} M`;
  const valueText = `${f1(s.value)} mL`;
  const rows: KitRow[] = [
    { key: "point", label: t("rowAdded"), value: `${f2(s.value)} mL` },
    { key: "acid", label: t("rowAcid"), value: `${sci(acidMol)} mol` },
    { key: "base", label: t("rowBase"), value: s.value === 0 ? "0 mol" : `${sci(baseMol)} mol` },
    { key: "excess", label: t("rowExcess"), value: excess },
    { key: "ph", label: "pH", value: f2(pH), isKey: true },
    { key: "ep", label: t("rowEp"), value: `${f2(EQUIVALENCE_ML)} mL · pH 7.00` },
    { key: "region", label: t("rowRegion"), value: t(`region.${region}`) },
  ];
  const epOn = hover === "ep";
  const ptOn = hover === "point" || hover === "ph";
  const readout = `${f2(s.value)} mL → pH ${f2(pH)}`;
  return (
    <IndicatorCard
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { v: ltr(f2(s.value)), pH: ltr(f2(pH)), ep: ltr(f2(EQUIVALENCE_ML)) })}
      controls={<KitControls s={s} valueText={valueText} testId="ph-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${valueText}, pH ${f2(pH)}`}>
            {[0, 7, 14].map((p) => (
              <g key={p}>
                <line x1={X0} y1={yp(p)} x2={X1} y2={yp(p)} style={{ stroke: "var(--ph-grid)" }} strokeWidth={1} />
                <text x={X0 - 8} y={yp(p) + 4} fontSize={11} textAnchor="end" style={{ fill: "var(--ph-ink-muted)" }}>
                  {p}
                </text>
              </g>
            ))}
            {[0, 10, 20, 30, 40, 50].map((v) => (
              <text key={v} x={xv(v)} y={Y0 + 18} fontSize={11} textAnchor={v === 50 ? "end" : v === 0 ? "start" : "middle"} style={{ fill: "var(--ph-ink-muted)" }}>
                {v}
              </text>
            ))}
            <text x={X1} y={Y0 + 36} fontSize={11} textAnchor="end" style={{ fill: "var(--ph-ink-muted)" }}>
              {t("axis")}
            </text>
            <text x={4} y={14} fontSize={11} fontWeight={700} style={{ fill: "var(--ph-ink-muted)" }}>
              pH
            </text>
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} strokeLinecap="round" />
            <line x1={xv(EQUIVALENCE_ML)} y1={Y1} x2={xv(EQUIVALENCE_ML)} y2={Y0} style={{ stroke: "var(--ph-neutral)" }} strokeWidth={epOn ? 2.5 : 1.5} strokeDasharray="5 4" />
            <polyline points={pts.join(" ")} fill="none" style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={xv(EQUIVALENCE_ML)} cy={yp(7)} r={epOn ? 7 : 5.5} style={{ fill: "var(--ph-neutral)", stroke: "var(--ph-knob)" }} strokeWidth={1.5} onPointerEnter={() => setHover("ep")} onPointerLeave={() => setHover(null)} />
            <text x={xv(EQUIVALENCE_ML) + 7} y={Y0 - 8} fontSize={11} fontWeight={800} style={{ fill: "var(--ph-neutral)" }}>
              {t("epShort")}
            </text>
            <line x1={xv(s.value)} y1={yp(pH)} x2={xv(s.value)} y2={Y0} style={{ stroke: "var(--ph-focus)", opacity: ptOn ? 0.9 : 0.45 }} strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={X0 + 6} y={14} fontSize={12} fontWeight={800} style={{ fill: "var(--ph-ink)" }}>
              {readout}
            </text>
          </svg>
          <SvgHandle x={xv(s.value)} y={yp(pH)} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="ph-c2-handle" />
        </div>
      }
    />
  );
}

// ── 4. pH + pOH = pKw balance with temperature ────────────────────────────────────────
export function PhKwBalanceCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.kw");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(KW_SEED_INDEX, { min: 0, max: KW_TABLE.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const row = KW_TABLE[s.value];
  const pH = PH_SEED;
  const pOH = row.pKw - pH;
  const neutral = row.pKw / 2;
  const valueText = `${row.t} °C`;
  const rows: KitRow[] = [
    { key: "t", label: t("rowT"), value: `${row.t} °C` },
    { key: "pkw", label: "pKw", value: row.pKw.toFixed(3), isKey: true },
    { key: "kw", label: "Kw", value: sci(10 ** -row.pKw) },
    { key: "ph", label: t("rowPh"), value: f2(pH) },
    { key: "poh", label: t("rowPoh"), value: f2(pOH) },
    { key: "neutral", label: t("rowNeutral"), value: f2(neutral) },
    { key: "class", label: t("rowClass"), value: tc(classify(pH, neutral)) },
  ];
  return (
    <IndicatorCard
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle", { pH: ltr(f2(pH)) })}
      caption={t("caption", { t: ltr(String(row.t)), pkw: ltr(row.pKw.toFixed(3)), pH: ltr(f2(pH)), pOH: ltr(f2(pOH)), n: ltr(f2(neutral)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="ph-c4-handle" ticks={KW_TABLE.map((k, i) => ({ at: i, text: `${k.t} °C` }))} />
          <KitControls s={s} valueText={valueText} testId="ph-c4" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={1}
      visual={<PhKwDrawing pKw={row.pKw} pH={pH} pOH={pOH} hover={hover} setHover={setHover} />}
    />
  );
}

/** Card 4's drawing; it owns its measured box so the phone mini copy (PhoneMini) measures its own. */
function PhKwDrawing({ pKw, pH, pOH, hover, setHover }: { pKw: number; pH: number; pOH: number; hover: string | null; setHover: (k: string | null) => void }) {
  const HMIN = 214;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const angle = clamp((pOH - pH) * 2.2, -16, 16);
  const H = Math.max(HMIN, hBox);
  const cx = W / 2;
  const cy = 86 + (H - HMIN) / 3;
  const arm = Math.min(W / 2 - 54, 220);
  const rad = (angle * Math.PI) / 180;
  const L = [cx - arm * Math.cos(rad), cy - arm * Math.sin(rad)];
  const R = [cx + arm * Math.cos(rad), cy + arm * Math.sin(rad)];
  const pan = (p: number[], text: string, key: string, tint: string) => (
    <g onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)}>
      <line x1={p[0]} y1={p[1]} x2={p[0]} y2={p[1] + 32} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} />
      <ellipse cx={p[0]} cy={p[1] + 58} rx={48} ry={26} style={{ fill: "var(--ph-surface)", ...lit(hover === key) }} />
      <ellipse cx={p[0]} cy={p[1] + 58} rx={48} ry={26} style={{ fill: tint, opacity: 0.22 }} />
      <text x={p[0]} y={p[1] + 62} fontSize={12.5} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
        {text}
      </text>
    </g>
  );
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`pH ${f2(pH)} + pOH ${f2(pOH)} = pKw ${pKw.toFixed(3)}`}>
        <path d={`M ${cx} ${cy} L ${cx - 34} ${H - 12} Q ${cx} ${H - 2} ${cx + 34} ${H - 12} Z`} style={{ fill: "var(--ph-accent-soft)", stroke: "var(--ph-line)" }} strokeWidth={1.5} strokeLinejoin="round" />
        <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} strokeWidth={10} strokeLinecap="round" style={{ stroke: "var(--ph-accent-strong)" }} />
        <circle cx={cx} cy={cy} r={9} style={{ fill: "var(--ph-knob)", stroke: "var(--ph-line)" }} strokeWidth={2} />
        {pan(L, `pH ${f2(pH)}`, "ph", "var(--ph-ion-h)")}
        {pan(R, `pOH ${f2(pOH)}`, "poh", "var(--ph-ion-oh)")}
        <text x={cx} y={cy - 62} fontSize={14} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          {`pKw = ${pKw.toFixed(3)}`}
        </text>
      </svg>
    </div>
  );
}

// ── 6. Indicator colour ranges ────────────────────────────────────────────────────────
export function PhIndicatorRangesCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.dyes");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(PH_SEED, { min: 0, max: 14, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 256;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 16;
  const X1 = W - 16;
  const xp = (p: number) => X0 + (p / 14) * (X1 - X0);
  const pitch = (H - 78 - 40) / 3;
  const barY = (i: number) => 78 + i * pitch;
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - X0) / (X1 - X0)) * 14));
  const changing = DYES.filter((d) => dyeForm(d, s.value) === "transition").length;
  const valueText = `pH ${f2(s.value)}`;
  const rows: KitRow[] = [
    { key: "ph", label: "pH", value: f2(s.value), isKey: true },
    ...DYES.map((d) => ({ key: d.key, label: `${t(`names.${d.key}`)} (${f1(d.lo)}–${f1(d.hi)})`, value: t(`forms.${dyeForm(d, s.value)}`) })),
    { key: "n", label: t("rowChanging"), value: `${changing} / ${DYES.length}` },
    { key: "class", label: t("rowClass"), value: tc(classify(s.value)) },
  ];
  return (
    <IndicatorCard
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { pH: ltr(f2(s.value)), n: ltr(String(changing)) })}
      controls={<KitControls s={s} valueText={valueText} testId="ph-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <defs>
              {DYES.map((d) => {
                const a = (d.lo / 14) * 100;
                const b = (d.hi / 14) * 100;
                return (
                  <linearGradient key={d.key} id={`ph-dye-${d.key}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset={`${a}%`} style={{ stopColor: `var(${d.acid})` }} />
                    {d.mid && <stop offset={`${(a + b) / 2}%`} style={{ stopColor: `var(${d.mid})` }} />}
                    <stop offset={`${b}%`} style={{ stopColor: `var(${d.base})` }} />
                  </linearGradient>
                );
              })}
            </defs>
            {DYES.map((d, i) => {
              const on = hover === d.key;
              return (
                <g key={d.key} onPointerEnter={() => setHover(d.key)} onPointerLeave={() => setHover(null)}>
                  <text x={X0} y={barY(i) - 15} fontSize={12} fontWeight={on ? 800 : 600} style={{ fill: "var(--ph-ink)" }}>
                    {t(`names.${d.key}`)}
                  </text>
                  <text x={X1} y={barY(i) - 15} fontSize={11} textAnchor="end" style={{ fill: "var(--ph-ink-muted)" }}>
                    {`${f1(d.lo)}–${f1(d.hi)}`}
                  </text>
                  <rect x={X0} y={barY(i) - 8} width={X1 - X0} height={16} rx={8} fill={`url(#ph-dye-${d.key})`} style={lit(on)} />
                  <line x1={xp(d.lo)} y1={barY(i) - 11} x2={xp(d.lo)} y2={barY(i) + 11} style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.2} strokeLinecap="round" />
                  <line x1={xp(d.hi)} y1={barY(i) - 11} x2={xp(d.hi)} y2={barY(i) + 11} style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.2} strokeLinecap="round" />
                  <circle cx={xp(s.value)} cy={barY(i)} r={8} style={{ fill: dyeCss(d, s.value), stroke: "var(--ph-ink)" }} strokeWidth={2} />
                </g>
              );
            })}
            <line x1={xp(s.value)} y1={34} x2={xp(s.value)} y2={barY(3) + 14} style={{ stroke: "var(--ph-focus)" }} strokeWidth={2} strokeLinecap="round" />
            {[0, 2, 4, 6, 8, 10, 12, 14].map((p) => (
              <text key={p} x={xp(p)} y={H - 6} fontSize={11} textAnchor={p === 0 ? "start" : p === 14 ? "end" : "middle"} style={{ fill: "var(--ph-ink-muted)" }}>
                {p}
              </text>
            ))}
          </svg>
          <SvgHandle x={xp(s.value)} y={22} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="ph-c6-handle" />
        </div>
      }
    />
  );
}

// ── 7. Four-way conversion dial (replaces the buffer card: the tool has no pKa input) ──
export function PhDialCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.dial");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(PH_SEED, { min: 0, max: 14, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const x = ions(s.value);
  const valueText = `pH ${f2(s.value)}`;
  const rows: KitRow[] = [
    { key: "ph", label: "pH", value: f2(x.pH), isKey: true },
    { key: "poh", label: t("rowPoh"), value: f2(x.pOH) },
    { key: "h", label: t("rowH"), value: `${sci(x.h)} M` },
    { key: "oh", label: t("rowOh"), value: `${sci(x.oh)} M` },
    { key: "kw", label: t("rowKw"), value: sci(x.h * x.oh) },
    { key: "ratio", label: t("rowRatio"), value: ratio(x.h / x.oh) },
    { key: "class", label: t("rowClass"), value: tc(classify(s.value)) },
  ];
  return (
    <IndicatorCard
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { pH: ltr(f2(x.pH)), pOH: ltr(f2(x.pOH)) })}
      controls={<KitControls s={s} valueText={valueText} testId="ph-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      mini={0}
      visual={<PhDialDrawing s={s} hover={hover} setHover={setHover} />}
    />
  );
}

/** Card 7's drawing; it owns its measured box, svg ref and drag so the phone mini copy (PhoneMini) gets its own. */
function PhDialDrawing({ s, hover, setHover }: { s: Stepper; hover: string | null; setHover: (k: string | null) => void }) {
  const t = useTranslations("tools.ph-calculator.visuals.dial");
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: 270 });
  const wide = W >= 470;
  // Narrow: the readouts stack in the bottom gap under the dial, so the box is as tall as they need.
  const RN = Math.min(W / 2 - 30, 112);
  const HMIN = wide ? 270 : RN + 168;
  const H = Math.max(HMIN, hBox);
  // Wide: dial on the left, readouts beside it.
  const RO = wide ? Math.min((H - 74) / 2, (W - 250) / 2) : RN;
  const C = wide ? { x: RO + 16, y: H / 2 + 8 } : { x: W / 2, y: RO + 44 };
  const RI = RO - 30;
  const ang = (p: number) => ((-135 + (p / 14) * 270) * Math.PI) / 180;
  const pt = (p: number, r: number): [number, number] => [C.x + r * Math.sin(ang(p)), C.y - r * Math.cos(ang(p))];
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px, py) => {
    let deg = (Math.atan2(px - C.x, C.y - py) * 180) / Math.PI; // 0 at top, clockwise
    if (deg > 135) deg = deg > 180 ? -135 : 135;
    if (deg < -135) deg = -135;
    s.set(((deg + 135) / 270) * 14);
  });
  const x = ions(s.value);
  const valueText = `pH ${f2(s.value)}`;
  const arc = (r: number, a: number, b: number) => {
    const [x0, y0] = pt(a, r);
    const [x1, y1] = pt(b, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const on = (k: string) => hover === k;
  // Readouts: a column beside the dial when wide, else stacked in the needle-free bottom gap.
  const RX = wide ? C.x + RO + 36 : C.x;
  // Very wide boxes (tablet) split the readouts into two columns so they span the width.
  const twoCol = wide && W - RX >= 260;
  const RX2 = twoCol ? RX + (W - RX) / 2 : RX;
  const anchor = wide ? "start" : "middle";
  const ry = twoCol ? [C.y - 40, C.y - 40, C.y + 16, C.y + 16, C.y + 66] : wide ? [C.y - 54, C.y - 22, C.y + 20, C.y + 46, C.y + 84] : [C.y + 40, C.y + 62, C.y + 94, C.y + 112, -1];
  return (
    <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={`o${i}`} d={arc(RO, i, i + 1)} fill="none" strokeWidth={on("ph") ? 18 : 15} strokeLinecap={i === 0 || i === 13 ? "round" : "butt"} style={{ stroke: `var(--ph-ui-${i})` }} onPointerEnter={() => setHover("ph")} onPointerLeave={() => setHover(null)} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <path key={`i${i}`} d={arc(RI, i, i + 1)} fill="none" strokeWidth={on("poh") ? 12 : 9} strokeLinecap={i === 0 || i === 13 ? "round" : "butt"} style={{ stroke: `var(--ph-ui-${13 - i})`, opacity: 0.85 }} onPointerEnter={() => setHover("poh")} onPointerLeave={() => setHover(null)} />
        ))}
        {[0, 7, 14].map((p) => {
          // Outer labels sit beyond the handle's puck; inner labels just inside the ring, a little in
          // from each end so they never touch the round end caps.
          const [ox, oy] = pt(p, RO + 30);
          const [ix, iy] = pt(p === 0 ? 0.6 : p === 14 ? 13.4 : 7, RI - 19);
          return (
            <g key={p}>
              <text x={ox} y={oy + 4} fontSize={11} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                {p}
              </text>
              <text x={ix} y={iy + 4} fontSize={10.5} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
                {14 - p}
              </text>
            </g>
          );
        })}
        {/* Pointer between the two rings only, so it never crosses a ring label. */}
        <line x1={pt(s.value, RI + 7)[0]} y1={pt(s.value, RI + 7)[1]} x2={pt(s.value, RO)[0]} y2={pt(s.value, RO)[1]} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} strokeLinecap="round" />
        <text x={RX} y={ry[0]} fontSize={wide ? 26 : 17} fontWeight={800} textAnchor={anchor} style={{ fill: "var(--ph-ink)" }}>
          {`pH ${f2(x.pH)}`}
        </text>
        <text x={RX2} y={ry[1]} fontSize={wide ? 17 : 13} fontWeight={700} textAnchor={anchor} style={{ fill: "var(--ph-ink-muted)" }}>
          {`pOH ${f2(x.pOH)}`}
        </text>
        <text x={RX} y={ry[2]} fontSize={wide ? 14 : 12} fontWeight={on("h") ? 800 : 650} textAnchor={anchor} style={{ fill: "var(--ph-acid)" }}>
          <SvgChem text={`[H⁺] ${sci(x.h)} M`} />
        </text>
        <text x={RX2} y={ry[3]} fontSize={wide ? 14 : 12} fontWeight={on("oh") ? 800 : 650} textAnchor={anchor} style={{ fill: "var(--ph-base)" }}>
          <SvgChem text={`[OH⁻] ${sci(x.oh)} M`} />
        </text>
        {wide && (
          <text x={RX} y={ry[4]} fontSize={14} fontWeight={600} textAnchor={anchor} style={{ fill: "var(--ph-ink-muted)" }}>
            <SvgChem text={`[H⁺] × [OH⁻] = ${sci(x.h * x.oh)}`} />
          </text>
        )}
      </svg>
      <SvgHandle x={pt(s.value, RO)[0]} y={pt(s.value, RO)[1]} viewW={W} viewH={H} direction="circular" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="ph-c7-handle" />
    </div>
  );
}
