"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Coordinates, Line, Mafs, MovablePoint, Polygon, Text } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmLive, useMmmModel } from "./MmmLiveContext";

const LIGHT = { point: "#2563eb", mode: "#d97706", outlier: "#dc2626", mean: "#1d4ed8", median: "#059669", range: "#7c3aed" };
const DARK = { point: "#60a5fa", mode: "#fbbf24", outlier: "#f87171", mean: "#93c5fd", median: "#34d399", range: "#a78bfa" };

function niceStep(span: number): number {
  const raw = span / 8;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

function computeView(min: number, max: number): [number, number] {
  const span = Math.max(max - min, 4);
  const step = niceStep(span * 1.6);
  return [Math.floor((min - span * 0.3) / step) * step, Math.ceil((max + span * 0.3) / step) * step];
}

/**
 * The page's "wow" piece (§36): every data value is a draggable point on a number line (repeats
 * stack upward, so the mode is the tallest column). Dragging rewrites that value in the inputs
 * above, so the mean fulcrum, the median line, the Result card, the 3D stacks and every other
 * indicator move live. The view freezes while a drag is in progress so the line never re-zooms
 * under the cursor.
 */
export default function MmmDragLab() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.drag");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const c = useIsDarkMode() ? DARK : LIGHT;
  const { dims, setDim } = useMmmLive();
  const { values, draftIndex, a, f } = useMmmModel();
  const [frozen, setFrozen] = useState<[number, number] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (!a) return null;

  const view = frozen ?? computeView(a.min, a.max);
  const [vx0, vx1] = view;
  const vSpan = vx1 - vx0;
  const step = niceStep(vSpan);
  const snapTo = vSpan > 40 ? 1 : 0.5;
  const top = Math.max(4, a.maxFrequency + 1.6);
  const modeSet = new Set(a.modes);
  const outSet = new Set(a.outliers);

  const seen = new Map<number, number>();
  const levels = values.map((v) => {
    const k = seen.get(v) ?? 0;
    seen.set(v, k + 1);
    return k;
  });

  function move(i: number, x: number) {
    if (!frozen) setFrozen(view);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFrozen(null), 900);
    const next = [...dims.values];
    next[draftIndex[i]] = String(x);
    setDim("values", next);
  }

  const d = vSpan * 0.022;
  const lim = (x: number) => Math.max(vx0 + vSpan * 0.03, Math.min(vx1 - vSpan * 0.03, Math.round(x / snapTo) * snapTo));
  const near = Math.abs(a.mean - a.median) < vSpan * 0.12;
  // Range label: the spot on the range bar farthest from the mean's fulcrum, so the triangle never covers it.
  const mid = (a.min + a.max) / 2;
  const rangeX = [mid, mid - a.range * 0.3, mid + a.range * 0.3].reduce((b, x) => (Math.abs(x - a.mean) > Math.abs(b - a.mean) ? x : b));

  const plane = (
    <div className="w-full lg:w-[380px]">
      <div dir="ltr" aria-label={t("aria")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [vx0, vx1], y: [-1.9, top] }} height={280} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: step, labels: (x) => f(x) }} yAxis={false} />
          <Line.Segment point1={[a.min, -0.45]} point2={[a.max, -0.45]} color={c.range} weight={3} />
          <Text x={rangeX} y={-0.8} size={12} color={c.range}>
            {`${tr("range")} = ${f(a.range)}`}
          </Text>
          <Line.Segment point1={[a.median, 0]} point2={[a.median, top - 0.9]} color={c.median} style="dashed" weight={2} />
          <Text x={a.median} y={top - 0.55} size={12} color={c.median}>
            {`${tr("median")} ${f(a.median)}`}
          </Text>
          <Polygon points={[[a.mean, -0.08], [a.mean - d, -1.2], [a.mean + d, -1.2]]} color={c.mean} fillOpacity={0.85} />
          <Text x={a.mean} y={near ? -1.55 : top - 0.55} size={12} color={c.mean}>
            {`x̄ ${f(a.mean)}`}
          </Text>
          {values.map((v, i) => (
            <MovablePoint
              key={i}
              point={[v, levels[i] + 0.5]}
              color={outSet.has(v) ? c.outlier : modeSet.has(v) ? c.mode : c.point}
              constrain={([x]) => [lim(x), levels[i] + 0.5]}
              onMove={([x]) => move(i, x)}
            />
          ))}
        </Mafs>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={plane}
      rows={[
        { label: t("data"), value: `{${a.sorted.map((v) => f(v)).join(", ")}}` },
        { label: tr("mean"), value: `${f(a.sum)} / ${a.n} = ${f(a.mean)}` },
        { label: tr("median"), value: f(a.median) },
        { label: tr("mode"), value: a.modes.length ? a.modes.map((m) => f(m)).join(", ") : tr("noMode") },
        { label: tr("range"), value: `${f(a.max)} − ${f(a.min)} = ${f(a.range)}` },
        { label: t("gap"), value: f(a.mean - a.median), emphasize: true },
      ]}
    />
  );
}
