"use client";
/**
 * Sidebar unit circle (§38 -- circles/arcs/lines only). Draggable point + angle arc, dashed
 * cos/sin projections, a sin+cos wave strip sharing the same theta, and live chips. On desktop
 * the card stretches to the calculator card's bottom edge and the drawing scales to fill the
 * freed height (§17/§27); on mobile it keeps its natural aspect. Seeded once from the
 * calculator's own mode/display (ScientificSidebarPanels), independent after that.
 */
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import "@/components/tool-ui/glass/glass-tokens.css";
import { unitCircleFacts } from "@tooloralabs/tools";
import { useScientificCalcReadonly } from "./ScientificCalcReadonlyContext";
import { round4 } from "./scientificAngleData";

const VB_W = 300;
const CX = 150;
const R = 86;
const CY = R + 40;
const LABEL_R = R + 17;
const CIRCLE_H = CY + R + 40;
const WAVE_Y0 = CIRCLE_H + 6;
const WAVE_H = 78;
const WAVE_X0 = 30;
const WAVE_X1 = 290;
const VB_H = WAVE_Y0 + WAVE_H + 20;

const r2 = (n: number) => Math.round(n * 100) / 100;
function point(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: r2(CX + radius * Math.cos(rad)), y: r2(CY - radius * Math.sin(rad)) };
}

