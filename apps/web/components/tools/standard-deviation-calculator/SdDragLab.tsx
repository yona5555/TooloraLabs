"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Coordinates, Line, Mafs, MovablePoint, Polygon, Text } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SdIndicatorCard from "./SdIndicatorCard";
import { bandOf, replaceValue, useSdLive, useSdModel } from "./SdLiveContext";

const LIGHT = { bands: ["#059669", "#d97706", "#ea580c", "#dc2626"], mean: "#1d4ed8", sigma: "#7c3aed", band: "#10b981" };
const DARK = { bands: ["#34d399", "#fbbf24", "#fb923c", "#f87171"], mean: "#93c5fd", sigma: "#c4b5fd", band: "#34d399" };

function niceStep(span: number): number {
  const raw = span / 6;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

type View = { x: [number, number]; y: [number, number]; row: number };

function computeView(min: number, max: number, sigma: number, maxDev: number, maxLevel: number): View {
  const span = Math.max(max - min, 2 * sigma, Math.abs(max) * 0.01, 1e-6);
  const row = span * 0.07;
  return {
    x: [min - span * 0.2, max + span * 0.2],
    y: [-(maxLevel + 1.6) * row, Math.max(maxDev, sigma) * 1.12 + row],
    row,
  };
}

/**
 * The page's "wow" piece: every value is a draggable point under the axis, and its squared
 * deviation stands above the axis as a real square between the value and the mean. The dashed
 * violet square has side σ — its area is the average of all the coloured squares (σ²). Dragging
 * rewrites that value in the input, so the Result card, the 3D bell and every indicator move live.
 * The view freezes during a drag so the plane never re-zooms under the cursor.
 */
export default function SdDragLab() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.drag");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const c = useIsDarkMode() ? DARK : LIGHT;
  const { setDim } = useSdLive();
  const { values, a, f } = useSdModel();
  const [frozen, setFrozen] = useState<View | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (!a) return null;

  const seen = new Map<number, number>();
  const levels = values.map((v) => {
    const k = seen.get(v) ?? 0;
    seen.set(v, k + 1);
    return k;
  });
  const maxLevel = Math.max(...levels);
  const sigma = a.populationStdDev;
  const maxDev = Math.max(...a.points.map((p) => Math.abs(p.deviation)));
  const view = frozen ?? computeView(a.min, a.max, sigma, maxDev, maxLevel);
  const [vx0, vx1] = view.x;
  const vSpan = vx1 - vx0;
  const step = niceStep(vSpan);
  const snapTo = 10 ** (Math.floor(Math.log10(Math.max(vSpan, 1e-9))) - 2);
  const yOf = (i: number) => -(levels[i] + 0.8) * view.row;

  function move(i: number, x: number) {
    if (!frozen) setFrozen(view);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFrozen(null), 900);
    setDim("rawData", replaceValue(values, i, x));
  }

  const lim = (x: number) => Math.max(vx0 + vSpan * 0.02, Math.min(vx1 - vSpan * 0.02, Math.round(x / snapTo) * snapTo));
  const yTop = view.y[1];

  const plane = (
    <div className="w-full lg:w-[400px]">
      <div dir="ltr" aria-label={t("aria")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: view.x, y: view.y, padding: 0 }} height={300} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: step, labels: (x) => f(x) }} yAxis={false} />
          {sigma > 0 && (
            <Polygon
              points={[
                [a.mean - sigma, view.y[0]],
                [a.mean + sigma, view.y[0]],
                [a.mean + sigma, yTop],
                [a.mean - sigma, yTop],
              ]}
              color={c.band}
              fillOpacity={0.07}
              strokeOpacity={0.35}
              strokeStyle="dashed"
            />
          )}
          {a.points.map((p) => {
            const d = Math.abs(p.deviation);
            if (d < 1e-12) return null;
            const x0 = Math.min(p.value, a.mean);
            return (
              <Polygon
                key={`sq${p.index}`}
                points={[
                  [x0, 0],
                  [x0 + d, 0],
                  [x0 + d, d],
                  [x0, d],
                ]}
                color={c.bands[bandOf(p.z)]}
                fillOpacity={0.1}
                weight={1.5}
              />
            );
          })}
          {sigma > 0 && (
            <Polygon
              points={[
                [a.mean, 0],
                [a.mean + sigma, 0],
                [a.mean + sigma, sigma],
                [a.mean, sigma],
              ]}
              color={c.sigma}
              fillOpacity={0}
              weight={2.5}
              strokeStyle="dashed"
            />
          )}
          {sigma > 0 && (
            <Text x={a.mean + sigma / 2} y={sigma + view.row * 0.6} size={12} color={c.sigma}>
              {`σ² = ${f(a.populationVariance)}`}
            </Text>
          )}
          <Line.Segment point1={[a.mean, view.y[0]]} point2={[a.mean, yTop]} color={c.mean} weight={2} />
          <Text x={a.mean} y={yTop - view.row * 0.5} size={12} color={c.mean}>
            {`μ ${f(a.mean)}`}
          </Text>
          {values.map((v, i) => (
            <MovablePoint
              key={i}
              point={[v, yOf(i)]}
              color={c.bands[bandOf(a.points[i].z)]}
              constrain={([x]) => [lim(x), yOf(i)]}
              onMove={([x]) => move(i, x)}
            />
          ))}
        </Mafs>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={plane}
      rows={[
        { label: tl("ss"), value: `Σ(x − μ)² = ${f(a.sumSquares)}` },
        { label: t("avgSquare"), value: `${f(a.sumSquares)} / ${a.n} = ${f(a.populationVariance)}` },
        { label: t("side"), value: `σ = √${f(a.populationVariance)} = ${f(a.populationStdDev)}`, emphasize: true },
        { label: t("biggest"), value: `${f(a.farthest.value)} → ${f(a.farthest.squaredDeviation)}`, note: t("share", { share: `${f(a.farthest.shareOfSS * 100, 1)}%` }) },
        { label: tl("band", { k: 1 }), value: `${a.bands[0].inside}/${a.n}` },
      ]}
    />
  );
}
