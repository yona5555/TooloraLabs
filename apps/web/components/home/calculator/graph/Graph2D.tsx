"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { axisTicks, derivativeFunction, sampleCurve, traceAt, type CurveSegment } from "@tooloralabs/tools";
import { fmt, fmtTick, type GraphView, type MarkedPoint, type PlotFunction } from "./graphShared";

type Props = {
  fns: PlotFunction[];
  view: GraphView;
  onView: (v: GraphView) => void;
  traceX: number;
  onTrace: (x: number) => void;
  showDerivative: boolean;
  points: MarkedPoint[];
  dark: boolean;
  ariaLabel: string;
  labels: { slope: string; tangent: string };
};

const TRACE_GRAB_PX = 18;

function toPath(seg: CurveSegment, px: (x: number) => number, py: (y: number) => number): string {
  let d = "";
  for (let i = 0; i < seg.length; i++) d += `${i ? "L" : "M"}${px(seg[i].x).toFixed(1)},${py(seg[i].y).toFixed(1)}`;
  return d;
}

/** Coordinate pills for key points, nudged up/down so no two overlap and all stay inside the plot. */
function placeLabels(list: MarkedPoint[], px: (x: number) => number, py: (y: number) => number, w: number, h: number) {
  const placed: { p: MarkedPoint; text: string; x: number; y: number; tw: number }[] = [];
  for (const p of list) {
    const text = `(${fmt(p.x, 2)}, ${fmt(p.y, 2)})`;
    if (placed.some((q) => q.text === text)) continue;
    const tw = text.length * 6.1 + 8;
    const x = Math.min(w - tw - 2, Math.max(2, px(p.x) - tw / 2));
    const base = py(p.y) + (p.kind === "minimum" ? 8 : -22);
    const hits = (y: number) => placed.some((q) => Math.abs(q.x + q.tw / 2 - (x + tw / 2)) < (q.tw + tw) / 2 + 2 && Math.abs(q.y - y) < 17);
    let y = base;
    for (let k = 1; k <= 8 && (hits(y) || y < 2 || y > h - 17); k++) y = base + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * 17;
    if (hits(y) || y < 2 || y > h - 17) continue;
    placed.push({ p, text, x, y, tw });
  }
  return placed;
}

/** Zooms the view by `factor` (<1 = in) around the data point (ax, ay). */
export function zoomView(v: GraphView, factor: number, ax = (v.xMin + v.xMax) / 2, ay = (v.yMin + v.yMax) / 2): GraphView {
  const span = Math.max(v.xMax - v.xMin, v.yMax - v.yMin) * factor;
  if (span < 1e-6 || span > 1e7) return v;
  return {
    xMin: ax - (ax - v.xMin) * factor,
    xMax: ax + (v.xMax - ax) * factor,
    yMin: ay - (ay - v.yMin) * factor,
    yMax: ay + (v.yMax - ay) * factor,
  };
}

/**
 * Interactive 2D plot: smooth sampled curves, major/minor grid, compact axis
 * labels, drag to pan, wheel/pinch to zoom, hover or drag along the active
 * curve to trace (point, slope, tangent line), key points and intersections.
 */
