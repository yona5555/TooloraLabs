"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { ballPoints, clamp } from "@/components/tool-ui/indicator-kit/format";
import { AVOGADRO, g3, liquidCss, sciText, SEED, SOLUTE_SEED_INDEX, SOLUTES } from "./molMath";

const CylindersScene3D = dynamic(() => import("./MolarityScenes3D").then((m) => m.CylindersScene3D), { ssr: false, loading: () => null });
const DropletScene3D = dynamic(() => import("./MolarityScenes3D").then((m) => m.DropletScene3D), { ssr: false, loading: () => null });
const HeapsScene3D = dynamic(() => import("./MolarityScenes3D").then((m) => m.HeapsScene3D), { ssr: false, loading: () => null });

type Side = "visual-left" | "table-left";

// ── 2. Same moles, two shapes ─────────────────────────────────────────────────────────
function Cylinders2D({ c1, v1, c2, v2 }: { c1: number; v1: number; c2: number; v2: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 250 });
  const base = H - 30;
  const k = (H - 70) / Math.max(v1, v2); // px per litre: the taller body always fills the box
  const wOf = (c: number) => Math.min(W * 0.36, 90 * Math.sqrt(c / Math.max(c1, c2)));
  const body = (cx: number, c: number, v: number, label: string) => {
    const w = wOf(c);
    const h = Math.max(6, v * k);
    return (
      <g>
        <rect x={cx - w / 2} y={base - h} width={w} height={h} rx={Math.min(10, w / 2, h / 2)} style={{ fill: liquidCss(c), stroke: "var(--ph-line)" }} strokeWidth={1.5} />
        <text x={cx} y={base - h - 10} fontSize={12} fontWeight={700} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g3(c2)} M`}>
        <line x1={12} y1={base} x2={W - 12} y2={base} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeLinecap="round" />
        {body(W * 0.28, c1, v1, `${g3(c1)} M · ${g3(v1)} L`)}
        {body(W * 0.72, c2, v2, `${g3(c2)} M · ${g3(v2)} L`)}
        <text x={W / 2} y={H - 8} fontSize={11} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
          {`n = ${g3(c1 * v1)} mol`}
        </text>
      </svg>
    </div>
  );
}

export function MolCylindersCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.cylinders");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SEED.v2, { min: 0.5, max: 5, step: 0.25 });
  const [hover, setHover] = useState<string | null>(null);
  const n = SEED.c1 * SEED.v1;
  const c2 = n / s.value;
  const valueText = `V₂ = ${g3(s.value)} L`;
  const rows: KitRow[] = [
    { key: "c1", label: "C₁", value: `${g3(SEED.c1)} mol/L` },
    { key: "v1", label: "V₁", value: `${g3(SEED.v1)} L` },
    { key: "n", label: t("rowN"), value: `${g3(n)} mol`, isKey: true },
    { key: "v2", label: "V₂", value: `${g3(s.value)} L` },
    { key: "c2", label: "C₂ = n / V₂", value: `${g3(c2)} mol/L` },
    { key: "factor", label: t("rowFactor"), value: `× ${g3(s.value / SEED.v1)}` },
    { key: "water", label: t("rowWater"), value: `${g3(s.value - SEED.v1)} L` },
  ];
  return (
    <IndicatorCard
      idPrefix="mol"
      n={2}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { v2: ltr(g3(s.value)), c2: ltr(g3(c2)), n: ltr(g3(n)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mol-c2-handle" ticks={[0.5, 2.5, 5].map((v) => ({ at: v, text: `${v} L` }))} />
          <KitControls s={s} valueText={valueText} testId="mol-c2" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <ViewportScene
          testId="mol-c2"
          className="min-h-[250px] flex-1"
          fallback={<Cylinders2D c1={SEED.c1} v1={SEED.v1} c2={c2} v2={s.value} />}
          render3d={() => <CylindersScene3D c1={SEED.c1} v1={SEED.v1} c2={c2} v2={s.value} hover={hover} />}
        />
      }
    />
  );
}

// ── 4. Particle droplet ───────────────────────────────────────────────────────────────
const DROP = ballPoints(64, 211);
/** Shown particles for a molarity: log-scaled from 1 mM (2) to 10 M (60). */
const dropCount = (x: number) => clamp(Math.round(2 + (x + 3) * 14.5), 2, 60);

function Droplet2D({ count, molarity }: { count: number; molarity: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 240 });
  const r = Math.min(H / 2 - 8, W * 0.3);
  const cx = r + 10;
  const cy = H / 2;
  const lx = cx + r + 22;
  const lw = Math.max(40, W - lx - 12);
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g3(molarity)} M`}>
        <circle cx={cx} cy={cy} r={r} style={{ fill: liquidCss(molarity), fillOpacity: 0.45, stroke: "var(--ph-line)" }} strokeWidth={1.5} />
        {DROP.slice(0, count).map(([x, y], i) => (
          <circle key={i} cx={cx + x * r * 0.86} cy={cy + y * r * 0.86} r={Math.max(3.5, r / 22)} style={{ fill: "var(--chem-solute)", stroke: "var(--ph-knob)" }} strokeWidth={1} />
        ))}
        <text x={W - 12} y={cy - 12} fontSize={12} fontWeight={700} textAnchor="end" style={{ fill: "var(--ph-ink)" }}>
          {`${g3(molarity)} mol/L`}
        </text>
        <rect x={lx} y={cy} width={lw} height={12} rx={6} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} strokeWidth={1} />
        <rect x={lx} y={cy} width={Math.max(12, (lw * count) / 60)} height={12} rx={6} style={{ fill: "var(--chem-solute)" }} />
      </svg>
    </div>
  );
}

