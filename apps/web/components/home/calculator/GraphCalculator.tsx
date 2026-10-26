"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { compileGraphExpression, findIntersections, findKeyPoints, niceStep, valueTable, type GraphCompileResult } from "@tooloralabs/tools";
import Graph2D, { zoomView } from "./graph/Graph2D";
import Graph3D from "./graph/Graph3D";
import {
  DEFAULT_VIEW,
  FUNCTION_COLORS,
  HEIGHT_GRADIENT_CSS,
  MAX_FUNCTIONS,
  fmt,
  type GraphView,
  type KeyPointKind,
  type MarkedPoint,
  type PlotFunction,
} from "./graph/graphShared";

type FnEntry = { id: number; expr: string; visible: boolean; slot: number };

const EXAMPLES = ["x^2", "sin(x)", "x^3 − 3x", "e^x", "z = sin(x)·cos(y)", "z = x^2 − y^2"];
const STEPS = [0, 0.1, 0.25, 0.5, 1, 2, 5]; // 0 = auto

const chip =
  "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors border-zinc-300 bg-white text-zinc-700 hover:border-blue-400 hover:text-blue-700 calcdark:border-zinc-600 calcdark:bg-zinc-800 calcdark:text-zinc-200 calcdark:hover:border-blue-400 calcdark:hover:text-blue-300";
const chipOn = "!border-blue-600 !bg-blue-600 !text-white calcdark:!border-blue-500 calcdark:!bg-blue-500";
const iconBtn =
  "flex h-8 min-w-8 items-center justify-center rounded-lg border border-zinc-300 bg-white/95 px-2 text-sm font-semibold text-zinc-700 shadow-sm hover:border-blue-400 hover:text-blue-700 calcdark:border-zinc-600 calcdark:bg-zinc-800/95 calcdark:text-zinc-200";

/**
 * Graph mode of the home calculator: up to 4 functions, a 2D plot with
 * pan/zoom/trace/tangent/key points/derivative overlay, a lazy real-3D view
 * (surface for z = f(x, y), ribbon for curves), and a live table of values
 * that follows the visible range. All math lives in @tooloralabs/tools.
 */
