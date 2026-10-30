"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, SvgHandle, useMeasuredSize, useStepper, useSvgDrag, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { atomLedger, atomsOf, balance, balancedText, elToken, REACTIONS, uniFormula } from "./chemMath";
import { svgPx } from "@/components/tool-ui/svgPx";

import FitSvg from "@/components/tool-ui/FitSvg";
/**
 * The five 2D balancer indicator cards. Each drawing is laid out in real pixels at the measured
 * width of its box (viewBox = box), so labels keep their size on a phone and marks span the box.
 */
type Side = "visual-left" | "table-left";
const W0 = 520;
const lit = (on: boolean) => ({ stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2.5 : 1.25 });
const BALANCED = REACTIONS.map((r) => balance(r.equation).terms);
const LAST = REACTIONS.length - 1;

function useReactionName() {
  const tHero = useTranslations("tools.chemical-equation-balancer.visuals.hero");
  const tScen = useTranslations("tools.chemical-equation-balancer.form.scenarios");
  return (i: number) => (REACTIONS[i].key === "ironRusting" ? tHero("ironRusting") : tScen(REACTIONS[i].key));
}

// ── 2. The matrix behind the balance (bubble matrix) ──────────────────────────────────
export function BalMatrixCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.matrix");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const name = useReactionName();
  const s = useStepper(0, { min: 0, max: LAST, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const terms = BALANCED[s.value];
  const els = atomLedger(terms).map((r) => r.el);
  const cnt = terms.map((term) => atomsOf(term.formula) ?? {});
  const HMIN = 60 + 34 * (els.length + 1);
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: Math.max(250, HMIN) });
  const H = Math.max(250, HMIN, hBox);
  const X0 = 44;
  const colW = (W - X0 - 10) / terms.length;
  const rowH = (H - 54) / (els.length + 1);
  const cx = (j: number) => X0 + colW * (j + 0.5);
  const cy = (i: number) => 44 + rowH * (i + 0.5);
  const maxN = Math.max(1, ...cnt.flatMap((c) => Object.values(c)));
  const R = Math.min(colW, rowH) * 0.42;
  const valueText = name(s.value);
  const rows: KitRow[] = [
    ...els.map((el) => ({
      key: el,
      label: `${el}: ${terms.map((term, j) => `${j === 0 ? "" : term.side === "reactant" ? " + " : " − "}${cnt[j][el] ?? 0}×${term.coefficient}`).join("")}`,
      value: "= 0",
    })),
    { key: "coef", label: t("rowVector"), value: `(${terms.map((x) => x.coefficient).join(", ")})`, isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(balancedText(terms)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="bal-c2-handle" ticks={[0, LAST].map((x) => ({ at: x, text: String(x + 1) }))} />
          <KitControls s={s} valueText={`${s.value + 1} / ${REACTIONS.length}`} testId="bal-c2" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: Math.max(250, HMIN) }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {terms.map((term, j) => (
              <text key={j} x={cx(j)} y={22} fontWeight={700} textAnchor="middle" style={{ fontSize: svgPx(12), fill: term.side === "reactant" ? "var(--chem-reactant)" : "var(--chem-product)" }}>
                <SvgChem text={uniFormula(term.formula)} />
              </text>
            ))}
            {els.map((el, i) => (
              <g key={el} onPointerEnter={() => setHover(el)} onPointerLeave={() => setHover(null)}>
                <text x={10} y={cy(i) + 4} fontWeight={800} style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
                  {el}
                </text>
                {terms.map((term, j) => {
                  const n = cnt[j][el] ?? 0;
                  if (!n) return <circle key={j} cx={cx(j)} cy={cy(i)} r={2.5} style={{ fill: "var(--ph-grid)" }} />;
                  const r = Math.max(9, R * Math.sqrt(n / maxN));
                  return (
                    <g key={j}>
                      <circle cx={cx(j)} cy={cy(i)} r={r} style={{ fill: term.side === "reactant" ? "var(--chem-reactant)" : "var(--chem-product)", fillOpacity: 0.3, ...lit(hover === el) }} />
                      <text x={cx(j)} y={cy(i) + 4} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                        {term.side === "reactant" ? n : -n}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
            <line x1={X0} y1={cy(els.length) - rowH / 2} x2={W - 10} y2={cy(els.length) - rowH / 2} style={{ stroke: "var(--ph-line)" }} strokeDasharray="4 4" />
            {terms.map((term, j) => (
              <g key={j} onPointerEnter={() => setHover("coef")} onPointerLeave={() => setHover(null)}>
                <circle cx={cx(j)} cy={cy(els.length)} r={Math.max(12, R * 0.6)} style={{ fill: "var(--ph-accent-soft)", ...lit(true) }} />
                <text x={cx(j)} y={cy(els.length) + 4.5} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
                  {term.coefficient}
                </text>
              </g>
            ))}
          </svg>
        </div>
      }
    />
  );
}

// ── 3. Atoms balance, charge must too (dumbbell) ──────────────────────────────────────
export function BalChargeCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.charge");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(1, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const k = s.value;
  const qL = 3 * k;
  const qR = 2 * k + 2;
  const ok = qL === qR;
  const HMIN = 230;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 70;
  const X1 = W - 20;
  const AX = 14;
  const xv = (v: number) => X0 + (v / AX) * (X1 - X0);
  const items = [
    { key: "fe", label: "Fe", l: k, r: k },
    { key: "cu", label: "Cu", l: 1, r: 1 },
    { key: "q", label: t("rowChargeShort"), l: qL, r: qR },
  ];
  const rowY = (i: number) => 40 + i * ((H - 80) / 2);
  const eq = `${k > 1 ? k : ""}Fe³⁺ + Cu → ${k > 1 ? k : ""}Fe²⁺ + Cu²⁺`;
  const rows: KitRow[] = [
    { key: "fe", label: t("rowFe"), value: `${k} = ${k}` },
    { key: "cu", label: t("rowCu"), value: "1 = 1" },
    { key: "q", label: t("rowChargeL"), value: `+${qL}` },
    { key: "qr", label: t("rowChargeR"), value: `+${qR}` },
    { key: "d", label: t("rowDiff"), value: String(Math.abs(qL - qR)), isKey: true },
    { key: "st", label: t("rowStatus"), value: ok ? t("balanced") : t("unbalanced") },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={3}
      mini={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(eq), l: ltr(String(qL)), r: ltr(String(qR)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={eq} testId="bal-c3-handle" ticks={[1, 2, 3, 4].map((x) => ({ at: x, text: String(x) }))} />
          <KitControls s={s} valueText={`${k} Fe³⁺`} testId="bal-c3" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={eq}>
            {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
              <g key={v}>
                <line x1={xv(v)} y1={24} x2={xv(v)} y2={H - 30} style={{ stroke: "var(--ph-grid)" }} />
                <text x={xv(v)} y={H - 12} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  {v}
                </text>
              </g>
            ))}
            {items.map((it, i) => {
              const y = rowY(i);
              const same = it.l === it.r;
              const on = hover === it.key || (it.key === "q" && hover === "qr");
              return (
                <g key={it.key} onPointerEnter={() => setHover(it.key)} onPointerLeave={() => setHover(null)}>
                  <text x={10} y={y + 4} fontWeight={800} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                    {it.label}
                  </text>
                  <line x1={xv(it.l)} y1={y} x2={xv(it.r)} y2={y} style={{ stroke: same ? "var(--ph-neutral)" : "var(--ph-acid)" }} strokeWidth={4} strokeLinecap="round" />
                  <circle cx={xv(it.l)} cy={y} r={9} style={{ fill: "var(--chem-reactant)", ...lit(on) }} />
                  <circle cx={xv(it.r)} cy={y} r={same ? 14 : 9} style={{ fill: same ? "none" : "var(--chem-product)", stroke: "var(--chem-product)" }} strokeWidth={same ? 3 : 1.25} />
                  <text x={xv(Math.max(it.l, it.r)) + 18} y={y + 4} fontWeight={700} style={{ fontSize: svgPx(12), fill: same ? "var(--ph-neutral)" : "var(--ph-acid)" }}>
                    {same ? "=" : `Δ ${Math.abs(it.l - it.r)}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      }
    />
  );
}

// ── 4. Balancing by trial: 4Fe + x O₂ → 2Fe₂O₃ (butterfly bars) ───────────────────────
export function BalTrialCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.trial");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(1, { min: 1, max: 6, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const x = s.value;
  const oL = 2 * x;
  const HMIN = 230;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const CX = W / 2;
  const unit = (W / 2 - 40) / 12;
  const ref = useRef<SVGSVGElement>(null);
  const yO = H * 0.62;
  const yFe = H * 0.3;
  const drag = useSvgDrag(ref, W, H, (px) => s.set((CX - px) / unit / 2));
  const bars = [
    { key: "fe", el: "Fe", y: yFe, l: 4, r: 4 },
    { key: "o", el: "O", y: yO, l: oL, r: 6 },
  ];
  const ok = oL === 6;
  const valueText = `x = ${x}`;
  const rows: KitRow[] = [
    { key: "x", label: t("rowX"), value: String(x) },
    { key: "fe", label: t("rowFe"), value: "4 = 4" },
    { key: "o", label: t("rowOL"), value: String(oL) },
    { key: "or", label: t("rowOR"), value: "6" },
    { key: "d", label: t("rowDiff"), value: String(Math.abs(oL - 6)), isKey: true },
    { key: "st", label: t("rowStatus"), value: ok ? t("balanced") : t("unbalanced") },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { x: ltr(String(x)), l: ltr(String(oL)) })}
      controls={<KitControls s={s} valueText={valueText} testId="bal-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            <text x={CX - 12} y={18} fontWeight={700} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--chem-reactant)" }}>
              <SvgChem text={`4Fe + ${x > 1 ? x : ""}O₂`} />
            </text>
            <text x={CX + 12} y={18} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--chem-product)" }}>
              <SvgChem text="2Fe₂O₃" />
            </text>
            <line x1={CX} y1={28} x2={CX} y2={H - 16} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} />
            {bars.map((b) => {
              const on = hover === b.key || (b.key === "o" && hover === "or");
              const same = b.l === b.r;
              return (
                <g key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)}>
                  <rect x={CX - b.l * unit} y={b.y - 15} width={b.l * unit} height={30} rx={12} style={{ fill: `var(${elToken(b.el)})`, ...lit(on) }} />
                  <rect x={CX} y={b.y - 15} width={b.r * unit} height={30} rx={12} style={{ fill: `var(${elToken(b.el)})`, ...lit(on) }} />
                  <text x={CX - b.l * unit - 28} y={b.y + 5} fontWeight={800} textAnchor="end" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
                    {`${b.el} ${b.l}`}
                  </text>
                  <text x={CX + b.r * unit + 8} y={b.y + 5} fontWeight={800} style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
                    {`${b.r} ${b.el}`}
                  </text>
                  {!same && <line x1={CX - 6 * unit} y1={b.y + 21} x2={CX - 6 * unit} y2={b.y - 21} style={{ stroke: "var(--ph-acid)" }} strokeWidth={2} strokeDasharray="3 3" />}
                </g>
              );
            })}
          </svg>
          <SvgHandle x={CX - oL * unit} y={yO} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="bal-c4-handle" />
        </div>
      }
    />
  );
}

// ── 6. Trial and error grows fast (log-scale lines) ───────────────────────────────────
export function BalGrowthCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.growth");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(4, { min: 2, max: 8, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const X0 = 50;
  const X1 = W - 18;
  const Y0 = H - 34;
  const Y1 = 22;
  const xT = (n: number) => X0 + ((n - 2) / 6) * (X1 - X0);
  const yL = (v: number) => Y0 - (Math.log10(v) / 8) * (Y0 - Y1);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(2 + ((px - X0) / (X1 - X0)) * 6));
  const T = s.value;
  const trials = 10 ** T;
  const steps = T ** 3;
  const line = (f: (n: number) => number) => [2, 3, 4, 5, 6, 7, 8].map((n) => `${xT(n).toFixed(1)},${yL(f(n)).toFixed(1)}`).join(" ");
  const valueText = `${T} ${t("terms")}`;
  const fmt = (v: number) => v.toLocaleString("en-US");
  const rows: KitRow[] = [
    { key: "t", label: t("rowTerms"), value: String(T) },
    { key: "trials", label: t("rowTrials"), value: `10^${T} = ${fmt(trials)}`.replace(/\^(\d)/, (_, d: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]), isKey: true },
    { key: "steps", label: t("rowSteps"), value: fmt(steps) },
    { key: "ratio", label: t("rowRatio"), value: `× ${fmt(Math.round(trials / steps))}` },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { t: ltr(String(T)), trials: ltr(fmt(trials)), steps: ltr(fmt(steps)) })}
      controls={<KitControls s={s} valueText={valueText} testId="bal-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {[0, 2, 4, 6, 8].map((e) => (
              <g key={e}>
                <line x1={X0} y1={yL(10 ** e)} x2={X1} y2={yL(10 ** e)} style={{ stroke: "var(--ph-grid)" }} />
                <text x={X0 - 8} y={yL(10 ** e) + 4} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                  <SvgChem text={`10${"⁰¹²³⁴⁵⁶⁷⁸⁹"[e]}`} />
                </text>
              </g>
            ))}
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <text key={n} x={xT(n)} y={H - 12} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
                {n}
              </text>
            ))}
            <polyline points={line((n) => 10 ** n)} fill="none" style={{ stroke: "var(--ph-acid)" }} strokeWidth={hover === "trials" ? 4 : 3} strokeLinejoin="round" onPointerEnter={() => setHover("trials")} onPointerLeave={() => setHover(null)} />
            <polyline points={line((n) => n ** 3)} fill="none" style={{ stroke: "var(--ph-neutral)" }} strokeWidth={hover === "steps" ? 4 : 3} strokeLinejoin="round" onPointerEnter={() => setHover("steps")} onPointerLeave={() => setHover(null)} />
            <line x1={xT(T)} y1={Y1} x2={xT(T)} y2={Y0} style={{ stroke: "var(--ph-focus)" }} strokeDasharray="4 4" />
            <circle cx={xT(T)} cy={yL(trials)} r={6} style={{ fill: "var(--ph-acid)", stroke: "var(--ph-knob)" }} strokeWidth={2} />
            <circle cx={xT(T)} cy={yL(steps)} r={6} style={{ fill: "var(--ph-neutral)", stroke: "var(--ph-knob)" }} strokeWidth={2} />
            <text x={X0 + 6} y={Y1 + 12} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--ph-acid)" }}>
              {t("legendTrials")}
            </text>
            <text x={X0 + 6} y={Y1 + 28} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--ph-neutral)" }}>
              {t("legendSteps")}
            </text>
          </svg>
          <SvgHandle x={xT(T)} y={Y0} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="bal-c6-handle" />
        </div>
      }
    />
  );
}

// ── 7. Same atoms on both sides (twin-ring donut) ─────────────────────────────────────
export function BalRingsCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.rings");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const name = useReactionName();
  const s = useStepper(3, { min: 0, max: LAST, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const terms = BALANCED[s.value];
  const ledger = atomLedger(terms);
  const total = ledger.reduce((a, r) => a + r.l, 0);
  const HMIN = 270;
  const [box, { w: W, h: hBox }] = useMeasuredSize<HTMLDivElement>({ w: W0, h: HMIN });
  const H = Math.max(HMIN, hBox);
  const R = Math.min(H / 2 - 14, W * 0.27);
  const cx = R + 16;
  const cy = H / 2;
  const arc = (r0: number, r1: number, a0: number, a1: number) => {
    const p = (r: number, a: number) => `${(cx + r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)}`;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${big} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${big} 0 ${p(r0, a0)} Z`;
  };
  const ring = (r0: number, r1: number, side: "l" | "r") => {
    let a = 0;
    return ledger.map((row) => {
      const span = (row[side] / total) * Math.PI * 2;
      const d = arc(r0, r1, a, a + span - 0.012);
      a += span;
      return <path key={row.el + side} d={d} style={{ fill: `var(${elToken(row.el)})`, ...lit(hover === row.el) }} onPointerEnter={() => setHover(row.el)} onPointerLeave={() => setHover(null)} />;
    });
  };
  const lx = cx + R + 26;
  const valueText = name(s.value);
  const rows: KitRow[] = [
    ...ledger.map((r) => ({ key: r.el, label: r.el, value: `${r.l} | ${r.r}` })),
    { key: "total", label: t("rowTotal"), value: `${total} | ${total}`, isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={7}
      mini={0}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(balancedText(terms)), n: ltr(String(total)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="bal-c7-handle" ticks={[0, LAST].map((x) => ({ at: x, text: String(x + 1) }))} />
          <KitControls s={s} valueText={`${s.value + 1} / ${REACTIONS.length}`} testId="bal-c7" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative w-full flex-1" style={{ minHeight: HMIN }}>
          <FitSvg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {ring(R * 0.42, R * 0.68, "l")}
            {ring(R * 0.74, R, "r")}
            <text x={cx} y={cy + 5} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(15), fill: "var(--ph-ink)" }}>
              {total}
            </text>
            <text x={lx} y={22} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {t("legend")}
            </text>
            {ledger.map((r, i) => (
              <g key={r.el} onPointerEnter={() => setHover(r.el)} onPointerLeave={() => setHover(null)}>
                <circle cx={lx + 7} cy={46 + i * 24} r={7} style={{ fill: `var(${elToken(r.el)})`, stroke: "var(--ph-line)" }} strokeWidth={1} />
                <text x={lx + 22} y={50 + i * 24} fontWeight={hover === r.el ? 800 : 600} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
                  {`${r.el}  ${r.l} = ${r.r}`}
                </text>
              </g>
            ))}
          </FitSvg>
        </div>
      }
    />
  );
}
