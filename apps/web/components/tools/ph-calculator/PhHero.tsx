"use client";
import { useCallback, useState, useId } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { GlassHandle } from "@/components/tool-ui/glass/GlassPrimitives";
import { useAnchoredDrag } from "@/components/tool-ui/indicator-kit/useAnchoredDrag";
import { KitControls, SvgHandle, useMeasuredSize, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { ballPoints, f2, snap } from "@/components/tool-ui/indicator-kit/format";
import { particleCounts, PH_MAX, PH_MIN, PH_SEED, uiCss } from "./phMath";
import type { HeroProjection } from "./PhHeroScene3D";

const HeroScene3D = dynamic(() => import("./PhHeroScene3D"), { ssr: false, loading: () => null });

const STEP = 0.1;
const PTS_H = ballPoints(44, 11);
const PTS_OH = ballPoints(44, 29);

/**
 * 2D twin of the 3D beaker (no WebGL, or no free WebGL slot): same liquid colour, particles and
 * scale, laid out in real pixels so it fills the whole scene box at any width.
 */
function Hero2D({ s, valueText, label }: { s: Stepper; valueText: string; label: string }) {
  const svgId = useId();
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 380, h: 320 });
  const BAR_X = W - 56;
  const BAR_TOP = 22;
  const BAR_BOTTOM = H - 22;
  const yFor = (pH: number) => BAR_BOTTOM - (pH / 14) * (BAR_BOTTOM - BAR_TOP);
  const drag = useAnchoredDrag(s.value, () => [0, -(BAR_BOTTOM - BAR_TOP)], s.set);
  const counts = particleCounts(s.value, 44);
  const L = 16;
  const R = BAR_X - 48;
  const top = 14;
  const bottom = H - 10;
  const liquidTop = top + (bottom - top) * 0.3;
  const cx = (L + R) / 2;
  const cy = (liquidTop + bottom) / 2;
  const dot = (p: [number, number, number]) => [cx + p[0] * ((R - L) / 2 - 14), cy + p[1] * ((bottom - liquidTop) / 2 - 12)] as const;
  return (
    <div ref={box} dir="ltr" className="relative w-full flex-1" data-scale-vb={`${BAR_X},${BAR_BOTTOM},${BAR_X},${BAR_TOP},${W},${H}`}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        <defs>
          <linearGradient id={`${svgId}ph-hero-bar`} x1="0" y1="1" x2="0" y2="0">
            {Array.from({ length: 15 }, (_, i) => (
              <stop key={i} offset={`${(i / 14) * 100}%`} style={{ stopColor: `var(--ph-ui-${i})` }} />
            ))}
          </linearGradient>
        </defs>
        <path d={`M ${L} ${top} L ${L} ${bottom - 20} Q ${L} ${bottom} ${L + 20} ${bottom} L ${R - 20} ${bottom} Q ${R} ${bottom} ${R} ${bottom - 20} L ${R} ${top}`} fill="none" style={{ stroke: "var(--ph-line)" }} strokeWidth={2.5} strokeLinecap="round" />
        <path d={`M ${L + 3} ${liquidTop} L ${L + 3} ${bottom - 20} Q ${L + 3} ${bottom - 3} ${L + 20} ${bottom - 3} L ${R - 20} ${bottom - 3} Q ${R - 3} ${bottom - 3} ${R - 3} ${bottom - 20} L ${R - 3} ${liquidTop} Z`} style={{ fill: uiCss(s.value), opacity: 0.7 }} />
        {PTS_H.slice(0, counts.h).map((p, i) => (
          <circle key={`h${i}`} cx={dot(p)[0]} cy={dot(p)[1]} r={4.5} style={{ fill: "var(--ph-ion-h)" }} />
        ))}
        {PTS_OH.slice(0, counts.oh).map((p, i) => (
          <circle key={`o${i}`} cx={dot(p)[0]} cy={dot(p)[1]} r={4.5} style={{ fill: "var(--ph-ion-oh)", stroke: "var(--ph-knob)" }} strokeWidth={1} />
        ))}
        <rect x={BAR_X - 7} y={BAR_TOP - 7} width={14} height={BAR_BOTTOM - BAR_TOP + 14} rx={7} fill={`url(#${svgId}ph-hero-bar)`} style={{ stroke: "var(--ph-line)" }} strokeWidth={1} />
        {[0, 2, 4, 7, 10, 12, 14].map((tk) => (
          <text key={tk} x={BAR_X + 24} y={yFor(tk) + 4} fontSize={11} style={{ fill: "var(--ph-ink-muted)" }}>
            {tk}
          </text>
        ))}
      </svg>
      <SvgHandle x={BAR_X} y={yFor(s.value)} viewW={W} viewH={H} direction="vertical" label={label} valueText={valueText} s={s} drag={drag} testId="ph-hero-handle" />
    </div>
  );
}

/**
 * §44: the 3D scene at the top of the Result card — beaker, indicator-coloured liquid, log-scaled
 * H₃O⁺/OH⁻ particles and the 0–14 scale whose marker writes back into the calculator — plus its
 * own − / + / reset buttons. The Result card renders the values below it.
 */
export default function PhResultScene({ pH, onSetPh }: { pH: number; onSetPh: (pH: number) => void }) {
  const t = useTranslations("tools.ph-calculator.visuals.hero");
  const value = snap(pH, 0.01, PH_MIN, PH_MAX);
  const set = useCallback((v: number) => onSetPh(snap(v, STEP, PH_MIN, PH_MAX)), [onSetPh]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + STEP),
    dec: () => set(value - STEP),
    reset: () => set(PH_SEED),
    flash: 0,
    atMin: value <= PH_MIN,
    atMax: value >= PH_MAX,
    isSeed: value === PH_SEED,
    min: PH_MIN,
    max: PH_MAX,
    step: STEP,
  };
  const valueText = `pH ${f2(value)}`;
  const [proj, setProj] = useState<HeroProjection | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag3d = useAnchoredDrag(value, () => (proj ? [proj.top[0] - proj.bottom[0], proj.top[1] - proj.bottom[1]] : null), set, setDragging);

  return (
    <div data-ph-scene-block className="flex min-h-[340px] flex-1 flex-col gap-3 lg:min-h-[320px]">
      <ViewportScene
        testId="hero"
        className="min-h-[280px] flex-1"
        fallback={<Hero2D s={s} valueText={valueText} label={t("handle")} />}
        render3d={() => (
          <div className="absolute inset-0" dir="ltr" data-testid="ph-hero-3d">
            <HeroScene3D pH={value} dragging={dragging} onProject={setProj} />
            {proj && (
              <div
                data-testid="ph-hero-handle"
                data-scale={[...proj.bottom, ...proj.top].map((n) => n.toFixed(1)).join(",")}
                aria-valuetext={valueText}
                className="absolute inset-0"
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="absolute h-11 w-11 touch-none"
                  style={{ left: proj.marker[0], top: proj.marker[1], transform: "translate(-50%, -50%)", pointerEvents: "auto" }}
                  {...drag3d}
                >
                  <GlassHandle
                    direction="vertical"
                    ariaLabel={t("handle")}
                    onStep={(d) => (d > 0 ? s.inc() : s.dec())}
                    valueNow={value}
                    valueMin={PH_MIN}
                    valueMax={PH_MAX}
                    style={{ left: 0, top: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      />
      <KitControls s={s} valueText={valueText} testId="ph-hero" />
    </div>
  );
}
