"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, SvgChem, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { g3, sciText } from "../molarity-calculator/molMath";
import { atomsOf, uniFormula } from "../chemical-equation-balancer/chemMath";
import { SvgMolecule } from "../chemical-equation-balancer/Molecules2D";
import { AVOGADRO, BEAKER_ML, CUSO4_M, GROUPS, HYDRATE_MAX, hydrateFormula, partsOf, WATER_DENSITY, WATER_M } from "./mmMath";
import { svgPx } from "@/components/tool-ui/svgPx";

const BeakerScene3D = dynamic(() => import("./MolarMassScenes3D").then((m) => m.BeakerScene3D), { ssr: false, loading: () => null });
const HydrateScene3D = dynamic(() => import("./MolarMassScenes3D").then((m) => m.HydrateScene3D), { ssr: false, loading: () => null });
const GroupsScene3D = dynamic(() => import("./MolarMassScenes3D").then((m) => m.GroupsScene3D), { ssr: false, loading: () => null });

type Side = "visual-left" | "table-left";
const f3 = (v: number) => String(Number(v.toFixed(3)));
const elFill = (el: string) => `var(--chem-el-${el.toLowerCase()}, var(--chem-el-other))`;
/** "Ca(OH)2" → "Ca(OH)₂" (counts after ")" too). */
const fx = (f: string) => uniFormula(f);

// ── 1. n mol of water: weighed (g) and poured (mL) ────────────────────────────────────
function Beaker2D({ volume, label }: { volume: number; label: string }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 280 });
  const bw = Math.min(170, W * 0.42);
  const L = W / 2 - bw / 2;
  const R = W / 2 + bw / 2;
  const top = 34;
  const bottom = H - 14;
  const yv = (ml: number) => bottom - ((bottom - top) * ml) / BEAKER_ML;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={label}>
        <path d={`M ${L} ${yv(volume)} L ${L} ${bottom - 12} Q ${L} ${bottom} ${L + 12} ${bottom} L ${R - 12} ${bottom} Q ${R} ${bottom} ${R} ${bottom - 12} L ${R} ${yv(volume)} Z`} style={{ fill: "var(--chem-cold)", opacity: 0.7 }} />
        <path d={`M ${L} ${top - 10} L ${L} ${bottom - 12} Q ${L} ${bottom} ${L + 12} ${bottom} L ${R - 12} ${bottom} Q ${R} ${bottom} ${R} ${bottom - 12} L ${R} ${top - 10}`} fill="none" style={{ stroke: "var(--ph-line)" }} strokeWidth={2.5} />
        {[50, 100, 150, 200].map((ml) => (
          <g key={ml}>
            <line x1={R - 18} x2={R} y1={yv(ml)} y2={yv(ml)} style={{ stroke: "var(--ph-ink-muted)" }} />
            <text x={R + 8} y={yv(ml) + 4} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>{`${ml} mL`}</text>
          </g>
        ))}
        <text x={W / 2} y={Math.max(18, yv(volume) - 10)} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(13), fill: "var(--ph-ink)" }}>
          {label}
        </text>
      </svg>
    </div>
  );
}

export function MmBeakerCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.beaker");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(1, { min: 0.5, max: 10, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const m = s.value * WATER_M;
  const v = m / WATER_DENSITY;
  const label = `${g3(m)} g · ${g3(v)} mL`;
  const valueText = `${s.value} mol H₂O`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowMoles"), value: `${s.value} mol` },
    { key: "M", label: "M (H₂O)", value: `${f3(WATER_M)} g/mol` },
    { key: "m", label: "m = n × M", value: `${g3(m)} g`, isKey: true },
    { key: "v", label: t("rowVolume"), value: `${g3(v)} mL` },
    { key: "N", label: "N = n × Nₐ", value: sciText(s.value * AVOGADRO) },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={1}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(s.value)), m: ltr(g3(m)), v: ltr(g3(v)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mm-c1-handle" ticks={[0.5, 5, 10].map((x) => ({ at: x, text: `${x} mol` }))} />
          <KitControls s={s} valueText={valueText} testId="mm-c1" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="mm-c1" className="min-h-[300px] flex-1" fallback={<Beaker2D volume={v} label={label} />} render3d={() => <BeakerScene3D volume={v} label={label} hover={hover} />} />}
    />
  );
}

// ── 3. Copper(II) sulfate hydrates: n bound waters ────────────────────────────────────
function Hydrate2D({ n, label }: { n: number; label: string }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 260 });
  const cx = W / 2;
  const cy = H / 2 - 12;
  const size = Math.min(70, H * 0.28);
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={label}>
        <SvgMolecule formula="CuSO4" x={cx} y={cy} size={size} />
        {Array.from({ length: n }, (_, i) => {
          const a = (i / Math.max(1, n)) * Math.PI * 2 + 0.4;
          return <SvgMolecule key={i} formula="H2O" x={cx + Math.round(Math.cos(a) * Math.min(W * 0.32, 150))} y={cy + Math.round(Math.sin(a) * (H * 0.3))} size={size * 0.75} />;
        })}
        <text x={cx} y={H - 12} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(14), fill: "var(--ph-ink)" }}>
          <SvgChem text={label} />
        </text>
      </svg>
    </div>
  );
}