export function MolDropletCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.droplet");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(Math.log10(SEED.molarity), { min: -3, max: 1, step: 0.1 });
  const [hover, setHover] = useState<string | null>(null);
  const m = 10 ** s.value;
  const count = dropCount(s.value);
  const perMl = m * 1e-3 * AVOGADRO;
  const valueText = `${g3(m)} mol/L`;
  const rows: KitRow[] = [
    { key: "m", label: t("rowM"), value: `${g3(m)} mol/L`, isKey: true },
    { key: "log", label: "log₁₀ M", value: s.value.toFixed(1) },
    { key: "mmol", label: t("rowMmol"), value: `${g3(m * 1000)} mmol/L` },
    { key: "ml", label: t("rowPerMlMol"), value: `${sciText(m * 1e-3)} mol` },
    { key: "units", label: t("rowPerMl"), value: sciText(perMl) },
    { key: "ul", label: t("rowPerUl"), value: sciText(perMl * 1e-3) },
    { key: "shown", label: t("rowShown"), value: String(count) },
  ];
  return (
    <IndicatorCard
      idPrefix="mol"
      n={4}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { m: ltr(g3(m)), units: ltr(sciText(perMl)), shown: ltr(String(count)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mol-c4-handle" ticks={[-3, -1, 1].map((x) => ({ at: x, text: `${g3(10 ** x)} M` }))} />
          <KitControls s={s} valueText={valueText} testId="mol-c4" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="mol-c4" className="min-h-[240px] flex-1" fallback={<Droplet2D count={count} molarity={m} />} render3d={() => <DropletScene3D count={count} molarity={m} hover={hover} />} />}
    />
  );
}

// ── 7. Molar-mass heaps ───────────────────────────────────────────────────────────────
function Heaps2D({ index }: { index: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 230 });
  const base = H - 22;
  const step = (W - 60) / (SOLUTES.length - 1);
  const hOf = (g: number) => 20 + (g / 342.3) * (H - 90);
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={SOLUTES[index].formula}>
        <line x1={10} y1={base} x2={W - 10} y2={base} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeLinecap="round" />
        {SOLUTES.map((sol, i) => {
          const x = 30 + i * step;
          const h = hOf(sol.molarMass);
          const sel = i === index;
          const half = Math.min(24, step / 2 - 3);
          return (
            <g key={sol.key}>
              <path d={`M ${x - half} ${base} Q ${x} ${base - h * 1.15} ${x + half} ${base} Z`} style={{ fill: sel ? "var(--chem-stock)" : "var(--chem-solvent)", stroke: sel ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={sel ? 2.5 : 1} />
              <text x={x} y={base - h * 0.6 - (i % 2 === 0 ? 10 : 26)} fontSize={sel ? 12 : 10.5} fontWeight={sel ? 800 : 600} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                {sol.molarMass.toFixed(0)}
              </text>
            </g>
          );
        })}
        <text x={W - 10} y={H - 4} fontSize={11} textAnchor="end" style={{ fill: "var(--ph-ink-muted)" }}>
          <SvgChem text="g / 1 mol" />
        </text>
      </svg>
    </div>
  );
}

export function MolHeapsCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molarity-calculator.visuals.solutes");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(SOLUTE_SEED_INDEX, { min: 0, max: SOLUTES.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const sol = SOLUTES[s.value];
  const name = t(`items.${sol.key}`);
  const forDefault = sol.molarMass * SEED.molarity * SEED.volume;
  const rows: KitRow[] = [
    { key: "name", label: t("rowName"), value: name },
    { key: "formula", label: t("rowFormula"), value: sol.formula },
    { key: "mm", label: t("rowMolarMass"), value: `${sol.molarMass.toFixed(2)} g/mol` },
    { key: "oneM", label: t("rowOneMolar"), value: `${sol.molarMass.toFixed(2)} g` },
    { key: "default", label: t("rowDefault"), value: `${g3(forDefault)} g`, isKey: true },
    { key: "per100", label: t("rowPer100"), value: `${g3(100 / sol.molarMass)} mol` },
  ];
  const valueText = `${name} · ${sol.molarMass.toFixed(2)} g/mol`;
  return (
    <IndicatorCard
      idPrefix="mol"
      n={7}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { name, formula: sol.formula, g: ltr(g3(forDefault)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mol-c7-handle" />
          <KitControls s={s} valueText={`${s.value + 1} / ${SOLUTES.length}`} testId="mol-c7" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="mol-c7" className="min-h-[230px] flex-1" fallback={<Heaps2D index={s.value} />} render3d={() => <HeapsScene3D index={s.value} hover={hover} />} />}
    />
  );
}
