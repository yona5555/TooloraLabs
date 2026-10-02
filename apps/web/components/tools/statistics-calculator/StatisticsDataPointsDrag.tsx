"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { StatisticsCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { parseDataSet } from "./types";
import { useStatisticsLive } from "./StatisticsLiveContext";

type Vector2 = [number, number];

const tool = new StatisticsCalculator();
const MAX_POINTS = 8;
const ROW = 0;
const LIGHT = { blue: "#2563eb", emerald: "#059669", rose: "#e11d48" };
const DARK = { blue: "#60a5fa", emerald: "#34d399", rose: "#fb7185" };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** One draggable point, bound by index to the real dataset — a thin wrapper around useMovablePoint plus the bidirectional-sync effects every live-state point in this rollout needs, called the same fixed number of times every render (MAX_POINTS) regardless of the dataset's own current length. */
function useSyncedPoint(initialValue: number, color: string, onDragCommit: (value: number) => void) {
  const point = useMovablePoint([initialValue, ROW] as Vector2, { color, constrain: (p) => [p[0], ROW] });
  const last = useRef(initialValue);
  const suppress = useRef(false);

  useEffect(() => {
    if (Math.abs(initialValue - last.current) > 0.01) {
      suppress.current = true;
      point.setPoint([initialValue, ROW]);
      last.current = initialValue;
    }
  }, [initialValue, point]);

  useEffect(() => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    if (Math.abs(point.point[0] - last.current) > 0.01) {
      last.current = point.point[0];
      onDragCommit(round2(point.point[0]));
    }
  }, [point, onDragCommit]);

  return point;
}

/**
 * The hero indicator (§36): up to eight real draggable points, one per value in the live dataset
 * actually typed above the fold. Dragging a point rewrites that exact entry in the real raw data
 * field; editing the field moves the matching point. Datasets beyond eight values still count
 * fully toward every live statistic shown, just aren't individually draggable past the eighth.
 */
export default function StatisticsDataPointsDrag() {
  const t = useTranslations("tools.statistics-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useStatisticsLive();
  const values = parseDataSet(dims.rawData);

  function commitIndex(index: number, newValue: number) {
    const next = [...values];
    while (next.length <= index) next.push(newValue);
    next[index] = newValue;
    setDim("rawData", next.map((v) => `${v}`).join(", "));
  }

  const fallback = values.length > 0 ? values[values.length - 1] : 0;
  const p0 = useSyncedPoint(values[0] ?? fallback, colors.blue, (v) => commitIndex(0, v));
  const p1 = useSyncedPoint(values[1] ?? fallback, colors.blue, (v) => commitIndex(1, v));
  const p2 = useSyncedPoint(values[2] ?? fallback, colors.blue, (v) => commitIndex(2, v));
  const p3 = useSyncedPoint(values[3] ?? fallback, colors.blue, (v) => commitIndex(3, v));
  const p4 = useSyncedPoint(values[4] ?? fallback, colors.blue, (v) => commitIndex(4, v));
  const p5 = useSyncedPoint(values[5] ?? fallback, colors.blue, (v) => commitIndex(5, v));
  const p6 = useSyncedPoint(values[6] ?? fallback, colors.blue, (v) => commitIndex(6, v));
  const p7 = useSyncedPoint(values[7] ?? fallback, colors.blue, (v) => commitIndex(7, v));
  const points = [p0, p1, p2, p3, p4, p5, p6, p7];

  const output = tool.execute({ values }, { locale: "en-US" });
  const stats = output.success && !output.data.error ? output.data : null;
  const min = values.length > 0 ? Math.min(...values) : -1;
  const max = values.length > 0 ? Math.max(...values) : 11;
  const pad = Math.max(1, (max - min) * 0.2);

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("countLabel")}: ${values.length}`}</span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("meanLabel")}: ${stats ? round2(stats.mean) : "—"}`}</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{`${t("medianLabel")}: ${stats ? round2(stats.median) : "—"}`}</span>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{`${t("stdDevLabel")}: ${stats ? round2(stats.populationStdDev) : "—"}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [min - pad, max + pad], y: [-1.2, 1.2] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: Math.max(1, Math.round((max - min) / 8)) }} yAxis={{ lines: false, labels: false }} />
          {stats && (
            <Text x={stats.mean} y={0.8} size={10} color={colors.blue}>
              {t("meanMarker")}
            </Text>
          )}
          {points.map((p, i) => (i < values.length ? <g key={i}>{p.element}</g> : null))}
        </Mafs>
      </div>

      {values.length > MAX_POINTS && <p className="mt-1 text-center text-xs text-amber-600 dark:text-amber-400">{t("overflowNote", { count: values.length - MAX_POINTS })}</p>}
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
