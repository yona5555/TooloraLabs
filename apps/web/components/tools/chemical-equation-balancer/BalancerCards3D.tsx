"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { g3 } from "../molarity-calculator/molMath";
import { COLUMN_TERMS, molarMassOf, uniFormula } from "./chemMath";
import { SvgMolecule } from "./Molecules2D";

const CopiesScene3D = dynamic(() => import("./BalancerScenes3D").then((m) => m.CopiesScene3D), { ssr: false, loading: () => null });
const ScaleScene3D = dynamic(() => import("./BalancerScenes3D").then((m) => m.ScaleScene3D), { ssr: false, loading: () => null });
const ColumnsScene3D = dynamic(() => import("./BalancerScenes3D").then((m) => m.ColumnsScene3D), { ssr: false, loading: () => null });

type Side = "visual-left" | "table-left";
const M_H2O = molarMassOf("H2O");
const M_H2 = molarMassOf("H2");
const M_O2 = molarMassOf("O2");

// ── 1. What a coefficient counts ──────────────────────────────────────────────────────
function Copies2D({ n, hover }: { n: number; hover: string | null }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 250 });
  const cols = Math.min(4, n);
  const rows = Math.ceil(n / cols);
  const cell = Math.min((W - 20) / cols, (H - 50) / rows);
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${n} H₂O`}>
        {Array.from({ length: n }, (_, i) => {
          const row = Math.floor(i / cols);
          const inRow = row === rows - 1 ? n - row * cols : cols;
          return <SvgMolecule key={i} formula="H2O" x={W / 2 + ((i % cols) - (inRow - 1) / 2) * cell} y={14 + (row + 0.5) * cell} size={cell * 0.55} lit={hover === "n"} />;
        })}
        <text x={W / 2} y={H - 10} fontSize={13} fontWeight={700} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          <SvgChem text={`${n} H₂O`} />
        </text>
      </svg>
    </div>
  );
}

export function BalCopiesCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.copies");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(2, { min: 1, max: 8, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const n = s.value;
  const valueText = `${n} H₂O`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowN"), value: String(n) },
    { key: "h", label: t("rowH"), value: String(2 * n) },
    { key: "o", label: t("rowO"), value: String(n) },
    { key: "atoms", label: t("rowAtoms"), value: String(3 * n), isKey: true },
    { key: "u", label: t("rowMass"), value: `${g3(n * M_H2O)} u` },
    { key: "mol", label: t("rowMoles"), value: `${g3(n * M_H2O)} g` },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={1}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(n)), h: ltr(String(2 * n)), o: ltr(String(n)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="bal-c1-handle" ticks={[1, 4, 8].map((x) => ({ at: x, text: String(x) }))} />
          <KitControls s={s} valueText={valueText} testId="bal-c1" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="bal-c1" className="min-h-[260px] flex-1" fallback={<Copies2D n={n} hover={hover} />} render3d={() => <CopiesScene3D n={n} hover={hover} />} />}
    />
  );
}

// ── 5. Lavoisier's balance ────────────────────────────────────────────────────────────
function Scale2D({ h2, o2, water, max }: { h2: number; o2: number; water: number; max: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 260 });
  const base = H - 46;
  const k = (H - 110) / max;
  const bar = (x: number, y: number, g: number, fill: string) => <rect x={x - 34} y={y - g * k} width={68} height={Math.max(2, g * k)} rx={10} style={{ fill, stroke: "var(--ph-line)" }} strokeWidth={1} />;
  const L = W * 0.27;
  const R = W * 0.73;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g3(h2 + o2)} g = ${g3(water)} g`}>
        {bar(L, base, h2, "var(--chem-el-h)")}
        {bar(L, base - h2 * k, o2, "var(--chem-el-o)")}
        {bar(R, base, water, "var(--chem-product)")}
        <line x1={L - 60} y1={base + 4} x2={R + 60} y2={base + 4} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${W / 2 - 16} ${base + 34} L ${W / 2} ${base + 6} L ${W / 2 + 16} ${base + 34} Z`} style={{ fill: "var(--ph-ink-muted)" }} />
        <text x={L} y={base - (h2 + o2) * k - 10} fontSize={12.5} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          {`${g3(h2 + o2)} g`}
        </text>
        <text x={R} y={base - water * k - 10} fontSize={12.5} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          {`${g3(water)} g`}
        </text>
        <text x={L} y={H - 6} fontSize={11} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
          <SvgChem text="H₂ + O₂" />
        </text>
        <text x={R} y={H - 6} fontSize={11} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
          <SvgChem text="H₂O" />
        </text>
      </svg>
    </div>
  );
}

export function BalScaleCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.scale");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(4, { min: 1, max: 20, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const nH2 = s.value / M_H2;
  const o2 = (nH2 / 2) * M_O2;
  const water = nH2 * M_H2O;
  // Heights are relative to this mass, so the weights always fill the drawing.
  const max = water;
  const valueText = `${s.value} g H₂`;
  const rows: KitRow[] = [
    { key: "h2", label: t("rowH2"), value: `${g3(s.value)} g` },
    { key: "n", label: t("rowMolH2"), value: `${g3(nH2)} mol` },
    { key: "o2", label: t("rowO2"), value: `${g3(o2)} g` },
    { key: "in", label: t("rowIn"), value: `${g3(s.value + o2)} g` },
    { key: "water", label: t("rowWater"), value: `${g3(water)} g`, isKey: true },
    { key: "diff", label: t("rowDiff"), value: `${g3(Math.abs(s.value + o2 - water))} g` },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={5}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { h: ltr(g3(s.value)), o: ltr(g3(o2)), w: ltr(g3(water)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="bal-c5-handle" ticks={[1, 10, 20].map((x) => ({ at: x, text: `${x} g` }))} />
          <KitControls s={s} valueText={valueText} testId="bal-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <ViewportScene
          testId="bal-c5"
          className="min-h-[280px] flex-1"
          fallback={<Scale2D h2={s.value} o2={o2} water={water} max={max} />}
          render3d={() => <ScaleScene3D h2={s.value} o2={o2} water={water} max={max} hover={hover} />}
        />
      }
    />
  );
}

// ── 8. The smallest whole numbers ─────────────────────────────────────────────────────
function Columns2D({ k }: { k: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 240 });
  const base = H - 34;
  const unit = (H - 80) / (2 * k); // the tallest column always reaches the top
  const xs = [W * 0.2, W * 0.42, W * 0.74];
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`× ${k}`}>
        <line x1={14} y1={base} x2={W - 14} y2={base} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeLinecap="round" />
        {COLUMN_TERMS.map((term, i) => {
          const coef = term.base * k;
          const fill = term.side === "reactant" ? "var(--chem-reactant)" : "var(--chem-product)";
          return (
            <g key={term.formula}>
              <rect x={xs[i] - 26} y={base - coef * unit} width={52} height={coef * unit} rx={12} style={{ fill, fillOpacity: 0.4 }} />
              <rect x={xs[i] - 26} y={base - term.base * unit} width={52} height={term.base * unit} rx={12} style={{ fill }} />
              <text x={xs[i]} y={base - coef * unit - 8} fontSize={13} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                {coef}
              </text>
              <text x={xs[i]} y={H - 10} fontSize={11.5} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
                <SvgChem text={uniFormula(term.formula)} />
              </text>
            </g>
          );
        })}
        <text x={W * 0.58} y={base - 20} fontSize={18} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          →
        </text>
      </svg>
    </div>
  );
}

export function BalColumnsCard({ side }: { side: Side }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.columns");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(2, { min: 1, max: 5, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const k = s.value;
  const [a, b, c] = COLUMN_TERMS.map((x) => x.base * k);
  const valueText = `× ${k}`;
  const rows: KitRow[] = [
    { key: "k", label: t("rowK"), value: `× ${k}` },
    { key: "H2", label: t("rowSet"), value: `${a}H₂ + ${b}O₂ → ${c}H₂O` },
    { key: "h", label: t("rowH"), value: `${2 * a} = ${2 * c}` },
    { key: "O2", label: t("rowO"), value: `${2 * b} = ${c}` },
    { key: "gcd", label: t("rowGcd"), value: String(k) },
    { key: "H2O", label: t("rowSmallest"), value: "2 : 1 : 2", isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="bal"
      n={8}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(String(k)), a: ltr(String(a)), b: ltr(String(b)), c: ltr(String(c)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="bal-c8-handle" ticks={[1, 3, 5].map((x) => ({ at: x, text: `× ${x}` }))} />
          <KitControls s={s} valueText={valueText} testId="bal-c8" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="bal-c8" className="min-h-[250px] flex-1" fallback={<Columns2D k={k} />} render3d={() => <ColumnsScene3D k={k} hover={hover} />} />}
    />
  );
}