export function MmHydrateCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.hydrate");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(HYDRATE_MAX, { min: 0, max: HYDRATE_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const n = s.value;
  const water = n * WATER_M;
  const M = CUSO4_M + water;
  const label = `${fx(hydrateFormula(n))} · ${f3(M)} g/mol`;
  const valueText = `n = ${n}`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowN"), value: String(n) },
    { key: "salt", label: "M (CuSO₄)", value: `${f3(CUSO4_M)} g/mol` },
    { key: "water", label: `${n} × M (H₂O)`, value: `${f3(water)} g/mol` },
    { key: "M", label: t("rowTotal"), value: `${f3(M)} g/mol`, isKey: true },
    { key: "pct", label: t("rowWaterPct"), value: `${((100 * water) / M).toFixed(1)} %` },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={3}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { f: ltr(fx(hydrateFormula(n))), m: ltr(f3(M)), p: ltr(((100 * water) / M).toFixed(1)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mm-c3-handle" ticks={[0, HYDRATE_MAX].map((x) => ({ at: x, text: `${x} H₂O` }))} />
          <KitControls s={s} valueText={valueText} testId="mm-c3" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="mm-c3" className="min-h-[340px] flex-1" fallback={<Hydrate2D n={n} label={label} />} render3d={() => <HydrateScene3D n={n} label={label.replace(/[₀-₉]+/g, (d) => `_{${[...d].map((c) => c.charCodeAt(0) - 0x2080).join("")}}`)} hover={hover} />} />}
    />
  );
}

// ── 7. Groups: a subscript after ")" multiplies every atom inside ─────────────────────
function Groups2D({ index }: { index: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 300 });
  const g = GROUPS[index];
  const parts = partsOf(g.formula)?.parts ?? [];
  const inGroup = new Set(Object.keys(atomsOf(g.group) ?? {}));
  const n = parts.length;
  const colW = (W - 20) / n;
  const maxCount = Math.max(1, ...parts.map((p) => p.count));
  const base = H - 30;
  // Spheres as large as the tallest tower allows (12 O in Al₂(SO₄)₃), so no band stays empty.
  const r = Math.max(5, Math.min(28, colW * 0.3, (base - 70) / (maxCount * 2.1)));
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={g.formula}>
        {parts.map((pt, i) => {
          const x = 10 + colW * (i + 0.5);
          const grp = inGroup.has(pt.symbol);
          return (
            <g key={pt.symbol}>
              {Array.from({ length: pt.count }, (_, k) => (
                <circle key={k} cx={x} cy={base - r - k * (2 * r + 1.5)} r={r} style={{ fill: elFill(pt.symbol), stroke: "var(--ph-line)" }} strokeWidth={0.8} />
              ))}
              <text x={x} y={base - pt.count * (2 * r + 1.5) - 8} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(14), fill: "var(--ph-ink)" }}>
                {pt.count}
              </text>
              <text x={x} y={base + 20} fontWeight={700} textAnchor="middle" style={{ fontSize: svgPx(13), fill: grp ? "var(--ph-focus)" : "var(--ph-ink)" }}>
                {grp ? `${pt.symbol} ×${g.mult}` : pt.symbol}
              </text>
            </g>
          );
        })}
        <text x={W / 2} y={22} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(15), fill: "var(--ph-ink)" }}>
          <SvgChem text={fx(g.formula)} />
        </text>
      </svg>
    </div>
  );
}

export function MmGroupsCard({ side }: { side: Side }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.groups");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(0, { min: 0, max: GROUPS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const g = GROUPS[s.value];
  const pr = partsOf(g.formula);
  const inner = atomsOf(g.group) ?? {};
  const atoms = (pr?.parts ?? []).reduce((a, p) => a + p.count, 0);
  const valueText = `${s.value + 1} / ${GROUPS.length} · ${fx(g.formula)}`;
  const rows: KitRow[] = [
    { key: "mult", label: t("rowGroup"), value: `(${fx(g.group)}) × ${g.mult}` },
    ...Object.entries(inner).map(([el, k]) => ({ key: el, label: t("rowInside", { el }), value: `${k} × ${g.mult} = ${k * g.mult}` })),
    { key: "atoms", label: t("rowAtoms"), value: String(atoms) },
    { key: "M", label: `M (${fx(g.formula)})`, value: `${f3(pr?.total ?? 0)} g/mol`, isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="mm"
      n={7}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { f: ltr(fx(g.formula)), g: ltr(fx(g.group)), k: ltr(String(g.mult)), m: ltr(f3(pr?.total ?? 0)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="mm-c7-handle" ticks={[0, GROUPS.length - 1].map((i) => ({ at: i, text: `${i + 1}` }))} />
          <KitControls s={s} valueText={valueText} testId="mm-c7" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="mm-c7" className="min-h-[320px] flex-1" fallback={<Groups2D index={s.value} />} render3d={() => <GroupsScene3D index={s.value} hover={hover} />} />}
    />
  );
}
