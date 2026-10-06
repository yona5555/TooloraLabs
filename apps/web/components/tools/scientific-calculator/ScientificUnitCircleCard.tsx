"use client";
/**
 * Card 1: the unit circle (§38 -- circles/arcs/lines only, no squares). Draggable red radius hand
 * + its filled angle arc, green dashed cos/sin projections onto the axes, live sin/cos/tan
 * readouts, a sin+cos wave strip underneath sharing the same theta, and a common-angles table
 * (sibling card) linked by hover both ways. Seeded once from the calculator's own mode/display
 * (ScientificSidebarPanels), fully independent after that; the Deg/Rad badge keeps reading the
 * calculator's live mode by design (the one thing that's allowed to stay live).
 */
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassHeroCard, GlassHandle, useValueFlash } from "@/components/tool-ui/glass/GlassPrimitives";
import "@/components/tool-ui/glass/glass-tokens.css";
import { useScientificCalcReadonly } from "./ScientificCalcReadonlyContext";
import { safeTan, round4, nearestCommonAngle } from "./scientificAngleData";

// Kept deliberately compact (Rule 41's own bottom-edge-parity requirement here caps the whole
// sidebar column at the calculator card's own height, which "hands off the calculator" means
// this component must fit inside rather than grow past).
const CX = 84;
const CY = 68;
const R = 40;
const TICK_OUT = R + 5;
const TICK_OUT_MAJOR = R + 10;
const LABEL_R = R + 18;
const VB_W = 168;
const CIRCLE_VB_H = 134;
const WAVE_Y0 = CIRCLE_VB_H + 8;
const WAVE_H = 30;
const WAVE_X0 = 14;
const WAVE_X1 = 154;
const VB_H = WAVE_Y0 + WAVE_H + 16;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function point(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: round2(CX + radius * Math.cos(rad)), y: round2(CY - radius * Math.sin(rad)) };
}

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

const MAJOR_DEGS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const AXIS_COORD: Record<number, string> = { 0: "(1,0)", 90: "(0,1)", 180: "(-1,0)", 270: "(0,-1)" };
const QUADRANTS = [
  { label: "I", deg: 45 },
  { label: "II", deg: 135 },
  { label: "III", deg: 225 },
  { label: "IV", deg: 315 },
];

