"use client";
/**
 * The unit circle (§38 -- circles/arcs/lines only, no squares). Draggable red radius hand + its
 * filled angle arc, green dashed cos/sin projections onto the axes, live sin/cos/tan readouts,
 * and a sin+cos wave strip underneath sharing the same theta. The only card in the sidebar
 * column (the common-angles table was removed), and it `fill`s whatever height remains after
 * the History card's own natural height (§41) -- a ResizeObserver measures its own box on every
 * resize and recomputes the circle's geometry from the REAL measured width/height each time, so
 * the viewBox always equals the rendered pixel size 1:1 (no preserveAspectRatio letterboxing,
 * no scale-factor font-size math -- a `fontSize` value IS its rendered CSS pixel size).
 *
 * RTL: every numeral/coordinate/degree/radian label (HTML badges AND SVG text) is rendered as an
 * isolated LTR run (`dir="ltr"` + `unicode-bidi: isolate` on HTML, `direction="ltr"` +
 * `unicode-bidi: isolate` on SVG text/tspan) and uses the true minus sign (U+2212) everywhere --
 * never a bare ASCII hyphen -- so the Arabic page's RTL base direction can never reorder a
 * coordinate's sign, which is exactly the defect this replaces (a plain "-1" inside RTL content
 * rendering as "1-").
 *
 * Seeded once from the calculator's own mode/display (ScientificSidebarPanels), fully independent
 * after that; the Deg/Rad badge keeps reading the calculator's live mode by design.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { GlassHeroCard, GlassHandle, useValueFlash } from "@/components/tool-ui/glass/GlassPrimitives";
import "@/components/tool-ui/glass/glass-tokens.css";
import { useScientificCalcReadonly } from "./ScientificCalcReadonlyContext";
import { safeTan, round4 } from "./scientificAngleData";

const MINUS = "−";
const LTR_ISOLATE: CSSProperties = { direction: "ltr", unicodeBidi: "isolate" };

function fmtSigned(n: number): string {
  const r = round4(n);
  return r < 0 ? `${MINUS}${Math.abs(r)}` : `${r}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

const MAJOR_DEGS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const AXIS_COORD: Record<number, string> = { 0: "(1,0)", 90: `(0,1)`, 180: `(${MINUS}1,0)`, 270: `(0,${MINUS}1)` };
const QUADRANTS = [
  { label: "I", deg: 45 },
  { label: "II", deg: 135 },
  { label: "III", deg: 225 },
  { label: "IV", deg: 315 },
];

const MIN_FONT = 12;
const DEFAULT_W = 280;
const DEFAULT_H = 420;

export default function ScientificUnitCircleCard({
  theta,
  setTheta,
  seed,
}: {
  theta: number;
  setTheta: (fn: (prev: number) => number) => void;
  seed: number;
}) {
  const t = useTranslations("tools.scientific-calculator.sidebar.unitCircle");
  const tCommon = useTranslations("common");
  const calc = useScientificCalcReadonly();
  const { flashing, trigger } = useValueFlash();
  const [dragging, setDragging] = useState(false);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setBox({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // §B/C.4/C.5: the real geometry, recomputed from the container's OWN measured size every
  // resize -- the circle radius is min(width-based, height-based) so it genuinely fills whatever
  // space it has rather than a fixed pixel size tuned for one viewport; the wave panel always
  // gets a real share of the height (>=25% of the card's own width, more when there's room).
  const geo = useMemo(() => {
    const W = box.w;
    const H = box.h;
    const margin = Math.max(28, W * 0.14); // room for the outer degree/coordinate labels
    const waveH = Math.max(H * 0.22, W * 0.25, 70);
    const gap = 18;
    const circleAreaH = Math.max(80, H - waveH - gap);
    const cx = W / 2;
    const cy = Math.min(circleAreaH / 2, circleAreaH - margin * 0.6);
    const rByWidth = W / 2 - margin;
    const rByHeight = Math.min(cy, circleAreaH - cy) - margin * 0.6;
    const r = Math.max(24, Math.min(rByWidth, rByHeight));
    const waveY0 = circleAreaH + gap;
    const waveX0 = Math.max(24, W * 0.08);
    const waveX1 = W - waveX0;
    return { W, H, cx, cy, r, waveY0, waveH, waveX0, waveX1 };
  }, [box]);

  const { W: VB_W, H: VB_H, cx: CX, cy: CY, r: R, waveY0: WAVE_Y0, waveH: WAVE_H, waveX0: WAVE_X0, waveX1: WAVE_X1 } = geo;
  const TICK_OUT = R + 6;
  const TICK_OUT_MAJOR = R + 12;
  const LABEL_R = R + Math.max(18, R * 0.3);
  const FONT = Math.max(MIN_FONT, Math.min(14, R * 0.2));
  const QUAD_FONT = FONT + 2;

  function point(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: round2(CX + radius * Math.cos(rad)), y: round2(CY - radius * Math.sin(rad)) };
  }

  const thetaNorm = ((theta % 360) + 360) % 360;
  const thetaRad = (thetaNorm * Math.PI) / 180;
  const sinV = round4(Math.sin(thetaRad));
  const cosV = round4(Math.cos(thetaRad));
  const tanRaw = safeTan(thetaNorm);
  const tanV = tanRaw === null ? null : round4(tanRaw);
  const radiansLabel = `${round4(thetaRad)}`;

  const tip = point(thetaNorm, R);

  function setFromClientXY(clientX: number, clientY: number, svg: SVGSVGElement, shiftKey: boolean) {
    const rect = svg.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const scaleY = VB_H / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;
    const angle = (Math.atan2(-(py - CY), px - CX) * 180) / Math.PI;
    const norm = ((angle % 360) + 360) % 360;
    const snapped = ((snap(norm, shiftKey ? 15 : 1) % 360) + 360) % 360;
    setTheta(() => snapped);
    trigger();
  }

  function onDragStart(e: React.PointerEvent<SVGCircleElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const svg = e.currentTarget.ownerSVGElement;
    if (svg) setFromClientXY(e.clientX, e.clientY, svg, e.shiftKey);
  }
  function onDragMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    setFromClientXY(e.clientX, e.clientY, e.currentTarget, e.shiftKey);
  }
  function stepTheta(delta: 1 | -1) {
    setTheta((prev) => (((prev + delta) % 360) + 360) % 360);
    trigger();
  }
  function startRepeat(delta: 1 | -1) {
    stepTheta(delta);
    repeatDelay.current = setTimeout(() => {
      repeatTimer.current = setInterval(() => stepTheta(delta), 80);
    }, 400);
  }
  function stopRepeat() {
    if (repeatDelay.current) clearTimeout(repeatDelay.current);
    if (repeatTimer.current) clearInterval(repeatTimer.current);
    repeatDelay.current = null;
    repeatTimer.current = null;
  }

  const wavePoints = useMemo(() => {
    const sinPath: string[] = [];
    const cosPath: string[] = [];
    const amp = WAVE_H / 2 - 12;
    for (let d = 0; d <= 360; d += 5) {
      const rad = (d * Math.PI) / 180;
      const x = round2(WAVE_X0 + (d / 360) * (WAVE_X1 - WAVE_X0));
      const sy = round2(WAVE_Y0 + WAVE_H / 2 - Math.sin(rad) * amp);
      const cy = round2(WAVE_Y0 + WAVE_H / 2 - Math.cos(rad) * amp);
      sinPath.push(`${d === 0 ? "M" : "L"} ${x} ${sy}`);
      cosPath.push(`${d === 0 ? "M" : "L"} ${x} ${cy}`);
    }
    return { sinPath: sinPath.join(" "), cosPath: cosPath.join(" ") };
  }, [WAVE_X0, WAVE_X1, WAVE_Y0, WAVE_H]);

  const waveAmp = WAVE_H / 2 - 12;
  const waveMarkerX = round2(WAVE_X0 + (thetaNorm / 360) * (WAVE_X1 - WAVE_X0));
  const waveSinY = round2(WAVE_Y0 + WAVE_H / 2 - sinV * waveAmp);
  const waveCosY = round2(WAVE_Y0 + WAVE_H / 2 - cosV * waveAmp);
  const waveTickDegs = [0, 90, 180, 270, 360];

  const cosEnd = point(cosV >= 0 ? 0 : 180, Math.abs(cosV) * R);
  const sinEnd = point(sinV >= 0 ? 90 : 270, Math.abs(sinV) * R);

  return (
    <GlassHeroCard n={20} title={t("title")} subtitle={t("subtitle")} fill>
      <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-1">
        <span dir="ltr" style={{ ...LTR_ISOLATE, background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }} className="rounded-full px-2 py-0.5 text-xs font-semibold">
          {`θ ${fmtSigned(thetaNorm)}°`}
        </span>
        <span dir="ltr" style={{ ...LTR_ISOLATE, background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }} className="rounded-full px-2 py-0.5 text-xs font-semibold">
          {`${radiansLabel} rad`}
        </span>
        <span dir="ltr" style={{ ...LTR_ISOLATE, background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }} className="rounded-full px-2 py-0.5 text-xs font-semibold">
          {calc.angleMode === "deg" ? t("degMode") : t("radMode")}
        </span>
        <span dir="ltr" style={{ ...LTR_ISOLATE, background: "var(--glass-danger-soft)", color: "var(--glass-danger-strong)" }} className="rounded-full px-2 py-0.5 text-xs font-bold">{`sin ${fmtSigned(sinV)}`}</span>
        <span dir="ltr" style={{ ...LTR_ISOLATE, background: "var(--glass-success-soft)", color: "var(--glass-success-strong)" }} className="rounded-full px-2 py-0.5 text-xs font-bold">{`cos ${fmtSigned(cosV)}`}</span>
        <span dir="ltr" style={{ ...LTR_ISOLATE, background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }} className="rounded-full px-2 py-0.5 text-xs font-bold">{`tan ${tanV === null ? "∞" : fmtSigned(tanV)}`}</span>
      </div>

      <div ref={containerRef} className="relative mt-1 min-h-0 w-full flex-1">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width={VB_W}
          height={VB_H}
          role="img"
          aria-label={t("ariaLabel")}
          className="block h-full w-full touch-none"
          onPointerMove={onDragMove}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          {/* minor + major ticks */}
          {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => {
            const isMajor = MAJOR_DEGS.includes(deg);
            const p1 = point(deg, TICK_OUT - (isMajor ? 10 : 4));
            const p2 = point(deg, isMajor ? TICK_OUT_MAJOR : TICK_OUT);
            return <line key={deg} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--glass-border)" strokeWidth={isMajor ? 2 : 1} />;
          })}

          {/* major degree labels -- fixed positions, never collide with each other. The 4
              cardinal ones carry their axis coordinate too (one label, not two sharing the
              same spot). Every label is an isolated LTR run with the true minus sign. */}
          {MAJOR_DEGS.map((deg) => {
            const coord = AXIS_COORD[deg];
            const p = point(deg, coord ? LABEL_R + FONT * 1.3 : LABEL_R);
            if (coord) {
              return (
                <text key={deg} x={p.x} y={p.y} textAnchor="middle" fontSize={FONT} fontWeight="600" fill="var(--glass-muted)" direction="ltr" style={{ unicodeBidi: "isolate" }} data-role="label">
                  <tspan x={p.x} dy="-0.2em">{`${deg}°`}</tspan>
                  <tspan x={p.x} dy="1.1em">{coord}</tspan>
                </text>
              );
            }
            return (
              <text key={deg} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={FONT} fontWeight="600" fill="var(--glass-muted)" direction="ltr" style={{ unicodeBidi: "isolate" }} data-role="label">
                {deg}
              </text>
            );
          })}

          {/* quadrant markers -- inside the ring, clear of ticks */}
          {QUADRANTS.map((q) => {
            const p = point(q.deg, R * 0.5);
            return (
              <text key={q.label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={QUAD_FONT} fontWeight="700" fill="var(--glass-border)" direction="ltr" style={{ unicodeBidi: "isolate" }} data-role="label">
                {q.label}
              </text>
            );
          })}

          {/* ring + axes */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--glass-track)" strokeWidth="2" />
          <line x1={CX - R - 10} y1={CY} x2={CX + R + 10} y2={CY} stroke="var(--glass-border)" strokeWidth="1" />
          <line x1={CX} y1={CY - R - 10} x2={CX} y2={CY + R + 10} stroke="var(--glass-border)" strokeWidth="1" />

          {/* filled angle arc + red hand */}
          <path
            d={(() => {
              const start = point(0, R * 0.22);
              const end = point(thetaNorm, R * 0.22);
              const large = thetaNorm > 180 ? 1 : 0;
              return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R * 0.22} ${R * 0.22} 0 ${large} 0 ${end.x} ${end.y} Z`;
            })()}
            fill="var(--glass-danger-soft)"
            opacity="0.8"
          />
          <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="var(--glass-danger-strong)" strokeWidth="3" data-role="mark" />

          {/* green dashed cos/sin projections */}
          <line x1={tip.x} y1={tip.y} x2={cosEnd.x} y2={CY} stroke="var(--glass-success-strong)" strokeWidth="2" strokeDasharray="5 4" data-role="mark" />
          <line x1={tip.x} y1={tip.y} x2={CX} y2={sinEnd.y} stroke="var(--glass-success-strong)" strokeWidth="2" strokeDasharray="5 4" data-role="mark" />
          <circle cx={cosEnd.x} cy={CY} r="4" fill="var(--glass-success-strong)" />
          <circle cx={CX} cy={sinEnd.y} r="4" fill="var(--glass-success-strong)" />

          <circle cx={CX} cy={CY} r="4" fill="var(--glass-title)" />

          {/* draggable hit target on the point */}
          <circle cx={tip.x} cy={tip.y} r="20" fill="transparent" style={{ cursor: "grab" }} onPointerDown={onDragStart} />

          {/* value-flash ring around the circle when a control changes theta */}
          {flashing && <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="var(--glass-flash-bg)" strokeWidth="5" className="glass-value-flash" />}

          {/* sin+cos wave strip -- ticks at 0/90/180/270/360, moving marker, matching dots */}
          <line x1={WAVE_X0} y1={WAVE_Y0 + WAVE_H / 2} x2={WAVE_X1} y2={WAVE_Y0 + WAVE_H / 2} stroke="var(--glass-border)" strokeWidth="1" />
          {waveTickDegs.map((d) => {
            const x = round2(WAVE_X0 + (d / 360) * (WAVE_X1 - WAVE_X0));
            return (
              <g key={d}>
                <line x1={x} y1={WAVE_Y0 - 4} x2={x} y2={WAVE_Y0 + WAVE_H + 4} stroke="var(--glass-border)" strokeWidth="1" />
                <text x={x} y={WAVE_Y0 + WAVE_H + FONT + 6} textAnchor="middle" fontSize={FONT} fill="var(--glass-muted)" direction="ltr" style={{ unicodeBidi: "isolate" }} data-role="label">
                  {d}
                </text>
              </g>
            );
          })}
          <path d={wavePoints.sinPath} fill="none" stroke="var(--glass-success-strong)" strokeWidth="2.25" />
          <path d={wavePoints.cosPath} fill="none" stroke="var(--glass-danger-strong)" strokeWidth="2.25" />
          <line x1={waveMarkerX} y1={WAVE_Y0} x2={waveMarkerX} y2={WAVE_Y0 + WAVE_H} stroke="var(--glass-muted)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={waveMarkerX} cy={waveSinY} r="4" fill="var(--glass-success-strong)" />
          <circle cx={waveMarkerX} cy={waveCosY} r="4" fill="var(--glass-danger-strong)" />
        </svg>

        <GlassHandle
          direction="circular"
          ariaLabel={tCommon("dragToChange")}
          onStep={stepTheta}
          style={{ left: `${(tip.x / VB_W) * 100}%`, top: `${(tip.y / VB_H) * 100}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div dir="ltr" className="mt-2 flex shrink-0 items-center justify-center gap-2">
        <button
          type="button"
          onPointerDown={() => startRepeat(-1)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold"
          style={{ background: "var(--glass-track)", color: "var(--glass-title)" }}
          aria-label={t("decrease")}
        >
          {MINUS}
        </button>
        <button
          type="button"
          onClick={() => setTheta(() => seed)}
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}
        >
          {t("reset")}
        </button>
        <button
          type="button"
          onPointerDown={() => startRepeat(1)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold"
          style={{ background: "var(--glass-track)", color: "var(--glass-title)" }}
          aria-label={t("increase")}
        >
          +
        </button>
      </div>
      <p className="sr-only">{t("hint")}</p>
    </GlassHeroCard>
  );
}