const MAJOR_DEGS = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const AXIS_COORD: Record<number, string> = { 0: "(1,0)", 90: "(0,1)", 180: "(−1,0)", 270: "(0,−1)" };
const QUADRANTS = [
  { label: "I", deg: 45 },
  { label: "II", deg: 135 },
  { label: "III", deg: 225 },
  { label: "IV", deg: 315 },
];
const fmt = (v: number) => (Object.is(v, -0) ? 0 : round4(v)).toString().replace("-", "−");

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
  const calc = useScientificCalcReadonly();
  const [dragging, setDragging] = useState(false);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const f = unitCircleFacts(theta);
  const d = f.degrees;
  const tip = point(d, R);

  function setFromClient(clientX: number, clientY: number, svg: SVGSVGElement, shift: boolean) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    const angle = (Math.atan2(-(p.y - CY), p.x - CX) * 180) / Math.PI;
    const step = shift ? 15 : 1;
    setTheta(() => ((Math.round(angle / step) * step) % 360 + 360) % 360);
  }
  function onDown(e: React.PointerEvent<SVGCircleElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const svg = e.currentTarget.ownerSVGElement;
    if (svg) setFromClient(e.clientX, e.clientY, svg, e.shiftKey);
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (dragging) setFromClient(e.clientX, e.clientY, e.currentTarget, e.shiftKey);
  }
  const stepTheta = (delta: number) => setTheta((prev) => (((prev + delta) % 360) + 360) % 360);
  function startRepeat(delta: 1 | -1) {
    stepTheta(delta);
    repeatDelay.current = setTimeout(() => {
      repeatTimer.current = setInterval(() => stepTheta(delta), 70);
    }, 400);
  }
  function stopRepeat() {
    if (repeatDelay.current) clearTimeout(repeatDelay.current);
    if (repeatTimer.current) clearInterval(repeatTimer.current);
  }

  const wave = useMemo(() => {
    const s: string[] = [];
    const c: string[] = [];
    for (let deg = 0; deg <= 360; deg += 4) {
      const rad = (deg * Math.PI) / 180;
      const x = r2(WAVE_X0 + (deg / 360) * (WAVE_X1 - WAVE_X0));
      s.push(`${deg ? "L" : "M"}${x} ${r2(WAVE_Y0 + WAVE_H / 2 - Math.sin(rad) * (WAVE_H / 2 - 6))}`);
      c.push(`${deg ? "L" : "M"}${x} ${r2(WAVE_Y0 + WAVE_H / 2 - Math.cos(rad) * (WAVE_H / 2 - 6))}`);
    }
    return { sin: s.join(" "), cos: c.join(" ") };
  }, []);
  const wx = r2(WAVE_X0 + (d / 360) * (WAVE_X1 - WAVE_X0));
  const wy = (v: number) => r2(WAVE_Y0 + WAVE_H / 2 - v * (WAVE_H / 2 - 6));

  const arcR = R * 0.24;
  const arcStart = point(0, arcR);
  const arcEnd = point(d, arcR);
  const cosX = r2(CX + f.cos * R);
  const sinY = r2(CY - f.sin * R);

  const chip = "rounded-full px-2.5 py-1 text-xs font-bold";

  return (
    <SectionCard title={t("title")} className="flex flex-col lg:flex-1" bodyClassName="flex flex-1 flex-col p-3">
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1.5" data-testid="uc-chips">
        <span className={chip} style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>{`θ = ${round4(d)}°`}</span>
        <span className={chip} style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>{f.radiansPi ? `${f.radiansPi} rad` : `${round4(f.radians)} rad`}</span>
        <span className={chip} style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>{calc.angleMode === "deg" ? t("degMode") : t("radMode")}</span>
        <span className={chip} style={{ background: "var(--glass-danger-soft)", color: "var(--glass-danger-strong)" }}>{`sin ${fmt(f.sin)}`}</span>
        <span className={chip} style={{ background: "var(--glass-success-soft)", color: "var(--glass-success-strong)" }}>{`cos ${fmt(f.cos)}`}</span>
        <span className={chip} style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>{`tan ${f.tan === null ? "∞" : fmt(f.tan)}`}</span>
      </div>

      {/* Desktop: the svg is taken out of flow (absolute) so it never grows the row; it scales to the freed height. */}
      <div className="relative mt-2 w-full lg:min-h-[300px] lg:flex-1">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t("ariaLabel")}
          className="h-auto w-full touch-none select-none lg:absolute lg:inset-0 lg:h-full"
          onPointerMove={onMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          data-testid="uc-svg"
        >
          {/* ticks every 15° */}
          {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => {
            const major = deg % 30 === 0;
            const a = point(deg, R - (major ? 6 : 3));
            const b = point(deg, R + (major ? 6 : 3));
            return <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--glass-border)" strokeWidth={major ? 1.5 : 1} />;
          })}

          {/* degree labels (fixed, never collide); cardinal ones carry their axis point */}
          {MAJOR_DEGS.map((deg) => {
            const coord = AXIS_COORD[deg];
            const diag = deg % 90 === 45;
            const p = point(deg, coord ? LABEL_R + 12 : diag ? LABEL_R + 4 : LABEL_R);
            if (coord) {
              return (
                <text key={deg} x={p.x} y={p.y} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--glass-title)">
                  <tspan x={p.x} dy="-0.25em">{`${deg}°`}</tspan>
                  <tspan x={p.x} dy="1.05em" fontSize="10" fontWeight="600" fill="var(--glass-muted)">{coord}</tspan>
                </text>
              );
            }
            return (
              <text key={deg} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={diag ? 10 : 11} fontWeight="600" fill="var(--glass-muted)">
                {`${deg}°`}
              </text>
            );
          })}

          {QUADRANTS.map((q) => {
            const p = point(q.deg, R * 0.6);
            const active = f.quadrant !== "axis" && QUADRANTS[f.quadrant - 1].label === q.label;
            return (
              <text key={q.label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill={active ? "var(--glass-accent-1-strong)" : "var(--glass-border)"}>
                {q.label}
              </text>
            );
          })}

          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--glass-track)" strokeWidth="2" />
          <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} stroke="var(--glass-border)" />
          <line x1={CX} y1={CY - R - 12} x2={CX} y2={CY + R + 12} stroke="var(--glass-border)" />

          <path d={`M ${CX} ${CY} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 ${d > 180 ? 1 : 0} 0 ${arcEnd.x} ${arcEnd.y} Z`} fill="var(--glass-danger-soft)" opacity="0.85" />

          {/* cos (horizontal) and sin (vertical) legs */}
          <line x1={CX} y1={CY} x2={cosX} y2={CY} stroke="var(--glass-success-strong)" strokeWidth="3" />
          <line x1={cosX} y1={CY} x2={tip.x} y2={tip.y} stroke="var(--glass-danger-strong)" strokeWidth="3" />
          <line x1={tip.x} y1={tip.y} x2={CX} y2={sinY} stroke="var(--glass-muted)" strokeWidth="1.2" strokeDasharray="4 3" />
          <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="var(--glass-title)" strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r="3" fill="var(--glass-title)" />

          {/* visible handle (§40) + large hit target */}
          <circle cx={tip.x} cy={tip.y} r="9" fill="var(--glass-danger-strong)" stroke="var(--glass-handle-ring)" strokeWidth="3" />
          <circle
            cx={tip.x}
            cy={tip.y}
            r="20"
            fill="transparent"
            style={{ cursor: dragging ? "grabbing" : "grab" }}
            onPointerDown={onDown}
            tabIndex={0}
            role="slider"
            aria-label={t("hint")}
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={Math.round(d)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") stepTheta(e.shiftKey ? 15 : 1);
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") stepTheta(e.shiftKey ? -15 : -1);
            }}
            data-testid="uc-handle"
          />

          {/* wave strip: sin (red) and cos (green), same theta */}
          <line x1={WAVE_X0} y1={WAVE_Y0 + WAVE_H / 2} x2={WAVE_X1} y2={WAVE_Y0 + WAVE_H / 2} stroke="var(--glass-border)" />
          {[0, 90, 180, 270, 360].map((deg) => {
            const x = r2(WAVE_X0 + (deg / 360) * (WAVE_X1 - WAVE_X0));
            return (
              <g key={deg}>
                <line x1={x} y1={WAVE_Y0 + 2} x2={x} y2={WAVE_Y0 + WAVE_H - 2} stroke="var(--glass-border)" strokeDasharray="2 3" />
                <text x={x} y={WAVE_Y0 + WAVE_H + 13} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--glass-muted)">{`${deg}°`}</text>
              </g>
            );
          })}
          <text x={WAVE_X0 - 6} y={WAVE_Y0 + 8} textAnchor="end" fontSize="9" fill="var(--glass-muted)">1</text>
          <text x={WAVE_X0 - 6} y={WAVE_Y0 + WAVE_H - 4} textAnchor="end" fontSize="9" fill="var(--glass-muted)">−1</text>
          <path d={wave.sin} fill="none" stroke="var(--glass-danger-strong)" strokeWidth="2.25" />
          <path d={wave.cos} fill="none" stroke="var(--glass-success-strong)" strokeWidth="2.25" />
          <line x1={wx} y1={WAVE_Y0} x2={wx} y2={WAVE_Y0 + WAVE_H} stroke="var(--glass-title)" strokeWidth="1.2" />
          <circle cx={wx} cy={wy(f.sin)} r="4.5" fill="var(--glass-danger-strong)" />
          <circle cx={wx} cy={wy(f.cos)} r="4.5" fill="var(--glass-success-strong)" />
        </svg>
      </div>

      <div dir="ltr" className="mt-2 flex items-center justify-center gap-2">
        <button type="button" onPointerDown={() => startRepeat(-1)} onPointerUp={stopRepeat} onPointerLeave={stopRepeat} className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }} aria-label={t("decrease")}>
          −
        </button>
        <button type="button" onClick={() => setTheta(() => seed)} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-title)" }}>
          {t("reset")}
        </button>
        <button type="button" onPointerDown={() => startRepeat(1)} onPointerUp={stopRepeat} onPointerLeave={stopRepeat} className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }} aria-label={t("increase")}>
          +
        </button>
      </div>
    </SectionCard>
  );
}