export default function ScientificUnitCircleCard({
  theta,
  setTheta,
  seed,
  hoverAngle,
  setHoverAngle,
}: {
  theta: number;
  setTheta: (fn: (prev: number) => number) => void;
  seed: number;
  hoverAngle: number | null;
  setHoverAngle: (deg: number | null) => void;
}) {
  const t = useTranslations("tools.scientific-calculator.sidebar.unitCircle");
  const tCommon = useTranslations("common");
  const calc = useScientificCalcReadonly();
  const { flashing, trigger } = useValueFlash();
  const [dragging, setDragging] = useState(false);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const scale = VB_W / rect.width;
    const px = (clientX - rect.left) * scale;
    const py = (clientY - rect.top) * scale;
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

  // §39: the 12 major-tick degree labels are fixed (never depend on live data); only the
  // tan-infinity badge and wave marker move -- so collision avoidance here only needs to protect
  // the ONE dynamic element (the hover-synced nearest-common-angle marker on the ring) from the
  // fixed major labels, handled by giving it its own outer band rather than sharing LABEL_R.
  const nearest = nearestCommonAngle(thetaNorm);

  const wavePoints = useMemo(() => {
    const sinPath: string[] = [];
    const cosPath: string[] = [];
    for (let d = 0; d <= 360; d += 5) {
      const rad = (d * Math.PI) / 180;
      const x = round2(WAVE_X0 + (d / 360) * (WAVE_X1 - WAVE_X0));
      const sy = round2(WAVE_Y0 + WAVE_H / 2 - Math.sin(rad) * (WAVE_H / 2 - 6));
      const cy = round2(WAVE_Y0 + WAVE_H / 2 - Math.cos(rad) * (WAVE_H / 2 - 6));
      sinPath.push(`${d === 0 ? "M" : "L"} ${x} ${sy}`);
      cosPath.push(`${d === 0 ? "M" : "L"} ${x} ${cy}`);
    }
    return { sinPath: sinPath.join(" "), cosPath: cosPath.join(" ") };
  }, []);

  const waveMarkerX = round2(WAVE_X0 + (thetaNorm / 360) * (WAVE_X1 - WAVE_X0));
  const waveSinY = round2(WAVE_Y0 + WAVE_H / 2 - sinV * (WAVE_H / 2 - 6));
  const waveCosY = round2(WAVE_Y0 + WAVE_H / 2 - cosV * (WAVE_H / 2 - 6));

  const cosEnd = point(cosV >= 0 ? 0 : 180, Math.abs(cosV) * R);
  const sinEnd = point(sinV >= 0 ? 90 : 270, Math.abs(sinV) * R);

  return (
    <GlassHeroCard n={20} title={t("title")} subtitle={t("subtitle")} compact>
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1" aria-hidden="true">
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>
          {`θ ${round4(thetaNorm)}°`}
        </span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>
          {`${radiansLabel}r`}
        </span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>
          {calc.angleMode === "deg" ? t("degMode") : t("radMode")}
        </span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--glass-danger-soft)", color: "var(--glass-danger-strong)" }}>{`sin ${sinV}`}</span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--glass-success-soft)", color: "var(--glass-success-strong)" }}>{`cos ${cosV}`}</span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>{`tan ${tanV === null ? "∞" : tanV}`}</span>
      </div>

      <div className="relative mx-auto mt-2 w-full max-w-[150px]">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width={VB_W}
          height={VB_H}
          role="img"
          aria-label={t("ariaLabel")}
          className="h-auto w-full touch-none"
          onPointerMove={onDragMove}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          {/* minor + major ticks */}
          {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => {
            const isMajor = MAJOR_DEGS.includes(deg);
            const p1 = point(deg, TICK_OUT - (isMajor ? 10 : 4));
            const p2 = point(deg, isMajor ? TICK_OUT_MAJOR : TICK_OUT);
            return <line key={deg} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--glass-border)" strokeWidth={isMajor ? 1.5 : 1} />;
          })}

          {/* major degree labels -- fixed positions, never collide with each other. The 4
              cardinal ones carry their axis coordinate too (one label, not two sharing the
              same spot -- §39: a single element can't collide with itself the way two
              separately-positioned ones did at this card's compact size). */}
          {MAJOR_DEGS.map((deg) => {
            const coord = AXIS_COORD[deg];
            // the cardinal labels are wider (they carry their axis coordinate too) -- pushed to
            // their own outer radius so they never crowd the two plain-degree neighbors 30deg to
            // either side, which a shared radius doesn't leave room for at this card's size.
            const p = point(deg, coord ? LABEL_R + 9 : LABEL_R);
            if (coord) {
              // two short lines (narrower than one wide "90° (0,1)") so the label stays inside
              // the viewBox at the 0/180 positions, where its own radial direction IS the
              // horizontal axis and there isn't much margin left to the edge at this card's size.
              return (
                <text key={deg} x={p.x} y={p.y} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--glass-muted)" data-role="label">
                  <tspan x={p.x} dy="-0.2em">{`${deg}°`}</tspan>
                  <tspan x={p.x} dy="1em">{coord}</tspan>
                </text>
              );
            }
            return (
              <text key={deg} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill="var(--glass-muted)" data-role="label">
                {deg}
              </text>
            );
          })}

          {/* quadrant markers */}
          {QUADRANTS.map((q) => {
            const p = point(q.deg, R * 0.55);
            return (
              <text key={q.label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="var(--glass-border)" data-role="label">
                {q.label}
              </text>
            );
          })}


          {/* ring + axes */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--glass-track)" strokeWidth="1.5" />
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
          <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="var(--glass-danger-strong)" strokeWidth="2.5" data-role="mark" />

          {/* green dashed cos/sin projections */}
          <line x1={tip.x} y1={tip.y} x2={cosEnd.x} y2={CY} stroke="var(--glass-success-strong)" strokeWidth="1.5" strokeDasharray="4 3" data-role="mark" />
          <line x1={tip.x} y1={tip.y} x2={CX} y2={sinEnd.y} stroke="var(--glass-success-strong)" strokeWidth="1.5" strokeDasharray="4 3" data-role="mark" />
          <circle cx={cosEnd.x} cy={CY} r="3" fill="var(--glass-success-strong)" />
          <circle cx={CX} cy={sinEnd.y} r="3" fill="var(--glass-success-strong)" />

          <circle cx={CX} cy={CY} r="3" fill="var(--glass-title)" />

          {/* draggable hit target on the point */}
          <circle cx={tip.x} cy={tip.y} r="16" fill="transparent" style={{ cursor: "grab" }} onPointerDown={onDragStart} />

          {/* nearest-common-angle marker (hover-linked with the table card) */}
          {(() => {
            const p = point(nearest, R);
            const isLinked = hoverAngle === nearest;
            return (
              <circle
                cx={p.x}
                cy={p.y}
                r={isLinked ? 7 : 5}
                fill="var(--glass-accent-5-strong)"
                opacity={isLinked ? 1 : 0.55}
                stroke="var(--glass-handle-ring)"
                strokeWidth="1.5"
                data-role="mark"
                onPointerEnter={() => setHoverAngle(nearest)}
                onPointerLeave={() => setHoverAngle(null)}
              />
            );
          })()}

          {/* value-flash ring around the readout cluster when a control changes theta */}
          {flashing && <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="var(--glass-flash-bg)" strokeWidth="4" className="glass-value-flash" />}

          {/* sin+cos wave strip */}
          <line x1={WAVE_X0} y1={WAVE_Y0 + WAVE_H / 2} x2={WAVE_X1} y2={WAVE_Y0 + WAVE_H / 2} stroke="var(--glass-border)" strokeWidth="1" />
          <path d={wavePoints.sinPath} fill="none" stroke="var(--glass-success-strong)" strokeWidth="1.75" />
          <path d={wavePoints.cosPath} fill="none" stroke="var(--glass-danger-strong)" strokeWidth="1.75" />
          <line x1={waveMarkerX} y1={WAVE_Y0} x2={waveMarkerX} y2={WAVE_Y0 + WAVE_H} stroke="var(--glass-muted)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={waveMarkerX} cy={waveSinY} r="3" fill="var(--glass-success-strong)" />
          <circle cx={waveMarkerX} cy={waveCosY} r="3" fill="var(--glass-danger-strong)" />
        </svg>

        <GlassHandle
          direction="circular"
          ariaLabel={tCommon("dragToChange")}
          onStep={stepTheta}
          style={{ left: `${(tip.x / VB_W) * 100}%`, top: `${(tip.y / VB_H) * 100}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div dir="ltr" className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onPointerDown={() => startRepeat(-1)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: "var(--glass-track)", color: "var(--glass-title)" }}
          aria-label={t("decrease")}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setTheta(() => seed)}
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}
        >
          {t("reset")}
        </button>
        <button
          type="button"
          onPointerDown={() => startRepeat(1)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
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
