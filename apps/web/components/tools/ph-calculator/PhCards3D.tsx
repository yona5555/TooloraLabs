"use client";
import { useState, useId } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, SvgChem, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { ballPoints, f2, ratio, sci, sup } from "@/components/tool-ui/indicator-kit/format";
import { classify, DILUTION_MAX_STEPS, dilutionPh, ions, particleCounts, PH_SEED, SHELF, shelfSeedIndex, uiCss } from "./phMath";
import { svgPx } from "@/components/tool-ui/svgPx";

const ShelfScene3D = dynamic(() => import("./PhScenes3D").then((m) => m.ShelfScene3D), { ssr: false, loading: () => null });
const DilutionScene3D = dynamic(() => import("./PhScenes3D").then((m) => m.DilutionScene3D), { ssr: false, loading: () => null });
const ParticleScene3D = dynamic(() => import("./PhScenes3D").then((m) => m.ParticleScene3D), { ssr: false, loading: () => null });

type Side = "visual-left" | "table-left";
const DROPLET_TOTAL = 60;

// ── 3. Everyday substances shelf ──────────────────────────────────────────────────────
function Shelf2D({ index }: { index: number }) {
  const svgId = useId();
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 220 });
  const X0 = 22;
  const X1 = W - 22;
  const x = (p: number) => X0 + (p / 14) * (X1 - X0);
  const barY = H - 58;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`pH ${SHELF[index].pH}`}>
        <defs>
          <linearGradient id={`${svgId}ph-shelf-bar`} x1="0" x2="1" y1="0" y2="0">
            {Array.from({ length: 15 }, (_, i) => (
              <stop key={i} offset={`${(i / 14) * 100}%`} style={{ stopColor: `var(--ph-ui-${i})` }} />
            ))}
          </linearGradient>
        </defs>
        <rect x={X0 - 8} y={barY} width={X1 - X0 + 16} height={14} rx={7} fill={`url(#${svgId}ph-shelf-bar)`} style={{ stroke: "var(--ph-line)" }} />
        {SHELF.map((s, i) => {
          const up = i % 2 === 0;
          const sel = i === index;
          const bodyTop = up ? 34 : 64;
          return (
            <g key={s.key}>
              <rect x={x(s.pH) - 8} y={bodyTop} width={16} height={barY - 4 - bodyTop} rx={8} style={{ fill: uiCss(s.pH), stroke: sel ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={sel ? 3 : 1} />
              <text x={x(s.pH)} y={bodyTop - 8} fontWeight={sel ? 800 : 600} textAnchor="middle" style={{ fontSize: svgPx(sel ? 12.5 : 12), fill: "var(--ph-ink)" }}>
                {String(s.pH)}
              </text>
            </g>
          );
        })}
        {[0, 7, 14].map((p) => (
          <text key={p} x={x(p)} y={H - 20} textAnchor={p === 0 ? "start" : p === 14 ? "end" : "middle"} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
            {`pH ${p}`}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function PhShelfCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.shelf");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(shelfSeedIndex(), { min: 0, max: SHELF.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const sub = SHELF[s.value];
  const x = ions(sub.pH);
  const name = t(`items.${sub.key}`);
  const water = x.h / 1e-7;
  const cls = tc(classify(sub.pH));
  const valueText = `${name} · pH ${sub.pH}`;
  const rows: KitRow[] = [
    { key: "name", label: t("rowName"), value: name, isKey: true },
    { key: "ph", label: t("rowPh"), value: f2(sub.pH) },
    { key: "h", label: "[H⁺]", value: `${sci(x.h)} M` },
    { key: "water", label: t("rowWater"), value: water >= 1 ? `× ${ratio(water)}` : `÷ ${ratio(1 / water)}` },
    { key: "poh", label: "pOH", value: f2(x.pOH) },
    { key: "oh", label: "[OH⁻]", value: `${sci(x.oh)} M` },
    { key: "class", label: t("rowClass"), value: cls },
  ];
  return (
    <IndicatorCard
      n={3}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { name, pH: ltr(f2(sub.pH)), cls })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="ph-c3-handle" />
          <KitControls s={s} valueText={`${s.value + 1} / ${SHELF.length}`} testId="ph-c3" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="c3" className="min-h-[220px] flex-1" fallback={<Shelf2D index={s.value} />} render3d={() => <ShelfScene3D index={s.value} hover={hover} />} />}
    />
  );
}

// ── 5. Dilution ───────────────────────────────────────────────────────────────────────
function Dilution2D({ steps, pH }: { steps: number; pH: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 240 });
  // [left label 62px][beaker][right label 84px], centred; the beaker takes the rest (capped).
  const bw = Math.min(W - 146, 1.8 * H);
  const L = (W - (bw + 146)) / 2 + 62;
  const R = L + bw;
  const top = 14;
  const bottom = H - 8;
  const fill = (k: number) => 26 + (k / DILUTION_MAX_STEPS) * (bottom - top - 40);
  const level = bottom - fill(steps);
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`pH ${f2(pH)}`}>
        <path d={`M ${L + 3} ${level} L ${L + 3} ${bottom - 18} Q ${L + 3} ${bottom - 3} ${L + 18} ${bottom - 3} L ${R - 18} ${bottom - 3} Q ${R - 3} ${bottom - 3} ${R - 3} ${bottom - 18} L ${R - 3} ${level} Z`} style={{ fill: uiCss(pH), opacity: 0.7 }} />
        <path d={`M ${L} ${top} L ${L} ${bottom - 18} Q ${L} ${bottom} ${L + 18} ${bottom} L ${R - 18} ${bottom} Q ${R} ${bottom} ${R} ${bottom - 18} L ${R} ${top}`} fill="none" style={{ stroke: "var(--ph-line)" }} strokeWidth={2.5} strokeLinecap="round" />
        {Array.from({ length: DILUTION_MAX_STEPS + 1 }, (_, k) => {
          const y = bottom - fill(k);
          return <line key={k} x1={R} y1={y} x2={R + 12} y2={y} style={{ stroke: k === steps ? "var(--ph-focus)" : "var(--ph-line)" }} strokeWidth={k === steps ? 3 : 1.5} strokeLinecap="round" />;
        })}
        <text x={R + 18} y={level + 4} fontWeight={800} style={{ fontSize: svgPx(12.5), fill: "var(--ph-ink)" }}>
          {`pH ${f2(pH)}`}
        </text>
        <text x={L - 10} y={level + 4} textAnchor="end" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
          <SvgChem text={`V × 10${sup(steps)}`} />
        </text>
      </svg>
    </div>
  );
}

