"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { g3, sciText } from "../molarity-calculator/molMath";
import { uniFormula } from "../chemical-equation-balancer/chemMath";
import { SvgMolecule } from "../chemical-equation-balancer/Molecules2D";
import { AVOGADRO, M, rd, SUBSTANCE_SEED, SUBSTANCES } from "./stoichMath";

const RatioScene3D = dynamic(() => import("./StoichiometryScenes3D").then((m) => m.RatioScene3D), { ssr: false, loading: () => null });
const TanksScene3D = dynamic(() => import("./StoichiometryScenes3D").then((m) => m.TanksScene3D), { ssr: false, loading: () => null });
const MoleScene3D = dynamic(() => import("./StoichiometryScenes3D").then((m) => m.MoleScene3D), { ssr: false, loading: () => null });

type Side = "visual-left" | "table-left";

// ── 1. Molecules by the ratio ─────────────────────────────────────────────────────────
function Ratio2D({ k }: { k: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 250 });
  const groups = [
    { formula: "H2", n: 2 * k, x0: 8, x1: W * 0.3 },
    { formula: "O2", n: k, x0: W * 0.3, x1: W * 0.48 },
    { formula: "H2O", n: 2 * k, x0: W * 0.56, x1: W - 8 },
  ];
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${2 * k}H₂ + ${k}O₂ → ${2 * k}H₂O`}>
        {groups.map((g) => {
          const w = g.x1 - g.x0;
          const cols = Math.ceil(Math.sqrt(g.n));
          const rows = Math.ceil(g.n / cols);
          const cell = Math.min(w / cols, (H - 50) / rows, 96);
          return (
            <g key={g.formula}>
              {Array.from({ length: g.n }, (_, i) => (
                <SvgMolecule key={i} formula={g.formula} x={g.x0 + w / 2 + ((i % cols) - (cols - 1) / 2) * cell} y={H - 36 - (Math.floor(i / cols) + 0.5) * cell} size={cell * 0.6} />
              ))}
              <text x={g.x0 + w / 2} y={H - 12} fontSize={12} fontWeight={700} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                <SvgChem text={`${g.n > 1 ? g.n : ""}${uniFormula(g.formula)}`} />
              </text>
            </g>
          );
        })}
        <text x={W * 0.52} y={H / 2} fontSize={18} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          →
        </text>
      </svg>
    </div>
  );
}

export function StoRatioCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.ratio");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(1, { min: 1, max: 6, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const k = s.value;
  const valueText = `× ${k}`;
  const rows: KitRow[] = [
    { key: "k", label: t("rowK"), value: String(k) },
    { key: "h2", label: t("rowH2"), value: String(2 * k) },
    { key: "o2", label: t("rowO2"), value: String(k) },
    { key: "h2o", label: t("rowH2O"), value: String(2 * k), isKey: true },
    { key: "ratio", label: t("rowRatio"), value: "2 : 1 : 2" },
    { key: "atoms", label: t("rowAtoms"), value: `${6 * k} = ${6 * k}` },
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={1}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { a: ltr(String(2 * k)), b: ltr(String(k)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="sto-c1-handle" ticks={[1, 3, 6].map((x) => ({ at: x, text: `× ${x}` }))} />
          <KitControls s={s} valueText={valueText} testId="sto-c1" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="sto-c1" className="min-h-[270px] flex-1" fallback={<Ratio2D k={k} />} render3d={() => <RatioScene3D k={k} hover={hover} />} />}
    />
  );
}

// ── 6. Haber-Bosch tanks ──────────────────────────────────────────────────────────────
const T_MAX = 10;
function Tanks2D({ tonnes, masses }: { tonnes: number; masses: [number, number, number] }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 260 });
  const base = H - 40;
  // 35 % of the height at 0 t, full height at 10 t: the tanks never look empty.
  const unitH = ((H - 100) / 3) * (0.35 + (0.65 * tonnes) / T_MAX);
  const tanks = [
    { mol: 1, f: "N₂", fill: "var(--chem-el-n)", x: W * 0.2 },
    { mol: 3, f: "H₂", fill: "var(--chem-el-h)", x: W * 0.45 },
    { mol: 2, f: "NH₃", fill: "var(--chem-product)", x: W * 0.78 },
  ];
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g3(tonnes)} t N₂`}>
        <line x1={14} y1={base} x2={W - 14} y2={base} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeLinecap="round" />
        {tanks.map((tk, i) => {
          const h = Math.max(10, tk.mol * unitH);
          return (
            <g key={tk.f}>
              <rect x={tk.x - 30} y={base - h} width={60} height={h} rx={28} style={{ fill: tk.fill, stroke: "var(--ph-line)" }} strokeWidth={1} />
              <text x={tk.x} y={base - h - 10} fontSize={12.5} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                {`${g3(masses[i])} t`}
              </text>
              <text x={tk.x} y={H - 14} fontSize={11} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
                <SvgChem text={`${tk.mol} mol ${tk.f}`} />
              </text>
            </g>
          );
        })}
        <text x={W * 0.62} y={base - 20} fontSize={18} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          →
        </text>
      </svg>
    </div>
  );
}