export default function Graph2D({ fns, view, onView, traceX, onTrace, showDerivative, points, dark, ariaLabel, labels }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 640, h: 420 });
  const gesture = useRef<{
    mode: "pan" | "trace" | "pinch" | null;
    pointers: Map<number, { x: number; y: number }>;
    start: { x: number; y: number; view: GraphView; dist: number };
  }>({ mode: null, pointers: new Map(), start: { x: 0, y: 0, view, dist: 1 } });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.max(200, e.contentRect.width), h: Math.max(200, e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const px = (x: number) => ((x - view.xMin) / (view.xMax - view.xMin)) * w;
  const py = (y: number) => h - ((y - view.yMin) / (view.yMax - view.yMin)) * h;
  const dataX = (sx: number) => view.xMin + (sx / w) * (view.xMax - view.xMin);

  // wheel zoom needs a non-passive listener to stop the page from scrolling
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const v = viewRef.current;
      const ax = v.xMin + ((e.clientX - r.left) / r.width) * (v.xMax - v.xMin);
      const ay = v.yMax - ((e.clientY - r.top) / r.height) * (v.yMax - v.yMin);
      onView(zoomView(v, Math.exp(Math.max(-1, Math.min(1, e.deltaY / 300))), ax, ay));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onView]);

  const xt = useMemo(() => axisTicks(view.xMin, view.xMax, Math.max(4, Math.round(w / 90))), [view.xMin, view.xMax, w]);
  const yt = useMemo(() => axisTicks(view.yMin, view.yMax, Math.max(3, Math.round(h / 70))), [view.yMin, view.yMax, h]);

  const curves = useMemo(
    () =>
      fns.map((f) => ({
        f,
        segs: sampleCurve(f.graph.curve, view.xMin, view.xMax, view.yMin, view.yMax, Math.round(w * 1.2)),
        dsegs: showDerivative ? sampleCurve(derivativeFunction(f.graph.curve), view.xMin, view.xMax, view.yMin, view.yMax, Math.round(w)) : [],
      })),
    [fns, view, w, showDerivative],
  );

  const active = fns.find((f) => f.active);
  const trace = active ? traceAt(active.graph.curve, traceX) : null;

  function local(e: React.PointerEvent) {
    const r = box.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerDown(e: React.PointerEvent) {
    const g = gesture.current;
    const p = local(e);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    g.pointers.set(e.pointerId, p);
    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()];
      g.mode = "pinch";
      g.start = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, view, dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)) };
      return;
    }
    const x = dataX(p.x);
    const y = active?.graph.curve(x);
    if (y != null && Math.abs(py(y) - p.y) < TRACE_GRAB_PX) {
      g.mode = "trace";
      onTrace(x);
    } else {
      g.mode = "pan";
      g.start = { x: p.x, y: p.y, view, dist: 1 };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const g = gesture.current;
    const p = local(e);
    if (!g.pointers.has(e.pointerId)) {
      if (e.pointerType === "mouse") onTrace(dataX(p.x));
      return;
    }
    g.pointers.set(e.pointerId, p);
    const s = g.start;
    if (g.mode === "pan") {
      const dx = ((p.x - s.x) / w) * (s.view.xMax - s.view.xMin);
      const dy = ((p.y - s.y) / h) * (s.view.yMax - s.view.yMin);
      onView({ xMin: s.view.xMin - dx, xMax: s.view.xMax - dx, yMin: s.view.yMin + dy, yMax: s.view.yMax + dy });
    } else if (g.mode === "trace") {
      onTrace(dataX(p.x));
    } else if (g.mode === "pinch" && g.pointers.size >= 2) {
      const [a, b] = [...g.pointers.values()];
      const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const ax = s.view.xMin + (s.x / w) * (s.view.xMax - s.view.xMin);
      const ay = s.view.yMax - (s.y / h) * (s.view.yMax - s.view.yMin);
      onView(zoomView(s.view, s.dist / dist, ax, ay));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const g = gesture.current;
    g.pointers.delete(e.pointerId);
    if (g.pointers.size === 1 && g.mode === "pinch") {
      const [p] = [...g.pointers.values()];
      g.mode = "pan";
      g.start = { x: p.x, y: p.y, view: viewRef.current, dist: 1 };
    } else if (g.pointers.size === 0) g.mode = null;
  }

  const c = dark
    ? { minor: "#27272a", major: "#3f3f46", axis: "#a1a1aa", text: "#a1a1aa", bg: "#18181b", pill: "#27272aee" }
    : { minor: "#e4e4e7", major: "#cbd5e1", axis: "#52525b", text: "#52525b", bg: "#ffffff", pill: "#ffffffee" };

  const x0 = px(0);
  const y0 = py(0);
  const axisY = Math.min(h - 16, Math.max(2, y0)); // where x labels sit
  const axisX = Math.min(w - 4, Math.max(30, x0)); // where y labels end
  const labelled = points.filter((p) => p.kind === "intersection" || fns.find((f) => f.id === p.fnId)?.active).slice(0, 14);

  let tangentLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (trace && trace.slope !== null) {
    const span = (view.xMax - view.xMin) * 0.18;
    tangentLine = {
      x1: px(trace.x - span),
      y1: py(trace.y - trace.slope * span),
      x2: px(trace.x + span),
      y2: py(trace.y + trace.slope * span),
    };
  }
  const traceInView = trace && trace.y >= view.yMin && trace.y <= view.yMax;

  return (
    <div
      ref={box}
      dir="ltr"
      className="relative h-full w-full cursor-crosshair touch-none select-none overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg width={w} height={h} className="block" role="img" aria-label={ariaLabel} data-testid="graph-svg">
        {xt.minor.map((v) => (
          <line key={`xm${v}`} x1={px(v)} x2={px(v)} y1={0} y2={h} stroke={c.minor} strokeWidth={1} />
        ))}
        {yt.minor.map((v) => (
          <line key={`ym${v}`} y1={py(v)} y2={py(v)} x1={0} x2={w} stroke={c.minor} strokeWidth={1} />
        ))}
        {xt.major.map((v) => (
          <line key={`xM${v}`} x1={px(v)} x2={px(v)} y1={0} y2={h} stroke={c.major} strokeWidth={1} />
        ))}
        {yt.major.map((v) => (
          <line key={`yM${v}`} y1={py(v)} y2={py(v)} x1={0} x2={w} stroke={c.major} strokeWidth={1} />
        ))}
        {y0 >= 0 && y0 <= h && <line x1={0} x2={w} y1={y0} y2={y0} stroke={c.axis} strokeWidth={1.5} />}
        {x0 >= 0 && x0 <= w && <line y1={0} y2={h} x1={x0} x2={x0} stroke={c.axis} strokeWidth={1.5} />}

        <g fontSize={11} fill={c.text} fontFamily="var(--font-mono)">
          {xt.major
            .filter((v) => v !== 0 && px(v) > 12 && px(v) < w - 12)
            .map((v) => (
              <text key={`xl${v}`} x={px(v)} y={axisY + 13} textAnchor="middle" paintOrder="stroke" stroke={c.bg} strokeWidth={3}>
                {fmtTick(v, xt.step)}
              </text>
            ))}
          {yt.major
            .filter((v) => v !== 0 && py(v) > 10 && py(v) < h - 6)
            .map((v) => (
              <text key={`yl${v}`} x={axisX - 5} y={py(v) + 4} textAnchor="end" paintOrder="stroke" stroke={c.bg} strokeWidth={3}>
                {fmtTick(v, yt.step)}
              </text>
            ))}
          {x0 >= 0 && x0 <= w && y0 >= 0 && y0 <= h && (
            <text x={x0 - 5} y={y0 + 13} textAnchor="end">
              0
            </text>
          )}
          <text x={w - 8} y={axisY - 6} textAnchor="end" fontStyle="italic" fontWeight={700}>
            x
          </text>
          <text x={axisX + 6} y={14} fontStyle="italic" fontWeight={700}>
            y
          </text>
        </g>

        {curves.map(({ f, segs, dsegs }) => (
          <g key={f.id}>
            {dsegs.map((s, i) => (
              <path key={`d${i}`} d={toPath(s, px, py)} fill="none" stroke={f.color} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.75} />
            ))}
            {segs.map((s, i) => (
              <path
                key={i}
                d={toPath(s, px, py)}
                fill="none"
                stroke={f.color}
                strokeWidth={f.active ? 2.75 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        ))}

        {points.map((p, i) => (
          <circle
            key={`p${i}`}
            cx={px(p.x)}
            cy={py(p.y)}
            r={p.kind === "intersection" ? 5 : 4}
            fill={p.kind === "intersection" ? c.bg : p.color}
            stroke={p.kind === "intersection" ? c.axis : c.bg}
            strokeWidth={2}
          />
        ))}
        <g fontSize={10} fontFamily="var(--font-mono)">
          {placeLabels(labelled, px, py, w, h).map(({ p, text, x, y, tw }, i) => (
            <g key={`l${i}`}>
              <rect x={x} y={y} width={tw} height={15} rx={4} fill={c.pill} stroke={p.kind === "intersection" ? c.axis : p.color} strokeWidth={1} />
              <text x={x + tw / 2} y={y + 11} textAnchor="middle" fill={c.text}>
                {text}
              </text>
            </g>
          ))}
        </g>

        {active && trace && traceInView && (
          <g>
            <line x1={px(trace.x)} x2={px(trace.x)} y1={py(trace.y)} y2={Math.min(h, Math.max(0, y0))} stroke={active.color} strokeDasharray="3 3" opacity={0.6} />
            {tangentLine && (
              <line {...tangentLine} stroke={dark ? "#fbbf24" : "#d97706"} strokeWidth={2} strokeLinecap="round" data-testid="graph-tangent" />
            )}
            <circle cx={px(trace.x)} cy={py(trace.y)} r={7} fill={active.color} stroke={c.bg} strokeWidth={2.5} className="cursor-grab" data-testid="graph-trace-point" />
          </g>
        )}
      </svg>

      {active && trace && (
        <div
          className="pointer-events-none absolute left-2 top-2 rounded-lg border border-zinc-300 bg-white/95 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-zinc-700 shadow-sm calcdark:border-zinc-600 calcdark:bg-zinc-800/95 calcdark:text-zinc-200"
          data-testid="graph-trace"
        >
          <div>
            <span className="font-semibold" style={{ color: active.color }}>
              x
            </span>{" "}
            = <span data-testid="graph-trace-x">{fmt(trace.x)}</span>
            <span className="mx-1.5 text-zinc-400">·</span>
            <span className="font-semibold" style={{ color: active.color }}>
              y
            </span>{" "}
            = <span data-testid="graph-trace-y">{fmt(trace.y)}</span>
          </div>
          <div>
            <bdi>{labels.slope}</bdi> = <span data-testid="graph-trace-slope">{fmt(trace.slope)}</span>
          </div>
          {trace.slope !== null && trace.intercept !== null && (
            <div className="text-amber-700 calcdark:text-amber-400">
              <bdi>{labels.tangent}</bdi>: y = {fmt(trace.slope, 3)}x {trace.intercept < 0 ? "−" : "+"} {fmt(Math.abs(trace.intercept), 3)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