export function PhDilutionCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.dilution");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(0, { min: 0, max: DILUTION_MAX_STEPS, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const pH = dilutionPh(PH_SEED, s.value);
  const naive = PH_SEED + s.value;
  const valueText = `V × 10${sup(s.value)}`;
  const rows: KitRow[] = [
    { key: "k", label: t("rowK"), value: String(s.value) },
    { key: "factor", label: t("rowFactor"), value: `× 10${sup(s.value)}` },
    { key: "h", label: "[H⁺]", value: `${sci(10 ** -pH)} M` },
    { key: "ph", label: "pH", value: f2(pH), isKey: true },
    { key: "naive", label: t("rowNaive"), value: f2(naive) },
    { key: "gap", label: t("rowGap"), value: f2(7 - pH) },
    { key: "poh", label: "pOH", value: f2(14 - pH) },
    { key: "oh", label: "[OH⁻]", value: `${sci(10 ** (pH - 14))} M` },
  ];
  return (
    <IndicatorCard
      n={5}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle", { pH: ltr(f2(PH_SEED)) })}
      caption={t("caption", { k: ltr(String(s.value)), pH: ltr(f2(pH)), naive: ltr(f2(naive)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="ph-c5-handle" ticks={Array.from({ length: DILUTION_MAX_STEPS + 1 }, (_, k) => ({ at: k, text: `10${sup(k)}` }))} />
          <KitControls s={s} valueText={valueText} testId="ph-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="c5" className="min-h-[240px] flex-1" fallback={<Dilution2D steps={s.value} pH={pH} />} render3d={() => <DilutionScene3D steps={s.value} pH={pH} hover={hover} />} />}
    />
  );
}

// ── 8. Particle counter ───────────────────────────────────────────────────────────────
const DROP = ballPoints(DROPLET_TOTAL, 101);
function Particles2D({ pH }: { pH: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 240 });
  const n = particleCounts(pH, DROPLET_TOTAL);
  const r = Math.min(H / 2 - 8, W * 0.34);
  const cx = r + 10;
  const cy = H / 2;
  // Legend beside the droplet: shown counts as rounded bars (log-scaled, like the droplet).
  const lx = cx + r + 22;
  const lw = Math.max(40, W - lx - 12);
  const bar = (y: number, count: number, tint: string, label: string) => (
    <g>
      <text x={lx} y={y} fontWeight={700} style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
        <SvgChem text={label} />
      </text>
      <rect x={lx} y={y + 8} width={lw} height={12} rx={6} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} strokeWidth={1} />
      <rect x={lx} y={y + 8} width={Math.max(12, (lw * count) / DROPLET_TOTAL)} height={12} rx={6} style={{ fill: tint }} />
    </g>
  );
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`pH ${f2(pH)}`}>
        <circle cx={cx} cy={cy} r={r} style={{ fill: "var(--ph-water)", fillOpacity: 0.18, stroke: "var(--ph-line)" }} strokeWidth={1.5} />
        {DROP.map(([x, y], i) => (
          <circle key={i} cx={cx + x * r * 0.86} cy={cy + y * r * 0.86} r={Math.max(4, r / 20)} style={{ fill: i < n.h ? "var(--ph-ion-h)" : "var(--ph-ion-oh)", stroke: "var(--ph-knob)" }} strokeWidth={1} />
        ))}
        {bar(cy - 46, n.h, "var(--ph-ion-h)", `H₃O⁺ ${n.h}`)}
        {bar(cy + 18, n.oh, "var(--ph-ion-oh)", `OH⁻ ${n.oh}`)}
      </svg>
    </div>
  );
}