export function StoTanksCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.tanks");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(1, { min: 1, max: T_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const molN2 = (s.value * 1e6) / M.N2;
  const h2 = (molN2 * 3 * M.H2) / 1e6;
  const nh3 = (molN2 * 2 * M.NH3) / 1e6;
  const masses: [number, number, number] = [s.value, h2, nh3];
  const valueText = `${s.value} t N₂`;
  const rows: KitRow[] = [
    { key: "n2", label: t("rowN2"), value: `${g3(s.value)} t` },
    { key: "mol", label: t("rowMol"), value: `${sciText(molN2)} mol` },
    { key: "h2", label: t("rowH2"), value: `${g3(h2)} t` },
    { key: "nh3", label: t("rowNH3"), value: `${g3(nh3)} t`, isKey: true },
    { key: "ratio", label: t("rowRatio"), value: "1 : 3 : 2" },
    { key: "mass", label: t("rowMass"), value: `${g3(s.value + h2)} t = ${g3(nh3)} t` },
  ];
  return (
    <IndicatorCard
      idPrefix="sto"
      n={6}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(g3(s.value)), h: ltr(g3(h2)), a: ltr(g3(nh3)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="sto-c6-handle" ticks={[1, 5, 10].map((x) => ({ at: x, text: `${x} t` }))} />
          <KitControls s={s} valueText={valueText} testId="sto-c6" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="sto-c6" className="min-h-[270px] flex-1" fallback={<Tanks2D tonnes={s.value} masses={masses} />} render3d={() => <TanksScene3D tonnes={s.value} max={T_MAX} masses={masses} hover={hover} />} />}
    />
  );
}

// ── 8. One mole of each ───────────────────────────────────────────────────────────────
function Mole2D({ index }: { index: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 230 });
  const n = SUBSTANCES.length;
  const rMax = Math.min((W - 40) / n / 2 - 1, (H - 70) / 2);
  const step = (W - 40 - 2 * rMax) / (n - 1);
  const rOf = (mm: number) => rd(rMax * Math.cbrt(mm / 180.16));
  const base = H - 34;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={uniFormula(SUBSTANCES[index].formula)}>
        {SUBSTANCES.map((sb, i) => {
          const x = 20 + rMax + i * step;
          const r = rOf(sb.mm);
          const sel = i === index;
          return (
            <g key={sb.formula}>
              <circle cx={x} cy={base - r} r={r} style={{ fill: sel ? "var(--chem-stock)" : "var(--chem-gas)", stroke: sel ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={sel ? 2.5 : 1} />
              <text x={x} y={base - 2 * r - 8 - (i % 2) * 14} fontSize={sel ? 12 : 10.5} fontWeight={sel ? 800 : 600} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                {Math.round(sb.mm)}
              </text>
              <text x={x} y={H - 10 - (i % 2) * 0} fontSize={10} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
                <SvgChem text={uniFormula(sb.formula)} />
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function StoMoleCard({ side }: { side: Side }) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.mole");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SUBSTANCE_SEED, { min: 0, max: SUBSTANCES.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const sb = SUBSTANCES[s.value];
  const f = uniFormula(sb.formula);
  const rows: KitRow[] = [
    { key: "f", label: t("rowFormula"), value: f },
    { key: "mm", label: t("rowMolarMass"), value: `${g3(sb.mm)} g/mol`, isKey: true },
    { key: "one", label: t("rowOneMole"), value: `${g3(sb.mm)} g` },
    { key: "per100", label: t("rowPer100"), value: `${g3(100 / sb.mm)} mol` },
    { key: "perG", label: t("rowPerGram"), value: sciText(AVOGADRO / sb.mm) },
    { key: "vsH2", label: t("rowVsH2"), value: `× ${g3(sb.mm / M.H2)}` },
  ];
  const valueText = `${f} · ${g3(sb.mm)} g/mol`;
  return (
    <IndicatorCard
      idPrefix="sto"
      n={8}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { f: ltr(f), m: ltr(g3(sb.mm)), n: ltr(g3(100 / sb.mm)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="sto-c8-handle" />
          <KitControls s={s} valueText={`${s.value + 1} / ${SUBSTANCES.length}`} testId="sto-c8" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="sto-c8" className="min-h-[240px] flex-1" fallback={<Mole2D index={s.value} />} render3d={() => <MoleScene3D index={s.value} hover={hover} />} />}
    />
  );
}
