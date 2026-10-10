"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { derivativeAt, secondDerivativeAt } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useGraphLive } from "./GraphLiveContext";
import type { GraphSceneMode } from "./GraphScene3D";
import { fmtNum } from "./types";

const GraphScene3D = dynamic(() => import("./GraphScene3D"), { ssr: false, loading: () => null });

const SAMPLE_ROWS = 7;

/**
 * Graph live table + drawing (site rule: table left, drawing right). The drawing switches between
 * a flat 2D plot and a 3D surface z = f(x)·cos(t); both carry the tracing point and its tangent.
 * Reads the shared live study, so it follows the input on every keystroke in the Result card and
 * in the encyclopedia.
 */
export default function GraphLive3D() {
  const t = useTranslations("tools.graphing-calculator.live3d");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const tc = useTranslations("common.live3d");
  const { expression, xMin, xMax, f, analysis: a, traceX, setTraceX } = useGraphLive();
  const [mode, setMode] = useState<GraphSceneMode>("plot");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTraceX((prev) => {
        const next = prev + ((xMax - xMin) / 6) * dt;
        return next >= xMax ? xMin : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, xMin, xMax, setTraceX]);

  const ty = f(traceX);
  const d1 = derivativeAt(f, traceX);
  const d2 = secondDerivativeAt(f, traceX);
  const fmt = (n: number) => fmtNum(n);
  const list = (xs: number[]) => (xs.length ? xs.slice(0, 4).map(fmt).join(", ") + (xs.length > 4 ? "…" : "") : tv("none"));
  const symmetryLabel = tv(a.symmetry);

  const groups: LiveTableGroup[] = [
    {
      title: t("groupFunction"),
      rows: [
        { label: "f(x)", formula: expression, value: t("compiled") },
        { label: t("window"), formula: `x ∈ [${fmt(xMin)}, ${fmt(xMax)}]`, value: fmt(xMax - xMin), unit: t("wide") },
        { label: t("yRange"), formula: `[min f, max f]`, value: a.yMin !== null && a.yMax !== null ? `[${fmt(a.yMin)}, ${fmt(a.yMax)}]` : "—" },
        { label: t("defined"), formula: `${Math.round(a.definedRatio * a.samples)} / ${a.samples}`, value: fmtNum(a.definedRatio * 100, 1), unit: "%" },
        { label: t("breaks"), formula: t("breaksFormula"), value: String(a.breakCount) },
      ],
    },
    {
      title: t("groupValues"),
      rows: Array.from({ length: SAMPLE_ROWS }, (_, i) => {
        const x = xMin + (i / (SAMPLE_ROWS - 1)) * (xMax - xMin);
        const y = f(x);
        return { label: `x = ${fmt(x)}`, formula: `f(${fmt(x)})`, value: y === null ? tv("undefined") : fmt(y) };
      }),
    },
    {
      title: t("groupKeyPoints"),
      rows: [
        { label: tv("kinds.root"), formula: `f(x) = 0`, value: list(a.roots), emphasize: a.roots.length > 0 },
        { label: tv("kinds.y-intercept"), formula: `f(0)`, value: a.yIntercept === null ? tv("none") : fmt(a.yIntercept) },
        { label: tv("kinds.maximum"), formula: `f′ = 0, f″ < 0`, value: a.maxima.length ? a.maxima.slice(0, 2).map((p) => `(${fmt(p.x)}, ${fmt(p.y)})`).join(" ") : tv("none") },
        { label: tv("kinds.minimum"), formula: `f′ = 0, f″ > 0`, value: a.minima.length ? a.minima.slice(0, 2).map((p) => `(${fmt(p.x)}, ${fmt(p.y)})`).join(" ") : tv("none") },
        { label: tv("kinds.inflection"), formula: `f″ changes sign`, value: a.inflections.length ? list(a.inflections.map((p) => p.x)) : tv("none") },
      ],
    },
    {
      title: t("groupTrace"),
      rows: [
        { label: t("traceY"), formula: `f(${fmt(traceX)})`, value: ty === null ? tv("undefined") : fmt(ty), emphasize: true },
        { label: t("slope"), formula: `[f(x+h) − f(x−h)] / 2h`, value: d1 === null ? "—" : fmt(d1) },
        { label: t("curvature"), formula: `[f(x+h) − 2f(x) + f(x−h)] / h²`, value: d2 === null ? "—" : fmtNum(d2, 3) },
        {
          label: t("tangent"),
          formula: `y = f′·(x − ${fmt(traceX)}) + f`,
          value: d1 === null || ty === null ? "—" : `y = ${fmt(d1)}x ${ty - d1 * traceX < 0 ? "−" : "+"} ${fmt(Math.abs(ty - d1 * traceX))}`,
        },
      ],
    },
    {
      title: t("groupWhole"),
      rows: [
        { label: t("area"), formula: `∫ f dx (${fmt(xMin)} → ${fmt(xMax)})`, value: fmt(a.signedArea), emphasize: true },
        { label: t("absArea"), formula: `${fmt(a.positiveArea)} + ${fmt(a.negativeArea)}`, value: fmt(a.positiveArea + a.negativeArea) },
        { label: t("average"), formula: `∫ f dx / ${fmt(xMax - xMin)}`, value: fmt(a.averageValue) },
        { label: t("arcLength"), formula: `Σ √(Δx² + Δy²)`, value: fmt(a.arcLength) },
        { label: t("symmetry"), formula: a.symmetry === "even" ? "f(−x) = f(x)" : a.symmetry === "odd" ? "f(−x) = −f(x)" : "f(−x) ≠ ±f(x)", value: symmetryLabel },
      ],
    },
  ];

  const btn = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    }`;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" className="flex gap-1">
          <button type="button" aria-pressed={mode === "plot"} className={btn(mode === "plot")} onClick={() => setMode("plot")}>
            {t("modePlot")}
          </button>
          <button type="button" aria-pressed={mode === "surface"} className={btn(mode === "surface")} onClick={() => setMode("surface")}>
            {t("modeSurface")}
          </button>
        </div>
        <button type="button" aria-pressed={playing} className={btn(playing)} onClick={() => setPlaying((v) => !v)}>
          {playing ? t("pause") : t("play")}
        </button>
        <label className="flex min-w-[160px] flex-1 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="whitespace-nowrap">{t("traceX")}</span>
          <input
            type="range"
            dir="ltr"
            min={xMin}
            max={xMax}
            step={(xMax - xMin) / 400}
            value={traceX}
            onChange={(e) => {
              setPlaying(false);
              setTraceX(Number(e.target.value));
            }}
            className="w-full accent-blue-600"
          />
          <span dir="ltr" className="w-14 text-end font-mono font-semibold text-zinc-700 dark:text-zinc-200">
            {fmt(traceX)}
          </span>
        </label>
      </div>
      <LiveTable3DLayout
        className="flex-1"
        groups={groups}
        headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
        hint={mode === "surface" ? t("surfaceHint") : tc("hint")}
        drawing={
          <Scene3D key={mode} camera={mode === "plot" ? [0, 0, 9.2] : [5.2, 4.2, 7.2]}>
            <GraphScene3D
              f={f}
              xMin={xMin}
              xMax={xMax}
              yLo={a.viewYMin}
              yHi={a.viewYMax}
              mode={mode}
              traceX={traceX}
              slope={d1}
              keyPoints={a.keyPoints}
              fmt={(n) => fmtNum(n, 2)}
            />
          </Scene3D>
        }
      />
    </div>
  );
}