export function PhParticleCard({ side }: { side: Side }) {
  const t = useTranslations("tools.ph-calculator.visuals.particles");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = useStepper(PH_SEED, { min: 0, max: 14, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const x = ions(s.value);
  const n = particleCounts(s.value, DROPLET_TOTAL);
  const r = x.h / x.oh;
  const valueText = `pH ${f2(s.value)}`;
  const rows: KitRow[] = [
    { key: "ph", label: "pH", value: f2(s.value) },
    { key: "h", label: "[H₃O⁺]", value: `${sci(x.h)} M` },
    { key: "oh", label: "[OH⁻]", value: `${sci(x.oh)} M` },
    { key: "ratio", label: t("rowRatio"), value: `${ratio(r)} : 1`, isKey: true },
    { key: "shown", label: t("rowShown"), value: `${n.h} : ${n.oh}` },
    { key: "poh", label: "pOH", value: f2(x.pOH) },
    { key: "log", label: t("rowLog"), value: f2(Math.log10(r)) },
    { key: "class", label: t("rowClass"), value: tc(classify(s.value)) },
  ];
  return (
    <IndicatorCard
      n={8}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { pH: ltr(f2(s.value)), nh: ltr(String(n.h)), noh: ltr(String(n.oh)), r: ltr(ratio(r)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="ph-c8-handle" ticks={[0, 7, 14].map((p) => ({ at: p, text: `pH ${p}` }))} />
          <KitControls s={s} valueText={valueText} testId="ph-c8" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="c8" className="min-h-[240px] flex-1" fallback={<Particles2D pH={s.value} />} render3d={() => <ParticleScene3D pH={s.value} hover={hover} />} />}
    />
  );
}