const PHONE_QUERY = "(max-width: 767px)";
const isPhone = () => window.matchMedia(PHONE_QUERY).matches;
const subscribePhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function GraphCalculator({ calcDark = false }: { calcDark?: boolean }) {
  const t = useTranslations("homeCalculator.graph");
  const [fns, setFns] = useState<FnEntry[]>([
    { id: 1, expr: "x^3 − 3x", visible: true, slot: 0 },
    { id: 2, expr: "sin(x)", visible: true, slot: 1 },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [dim, setDim] = useState<"2d" | "3d">("2d");
  const [view, setView] = useState<GraphView>(DEFAULT_VIEW);
  const [traceX, setTraceX] = useState(1.5);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showPoints, setShowPoints] = useState(true);
  const [wireframe, setWireframe] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [view3dKey, setView3dKey] = useState(0);
  const [panel, setPanel] = useState<"table" | "points">("table");
  const [step, setStep] = useState(0);
  const [full, setFull] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const nextId = useRef(3);

  const compiled = useMemo(() => {
    const m = new Map<number, GraphCompileResult>();
    for (const f of fns) m.set(f.id, compileGraphExpression(f.expr));
    return m;
  }, [fns]);

  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const palette = calcDark ? FUNCTION_COLORS.dark : phone ? FUNCTION_COLORS.lightPhone : FUNCTION_COLORS.light;
  const plot: PlotFunction[] = useMemo(
    () =>
      fns.flatMap((f) => {
        const g = compiled.get(f.id);
        return f.visible && g?.ok ? [{ id: f.id, color: palette[f.slot], graph: g, active: f.id === activeId }] : [];
      }),
    [fns, compiled, palette, activeId],
  );
  const activeFn = plot.find((p) => p.active) ?? null;

  const deferredView = useDeferredValue(view);
  const points: MarkedPoint[] = useMemo(() => {
    const { xMin, xMax } = deferredView;
    const out: MarkedPoint[] = [];
    for (const f of plot) {
      const k = findKeyPoints(f.graph.curve, xMin, xMax);
      const add = (kind: KeyPointKind) => (p: { x: number; y: number }) => out.push({ ...p, kind, fnId: f.id, color: f.color });
      k.roots.forEach(add("root"));
      if (k.yIntercept && !k.roots.some((r) => Math.abs(r.x) < 1e-9)) add("yIntercept")(k.yIntercept);
      k.maxima.forEach(add("maximum"));
      k.minima.forEach(add("minimum"));
    }
    for (let i = 0; i < plot.length; i++)
      for (let j = i + 1; j < plot.length; j++)
        for (const p of findIntersections(plot[i].graph.curve, plot[j].graph.curve, xMin, xMax))
          out.push({ ...p, kind: "intersection", fnId: plot[i].id, otherId: plot[j].id, color: plot[i].color });
    return out.filter((p) => p.y >= deferredView.yMin - 1e-9 && p.y <= deferredView.yMax + 1e-9);
  }, [plot, deferredView]);

  const tableStep = step || niceStep(deferredView.xMax - deferredView.xMin, 16);
  const rows = useMemo(
    () => (activeFn ? valueTable(activeFn.graph.curve, deferredView.xMin, deferredView.xMax, tableStep, 200) : []),
    [activeFn, deferredView, tableStep],
  );

  const onView = useCallback((v: GraphView) => setView(v), []);
  const resetView = () => (dim === "2d" ? setView(DEFAULT_VIEW) : setView3dKey((k) => k + 1));

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === wrap.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  function toggleFull() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrap.current?.requestFullscreen?.();
  }

  function update(id: number, patch: Partial<FnEntry>) {
    setFns((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function addFn(expr = "") {
    if (fns.length >= MAX_FUNCTIONS) return;
    const used = new Set(fns.map((f) => f.slot));
    const slot = [0, 1, 2, 3].find((s) => !used.has(s)) ?? 0;
    const id = nextId.current++;
    setFns((list) => [...list, { id, expr, visible: true, slot }]);
    setActiveId(id);
  }
  function removeFn(id: number) {
    const rest = fns.filter((f) => f.id !== id);
    if (!rest.length) {
      setFns([{ id, expr: "", visible: true, slot: 0 }]);
      return;
    }
    setFns(rest);
    if (activeId === id) setActiveId(rest[0].id);
  }
  function applyExample(expr: string) {
    update(activeId, { expr, visible: true });
    if (expr.startsWith("z")) setDim("3d");
  }

  function errorText(g: GraphCompileResult | undefined) {
    if (!g || g.ok) return null;
    if (g.error === "unknown-symbol") return t("errors.unknownSymbol", { symbol: g.symbol ?? "?" });
    return t(`errors.${g.error}`);
  }

  const kindLabel: Record<KeyPointKind, string> = {
    root: t("kinds.root"),
    yIntercept: t("kinds.yIntercept"),
    maximum: t("kinds.maximum"),
    minimum: t("kinds.minimum"),
    intersection: t("kinds.intersection"),
  };
  const nearestRow = rows.length ? rows.reduce((b, r) => (Math.abs(r.x - traceX) < Math.abs(b.x - traceX) ? r : b)) : null;
  const hasSurface = plot.some((p) => p.graph.kind === "surface");
  const range3d = Math.max(1, Math.min(50, (view.xMax - view.xMin) / 2));
  const activeLabel = activeFn ? (fns.find((f) => f.id === activeFn.id)?.expr ?? "") : "";

  return (
    <div
      ref={wrap}
      className={`flex flex-col gap-3 p-3 sm:p-4 ${full ? "h-screen overflow-auto bg-white calcdark:bg-zinc-900" : ""}`}
      data-testid="graph-mode"
    >
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-lg border border-zinc-300 p-0.5 calcdark:border-zinc-600">
          {(["2d", "3d"] as const).map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={dim === d}
              onClick={() => setDim(d)}
              data-testid={`graph-mode-${d}`}
              className={`rounded-md px-3 py-1 text-xs font-bold ${dim === d ? "bg-blue-600 text-white calcdark:bg-blue-500" : "text-zinc-600 hover:text-blue-700 calcdark:text-zinc-300"}`}
            >
              {t(d === "2d" ? "mode2d" : "mode3d")}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-zinc-500 calcdark:text-zinc-400">{t("examples")}</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => applyExample(ex)} className={`${chip} font-mono`} dir="ltr">
            {ex}
          </button>
        ))}
      </div>

      {/* functions */}
      <div className="grid gap-2 sm:grid-cols-2">
        {fns.map((f, i) => {
          const g = compiled.get(f.id);
          const err = errorText(g);
          const color = palette[f.slot];
          const isActive = f.id === activeId;
          return (
            <div key={f.id} className="flex flex-col gap-1">
              <div
                className={`flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5 calcdark:bg-zinc-800 ${
                  err ? "border-red-400 calcdark:border-red-500" : isActive ? "border-blue-500 ring-1 ring-blue-500/40" : "border-zinc-300 calcdark:border-zinc-600"
                }`}
              >
                <button
                  onClick={() => setActiveId(f.id)}
                  title={t("traceThis")}
                  aria-label={t("traceThis")}
                  aria-pressed={isActive}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: color, background: isActive ? color : "transparent" }}
                >
                  <span className={`text-[10px] font-bold ${isActive ? "text-white" : ""}`} style={isActive ? undefined : { color }}>
                    {i + 1}
                  </span>
                </button>
                {!f.expr.includes("=") && (
                  <span className="shrink-0 font-mono text-sm font-semibold" style={{ color }} dir="ltr">
                    {g?.ok && g.kind === "surface" ? "z =" : "y ="}
                  </span>
                )}
                <input
                  type="text"
                  dir="ltr"
                  value={f.expr}
                  onChange={(e) => update(f.id, { expr: e.target.value })}
                  onFocus={() => setActiveId(f.id)}
                  placeholder="x^2"
                  aria-label={t("functionLabel", { n: i + 1 })}
                  data-testid={`graph-input-${i}`}
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 calcdark:text-zinc-100"
                />
                <button
                  onClick={() => update(f.id, { visible: !f.visible })}
                  aria-label={f.visible ? t("hide") : t("show")}
                  title={f.visible ? t("hide") : t("show")}
                  className={`rounded px-1.5 text-xs font-semibold ${f.visible ? "text-zinc-600 calcdark:text-zinc-300" : "text-zinc-400 line-through"}`}
                >
                  {f.visible ? t("hide") : t("show")}
                </button>
                <button
                  onClick={() => removeFn(f.id)}
                  aria-label={t("remove")}
                  title={t("remove")}
                  className="flex h-6 w-6 items-center justify-center rounded text-base leading-none text-zinc-400 hover:bg-red-50 hover:text-red-600 calcdark:hover:bg-red-950"
                >
                  ×
                </button>
              </div>
              {err && (
                <p className="text-xs text-red-600 calcdark:text-red-400" role="alert" data-testid={`graph-error-${i}`}>
                  {err}
                </p>
              )}
              {!err && g?.ok && g.kind === "surface" && dim === "2d" && (
                <p className="text-xs text-amber-700 calcdark:text-amber-400">{t("surfaceSlice")}</p>
              )}
            </div>
          );
        })}
        {fns.length < MAX_FUNCTIONS && (
          <button
            onClick={() => addFn()}
            className={`${fns.length % 2 === 0 ? "sm:col-span-2" : ""} flex items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:border-blue-400 hover:bg-blue-50 calcdark:border-zinc-600 calcdark:text-blue-300 calcdark:hover:bg-zinc-800`}
          >
            + {t("add")} <span className="text-xs font-normal text-zinc-500">({fns.length}/{MAX_FUNCTIONS})</span>
          </button>
        )}
      </div>

      {/* options */}
      <div className="flex flex-wrap items-center gap-2">
        {dim === "2d" ? (
          <>
            <button onClick={() => setShowDerivative((v) => !v)} aria-pressed={showDerivative} className={`${chip} ${showDerivative ? chipOn : ""}`}>
              {t("derivative")}
            </button>
            <button onClick={() => setShowPoints((v) => !v)} aria-pressed={showPoints} className={`${chip} ${showPoints ? chipOn : ""}`}>
              {t("keyPoints")}
            </button>
            <span className="text-xs text-zinc-500 calcdark:text-zinc-400">{t("hint2d")}</span>
          </>
        ) : (
          <>
            <button onClick={() => setWireframe((v) => !v)} aria-pressed={wireframe} className={`${chip} ${wireframe ? chipOn : ""}`}>
              {t("wireframe")}
            </button>
            <button onClick={() => setAutoRotate((v) => !v)} aria-pressed={autoRotate} className={`${chip} ${autoRotate ? chipOn : ""}`} data-testid="graph-autorotate">
              {t("autoRotate")}
            </button>
            <span className="text-xs text-zinc-500 calcdark:text-zinc-400">{hasSurface ? t("hint3d") : t("ribbonNote")}</span>
          </>
        )}
      </div>

      {/* graph + side panel */}
      <div className={`flex flex-col gap-3 lg:flex-row ${full ? "min-h-0 flex-1" : ""}`}>
        <div
          className={`relative min-w-0 flex-1 overflow-hidden rounded-xl border border-zinc-300 bg-white calcdark:border-zinc-700 calcdark:bg-zinc-900 ${
            full ? "min-h-[360px]" : "h-[340px] sm:h-[440px]"
          }`}
        >
          {dim === "2d" ? (
            <Graph2D
              fns={plot}
              view={view}
              onView={onView}
              traceX={traceX}
              onTrace={setTraceX}
              showDerivative={showDerivative}
              points={showPoints ? points : []}
              dark={calcDark}
              ariaLabel={t("chartLabel", { formula: activeLabel })}
              labels={{ slope: t("slope"), tangent: t("tangent") }}
            />
          ) : (
            <Graph3D key={view3dKey} fns={plot} range={range3d} dark={calcDark} wireframe={wireframe} autoRotate={autoRotate} />
          )}

          {!plot.length && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-medium text-zinc-500 calcdark:text-zinc-400">
              {t("nothingToPlot")}
            </div>
          )}

          {dim === "3d" && hasSurface && (
            <div className="pointer-events-none absolute bottom-2 left-2 w-40 rounded-lg border border-zinc-300 bg-white/95 px-2 py-1 text-[10px] text-zinc-600 calcdark:border-zinc-600 calcdark:bg-zinc-800/95 calcdark:text-zinc-300">
              <div className="mb-0.5 font-semibold">{t("heightLegend")}</div>
              <div className="h-2 rounded" style={{ background: HEIGHT_GRADIENT_CSS }} />
              <div className="flex justify-between font-mono" dir="ltr">
                <span>{t("low")}</span>
                <span>{t("high")}</span>
              </div>
            </div>
          )}

          <div className="absolute right-2 top-2 flex gap-1" dir="ltr">
            {dim === "2d" && (
              <>
                <button className={iconBtn} onClick={() => setView((v) => zoomView(v, 1 / 1.4))} aria-label={t("zoomIn")} title={t("zoomIn")}>
                  +
                </button>
                <button className={iconBtn} onClick={() => setView((v) => zoomView(v, 1.4))} aria-label={t("zoomOut")} title={t("zoomOut")}>
                  −
                </button>
              </>
            )}
            <button className={iconBtn} onClick={resetView} aria-label={t("resetView")} title={t("resetView")}>
              ⟲
            </button>
            <button className={iconBtn} onClick={toggleFull} aria-label={full ? t("exitFullscreen") : t("fullscreen")} title={full ? t("exitFullscreen") : t("fullscreen")}>
              {full ? "⤡" : "⤢"}
            </button>
          </div>
        </div>

        {/* side panel: table of values / key points */}
        <div
          className={`flex flex-col overflow-hidden rounded-xl border border-zinc-300 bg-white calcdark:border-zinc-700 calcdark:bg-zinc-900 lg:w-72 ${
            full ? "max-h-full" : "h-[300px] lg:h-[440px]"
          }`}
        >
          <div className="flex border-b border-zinc-300 calcdark:border-zinc-700">
            {(["table", "points"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={`flex-1 px-3 py-2 text-xs font-bold ${
                  panel === p ? "border-b-2 border-blue-600 text-blue-700 calcdark:border-blue-400 calcdark:text-blue-300" : "text-zinc-500 calcdark:text-zinc-400"
                }`}
              >
                {p === "table" ? t("table") : `${t("keyPoints")} (${points.length})`}
              </button>
            ))}
          </div>

          {panel === "table" ? (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 text-xs calcdark:border-zinc-700">
                {activeFn && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: activeFn.color }} />}
                <span className="min-w-0 flex-1 truncate font-mono text-zinc-600 calcdark:text-zinc-300" dir="ltr">
                  {activeFn?.graph.kind === "surface" ? `z = f(x, 0)` : activeLabel}
                </span>
                <label className="flex items-center gap-1 text-zinc-500 calcdark:text-zinc-400">
                  {t("step")}
                  <select
                    value={step}
                    onChange={(e) => setStep(Number(e.target.value))}
                    className="rounded border border-zinc-300 bg-white px-1 py-0.5 text-xs text-zinc-800 calcdark:border-zinc-600 calcdark:bg-zinc-800 calcdark:text-zinc-100"
                    data-testid="graph-step"
                  >
                    {STEPS.map((s) => (
                      <option key={s} value={s}>
                        {s === 0 ? `${t("auto")} (${fmt(tableStep)})` : s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="min-h-0 flex-1 overflow-auto" dir="ltr">
                <table className="w-full border-collapse font-mono text-xs" data-testid="graph-table">
                  <thead className="sticky top-0 bg-zinc-100 text-zinc-700 calcdark:bg-zinc-800 calcdark:text-zinc-200">
                    <tr>
                      <th className="border-b border-zinc-300 px-2 py-1 text-right calcdark:border-zinc-600">x</th>
                      <th className="border-b border-l border-zinc-300 px-2 py-1 text-right calcdark:border-zinc-600">f(x)</th>
                      <th className="border-b border-l border-zinc-300 px-2 py-1 text-right calcdark:border-zinc-600">f′(x)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.x}
                        onClick={() => setTraceX(r.x)}
                        className={`cursor-pointer ${
                          r === nearestRow ? "bg-blue-50 calcdark:bg-blue-950/60" : "even:bg-zinc-50 hover:bg-zinc-100 calcdark:even:bg-zinc-800/40 calcdark:hover:bg-zinc-800"
                        }`}
                      >
                        <td className="px-2 py-0.5 text-right text-zinc-700 calcdark:text-zinc-300">{fmt(r.x)}</td>
                        <td className="border-l border-zinc-200 px-2 py-0.5 text-right text-zinc-900 calcdark:border-zinc-700 calcdark:text-zinc-100">{fmt(r.y)}</td>
                        <td className="border-l border-zinc-200 px-2 py-0.5 text-right text-zinc-600 calcdark:border-zinc-700 calcdark:text-zinc-400">{fmt(r.dy)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!rows.length && <p className="p-4 text-center text-xs text-zinc-500">{t("nothingToPlot")}</p>}
              </div>
            </>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-zinc-200 overflow-auto text-xs calcdark:divide-zinc-700" data-testid="graph-points">
              {points.map((p, i) => (
                <li key={i}>
                  <button onClick={() => setTraceX(p.x)} className="flex w-full items-center gap-2 px-3 py-1.5 text-start hover:bg-zinc-50 calcdark:hover:bg-zinc-800">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                    {p.otherId !== undefined && (
                      <span className="-ms-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: plot.find((f) => f.id === p.otherId)?.color }} />
                    )}
                    <span className="flex-1 font-semibold text-zinc-700 calcdark:text-zinc-200">{kindLabel[p.kind]}</span>
                    <span className="font-mono text-zinc-600 calcdark:text-zinc-300" dir="ltr">
                      ({fmt(p.x, 3)}, {fmt(p.y, 3)})
                    </span>
                  </button>
                </li>
              ))}
              {!points.length && <li className="p-4 text-center text-zinc-500">{t("noKeyPoints")}</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
